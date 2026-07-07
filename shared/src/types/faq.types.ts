/**
 * FAQ types for FAQ management
 */

import { I18nContent, TiptapContent } from './static-page.types';

// ============================================
// FAQ Category
// ============================================

export interface IFaqCategory {
  id: string;
  name: I18nContent<string>;
  slug: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateFaqCategoryDto {
  name: string; // Single language - auto-translated
  slug?: string; // Auto-generated if not provided
  order?: number;
  sourceLang?: 'fr' | 'en';
}

export interface IUpdateFaqCategoryDto {
  name?: string; // Single language
  slug?: string;
  order?: number;
  isActive?: boolean;
  sourceLang?: 'fr' | 'en';
}

// ============================================
// FAQ Item
// ============================================

export interface IFaq {
  id: string;
  categoryId: string;
  category?: IFaqCategory;
  question: I18nContent<string>;
  answer: I18nContent<TiptapContent>;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IFaqListItem {
  id: string;
  categoryId: string;
  category?: IFaqCategory;
  question: I18nContent<string>;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export interface ICreateFaqDto {
  categoryId: string;
  question: string; // Single language - auto-translated
  answer: TiptapContent; // Single language - auto-translated
  order?: number;
  sourceLang?: 'fr' | 'en';
}

export interface IUpdateFaqDto {
  categoryId?: string;
  question?: string; // Single language
  answer?: TiptapContent; // Single language
  order?: number;
  isActive?: boolean;
  sourceLang?: 'fr' | 'en';
}

// ============================================
// Grouped FAQs (for public display)
// ============================================

export interface IFaqGrouped {
  category: IFaqCategory;
  faqs: IFaq[];
}

// ============================================
// Query params
// ============================================

export interface IFaqQueryParams {
  categoryId?: string;
  isActive?: boolean;
}

export interface IFaqCategoryQueryParams {
  isActive?: boolean;
}
