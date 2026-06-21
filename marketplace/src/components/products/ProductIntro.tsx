"use client";

import { useCallback, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { IconMapPin, IconUser, IconEye, IconCalendar } from "@tabler/icons-react";

import Box from "@component/ui/Box";
import Card from "@component/ui/Card";
import Chip from "@component/ui/Chip";
import Grid from "@component/ui/grid/Grid";
import FlexBox from "@component/ui/FlexBox";
import NextImage from "@component/ui/NextImage";
import DefaultImage from "@component/ui/DefaultImage";
import Avatar from "@component/ui/avatar";
import { H1, H2, H6, Paragraph, SemiSpan } from "@component/ui/Typography";

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

  const subCategoryName =
    typeof ad.subCategory?.name === "object"
      ? ad.subCategory.name[locale] || ad.subCategory.name.fr
      : ad.subCategory?.name;

  const handleImageClick = useCallback((ind: number) => () => setSelectedImage(ind), []);

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <Card p="1.5rem" borderRadius={16} mb="1.5rem">
      <Grid container spacing={6}>
        {/* Image Gallery */}
        <Grid item md={6} xs={12}>
          <Box>
            {/* Main Image */}
            <FlexBox
              mb="1rem"
              overflow="hidden"
              borderRadius={12}
              justifyContent="center"
              bg="gray.100"
              position="relative"
              style={{ aspectRatio: "1/1" }}
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
              <FlexBox overflow="auto" pb="0.5rem" style={{ gap: "0.5rem" }}>
                {images.map((url, ind) => (
                  <Box
                    key={ind}
                    width={70}
                    height={70}
                    minWidth={70}
                    display="flex"
                    cursor="pointer"
                    border="2px solid"
                    borderRadius="8px"
                    alignItems="center"
                    justifyContent="center"
                    overflow="hidden"
                    borderColor={selectedImage === ind ? "primary.main" : "gray.300"}
                    onClick={handleImageClick(ind)}
                  >
                    <Avatar src={url} borderRadius="6px" size={66} />
                  </Box>
                ))}
              </FlexBox>
            )}
          </Box>
        </Grid>

        {/* Product Info */}
        <Grid item md={6} xs={12}>
          <Box>
            {/* Title */}
            <H1 mb="1rem" fontSize="1.75rem" lineHeight="1.3">
              {ad.title}
            </H1>

            {/* Type Badge */}
            <FlexBox mb="1rem" style={{ gap: "0.5rem" }}>
              <Chip
                p="6px 12px"
                fontSize="12px"
                fontWeight="600"
                bg={ad.type === "SALE" ? "primary.main" : "secondary.main"}
                color="white"
                style={{ borderRadius: "20px" }}
              >
                {ad.type === "SALE" ? t("sale") : t("rent")}
              </Chip>
              {ad.quantity !== null && ad.quantity !== undefined && (
                <Chip
                  p="6px 12px"
                  fontSize="12px"
                  fontWeight="500"
                  bg="gray.200"
                  color="gray.700"
                  style={{ borderRadius: "20px" }}
                >
                  {t("quantity")}: {ad.quantity}
                </Chip>
              )}
            </FlexBox>

            {/* Price */}
            <Box mb="1.5rem">
              {ad.price !== null ? (
                <FlexBox alignItems="baseline" style={{ gap: "0.75rem" }}>
                  <H2 color="primary.main" lineHeight="1" fontWeight="700">
                    {ad.discountedPrice ? currency(ad.discountedPrice) : currency(ad.price)}
                  </H2>
                  {ad.discountedPrice && (
                    <SemiSpan color="gray.600" style={{ textDecoration: "line-through" }}>
                      {currency(ad.price)}
                    </SemiSpan>
                  )}
                </FlexBox>
              ) : (
                <H2 color="primary.main" lineHeight="1" fontWeight="700">
                  {t("priceOnRequest")}
                </H2>
              )}
            </Box>

            {/* Category */}
            <FlexBox alignItems="center" mb="0.75rem">
              <SemiSpan color="gray.600" mr="0.5rem">
                {t("category")}:
              </SemiSpan>
              <H6 color="gray.800">
                {categoryName}
                {subCategoryName && ` > ${subCategoryName}`}
              </H6>
            </FlexBox>

            {/* City */}
            <FlexBox alignItems="center" mb="0.75rem">
              <IconMapPin size={18} color="gray" />
              <Paragraph ml="0.5rem" color="gray.700">
                {ad.city}
              </Paragraph>
            </FlexBox>

            {/* Seller */}
            {ad.seller && (
              <FlexBox alignItems="center" mb="0.75rem">
                <IconUser size={18} color="gray" />
                <Paragraph ml="0.5rem" color="gray.700">
                  {ad.seller.firstName} {ad.seller.lastName}
                </Paragraph>
              </FlexBox>
            )}

            {/* Views & Date */}
            <FlexBox alignItems="center" mt="1rem" pt="1rem" borderTop="1px solid" borderColor="gray.200" style={{ gap: "1.5rem" }}>
              {ad.viewCount !== undefined && (
                <FlexBox alignItems="center">
                  <IconEye size={16} color="gray" />
                  <SemiSpan ml="0.25rem" color="gray.500" fontSize="13px">
                    {ad.viewCount} {t("views")}
                  </SemiSpan>
                </FlexBox>
              )}
              {ad.createdAt && (
                <FlexBox alignItems="center">
                  <IconCalendar size={16} color="gray" />
                  <SemiSpan ml="0.25rem" color="gray.500" fontSize="13px">
                    {formatDate(ad.createdAt)}
                  </SemiSpan>
                </FlexBox>
              )}
            </FlexBox>
          </Box>
        </Grid>
      </Grid>
    </Card>
  );
}
