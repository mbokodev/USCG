import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import Container from "@component/ui/Container";
import { getAdById } from "@/services/ads.service";
import ProductIntro from "@component/products/ProductIntro";
import ProductDescription from "@component/products/ProductDescription";

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
  const { id } = await params;
  const t = await getTranslations("product");

  const ad = await getAdById(id);

  if (!ad) {
    notFound();
  }

  return (
    <Container my="2rem">
      <ProductIntro ad={ad} />
      <ProductDescription ad={ad} />
    </Container>
  );
}
