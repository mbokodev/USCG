"use client";

import { useTranslations, useLocale } from "next-intl";
import { LayoutGrid, Plus } from "lucide-react";
import {
  Badge,
  EmptyState,
  TableBodyLoading,
  EditDeleteButton,
  Button,
} from "@/components/ui";
import type { IFeaturedSection, FilterType } from "@uscg/shared/types";

interface FeaturedSectionTableProps {
  sections: IFeaturedSection[];
  isLoading: boolean;
  onEdit: (section: IFeaturedSection) => void;
  onDelete: (section: IFeaturedSection) => void;
  onAdd: () => void;
}

export function FeaturedSectionTable({
  sections,
  isLoading,
  onEdit,
  onDelete,
  onAdd,
}: FeaturedSectionTableProps) {
  const t = useTranslations("featuredSections");
  const tCommon = useTranslations("common");
  const locale = useLocale() as "fr" | "en";

  // Helper to get title in current locale
  const getTitle = (title: { fr: string; en: string }) => {
    return title[locale] || title.fr || "-";
  };

  // Helper to get source name (category or subcategory)
  const getSourceName = (section: IFeaturedSection) => {
    if (section.category) {
      const name = section.category.name as { fr: string; en: string };
      return name[locale] || name.fr || "-";
    }
    if (section.subCategory) {
      const name = section.subCategory.name as { fr: string; en: string };
      return name[locale] || name.fr || "-";
    }
    return "-";
  };

  // Helper to get filter type label
  const getFilterTypeLabel = (filterType: FilterType) => {
    switch (filterType) {
      case "NONE":
        return t("filterType.none");
      case "CITY":
        return t("filterType.city");
      case "SUBCATEGORY":
        return t("filterType.subcategory");
      case "VARIANT":
        return t("filterType.variant");
      default:
        return filterType;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 flex flex-col h-fit overflow-hidden">
      <div className="overflow-auto flex-1">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                {t("table.title")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                {t("table.source")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                {t("table.filter")}
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-neutral-500 uppercase">
                {t("table.limit")}
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-neutral-500 uppercase">
                {t("table.status")}
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {isLoading ? (
              <TableBodyLoading rows={3} columns={6} />
            ) : !sections || sections.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    title={t("empty.title")}
                    description={t("empty.description")}
                    icon={LayoutGrid}
                    action={
                      <Button onClick={onAdd}>
                        <Plus className="w-4 h-4 mr-2" />
                        {t("addNew")}
                      </Button>
                    }
                  />
                </td>
              </tr>
            ) : (
              sections.map((section) => (
                <tr key={section.id} className="hover:bg-neutral-50">
                  {/* Title */}
                  <td className="px-4 py-4">
                    <div className="font-medium text-neutral-900">
                      {getTitle(section.title as { fr: string; en: string })}
                    </div>
                  </td>

                  {/* Source */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Badge variant={section.categoryId ? "info" : "warning"}>
                        {section.categoryId ? t("sourceType.category") : t("sourceType.subcategory")}
                      </Badge>
                      <span className="text-sm text-neutral-600">
                        {getSourceName(section)}
                      </span>
                    </div>
                  </td>

                  {/* Filter type */}
                  <td className="px-4 py-4">
                    <span className="text-sm text-neutral-600">
                      {getFilterTypeLabel(section.filterType as FilterType)}
                    </span>
                  </td>

                  {/* Limit */}
                  <td className="px-4 py-4 text-center">
                    <span className="text-sm text-neutral-900">
                      {section.limit}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4 text-center">
                    <Badge variant={section.isActive ? "success" : "default"}>
                      {section.isActive ? tCommon("active") : tCommon("inactive")}
                    </Badge>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4 text-right">
                    <EditDeleteButton
                      onEdit={() => onEdit(section)}
                      onDelete={() => onDelete(section)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
