"use client";

import { Carousel } from "@component/carousel";
import { CarouselCard1 } from "@component/carousel";
import type { IBanner } from "@uscg/shared/types";

interface Section1ClientProps {
  banners: IBanner[];
}

export default function Section1Client({ banners }: Section1ClientProps) {
  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <Carousel
      dots
      autoplay
      arrows={false}
      slidesToShow={1}
    >
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
  );
}
