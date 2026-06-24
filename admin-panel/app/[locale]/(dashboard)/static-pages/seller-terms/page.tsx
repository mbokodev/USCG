"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations, useLocale } from "next-intl";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Link } from "@/i18n/routing";

import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/ui/page-title";
import { SellerTermsForm, staticPagesService } from "@/features/static-pages";
import { ROUTES } from "@/config/routes";

export default function SellerTermsEditPage() {
  const t = useTranslations("staticPages");
  const tCommon = useTranslations("common");
  const locale = useLocale() as "fr" | "en";

  const { data, isLoading, error } = useQuery({
    queryKey: ["seller-terms-page"],
    queryFn: staticPagesService.getSellerTerms,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <Link href={ROUTES.STATIC_PAGES.LIST}>
            <Button variant="outline" size="sm" className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <PageTitle title={t("sellerTerms.title")} description="" />
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-red-400 mb-4" />
          <p className="text-red-700 font-medium">{tCommon("errors.generic")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-scroll pr-2">
      <div className="max-w-4xl pb-6">
        <div className="flex items-start gap-4 mb-6">
          <Link href={ROUTES.STATIC_PAGES.LIST}>
            <Button variant="outline" size="sm" className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <PageTitle title={t("sellerTerms.title")} description={t("sellerTerms.description")} />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <SellerTermsForm initialData={data} locale={locale} />
        </div>
      </div>
    </div>
  );
}
