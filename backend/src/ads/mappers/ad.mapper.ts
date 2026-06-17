/**
 * Mapper pour le module Ads
 */

import type { Ad, Category, SubCategory, File, AdVariantValue, Variant, User } from '@prisma/client';
import type {
  AdListItemDto,
  AdPublicResponseDto,
  AdFullResponseDto,
  AdCategoryDto,
  AdSubCategoryDto,
  AdFileDto,
  AdVariantValueResponseDto,
  AdSellerDto,
  I18nText,
} from '../dto';

// Types pour les relations
type AdCategory = Pick<Category, 'id' | 'name' | 'slug'>;
type AdSubCategory = Pick<SubCategory, 'id' | 'name' | 'slug'> | null;
type AdFile = Pick<File, 'id' | 'filename' | 'originalName' | 'mimeType' | 'path' | 'type' | 'isDefault'>;
type AdVariantValueWithRelation = AdVariantValue & { variant: Variant };
type AdUser = Pick<User, 'id' | 'firstName' | 'lastName' | 'phone'>;

// Type pour Ad avec toutes les relations
type AdWithRelations = Ad & {
  category: AdCategory;
  subCategory?: AdSubCategory;
  files?: AdFile[];
  variantValues?: AdVariantValueWithRelation[];
  user?: AdUser;
};

export const AdMapper = {
  /**
   * Convertit une Category en AdCategoryDto
   */
  toCategoryDto(category: AdCategory): AdCategoryDto {
    return {
      id: category.id,
      name: category.name as unknown as I18nText,
      slug: category.slug,
    };
  },

  /**
   * Convertit une SubCategory en AdSubCategoryDto
   */
  toSubCategoryDto(subCategory: AdSubCategory): AdSubCategoryDto | null {
    if (!subCategory) return null;
    return {
      id: subCategory.id,
      name: subCategory.name as unknown as I18nText,
      slug: subCategory.slug,
    };
  },

  /**
   * Convertit un File en AdFileDto
   */
  toFileDto(file: AdFile): AdFileDto {
    return {
      id: file.id,
      filename: file.filename,
      originalName: file.originalName,
      mimeType: file.mimeType,
      path: file.path,
      type: file.type,
      isDefault: file.isDefault,
    };
  },

  /**
   * Convertit un VariantValue en AdVariantValueResponseDto
   */
  toVariantValueDto(variantValue: AdVariantValueWithRelation): AdVariantValueResponseDto {
    return {
      id: variantValue.id,
      variantId: variantValue.variantId,
      value: variantValue.value,
      variant: {
        id: variantValue.variant.id,
        name: variantValue.variant.name as Record<string, string>,
        type: variantValue.variant.type,
        options: variantValue.variant.options,
        unit: variantValue.variant.unit,
      },
    };
  },

  /**
   * Convertit un User en AdSellerDto
   */
  toSellerDto(user: AdUser): AdSellerDto {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone ?? undefined,
    };
  },

  /**
   * Convertit une Ad en AdListItemDto (sans description pour alléger les listes)
   */
  toListItem(ad: AdWithRelations): AdListItemDto {
    return {
      id: ad.id,
      title: ad.title,
      price: ad.price,
      discountedPrice: ad.discountedPrice,
      quantity: ad.quantity,
      type: ad.type,
      status: ad.status,
      city: ad.city,
      viewCount: ad.viewCount,
      rejectionReason: ad.rejectionReason,
      createdAt: ad.createdAt,
      updatedAt: ad.updatedAt,
      category: this.toCategoryDto(ad.category),
      subCategory: this.toSubCategoryDto(ad.subCategory ?? null),
      files: ad.files?.map((f) => this.toFileDto(f)),
      seller: ad.user
        ? { firstName: ad.user.firstName, lastName: ad.user.lastName }
        : undefined,
    };
  },

  /**
   * Convertit une Ad en AdPublicResponseDto (avec description, sans location)
   */
  toPublic(ad: AdWithRelations): AdPublicResponseDto {
    return {
      ...this.toListItem(ad),
      description: ad.description,
      variantValues: ad.variantValues?.map((vv) => this.toVariantValueDto(vv)),
    };
  },

  /**
   * Convertit une Ad en AdFullResponseDto (avec location)
   */
  toFull(ad: AdWithRelations): AdFullResponseDto {
    return {
      ...this.toPublic(ad),
      location: ad.location,
      latitude: ad.latitude,
      longitude: ad.longitude,
      rejectionReason: ad.rejectionReason,
      validatedAt: ad.validatedAt,
      validatedById: ad.validatedById,
      userId: ad.userId,
      categoryId: ad.categoryId,
      subCategoryId: ad.subCategoryId,
      user: ad.user ? this.toSellerDto(ad.user) : undefined,
    };
  },

  /**
   * Convertit une liste d'Ads en AdListItemDto[] (sans description)
   */
  toList(ads: AdWithRelations[]): AdListItemDto[] {
    return ads.map((ad) => this.toListItem(ad));
  },
};
