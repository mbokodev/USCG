"use server";

import { LoginRequest } from "@/features/auth";
import authService from "../services/auth.service";
import { getSession } from "@/utils/session";

// Sécurité Niveau 2 : accessToken ET refreshToken en httpOnly
// Le JS client ne peut pas lire les tokens → XSS impossible
// Le backend lit les tokens depuis les cookies, pas le header Authorization

export async function loginAction(credentials: LoginRequest) {
  const response = await authService.login(credentials);

  if (response.success) {
    const session = await getSession();

    // accessToken: httpOnly (XSS impossible)
    session.set("accessToken", response.data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: response.data.expiresIn,
      path: "/",
      sameSite: "lax",
    });

    // refreshToken: httpOnly (XSS impossible)
    session.set("refreshToken", response.data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: "/",
      sameSite: "lax",
    });

    // Stocker les infos user pour le middleware
    session.set("user", JSON.stringify(response.data.user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
      sameSite: "lax",
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

export async function logoutAction() {
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

export async function getCurrentUser() {
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

