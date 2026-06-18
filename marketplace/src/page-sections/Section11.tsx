import Grid from "@component/ui/grid/Grid";
import Container from "@component/ui/Container";
import ProductCard1 from "@component/products/cards/ProductCard1";
import CategorySectionHeader from "@component/products/CategorySectionHeader";
import { getLatestAds } from "@/services/ads.service";

export default async function Section11() {
  const products = await getLatestAds(12);

  if (products.length === 0) return null;

  return (
    <Container mb="70px">
      <CategorySectionHeader title="Nouvelles annonces" seeMoreLink="/search" />

      <Grid container spacing={6}>
        {products.map((item) => (
          <Grid item lg={3} md={4} sm={6} xs={12} key={item.id}>
            <ProductCard1
              hoverEffect
              id={item.id}
              slug={item.slug || item.id}
              title={item.title}
              price={item.price || 0}
              off={item.discount}
              rating={item.rating}
              imgUrl={item.thumbnail}
              images={item.images}
            />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
