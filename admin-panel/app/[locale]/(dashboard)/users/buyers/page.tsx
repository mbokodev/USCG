"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { usersService, UserRole } from "@/features/users";
import {
  PageTitle,
  Badge,
  Pagination,
  EmptyState,
  TableBodyLoading,
} from "@/components/ui";
import { formatDate } from "@/shared/utils";

export default function BuyersPage() {
  const t = useTranslations("users.buyers");
  const tTable = useTranslations("users.table");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["users", page, limit],
    queryFn: () => usersService.getAll({ page, limit, role: UserRole.BUYER }),
  });

  const users = data?.data || [];
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
                  {tTable("name")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                  {tTable("email")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                  {tTable("isSeller")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                  {tTable("date")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {isLoading ? (
                <TableBodyLoading rows={5} columns={4} />
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <EmptyState
                      title="Aucun utilisateur"
                      description="Aucun utilisateur trouve."
                      icon={Users}
                    />
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-4">
                      <div className="font-medium text-neutral-900">
                        {user.firstName} {user.lastName}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-neutral-700">{user.email}</td>
                    <td className="px-4 py-4">
                      <Badge variant={user.isSeller ? "success" : "default"}>
                        {user.isSeller ? "Oui" : "Non"}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-sm text-neutral-500">
                      {formatDate(user.createdAt)}
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
