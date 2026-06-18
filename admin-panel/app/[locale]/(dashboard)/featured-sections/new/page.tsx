"use client";

import { useTranslations } from "next-intl";
import { PageTitle } from "@/components/ui";
import { FeaturedSectionForm } from "@/features/featured-sections";

export default function NewFeaturedSectionPage() {
  const t = useTranslations("featuredSections");

  return (
    <div>
      <PageTitle
        title={t("new.title")}
        description={t("new.description")}
        className="mb-6"
      />
      <FeaturedSectionForm />
    </div>
  );
}
