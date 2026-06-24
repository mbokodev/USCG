import { http } from "@/shared/api/http";
import { getApiErrorMessage } from "@/shared/utils";
import { ApiResult } from "@/shared/types";
import { LoginRequest, LoginResponse, AuthUser } from "../schemas/auth.schema";

const authService = {
  login: async (credentials: LoginRequest): Promise<ApiResult<LoginResponse>> => {
    try {
      // Utiliser /auth/login/admin pour le panel admin
      // Cet endpoint refuse les BUYER sans statut vendeur
      const { data } = await http.post<LoginResponse>("/auth/login/admin", credentials);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: getApiErrorMessage(error) };
    }
  },

  logout: async (): Promise<void> => {
    try {
      await http.post("/auth/logout");
    } catch {
      // Silently fail - on veut quand même clear les cookies locaux
    }
  },

  getProfile: async (accessToken: string): Promise<ApiResult<AuthUser>> => {
    try {
      const { data } = await http.get<AuthUser>("/users/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: getApiErrorMessage(error) };
    }
  },

  changePassword: async (
    currentPassword: string,
    newPassword: string,
  ): Promise<ApiResult<{ message: string }>> => {
    try {
      const { data } = await http.post<{ message: string }>("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: getApiErrorMessage(error) };
    }
  },
};

export default authService;
