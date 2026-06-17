/**
 * Category types for admin-panel
 * Re-exports shared types and adds admin-panel specific extensions
 */

// Re-export all shared category types
export {
  type I18nText,
  type ICategory,
  type ICategoryListItem,
  type ICategoryInfo,
  type ISubCategory,
  type ISubCategoryListItem,
  type ISubCategoryInfo,
  type ICreateCategoryDto,
  type IUpdateCategoryDto,
  type ICreateSubCategoryDto,
  type IUpdateSubCategoryDto,
  type ICategoryQueryParams,
  type ISubCategoryQueryParams,
} from "@uscg/shared/types";

// Import shared types for aliasing
import type {
  ICategory,
  ISubCategory,
  ICreateCategoryDto as ICreateCategoryDtoShared,
  IUpdateCategoryDto as IUpdateCategoryDtoShared,
  ICreateSubCategoryDto as ICreateSubCategoryDtoShared,
  IUpdateSubCategoryDto as IUpdateSubCategoryDtoShared,
  ICategoryQueryParams,
  ISubCategoryQueryParams,
  I18nText,
} from "@uscg/shared/types";

/**
 * Alias types for backwards compatibility
 */
export type Category = ICategory;
export type SubCategory = ISubCategory;
export type CategoryQueryParams = ICategoryQueryParams;
export type SubCategoryQueryParams = ISubCategoryQueryParams & {
  includeCategory?: boolean;
};

/**
 * Admin-panel specific DTOs (with sourceLang for auto-translation)
 */
export interface CreateCategoryDto {
  sourceLang: "fr" | "en";
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateCategoryDto {
  name?: I18nText;
  slug?: string;
  description?: I18nText;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface CreateSubCategoryDto {
  sourceLang: "fr" | "en";
  name: string;
  slug: string;
  description?: string;
  categoryId: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateSubCategoryDto {
  name?: I18nText;
  slug?: string;
  description?: I18nText;
  categoryId?: string;
  sortOrder?: number;
  isActive?: boolean;
}
