import api from "@/lib/api";
import type { IAdListItem, IAdQueryParams } from "@uscg/shared/types";
import Product from "@models/product.model";
import { mapAdToProduct } from "@/utils/ad-utils";

interface AdsResponse {
  data: IAdListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Fetch ads with query parameters
 */
export async function getAds(params: IAdQueryParams = {}): Promise<{
  products: Product[];
  meta: AdsResponse["meta"];
}> {
  const response = await api.get<AdsResponse>("/ads", { params });

  return {
    products: response.data.data.map(mapAdToProduct),
    meta: response.data.meta,
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

export const adsService = {
  getAds,
  getLatestAds,
};
