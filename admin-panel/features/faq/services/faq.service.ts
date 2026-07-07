import { http } from "@/shared/api/http";
import type {
  IFaqCategory,
  IFaq,
  ICreateFaqCategoryDto,
  IUpdateFaqCategoryDto,
  ICreateFaqDto,
  IUpdateFaqDto,
} from "../types";

export const faqService = {
  // ============================================
  // Categories
  // ============================================

  getCategories: async (): Promise<IFaqCategory[]> => {
    const response = await http.get<IFaqCategory[]>("/faq/admin/categories");
    return response.data;
  },

  getCategoryById: async (id: string): Promise<IFaqCategory> => {
    const response = await http.get<IFaqCategory>(`/faq/admin/categories/${id}`);
    return response.data;
  },

  createCategory: async (data: ICreateFaqCategoryDto): Promise<IFaqCategory> => {
    const response = await http.post<IFaqCategory>("/faq/categories", data);
    return response.data;
  },

  updateCategory: async (id: string, data: IUpdateFaqCategoryDto): Promise<IFaqCategory> => {
    const response = await http.patch<IFaqCategory>(`/faq/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: string): Promise<{ message: string }> => {
    const response = await http.delete<{ message: string }>(`/faq/categories/${id}`);
    return response.data;
  },

  // ============================================
  // FAQs
  // ============================================

  getFaqs: async (): Promise<IFaq[]> => {
    const response = await http.get<IFaq[]>("/faq/admin");
    return response.data;
  },

  getFaqById: async (id: string): Promise<IFaq> => {
    const response = await http.get<IFaq>(`/faq/admin/${id}`);
    return response.data;
  },

  createFaq: async (data: ICreateFaqDto): Promise<IFaq> => {
    const response = await http.post<IFaq>("/faq", data);
    return response.data;
  },

  updateFaq: async (id: string, data: IUpdateFaqDto): Promise<IFaq> => {
    const response = await http.patch<IFaq>(`/faq/${id}`, data);
    return response.data;
  },

  deleteFaq: async (id: string): Promise<{ message: string }> => {
    const response = await http.delete<{ message: string }>(`/faq/${id}`);
    return response.data;
  },
};
