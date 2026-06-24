import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { UserRole } from "@uscg/shared";
import { ROUTES } from "./config/routes";

const intlMiddleware = createIntlMiddleware(routing);

// Routes publiques (pas besoin d'auth)
const publicRoutes = [ROUTES.AUTH.LOGIN];

// Routes accessibles quand mustChangePassword est true
const changePasswordRoutes = [ROUTES.AUTH.CHANGE_PASSWORD];

// Permissions par route
interface RoutePermission {
  requireSeller?: boolean;
  roles?: UserRole[];
}

const routePermissions: Record<string, RoutePermission> = {
  // SELLER routes (isSeller = true)
  "/my-ads": { requireSeller: true },
  "/user/profile": { requireSeller: true },

  // OPERATOR + ADMIN + SUPER_ADMIN routes
  "/ads/pending": { roles: [UserRole.OPERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN] },
  "/ads": { roles: [UserRole.OPERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN] },
  "/seller-requests": { roles: [UserRole.OPERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN] },
  "/users/buyers": { roles: [UserRole.OPERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN] },
  "/customers": { roles: [UserRole.OPERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN] },

  // ADMIN + SUPER_ADMIN routes
  "/staff": { roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
  "/categories": { roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
  "/subcategories": { roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
  "/variants": { roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
  "/banners": { roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
  "/flash-deals": { roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
  "/featured-sections": { roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
  "/static-pages": { roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },

  // SUPER_ADMIN only routes
  "/login-history": { roles: [UserRole.SUPER_ADMIN] },
};

function getRoutePermission(pathname: string): RoutePermission | null {
  if (routePermissions[pathname]) {
    return routePermissions[pathname];
  }

  for (const route of Object.keys(routePermissions)) {
    if (pathname.startsWith(route)) {
      return routePermissions[route];
    }
  }

  return null;
}

function hasAccess(
  permission: RoutePermission,
  role: UserRole,
  isSeller: boolean
): boolean {
  if (permission.requireSeller && !isSeller) {
    return false;
  }
  return !(permission.roles && !permission.roles.includes(role));
}

// Vérifie si le token JWT est expiré (avec buffer de sécurité)
function isTokenExpired(token: string, bufferSeconds = 60): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const exp = payload.exp * 1000; // en ms
    const now = Date.now();
    return now >= exp - bufferSeconds * 1000;
  } catch {
    return true; // Token invalide = considéré expiré
  }
}

// Appelle le backend pour refresh les tokens
// Le backend retourne les tokens dans le body (pas les cookies)
async function refreshTokens(
  request: NextRequest
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number } | null> {
  const refreshToken = request.cookies.get("refreshToken")?.value;
  if (!refreshToken) return null;

  try {
    // Use API_URL for server-side (runtime), fallback to NEXT_PUBLIC_API_URL (build-time)
    const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const res = await fetch(`${apiUrl}/api/auth/refresh`, {
      method: "POST",
      headers: {
        Cookie: `refreshToken=${refreshToken}`,
      },
    });

    if (!res.ok) return null;

    // Sécurité Niveau 2 : tokens dans le body (pas cookies)
    const data = await res.json();
    if (!data.accessToken || !data.refreshToken) return null;

    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn,
    };
  } catch {
    return null;
  }
}

function redirectToLogin(request: NextRequest, pathname: string) {
  const locale = pathname.match(/^\/(fr|en)/)?.[1] || "fr";
  const loginUrl = new URL(`/${locale}${ROUTES.AUTH.LOGIN}`, request.url);
  loginUrl.searchParams.set("callbackUrl", pathname);
  return NextResponse.redirect(loginUrl);
}

function redirectToDashboard(request: NextRequest) {
  const locale = request.nextUrl.pathname.match(/^\/(fr|en)/)?.[1] || "fr";
  return NextResponse.redirect(
    new URL(`/${locale}${ROUTES.DASHBOARD}`, request.url)
  );
}

function redirectToChangePassword(request: NextRequest) {
  const locale = request.nextUrl.pathname.match(/^\/(fr|en)/)?.[1] || "fr";
  return NextResponse.redirect(
    new URL(`/${locale}${ROUTES.AUTH.CHANGE_PASSWORD}`, request.url)
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Appliquer le middleware i18n d'abord
  const response = intlMiddleware(request);

  // Extraire le pathname sans locale
  const pathnameWithoutLocale = pathname.replace(/^\/(fr|en)/, "") || "/";

  // Si c'est une route publique, on laisse passer
  if (publicRoutes.some((route) => pathnameWithoutLocale.startsWith(route))) {
    return response;
  }

  // Récupérer les tokens
  let accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const userCookie = request.cookies.get("user")?.value;

  // Pas de tokens du tout → login
  if (!accessToken && !refreshToken) {
    return redirectToLogin(request, pathname);
  }

  // Token expiré ou absent → tenter refresh
  if (!accessToken || isTokenExpired(accessToken)) {
    const newTokens = await refreshTokens(request);

    if (!newTokens) {
      // Refresh échoué → login
      return redirectToLogin(request, pathname);
    }

    // Sécurité Niveau 2 : httpOnly pour les deux tokens
    // Domain pour partage cookies cross-subdomain en production
    const cookieDomain = process.env.COOKIE_DOMAIN || undefined;

    response.cookies.set("accessToken", newTokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: newTokens.expiresIn,
      path: "/",
      domain: cookieDomain,
    });
    response.cookies.set("refreshToken", newTokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: "/",
      domain: cookieDomain,
    });

    // Utiliser le nouveau token pour les vérifications
    accessToken = newTokens.accessToken;
  }

  // Vérifier les permissions par route
  if (userCookie) {
    try {
      const user = JSON.parse(userCookie);
      const { role, isSeller, mustChangePassword } = user;

      // Si mustChangePassword est true, forcer la redirection vers change-password
      // sauf si on est déjà sur la page change-password
      if (mustChangePassword) {
        const isOnChangePasswordPage = changePasswordRoutes.some(
          (route) => pathnameWithoutLocale.startsWith(route)
        );
        if (!isOnChangePasswordPage) {
          return redirectToChangePassword(request);
        }
        // Si on est sur change-password, laisser passer
        return response;
      }

      // Si on tente d'accéder à change-password sans mustChangePassword,
      // rediriger vers le dashboard (sécurité)
      const isOnChangePasswordPage = changePasswordRoutes.some(
        (route) => pathnameWithoutLocale.startsWith(route)
      );
      if (isOnChangePasswordPage && !mustChangePassword) {
        return redirectToDashboard(request);
      }

      const permission = getRoutePermission(pathnameWithoutLocale);

      if (permission && !hasAccess(permission, role, isSeller)) {
        return redirectToDashboard(request);
      }
    } catch {
      // Cookie invalide, on laisse passer et le client gérera
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)", "/"],
};
