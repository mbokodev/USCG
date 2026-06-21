import api from "@/lib/api";
import type { IAdListItem, IAdQueryParams } from "@uscg/shared/types";
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

export const adsService = {
  getAds,
  getLatestAds,
  searchAds,
};
