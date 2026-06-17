"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Link } from "@/i18n/routing";
import { PageTitle, Button } from "@/components/ui";
import { BannerForm, bannersService } from "@/features/banners";

interface EditBannerPageProps {
  params: Promise<{ id: string }>;
}

export default function EditBannerPage({ params }: EditBannerPageProps) {
  const { id } = use(params);
  const t = useTranslations("banners");
  const tForm = useTranslations("banners.form");
  const tCommon = useTranslations("common");

  const {
    data: banner,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["banner", id],
    queryFn: () => bannersService.getById(id),
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (error || !banner) {
    return (
      <div className="max-w-3xl">
        <div className="flex items-start gap-4 mb-6">
          <Link href="/banners">
            <Button variant="outline" size="sm" className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <PageTitle title={tForm("editTitle")} description="" />
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-red-400 mb-4" />
          <p className="text-red-700 font-medium">{tCommon("errors.generic")}</p>
          <p className="text-red-600 text-sm mt-2">{t("notFound")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl h-full overflow-y-auto pb-6">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <Link href="/banners">
          <Button variant="outline" size="sm" className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <PageTitle title={tForm("editTitle")} description="" />
      </div>

      {/* Form */}
      <BannerForm banner={banner} isEditing />
    </div>
  );
}
