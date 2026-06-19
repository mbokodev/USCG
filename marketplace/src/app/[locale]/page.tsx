// API FUNCTIONS
import { getCategories } from "@/services/categories.service";
import { getFeaturedSectionsWithAds } from "@/services/featured-sections.service";
import { categoriesToNavigation } from "@/utils/category-utils";
// LAYOUT
import AppLayout from "@component/layout";
import Navbar from "@component/layout/navbar/Navbar";
// PAGE SECTION COMPONENTS
import Section1 from "@sections/Section1";
import Section2 from "@sections/Section2";
import Section6 from "@sections/Section6";
import Section11 from "@sections/Section11";
import Section12 from "@sections/Section12";

// Force dynamic rendering - skip prerendering at build time
export const dynamic = "force-dynamic";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;

  const [categoriesData, featuredSections] = await Promise.all([
    getCategories().catch(() => []),
    getFeaturedSectionsWithAds().catch(() => []),
  ]);

  const categories = categoriesToNavigation(categoriesData, locale as "fr" | "en");

  return (
    <AppLayout navbar={<Navbar navListOpen categories={categories} />} categories={categories}>
      <main>
        {/* HERO CAROUSEL AREA */}
        <Section1 />

        {/* FLASH DEAL PRODUCTS AREA */}
        <Section2 />

        {/* FEATURED SECTIONS - Dynamic from admin panel */}
        {featuredSections.map(({ section, filters, products }) => (
          <Section6
            key={section.id}
            section={section}
            filters={filters}
            products={products}
            locale={locale as "fr" | "en"}
          />
        ))}

        {/* LATEST ADS AREA */}
        <Section11 />

        {/* SERVICES AREA */}
        <Section12 />
      </main>
    </AppLayout>
  );
}
