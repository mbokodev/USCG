/**
 * Static Page types for Terms, About, Contact
 */

/**
 * TiptapContent structure
 */
export interface TiptapContent {
  type: string;
  content?: unknown[];
}

/**
 * I18n content structure for static pages
 */
export interface I18nContent<T = TiptapContent> {
  fr: T;
  en: T;
}

// ============================================
// Terms Page
// ============================================

export interface ITermsPage {
  id: string;
  content: I18nContent<TiptapContent>;
  updatedAt: string;
}

export interface IUpdateTermsDto {
  sourceLang?: 'fr' | 'en'; // Source language
  content: TiptapContent; // Single language content
}

// ============================================
// Privacy Page
// ============================================

export interface IPrivacyPage {
  id: string;
  content: I18nContent<TiptapContent>;
  updatedAt: string;
}

export interface IUpdatePrivacyDto {
  sourceLang?: 'fr' | 'en'; // Source language
  content: TiptapContent; // Single language content
}

// ============================================
// About Page
// ============================================

/**
 * Value card for About page
 */
export interface IAboutValue {
  icon: string; // Lucide icon name
  titleFr: string;
  titleEn: string;
  descFr: string;
  descEn: string;
}

/**
 * Team member for About page
 */
export interface IAboutTeamMember {
  name: string;
  role: string;
  photoUrl?: string;
}

export interface IAboutPage {
  id: string;
  introduction: I18nContent<TiptapContent>;
  mission: I18nContent<TiptapContent>;
  vision: I18nContent<TiptapContent>;
  values: IAboutValue[];
  team?: IAboutTeamMember[];
  updatedAt: string;
}

/**
 * Value input for creating/updating About page
 * Single language - API auto-translates on CREATE
 */
export interface IAboutValueInput {
  icon: string;
  title: string; // Single language
  description: string; // Single language
}

export interface IUpdateAboutDto {
  sourceLang?: 'fr' | 'en'; // Source language for auto-translation
  introduction?: TiptapContent;
  mission?: TiptapContent;
  vision?: TiptapContent;
  values?: IAboutValueInput[];
  team?: IAboutTeamMember[];
}
