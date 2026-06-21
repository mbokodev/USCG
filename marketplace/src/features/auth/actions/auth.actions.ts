"use server";

import type { ILoginDto, IRegisterDto, IAuthUser } from "@uscg/shared/types";
import authService from "../services/auth.service";
import { getSession } from "@/utils/session";

export interface AuthActionResult {
  success: boolean;
  user?: IAuthUser;
  message?: string;
  error?: string;
}

export async function loginAction(credentials: ILoginDto): Promise<AuthActionResult> {
  const response = await authService.login(credentials);

  if (response.success && response.data) {
    const session = await getSession();
    const cookieDomain = process.env.COOKIE_DOMAIN || undefined;

    // accessToken: httpOnly (XSS impossible)
    session.set("accessToken", response.data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: response.data.expiresIn,
      path: "/",
      sameSite: "lax",
      domain: cookieDomain,
    });

    // refreshToken: httpOnly (XSS impossible)
    session.set("refreshToken", response.data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: "/",
      sameSite: "lax",
      domain: cookieDomain,
    });

    // Stocker les infos user pour le middleware
    session.set("user", JSON.stringify(response.data.user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
      sameSite: "lax",
      domain: cookieDomain,
    });

    return {
      success: true,
      user: response.data.user,
    };
  }

  return {
    success: false,
    error: response.error,
  };
}

export async function registerAction(data: IRegisterDto): Promise<AuthActionResult> {
  const response = await authService.register(data);

  if (response.success && response.data) {
    return {
      success: true,
      message: response.data.message,
    };
  }

  return {
    success: false,
    error: response.error,
  };
}

export async function verifyEmailAction(token: string): Promise<AuthActionResult> {
  const response = await authService.verifyEmail(token);

  if (response.success && response.data) {
    return {
      success: true,
      message: response.data.message,
    };
  }

  return {
    success: false,
    error: response.error,
  };
}

export async function resendVerificationAction(email: string): Promise<AuthActionResult> {
  const response = await authService.resendVerification(email);

  if (response.success && response.data) {
    return {
      success: true,
      message: response.data.message,
    };
  }

  return {
    success: false,
    error: response.error,
  };
}

export async function logoutAction(): Promise<AuthActionResult> {
  const session = await getSession();

  try {
    await authService.logout();
  } catch (error) {
    console.error("Backend logout failed:", error);
  } finally {
    // On supprime TOUJOURS les cookies locaux
    session.delete("accessToken");
    session.delete("refreshToken");
    session.delete("user");
  }

  return { success: true };
}

export async function getCurrentUser(): Promise<IAuthUser | null> {
  const session = await getSession();
  const userJson = session.get("user");

  if (!userJson) {
    return null;
  }

  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
}
