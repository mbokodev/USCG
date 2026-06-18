import { notFound } from "next/navigation";

// Force dynamic rendering
export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  // TODO: Fetch product details from API
  // const product = await getProductById(id);
  // if (!product) notFound();

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Page produit</h1>
      <p>ID: {id}</p>
      <p>Cette page sera implémentée prochainement.</p>
    </div>
  );
}
