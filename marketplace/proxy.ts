import type { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./src/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

export async function proxy(request: NextRequest) {
  // Apply i18n middleware
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)", "/"],
};
