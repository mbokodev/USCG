"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Package, Eye, X, ImageIcon, Search } from "lucide-react";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { Link, useRouter } from "@/i18n/routing";
import { adsService, AdListItem } from "@/features/ads";
import { filesService } from "@/features/files";
import {
  PageTitle,
  Button,
  StatusBadge,
  Pagination,
  EmptyState,
  TableBodyLoading,
  EditDeleteButton,
  DeleteModal,
} from "@/components/ui";
import { formatPrice, formatDate, getApiErrorMessage } from "@/shared/utils";
import { ROUTES } from "@/config/routes";

export default function MyAdsPage() {
  const t = useTranslations("ads");
  const tCommon = useTranslations("common");
  const locale = useLocale() as "fr" | "en";
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const limit = 10;

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [adToDelete, setAdToDelete] = useState<AdListItem | null>(null);

  // State pour le modal de raison de modification/rejet
  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<{ title: string; reason: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["my-ads", page, limit, debouncedSearch],
    queryFn: () => adsService.getMyAds({ page, limit, search: debouncedSearch || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-ads"] });
      setDeleteModalOpen(false);
      setAdToDelete(null);
    },
    onError: (error) => {
      console.error("Error:", getApiErrorMessage(error));
    },
  });

  const handleDeleteClick = (ad: AdListItem) => {
    setAdToDelete(ad);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (adToDelete) {
      deleteMutation.mutate(adToDelete.id);
    }
  };

  const ads = data?.data || [];
  const totalPages = data?.totalPages || 1;
  const currentPage = data?.page || 1;

  return (
    <div>
      <PageTitle
        title={t("title")}
        description={t("description")}
        action={
          <Link href={ROUTES.MY_ADS.NEW}>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {t("add")}
            </Button>
          </Link>
        }
      />

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder={t("search.placeholder")}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                  {t("table.title")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                  {t("table.price")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                  {t("table.category")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                  {t("table.status")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                  {t("table.date")}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase">
                  {t("table.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {isLoading ? (
                <TableBodyLoading rows={5} columns={6} />
              ) : ads.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      title={t("empty.title")}
                      description={t("empty.description")}
                      icon={Package}
                      action={
                        <Link href={ROUTES.MY_ADS.NEW}>
                          <Button>{t("empty.action")}</Button>
                        </Link>
                      }
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
                    <td className="px-4 py-4 text-neutral-700">
                      {ad.price !== null ? formatPrice(ad.price) : tCommon("priceOnRequest")}
                    </td>
                    <td className="px-4 py-4 text-neutral-700">
                      {ad.category?.name?.[locale] || ad.category?.name?.fr || "-"}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {/* Icône œil si raison existe */}
                        {(ad.status === "REJECTED" || ad.status === "MODIFICATION_REQUESTED") && ad.rejectionReason && (
                          <button
                            onClick={() => {
                              setSelectedReason({ title: ad.title, reason: ad.rejectionReason! });
                              setReasonModalOpen(true);
                            }}
                            className="text-amber-500 hover:text-amber-600 transition-colors"
                            title={t("viewReason")}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        <StatusBadge status={ad.status} />
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-neutral-500">
                      {formatDate(ad.createdAt)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <EditDeleteButton
                        onEdit={() => router.push(ROUTES.MY_ADS.EDIT(ad.id))}
                        onDelete={() => handleDeleteClick(ad)}
                      />
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-neutral-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setAdToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        itemName={adToDelete?.title}
        isLoading={deleteMutation.isPending}
      />

      {/* Reason Modal */}
      {reasonModalOpen && selectedReason && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">
                {t("reasonModal.title")}
              </h3>
              <button
                onClick={() => setReasonModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-neutral-500 mb-3">{selectedReason.title}</p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-neutral-700 whitespace-pre-wrap">{selectedReason.reason}</p>
            </div>
            <button
              onClick={() => setReasonModalOpen(false)}
              className="mt-4 w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              {t("reasonModal.close")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
