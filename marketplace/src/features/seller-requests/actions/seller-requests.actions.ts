"use server";

import type { ISellerRequest, ICreateSellerRequestDto } from "@uscg/shared/types";
import { getAccessToken } from "@/utils/session";

const API_BASE = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface SellerRequestActionResult {
  success: boolean;
  data?: ISellerRequest | null;
  error?: string;
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = await getAccessToken();

  return fetch(`${API_BASE}/api${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
}

export async function getMySellerRequest(): Promise<SellerRequestActionResult> {
  try {
    const response = await fetchWithAuth("/seller-requests/me");

    if (response.status === 404) {
      return { success: true, data: null };
    }

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || "Une erreur est survenue" };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching seller request:", error);
    return { success: false, error: "Une erreur est survenue" };
  }
}

export async function createSellerRequest(dto: ICreateSellerRequestDto): Promise<SellerRequestActionResult> {
  try {
    const response = await fetchWithAuth("/seller-requests", {
      method: "POST",
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const error = await response.json();
      const message = Array.isArray(error.message) ? error.message[0] : error.message;
      return { success: false, error: message || "Une erreur est survenue" };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Error creating seller request:", error);
    return { success: false, error: "Une erreur est survenue" };
  }
}

export async function updateSellerRequest(
  id: string,
  dto: Partial<ICreateSellerRequestDto>
): Promise<SellerRequestActionResult> {
  try {
    const response = await fetchWithAuth(`/seller-requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const error = await response.json();
      const message = Array.isArray(error.message) ? error.message[0] : error.message;
      return { success: false, error: message || "Une erreur est survenue" };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Error updating seller request:", error);
    return { success: false, error: "Une erreur est survenue" };
  }
}
