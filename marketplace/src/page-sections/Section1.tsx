import Box from "@component/ui/Box";
import Container from "@component/ui/Container";
import { Carousel } from "@component/carousel";
import { CarouselCard1 } from "@component/carousel";
// API FUNCTIONS
import api from "@utils/__api__/market-1";

export default async function Section1() {
  const banners = await api.getMainCarousel();

  return (
    <Box bg="gray.white" mb="2rem" minHeight={{ _: "auto", md: "450px" }} display="flex" alignItems="center" justifyContent="center">
      <Container py={{ _: "1.5rem", md: "3rem" }}>
        <Carousel dots autoplay arrows={false} slidesToShow={1}>
          {banners.map((banner) => (
            <CarouselCard1
              key={banner.id}
              title={banner.title}
              image={banner.imageUrl}
              buttonText={banner.buttonText || "Explorer"}
              buttonLink={banner.buttonLink || "/search"}
              description={banner.description || ""}
            />
          ))}
        </Carousel>
      </Container>
    </Box>
  );
}
