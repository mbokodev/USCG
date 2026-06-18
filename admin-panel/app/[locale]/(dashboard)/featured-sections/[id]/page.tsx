"use client";

import { use } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertCircle } from "lucide-react";
import { PageTitle } from "@/components/ui";
import {
  featuredSectionsService,
  FeaturedSectionForm,
} from "@/features/featured-sections";

interface EditFeaturedSectionPageProps {
  params: Promise<{ id: string }>;
}

export default function EditFeaturedSectionPage({
  params,
}: EditFeaturedSectionPageProps) {
  const { id } = use(params);
  const t = useTranslations("featuredSections");
  const tCommon = useTranslations("common");

  const { data: section, isLoading, error } = useQuery({
    queryKey: ["featured-section", id],
    queryFn: () => featuredSectionsService.getById(id),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !section) {
    return (
      <div>
        <PageTitle title={t("edit.title")} className="mb-6" />
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-red-400 mb-4" />
          <p className="text-red-700 font-medium">
            {tCommon("errors.generic")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageTitle
        title={t("edit.title")}
        description={t("edit.description")}
        className="mb-6"
      />
      <FeaturedSectionForm section={section} isEditing />
    </div>
  );
}
