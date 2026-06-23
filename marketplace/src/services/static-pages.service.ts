import api from "@/lib/api";
import type { ITermsPage, IPrivacyPage, IAboutPage } from "@uscg/shared/types";

/**
 * Fetch Terms page content
 */
export async function getTermsPage(): Promise<ITermsPage> {
  const response = await api.get<ITermsPage>("/static-pages/terms");
  return response.data;
}

/**
 * Fetch Privacy page content
 */
export async function getPrivacyPage(): Promise<IPrivacyPage> {
  const response = await api.get<IPrivacyPage>("/static-pages/privacy");
  return response.data;
}

/**
 * Fetch About page content
 */
export async function getAboutPage(): Promise<IAboutPage> {
  const response = await api.get<IAboutPage>("/static-pages/about");
  return response.data;
}

export const staticPagesService = {
  getTermsPage,
  getPrivacyPage,
  getAboutPage,
};
