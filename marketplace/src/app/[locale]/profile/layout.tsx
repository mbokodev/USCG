import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import AppLayout from "@component/layout";
import { CustomerDashboardLayout } from "@component/layout/customer-dashboard";
import { getCategories } from "@/services/categories.service";
import { categoriesToNavigation } from "@/utils/category-utils";

export const dynamic = "force-dynamic";

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function ProfileLayout({ children, params }: Props) {
  const { locale } = await params;

  // Check if user is authenticated
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken");

  if (!token) {
    redirect("/signin");
  }

  const categoriesData = await getCategories().catch(() => []);
  const categories = categoriesToNavigation(categoriesData, locale as "fr" | "en");

  return (
    <AppLayout categories={categories}>
      <CustomerDashboardLayout>{children}</CustomerDashboardLayout>
    </AppLayout>
  );
}
