"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  X,
  AlertCircle,
  Users,
  Mail,
  Phone,
  Calendar,
  Plus,
  Trash2,
  Shield,
  ShieldCheck,
  Ban,
  CheckCircle,
} from "lucide-react";
import {
  PageTitle,
  Button,
  Input,
  Pagination,
  DeleteModal,
  ConfirmModal,
  Badge,
} from "@/components/ui";
import { usersService, User, UserRole, StaffDrawer } from "@/features/users";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { formatDate, getApiErrorMessage } from "@/shared/utils";

export default function StaffPage() {
  const t = useTranslations("staff");
  const tCommon = useTranslations("common");
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<User | null>(null);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [unblockModalOpen, setUnblockModalOpen] = useState(false);
  const [staffToBlock, setStaffToBlock] = useState<User | null>(null);
  const limit = 10;

  // Debounce search with useEffect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      if (searchTerm !== debouncedSearch) {
        setPage(1);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleResetSearch = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setPage(1);
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["staff", page, limit, debouncedSearch],
    queryFn: () =>
      usersService.getStaff({
        page,
        limit,
        search: debouncedSearch || undefined,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersService.deleteStaff(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      setDeleteModalOpen(false);
      setStaffToDelete(null);
    },
    onError: (error) => {
      console.error("Error:", getApiErrorMessage(error));
    },
  });

  const blockMutation = useMutation({
    mutationFn: (id: string) => usersService.blockUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      setBlockModalOpen(false);
      setStaffToBlock(null);
    },
    onError: (error) => {
      console.error("Error:", getApiErrorMessage(error));
    },
  });

  const unblockMutation = useMutation({
    mutationFn: (id: string) => usersService.unblockUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      setUnblockModalOpen(false);
      setStaffToBlock(null);
    },
    onError: (error) => {
      console.error("Error:", getApiErrorMessage(error));
    },
  });

  const handleDeleteClick = (staff: User) => {
    setStaffToDelete(staff);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (staffToDelete) {
      deleteMutation.mutate(staffToDelete.id);
    }
  };

  const handleBlockClick = (staff: User) => {
    setStaffToBlock(staff);
    setBlockModalOpen(true);
  };

  const handleUnblockClick = (staff: User) => {
    setStaffToBlock(staff);
    setUnblockModalOpen(true);
  };

  const handleBlockConfirm = () => {
    if (staffToBlock) {
      blockMutation.mutate(staffToBlock.id);
    }
  };

  const handleUnblockConfirm = () => {
    if (staffToBlock) {
      unblockMutation.mutate(staffToBlock.id);
    }
  };

  const staff = data?.data || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <PageTitle title={t("title")} description={t("description")} />
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-red-400 mb-4" />
          <p className="text-red-700 font-medium">{tCommon("errors.generic")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-4 flex-shrink-0 flex justify-between items-start">
        <PageTitle title={t("title")} description={`${total} ${t("totalStaff")}`} />
        <Button onClick={() => setIsDrawerOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          {t("addStaff")}
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3 flex-shrink-0">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          {searchTerm && (
            <button
              onClick={handleResetSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto min-h-0">
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                  {t("table.member")}
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide hidden md:table-cell">
                  {t("table.contact")}
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide hidden lg:table-cell">
                  {t("table.role")}
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide hidden lg:table-cell">
                  {t("table.date")}
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                  {t("table.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-neutral-500">
                      <div className="w-5 h-5 border-2 border-neutral-300 border-t-primary rounded-full animate-spin" />
                      {tCommon("loading")}
                    </div>
                  </td>
                </tr>
              ) : staff.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <Users className="w-12 h-12 mx-auto text-neutral-300 mb-3" />
                    <p className="text-neutral-500">{t("noStaff")}</p>
                  </td>
                </tr>
              ) : (
                staff.map((member) => (
                  <StaffRow
                    key={member.id}
                    member={member}
                    callerRole={user?.role as UserRole}
                    onDelete={() => handleDeleteClick(member)}
                    onBlock={() => handleBlockClick(member)}
                    onUnblock={() => handleUnblockClick(member)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 pt-4 flex-shrink-0">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Drawer */}
      <StaffDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        callerRole={user?.role as UserRole}
      />

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setStaffToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title={t("deleteModal.title")}
        message={t("deleteModal.message", {
          name: staffToDelete
            ? `${staffToDelete.firstName} ${staffToDelete.lastName}`
            : "",
        })}
        isLoading={deleteMutation.isPending}
      />

      {/* Block Modal */}
      <ConfirmModal
        isOpen={blockModalOpen}
        onClose={() => {
          setBlockModalOpen(false);
          setStaffToBlock(null);
        }}
        onConfirm={handleBlockConfirm}
        title={t("blockModal.title")}
        message={t("blockModal.message", {
          name: staffToBlock
            ? `${staffToBlock.firstName} ${staffToBlock.lastName}`
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
          setStaffToBlock(null);
        }}
        onConfirm={handleUnblockConfirm}
        title={t("unblockModal.title")}
        message={t("unblockModal.message", {
          name: staffToBlock
            ? `${staffToBlock.firstName} ${staffToBlock.lastName}`
            : "",
        })}
        confirmText={tCommon("unblock")}
        variant="success"
        isLoading={unblockMutation.isPending}
      />
    </div>
  );
}

interface StaffRowProps {
  member: User;
  callerRole: UserRole;
  onDelete: () => void;
  onBlock: () => void;
  onUnblock: () => void;
}

function StaffRow({ member, callerRole, onDelete, onBlock, onUnblock }: StaffRowProps) {
  const t = useTranslations("staff");

  // Block/Unblock: ADMIN can manage OPERATOR, SUPER_ADMIN can manage all
  const canBlockUnblock =
    callerRole === UserRole.SUPER_ADMIN ||
    (callerRole === UserRole.ADMIN && member.role === UserRole.OPERATOR);

  // Delete: Only SUPER_ADMIN can delete staff
  const canDelete = callerRole === UserRole.SUPER_ADMIN;

  const getRoleBadge = (role: UserRole) => {
    if (role === UserRole.ADMIN) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-medium">
          <ShieldCheck className="w-3 h-3" />
          Admin
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-medium">
        <Shield className="w-3 h-3" />
        Operator
      </span>
    );
  };

  return (
    <tr className={`hover:bg-neutral-50 transition-colors ${!member.isActive ? "bg-red-50/50" : ""}`}>
      {/* Member Info */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center uppercase justify-center font-semibold ${member.isActive ? "bg-primary/10 text-primary" : "bg-neutral-200 text-neutral-500"}`}>
            {member.firstName.charAt(0)}
            {member.lastName.charAt(0)}
          </div>
          <div>
            <p className={`font-medium ${member.isActive ? "text-neutral-900" : "text-neutral-500"}`}>
              {member.firstName} {member.lastName}
            </p>
            <p className="text-sm text-neutral-500 md:hidden">{member.email}</p>
          </div>
        </div>
      </td>

      {/* Contact */}
      <td className="px-4 py-3 hidden md:table-cell">
        <div className="space-y-1">
          <p className="flex items-center gap-2 text-sm text-neutral-600">
            <Mail className="w-4 h-4 text-neutral-400" />
            {member.email}
          </p>
          {member.phone && (
            <p className="flex items-center gap-2 text-sm text-neutral-500">
              <Phone className="w-4 h-4 text-neutral-400" />
              {member.phone}
            </p>
          )}
        </div>
      </td>

      {/* Role */}
      <td className="px-4 py-3 hidden lg:table-cell">
        <div className="flex items-center gap-2">
          {getRoleBadge(member.role as UserRole)}
          {!member.isActive && (
            <Badge variant="error" className="text-xs">
              {t("status.blocked")}
            </Badge>
          )}
        </div>
      </td>

      {/* Date */}
      <td className="px-4 py-3 hidden lg:table-cell">
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <Calendar className="w-4 h-4 text-neutral-400" />
          {formatDate(member.createdAt)}
        </div>
      </td>

      {/* Actions */}
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          {canBlockUnblock && (
            <>
              {member.isActive ? (
                <Button variant="ghost" size="sm" onClick={onBlock} title={t("blockModal.title")}>
                  <Ban className="w-4 h-4 text-amber-500" />
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={onUnblock} title={t("unblockModal.title")}>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </Button>
              )}
            </>
          )}
          {canDelete && (
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}
