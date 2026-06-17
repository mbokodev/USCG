import { icons } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Get all icon names from lucide-react icons object (sorted alphabetically)
export const LUCIDE_ICON_NAMES: string[] = Object.keys(icons).sort((a, b) =>
  a.toLowerCase().localeCompare(b.toLowerCase())
);

// Get icon component by name
export function getIconByName(name: string): LucideIcon | null {
  const icon = icons[name as keyof typeof icons];
  if (icon) {
    return icon as LucideIcon;
  }
  return null;
}

// Search icons by name (case-insensitive)
export function searchIcons(query: string, limit: number = 20): string[] {
  if (!query.trim()) {
    // Return popular icons when no query
    return POPULAR_ICONS.slice(0, limit);
  }

  const lowerQuery = query.toLowerCase();
  const results: string[] = [];

  // First: exact start match
  for (const name of LUCIDE_ICON_NAMES) {
    if (name.toLowerCase().startsWith(lowerQuery)) {
      results.push(name);
      if (results.length >= limit) break;
    }
  }

  // Second: contains match (if we need more results)
  if (results.length < limit) {
    for (const name of LUCIDE_ICON_NAMES) {
      if (
        !results.includes(name) &&
        name.toLowerCase().includes(lowerQuery)
      ) {
        results.push(name);
        if (results.length >= limit) break;
      }
    }
  }

  return results;
}

// Popular/common icons for empty state
export const POPULAR_ICONS = [
  "Home",
  "ShoppingCart",
  "Package",
  "Briefcase",
  "Building",
  "Car",
  "Laptop",
  "Smartphone",
  "Shirt",
  "Sofa",
  "Utensils",
  "Heart",
  "Star",
  "Tag",
  "MapPin",
  "Grid",
  "List",
  "Settings",
  "User",
  "Search",
];
