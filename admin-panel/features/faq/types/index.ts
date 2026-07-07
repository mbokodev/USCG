// Re-export from shared types
export type {
  IFaqCategory,
  ICreateFaqCategoryDto,
  IUpdateFaqCategoryDto,
  IFaq,
  IFaqListItem,
  ICreateFaqDto,
  IUpdateFaqDto,
  IFaqGrouped,
  IFaqQueryParams,
  IFaqCategoryQueryParams,
} from "@uscg/shared/types";

export type { TiptapContent, I18nContent } from "@uscg/shared/types";

// Form values for Admin Panel
export interface FaqCategoryFormValues {
  name: string;
  isActive?: boolean;
}

export interface FaqFormValues {
  categoryId: string;
  question: string;
  answer: any; // TiptapContent
  isActive?: boolean;
}
