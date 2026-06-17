"use client";

import { useTranslations, useLocale } from "next-intl";
import { Package, ImageIcon } from "lucide-react";
import { Link } from "@/i18n/routing";
import {
  Button,
  StatusBadge,
  EmptyState,
  TableBodyLoading,
} from "@/components/ui";
import { formatPrice, formatDate } from "@/shared/utils";
import { ROUTES } from "@/config/routes";
import { AdListItem } from "../types/ads.types";
import { filesService } from "@/features/files";

interface AdsAdminTableProps {
  ads: AdListItem[];
  isLoading: boolean;
}

export function AdsAdminTable({ ads, isLoading }: AdsAdminTableProps) {
  const t = useTranslations("ads");
  const tCommon = useTranslations("common");
  const locale = useLocale() as "fr" | "en";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 flex flex-col h-fit overflow-hidden">
      <div className="overflow-auto flex-1">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                {t("table.title")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase hidden sm:table-cell">
                Vendeur
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase hidden md:table-cell">
                {t("table.price")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase hidden lg:table-cell">
                {t("table.category")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                {t("table.status")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase hidden md:table-cell">
                {t("table.date")}
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase">
                {t("table.actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {isLoading ? (
              <TableBodyLoading rows={5} columns={7} />
            ) : ads.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <EmptyState
                    title="Aucune annonce"
                    description="Aucune annonce ne correspond aux criteres."
                    icon={Package}
                  />
                </td>
              </tr>
            ) : (
              ads.map((ad) => {
                const defaultImage = ad.files?.find(f => f.isDefault) || ad.files?.[0];
                return (
                <tr key={ad.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {defaultImage ? (
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                          <img
                            src={filesService.getFileUrl(defaultImage)}
                            alt={ad.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
                          <ImageIcon className="w-5 h-5 text-neutral-400" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-neutral-900 truncate max-w-xs">
                          {ad.title}
                        </div>
                        <div className="text-sm text-neutral-500">{ad.city}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-neutral-700 hidden sm:table-cell">
                    {ad.seller?.firstName} {ad.seller?.lastName}
                  </td>
                  <td className="px-4 py-4 text-neutral-700 hidden md:table-cell">
                    {ad.price !== null ? formatPrice(ad.price) : tCommon("priceOnRequest")}
                  </td>
                  <td className="px-4 py-4 text-neutral-700 hidden lg:table-cell">
                    {ad.category?.name?.[locale] || ad.category?.name?.fr || "-"}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={ad.status} />
                  </td>
                  <td className="px-4 py-4 text-sm text-neutral-500 hidden md:table-cell">
                    {formatDate(ad.createdAt)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link href={ROUTES.ADS.DETAIL(ad.id)}>
                      <Button size="sm" variant="outline">
                        Voir
                      </Button>
                    </Link>
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
