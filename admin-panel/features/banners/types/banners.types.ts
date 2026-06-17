/**
 * Banner types for admin-panel
 * Re-exports shared types and adds admin-panel specific extensions
 */

// Re-export shared banner types
export {
  type IBanner,
  type ICreateBannerDto,
  type IUpdateBannerDto,
} from "@uscg/shared/types";

// Alias for backwards compatibility
import type { IBanner, ICreateBannerDto, IUpdateBannerDto } from "@uscg/shared/types";

export type Banner = IBanner;
export type CreateBannerDto = ICreateBannerDto;
export type UpdateBannerDto = IUpdateBannerDto;

// ============================================
// Admin-panel specific types
// ============================================

export type LinkType = "product" | "page";

export interface BannerFormValues {
  title: string;
  description: string;
  // Image
  imageFile: File | null;
  imageUrl: string;
  // Button
  buttonText: string;
  buttonLinkType: LinkType;
  buttonLinkProductId: string;
  buttonLinkProductTitle: string;
  buttonLink: string;
  // Other
  isActive: boolean;
  order: number;
}

