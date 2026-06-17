"use client";

import { useTranslations } from "next-intl";
import { History } from "lucide-react";
import { PageTitle, EmptyState } from "@/components/ui";

export default function AdminLoginHistoryPage() {
  const t = useTranslations("loginHistory");

  // TODO: Implement login history when backend endpoint is ready

  return (
    <div>
      <PageTitle title={t("title")} description={t("description")} />

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <EmptyState
          title="Fonctionnalite en cours"
          description="L'historique des connexions sera disponible prochainement."
          icon={History}
        />
      </div>
    </div>
  );
}
