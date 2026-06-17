import { http } from "@/shared/api/http";
import { PaginatedResponse } from "@/shared/types";
import {
  Category,
  SubCategory,
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateSubCategoryDto,
  UpdateSubCategoryDto,
  CategoryQueryParams,
  SubCategoryQueryParams,
} from "../types/categories.types";

const categoriesService = {
  // =========================================================================
  // CATEGORIES
  // =========================================================================

  getAll: async (params?: CategoryQueryParams): Promise<PaginatedResponse<Category>> => {
    const response = await http.get<PaginatedResponse<Category>>("/categories", {
      params,
    });
    return response.data;
  },

  getActive: async (): Promise<Category[]> => {
    const response = await http.get<Category[]>("/categories/active");
    return response.data;
  },

  getBySlug: async (slug: string, includeSubCategories = false): Promise<Category> => {
    const response = await http.get<Category>(`/categories/slug/${slug}`, {
      params: { includeSubCategories },
    });
    return response.data;
  },

  getById: async (id: string, includeSubCategories = false): Promise<Category> => {
    const response = await http.get<Category>(`/categories/${id}`, {
      params: { includeSubCategories },
    });
    return response.data;
  },

  create: async (data: CreateCategoryDto): Promise<Category> => {
    const response = await http.post<Category>("/categories", data);
    return response.data;
  },

  update: async (id: string, data: UpdateCategoryDto): Promise<Category> => {
    const response = await http.patch<Category>(`/categories/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await http.delete(`/categories/${id}`);
  },

  // =========================================================================
  // SUBCATEGORIES
  // =========================================================================

  getAllSubCategories: async (
    params?: SubCategoryQueryParams
  ): Promise<PaginatedResponse<SubCategory>> => {
    const response = await http.get<PaginatedResponse<SubCategory>>("/subcategories", {
      params,
    });
    return response.data;
  },

  getSubCategoriesByCategory: async (categoryId: string): Promise<SubCategory[]> => {
    const response = await http.get<SubCategory[]>(
      `/subcategories/by-category/${categoryId}`
    );
    return response.data;
  },

  getSubCategoryById: async (id: string, includeCategory = false): Promise<SubCategory> => {
    const response = await http.get<SubCategory>(`/subcategories/${id}`, {
      params: { includeCategory },
    });
    return response.data;
  },

  getSubCategoryBySlug: async (
    categorySlug: string,
    subCategorySlug: string
  ): Promise<SubCategory> => {
    const response = await http.get<SubCategory>(
      `/subcategories/slug/${categorySlug}/${subCategorySlug}`
    );
    return response.data;
  },

  createSubCategory: async (data: CreateSubCategoryDto): Promise<SubCategory> => {
    const response = await http.post<SubCategory>("/subcategories", data);
    return response.data;
  },

  updateSubCategory: async (
    id: string,
    data: UpdateSubCategoryDto
  ): Promise<SubCategory> => {
    const response = await http.patch<SubCategory>(`/subcategories/${id}`, data);
    return response.data;
  },

  deleteSubCategory: async (id: string): Promise<void> => {
    await http.delete(`/subcategories/${id}`);
  },
};

export default categoriesService;
