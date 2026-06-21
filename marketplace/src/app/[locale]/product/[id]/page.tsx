import { Fragment } from "react";
import { notFound } from "next/navigation";

// LAYOUT
import AppLayout from "@component/layout";
import Navbar from "@component/layout/navbar/Navbar";
import Container from "@component/ui/Container";

// COMPONENTS
import ProductIntro from "@component/products/ProductIntro";
import ProductView from "@component/products/ProductView";

// SERVICES
import { getAdById, getRelatedProducts } from "@/services/ads.service";
import { getCategories } from "@/services/categories.service";
import { categoriesToNavigation } from "@/utils/category-utils";

// Force dynamic rendering
export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ id: string; locale: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ProductPageProps) {
  const { id } = await params;
  const ad = await getAdById(id);

  if (!ad) {
    return { title: "Produit non trouvé" };
  }

  return {
    title: ad.title,
    description:
      typeof ad.description === "string"
        ? ad.description.slice(0, 160)
        : `${ad.title} - ${ad.price ? `${ad.price} FCFA` : "Prix sur demande"}`,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id, locale } = await params;

  // Fetch ad first to get category
  const ad = await getAdById(id);

  if (!ad) {
    notFound();
  }

  // Fetch categories and related products in parallel
  const [categoriesData, relatedProducts] = await Promise.all([
    getCategories().catch(() => []),
    ad.category?.id
      ? getRelatedProducts(ad.category.id, id, 4).catch(() => [])
      : Promise.resolve([]),
  ]);

  const categories = categoriesToNavigation(categoriesData, locale as "fr" | "en");

  return (
    <AppLayout navbar={<Navbar categories={categories} />} categories={categories}>
      <Container py="2rem">
        <Fragment>
          <ProductIntro ad={ad} />
          <ProductView ad={ad} relatedProducts={relatedProducts} />
        </Fragment>
      </Container>
    </AppLayout>
  );
}
