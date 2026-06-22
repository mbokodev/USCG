import api from "@/lib/api";
import type { ISellerRequest, ICreateSellerRequestDto } from "@uscg/shared/types";

export interface ApiResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object") {
    const err = error as { response?: { data?: { message?: string | string[] } } };
    const message = err.response?.data?.message;
    if (Array.isArray(message)) {
      return message[0];
    }
    if (typeof message === "string") {
      return message;
    }
  }
  return "Une erreur est survenue";
}

const sellerRequestsService = {
  // Get my seller request
  getMyRequest: async (): Promise<ApiResult<ISellerRequest | null>> => {
    try {
      const { data } = await api.get<ISellerRequest>("/seller-requests/me");
      return { success: true, data };
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } };
      if (err.response?.status === 404) {
        return { success: true, data: null };
      }
      return { success: false, error: getErrorMessage(error) };
    }
  },

  // Create a new seller request
  create: async (dto: ICreateSellerRequestDto): Promise<ApiResult<ISellerRequest>> => {
    try {
      const { data } = await api.post<ISellerRequest>("/seller-requests", dto);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  // Update seller request (resubmission after rejection)
  update: async (id: string, dto: Partial<ICreateSellerRequestDto>): Promise<ApiResult<ISellerRequest>> => {
    try {
      const { data } = await api.patch<ISellerRequest>(`/seller-requests/${id}`, dto);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },
};

export default sellerRequestsService;
