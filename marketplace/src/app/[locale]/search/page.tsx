import { Suspense } from "react";

// LAYOUT
import AppLayout from "@component/layout";
import Navbar from "@component/layout/navbar/Navbar";
import Container from "@component/ui/Container";
import Box from "@component/ui/Box";
import Spinner from "@component/ui/Spinner";
import FlexBox from "@component/ui/FlexBox";

// PAGE SECTION COMPONENTS
import SearchResult from "./SearchResult";

// API FUNCTIONS
import { getCategories } from "@/services/categories.service";
import { categoriesToNavigation } from "@/utils/category-utils";

// Force dynamic rendering - skip prerendering at build time
export const dynamic = "force-dynamic";

interface SearchPageProps {
  params: Promise<{ locale: string }>;
}

function SearchLoading() {
  return (
    <FlexBox justifyContent="center" alignItems="center" minHeight="400px">
      <Spinner size={40} />
    </FlexBox>
  );
}

export default async function SearchPage({ params }: SearchPageProps) {
  const { locale } = await params;

  const categoriesData = await getCategories().catch(() => []);
  const categories = categoriesToNavigation(categoriesData, locale as "fr" | "en");

  return (
    <AppLayout navbar={<Navbar categories={categories} />} categories={categories}>
      <Container py="2rem">
        <Box pt="20px">
          <Suspense fallback={<SearchLoading />}>
            <SearchResult />
          </Suspense>
        </Box>
      </Container>
    </AppLayout>
  );
}
