import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

// LAYOUT
import AppLayout from "@component/layout";
import Navbar from "@component/layout/navbar/Navbar";
import Container from "@component/ui/Container";
import Box from "@component/ui/Box";
import Card from "@component/ui/Card";
import Grid from "@component/ui/grid/Grid";
import FlexBox from "@component/ui/FlexBox";
import { H1, H2, H3, Paragraph } from "@component/ui/Typography";
import TiptapViewer from "@component/ui/TiptapViewer";
import LucideIcon from "@component/ui/LucideIcon";

// API FUNCTIONS
import { getCategories } from "@/services/categories.service";
import { getAboutPage } from "@/services/static-pages.service";
import { categoriesToNavigation } from "@/utils/category-utils";

export const metadata: Metadata = {
  title: "À propos - USCG Marketplace",
  description: "Découvrez Universal Services of Congo, votre marketplace de confiance",
};

export const dynamic = "force-dynamic";

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  const t = await getTranslations("staticPages");

  const [categoriesData, aboutData] = await Promise.all([
    getCategories().catch(() => []),
    getAboutPage().catch(() => null),
  ]);

  const categories = categoriesToNavigation(categoriesData, locale as "fr" | "en");

  // Get content for current locale
  const introduction = aboutData?.introduction?.[locale as "fr" | "en"] || aboutData?.introduction?.fr;
  const mission = aboutData?.mission?.[locale as "fr" | "en"] || aboutData?.mission?.fr;
  const vision = aboutData?.vision?.[locale as "fr" | "en"] || aboutData?.vision?.fr;
  const values = aboutData?.values || [];
  const team = aboutData?.team || [];

  // Helper to get localized value field
  const getLocalizedTitle = (value: any) => locale === "fr" ? value.titleFr : value.titleEn;
  const getLocalizedDesc = (value: any) => locale === "fr" ? value.descFr : value.descEn;

  return (
    <AppLayout navbar={<Navbar categories={categories} />} categories={categories}>
      {/* Hero Header */}
      <Box
        py="3rem"
        style={{
          background: "linear-gradient(135deg, #0F3460 0%, #16213E 100%)",
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
              <LucideIcon name="Building2" size={36} color="#E94560" />
            </FlexBox>

            <H1 color="white" mb="0.5rem" fontSize="2rem">
              {t("about.title")}
            </H1>

            <Paragraph color="white" style={{ opacity: 0.9 }} fontSize="16px">
              {t("about.subtitle")}
            </Paragraph>
          </FlexBox>
        </Container>
      </Box>

      {/* Content */}
      <Container py="3rem">
        <Box maxWidth="1000px" mx="auto">
          {/* Introduction */}
          {introduction && (
            <Card
              p="2rem"
              mb="3rem"
              borderRadius={16}
              style={{
                boxShadow: "0 2px 20px rgba(0,0,0,0.08)",
                border: "1px solid #eee",
              }}
            >
              <TiptapViewer content={introduction} />
            </Card>
          )}

          {/* Mission & Vision Grid */}
          <Grid container spacing={6} mb="3rem">
            {/* Mission */}
            {mission && (
              <Grid item xs={12} md={6}>
                <Card
                  p="2rem"
                  height="100%"
                  borderRadius={16}
                  style={{
                    background: "linear-gradient(135deg, #fff5f7 0%, #fff 100%)",
                    border: "1px solid #fce4ec",
                  }}
                >
                  <FlexBox alignItems="center" mb="1rem" style={{ gap: "0.75rem" }}>
                    <FlexBox
                      width={48}
                      height={48}
                      bg="primary.main"
                      borderRadius="12px"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <LucideIcon name="Target" size={24} color="white" />
                    </FlexBox>
                    <H2 fontSize="1.25rem" color="primary.main" my="0">
                      {t("about.mission")}
                    </H2>
                  </FlexBox>
                  <TiptapViewer content={mission} />
                </Card>
              </Grid>
            )}

            {/* Vision */}
            {vision && (
              <Grid item xs={12} md={6}>
                <Card
                  p="2rem"
                  height="100%"
                  borderRadius={16}
                  style={{
                    background: "linear-gradient(135deg, #f0f4ff 0%, #fff 100%)",
                    border: "1px solid #e3e8f0",
                  }}
                >
                  <FlexBox alignItems="center" mb="1rem" style={{ gap: "0.75rem" }}>
                    <FlexBox
                      width={48}
                      height={48}
                      bg="#0F3460"
                      borderRadius="12px"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <LucideIcon name="Eye" size={24} color="white" />
                    </FlexBox>
                    <H2 fontSize="1.25rem" color="#0F3460" my="0">
                      {t("about.vision")}
                    </H2>
                  </FlexBox>
                  <TiptapViewer content={vision} />
                </Card>
              </Grid>
            )}
          </Grid>

          {/* Values */}
          {values.length > 0 && (
            <Box mb="3rem">
              <FlexBox justifyContent="center" mb="2rem">
                <H2 color="text.primary" textAlign="center">
                  {t("about.values")}
                </H2>
              </FlexBox>
              <Grid container spacing={6}>
                {values.map((value, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <Card
                      p="2rem"
                      textAlign="center"
                      height="100%"
                      borderRadius={16}
                      style={{
                        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                        border: "1px solid #eee",
                        transition: "transform 0.2s, box-shadow 0.2s",
                      }}
                    >
                      <FlexBox
                        width={72}
                        height={72}
                        bg="primary.light"
                        borderRadius="50%"
                        alignItems="center"
                        justifyContent="center"
                        mx="auto"
                        mb="1.25rem"
                      >
                        <LucideIcon name={value.icon} size={32} color="#E94560" />
                      </FlexBox>
                      <H3 mb="0.75rem" fontSize="1.1rem">
                        {getLocalizedTitle(value)}
                      </H3>
                      <Paragraph color="text.secondary" fontSize="14px" lineHeight="1.6">
                        {getLocalizedDesc(value)}
                      </Paragraph>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Team (optional) */}
          {team.length > 0 && (
            <Box>
              <FlexBox justifyContent="center" mb="2rem">
                <H2 color="text.primary" textAlign="center">
                  {t("about.team")}
                </H2>
              </FlexBox>
              <Grid container spacing={4}>
                {team.map((member, index) => (
                  <Grid item xs={6} md={3} key={index}>
                    <Card
                      p="1.5rem"
                      textAlign="center"
                      borderRadius={16}
                      style={{
                        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                        border: "1px solid #eee",
                      }}
                    >
                      <FlexBox
                        width={90}
                        height={90}
                        bg="gray.200"
                        borderRadius="50%"
                        alignItems="center"
                        justifyContent="center"
                        mx="auto"
                        mb="1rem"
                        style={{
                          backgroundImage: member.photoUrl ? `url(${member.photoUrl})` : undefined,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          border: "3px solid #fff",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                      >
                        {!member.photoUrl && <LucideIcon name="User" size={36} color="#999" />}
                      </FlexBox>
                      <H3 fontSize="1rem" mb="0.25rem">
                        {member.name}
                      </H3>
                      <Paragraph color="primary.main" fontSize="13px" fontWeight="500">
                        {member.role}
                      </Paragraph>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>
      </Container>
    </AppLayout>
  );
}
