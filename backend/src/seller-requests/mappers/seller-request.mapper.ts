/**
 * Mapper pour le module SellerRequests
 */

import type { SellerRequest, User, File } from '@prisma/client';
import type { SellerRequestResponseDto, SellerRequestUserDto, BusinessLogoDto } from '../dto';

// Type pour User dans SellerRequest
type SellerRequestUser = Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'phone'>;

// Type pour Logo (path is needed to build URL dynamically)
type BusinessLogo = Pick<File, 'id' | 'url' | 'originalName' | 'path'>;

// Type pour SellerRequest avec User et Logo
type SellerRequestWithRelations = SellerRequest & {
  user?: SellerRequestUser;
  businessLogo?: BusinessLogo | null;
};

// Get API URL from environment
const getApiUrl = (): string => {
  return process.env.API_URL || 'http://localhost:3001';
};

export const SellerRequestMapper = {
  /**
   * Convertit un User en SellerRequestUserDto
   */
  toUserDto(user: SellerRequestUser): SellerRequestUserDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
    };
  },

  /**
   * Convertit un Logo en BusinessLogoDto
   * Build URL dynamically using current API_URL
   */
  toLogoDto(logo: BusinessLogo): BusinessLogoDto {
    const apiUrl = getApiUrl();
    return {
      id: logo.id,
      url: `${apiUrl}/api/files/${logo.path}`,
      originalName: logo.originalName,
    };
  },

  /**
   * Convertit un SellerRequest en SellerRequestResponseDto
   */
  toResponse(sellerRequest: SellerRequestWithRelations): SellerRequestResponseDto {
    return {
      id: sellerRequest.id,
      userId: sellerRequest.userId,
      businessName: sellerRequest.businessName,
      businessAddress: sellerRequest.businessAddress,
      businessPhone: sellerRequest.businessPhone,
      taxId: sellerRequest.taxId,
      description: sellerRequest.description,
      businessLogoId: sellerRequest.businessLogoId,
      businessLogo: sellerRequest.businessLogo ? this.toLogoDto(sellerRequest.businessLogo) : null,
      status: sellerRequest.status,
      rejectionReason: sellerRequest.rejectionReason,
      validatedAt: sellerRequest.validatedAt,
      validatedBy: sellerRequest.validatedBy,
      createdAt: sellerRequest.createdAt,
      updatedAt: sellerRequest.updatedAt,
      user: sellerRequest.user ? this.toUserDto(sellerRequest.user) : undefined,
    };
  },

  /**
   * Convertit une liste de SellerRequests
   */
  toResponseList(sellerRequests: SellerRequestWithRelations[]): SellerRequestResponseDto[] {
    return sellerRequests.map((sr) => this.toResponse(sr));
  },
};
