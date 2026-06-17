import { http } from "@/shared/api/http";
import { PaginatedResponse } from "@/shared/types";
import {
  Ad,
  AdListItem,
  CreateAdDto,
  UpdateAdDto,
  ValidateAdDto,
  AdQueryParams,
} from "../types/ads.types";

const adsService = {
  // SELLER endpoints
  getMyAds: async (params?: AdQueryParams): Promise<PaginatedResponse<AdListItem>> => {
    const response = await http.get<PaginatedResponse<AdListItem>>("/ads/my-ads", {
      params,
    });
    return response.data;
  },

  getMyAd: async (id: string): Promise<Ad> => {
    const response = await http.get<Ad>(`/ads/my-ads/${id}`);
    return response.data;
  },

  create: async (data: CreateAdDto): Promise<Ad> => {
    const response = await http.post<Ad>("/ads", data);
    return response.data;
  },

  update: async (id: string, data: UpdateAdDto): Promise<Ad> => {
    const response = await http.patch<Ad>(`/ads/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await http.delete(`/ads/${id}`);
  },

  // OPERATOR/ADMIN endpoints
  getAll: async (params?: AdQueryParams): Promise<PaginatedResponse<AdListItem>> => {
    const response = await http.get<PaginatedResponse<AdListItem>>("/ads/admin", {
      params,
    });
    return response.data;
  },

  getPending: async (params?: AdQueryParams): Promise<PaginatedResponse<AdListItem>> => {
    const response = await http.get<PaginatedResponse<AdListItem>>("/ads/pending", {
      params,
    });
    return response.data;
  },

  getAdminDetail: async (id: string): Promise<Ad> => {
    const response = await http.get<Ad>(`/ads/admin/${id}`);
    return response.data;
  },

  validate: async (id: string, data: ValidateAdDto): Promise<Ad> => {
    const response = await http.patch<Ad>(`/ads/${id}/validate`, data);
    return response.data;
  },
};

export default adsService;
