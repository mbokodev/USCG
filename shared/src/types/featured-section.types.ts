import { I18nText, ICategory, ISubCategory } from './category.types';
import { IVariant } from './variant.types';
import { IAdListItem } from './ad.types';

/**
 * Types de filtres pour la sidebar d'une section
 */
export enum FilterType {
  NONE = 'NONE',
  CITY = 'CITY',
  SUBCATEGORY = 'SUBCATEGORY',
  VARIANT = 'VARIANT',
}

/**
 * Interface pour un filtre disponible
 */
export interface IFilter {
  value: string;
  label: string;
  count?: number;
}

/**
 * Interface pour une section mise en avant (FeaturedSection)
 */
export interface IFeaturedSection {
  id: string;
  title: I18nText;
  order: number;
  isActive: boolean;
  categoryId?: string | null;
  category?: ICategory | null;
  subCategoryId?: string | null;
  subCategory?: ISubCategory | null;
  filterType: FilterType;
  variantId?: string | null;
  variant?: IVariant | null;
  limit: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Section avec ses annonces et filtres (pour la homepage)
 */
export interface IFeaturedSectionWithAds {
  section: {
    id: string;
    title: I18nText;
    filterType: FilterType;
    limit: number;
    category?: ICategory | null;
    subCategory?: ISubCategory | null;
    variant?: IVariant | null;
  };
  filters: IFilter[];
  ads: IAdListItem[];
}

/**
 * Réponse paginée des sections
 */
export interface IFeaturedSectionsListResponse {
  data: IFeaturedSection[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
