"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { IconMapPin, IconUser, IconChevronDown, IconChevronUp, IconChevronRight, IconHome, IconX, IconChevronLeft } from "@tabler/icons-react";
import Link from "next/link";

import Box from "@component/ui/Box";
import Grid from "@component/ui/grid/Grid";
import FlexBox from "@component/ui/FlexBox";
import NextImage from "@component/ui/NextImage";
import DefaultImage from "@component/ui/DefaultImage";
import TiptapViewer from "@component/ui/TiptapViewer";
import { H1, H2, H6, SemiSpan, Span } from "@component/ui/Typography";

import { currency } from "@utils/utils";
import { buildFileUrl } from "@/utils/ad-utils";
import type { IAdPublic } from "@uscg/shared/types";

// ========================================
interface ProductIntroProps {
  ad: IAdPublic;
}
// ========================================

// Max thumbnails to show before "+X" indicator
const MAX_VISIBLE_THUMBNAILS = 4;

export default function ProductIntro({ ad }: ProductIntroProps) {
  const t = useTranslations("product");
  const [selectedImage, setSelectedImage] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isDescriptionTruncated, setIsDescriptionTruncated] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(0);
  const descriptionRef = useRef<HTMLDivElement>(null);

  const MAX_DESCRIPTION_HEIGHT = 240; // ~10 lines

  // Check if description is truncated
  useEffect(() => {
    if (descriptionRef.current) {
      const scrollHeight = descriptionRef.current.scrollHeight;
      setIsDescriptionTruncated(scrollHeight > MAX_DESCRIPTION_HEIGHT);
    }
  }, [ad.description]);

  // Close lightbox on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsLightboxOpen(false);
    };
    if (isLightboxOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "auto";
    };
  }, [isLightboxOpen]);

  // Build image URLs
  const images = ad.files?.map((f) => buildFileUrl(f)) || [];
  const hasImages = images.length > 0;
  const hasDescription = ad.description !== null && ad.description !== undefined;

  // Calculate visible thumbnails and remaining count
  const visibleThumbnails = images.slice(0, MAX_VISIBLE_THUMBNAILS);
  const remainingCount = images.length - MAX_VISIBLE_THUMBNAILS;

  const handleImageClick = useCallback((ind: number) => () => setSelectedImage(ind), []);

  const openLightbox = (index: number) => {
    setLightboxImage(index);
    setIsLightboxOpen(true);
  };

  const navigateLightbox = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setLightboxImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    } else {
      setLightboxImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }
  };

  return (
    <Box overflow="hidden">
      {/* Breadcrumb */}
      <FlexBox alignItems="center" mb="20px" flexWrap="wrap" style={{ gap: "4px" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <FlexBox alignItems="center" color="gray.600" className="cursor-pointer">
            <IconHome size={16} />
            <Span ml="4px" fontSize="14px" color="gray.600">
              {t("home")}
            </Span>
          </FlexBox>
        </Link>
        <IconChevronRight size={14} color="#999" />
        <Link href="/search" style={{ textDecoration: "none" }}>
          <Span fontSize="14px" color="gray.600" className="cursor-pointer">
            {t("products")}
          </Span>
        </Link>
        <IconChevronRight size={14} color="#999" />
        <Span fontSize="14px" color="gray.900" fontWeight={500}>
          {ad.title.length > 40 ? `${ad.title.substring(0, 40)}...` : ad.title}
        </Span>
      </FlexBox>

      <Grid container justifyContent="center" alignItems="flex-start" spacing={6}>
        {/* Image Gallery - 65% */}
        <Grid item md={8} xs={12} alignItems="center">
          <div>
            {/* Main Image */}
            <Box
              position="relative"
              borderRadius={12}
              overflow="hidden"
              mb="12px"
              cursor={hasImages ? "pointer" : "default"}
              onClick={() => hasImages && openLightbox(selectedImage)}
              style={{
                aspectRatio: "4/3",
              }}
            >
              {hasImages ? (
                <NextImage
                  alt={ad.title}
                  src={images[selectedImage]}
                  fill
                  style={{ objectFit: "cover", borderRadius: "12px" }}
                  priority
                />
              ) : (
                <FlexBox
                  height="100%"
                  justifyContent="center"
                  alignItems="center"
                  bg="gray.100"
                >
                  <DefaultImage />
                </FlexBox>
              )}
            </Box>

            {/* Thumbnails */}
            {hasImages && images.length > 1 && (
              <FlexBox style={{ gap: "12px" }} px="4px" py="4px">
                {visibleThumbnails.map((url, ind) => {
                  const isLast = ind === MAX_VISIBLE_THUMBNAILS - 1 && remainingCount > 0;
                  const isSelected = selectedImage === ind;
                  return (
                    <Box
                      key={ind}
                      position="relative"
                      flex="1"
                      cursor="pointer"
                      borderRadius="8px"
                      overflow="hidden"
                      onClick={handleImageClick(ind)}
                      style={{
                        aspectRatio: "4/3",
                        outline: isSelected ? "3px solid var(--primary-main, #D23F57)" : "1px solid #e0e0e0",
                        outlineOffset: "-1px",
                        transition: "outline 0.2s ease",
                      }}
                    >
                      <NextImage
                        src={url}
                        alt={`${ad.title} - ${ind + 1}`}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                      {/* +X Indicator */}
                      {isLast && (
                        <FlexBox
                          position="absolute"
                          top={0}
                          left={0}
                          right={0}
                          bottom={0}
                          bg="rgba(0,0,0,0.6)"
                          justifyContent="center"
                          alignItems="center"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImage(MAX_VISIBLE_THUMBNAILS);
                          }}
                        >
                          <SemiSpan color="white" fontWeight={600} fontSize={16}>
                            +{remainingCount}
                          </SemiSpan>
                        </FlexBox>
                      )}
                    </Box>
                  );
                })}
              </FlexBox>
            )}
          </div>
        </Grid>

        {/* Product Info - 35% */}
        <Grid item md={4} xs={12} alignItems="center">
          <Box
            bg="white"
            borderRadius={16}
            p="24px"
            style={{
              boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
              border: "1px solid #f0f0f0",
            }}
          >
            {/* Title */}
            <H1 mb="16px" fontSize="24px" lineHeight="1.3">
              {ad.title}
            </H1>

            {/* Price */}
            <Box mb="20px">
              {ad.price !== null ? (
                <FlexBox alignItems="baseline" flexWrap="wrap">
                  <H2
                    color="primary.main"
                    fontSize="28px"
                    fontWeight={700}
                    lineHeight="1"
                    mr="12px"
                  >
                    {ad.discountedPrice ? currency(ad.discountedPrice) : currency(ad.price)}
                  </H2>
                  {ad.discountedPrice && (
                    <SemiSpan
                      color="gray.500"
                      fontSize="16px"
                      style={{ textDecoration: "line-through" }}
                    >
                      {currency(ad.price)}
                    </SemiSpan>
                  )}
                </FlexBox>
              ) : (
                <H2 color="primary.main" fontSize="22px" fontWeight={600} lineHeight="1">
                  {t("priceOnRequest")}
                </H2>
              )}
              {ad.quantity !== null && ad.quantity !== undefined && (
                <SemiSpan color="gray.600" fontSize="14px" mt="8px" display="block">
                  {ad.quantity} {t("available")}
                </SemiSpan>
              )}
            </Box>

            {/* Info Cards */}
            <FlexBox flexDirection="column" style={{ gap: "12px" }} mb="20px">
              {/* City */}
              <FlexBox
                alignItems="center"
                p="12px 16px"
                borderRadius={8}
                bg="gray.50"
                style={{ border: "1px solid #eee" }}
              >
                <FlexBox
                  alignItems="center"
                  justifyContent="center"
                  width={36}
                  height={36}
                  borderRadius="50%"
                  bg="primary.light"
                  mr="12px"
                >
                  <IconMapPin size={18} color="#D23F57" />
                </FlexBox>
                <Box>
                  <SemiSpan fontSize="12px" color="gray.500">
                    {t("location")}
                  </SemiSpan>
                  <H6 fontSize="14px" fontWeight={600}>
                    {ad.city}
                  </H6>
                </Box>
              </FlexBox>

              {/* Seller */}
              {ad.seller && (
                <FlexBox
                  alignItems="center"
                  p="12px 16px"
                  borderRadius={8}
                  bg="gray.50"
                  style={{ border: "1px solid #eee" }}
                >
                  <FlexBox
                    alignItems="center"
                    justifyContent="center"
                    width={36}
                    height={36}
                    borderRadius="50%"
                    bg="secondary.light"
                    mr="12px"
                  >
                    <IconUser size={18} color="#4E97FD" />
                  </FlexBox>
                  <Box>
                    <SemiSpan fontSize="12px" color="gray.500">
                      {t("seller")}
                    </SemiSpan>
                    <H6 fontSize="14px" fontWeight={600}>
                      {ad.seller.firstName} {ad.seller.lastName}
                    </H6>
                  </Box>
                </FlexBox>
              )}
            </FlexBox>

            {/* Description */}
            {hasDescription && (
              <Box>
                <H6 mb="12px" fontWeight={600} color="gray.700">
                  {t("description")}
                </H6>
                <Box
                  ref={descriptionRef}
                  position="relative"
                  overflow="hidden"
                  style={{
                    maxHeight: showFullDescription ? "none" : `${MAX_DESCRIPTION_HEIGHT}px`,
                  }}
                >
                  <TiptapViewer content={ad.description} />
                  {!showFullDescription && isDescriptionTruncated && (
                    <Box
                      position="absolute"
                      bottom={0}
                      left={0}
                      right={0}
                      height="60px"
                      style={{
                        background: "linear-gradient(transparent, white)",
                      }}
                    />
                  )}
                </Box>
                {isDescriptionTruncated && (
                  <FlexBox
                    alignItems="center"
                    justifyContent="center"
                    mt="12px"
                    py="8px"
                    cursor="pointer"
                    color="primary.main"
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    style={{
                      borderTop: "1px solid #eee",
                    }}
                  >
                    <Span fontWeight={600} fontSize="14px" mr="4px">
                      {showFullDescription ? t("showLess") : t("showMore")}
                    </Span>
                    {showFullDescription ? (
                      <IconChevronUp size={18} />
                    ) : (
                      <IconChevronDown size={18} />
                    )}
                  </FlexBox>
                )}
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Image Lightbox */}
      {isLightboxOpen && hasImages && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "rgba(0, 0, 0, 0.95)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <FlexBox
            justifyContent="space-between"
            alignItems="center"
            p="16px 24px"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
          >
            <Span color="white" fontSize="16px" fontWeight={500}>
              {t("imageGallery")} : {lightboxImage + 1}/{images.length}
            </Span>
            <FlexBox
              alignItems="center"
              justifyContent="center"
              width={40}
              height={40}
              borderRadius="50%"
              cursor="pointer"
              onClick={() => setIsLightboxOpen(false)}
              style={{
                backgroundColor: "rgba(255,255,255,0.1)",
                transition: "background-color 0.2s",
              }}
              className="hover:bg-white/20"
            >
              <IconX size={24} color="white" />
            </FlexBox>
          </FlexBox>

          {/* Main Image Area */}
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              padding: "20px",
            }}
          >
            {/* Previous Button */}
            {images.length > 1 && (
              <FlexBox
                position="absolute"
                left="20px"
                alignItems="center"
                justifyContent="center"
                width={48}
                height={48}
                borderRadius="50%"
                cursor="pointer"
                onClick={() => navigateLightbox("prev")}
                style={{
                  backgroundColor: "rgba(255,255,255,0.1)",
                  transition: "background-color 0.2s",
                }}
              >
                <IconChevronLeft size={28} color="white" />
              </FlexBox>
            )}

            {/* Image */}
            <div
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "900px",
                height: "100%",
                maxHeight: "70vh",
              }}
            >
              <NextImage
                src={images[lightboxImage]}
                alt={`${ad.title} - ${lightboxImage + 1}`}
                fill
                style={{ objectFit: "contain" }}
                priority
              />
            </div>

            {/* Next Button */}
            {images.length > 1 && (
              <FlexBox
                position="absolute"
                right="20px"
                alignItems="center"
                justifyContent="center"
                width={48}
                height={48}
                borderRadius="50%"
                cursor="pointer"
                onClick={() => navigateLightbox("next")}
                style={{
                  backgroundColor: "rgba(255,255,255,0.1)",
                  transition: "background-color 0.2s",
                }}
              >
                <IconChevronRight size={28} color="white" />
              </FlexBox>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <FlexBox
              justifyContent="center"
              p="16px"
              style={{
                gap: "12px",
                borderTop: "1px solid rgba(255,255,255,0.1)",
                overflowX: "auto",
              }}
            >
              {images.map((url, ind) => (
                <div
                  key={ind}
                  onClick={() => setLightboxImage(ind)}
                  style={{
                    position: "relative",
                    width: "80px",
                    height: "60px",
                    borderRadius: "8px",
                    overflow: "hidden",
                    cursor: "pointer",
                    border: lightboxImage === ind ? "2px solid #D23F57" : "2px solid transparent",
                    opacity: lightboxImage === ind ? 1 : 0.6,
                    transition: "opacity 0.2s, border 0.2s",
                    flexShrink: 0,
                  }}
                >
                  <NextImage
                    src={url}
                    alt={`${ad.title} - ${ind + 1}`}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
              ))}
            </FlexBox>
          )}
        </div>
      )}
    </Box>
  );
}
