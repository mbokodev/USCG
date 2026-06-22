import api from "@/lib/api";
import type { IAuthUser, ILoginDto, IRegisterDto } from "@uscg/shared/types";

export interface LoginResponse {
  user: IAuthUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RegisterResponse {
  message: string;
}

export interface MessageResponse {
  message: string;
}

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

const authService = {
  login: async (credentials: ILoginDto): Promise<ApiResult<LoginResponse>> => {
    try {
      const { data } = await api.post<LoginResponse>("/auth/login", credentials);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  register: async (data: IRegisterDto): Promise<ApiResult<RegisterResponse>> => {
    try {
      const { data: response } = await api.post<RegisterResponse>("/auth/register", data);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  verifyEmail: async (token: string): Promise<ApiResult<MessageResponse>> => {
    try {
      const { data } = await api.get<MessageResponse>(`/auth/verify-email/${token}`);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  resendVerification: async (email: string): Promise<ApiResult<MessageResponse>> => {
    try {
      const { data } = await api.post<MessageResponse>("/auth/resend-verification", { email });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  forgotPassword: async (email: string): Promise<ApiResult<MessageResponse>> => {
    try {
      const { data } = await api.post<MessageResponse>("/auth/forgot-password", { email });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  resetPassword: async (token: string, password: string): Promise<ApiResult<MessageResponse>> => {
    try {
      const { data } = await api.post<MessageResponse>("/auth/reset-password", { token, password });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  logout: async (): Promise<void> => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Silently fail - on veut quand même clear les cookies locaux
    }
  },

  getProfile: async (accessToken: string): Promise<ApiResult<IAuthUser>> => {
    try {
      const { data } = await api.get<IAuthUser>("/users/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  updateProfile: async (profileData: {
    firstName: string;
    lastName: string;
    phone?: string;
  }): Promise<ApiResult<IAuthUser>> => {
    try {
      const { data } = await api.patch<IAuthUser>("/users/me", profileData);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },
};

export default authService;
