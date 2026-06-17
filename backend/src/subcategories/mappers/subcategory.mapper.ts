/**
 * Mapper pour le module SubCategories
 */

import type { SubCategory, Category } from '@prisma/client';
import type { SubCategoryResponseDto, I18nText, CategoryInfoDto } from '../dto';

// Type pour SubCategory avec Category et _count
type SubCategoryWithRelations = SubCategory & {
  category?: Pick<Category, 'id' | 'name' | 'slug'>;
  _count?: {
    ads?: number;
  };
};

export const SubCategoryMapper = {
  /**
   * Convertit une SubCategory en SubCategoryResponseDto
   */
  toResponse(subCategory: SubCategoryWithRelations): SubCategoryResponseDto {
    return {
      id: subCategory.id,
      name: subCategory.name as unknown as I18nText,
      slug: subCategory.slug,
      description: subCategory.description as unknown as I18nText | null,
      categoryId: subCategory.categoryId,
      sortOrder: subCategory.sortOrder,
      isActive: subCategory.isActive,
      createdAt: subCategory.createdAt,
      updatedAt: subCategory.updatedAt,
      category: subCategory.category
        ? {
            id: subCategory.category.id,
            name: subCategory.category.name as unknown as I18nText,
            slug: subCategory.category.slug,
          }
        : undefined,
      _count: subCategory._count,
    };
  },

  /**
   * Convertit une liste de SubCategories
   */
  toResponseList(subCategories: SubCategoryWithRelations[]): SubCategoryResponseDto[] {
    return subCategories.map((sub) => this.toResponse(sub));
  },
};
