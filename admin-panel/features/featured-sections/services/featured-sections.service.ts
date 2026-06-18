import { http } from "@/shared/api/http";
import type {
  IFeaturedSection,
  IFeaturedSectionsListResponse,
  CreateFeaturedSectionDto,
  UpdateFeaturedSectionDto,
} from "../types/featured-section.types";

export const featuredSectionsService = {
  /**
   * Get all featured sections (admin view)
   */
  getAll: async (): Promise<IFeaturedSectionsListResponse> => {
    const response = await http.get<IFeaturedSectionsListResponse>(
      "/featured-sections/admin",
      { params: { limit: 100 } }
    );
    return response.data;
  },

  /**
   * Get a single featured section by ID
   */
  getById: async (id: string): Promise<IFeaturedSection> => {
    const response = await http.get<IFeaturedSection>(
      `/featured-sections/admin/${id}`
    );
    return response.data;
  },

  /**
   * Create a new featured section
   */
  create: async (data: CreateFeaturedSectionDto): Promise<IFeaturedSection> => {
    const response = await http.post<IFeaturedSection>(
      "/featured-sections",
      data
    );
    return response.data;
  },

  /**
   * Update an existing featured section
   */
  update: async (
    id: string,
    data: UpdateFeaturedSectionDto
  ): Promise<IFeaturedSection> => {
    const response = await http.patch<IFeaturedSection>(
      `/featured-sections/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Delete a featured section
   */
  delete: async (id: string): Promise<void> => {
    await http.delete(`/featured-sections/${id}`);
  },
};
