import api from "@/lib/api";
import type { ICategory } from "@uscg/shared/types";

export interface CategoriesResponse {
  data: ICategory[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Fetch all categories with subcategories
 */
export async function getCategories(): Promise<ICategory[]> {
  const response = await api.get<CategoriesResponse>("/categories", {
    params: {
      isActive: true,
      limit: 100,
    },
  });
  return response.data.data;
}

/**
 * Fetch a single category by slug
 */
export async function getCategoryBySlug(slug: string): Promise<ICategory> {
  const response = await api.get<ICategory>(`/categories/slug/${slug}`);
  return response.data;
}

export const categoriesService = {
  getCategories,
  getCategoryBySlug,
};
