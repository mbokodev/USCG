/**
 * Ad types for admin-panel
 * Re-exports shared types and adds admin-panel specific extensions
 */

// Re-export all shared ad types
export {
  AdStatus,
  AdType,
  type I18nText,
  type IAdCategory,
  type IAdSubCategory,
  type IAdSeller,
  type IAdUser,
  type IAdFile,
  type IAdVariantValue,
  type IAdListItem,
  type IAdPublic,
  type IAdFull,
  type ICreateAdDto,
  type IUpdateAdDto,
  type IValidateAdDto,
  type IAdQueryParams,
  type IAdStats,
} from "@uscg/shared/types";

// Re-export file types
export { FileType } from "@uscg/shared/types";

// Import TiptapContent from UI components for admin-panel specific typing
import type { TiptapContent } from "@/components/ui";
export type { TiptapContent };

// Import shared types for aliasing
import type {
  IAdListItem,
  IAdFull,
  IAdFile,
  IAdVariantValue,
  ICreateAdDto,
  IUpdateAdDto,
  IValidateAdDto,
  IAdQueryParams,
  IAdStats,
} from "@uscg/shared/types";

/**
 * Alias types for backwards compatibility and convenience
 */
export type AdListItem = IAdListItem;
export type Ad = IAdFull;
export type AdFile = IAdFile;
export type AdVariantValue = IAdVariantValue;
export type CreateAdDto = ICreateAdDto;
export type UpdateAdDto = IUpdateAdDto;
export type ValidateAdDto = IValidateAdDto;
export type AdQueryParams = IAdQueryParams;
export type AdStats = IAdStats;
