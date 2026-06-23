import {
  LayoutDashboard,
  Package,
  User,
  FolderTree,
  Layers,
  ShoppingCart,
  Users,
  UserPlus,
  Image,
  Zap,
  LayoutGrid,
  FileText,
  type LucideIcon,
} from "lucide-react";
import { UserRole } from "@uscg/shared";
import { ROUTES } from "./routes";

export interface SidebarItem {
  path: string;
  icon: LucideIcon;
  name: string;
}

export interface SidebarGroup {
  name: string; // i18n key for group name
  items: SidebarItem[];
}

// SELLER sidebar (isSeller = true) - Structure plate
export const sellerSidebar: SidebarItem[] = [
  { path: ROUTES.DASHBOARD, icon: LayoutDashboard, name: "dashboard" },
  { path: ROUTES.MY_ADS.LIST, icon: Package, name: "myAds" },
  { path: ROUTES.USER.PROFILE, icon: User, name: "profile" },
];

// OPERATOR sidebar - Structure plate
export const operatorSidebar: SidebarItem[] = [
  { path: ROUTES.DASHBOARD, icon: LayoutDashboard, name: "dashboard" },
  { path: ROUTES.ADS.LIST, icon: Package, name: "ads" },
  { path: ROUTES.SELLER_REQUESTS.LIST, icon: UserPlus, name: "sellerRequests" },
  { path: ROUTES.CUSTOMERS, icon: Users, name: "customers" },
];

// SUPER_ADMIN sidebar - Structure groupée
export const adminSidebarGroups: SidebarGroup[] = [
  {
    name: "general",
    items: [
      { path: ROUTES.DASHBOARD, icon: LayoutDashboard, name: "dashboard" },
    ],
  },
  {
    name: "catalog",
    items: [
      { path: ROUTES.ADS.LIST, icon: Package, name: "ads" },
      { path: ROUTES.CATEGORIES, icon: FolderTree, name: "categories" },
      { path: ROUTES.VARIANTS, icon: Layers, name: "variants" },
    ],
  },
  {
    name: "users",
    items: [
      { path: ROUTES.CUSTOMERS, icon: Users, name: "customers" },
      { path: ROUTES.SELLER_REQUESTS.LIST, icon: UserPlus, name: "sellerRequests" },
    ],
  },
  {
    name: "store",
    items: [
      { path: ROUTES.BANNERS.LIST, icon: Image, name: "banners" },
      { path: ROUTES.FLASH_DEALS, icon: Zap, name: "flashDeals" },
      { path: ROUTES.FEATURED_SECTIONS.LIST, icon: LayoutGrid, name: "featuredSections" },
      { path: ROUTES.STATIC_PAGES.LIST, icon: FileText, name: "staticPages" },
    ],
  },
  {
    name: "sales",
    items: [
      { path: ROUTES.ORDERS, icon: ShoppingCart, name: "orders" },
    ],
  },
];

// Helper to flatten groups to items (for backwards compatibility)
export function flattenGroups(groups: SidebarGroup[]): SidebarItem[] {
  return groups.flatMap((group) => group.items);
}

// Get sidebar config by role
export function getSidebarByRole(
  role: UserRole,
  isSeller: boolean
): { type: "flat"; items: SidebarItem[] } | { type: "grouped"; groups: SidebarGroup[] } {
  if (role === UserRole.SUPER_ADMIN) {
    return { type: "grouped", groups: adminSidebarGroups };
  }
  if (role === UserRole.OPERATOR) {
    return { type: "flat", items: operatorSidebar };
  }
  if (isSeller) {
    return { type: "flat", items: sellerSidebar };
  }
  return { type: "flat", items: [] };
}
