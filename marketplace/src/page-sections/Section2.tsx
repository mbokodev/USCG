import Box from "@component/ui/Box";
import { Carousel } from "@component/carousel";
import ProductCard1 from "@component/products/cards/ProductCard1";
import CategorySectionCreator from "@component/products/CategorySectionCreator";
// API FUNCTIONS
import api from "@utils/__api__/market-1";

const responsive = [
  { breakpoint: 1279, settings: { slidesToShow: 4, centerMode: false } },
  { breakpoint: 959, settings: { slidesToShow: 3, centerMode: false } },
  { breakpoint: 650, settings: { slidesToShow: 2, centerMode: false } },
  { breakpoint: 500, settings: { slidesToShow: 1, centerMode: false } }
];

export default async function Section2() {
  const products = await api.getFlashDeals();

  // Ne rien afficher s'il n'y a pas de flash deals
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <CategorySectionCreator iconName="light" title="Flash Deals" seeMoreLink="#">
      <Box mt="-0.25rem" mb="-0.25rem" style={{ textAlign: "left" }}>
        <Carousel slidesToShow={4} responsive={responsive} centerMode={false} infinite={false}>
          {products.map((item, ind) => (
            <Box py="0.25rem" px="0.25rem" key={ind}>
              <ProductCard1
                key={ind}
                id={item.id}
                slug={item.slug}
                price={item.price}
                salePrice={item.salePrice}
                title={item.title}
                off={item.discount}
                images={item.images}
                imgUrl={item.thumbnail}
                rating={item.rating || 4}
              />
            </Box>
          ))}
        </Carousel>
      </Box>
    </CategorySectionCreator>
  );
}
