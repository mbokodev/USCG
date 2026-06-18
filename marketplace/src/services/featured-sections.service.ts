import api from "@/lib/api";
import type {
  IFeaturedSectionWithAds,
  IFilter,
  IAdListItem,
  IAdFile,
} from "@uscg/shared/types";
import Product from "@models/product.model";

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/**
 * Build file URL from file object
 */
function buildFileUrl(file: IAdFile): string {
  // Determine folder from path, type, or mimeType
  let folder = "images"; // default to images
  if (file.path?.startsWith("documents")) {
    folder = "documents";
  } else if (file.type === "DOCUMENT") {
    folder = "documents";
  } else if (file.mimeType?.startsWith("application/")) {
    folder = "documents";
  }
  return `${API_URL}/api/files/${folder}/${file.filename}`;
}

/**
 * Get default file from files array
 */
function getDefaultFile(files?: IAdFile[]): IAdFile | undefined {
  if (!files || files.length === 0) return undefined;
  return files.find((f) => f.isDefault) || files[0];
}

/**
 * Map backend ad to Product model used by marketplace components
 */
function mapAdToProduct(ad: IAdListItem): Product {
  // Build image URLs server-side
  const defaultFile = getDefaultFile(ad.files);
  const thumbnail = defaultFile ? buildFileUrl(defaultFile) : "";
  const images = ad.files?.map((f) => buildFileUrl(f)) || [];

  // Calculate discount percentage
  const discount =
    ad.discountedPrice && ad.price
      ? Math.round(((ad.price - ad.discountedPrice) / ad.price) * 100)
      : 0;

  return {
    ...ad,
    slug: ad.id,
    thumbnail,
    images,
    discount,
    rating: 5,
  };
}

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
