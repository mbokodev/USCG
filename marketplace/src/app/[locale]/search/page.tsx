// Force dynamic rendering
export const dynamic = "force-dynamic";

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;

  // TODO: Fetch ads based on search params
  // const ads = await getAds(params);

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Recherche</h1>
      <p>Paramètres: {JSON.stringify(params)}</p>
      <p>Cette page sera implémentée prochainement.</p>
    </div>
  );
}
