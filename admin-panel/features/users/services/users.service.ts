import { http } from "@/shared/api/http";
import { PaginatedResponse } from "@/shared/types";
import {
  User,
  CreateOperatorDto,
  UpdateUserDto,
  UserQueryParams,
} from "../types/users.types";

const usersService = {
  getProfile: async (): Promise<User> => {
    const response = await http.get<User>("/users/me");
    return response.data;
  },

  updateProfile: async (data: UpdateUserDto): Promise<User> => {
    const response = await http.patch<User>("/users/me", data);
    return response.data;
  },

  getAll: async (params?: UserQueryParams): Promise<PaginatedResponse<User>> => {
    const response = await http.get<PaginatedResponse<User>>("/users", {
      params,
    });
    return response.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await http.get<User>(`/users/${id}`);
    return response.data;
  },

  createOperator: async (data: CreateOperatorDto): Promise<User> => {
    const response = await http.post<User>("/users/operator", data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await http.delete(`/users/${id}`);
  },
};

export default usersService;
