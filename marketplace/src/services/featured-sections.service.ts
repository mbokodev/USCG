import api from "@/lib/api";
import type { IFeaturedSectionWithAds, IFilter, IAdListItem } from "@uscg/shared/types";
import Product from "@models/product.model";
import { mapAdToProduct } from "@/utils/ad-utils";

/**
 * Fetch all active featured sections with their ads (for homepage)
 * Backend returns: Array<{ section, filters, ads }>
 */
export async function getFeaturedSectionsWithAds(): Promise<
  Array<{
    section: IFeaturedSectionWithAds["section"];
    filters: IFilter[];
    products: Product[];
  }>
> {
  const response = await api.get<IFeaturedSectionWithAds[]>("/featured-sections");

  return response.data.map((item) => ({
    section: item.section,
    filters: item.filters,
    products: item.ads.map(mapAdToProduct),
  }));
}

/**
 * Fetch ads for a specific section with optional filter
 */
export async function getSectionAds(
  sectionId: string,
  filterValue?: string
): Promise<{
  section: IFeaturedSectionWithAds["section"];
  filters: IFilter[];
  products: Product[];
}> {
  const params = filterValue ? { filter: filterValue } : {};
  const response = await api.get<{
    section: IFeaturedSectionWithAds["section"];
    filters: IFilter[];
    ads: IAdListItem[];
  }>(`/featured-sections/${sectionId}/ads`, { params });

  return {
    section: response.data.section,
    filters: response.data.filters,
    products: response.data.ads.map(mapAdToProduct),
  };
}

export const featuredSectionsService = {
  getFeaturedSectionsWithAds,
  getSectionAds,
};
