"use client";

import { useQuery } from "@tanstack/react-query";
import { UserRole } from "@uscg/shared";
import dashboardService from "../services/dashboard.service";
import { useAuth } from "@/hooks/useAuth";

export function useSellerStats() {
  return useQuery({
    queryKey: ["seller-stats"],
    queryFn: dashboardService.getSellerStats,
  });
}

export function useOperatorStats() {
  return useQuery({
    queryKey: ["operator-stats"],
    queryFn: dashboardService.getOperatorStats,
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: dashboardService.getAdminStats,
  });
}

export function useDashboardStats() {
  const { user, isLoading: isAuthLoading } = useAuth();

  const role = user?.role;
  const isSeller = user?.isSeller;

  // Queries with conditional execution based on role
  const sellerQuery = useQuery({
    queryKey: ["seller-stats"],
    queryFn: dashboardService.getSellerStats,
    enabled: role !== UserRole.SUPER_ADMIN && role !== UserRole.OPERATOR && isSeller === true,
  });

  const operatorQuery = useQuery({
    queryKey: ["operator-stats"],
    queryFn: dashboardService.getOperatorStats,
    enabled: role === UserRole.OPERATOR,
  });

  const adminQuery = useQuery({
    queryKey: ["admin-stats"],
    queryFn: dashboardService.getAdminStats,
    enabled: role === UserRole.SUPER_ADMIN,
  });

  // If auth is still loading, return loading state
  if (isAuthLoading || !user) {
    return {
      data: null,
      isLoading: true,
      error: null,
      type: null,
    };
  }

  if (role === UserRole.SUPER_ADMIN) {
    return {
      data: adminQuery.data,
      isLoading: adminQuery.isLoading,
      error: adminQuery.error,
      type: "admin" as const,
    };
  }

  if (role === UserRole.OPERATOR) {
    return {
      data: operatorQuery.data,
      isLoading: operatorQuery.isLoading,
      error: operatorQuery.error,
      type: "operator" as const,
    };
  }

  if (isSeller) {
    return {
      data: sellerQuery.data,
      isLoading: sellerQuery.isLoading,
      error: sellerQuery.error,
      type: "seller" as const,
    };
  }

  return {
    data: null,
    isLoading: false,
    error: null,
    type: null,
  };
}
