/**
 * Mapper pour le module Categories
 */

import type { Category, SubCategory, Prisma } from '@prisma/client';
import type { CategoryResponseDto, SubCategoryResponseDto, I18nText } from '../dto';

// Type pour Category avec sous-catégories
type CategoryWithSubs = Category & {
  subCategories?: SubCategory[];
  _count?: {
    subCategories?: number;
  };
};

export const CategoryMapper = {
  /**
   * Convertit une SubCategory en SubCategoryResponseDto
   */
  toSubCategoryResponse(subCategory: SubCategory): SubCategoryResponseDto {
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
    };
  },

  /**
   * Convertit une Category en CategoryResponseDto
   */
  toResponse(category: CategoryWithSubs): CategoryResponseDto {
    return {
      id: category.id,
      name: category.name as unknown as I18nText,
      slug: category.slug,
      description: category.description as unknown as I18nText | null,
      icon: category.icon,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      subCategories: category.subCategories?.map((sub) =>
        this.toSubCategoryResponse(sub),
      ),
      _count: category._count,
    };
  },

  /**
   * Convertit une liste de Categories
   */
  toResponseList(categories: CategoryWithSubs[]): CategoryResponseDto[] {
    return categories.map((category) => this.toResponse(category));
  },
};
