"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Ban, CheckCircle } from "lucide-react";
import { usersService, UserRole, User } from "@/features/users";
import {
  PageTitle,
  Badge,
  Pagination,
  EmptyState,
  TableBodyLoading,
  Button,
  ConfirmModal,
} from "@/components/ui";
import { formatDate, getApiErrorMessage } from "@/shared/utils";

export default function BuyersPage() {
  const t = useTranslations("users");
  const tBuyers = useTranslations("users.buyers");
  const tTable = useTranslations("users.table");
  const tCommon = useTranslations("common");
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [unblockModalOpen, setUnblockModalOpen] = useState(false);
  const [userToBlock, setUserToBlock] = useState<User | null>(null);
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["users", page, limit],
    queryFn: () => usersService.getAll({ page, limit, role: UserRole.BUYER }),
  });

  const blockMutation = useMutation({
    mutationFn: (id: string) => usersService.blockUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setBlockModalOpen(false);
      setUserToBlock(null);
    },
    onError: (error) => {
      console.error("Error:", getApiErrorMessage(error));
    },
  });

  const unblockMutation = useMutation({
    mutationFn: (id: string) => usersService.unblockUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setUnblockModalOpen(false);
      setUserToBlock(null);
    },
    onError: (error) => {
      console.error("Error:", getApiErrorMessage(error));
    },
  });

  const handleBlockClick = (user: User) => {
    setUserToBlock(user);
    setBlockModalOpen(true);
  };

  const handleUnblockClick = (user: User) => {
    setUserToBlock(user);
    setUnblockModalOpen(true);
  };

  const handleBlockConfirm = () => {
    if (userToBlock) {
      blockMutation.mutate(userToBlock.id);
    }
  };

  const handleUnblockConfirm = () => {
    if (userToBlock) {
      unblockMutation.mutate(userToBlock.id);
    }
  };

  const users = data?.data || [];
  const totalPages = data?.totalPages || 1;
  const currentPage = data?.page || 1;

  return (
    <div>
      <PageTitle title={tBuyers("title")} description={tBuyers("description")} />

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
                <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase">
                  {tTable("actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {isLoading ? (
                <TableBodyLoading rows={5} columns={5} />
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      title="Aucun utilisateur"
                      description="Aucun utilisateur trouve."
                      icon={Users}
                    />
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className={`hover:bg-neutral-50 ${!user.isActive ? "bg-red-50/50" : ""}`}>
                    <td className="px-4 py-4">
                      <div className={`font-medium ${user.isActive ? "text-neutral-900" : "text-neutral-500"}`}>
                        {user.firstName} {user.lastName}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-neutral-700">{user.email}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Badge variant={user.isSeller ? "success" : "default"}>
                          {user.isSeller ? "Oui" : "Non"}
                        </Badge>
                        {!user.isActive && (
                          <Badge variant="error">
                            {t("status.blocked")}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-neutral-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {user.isActive ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleBlockClick(user)}
                          title={t("blockModal.title")}
                        >
                          <Ban className="w-4 h-4 text-amber-500" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUnblockClick(user)}
                          title={t("unblockModal.title")}
                        >
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        </Button>
                      )}
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

      {/* Block Modal */}
      <ConfirmModal
        isOpen={blockModalOpen}
        onClose={() => {
          setBlockModalOpen(false);
          setUserToBlock(null);
        }}
        onConfirm={handleBlockConfirm}
        title={t("blockModal.title")}
        message={t("blockModal.message", {
          name: userToBlock
            ? `${userToBlock.firstName} ${userToBlock.lastName}`
            : "",
        })}
        confirmText={tCommon("block")}
        variant="danger"
        isLoading={blockMutation.isPending}
      />

      {/* Unblock Modal */}
      <ConfirmModal
        isOpen={unblockModalOpen}
        onClose={() => {
          setUnblockModalOpen(false);
          setUserToBlock(null);
        }}
        onConfirm={handleUnblockConfirm}
        title={t("unblockModal.title")}
        message={t("unblockModal.message", {
          name: userToBlock
            ? `${userToBlock.firstName} ${userToBlock.lastName}`
            : "",
        })}
        confirmText={tCommon("unblock")}
        variant="success"
        isLoading={unblockMutation.isPending}
      />
    </div>
  );
}
