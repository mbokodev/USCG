import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import AppLayout from "@component/layout";
import Container from "@component/ui/Container";
import { getCategories } from "@/services/categories.service";
import { categoriesToNavigation } from "@/utils/category-utils";
import BecomeSellerForm from "@/page-sections/become-seller/BecomeSellerForm";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function BecomeSellerPage({ params }: Props) {
  const { locale } = await params;

  // Check if user is authenticated
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken");

  if (!token) {
    redirect("/signin?redirect=/become-seller");
  }

  const categoriesData = await getCategories().catch(() => []);
  const categories = categoriesToNavigation(categoriesData, locale as "fr" | "en");

  return (
    <AppLayout categories={categories}>
      <Container my="2rem" style={{ minHeight: "calc(100vh - 200px)" }}>
        <BecomeSellerForm />
      </Container>
    </AppLayout>
  );
}
