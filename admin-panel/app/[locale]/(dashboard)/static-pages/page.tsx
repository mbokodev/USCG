"use client";

import { useTranslations } from "next-intl";
import { FileText, Shield, Building2, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { PageTitle } from "@/components/ui/page-title";
import { ROUTES } from "@/config/routes";

export default function StaticPagesPage() {
  const t = useTranslations("staticPages");

  const pages = [
    {
      key: "terms",
      title: t("terms.title"),
      description: t("terms.description"),
      icon: FileText,
      href: ROUTES.STATIC_PAGES.TERMS,
    },
    {
      key: "privacy",
      title: t("privacy.title"),
      description: t("privacy.description"),
      icon: Shield,
      href: ROUTES.STATIC_PAGES.PRIVACY,
    },
    {
      key: "about",
      title: t("about.title"),
      description: t("about.description"),
      icon: Building2,
      href: ROUTES.STATIC_PAGES.ABOUT,
    },
  ];

  return (
    <div className="space-y-6">
      <PageTitle title={t("title")} description={t("description")} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pages.map((page) => (
          <Link
            key={page.key}
            href={page.href}
            className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-primary hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <page.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary">
                    {page.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{page.description}</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
