import { http } from "@/shared/api/http";
import { PaginatedResponse } from "@/shared/types";
import type {
  FlashDeal,
  FlashDealListItem,
  CreateFlashDealDto,
  UpdateFlashDealDto,
} from "../types";
import type { IAdListItem } from "@uscg/shared/types";

export const flashDealsService = {
  /**
   * Get all flash deals (admin view - includes inactive and expired)
   */
  getAll: async (includeExpired = true): Promise<PaginatedResponse<FlashDealListItem>> => {
    const response = await http.get<PaginatedResponse<FlashDealListItem>>("/flash-deals/admin", {
      params: { includeExpired, limit: 100 },
    });
    return response.data;
  },

  /**
   * Get a single flash deal by ID
   */
  getById: async (id: string): Promise<FlashDeal> => {
    const response = await http.get<FlashDeal>(`/flash-deals/${id}`);
    return response.data;
  },

  /**
   * Create a new flash deal
   */
  create: async (data: CreateFlashDealDto): Promise<FlashDeal> => {
    const response = await http.post<FlashDeal>("/flash-deals", data);
    return response.data;
  },

  /**
   * Update an existing flash deal
   */
  update: async (id: string, data: UpdateFlashDealDto): Promise<FlashDeal> => {
    const response = await http.patch<FlashDeal>(`/flash-deals/${id}`, data);
    return response.data;
  },

  /**
   * Delete a flash deal
   */
  delete: async (id: string): Promise<void> => {
    await http.delete(`/flash-deals/${id}`);
  },

  /**
   * Get eligible ads for flash deals (approved with discountedPrice set, without existing flash deal)
   */
  getEligibleAds: async (search?: string): Promise<IAdListItem[]> => {
    const response = await http.get<IAdListItem[]>("/flash-deals/eligible-ads", {
      params: { search, limit: 20 },
    });
    return response.data;
  },
};
