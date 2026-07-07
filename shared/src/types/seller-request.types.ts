/**
 * Seller request types shared between admin-panel and marketplace
 */

import type { ISellerRequestUser } from "./user.types";

/**
 * Seller request status enum
 */
export enum SellerRequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

/**
 * Contact method enum (for seller contact preferences)
 */
export enum ContactMethod {
  PHONE = "PHONE",
  SMS = "SMS",
  WHATSAPP = "WHATSAPP",
}

/**
 * Business logo info
 */
export interface IBusinessLogo {
  id: string;
  url: string;
  originalName: string;
}

/**
 * Base seller request interface (full model)
 */
export interface ISellerRequest {
  id: string;
  userId: string;
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  taxId?: string | null;
  description: string;
  businessLogoId?: string | null;
  businessLogo?: IBusinessLogo | null;
  status: SellerRequestStatus;
  rejectionReason?: string | null;
  validatedAt?: string | null;
  validatedBy?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: ISellerRequestUser;
  enabledContactMethods: ContactMethod[];
}

/**
 * Seller request list item (for admin lists)
 */
export interface ISellerRequestListItem {
  id: string;
  userId: string;
  businessName: string;
  businessPhone: string;
  status: SellerRequestStatus;
  createdAt: string;
  user?: ISellerRequestUser;
}

/**
 * DTO for creating a seller request (marketplace)
 */
export interface ICreateSellerRequestDto {
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  taxId?: string;
  description: string;
  businessLogoId?: string;
}

/**
 * DTO for updating a seller request (resubmission)
 */
export interface IUpdateSellerRequestDto extends Partial<ICreateSellerRequestDto> {}

/**
 * DTO for validating a seller request (admin)
 */
export interface IValidateSellerRequestDto {
  status: "APPROVED" | "REJECTED";
  rejectionReason?: string;
}

/**
 * Query params for seller requests list
 */
export interface ISellerRequestQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: SellerRequestStatus;
}

/**
 * DTO for updating contact preferences
 */
export interface IUpdateContactPreferencesDto {
  enabledContactMethods: ContactMethod[];
}

/**
 * Stats for seller requests (admin dashboard)
 */
export interface ISellerRequestStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}
