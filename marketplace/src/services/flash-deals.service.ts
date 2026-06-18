import api from "@/lib/api";
import type { IFlashDealListItem } from "@uscg/shared/types";
import Product from "@models/product.model";
import { buildImageUrl } from "@/utils/ad-utils";

export interface FlashDealsResponse {
  data: IFlashDealListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Map flash deal to Product for UI components
 */
function mapFlashDealToProduct(item: IFlashDealListItem): Product {
  const { ad } = item;
  const discount = ad.price && ad.discountedPrice
    ? Math.round(((ad.price - ad.discountedPrice) / ad.price) * 100)
    : 0;

  return {
    id: ad.id,
    title: ad.title,
    price: ad.price,
    discountedPrice: ad.discountedPrice,
    slug: ad.id,
    thumbnail: buildImageUrl(ad.thumbnail),
    images: ad.thumbnail ? [buildImageUrl(ad.thumbnail)] : [],
    discount,
    rating: 5,
    city: ad.city,
    viewCount: 0,
    type: "SALE",
    status: "APPROVED",
    categoryId: ad.category?.id || "",
    category: ad.category,
    createdAt: "",
    updatedAt: "",
  };
}

/**
 * Fetch active flash deals (public endpoint)
 */
export async function getFlashDeals(limit = 10): Promise<Product[]> {
  try {
    const response = await api.get<FlashDealsResponse>("/flash-deals", {
      params: { limit },
    });
    return response.data.data.map(mapFlashDealToProduct);
  } catch (error) {
    console.error("Error fetching flash deals:", error);
    return [];
  }
}

export const flashDealsService = {
  getFlashDeals,
};
