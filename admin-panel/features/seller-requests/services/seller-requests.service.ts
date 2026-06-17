import { http } from "@/shared/api/http";
import { PaginatedResponse } from "@/shared/types";
import {
  SellerRequest,
  ValidateSellerRequestDto,
  SellerRequestQueryParams,
} from "../types/seller-requests.types";

const sellerRequestsService = {
  getAll: async (
    params?: SellerRequestQueryParams
  ): Promise<PaginatedResponse<SellerRequest>> => {
    const response = await http.get<PaginatedResponse<SellerRequest>>(
      "/seller-requests",
      { params }
    );
    return response.data;
  },

  getPending: async (
    params?: SellerRequestQueryParams
  ): Promise<PaginatedResponse<SellerRequest>> => {
    const response = await http.get<PaginatedResponse<SellerRequest>>(
      "/seller-requests/pending",
      { params }
    );
    return response.data;
  },

  getById: async (id: string): Promise<SellerRequest> => {
    const response = await http.get<SellerRequest>(`/seller-requests/${id}`);
    return response.data;
  },

  getMyRequest: async (): Promise<SellerRequest | null> => {
    const response = await http.get<SellerRequest | null>("/seller-requests/me");
    return response.data;
  },

  getByUserId: async (userId: string): Promise<SellerRequest> => {
    const response = await http.get<SellerRequest>(`/seller-requests/user/${userId}`);
    return response.data;
  },

  validate: async (
    id: string,
    data: ValidateSellerRequestDto
  ): Promise<SellerRequest> => {
    const response = await http.patch<SellerRequest>(
      `/seller-requests/${id}/validate`,
      data
    );
    return response.data;
  },

  getStats: async (): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  }> => {
    const response = await http.get("/seller-requests/stats");
    return response.data;
  },
};

export default sellerRequestsService;
