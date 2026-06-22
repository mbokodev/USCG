import { getTranslations } from "next-intl/server";
import Box from "@component/ui/Box";
import Grid from "@component/ui/grid/Grid";
import ProductCard1 from "@component/products/cards/ProductCard1";
import CategorySectionCreator from "@component/products/CategorySectionCreator";
import { getFlashDeals } from "@/services/flash-deals.service";

export default async function Section2() {
  const t = await getTranslations("home");
  const products = await getFlashDeals();

  // Ne rien afficher s'il n'y a pas de flash deals
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <CategorySectionCreator iconName="light" title={t("flashDeals")} seeMoreLink="#">
      <Grid container spacing={6}>
        {products.slice(0, 4).map((item) => (
          <Grid item lg={3} md={4} sm={6} xs={12} key={item.id}>
            <ProductCard1
              id={item.id}
              slug={item.slug || item.id}
              price={item.price || 0}
              salePrice={item.discountedPrice}
              title={item.title}
              off={item.discount}
              images={item.images}
              imgUrl={item.thumbnail}
              rating={item.rating || 5}
            />
          </Grid>
        ))}
      </Grid>
    </CategorySectionCreator>
  );
}
