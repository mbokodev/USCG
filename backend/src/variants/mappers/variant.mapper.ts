/**
 * Mapper pour le module Variants
 */

import type { Variant, Category, SubCategory } from '@prisma/client';
import type { VariantResponseDto, I18nText } from '../dto';

// Type pour Variant avec relations
type VariantWithRelations = Variant & {
  category?: Pick<Category, 'id' | 'name' | 'slug'> | null;
  subCategory?: Pick<SubCategory, 'id' | 'name' | 'slug'> | null;
};

export const VariantMapper = {
  /**
   * Convertit un Variant en VariantResponseDto
   */
  toResponse(variant: VariantWithRelations): VariantResponseDto {
    return {
      id: variant.id,
      categoryId: variant.categoryId,
      subCategoryId: variant.subCategoryId,
      name: variant.name as Record<string, string>,
      description: variant.description as Record<string, string> | null,
      type: variant.type,
      options: variant.options,
      unit: variant.unit,
      allowCustomValue: variant.allowCustomValue,
      isRequired: variant.isRequired,
      isFilterable: variant.isFilterable,
      isActive: variant.isActive,
      displayOrder: variant.displayOrder,
      createdAt: variant.createdAt,
      updatedAt: variant.updatedAt,
      category: variant.category
        ? {
            id: variant.category.id,
            name: variant.category.name as unknown as I18nText,
            slug: variant.category.slug,
          }
        : undefined,
      subCategory: variant.subCategory
        ? {
            id: variant.subCategory.id,
            name: variant.subCategory.name as unknown as I18nText,
            slug: variant.subCategory.slug,
          }
        : undefined,
    };
  },

  /**
   * Convertit une liste de Variants
   */
  toResponseList(variants: VariantWithRelations[]): VariantResponseDto[] {
    return variants.map((variant) => this.toResponse(variant));
  },
};
