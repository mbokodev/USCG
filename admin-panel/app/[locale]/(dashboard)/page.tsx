"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "@/i18n/routing";
import { ROUTES } from "@/config/routes";

export default function DashboardRootPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || !user) return;

    // Redirect all authenticated users to /dashboard
    router.replace(ROUTES.DASHBOARD);
  }, [user, isLoading, router]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-neutral-500">Redirection...</p>
      </div>
    </div>
  );
}
