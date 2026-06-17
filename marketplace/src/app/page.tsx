// API FUNCTIONS
import api from "@utils/__api__/market-1";
import { getCategories } from "@/services/categories.service";
import { categoriesToNavigation } from "@/utils/category-utils";
// LAYOUT
import AppLayout from "@component/layout";
import Navbar from "@component/layout/navbar/Navbar";
// PAGE SECTION COMPONENTS
import Section1 from "@sections/Section1";
import Section2 from "@sections/Section2";
import Section6 from "@sections/Section6";
import Section7 from "@sections/Section7";
import Section11 from "@sections/Section11";
import Section12 from "@sections/Section12";

export default async function HomePage() {
  const [
    carList,
    carBrands,
    mobileList,
    opticsList,
    mobileShops,
    opticsShops,
    mobileBrands,
    opticsBrands,
    categoriesData
  ] = await Promise.all([
    api.getCarList(),
    api.getCarBrands(),
    api.getMobileList(),
    api.getOpticsList(),
    api.getMobileShops(),
    api.getOpticsShops(),
    api.getMobileBrands(),
    api.getOpticsBrands(),
    getCategories().catch(() => [])
  ]);

  const categories = categoriesToNavigation(categoriesData, "fr");

  return (
    <AppLayout navbar={<Navbar navListOpen categories={categories} />} categories={categories}>
      <main>
        {/* HERO CAROUSEL AREA */}
        <Section1 />

        {/* FLASH DEAL PRODUCTS AREA */}
        <Section2 />

        {/* CAR LIST AREA */}
        <Section6 carBrands={carBrands} carList={carList} />

        {/* MOBILE PHONES AREA */}
        <Section7
          shops={mobileShops}
          brands={mobileBrands}
          title="Mobile Phones"
          productList={mobileList}
        />

        {/* OPTICS AND WATCH AREA */}
        <Section7
          shops={opticsShops}
          brands={opticsBrands}
          title="Optics / Watch"
          productList={opticsList}
        />

        {/* MORE PRODUCTS AREA */}
        <Section11 />

        {/* SERVICES AREA */}
        <Section12 />
      </main>
    </AppLayout>
  );
}
