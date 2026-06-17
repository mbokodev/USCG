/**
 * Category and SubCategory types shared between admin-panel and marketplace
 */

/**
 * I18n text type for multilingual content (fr/en)
 */
export interface I18nText {
  fr: string;
  en: string;
  [key: string]: string;
}

/**
 * Base category interface (full model)
 */
export interface ICategory {
  id: string;
  name: I18nText;
  slug: string;
  description?: I18nText | null;
  icon?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  subCategories?: ISubCategory[];
  _count?: {
    subCategories?: number;
  };
}

/**
 * Category list item (lighter version for lists)
 */
export interface ICategoryListItem {
  id: string;
  name: I18nText;
  slug: string;
  icon?: string | null;
  sortOrder: number;
  isActive: boolean;
  _count?: {
    subCategories?: number;
  };
}

/**
 * Category info (minimal, used in ad responses)
 */
export interface ICategoryInfo {
  id: string;
  name: I18nText;
  slug: string;
}

/**
 * Base subcategory interface (full model)
 */
export interface ISubCategory {
  id: string;
  name: I18nText;
  slug: string;
  description?: I18nText | null;
  categoryId: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: ICategoryInfo;
}

/**
 * SubCategory list item (lighter version)
 */
export interface ISubCategoryListItem {
  id: string;
  name: I18nText;
  slug: string;
  categoryId: string;
  sortOrder: number;
  isActive: boolean;
}

/**
 * SubCategory info (minimal, used in ad responses)
 */
export interface ISubCategoryInfo {
  id: string;
  name: I18nText;
  slug: string;
}

/**
 * DTO for creating a category
 */
export interface ICreateCategoryDto {
  name: I18nText;
  slug?: string;
  description?: I18nText;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean;
}

/**
 * DTO for updating a category
 */
export interface IUpdateCategoryDto extends Partial<ICreateCategoryDto> {}

/**
 * DTO for creating a subcategory
 */
export interface ICreateSubCategoryDto {
  name: I18nText;
  slug?: string;
  description?: I18nText;
  categoryId: string;
  sortOrder?: number;
  isActive?: boolean;
}

/**
 * DTO for updating a subcategory
 */
export interface IUpdateSubCategoryDto extends Partial<Omit<ICreateSubCategoryDto, "categoryId">> {}

/**
 * Query params for categories list
 */
export interface ICategoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  includeSubCategories?: boolean;
}

/**
 * Query params for subcategories list
 */
export interface ISubCategoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  isActive?: boolean;
}
