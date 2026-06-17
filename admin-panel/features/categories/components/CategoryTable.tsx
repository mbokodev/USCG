"use client";

import { useTranslations, useLocale } from "next-intl";
import { FolderTree, Plus } from "lucide-react";
import {
  Badge,
  EmptyState,
  TableBodyLoading,
  EditDeleteButton,
  Button,
  getIconByName,
} from "@/components/ui";
import { Category } from "../types/categories.types";

interface CategoryTableProps {
  categories: Category[];
  isLoading: boolean;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onAdd: () => void;
}

export function CategoryTable({
  categories,
  isLoading,
  onEdit,
  onDelete,
  onAdd,
}: CategoryTableProps) {
  const t = useTranslations("categories");
  const tTable = useTranslations("categories.table");
  const locale = useLocale() as "fr" | "en";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 flex flex-col h-fit overflow-hidden">
      <div className="overflow-auto flex-1">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                {tTable("name")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase hidden sm:table-cell">
                {tTable("slug")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase hidden md:table-cell">
                Sous-categories
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                {tTable("status")}
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase">
                {tTable("actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {isLoading ? (
              <TableBodyLoading rows={5} columns={5} />
            ) : !categories || categories.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <EmptyState
                    title={t("empty.title")}
                    description={t("empty.description")}
                    icon={FolderTree}
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
              categories.map((category) => {
                const IconComponent = category.icon ? getIconByName(category.icon) : null;
                return (
                <tr key={category.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {IconComponent ? (
                        <div className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-lg">
                          <IconComponent className="w-5 h-5 text-primary" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 flex items-center justify-center bg-neutral-100 rounded-lg">
                          <FolderTree className="w-5 h-5 text-neutral-400" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-neutral-900">
                          {category.name[locale] || category.name.fr}
                        </div>
                        {category.description && (
                          <div className="text-sm text-neutral-500 truncate max-w-xs">
                            {category.description[locale] || category.description.fr}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-neutral-700 font-mono text-sm hidden sm:table-cell">
                    {category.slug}
                  </td>
                  <td className="px-4 py-4 text-neutral-700 hidden md:table-cell">
                    {category._count?.subCategories || 0}
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={category.isActive ? "success" : "default"}>
                      {category.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <EditDeleteButton
                      onEdit={() => onEdit(category)}
                      onDelete={() => onDelete(category)}
                    />
                  </td>
                </tr>
              );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
