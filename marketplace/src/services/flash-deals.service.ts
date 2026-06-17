import api from "@/lib/api";
import type { IFlashDealListItem } from "@uscg/shared/types";

export interface FlashDealsResponse {
  data: IFlashDealListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Fetch active flash deals (public endpoint)
 */
export async function getFlashDeals(limit = 10): Promise<IFlashDealListItem[]> {
  const response = await api.get<FlashDealsResponse>("/flash-deals", {
    params: { limit },
  });
  return response.data.data;
}

export const flashDealsService = {
  getFlashDeals,
};
