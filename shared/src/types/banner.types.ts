/**
 * Banner types for carousel management
 */

// ============================================
// Banner interface
// ============================================

export interface IBanner {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  buttonText: string | null;
  buttonLink: string | null;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// DTOs
// ============================================

export interface ICreateBannerDto {
  title: string;
  description?: string;
  imageUrl: string;
  buttonText?: string;
  buttonLink?: string;
  isActive?: boolean;
  order?: number;
}

export interface IUpdateBannerDto {
  title?: string;
  description?: string;
  imageUrl?: string;
  buttonText?: string;
  buttonLink?: string;
  isActive?: boolean;
  order?: number;
}
