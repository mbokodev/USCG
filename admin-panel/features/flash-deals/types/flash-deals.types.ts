/**
 * Flash Deal types for admin-panel
 * Re-exports shared types and adds admin-panel specific extensions
 */

// Re-export shared flash deal types
export {
  type IFlashDeal,
  type IFlashDealAd,
  type IFlashDealListItem,
  type ICreateFlashDealDto,
  type IUpdateFlashDealDto,
  type IFlashDealQueryParams,
} from "@uscg/shared/types";

// Alias for backwards compatibility
import type {
  IFlashDeal,
  IFlashDealAd,
  IFlashDealListItem,
  ICreateFlashDealDto,
  IUpdateFlashDealDto,
} from "@uscg/shared/types";

export type FlashDeal = IFlashDeal;
export type FlashDealAd = IFlashDealAd;
export type FlashDealListItem = IFlashDealListItem;
export type CreateFlashDealDto = ICreateFlashDealDto;
export type UpdateFlashDealDto = IUpdateFlashDealDto;

// ============================================
// Admin-panel specific types
// ============================================

export interface FlashDealFormValues {
  adId: string;
  adTitle: string; // For display in autocomplete
  startDate: string;
  endDate: string;
  hasEndDate: boolean;
  isActive: boolean;
}

