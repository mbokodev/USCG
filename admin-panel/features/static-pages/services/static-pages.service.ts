import { http } from "@/shared/api/http";
import type { ITermsPage, IPrivacyPage, IAboutPage, IUpdateTermsDto, IUpdatePrivacyDto, IUpdateAboutDto } from "../types";

export const staticPagesService = {
  // Terms
  getTerms: async (): Promise<ITermsPage> => {
    const response = await http.get<ITermsPage>("/static-pages/terms");
    return response.data;
  },

  updateTerms: async (data: IUpdateTermsDto): Promise<ITermsPage> => {
    const response = await http.patch<ITermsPage>("/static-pages/terms", data);
    return response.data;
  },

  // Privacy
  getPrivacy: async (): Promise<IPrivacyPage> => {
    const response = await http.get<IPrivacyPage>("/static-pages/privacy");
    return response.data;
  },

  updatePrivacy: async (data: IUpdatePrivacyDto): Promise<IPrivacyPage> => {
    const response = await http.patch<IPrivacyPage>("/static-pages/privacy", data);
    return response.data;
  },

  // About
  getAbout: async (): Promise<IAboutPage> => {
    const response = await http.get<IAboutPage>("/static-pages/about");
    return response.data;
  },

  updateAbout: async (data: IUpdateAboutDto): Promise<IAboutPage> => {
    const response = await http.patch<IAboutPage>("/static-pages/about", data);
    return response.data;
  },
};
