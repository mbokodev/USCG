/**
 * FlashDeal types shared between admin-panel and marketplace
 */

import type { ICategoryInfo } from "./category.types";

/**
 * Ad info included in flash deal responses
 */
export interface IFlashDealAd {
  id: string;
  title: string;
  price: number;
  discountedPrice: number; // Non null pour flash deals
  thumbnail: string | null; // Image principale
  slug?: string;
  city: string;
  category?: ICategoryInfo;
}

/**
 * FlashDeal response (public and admin)
 */
export interface IFlashDeal {
  id: string;
  adId: string;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  ad: IFlashDealAd;
}

/**
 * FlashDeal list item (lighter version)
 */
export interface IFlashDealListItem {
  id: string;
  adId: string;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  order: number;
  ad: IFlashDealAd;
}

/**
 * DTO for creating a flash deal
 */
export interface ICreateFlashDealDto {
  adId: string;
  startDate?: string; // ISO date string, defaults to now
  endDate?: string | null;
  isActive?: boolean;
  order?: number;
}

/**
 * DTO for updating a flash deal
 */
export interface IUpdateFlashDealDto {
  startDate?: string;
  endDate?: string | null;
  isActive?: boolean;
  order?: number;
}

/**
 * Query params for listing flash deals
 */
export interface IFlashDealQueryParams {
  page?: number;
  limit?: number;
  isActive?: boolean;
  includeExpired?: boolean;
}
