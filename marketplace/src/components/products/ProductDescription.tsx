"use client";

import { useTranslations, useLocale } from "next-intl";
import styled from "styled-components";

import Box from "@component/ui/Box";
import Card from "@component/ui/Card";
import FlexBox from "@component/ui/FlexBox";
import Divider from "@component/ui/Divider";
import { H5, Paragraph } from "@component/ui/Typography";
import TiptapViewer from "@component/ui/TiptapViewer";

import type { IAdPublic } from "@uscg/shared/types";

// ========================================
interface ProductDescriptionProps {
  ad: IAdPublic;
}
// ========================================

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

export default function ProductDescription({ ad }: ProductDescriptionProps) {
  const t = useTranslations("product");
  const locale = useLocale() as "fr" | "en";

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
    if (unit) {
      return `${value} ${unit}`;
    }
    return value;
  };

  if (!hasDescription && !hasVariants) {
    return null;
  }

  return (
    <Card p="1.5rem" borderRadius={16}>
      {/* Characteristics Section */}
      {hasVariants && (
        <Box mb={hasDescription ? "1.5rem" : "0"}>
          <H5 mb="1rem" fontWeight="600">
            {t("characteristics")}
          </H5>
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
        </Box>
      )}

      {/* Divider between sections */}
      {hasVariants && hasDescription && <Divider my="1.5rem" />}

      {/* Description Section */}
      {hasDescription && (
        <Box>
          <H5 mb="1rem" fontWeight="600">
            {t("description")}
          </H5>
          <TiptapViewer content={ad.description} />
        </Box>
      )}
    </Card>
  );
}
