import type { Metadata } from "next";
import { Signup } from "@/page-sections/auth";
import AppLayout from "@component/layout";
import { getCategories } from "@/services/categories.service";
import { categoriesToNavigation } from "@/utils/category-utils";

export const metadata: Metadata = {
  title: "Inscription - USCG Marketplace",
  description: "Créez votre compte sur USCG Marketplace",
};

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function SignupPage({ params }: Props) {
  const { locale } = await params;
  const categoriesData = await getCategories().catch(() => []);
  const categories = categoriesToNavigation(categoriesData, locale as "fr" | "en");

  return (
    <AppLayout categories={categories}>
      <Signup />
    </AppLayout>
  );
}
