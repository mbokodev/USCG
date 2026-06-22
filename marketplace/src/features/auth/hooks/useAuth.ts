"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { IAuthUser } from "@uscg/shared/types";
import { logoutAction, getCurrentUser } from "../actions/auth.actions";

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: user, isLoading, refetch } = useQuery<IAuthUser | null>({
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
      router.push("/");
      router.refresh();
    },
  });

  const logout = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  const isAuthenticated = !!user;
  const isSeller = user?.isSeller ?? false;

  return {
    user,
    isLoading,
    isAuthenticated,
    isSeller,
    logout,
    isLoggingOut: logoutMutation.isPending,
    refetch,
  };
}
