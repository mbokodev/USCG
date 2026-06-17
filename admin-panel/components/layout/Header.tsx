"use client";

import { Menu, LogOut, Globe, User } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { UserRole } from "@uscg/shared";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/hooks/useAuth";
import { useRouter, usePathname } from "@/i18n/routing";

export function Header() {
  const t = useTranslations("nav");
  const { toggleSidebar } = useSidebar();
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const handleLogout = async () => {
    await logout();
  };

  const toggleLocale = () => {
    const newLocale = locale === "fr" ? "en" : "fr";
    router.replace(pathname, { locale: newLocale });
  };

  const getRoleLabel = () => {
    if (!user) return "";
    if (user.role === UserRole.SUPER_ADMIN) return "Admin";
    if (user.role === UserRole.OPERATOR) return "Operateur";
    if (user.isSeller) return "Vendeur";
    return "Acheteur";
  };

  return (
    <header className="h-16 px-4 lg:px-6 flex items-center justify-between bg-white border-b border-neutral-200 flex-shrink-0">
      {/* Left side */}
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-neutral-100 lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5 text-neutral-600" />
        </button>

        {/* Title */}
        <h1 className="text-lg font-medium text-primary hidden sm:block">
          {t("adminPanel")}
        </h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Language toggle */}
        <button
          onClick={toggleLocale}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-100 text-neutral-600"
          aria-label="Toggle language"
        >
          <Globe className="w-4 h-4" />
          <span className="text-sm font-medium uppercase">{locale}</span>
        </button>

        {/* User info */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-100 cursor-pointer">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-neutral-700">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-neutral-500">{getRoleLabel()}</p>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-error"
          aria-label={t("logout")}
          title={t("logout")}
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
