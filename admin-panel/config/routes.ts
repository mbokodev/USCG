/**
 * Centralized route definitions for the admin panel.
 * Routes are organized by feature/resource, not by user role.
 * Access control is handled by middleware, not by URL structure.
 */

export const ROUTES = {
  // Auth
  AUTH: {
    LOGIN: "/login",
    CHANGE_PASSWORD: "/change-password",
  },

  // Dashboard (tous les rôles authentifiés)
  DASHBOARD: "/dashboard",

  // SELLER routes - Mes annonces (isSeller = true)
  MY_ADS: {
    LIST: "/my-ads",
    NEW: "/my-ads/new",
    EDIT: (id: string) => `/my-ads/${id}/edit` as const,
  },

  // User account (SELLER: profile, settings...)
  USER: {
    PROFILE: "/user/profile",
    // SETTINGS: "/user/settings", // Phase 2+
  },

  // Catalog - Annonces (ADMIN/OPERATOR)
  ADS: {
    LIST: "/ads",
    NEW: "/ads/new",
    DETAIL: (id: string) => `/ads/${id}` as const,
    EDIT: (id: string) => `/ads/${id}/edit` as const,
  },

  // Catalog - Variantes (ADMIN)
  VARIANTS: "/variants",

  // Catalog - Categories (ADMIN)
  CATEGORIES: "/categories",

  // Catalog - Subcategories (ADMIN)
  SUBCATEGORIES: "/subcategories",

  // Store - Banners (ADMIN)
  BANNERS: {
    LIST: "/banners",
    NEW: "/banners/new",
    EDIT: (id: string) => `/banners/${id}/edit` as const,
  },

  // Store - Flash Deals (ADMIN)
  FLASH_DEALS: "/flash-deals",

  // Store - Featured Sections (ADMIN)
  FEATURED_SECTIONS: {
    LIST: "/featured-sections",
    NEW: "/featured-sections/new",
    EDIT: (id: string) => `/featured-sections/${id}` as const,
  },

  // Store - Static Pages (ADMIN)
  STATIC_PAGES: {
    LIST: "/static-pages",
    TERMS: "/static-pages/terms",
    PRIVACY: "/static-pages/privacy",
    ABOUT: "/static-pages/about",
  },

  // Sales - Orders (Phase 3 placeholder)
  ORDERS: "/orders",

  // Sales - Customers (tous les users + seller requests)
  CUSTOMERS: "/customers",

  // Seller Requests (ADMIN/OPERATOR)
  SELLER_REQUESTS: {
    LIST: "/seller-requests",
    DETAIL: (id: string) => `/seller-requests/${id}` as const,
  },

  // Staff Management (ADMIN/SUPER_ADMIN)
  STAFF: "/staff",
} as const;

// Type-safe route helper
export type AppRoutes = typeof ROUTES;
