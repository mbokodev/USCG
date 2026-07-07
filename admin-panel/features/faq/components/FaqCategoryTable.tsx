"use client";

import { useTranslations, useLocale } from "next-intl";
import { Folder, Pencil, Trash2 } from "lucide-react";
import { Link } from "@/i18n/routing";
import {
  Button,
  Badge,
  EmptyState,
  TableBodyLoading,
} from "@/components/ui";
import { ROUTES } from "@/config/routes";
import type { IFaqCategory } from "../types";

interface FaqCategoryTableProps {
  categories: IFaqCategory[];
  isLoading: boolean;
  onDelete: (category: IFaqCategory) => void;
}

export function FaqCategoryTable({ categories, isLoading, onDelete }: FaqCategoryTableProps) {
  const t = useTranslations("faq");
  const tCommon = useTranslations("common");
  const locale = useLocale() as "fr" | "en";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-neutral-50 border-b border-neutral-200">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
              {t("categories.name")}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
              {tCommon("status")}
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase">
              {tCommon("actions")}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {isLoading ? (
            <TableBodyLoading rows={5} columns={3} />
          ) : categories.length === 0 ? (
            <tr>
              <td colSpan={3}>
                <EmptyState
                  title={t("categories.empty")}
                  description={t("categories.emptyDescription")}
                  icon={Folder}
                />
              </td>
            </tr>
          ) : (
            categories.map((category) => (
              <tr key={category.id} className="hover:bg-neutral-50">
                <td className="px-4 py-4">
                  <div className="font-medium text-neutral-900">
                    {category.name[locale] || category.name.fr}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <Badge variant={category.isActive ? "success" : "default"}>
                    {category.isActive ? tCommon("active") : tCommon("inactive")}
                  </Badge>
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={ROUTES.FAQ.CATEGORY_EDIT(category.id)}>
                      <Button size="sm" variant="outline">
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDelete(category)}
                      className="text-red-600 hover:text-red-700 hover:border-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
