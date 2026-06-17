"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { getSidebarByRole, type SidebarItem, type SidebarGroup } from "@/config/sidebar";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/hooks/useAuth";

export function SidebarContent() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const locale = useLocale();
  const { closeSidebar } = useSidebar();
  const { user } = useAuth();

  // Remove locale prefix from pathname for comparison
  const pathnameWithoutLocale = pathname.replace(`/${locale}`, "") || "/";

  // Get sidebar config based on user role
  const sidebarConfig = user
    ? getSidebarByRole(user.role, user.isSeller)
    : { type: "flat" as const, items: [] };

  // Render a single sidebar item
  const renderItem = (item: SidebarItem) => {
    const isActive = pathnameWithoutLocale === item.path;
    const Icon = item.icon;

    return (
      <li className="relative" key={item.path}>
        <Link
          href={item.path}
          onClick={closeSidebar}
          className={`
            px-6 py-3 inline-flex items-center w-full text-sm font-medium
            transition-colors duration-150 hover:text-primary hover:bg-primary/5
            ${isActive ? "text-primary bg-primary/5" : ""}
          `}
        >
          {isActive && (
            <span
              className="absolute inset-y-0 left-0 w-1 bg-primary rounded-tr-lg rounded-br-lg"
              aria-hidden="true"
            />
          )}
          <Icon className="w-5 h-5" aria-hidden="true" />
          <span className="ml-4">{t(item.name)}</span>
        </Link>
      </li>
    );
  };

  // Render grouped sidebar (for SUPER_ADMIN)
  const renderGrouped = (groups: SidebarGroup[]) => (
    <nav className="flex-1 overflow-y-auto">
      {groups.map((group) => (
        <div key={group.name} className="mb-2">
          {/* Section title */}
          <p className="px-6 py-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            {t(`groups.${group.name}`)}
          </p>

          {/* Section items */}
          <ul>
            {group.items.map(renderItem)}
          </ul>
        </div>
      ))}
    </nav>
  );

  // Render flat sidebar (for OPERATOR, SELLER)
  const renderFlat = (items: SidebarItem[]) => (
    <nav className="flex-1 overflow-y-auto">
      <ul>
        {items.map(renderItem)}
      </ul>
    </nav>
  );

  return (
    <div className="py-4 text-neutral-600 h-full flex flex-col">
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center px-4 py-2 mb-4"
        onClick={closeSidebar}
      >
        <Image
          src="/images/logo.png"
          alt="USCG Logo"
          width={220}
          height={70}
          className="h-16 w-auto object-contain"
          priority
        />
      </Link>

      {/* Navigation - Render based on config type */}
      {sidebarConfig.type === "grouped"
        ? renderGrouped(sidebarConfig.groups)
        : renderFlat(sidebarConfig.items)}

      {/* Footer */}
      <div className="px-6 py-4 border-t border-neutral-200">
        <p className="text-xs text-neutral-400">{t("version")}</p>
      </div>
    </div>
  );
}
