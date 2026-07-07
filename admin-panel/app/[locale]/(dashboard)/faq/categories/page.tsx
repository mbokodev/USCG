"use client";

import { useTranslations, useLocale } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/routing";
import { PageTitle, Button } from "@/components/ui";
import { FaqCategoryForm } from "@/features/faq";
import { ROUTES } from "@/config/routes";

export default function NewFaqCategoryPage() {
  const t = useTranslations("faq");
  const locale = useLocale() as "fr" | "en";

  return (
    <div className="h-full overflow-y-auto pr-2">
      <div className="max-w-2xl pb-6">
        <div className="flex items-start gap-4 mb-6">
          <Link href={ROUTES.FAQ.LIST}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <PageTitle
            title={t("categories.create")}
            description={t("categories.createDescription")}
          />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <FaqCategoryForm locale={locale} />
        </div>
      </div>
    </div>
  );
}
