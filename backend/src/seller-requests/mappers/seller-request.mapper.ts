/**
 * Mapper pour le module SellerRequests
 */

import type { SellerRequest, User, File } from '@prisma/client';
import type { SellerRequestResponseDto, SellerRequestUserDto, BusinessLogoDto } from '../dto';

// Type pour User dans SellerRequest
type SellerRequestUser = Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'phone'>;

// Type pour Logo
type BusinessLogo = Pick<File, 'id' | 'url' | 'originalName'>;

// Type pour SellerRequest avec User et Logo
type SellerRequestWithRelations = SellerRequest & {
  user?: SellerRequestUser;
  businessLogo?: BusinessLogo | null;
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
   */
  toLogoDto(logo: BusinessLogo): BusinessLogoDto {
    return {
      id: logo.id,
      url: logo.url,
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
