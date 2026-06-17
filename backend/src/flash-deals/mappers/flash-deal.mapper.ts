/**
 * Mapper pour le module FlashDeals
 */

import type { FlashDeal, Ad, Category, File } from '@prisma/client';
import type {
  FlashDealResponseDto,
  FlashDealListItemDto,
  FlashDealAdDto,
  FlashDealCategoryDto,
} from '../dto';

// Types pour les relations
type FlashDealCategory = Pick<Category, 'id' | 'name' | 'slug'>;
type FlashDealFile = Pick<File, 'id' | 'path' | 'isDefault'>;

type FlashDealAd = Pick<Ad, 'id' | 'title' | 'price' | 'discountedPrice' | 'city'> & {
  category?: FlashDealCategory;
  files?: FlashDealFile[];
};

type FlashDealWithRelations = FlashDeal & {
  ad: FlashDealAd;
};

export const FlashDealMapper = {
  /**
   * Convertit une Category en FlashDealCategoryDto
   */
  toCategoryDto(category: FlashDealCategory): FlashDealCategoryDto {
    return {
      id: category.id,
      name: category.name as Record<string, string>,
      slug: category.slug,
    };
  },

  /**
   * Extrait le thumbnail depuis les fichiers de l'annonce
   */
  getThumbnail(files?: FlashDealFile[]): string | null {
    if (!files || files.length === 0) return null;
    // Priorité aux images marquées par défaut
    const defaultFile = files.find((f) => f.isDefault);
    return (defaultFile || files[0]).path;
  },

  /**
   * Convertit une Ad en FlashDealAdDto
   */
  toAdDto(ad: FlashDealAd): FlashDealAdDto {
    return {
      id: ad.id,
      title: ad.title,
      price: ad.price,
      discountedPrice: ad.discountedPrice as number, // Non null pour flash deals
      thumbnail: this.getThumbnail(ad.files),
      city: ad.city,
      category: ad.category ? this.toCategoryDto(ad.category) : undefined,
    };
  },

  /**
   * Convertit un FlashDeal en FlashDealResponseDto (full)
   */
  toResponse(flashDeal: FlashDealWithRelations): FlashDealResponseDto {
    return {
      id: flashDeal.id,
      adId: flashDeal.adId,
      startDate: flashDeal.startDate,
      endDate: flashDeal.endDate,
      isActive: flashDeal.isActive,
      order: flashDeal.order,
      createdAt: flashDeal.createdAt,
      updatedAt: flashDeal.updatedAt,
      ad: this.toAdDto(flashDeal.ad),
    };
  },

  /**
   * Convertit un FlashDeal en FlashDealListItemDto (leger)
   */
  toListItem(flashDeal: FlashDealWithRelations): FlashDealListItemDto {
    return {
      id: flashDeal.id,
      adId: flashDeal.adId,
      startDate: flashDeal.startDate,
      endDate: flashDeal.endDate,
      isActive: flashDeal.isActive,
      order: flashDeal.order,
      ad: this.toAdDto(flashDeal.ad),
    };
  },

  /**
   * Convertit une liste de FlashDeals en FlashDealListItemDto[]
   */
  toList(flashDeals: FlashDealWithRelations[]): FlashDealListItemDto[] {
    return flashDeals.map((fd) => this.toListItem(fd));
  },
};
