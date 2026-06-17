/**
 * Shared types for USCG marketplace
 * Used by both admin-panel and marketplace
 */

// ============================================
// User types & enums
// ============================================
export {
  UserRole,
  type IUser,
  type IAuthUser,
  type IUserProfile,
  type IUserListItem,
  type ISellerRequestUser,
  type IUserQueryParams,
  type ICreateOperatorDto,
  type IUpdateProfileDto,
} from "./user.types";

// ============================================
// Auth types
// ============================================
export {
  type IRegisterDto,
  type ILoginDto,
  type ILoginResponse,
  type IRefreshResponse,
  type IMessageResponse,
} from "./auth.types";

// ============================================
// Category types
// ============================================
export {
  type I18nText,
  type ICategory,
  type ICategoryListItem,
  type ICategoryInfo,
  type ISubCategory,
  type ISubCategoryListItem,
  type ISubCategoryInfo,
  type ICreateCategoryDto,
  type IUpdateCategoryDto,
  type ICreateSubCategoryDto,
  type IUpdateSubCategoryDto,
  type ICategoryQueryParams,
  type ISubCategoryQueryParams,
} from "./category.types";

// ============================================
// Variant types & enums
// ============================================
export {
  VariantType,
  type IVariantOption,
  type IVariant,
  type IVariantListItem,
  type IVariantFormInfo,
  type ICreateVariantDto,
  type IUpdateVariantDto,
  type IVariantQueryParams,
  type IVariantValue,
} from "./variant.types";

// ============================================
// Ad types & enums
// ============================================
export {
  AdStatus,
  AdType,
  type IAdCategory,
  type IAdSubCategory,
  type IAdSeller,
  type IAdUser,
  type IAdFile,
  type IAdVariantValue,
  type IAd,
  type IAdListItem,
  type IAdPublic,
  type IAdFull,
  type ICreateAdDto,
  type IUpdateAdDto,
  type IValidateAdDto,
  type IAdQueryParams,
  type IAdStats,
} from "./ad.types";

// ============================================
// Seller request types & enums
// ============================================
export {
  SellerRequestStatus,
  type IBusinessLogo,
  type ISellerRequest,
  type ISellerRequestListItem,
  type ICreateSellerRequestDto,
  type IUpdateSellerRequestDto,
  type IValidateSellerRequestDto,
  type ISellerRequestQueryParams,
  type ISellerRequestStats,
} from "./seller-request.types";

// ============================================
// File types & enums
// ============================================
export { FileType, type IFile } from "./file.types";

// ============================================
// Banner types
// ============================================
export {
  type IBanner,
  type ICreateBannerDto,
  type IUpdateBannerDto,
} from "./banner.types";

// ============================================
// Flash Deal types
// ============================================
export {
  type IFlashDealAd,
  type IFlashDeal,
  type IFlashDealListItem,
  type ICreateFlashDealDto,
  type IUpdateFlashDealDto,
  type IFlashDealQueryParams,
} from "./flash-deal.types";

// ============================================
// API types (pagination, responses)
// ============================================
export {
  type ApiResponse,
  type PaginatedResponse,
  type PaginationMeta,
  type PaginationParams,
} from "./api.types";
