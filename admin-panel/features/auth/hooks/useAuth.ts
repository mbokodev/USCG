"use client";

import { useCallback } from "react";
import { useRouter } from "@/i18n/routing";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserRole } from "@uscg/shared";
import { logoutAction, getCurrentUser } from "../actions/auth.actions";
import { AuthUser } from "../schemas/auth.schema";
import { ROUTES } from "@/config/routes";

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<AuthUser | null>({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: logoutAction,
    onSuccess: () => {
      queryClient.setQueryData(["currentUser"], null);
      queryClient.clear();
      router.push(ROUTES.AUTH.LOGIN);
      router.refresh();
    },
  });

  const logout = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  const isAuthenticated = !!user;
  const isSeller = user?.isSeller ?? false;
  const isOperator = user?.role === UserRole.OPERATOR;
  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;

  return {
    user,
    isLoading,
    isAuthenticated,
    isSeller,
    isOperator,
    isSuperAdmin,
    logout,
    isLoggingOut: logoutMutation.isPending,
  };
}
