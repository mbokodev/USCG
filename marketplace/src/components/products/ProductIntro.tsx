"use client";

import { useCallback, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { IconMapPin, IconUser } from "@tabler/icons-react";

import Box from "@component/ui/Box";
import Avatar from "@component/ui/avatar";
import Grid from "@component/ui/grid/Grid";
import FlexBox from "@component/ui/FlexBox";
import NextImage from "@component/ui/NextImage";
import DefaultImage from "@component/ui/DefaultImage";
import { H1, H2, H6, SemiSpan } from "@component/ui/Typography";

import { currency } from "@utils/utils";
import { buildFileUrl } from "@/utils/ad-utils";
import type { IAdPublic } from "@uscg/shared/types";

// ========================================
interface ProductIntroProps {
  ad: IAdPublic;
}
// ========================================

export default function ProductIntro({ ad }: ProductIntroProps) {
  const t = useTranslations("product");
  const locale = useLocale() as "fr" | "en";
  const [selectedImage, setSelectedImage] = useState(0);

  // Build image URLs
  const images = ad.files?.map((f) => buildFileUrl(f)) || [];
  const hasImages = images.length > 0;

  // Get localized names
  const categoryName =
    typeof ad.category?.name === "object"
      ? ad.category.name[locale] || ad.category.name.fr
      : ad.category?.name;

  const handleImageClick = useCallback((ind: number) => () => setSelectedImage(ind), []);

  return (
    <Box overflow="hidden">
      <Grid container justifyContent="center" alignItems="center" spacing={16}>
        {/* Image Gallery */}
        <Grid item md={6} xs={12} alignItems="center">
          <div>
            {/* Main Image */}
            <FlexBox
              mb="50px"
              overflow="hidden"
              borderRadius={16}
              justifyContent="center"
              bg="gray.100"
              position="relative"
              style={{ aspectRatio: "1/1", maxHeight: "400px" }}
            >
              {hasImages ? (
                <NextImage
                  alt={ad.title}
                  src={images[selectedImage]}
                  fill
                  style={{ objectFit: "contain" }}
                />
              ) : (
                <DefaultImage />
              )}
            </FlexBox>

            {/* Thumbnails */}
            {hasImages && images.length > 1 && (
              <FlexBox overflow="auto">
                {images.map((url, ind) => (
                  <Box
                    key={ind}
                    size={70}
                    bg="white"
                    minWidth={70}
                    display="flex"
                    cursor="pointer"
                    border="1px solid"
                    borderRadius="10px"
                    alignItems="center"
                    justifyContent="center"
                    ml={ind === 0 ? "auto" : ""}
                    mr={ind === images.length - 1 ? "auto" : "10px"}
                    borderColor={selectedImage === ind ? "primary.main" : "gray.400"}
                    onClick={handleImageClick(ind)}
                  >
                    <Avatar src={url} borderRadius="10px" size={65} />
                  </Box>
                ))}
              </FlexBox>
            )}
          </div>
        </Grid>

        {/* Product Info */}
        <Grid item md={6} xs={12} alignItems="center">
          <H1 mb="1rem">{ad.title}</H1>

          {/* Category */}
          <FlexBox alignItems="center" mb="1rem">
            <SemiSpan>{t("category")}:</SemiSpan>
            <H6 ml="8px">{categoryName}</H6>
          </FlexBox>

          {/* Type Badge */}
          <FlexBox alignItems="center" mb="1rem">
            <SemiSpan>{t("type")}:</SemiSpan>
            <H6 ml="8px" color={ad.type === "SALE" ? "primary.main" : "secondary.main"}>
              {ad.type === "SALE" ? t("sale") : t("rent")}
            </H6>
          </FlexBox>

          {/* Price */}
          <Box mb="24px">
            {ad.price !== null ? (
              <>
                <H2 color="primary.main" mb="4px" lineHeight="1">
                  {ad.discountedPrice ? currency(ad.discountedPrice) : currency(ad.price)}
                </H2>
                {ad.discountedPrice && (
                  <SemiSpan color="gray.600" style={{ textDecoration: "line-through" }}>
                    {currency(ad.price)}
                  </SemiSpan>
                )}
              </>
            ) : (
              <H2 color="primary.main" mb="4px" lineHeight="1">
                {t("priceOnRequest")}
              </H2>
            )}
            {ad.quantity !== null && ad.quantity !== undefined && (
              <SemiSpan color="inherit">
                {t("quantity")}: {ad.quantity}
              </SemiSpan>
            )}
          </Box>

          {/* City */}
          <FlexBox alignItems="center" mb="1rem">
            <IconMapPin size={18} />
            <H6 ml="8px">{ad.city}</H6>
          </FlexBox>

          {/* Seller */}
          {ad.seller && (
            <FlexBox alignItems="center" mb="1rem">
              <IconUser size={18} />
              <SemiSpan ml="8px">{t("seller")}:</SemiSpan>
              <H6 lineHeight="1" ml="8px">
                {ad.seller.firstName} {ad.seller.lastName}
              </H6>
            </FlexBox>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
