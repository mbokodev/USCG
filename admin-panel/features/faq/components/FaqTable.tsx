"use client";

import { useTranslations, useLocale } from "next-intl";
import { HelpCircle, Pencil, Trash2 } from "lucide-react";
import { Link } from "@/i18n/routing";
import {
  Button,
  Badge,
  EmptyState,
  TableBodyLoading,
} from "@/components/ui";
import { ROUTES } from "@/config/routes";
import type { IFaq } from "../types";

interface FaqTableProps {
  faqs: IFaq[];
  isLoading: boolean;
  onDelete: (faq: IFaq) => void;
}

export function FaqTable({ faqs, isLoading, onDelete }: FaqTableProps) {
  const t = useTranslations("faq");
  const tCommon = useTranslations("common");
  const locale = useLocale() as "fr" | "en";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-neutral-50 border-b border-neutral-200">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
              {t("questions.question")}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase hidden md:table-cell">
              {t("questions.category")}
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
            <TableBodyLoading rows={5} columns={4} />
          ) : faqs.length === 0 ? (
            <tr>
              <td colSpan={4}>
                <EmptyState
                  title={t("questions.empty")}
                  description={t("questions.emptyDescription")}
                  icon={HelpCircle}
                />
              </td>
            </tr>
          ) : (
            faqs.map((faq) => (
              <tr key={faq.id} className="hover:bg-neutral-50">
                <td className="px-4 py-4">
                  <div className="font-medium text-neutral-900 truncate max-w-xs">
                    {faq.question[locale] || faq.question.fr}
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-neutral-500 hidden md:table-cell">
                  {faq.category?.name[locale] || faq.category?.name.fr || "-"}
                </td>
                <td className="px-4 py-4">
                  <Badge variant={faq.isActive ? "success" : "default"}>
                    {faq.isActive ? tCommon("active") : tCommon("inactive")}
                  </Badge>
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={ROUTES.FAQ.EDIT(faq.id)}>
                      <Button size="sm" variant="outline">
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDelete(faq)}
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
