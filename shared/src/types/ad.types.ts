/**
 * Ad types shared between admin-panel and marketplace
 */

import type { IFile } from "./file.types";
import type { I18nText, ICategoryInfo, ISubCategoryInfo } from "./category.types";
import type { IVariantValue } from "./variant.types";

// Re-export I18nText for convenience
export type { I18nText };

/**
 * Ad status enum
 */
export enum AdStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  MODIFICATION_REQUESTED = "MODIFICATION_REQUESTED",
}

/**
 * Ad type enum (sale or rent)
 */
export enum AdType {
  SALE = "SALE",
  RENT = "RENT",
}

/**
 * Category info in ad responses (re-export for convenience)
 */
export type IAdCategory = ICategoryInfo;

/**
 * SubCategory info in ad responses (re-export for convenience)
 */
export type IAdSubCategory = ISubCategoryInfo;

/**
 * Seller info in ad list responses (minimal)
 */
export interface IAdSeller {
  firstName: string;
  lastName: string;
}

/**
 * User info in ad detail responses (full info for owner/admin)
 */
export interface IAdUser {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
}

/**
 * File info in ad responses (subset of IFile)
 */
export interface IAdFile extends Pick<IFile, "id" | "filename" | "originalName" | "mimeType" | "path" | "type" | "isDefault"> {
  size?: number;
}

/**
 * Variant value in ad responses
 */
export interface IAdVariantValue {
  id: string;
  variantId: string;
  value: string;
  variant?: {
    id: string;
    name: I18nText;
    type: string;
    options: unknown;
    unit?: string | null;
  };
}

/**
 * Base ad interface (database model)
 */
export interface IAd {
  id: string;
  title: string;
  description: unknown; // Can be string or TiptapContent JSON
  price: number | null; // Null = prix sur devis/variable
  discountedPrice?: number | null; // Prix réduit pour Flash Deals
  quantity: number | null;
  type: AdType;
  status: AdStatus;
  location?: string;
  city: string;
  latitude?: number | null;
  longitude?: number | null;
  viewCount: number;
  categoryId: string;
  subCategoryId?: string | null;
  userId: string;
  rejectionReason?: string | null;
  validatedAt?: string | null;
  validatedById?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Ad list item response (without description for lighter API responses)
 */
export interface IAdListItem extends Omit<IAd, "description" | "location" | "latitude" | "longitude" | "validatedAt" | "validatedById" | "userId"> {
  category?: IAdCategory;
  subCategory?: IAdSubCategory | null;
  seller?: IAdSeller;
  files?: IAdFile[];
}

/**
 * Ad public detail response (with description, for public view without location)
 */
export interface IAdPublic extends IAdListItem {
  description: unknown;
  variantValues?: IAdVariantValue[];
}

/**
 * Ad full response (with location - for owner, operator, admin)
 */
export interface IAdFull extends IAdPublic {
  location?: string;
  latitude?: number | null;
  longitude?: number | null;
  validatedAt?: string | null;
  validatedById?: string | null;
  userId: string;
  user?: IAdUser;
}

/**
 * DTO for creating an ad
 */
export interface ICreateAdDto {
  title: string;
  description: unknown;
  price?: number | null; // Null = prix sur devis/variable
  discountedPrice?: number | null; // Prix réduit pour Flash Deals
  quantity?: number | null;
  type: AdType;
  categoryId: string;
  subCategoryId?: string;
  location: string;
  city: string;
  latitude?: number;
  longitude?: number;
  variantValues?: Array<{
    variantId: string;
    value: string;
  }>;
}

/**
 * DTO for updating an ad
 */
export interface IUpdateAdDto extends Partial<ICreateAdDto> {
  removedImageIds?: string[];
}

/**
 * DTO for validating an ad (approve/reject)
 */
export interface IValidateAdDto {
  status: "APPROVED" | "REJECTED" | "MODIFICATION_REQUESTED";
  rejectionReason?: string;
}

/**
 * Query params for listing ads
 */
export interface IAdQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: AdStatus;
  categoryId?: string;
  subCategoryId?: string;
  type?: AdType;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "createdAt" | "price" | "viewCount";
  sortOrder?: "asc" | "desc";
  // Variant filters (dynamic)
  [key: `variant_${string}`]: string | string[];
}

/**
 * Stats for ads (admin/seller dashboard)
 */
export interface IAdStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  modificationRequested?: number;
  totalViews?: number;
}
