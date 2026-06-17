/**
 * Seller request types for admin-panel
 * Re-exports shared types and adds admin-panel specific extensions
 */

// Re-export all shared seller request types
export {
  SellerRequestStatus,
  type IBusinessLogo,
  type ISellerRequest,
  type ISellerRequestListItem,
  type ICreateSellerRequestDto,
  type IUpdateSellerRequestDto,
  type IValidateSellerRequestDto,
  type ISellerRequestQueryParams,
  type ISellerRequestStats,
} from "@uscg/shared/types";

// Import shared types for aliasing
import type {
  IBusinessLogo,
  ISellerRequest,
  IValidateSellerRequestDto,
  ISellerRequestQueryParams,
  SellerRequestStatus as SellerRequestStatusEnum,
} from "@uscg/shared/types";

/**
 * Alias types for backwards compatibility
 */
export type SellerRequestStatusType = "PENDING" | "APPROVED" | "REJECTED";
export type BusinessLogo = IBusinessLogo;
export type SellerRequest = ISellerRequest;
export type ValidateSellerRequestDto = IValidateSellerRequestDto;
export type SellerRequestQueryParams = ISellerRequestQueryParams;
