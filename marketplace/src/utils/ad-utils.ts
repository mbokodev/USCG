import type { IAdListItem, IAdFile } from "@uscg/shared/types";
import Product from "@models/product.model";

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/**
 * Build file URL from file object (server-side only)
 */
export function buildFileUrl(file: IAdFile): string {
  let folder = "images";
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
export function getDefaultFile(files?: IAdFile[]): IAdFile | undefined {
  if (!files || files.length === 0) return undefined;
  return files.find((f) => f.isDefault) || files[0];
}

/**
 * Map backend ad to Product model used by marketplace components
 */
export function mapAdToProduct(ad: IAdListItem): Product {
  const defaultFile = getDefaultFile(ad.files);
  const thumbnail = defaultFile ? buildFileUrl(defaultFile) : "";
  const images = ad.files?.map((f) => buildFileUrl(f)) || [];

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
