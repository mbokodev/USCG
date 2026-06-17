import { cookies } from "next/headers";

interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  maxAge?: number;
  path?: string;
  sameSite?: "strict" | "lax" | "none";
}

export async function getSession() {
  const cookieStore = await cookies();

  return {
    get: (name: string) => {
      return cookieStore.get(name)?.value;
    },

    set: (name: string, value: string, options: CookieOptions = {}) => {
      cookieStore.set(name, value, {
        httpOnly: options.httpOnly ?? true,
        secure: process.env.NODE_ENV === "production",
        maxAge: options.maxAge,
        path: options.path ?? "/",
        sameSite: options.sameSite ?? "lax",
      });
    },

    delete: (name: string) => {
      cookieStore.delete(name);
    },

    has: (name: string) => {
      return cookieStore.has(name);
    },
  };
}

export async function getAccessToken(): Promise<string | undefined> {
  const session = await getSession();
  return session.get("accessToken");
}

export async function getRefreshToken(): Promise<string | undefined> {
  const session = await getSession();
  return session.get("refreshToken");
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getAccessToken();
  return !!token;
}
