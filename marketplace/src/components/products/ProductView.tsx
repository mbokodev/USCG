"use client";

import { Fragment, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import styled from "styled-components";

import Box from "@component/ui/Box";
import Grid from "@component/ui/grid/Grid";
import FlexBox from "@component/ui/FlexBox";
import { H3, H6 } from "@component/ui/Typography";
import { ProductCard1 } from "@component/products/cards";
import TiptapViewer from "@component/ui/TiptapViewer";

import type { IAdPublic } from "@uscg/shared/types";
import Product from "@models/product.model";

// ==============================================================
interface ProductViewProps {
  ad: IAdPublic;
  relatedProducts?: Product[];
}
// ==============================================================

const VariantTable = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
`;

const VariantItem = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.75rem;
  background: ${({ theme }) => theme.colors.gray[50]};
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
`;

const VariantLabel = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.muted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
`;

const VariantValue = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export default function ProductView({ ad, relatedProducts = [] }: ProductViewProps) {
  const t = useTranslations("product");
  const locale = useLocale() as "fr" | "en";
  const [selectedOption, setSelectedOption] = useState("description");

  const handleOptionClick = (opt: string) => () => setSelectedOption(opt);

  const hasVariants = ad.variantValues && ad.variantValues.length > 0;
  const hasDescription = ad.description !== null && ad.description !== undefined;

  // Get localized variant name
  const getVariantName = (variant?: { name: Record<string, string> | string }) => {
    if (!variant) return "";
    if (typeof variant.name === "object") {
      return variant.name[locale] || variant.name.fr || variant.name.en || "";
    }
    return variant.name;
  };

  // Format variant value with unit
  const formatVariantValue = (value: string, unit?: string | null) => {
    if (unit) return `${value} ${unit}`;
    return value;
  };

  return (
    <Fragment>
      {/* Tabs - Commented out (description moved to ProductIntro)
      <FlexBox borderBottom="1px solid" borderColor="gray.400" mt="80px" mb="26px">
        <H6
          mr="25px"
          p="4px 10px"
          fontWeight={500}
          className="cursor-pointer"
          borderColor="primary.main"
          onClick={handleOptionClick("description")}
          borderBottom={selectedOption === "description" ? "2px solid" : ""}
          color={selectedOption === "description" ? "primary.main" : "text.muted"}
        >
          {t("description")}
        </H6>

        {hasVariants && (
          <H6
            p="4px 10px"
            fontWeight={500}
            className="cursor-pointer"
            borderColor="primary.main"
            onClick={handleOptionClick("characteristics")}
            borderBottom={selectedOption === "characteristics" ? "2px solid" : ""}
            color={selectedOption === "characteristics" ? "primary.main" : "text.muted"}
          >
            {t("characteristics")}
          </H6>
        )}
      </FlexBox>

      {/* Tab Content */}
      {/* <Box mb="50px">
        {selectedOption === "description" && hasDescription && (
          <TiptapViewer content={ad.description} />
        )}

        {selectedOption === "characteristics" && hasVariants && (
          <VariantTable>
            {ad.variantValues!.map((variantValue) => (
              <VariantItem key={variantValue.id}>
                <VariantLabel>{getVariantName(variantValue.variant)}</VariantLabel>
                <VariantValue>
                  {formatVariantValue(variantValue.value, variantValue.variant?.unit)}
                </VariantValue>
              </VariantItem>
            ))}
          </VariantTable>
        )}
      </Box> */}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <Box mt="60px" mb="50px">
          <H3 mb="24px">{t("relatedProducts")}</H3>
          <Grid container spacing={6}>
            {relatedProducts.slice(0, 4).map((product) => (
              <Grid item lg={3} md={4} sm={6} xs={12} key={product.id}>
                <ProductCard1
                  id={product.id}
                  slug={product.slug || product.id}
                  price={product.price}
                  title={product.title}
                  off={product.discount}
                  imgUrl={product.thumbnail}
                  salePrice={product.discountedPrice}
                  hoverEffect
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Fragment>
  );
}
