/**
 * Variant types shared between admin-panel and marketplace
 */

import type { I18nText, ICategoryInfo, ISubCategoryInfo } from "./category.types";

/**
 * Variant type enum
 */
export enum VariantType {
  TEXT = "TEXT",
  NUMBER = "NUMBER",
  SELECT = "SELECT",
  MULTI_SELECT = "MULTI_SELECT",
  COLOR = "COLOR",
  BOOLEAN = "BOOLEAN",
}

/**
 * Variant option (for SELECT, MULTI_SELECT, COLOR types)
 */
export interface IVariantOption {
  value: string;
  label: I18nText;
  hex?: string; // For COLOR type
}

/**
 * Base variant interface (full model)
 */
export interface IVariant {
  id: string;
  categoryId?: string | null;
  subCategoryId?: string | null;
  name: I18nText;
  description?: I18nText | null;
  type: VariantType;
  options: IVariantOption[] | null;
  unit?: string | null;
  allowCustomValue: boolean;
  isRequired: boolean;
  isFilterable: boolean;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  category?: ICategoryInfo;
  subCategory?: ISubCategoryInfo;
}

/**
 * Variant list item (lighter version)
 */
export interface IVariantListItem {
  id: string;
  categoryId?: string | null;
  subCategoryId?: string | null;
  name: I18nText;
  type: VariantType;
  unit?: string | null;
  isRequired: boolean;
  isFilterable: boolean;
  isActive: boolean;
  displayOrder: number;
}

/**
 * Variant info for forms (minimal with options)
 */
export interface IVariantFormInfo {
  id: string;
  name: I18nText;
  type: VariantType;
  options: IVariantOption[] | null;
  unit?: string | null;
  isRequired: boolean;
  allowCustomValue: boolean;
}

/**
 * DTO for creating a variant
 */
export interface ICreateVariantDto {
  categoryId?: string;
  subCategoryId?: string;
  name: I18nText;
  description?: I18nText;
  type: VariantType;
  options?: IVariantOption[];
  unit?: string;
  allowCustomValue?: boolean;
  isRequired?: boolean;
  isFilterable?: boolean;
  displayOrder?: number;
  isActive?: boolean;
}

/**
 * DTO for updating a variant
 */
export interface IUpdateVariantDto extends Partial<ICreateVariantDto> {}

/**
 * Query params for variants list
 */
export interface IVariantQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  subCategoryId?: string;
  type?: VariantType;
  isFilterable?: boolean;
  isActive?: boolean;
}

/**
 * Variant value (user-selected value for an ad)
 */
export interface IVariantValue {
  id: string;
  adId: string;
  variantId: string;
  value: string;
  variant?: {
    id: string;
    name: I18nText;
    type: VariantType;
    options: IVariantOption[] | null;
    unit?: string | null;
  };
}
