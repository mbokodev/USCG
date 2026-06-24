import Box from "@component/ui/Box";
import Container from "@component/ui/Container";
import Section1Client from "./Section1Client";
// API FUNCTIONS
import api from "@utils/__api__/market-1";

export default async function Section1() {
  const banners = await api.getMainCarousel();

  return (
    <Box bg="gray.white" mb="2rem" minHeight={{ _: "auto", md: "450px" }} display="flex" alignItems="center" justifyContent="center">
      <Container py={{ _: "1.5rem", md: "3rem" }}>
        <Section1Client banners={banners} />
      </Container>
    </Box>
  );
}
