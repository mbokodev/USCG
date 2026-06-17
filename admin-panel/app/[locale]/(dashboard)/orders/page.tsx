"use client";

import { useTranslations } from "next-intl";
import { ShoppingCart } from "lucide-react";
import { PageTitle } from "@/components/ui";

export default function OrdersPage() {
  const t = useTranslations("nav");

  return (
    <div>
      <PageTitle
        title={t("orders")}
        description="Gestion des commandes"
      />

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-8 text-center">
        <ShoppingCart className="w-12 h-12 mx-auto text-neutral-400 mb-4" />
        <p className="text-neutral-500 mb-2">Bientot disponible (Phase 3)</p>
        <p className="text-sm text-neutral-400">Cette fonctionnalite sera implementee dans une prochaine phase.</p>
      </div>
    </div>
  );
}
