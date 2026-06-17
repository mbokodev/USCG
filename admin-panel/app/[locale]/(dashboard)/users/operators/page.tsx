"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, Plus } from "lucide-react";
import { usersService, OperatorDrawer, User, UserRole } from "@/features/users";
import {
  PageTitle,
  Button,
  Pagination,
  EmptyState,
  TableBodyLoading,
  EditDeleteButton,
  DeleteModal,
} from "@/components/ui";
import { formatDate, getApiErrorMessage } from "@/shared/utils";

export default function AdminOperatorsPage() {
  const t = useTranslations("users.operators");
  const tTable = useTranslations("users.table");
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 10;

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [operatorToDelete, setOperatorToDelete] = useState<User | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["users-operators", page, limit],
    queryFn: () => usersService.getAll({ page, limit, role: UserRole.OPERATOR }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-operators"] });
      setDeleteModalOpen(false);
      setOperatorToDelete(null);
    },
    onError: (error) => {
      console.error("Error:", getApiErrorMessage(error));
    },
  });

  const users = data?.data || [];
  const totalPages = data?.totalPages || 1;
  const currentPage = data?.page || 1;

  const handleCreate = () => {
    setIsDrawerOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setOperatorToDelete(user);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (operatorToDelete) {
      deleteMutation.mutate(operatorToDelete.id);
    }
  };

  return (
    <div>
      <PageTitle
        title={t("title")}
        description={t("description")}
        action={
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            {t("add")}
          </Button>
        }
      />

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
                  {tTable("role")}
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
                      title="Aucun operateur"
                      description="Creez votre premier operateur."
                      icon={Shield}
                      action={
                        <Button onClick={handleCreate}>
                          <Plus className="w-4 h-4 mr-2" />
                          {t("add")}
                        </Button>
                      }
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
                    <td className="px-4 py-4 text-neutral-700">Operateur</td>
                    <td className="px-4 py-4 text-sm text-neutral-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <EditDeleteButton
                        onDelete={() => handleDeleteClick(user)}
                      />
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

      {/* Operator Drawer */}
      <OperatorDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setOperatorToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        itemName={operatorToDelete ? `${operatorToDelete.firstName} ${operatorToDelete.lastName}` : ""}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
