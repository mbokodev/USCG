"use client";

import { useTranslations } from "next-intl";
import { Link, Package, FileText } from "lucide-react";
import { AdAutocomplete } from "@/components/ui";
import { bannersService } from "../services";

// Predefined pages
const FIXED_PAGES = [
  { labelKey: "pages.allAds", value: "/ads", icon: Package },
  { labelKey: "pages.categories", value: "/categories", icon: FileText },
  { labelKey: "pages.about", value: "/about", icon: FileText },
  { labelKey: "pages.contact", value: "/contact", icon: FileText },
] as const;

import type { LinkType } from "../types";

interface LinkSelectorProps {
  linkType: LinkType;
  productId: string;
  productTitle?: string;
  pageLink: string;
  onLinkTypeChange: (type: LinkType) => void;
  onProductChange: (productId: string, productTitle: string) => void;
  onPageChange: (link: string) => void;
  error?: string;
}

export function LinkSelector({
  linkType,
  productId,
  productTitle,
  pageLink,
  onLinkTypeChange,
  onProductChange,
  onPageChange,
  error,
}: LinkSelectorProps) {
  const t = useTranslations("banners.form");

  return (
    <div className="space-y-4">
      {/* Link type selector */}
      <div className="flex gap-4">
        <label
          className={`flex-1 flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
            linkType === "product"
              ? "border-primary bg-primary/5"
              : "border-neutral-200 hover:border-neutral-300"
          }`}
        >
          <input
            type="radio"
            name="linkType"
            value="product"
            checked={linkType === "product"}
            onChange={() => onLinkTypeChange("product")}
            className="sr-only"
          />
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              linkType === "product"
                ? "border-primary"
                : "border-neutral-300"
            }`}
          >
            {linkType === "product" && (
              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            )}
          </div>
          <Package className={`w-5 h-5 ${linkType === "product" ? "text-primary" : "text-neutral-500"}`} />
          <span className={`font-medium ${linkType === "product" ? "text-primary" : "text-neutral-700"}`}>
            {t("linkTypeAds")}
          </span>
        </label>

        <label
          className={`flex-1 flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
            linkType === "page"
              ? "border-primary bg-primary/5"
              : "border-neutral-200 hover:border-neutral-300"
          }`}
        >
          <input
            type="radio"
            name="linkType"
            value="page"
            checked={linkType === "page"}
            onChange={() => onLinkTypeChange("page")}
            className="sr-only"
          />
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              linkType === "page"
                ? "border-primary"
                : "border-neutral-300"
            }`}
          >
            {linkType === "page" && (
              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            )}
          </div>
          <Link className={`w-5 h-5 ${linkType === "page" ? "text-primary" : "text-neutral-500"}`} />
          <span className={`font-medium ${linkType === "page" ? "text-primary" : "text-neutral-700"}`}>
            {t("linkTypePage")}
          </span>
        </label>
      </div>

      {/* Product autocomplete */}
      {linkType === "product" && (
        <AdAutocomplete
          value={productId}
          selectedTitle={productTitle}
          onChange={onProductChange}
          onClear={() => onProductChange("", "")}
          searchFn={bannersService.searchAds}
          placeholder={t("selectProduct")}
          noResultsText={t("noProductFound")}
          error={error}
        />
      )}

      {/* Page selector */}
      {linkType === "page" && (
        <div className="space-y-2">
          <select
            value={pageLink}
            onChange={(e) => onPageChange(e.target.value)}
            className={`w-full px-4 py-2.5 border-2 rounded-xl bg-white transition-colors ${
              error
                ? "border-red-300 focus:border-red-400"
                : "border-neutral-200 focus:border-primary"
            } focus:outline-none`}
          >
            <option value="">{t("selectPage")}</option>
            {FIXED_PAGES.map((page) => (
              <option key={page.value} value={page.value}>
                {t(page.labelKey)}
              </option>
            ))}
          </select>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      )}
    </div>
  );
}
