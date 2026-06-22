import type { Metadata } from "next";
import ForgotPassword from "@/page-sections/auth/ForgotPassword";
import AppLayout from "@component/layout";
import { getCategories } from "@/services/categories.service";
import { categoriesToNavigation } from "@/utils/category-utils";

export const metadata: Metadata = {
  title: "Mot de passe oublié - USCG Marketplace",
  description: "Réinitialisez votre mot de passe USCG Marketplace",
};

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function ForgotPasswordPage({ params }: Props) {
  const { locale } = await params;
  const categoriesData = await getCategories().catch(() => []);
  const categories = categoriesToNavigation(categoriesData, locale as "fr" | "en");

  return (
    <AppLayout categories={categories}>
      <ForgotPassword />
    </AppLayout>
  );
}
