import api from "@/lib/api";
import type { IAdListItem, IAdPublic, IAdQueryParams } from "@uscg/shared/types";
import Product from "@models/product.model";
import { mapAdToProduct } from "@/utils/ad-utils";

interface AdsResponse {
  data: IAdListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface AdsMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Fetch ads with query parameters
 */
export async function getAds(params: IAdQueryParams = {}): Promise<{
  products: Product[];
  meta: AdsMeta;
}> {
  const response = await api.get<AdsResponse>("/ads", { params });

  return {
    products: response.data.data.map(mapAdToProduct),
    meta: {
      total: response.data.total,
      page: response.data.page,
      limit: response.data.limit,
      totalPages: response.data.totalPages,
    },
  };
}

/**
 * Fetch latest ads (shortcut for homepage)
 */
export async function getLatestAds(limit: number = 12): Promise<Product[]> {
  const { products } = await getAds({
    limit,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  return products;
}

/**
 * Search ads with query string (for autocomplete)
 */
export interface SearchResult {
  id: string;
  title: string;
  price: number;
  category?: {
    name: { fr?: string; en?: string } | string;
  };
}

export async function searchAds(
  query: string,
  categoryId?: string,
  limit: number = 6
): Promise<SearchResult[]> {
  if (!query || query.length < 2) {
    return [];
  }

  const params: IAdQueryParams = {
    search: query,
    limit,
  };

  if (categoryId) {
    params.categoryId = categoryId;
  }

  const response = await api.get<AdsResponse>("/ads", { params });
  return (response.data.data || []).map((ad) => ({
    id: ad.id,
    title: ad.title,
    price: ad.price,
    category: ad.category,
  }));
}

/**
 * Fetch a single ad by ID (public detail)
 */
export async function getAdById(id: string): Promise<IAdPublic | null> {
  try {
    const response = await api.get<IAdPublic>(`/ads/detail/${id}`);
    return response.data;
  } catch {
    return null;
  }
}

/**
 * Fetch related products by category (excluding current ad)
 */
export async function getRelatedProducts(
  categoryId: string,
  excludeId: string,
  limit: number = 4
): Promise<Product[]> {
  const { products } = await getAds({
    categoryId,
    limit: limit + 1, // Fetch extra in case current ad is included
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  return products.filter((p) => p.id !== excludeId).slice(0, limit);
}

export const adsService = {
  getAds,
  getLatestAds,
  searchAds,
  getAdById,
  getRelatedProducts,
};
