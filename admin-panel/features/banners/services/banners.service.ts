import { http } from "@/shared/api/http";
import { PaginatedResponse } from "@/shared/types";
import type { Banner, CreateBannerDto, UpdateBannerDto } from "../types";
import type { AdSearchResult } from "@/components/ui";

// Interface for ad list item from API
interface AdListItemApi {
  id: string;
  title: string;
  price: number | null;
  files?: Array<{
    id: string;
    filename: string;
    path: string;
    isDefault?: boolean;
  }>;
}

export const bannersService = {
  /**
   * Get all banners (admin view - includes inactive)
   */
  getAll: async (): Promise<Banner[]> => {
    const response = await http.get<Banner[]>("/banners/admin");
    return response.data;
  },

  /**
   * Get a single banner by ID
   */
  getById: async (id: string): Promise<Banner> => {
    const response = await http.get<Banner>(`/banners/${id}`);
    return response.data;
  },

  /**
   * Create a new banner
   */
  create: async (data: CreateBannerDto): Promise<Banner> => {
    const response = await http.post<Banner>("/banners", data);
    return response.data;
  },

  /**
   * Update an existing banner
   */
  update: async (id: string, data: UpdateBannerDto): Promise<Banner> => {
    const response = await http.patch<Banner>(`/banners/${id}`, data);
    return response.data;
  },

  /**
   * Delete a banner
   */
  delete: async (id: string): Promise<void> => {
    await http.delete(`/banners/${id}`);
  },

  /**
   * Search for approved ads (for autocomplete)
   */
  searchAds: async (query: string): Promise<AdSearchResult[]> => {
    const response = await http.get<PaginatedResponse<AdListItemApi>>("/ads", {
      params: {
        search: query,
        status: "APPROVED",
        limit: 10,
      },
    });

    // Transform to simplified format for autocomplete
    return response.data.data.map((ad) => {
      // Get the first image URL or default image
      let imageUrl: string | null = null;
      if (ad.files && ad.files.length > 0) {
        // Prefer default image, otherwise use first
        const defaultFile = ad.files.find((f) => f.isDefault) || ad.files[0];
        imageUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/files/images/${defaultFile.filename}`;
      }

      return {
        id: ad.id,
        title: ad.title,
        price: ad.price,
        imageUrl,
      };
    });
  },
};
