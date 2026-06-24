import api from "@/lib/api";
import type { ITermsPage, IPrivacyPage, IAboutPage, ISellerTermsPage, ISellerPrivacyPage } from "@uscg/shared/types";

/**
 * Fetch Terms page content
 */
export async function getTermsPage(): Promise<ITermsPage> {
  const response = await api.get<ITermsPage>("/static-pages/terms", {
    headers: { "Cache-Control": "no-cache" },
    params: { _t: Date.now() },
  });
  return response.data;
}

/**
 * Fetch Privacy page content
 */
export async function getPrivacyPage(): Promise<IPrivacyPage> {
  const response = await api.get<IPrivacyPage>("/static-pages/privacy", {
    headers: { "Cache-Control": "no-cache" },
    params: { _t: Date.now() },
  });
  return response.data;
}

/**
 * Fetch About page content
 */
export async function getAboutPage(): Promise<IAboutPage> {
  const response = await api.get<IAboutPage>("/static-pages/about", {
    headers: { "Cache-Control": "no-cache" },
    params: { _t: Date.now() },
  });
  return response.data;
}

/**
 * Fetch Seller Terms page content
 */
export async function getSellerTermsPage(): Promise<ISellerTermsPage> {
  const response = await api.get<ISellerTermsPage>("/static-pages/seller-terms", {
    headers: { "Cache-Control": "no-cache" },
    params: { _t: Date.now() },
  });
  return response.data;
}

/**
 * Fetch Seller Privacy page content
 */
export async function getSellerPrivacyPage(): Promise<ISellerPrivacyPage> {
  const response = await api.get<ISellerPrivacyPage>("/static-pages/seller-privacy", {
    headers: { "Cache-Control": "no-cache" },
    params: { _t: Date.now() },
  });
  return response.data;
}

export const staticPagesService = {
  getTermsPage,
  getPrivacyPage,
  getAboutPage,
  getSellerTermsPage,
  getSellerPrivacyPage,
};
