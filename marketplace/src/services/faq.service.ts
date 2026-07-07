import api from "@/lib/api";
import type { IFaqGrouped, IFaqCategory } from "@uscg/shared/types";

/**
 * Fetch all FAQs grouped by category (public)
 */
export async function getFaqGrouped(): Promise<IFaqGrouped[]> {
  const response = await api.get<IFaqGrouped[]>("/faq", {
    headers: { "Cache-Control": "no-cache" },
    params: { _t: Date.now() },
  });
  return response.data;
}

/**
 * Fetch all active FAQ categories (public)
 */
export async function getFaqCategories(): Promise<IFaqCategory[]> {
  const response = await api.get<IFaqCategory[]>("/faq/categories", {
    headers: { "Cache-Control": "no-cache" },
    params: { _t: Date.now() },
  });
  return response.data;
}

/**
 * Fetch FAQs by category slug (public)
 */
export async function getFaqByCategorySlug(slug: string): Promise<IFaqGrouped> {
  const response = await api.get<IFaqGrouped>(`/faq/category/${slug}`, {
    headers: { "Cache-Control": "no-cache" },
    params: { _t: Date.now() },
  });
  return response.data;
}

export const faqService = {
  getFaqGrouped,
  getFaqCategories,
  getFaqByCategorySlug,
};
