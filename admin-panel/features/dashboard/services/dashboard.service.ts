import { http } from "@/shared/api/http";

export interface SellerStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface OperatorStats {
  totalAds: number;
  pendingAds: number;
  approvedAds: number;
  rejectedAds: number;
  totalBuyers: number;
  totalSellers: number;
  pendingSellerRequests: number;
}

export interface AdminStats extends OperatorStats {
  totalOperators: number;
  totalCategories: number;
}

const dashboardService = {
  getSellerStats: async (): Promise<SellerStats> => {
    const response = await http.get<SellerStats>("/ads/my-stats");
    return response.data;
  },

  getOperatorStats: async (): Promise<OperatorStats> => {
    const response = await http.get<OperatorStats>("/ads/stats");
    return response.data;
  },

  getAdminStats: async (): Promise<AdminStats> => {
    const response = await http.get<AdminStats>("/ads/stats");
    return response.data;
  },
};

export default dashboardService;
