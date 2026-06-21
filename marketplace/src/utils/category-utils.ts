import type { ICategory, ISubCategory } from "@uscg/shared/types";

/**
 * Navigation item structure expected by CategoryDropdown
 */
export interface NavigationItem {
  id: string;
  title: string;
  href: string;
  icon?: string;
  menuComponent: "MegaMenu1" | "MegaMenu2";
  menuData?: SubCategoryItem[];
}

export interface SubCategoryItem {
  title: string;
  href: string;
  icon?: string;
}

/**
 * Category option for search dropdown
 */
export interface CategoryOption {
  id?: string;
  label: string;
  slug: string;
}

/**
 * Transform API categories to navigation format
 */
export function categoriesToNavigation(
  categories: ICategory[],
  locale: "fr" | "en" = "fr"
): NavigationItem[] {
  return categories.map((category) => ({
    id: category.id,
    title: category.name[locale] || category.name.fr,
    href: `/categories/${category.slug}`,
    icon: category.icon || undefined,
    menuComponent: "MegaMenu2" as const,
    menuData: category.subCategories?.map((sub) =>
      subCategoryToNavItem(sub, category.slug, locale)
    ),
  }));
}

function subCategoryToNavItem(
  subCategory: ISubCategory,
  categorySlug: string,
  locale: "fr" | "en"
): SubCategoryItem {
  return {
    title: subCategory.name[locale] || subCategory.name.fr,
    href: `/categories/${categorySlug}/${subCategory.slug}`,
  };
}

/**
 * Convert NavigationItem array to CategoryOption array for search dropdown
 */
export function navigationToCategoryOptions(
  items: NavigationItem[]
): CategoryOption[] {
  return items.map((item) => ({
    id: item.id,
    label: item.title,
    slug: item.href.replace("/categories/", ""),
  }));
}
