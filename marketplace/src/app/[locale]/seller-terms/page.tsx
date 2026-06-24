import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

// LAYOUT
import AppLayout from "@component/layout";
import Navbar from "@component/layout/navbar/Navbar";
import Container from "@component/ui/Container";
import Box from "@component/ui/Box";
import Card from "@component/ui/Card";
import FlexBox from "@component/ui/FlexBox";
import { H1, H2, Paragraph, Small } from "@component/ui/Typography";
import TiptapViewer from "@component/ui/TiptapViewer";
import LucideIcon from "@component/ui/LucideIcon";

// API FUNCTIONS
import { getCategories } from "@/services/categories.service";
import { getSellerTermsPage } from "@/services/static-pages.service";
import { categoriesToNavigation } from "@/utils/category-utils";

export const metadata: Metadata = {
  title: "Conditions d'utilisation vendeur - USCG Marketplace",
  description: "Conditions d'utilisation pour les vendeurs USCG Marketplace",
};

export const dynamic = "force-dynamic";

interface SellerTermsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function SellerTermsPage({ params }: SellerTermsPageProps) {
  const { locale } = await params;
  const t = await getTranslations("staticPages");

  const [categoriesData, sellerTermsData] = await Promise.all([
    getCategories().catch(() => []),
    getSellerTermsPage().catch(() => null),
  ]);

  const categories = categoriesToNavigation(categoriesData, locale as "fr" | "en");

  // Get content for current locale
  const content = sellerTermsData?.content?.[locale as "fr" | "en"] || sellerTermsData?.content?.fr;

  return (
    <AppLayout navbar={<Navbar categories={categories} />} categories={categories}>
      {/* Hero Header */}
      <Box
        bg="primary.main"
        py="3rem"
        style={{
          background: "linear-gradient(135deg, #E94560 0%, #0F3460 100%)",
        }}
      >
        <Container>
          <FlexBox
            flexDirection="column"
            alignItems="center"
            textAlign="center"
            maxWidth="700px"
            mx="auto"
          >
            <FlexBox
              width={80}
              height={80}
              bg="white"
              borderRadius="50%"
              alignItems="center"
              justifyContent="center"
              mb="1.5rem"
              style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}
            >
              <LucideIcon name="FileCheck" size={36} color="#E94560" />
            </FlexBox>

            <H1 color="white" mb="0.5rem" fontSize="2rem">
              {t("sellerTerms.title")}
            </H1>

            <Paragraph color="white" style={{ opacity: 0.9 }} fontSize="16px">
              {t("sellerTerms.subtitle")}
            </Paragraph>
          </FlexBox>
        </Container>
      </Box>

      {/* Content */}
      <Container py="3rem">
        <Box maxWidth="900px" mx="auto">
          {/* Last Updated Badge */}
          <FlexBox justifyContent="center" mb="2rem">
            <Box
              bg="gray.100"
              px="1rem"
              py="0.5rem"
              borderRadius={20}
            >
              <FlexBox alignItems="center" style={{ gap: "0.5rem" }}>
                <LucideIcon name="Calendar" size={14} color="#666" />
                <Small color="text.muted">{t("sellerTerms.lastUpdated")}</Small>
              </FlexBox>
            </Box>
          </FlexBox>

          {/* Terms Content Card */}
          <Card
            p="2.5rem"
            borderRadius={16}
            style={{
              boxShadow: "0 2px 20px rgba(0,0,0,0.08)",
              border: "1px solid #eee",
            }}
          >
            {content ? (
              <TiptapViewer content={content} />
            ) : (
              <Box textAlign="center" py="3rem">
                <FlexBox
                  width={64}
                  height={64}
                  bg="gray.100"
                  borderRadius="50%"
                  alignItems="center"
                  justifyContent="center"
                  mx="auto"
                  mb="1rem"
                >
                  <LucideIcon name="FileText" size={28} color="#999" />
                </FlexBox>
                <H2 color="text.secondary" fontSize="1.25rem" mb="0.5rem">
                  {t("sellerTerms.comingSoonTitle")}
                </H2>
                <Paragraph color="text.muted">
                  {t("sellerTerms.comingSoonText")}
                </Paragraph>
              </Box>
            )}
          </Card>

          {/* Contact Info */}
          <Box mt="2rem" textAlign="center">
            <Paragraph color="text.muted" fontSize="14px">
              {t("questions")}{" "}
              <a
                href="/contact"
                style={{ color: "#E94560", textDecoration: "underline" }}
              >
                {t("contactUs")}
              </a>
            </Paragraph>
          </Box>
        </Box>
      </Container>
    </AppLayout>
  );
}
