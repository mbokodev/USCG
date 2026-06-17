"use client";

import { useTranslations } from "next-intl";
import { Layers } from "lucide-react";
import { PageTitle } from "@/components/ui";

export default function VariantsPage() {
  const t = useTranslations("nav");

  return (
    <div>
      <PageTitle
        title={t("variants")}
        description="Gestion des variantes (attributs dynamiques)"
      />

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-8 text-center">
        <Layers className="w-12 h-12 mx-auto text-neutral-400 mb-4" />
        <p className="text-neutral-500">Page en cours de developpement...</p>
      </div>
    </div>
  );
}
