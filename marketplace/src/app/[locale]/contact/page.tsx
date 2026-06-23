import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MapPin, Mail, Phone, Clock } from "lucide-react";

// LAYOUT
import AppLayout from "@component/layout";
import Navbar from "@component/layout/navbar/Navbar";
import Container from "@component/ui/Container";
import Box from "@component/ui/Box";
import Card from "@component/ui/Card";
import Grid from "@component/ui/grid/Grid";
import FlexBox from "@component/ui/FlexBox";
import { H1, H2, H3, Paragraph } from "@component/ui/Typography";
import LucideIcon from "@component/ui/LucideIcon";

// API FUNCTIONS
import { getCategories } from "@/services/categories.service";
import { categoriesToNavigation } from "@/utils/category-utils";

export const metadata: Metadata = {
  title: "Contact - USCG Marketplace",
  description: "Contactez-nous pour toute question ou assistance",
};

export const dynamic = "force-dynamic";

interface ContactPageProps {
  params: Promise<{ locale: string }>;
}

// Contact info (static for Phase 1)
const CONTACT_INFO = {
  address: "Carrefour Raffinerie - Siafoumou Bloc 7-8",
  city: "Pointe-Noire, Congo",
  email: "support@universal-services-cg.com",
  phone: "+242 06 654 40 11",
  hours: "Lun - Sam: 8h00 - 18h00",
};

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;
  const t = await getTranslations("staticPages.contact");

  const categoriesData = await getCategories().catch(() => []);
  const categories = categoriesToNavigation(categoriesData, locale as "fr" | "en");

  const contactItems = [
    {
      icon: MapPin,
      label: t("info.address"),
      value: CONTACT_INFO.address,
      subValue: CONTACT_INFO.city,
      color: "#E94560",
      bgColor: "#FFF5F7",
    },
    {
      icon: Mail,
      label: t("info.email"),
      value: CONTACT_INFO.email,
      href: `mailto:${CONTACT_INFO.email}`,
      color: "#0F3460",
      bgColor: "#F0F4FF",
    },
    {
      icon: Phone,
      label: t("info.phone"),
      value: CONTACT_INFO.phone,
      href: `tel:${CONTACT_INFO.phone}`,
      color: "#22C55E",
      bgColor: "#F0FDF4",
    },
  ];

  return (
    <AppLayout navbar={<Navbar categories={categories} />} categories={categories}>
      {/* Hero Header */}
      <Box
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
              <LucideIcon name="MessageCircle" size={36} color="#E94560" />
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
        <Box maxWidth="1000px" mx="auto">
          <Grid container spacing={6}>
            {/* Contact Cards */}
            <Grid item xs={12} md={7}>
              <H2 mb="1.5rem" fontSize="1.5rem">
                {t("info.title")}
              </H2>

              <Box style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {contactItems.map((item, index) => (
                  <Card
                    key={index}
                    p="1.5rem"
                    borderRadius={16}
                    style={{
                      border: "1px solid #eee",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                    }}
                  >
                    <FlexBox alignItems="center" style={{ gap: "1rem" }}>
                      <FlexBox
                        width={56}
                        height={56}
                        borderRadius="14px"
                        alignItems="center"
                        justifyContent="center"
                        flexShrink={0}
                        style={{ backgroundColor: item.bgColor }}
                      >
                        <item.icon size={26} color={item.color} />
                      </FlexBox>
                      <Box flex="1">
                        <Paragraph color="text.muted" fontSize="13px" mb="0.25rem">
                          {item.label}
                        </Paragraph>
                        {item.href ? (
                          <a
                            href={item.href}
                            style={{
                              color: "#1A1A2E",
                              fontWeight: 600,
                              fontSize: "16px",
                              textDecoration: "none",
                            }}
                          >
                            {item.value}
                          </a>
                        ) : (
                          <>
                            <Paragraph fontWeight="600" fontSize="16px" mb="0">
                              {item.value}
                            </Paragraph>
                            {item.subValue && (
                              <Paragraph color="text.secondary" fontSize="14px" mb="0">
                                {item.subValue}
                              </Paragraph>
                            )}
                          </>
                        )}
                      </Box>
                    </FlexBox>
                  </Card>
                ))}

                {/* Hours Card */}
                <Card
                  p="1.5rem"
                  borderRadius={16}
                  style={{
                    border: "1px solid #eee",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                  }}
                >
                  <FlexBox alignItems="center" style={{ gap: "1rem" }}>
                    <FlexBox
                      width={56}
                      height={56}
                      borderRadius="14px"
                      alignItems="center"
                      justifyContent="center"
                      flexShrink={0}
                      style={{ backgroundColor: "#FFF8E1" }}
                    >
                      <Clock size={26} color="#F59E0B" />
                    </FlexBox>
                    <Box flex="1">
                      <Paragraph color="text.muted" fontSize="13px" mb="0.25rem">
                        {locale === "fr" ? "Heures d'ouverture" : "Opening Hours"}
                      </Paragraph>
                      <Paragraph fontWeight="600" fontSize="16px" mb="0">
                        {CONTACT_INFO.hours}
                      </Paragraph>
                    </Box>
                  </FlexBox>
                </Card>
              </Box>
            </Grid>

            {/* Form Placeholder */}
            <Grid item xs={12} md={5}>
              <H2 mb="1.5rem" fontSize="1.5rem">
                {t("form.title")}
              </H2>

              <Card
                p="2rem"
                borderRadius={16}
                style={{
                  background: "linear-gradient(135deg, #f8f9fa 0%, #fff 100%)",
                  border: "2px dashed #ddd",
                  minHeight: "300px",
                }}
              >
                <FlexBox
                  height="100%"
                  minHeight="250px"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  textAlign="center"
                >
                  <FlexBox
                    width={64}
                    height={64}
                    bg="gray.100"
                    borderRadius="50%"
                    alignItems="center"
                    justifyContent="center"
                    mb="1rem"
                  >
                    <LucideIcon name="Send" size={28} color="#999" />
                  </FlexBox>
                  <H3 color="text.secondary" fontSize="1.1rem" mb="0.5rem">
                    {t("form.comingSoon")}
                  </H3>
                  <Paragraph color="text.muted" fontSize="14px">
                    {locale === "fr"
                      ? "En attendant, contactez-nous par email ou téléphone."
                      : "In the meantime, contact us by email or phone."}
                  </Paragraph>
                </FlexBox>
              </Card>
            </Grid>
          </Grid>

          {/* Social Links */}
          <Box mt="3rem" textAlign="center">
            <Paragraph color="text.muted" mb="1rem">
              {locale === "fr" ? "Suivez-nous sur les réseaux sociaux" : "Follow us on social media"}
            </Paragraph>
            <FlexBox justifyContent="center" style={{ gap: "1rem" }}>
              {["Facebook", "Twitter", "Instagram", "Linkedin"].map((social) => (
                <FlexBox
                  key={social}
                  width={44}
                  height={44}
                  bg="gray.100"
                  borderRadius="50%"
                  alignItems="center"
                  justifyContent="center"
                  style={{
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                >
                  <LucideIcon name={social} size={20} color="#666" />
                </FlexBox>
              ))}
            </FlexBox>
          </Box>
        </Box>
      </Container>
    </AppLayout>
  );
}
