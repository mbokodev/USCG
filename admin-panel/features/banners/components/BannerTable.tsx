"use client";

import { useTranslations } from "next-intl";
import { Image as ImageIcon, Plus } from "lucide-react";
import {
  Badge,
  EmptyState,
  TableBodyLoading,
  EditDeleteButton,
  Button,
} from "@/components/ui";
import type { Banner } from "../types";

interface BannerTableProps {
  banners: Banner[];
  isLoading: boolean;
  onEdit: (banner: Banner) => void;
  onDelete: (banner: Banner) => void;
  onAdd: () => void;
}

export function BannerTable({
  banners,
  isLoading,
  onEdit,
  onDelete,
  onAdd,
}: BannerTableProps) {
  const t = useTranslations("banners");
  const tTable = useTranslations("banners.table");
  const tStatus = useTranslations("banners.status");

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 flex flex-col h-fit overflow-hidden">
      <div className="overflow-auto flex-1">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                {tTable("image")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                {tTable("title")}
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
              <TableBodyLoading rows={3} columns={4} />
            ) : !banners || banners.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <EmptyState
                    title={t("empty")}
                    description={t("emptyDescription")}
                    icon={ImageIcon}
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
              banners.map((banner) => (
                <tr key={banner.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-4">
                    <div className="w-24 h-16 rounded-lg overflow-hidden bg-neutral-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={banner.imageUrl}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/assets/images/placeholder.png";
                        }}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-medium text-neutral-900">
                      {banner.title}
                    </div>
                    {banner.description && (
                      <div className="text-sm text-neutral-500 truncate max-w-xs">
                        {banner.description}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={banner.isActive ? "success" : "default"}>
                      {banner.isActive ? tStatus("active") : tStatus("inactive")}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <EditDeleteButton
                      onEdit={() => onEdit(banner)}
                      onDelete={() => onDelete(banner)}
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
