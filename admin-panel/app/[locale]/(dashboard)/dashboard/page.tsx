"use client";

import { useTranslations } from "next-intl";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  FileCheck,
  UserPlus,
  Users,
  Store,
  Shield,
  FolderTree,
} from "lucide-react";
import { UserRole } from "@uscg/shared";
import { PageTitle, StatCard } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardStats } from "@/features/dashboard";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: stats, isLoading, type } = useDashboardStats();

  // Show loading when type is not yet determined
  if (!type && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (type === "seller") {
    return <SellerDashboard stats={stats} isLoading={isLoading} />;
  }

  if (type === "operator") {
    return <OperatorDashboard stats={stats} isLoading={isLoading} />;
  }

  if (type === "admin") {
    return <AdminDashboard stats={stats} isLoading={isLoading} />;
  }

  // User is not seller/operator/admin - show message
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <p className="text-neutral-500">Aucun dashboard disponible pour votre profil</p>
    </div>
  );
}

function SellerDashboard({
  stats,
  isLoading,
}: {
  stats: any;
  isLoading: boolean;
}) {
  const t = useTranslations("dashboard.seller");

  return (
    <div>
      <PageTitle title={t("title")} description={t("welcome")} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label={t("totalAds")}
          value={isLoading ? "-" : stats?.total || 0}
          icon={Package}
          variant="primary"
        />
        <StatCard
          label={t("pendingAds")}
          value={isLoading ? "-" : stats?.pending || 0}
          icon={Clock}
          variant="warning"
        />
        <StatCard
          label={t("approvedAds")}
          value={isLoading ? "-" : stats?.approved || 0}
          icon={CheckCircle}
          variant="success"
        />
        <StatCard
          label={t("rejectedAds")}
          value={isLoading ? "-" : stats?.rejected || 0}
          icon={XCircle}
          variant="error"
        />
      </div>
    </div>
  );
}

function OperatorDashboard({
  stats,
  isLoading,
}: {
  stats: any;
  isLoading: boolean;
}) {
  const t = useTranslations("dashboard.operator");

  return (
    <div>
      <PageTitle title={t("title")} description={t("welcome")} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label={t("pendingAds")}
          value={isLoading ? "-" : stats?.pendingAds || 0}
          icon={FileCheck}
          variant="warning"
        />
        <StatCard
          label={t("pendingRequests")}
          value={isLoading ? "-" : stats?.pendingSellerRequests || 0}
          icon={UserPlus}
          variant="primary"
        />
        <StatCard
          label={t("totalBuyers")}
          value={isLoading ? "-" : stats?.totalBuyers || 0}
          icon={Users}
          variant="default"
        />
        <StatCard
          label={t("totalSellers")}
          value={isLoading ? "-" : stats?.totalSellers || 0}
          icon={Store}
          variant="success"
        />
      </div>
    </div>
  );
}

function AdminDashboard({
  stats,
  isLoading,
}: {
  stats: any;
  isLoading: boolean;
}) {
  const t = useTranslations("dashboard.admin");

  const totalUsers = (stats?.totalBuyers || 0) + (stats?.totalSellers || 0);

  return (
    <div>
      <PageTitle title={t("title")} description={t("welcome")} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label={t("totalUsers")}
          value={isLoading ? "-" : totalUsers}
          icon={Users}
          variant="primary"
        />
        <StatCard
          label={t("totalOperators")}
          value={isLoading ? "-" : stats?.totalOperators || 0}
          icon={Shield}
          variant="default"
        />
        <StatCard
          label={t("totalCategories")}
          value={isLoading ? "-" : stats?.totalCategories || 0}
          icon={FolderTree}
          variant="success"
        />
        <StatCard
          label={t("pendingRequests")}
          value={isLoading ? "-" : stats?.pendingSellerRequests || 0}
          icon={UserPlus}
          variant="warning"
        />
      </div>
    </div>
  );
}
