"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  X,
  AlertCircle,
  Users,
  Mail,
  Phone,
  Calendar,
  Store,
  UserCheck,
  UserX,
  Eye,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import {
  PageTitle,
  Button,
  Input,
  Select,
  Pagination,
} from "@/components/ui";
import usersService from "@/features/users/services/users.service";
import { User, UserRole } from "@/features/users/types/users.types";
import { formatDate } from "@/shared/utils";
import { ROUTES } from "@/config/routes";

const SELLER_OPTIONS = [
  { value: "", label: "Tous" },
  { value: "true", label: "Vendeurs" },
  { value: "false", label: "Non vendeurs" },
];

const ACTIVE_OPTIONS = [
  { value: "", label: "Tous" },
  { value: "true", label: "Actifs" },
  { value: "false", label: "Inactifs" },
];

export default function CustomersPage() {
  const t = useTranslations("customers");
  const tCommon = useTranslations("common");

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterSeller, setFilterSeller] = useState<string>("");
  const [filterActive, setFilterActive] = useState<string>("");
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
    queryKey: ["customers", page, limit, debouncedSearch, filterSeller, filterActive],
    queryFn: () =>
      usersService.getAll({
        page,
        limit,
        search: debouncedSearch || undefined,
        role: UserRole.BUYER,
        isSeller: filterSeller ? filterSeller === "true" : undefined,
        isActive: filterActive ? filterActive === "true" : undefined,
      }),
  });

  const customers = data?.data || [];
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
      <div className="mb-4 flex-shrink-0">
        <PageTitle title={t("title")} description={`${total} ${t("totalCustomers")}`} />
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

        {/* Seller Filter */}
        <div className="w-full sm:w-40">
          <Select
            options={SELLER_OPTIONS}
            value={filterSeller}
            onChange={(e) => {
              setFilterSeller(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* Active Filter */}
        <div className="w-full sm:w-40">
          <Select
            options={ACTIVE_OPTIONS}
            value={filterActive}
            onChange={(e) => {
              setFilterActive(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto min-h-0">
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                  {t("table.customer")}
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide hidden md:table-cell">
                  {t("table.contact")}
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide hidden lg:table-cell">
                  {t("table.status")}
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
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <Users className="w-12 h-12 mx-auto text-neutral-300 mb-3" />
                    <p className="text-neutral-500">{t("noCustomers")}</p>
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <CustomerRow key={customer.id} customer={customer} />
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
    </div>
  );
}

function CustomerRow({ customer }: { customer: User }) {
  const t = useTranslations("customers");

  return (
    <tr className="hover:bg-neutral-50 transition-colors">
      {/* Customer Info */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center uppercase justify-center text-primary font-semibold">
            {customer.firstName.charAt(0)}
            {customer.lastName.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-neutral-900">
              {customer.firstName} {customer.lastName}
            </p>
            <p className="text-sm text-neutral-500 md:hidden">{customer.email}</p>
          </div>
        </div>
      </td>

      {/* Contact */}
      <td className="px-4 py-3 hidden md:table-cell">
        <div className="space-y-1">
          <p className="flex items-center gap-2 text-sm text-neutral-600">
            <Mail className="w-4 h-4 text-neutral-400" />
            {customer.email}
          </p>
          {customer.phone && (
            <p className="flex items-center gap-2 text-sm text-neutral-500">
              <Phone className="w-4 h-4 text-neutral-400" />
              {customer.phone}
            </p>
          )}
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-3 hidden lg:table-cell">
        <div className="flex flex-wrap gap-2">
          {customer.isSeller && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-medium">
              <Store className="w-3 h-3" />
              {t("seller")}
            </span>
          )}
          {customer.isActive ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-medium">
              <UserCheck className="w-3 h-3" />
              {t("active")}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-medium">
              <UserX className="w-3 h-3" />
              {t("inactive")}
            </span>
          )}
        </div>
      </td>

      {/* Date */}
      <td className="px-4 py-3 hidden lg:table-cell">
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <Calendar className="w-4 h-4 text-neutral-400" />
          {formatDate(customer.createdAt)}
        </div>
      </td>

      {/* Actions */}
      <td className="px-4 py-3 text-right">
        <Link href={`/customers/${customer.id}`}>
          <Button variant="ghost" size="sm">
            <Eye className="w-4 h-4" />
          </Button>
        </Link>
      </td>
    </tr>
  );
}
