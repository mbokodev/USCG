/**
 * FeaturedSection types for admin-panel
 * Re-exports shared types and adds admin-panel specific extensions
 */

// Re-export all shared featured-section types
export {
  FilterType,
  type IFilter,
  type IFeaturedSection,
  type IFeaturedSectionWithAds,
  type IFeaturedSectionsListResponse,
} from "@uscg/shared/types";

// Import shared types for use in DTOs
import type { FilterType, I18nText } from "@uscg/shared/types";
import type { IFeaturedSection } from "@uscg/shared/types";

/**
 * Alias types for backwards compatibility
 */
export type FeaturedSection = IFeaturedSection;

/**
 * Admin-panel specific DTOs (with sourceLang for auto-translation)
 */
export interface CreateFeaturedSectionDto {
  sourceLang: "fr" | "en";
  title: string;
  categoryId?: string;
  subCategoryId?: string;
  filterType?: FilterType;
  variantId?: string;
  limit?: number;
  isActive?: boolean;
}

export interface UpdateFeaturedSectionDto {
  title?: I18nText;
  categoryId?: string | null;
  subCategoryId?: string | null;
  filterType?: FilterType;
  variantId?: string | null;
  limit?: number;
  isActive?: boolean;
}
