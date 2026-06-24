import Box from "@component/ui/Box";
import Container from "@component/ui/Container";
import { Carousel } from "@component/carousel";
import { CarouselCard1 } from "@component/carousel";
// API FUNCTIONS
import api from "@utils/__api__/market-1";
import { Banner } from "@models/market-1.model";

// Default banner when no banners exist in database
const DEFAULT_BANNER: Banner = {
  id: "default",
  title: "Bienvenue sur USCG",
  description: "Découvrez nos annonces immobilières, foncières et bien plus encore.",
  imageUrl: "/assets/images/banners/banner-1.png",
  buttonText: "Explorer",
  buttonLink: "/search",
  isActive: true,
  order: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export default async function Section1() {
  const apiBanners = await api.getMainCarousel();

  // Use default banner if no banners from API
  const banners = apiBanners.length > 0 ? apiBanners : [DEFAULT_BANNER];

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
