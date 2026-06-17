"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { UserPlus } from "lucide-react";
import { Link } from "@/i18n/routing";
import { sellerRequestsService } from "@/features/seller-requests";
import {
  PageTitle,
  Button,
  StatusBadge,
  Pagination,
  EmptyState,
  TableBodyLoading,
} from "@/components/ui";
import { formatDate } from "@/shared/utils";
import { ROUTES } from "@/config/routes";

export default function SellerRequestsPage() {
  const t = useTranslations("sellerRequests");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["seller-requests-pending", page, limit],
    queryFn: () => sellerRequestsService.getPending({ page, limit }),
  });

  const requests = data?.data || [];
  const totalPages = data?.totalPages || 1;
  const currentPage = data?.page || 1;

  return (
    <div>
      <PageTitle title={t("title")} description={t("description")} />

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                  {t("table.user")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                  {t("table.business")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                  {t("table.phone")}
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
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      title={t("empty.title")}
                      description={t("empty.description")}
                      icon={UserPlus}
                    />
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-4">
                      <div className="font-medium text-neutral-900">
                        {request.user?.firstName} {request.user?.lastName}
                      </div>
                      <div className="text-sm text-neutral-500">
                        {request.user?.email}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-neutral-700">
                      {request.businessName}
                    </td>
                    <td className="px-4 py-4 text-neutral-700">
                      {request.businessPhone}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={request.status} />
                    </td>
                    <td className="px-4 py-4 text-sm text-neutral-500">
                      {formatDate(request.createdAt)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link href={ROUTES.SELLER_REQUESTS.DETAIL(request.id)}>
                        <Button size="sm" variant="outline">
                          Voir
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
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
    </div>
  );
}
