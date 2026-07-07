"use server";

import type { IAdPublic } from "@uscg/shared/types";
import { getSession } from "@/utils/session";

const API_BASE = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/**
 * Fetch ad with seller contact info (requires authentication)
 * This is a server action that can access httpOnly cookies
 */
export async function getAdWithContactAction(adId: string): Promise<IAdPublic | null> {
  const session = await getSession();
  const accessToken = session.get("accessToken");

  if (!accessToken) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE}/api/ads/detail/${adId}/contact`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}
