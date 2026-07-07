import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

// LAYOUT
import AppLayout from "@component/layout";
import Navbar from "@component/layout/navbar/Navbar";
import Container from "@component/ui/Container";
import Box from "@component/ui/Box";
import Grid from "@component/ui/grid/Grid";
import FlexBox from "@component/ui/FlexBox";
import { H1, H2, H4, Paragraph, Small } from "@component/ui/Typography";
import LucideIcon from "@component/ui/LucideIcon";

// COMPONENTS
import FaqAccordion from "@component/faq/FaqAccordion";

// API FUNCTIONS
import { getCategories } from "@/services/categories.service";
import { getFaqGrouped } from "@/services/faq.service";
import { categoriesToNavigation } from "@/utils/category-utils";

export const metadata: Metadata = {
  title: "FAQ - USCG Marketplace",
  description: "Foire aux questions - USCG Marketplace",
};

export const dynamic = "force-dynamic";

interface FaqPageProps {
  params: Promise<{ locale: string }>;
}

export default async function FaqPage({ params }: FaqPageProps) {
  const { locale } = await params;
  const t = await getTranslations("faq");

  const [categoriesData, faqData] = await Promise.all([
    getCategories().catch(() => []),
    getFaqGrouped().catch(() => []),
  ]);

  const categories = categoriesToNavigation(categoriesData, locale as "fr" | "en");
  const localeKey = locale as "fr" | "en";

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
              <LucideIcon name="HelpCircle" size={36} color="#E94560" />
            </FlexBox>

            <H1 color="white" mb="0.5rem" fontSize="2rem">
              {t("title")}
            </H1>

            <Paragraph color="white" style={{ opacity: 0.9 }} fontSize="16px">
              {t("subtitle")}
            </Paragraph>
          </FlexBox>
        </Container>
      </Box>

      {/* Content */}
      <Container py="3rem">
        {faqData.length > 0 ? (
          <Grid container spacing={6}>
            {/* Sidebar - Categories Navigation */}
            <Grid item md={3} xs={12}>
              <Box
                position="sticky"
                top="100px"
                bg="white"
                borderRadius={12}
                p="1.5rem"
                style={{
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  border: "1px solid #f0f0f0",
                }}
              >
                <H4 mb="1rem" fontSize="16px" fontWeight={600}>
                  {t("categories")}
                </H4>
                <Box>
                  {faqData.map((group, index) => {
                    const categoryName = group.category.name[localeKey] || group.category.name.fr;
                    return (
                      <a
                        key={group.category.id}
                        href={`#category-${group.category.slug}`}
                        style={{ textDecoration: "none" }}
                      >
                        <FlexBox
                          alignItems="center"
                          py="0.75rem"
                          px="1rem"
                          mb="0.5rem"
                          borderRadius={8}
                          style={{
                            transition: "all 0.2s ease",
                            cursor: "pointer",
                          }}
                          className="hover:bg-gray-50"
                        >
                          <FlexBox
                            width={28}
                            height={28}
                            bg="primary.light"
                            borderRadius="50%"
                            alignItems="center"
                            justifyContent="center"
                            mr="0.75rem"
                          >
                            <Small color="primary.main" fontWeight={600}>
                              {index + 1}
                            </Small>
                          </FlexBox>
                          <Paragraph fontSize="14px" fontWeight={500} color="text.primary">
                            {categoryName}
                          </Paragraph>
                          <FlexBox
                            ml="auto"
                            bg="gray.100"
                            px="8px"
                            py="2px"
                            borderRadius={12}
                          >
                            <Small color="text.muted">{group.faqs.length}</Small>
                          </FlexBox>
                        </FlexBox>
                      </a>
                    );
                  })}
                </Box>
              </Box>
            </Grid>

            {/* Main Content - FAQ Accordions by Category */}
            <Grid item md={9} xs={12}>
              {faqData.map((group) => {
                const categoryName = group.category.name[localeKey] || group.category.name.fr;
                return (
                  <Box
                    key={group.category.id}
                    id={`category-${group.category.slug}`}
                    mb="2.5rem"
                    style={{ scrollMarginTop: "120px" }}
                  >
                    <FlexBox alignItems="center" mb="1.25rem">
                      <FlexBox
                        width={40}
                        height={40}
                        bg="primary.light"
                        borderRadius="50%"
                        alignItems="center"
                        justifyContent="center"
                        mr="1rem"
                      >
                        <LucideIcon name="Folder" size={20} color="#E94560" />
                      </FlexBox>
                      <H2 fontSize="1.25rem" fontWeight={600}>
                        {categoryName}
                      </H2>
                    </FlexBox>

                    <FaqAccordion faqs={group.faqs} locale={localeKey} />
                  </Box>
                );
              })}
            </Grid>
          </Grid>
        ) : (
          /* Empty State */
          <Box textAlign="center" py="4rem">
            <FlexBox
              width={80}
              height={80}
              bg="gray.100"
              borderRadius="50%"
              alignItems="center"
              justifyContent="center"
              mx="auto"
              mb="1.5rem"
            >
              <LucideIcon name="HelpCircle" size={36} color="#999" />
            </FlexBox>
            <H2 color="text.secondary" fontSize="1.25rem" mb="0.5rem">
              {t("noResults")}
            </H2>
            <Paragraph color="text.muted">
              {t("noResultsDescription")}
            </Paragraph>
          </Box>
        )}

        {/* Contact Info */}
        <Box mt="3rem" textAlign="center">
          <Paragraph color="text.muted" fontSize="14px">
            {t("stillQuestions")}{" "}
            <a
              href="/contact"
              style={{ color: "#E94560", textDecoration: "underline" }}
            >
              {t("contactUs")}
            </a>
          </Paragraph>
        </Box>
      </Container>
    </AppLayout>
  );
}
