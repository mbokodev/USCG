import type { IAdListItem } from "@uscg/shared/types";

/**
 * Product model for marketplace
 * Extends IAdListItem with optional marketplace-specific fields
 */
interface Product extends IAdListItem {
  slug?: string; // For URL routing (defaults to id)
  rating?: number; // Future: product rating
  discount?: number; // Calculated discount percentage
  // Legacy fields for backward compatibility with mock data
  thumbnail?: string;
  images?: string[];
  salePrice?: number | null;
}

export default Product;
