"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations, useLocale } from "next-intl";
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import { Link } from "@/i18n/routing";
import { PageTitle, Button } from "@/components/ui";
import { FaqForm, faqService } from "@/features/faq";
import { ROUTES } from "@/config/routes";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditFaqPage({ params }: PageProps) {
  const { id } = use(params);
  const t = useTranslations("faq");
  const tCommon = useTranslations("common");
  const locale = useLocale() as "fr" | "en";

  const { data, isLoading, error } = useQuery({
    queryKey: ["faq", id],
    queryFn: () => faqService.getFaqById(id),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-12 h-12 mx-auto text-red-400 mb-4" />
        <p className="text-red-700 font-medium">{tCommon("errors.generic")}</p>
      </div>
    );
  }

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
            title={t("questions.edit")}
            description={data?.question[locale] || data?.question.fr}
          />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <FaqForm initialData={data} locale={locale} />
        </div>
      </div>
    </div>
  );
}
