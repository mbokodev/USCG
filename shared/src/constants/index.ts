/**
 * API Configuration
 */
export const API_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

/**
 * File upload limits
 */
export const FILE_LIMITS = {
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5 MB
  MAX_DOCUMENT_SIZE: 10 * 1024 * 1024, // 10 MB
  MAX_IMAGES_PER_AD: 5,
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  ALLOWED_DOCUMENT_TYPES: ["application/pdf"],
} as const;

/**
 * Token expiration times (in seconds)
 */
export const TOKEN_EXPIRY = {
  ACCESS_TOKEN: 300, // 5 minutes
  REFRESH_TOKEN: 60 * 60 * 24 * 7, // 7 days
} as const;

/**
 * Currency
 */
export const CURRENCY = {
  CODE: "XAF",
  SYMBOL: "FCFA",
  LOCALE: "fr-CF",
} as const;
