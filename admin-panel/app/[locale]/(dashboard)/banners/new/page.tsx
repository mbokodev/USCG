"use client";

import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { PageTitle, Button } from "@/components/ui";
import { BannerForm } from "@/features/banners";

export default function NewBannerPage() {
  const t = useTranslations("banners.form");

  return (
    <div className="max-w-3xl h-full overflow-y-auto pb-6">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <Link href="/banners">
          <Button variant="outline" size="sm" className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <PageTitle title={t("createTitle")} description="" />
      </div>

      {/* Form */}
      <BannerForm />
    </div>
  );
}
