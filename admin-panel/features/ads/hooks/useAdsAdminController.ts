"use client";

import { useState, useMemo } from "react";
import { useLocale } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import adsService from "../services/ads.service";
import { Ad, AdStatus } from "../types/ads.types";
import { useDebounce } from "@/shared/hooks";
import categoriesService from "@/features/categories/services/categories.service";

export function useAdsAdminController() {
  const locale = useLocale() as "fr" | "en";

  // =========================================================================
  // LOCAL STATE
  // =========================================================================
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<AdStatus | "">("");
  const [filterCategoryId, setFilterCategoryId] = useState("");
  const limit = 10;

  const debouncedSearch = useDebounce(searchTerm, 300);

  // =========================================================================
  // QUERIES
  // =========================================================================

  // Get categories for filter dropdown
  const { data: categoriesResponse } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesService.getAll(),
    staleTime: 5 * 60 * 1000,
  });

  const categories = categoriesResponse?.data || [];

  // Get all ads with filters
  const {
    data: adsResponse,
    isLoading,
    error: fetchError,
  } = useQuery({
    queryKey: ["ads-admin", page, limit, filterStatus, filterCategoryId, debouncedSearch],
    queryFn: () =>
      adsService.getAll({
        page,
        limit,
        status: filterStatus || undefined,
        categoryId: filterCategoryId || undefined,
        search: debouncedSearch || undefined,
      }),
    staleTime: 30 * 1000, // 30 seconds
  });

  const ads = adsResponse?.data || [];
  const totalPages = adsResponse?.totalPages || 1;
  const total = adsResponse?.total || 0;

  // =========================================================================
  // HANDLERS
  // =========================================================================
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1); // Reset to first page on search
  };

  const handleResetSearch = () => {
    setSearchTerm("");
    setPage(1);
  };

  const handleFilterStatus = (status: AdStatus | "") => {
    setFilterStatus(status);
    setPage(1);
  };

  const handleFilterCategory = (categoryId: string) => {
    setFilterCategoryId(categoryId);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterStatus("");
    setFilterCategoryId("");
    setPage(1);
  };

  // =========================================================================
  // RETURN
  // =========================================================================
  return {
    // Data
    ads,
    categories,
    locale,

    // Pagination
    page,
    totalPages,
    total,
    handlePageChange,

    // Loading states
    isLoading,
    fetchError,

    // Search & Filter
    searchTerm,
    handleSearch,
    handleResetSearch,
    filterStatus,
    handleFilterStatus,
    filterCategoryId,
    handleFilterCategory,
    handleResetFilters,
  };
}
