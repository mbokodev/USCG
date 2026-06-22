import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyEmail } from "@/page-sections/auth";
import AppLayout from "@component/layout";
import { getCategories } from "@/services/categories.service";
import { categoriesToNavigation } from "@/utils/category-utils";

export const metadata: Metadata = {
  title: "Vérification Email - USCG Marketplace",
  description: "Vérifiez votre adresse email pour activer votre compte",
};

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function VerifyEmailPage({ params }: Props) {
  const { locale } = await params;
  const categoriesData = await getCategories().catch(() => []);
  const categories = categoriesToNavigation(categoriesData, locale as "fr" | "en");

  return (
    <AppLayout categories={categories}>
      <Suspense fallback={<div>Chargement...</div>}>
        <VerifyEmail />
      </Suspense>
    </AppLayout>
  );
}
