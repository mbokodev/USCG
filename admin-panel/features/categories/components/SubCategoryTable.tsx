"use client";

import { useTranslations, useLocale } from "next-intl";
import { Layers, Plus } from "lucide-react";
import {
  Badge,
  EmptyState,
  TableBodyLoading,
  EditDeleteButton,
  Button,
} from "@/components/ui";
import { SubCategory } from "../types/categories.types";

interface SubCategoryTableProps {
  subCategories: SubCategory[];
  isLoading: boolean;
  onEdit: (subCategory: SubCategory) => void;
  onDelete: (subCategory: SubCategory) => void;
  onAdd: () => void;
}

export function SubCategoryTable({
  subCategories,
  isLoading,
  onEdit,
  onDelete,
  onAdd,
}: SubCategoryTableProps) {
  const t = useTranslations("subcategories");
  const locale = useLocale() as "fr" | "en";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 flex flex-col h-full overflow-hidden">
      <div className="overflow-auto flex-1">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                Nom
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase hidden sm:table-cell">
                Slug
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                Categorie
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase hidden md:table-cell">
                Annonces
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                Statut
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {isLoading ? (
              <TableBodyLoading rows={5} columns={6} />
            ) : !subCategories || subCategories.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    title={t("empty.title")}
                    description={t("empty.description")}
                    icon={Layers}
                    action={
                      <Button onClick={onAdd}>
                        <Plus className="w-4 h-4 mr-2" />
                        {t("add")}
                      </Button>
                    }
                  />
                </td>
              </tr>
            ) : (
              subCategories.map((subCategory) => (
                <tr key={subCategory.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-4">
                    <div className="font-medium text-neutral-900">
                      {subCategory.name[locale] || subCategory.name.fr}
                    </div>
                    {subCategory.description && (
                      <div className="text-sm text-neutral-500 truncate max-w-xs">
                        {subCategory.description[locale] || subCategory.description.fr}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-neutral-700 font-mono text-sm hidden sm:table-cell">
                    {subCategory.slug}
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant="info">
                      {subCategory.category?.name?.[locale] || subCategory.category?.name?.fr || "-"}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-neutral-700 hidden md:table-cell">
                    {subCategory._count?.ads || 0}
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={subCategory.isActive ? "success" : "default"}>
                      {subCategory.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <EditDeleteButton
                      onEdit={() => onEdit(subCategory)}
                      onDelete={() => onDelete(subCategory)}
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
