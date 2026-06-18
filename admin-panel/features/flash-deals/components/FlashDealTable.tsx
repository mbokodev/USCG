"use client";

import { useTranslations, useLocale } from "next-intl";
import { Zap, Plus } from "lucide-react";
import {
  Badge,
  EmptyState,
  TableBodyLoading,
  EditDeleteButton,
  Button,
} from "@/components/ui";
import type { FlashDealListItem } from "../types";

interface FlashDealTableProps {
  flashDeals: FlashDealListItem[];
  isLoading: boolean;
  onEdit: (flashDeal: FlashDealListItem) => void;
  onDelete: (flashDeal: FlashDealListItem) => void;
  onAdd: () => void;
}

export function FlashDealTable({
  flashDeals,
  isLoading,
  onEdit,
  onDelete,
  onAdd,
}: FlashDealTableProps) {
  const t = useTranslations("flashDeals");
  const tTable = useTranslations("flashDeals.table");
  const tStatus = useTranslations("flashDeals.status");
  const locale = useLocale();

  // Helper to format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(locale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Helper to format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "XAF",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Helper to get status
  const getStatus = (flashDeal: FlashDealListItem) => {
    if (!flashDeal.isActive) {
      return { label: tStatus("inactive"), variant: "default" as const };
    }
    const now = new Date();
    const start = new Date(flashDeal.startDate);
    const end = flashDeal.endDate ? new Date(flashDeal.endDate) : null;

    if (start > now) {
      return { label: tStatus("scheduled"), variant: "warning" as const };
    }
    if (end && end < now) {
      return { label: tStatus("expired"), variant: "error" as const };
    }
    return { label: tStatus("active"), variant: "success" as const };
  };

  // Get category name
  const getCategoryName = (category?: { name: Record<string, string> }) => {
    if (!category) return "-";
    return category.name[locale] || category.name.fr || "-";
  };

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 flex flex-col h-fit overflow-hidden">
      <div className="overflow-auto flex-1">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                {tTable("ad")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                {tTable("price")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                {tTable("period")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                {tTable("status")}
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {isLoading ? (
              <TableBodyLoading rows={3} columns={5} />
            ) : !flashDeals || flashDeals.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <EmptyState
                    title={tTable("noFlashDeals")}
                    description={t("subtitle")}
                    icon={Zap}
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
              flashDeals.map((flashDeal) => {
                const status = getStatus(flashDeal);
                const thumbnailUrl = flashDeal.ad.thumbnail
                  ? `${apiUrl}/api/files/${flashDeal.ad.thumbnail}`
                  : null;

                return (
                  <tr key={flashDeal.id} className="hover:bg-neutral-50">
                    {/* Ad info */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                          {thumbnailUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={thumbnailUrl}
                              alt={flashDeal.ad.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/assets/images/placeholder.png";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-400">
                              <Zap className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-neutral-900 truncate max-w-xs">
                            {flashDeal.ad.title}
                          </div>
                          <div className="text-sm text-neutral-500">
                            {getCategoryName(flashDeal.ad.category)} • {flashDeal.ad.city}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="px-4 py-4">
                      <div className="text-sm line-through text-neutral-400">
                        {formatPrice(flashDeal.ad.price)}
                      </div>
                      <div className="text-sm font-semibold text-red-600">
                        {flashDeal.ad.discountedPrice !== null && formatPrice(flashDeal.ad.discountedPrice)}
                      </div>
                    </td>

                    {/* Period */}
                    <td className="px-4 py-4">
                      <div className="text-sm text-neutral-900">
                        {formatDate(flashDeal.startDate)}
                      </div>
                      <div className="text-sm text-neutral-500">
                        {flashDeal.endDate ? formatDate(flashDeal.endDate) : tTable("noEndDate")}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <Badge variant={status.variant}>
                        {status.label}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4 text-right">
                      <EditDeleteButton
                        onEdit={() => onEdit(flashDeal)}
                        onDelete={() => onDelete(flashDeal)}
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
