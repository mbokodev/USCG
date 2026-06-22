"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import Box from "@component/ui/Box";
import Image from "@component/ui/Image";
import Grid from "@component/ui/grid/Grid";
import Icon from "@component/ui/icon/Icon";
import FlexBox from "@component/ui/FlexBox";
import AppStore from "@component/ui/AppStore";
import Container from "@component/ui/Container";
import Typography, { Paragraph } from "@component/ui/Typography";
// STYLED COMPONENTS
import { StyledLink, LogoWrapper } from "./styles";
// CUSTOM DATA
import { iconList } from "./data";

export default function Footer1() {
  const t = useTranslations("footer");

  const customerCareLinks = [
    { label: t("helpCenter"), href: "/help" },
    { label: t("trackOrder"), href: "/track" },
    { label: t("faq"), href: "/faq" },
  ];

  const aboutLinks = [
    { label: t("aboutUs"), href: "/about" },
    { label: t("terms"), href: "/terms" },
    { label: t("privacy"), href: "/privacy" },
    { label: t("careers"), href: "/careers" },
  ];

  return (
    <footer>
      <Box bg="#0F3460">
        <Container p="1rem" color="white">
          <Box py="5rem" overflow="hidden">
            <Grid container spacing={6}>
              <Grid item lg={4} md={6} sm={6} xs={12}>
                <Link href="/">
                  <LogoWrapper>
                    <Image alt="USCG" mb="1rem" src="/assets/logo/logo-white-full.png" />
                  </LogoWrapper>
                </Link>

                <Paragraph mb="1.25rem" color="gray.500" maxWidth="320px">
                  {t("slogan")}
                </Paragraph>

                <AppStore />
              </Grid>

              <Grid item lg={3} md={6} sm={6} xs={12}>
                <Typography mb="1.25rem" lineHeight="1" fontSize={20} fontWeight="600">
                  {t("customerCare")}
                </Typography>

                <div>
                  {customerCareLinks.map((item, ind) => (
                    <StyledLink href={item.href} key={ind}>
                      {item.label}
                    </StyledLink>
                  ))}
                </div>
              </Grid>

              <Grid item lg={2} md={6} sm={6} xs={12}>
                <Typography mb="1.25rem" lineHeight="1" fontSize={20} fontWeight="600">
                  {t("aboutUs")}
                </Typography>

                <div>
                  {aboutLinks.map((item, ind) => (
                      <StyledLink href={item.href} key={ind}>
                        {item.label}
                      </StyledLink>
                  ))}
                </div>
              </Grid>

              <Grid item lg={3} md={6} sm={6} xs={12}>
                <Typography mb="1.25rem" lineHeight="1" fontSize={20} fontWeight="600">
                  {t("contactUs")}
                </Typography>

                <Typography py="0.3rem" color="gray.500">
                  {t("address")}
                </Typography>

                <Typography py="0.3rem" color="gray.500">
                  Email: {t("email")}
                </Typography>

                <Typography py="0.3rem" mb="1rem" color="gray.500">
                  Phone: {t("phone")}
                </Typography>

                <FlexBox className="flex" mx="-5px">
                  {iconList.map((item) => (
                    <a
                      href={item.url}
                      target="_blank"
                      key={item.iconName}
                      rel="noreferrer noopenner">
                      <Box m="5px" p="10px" size="small" borderRadius="50%" bg="rgba(0,0,0,0.2)">
                        <Icon size="12px" defaultColor="auto">
                          {item.iconName}
                        </Icon>
                      </Box>
                    </a>
                  ))}
                </FlexBox>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>
    </footer>
  );
}
