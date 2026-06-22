"use client";

import { Fragment } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  IconUser,
  IconLogout,
  IconBuildingStore,
  IconShoppingCart,
  IconHeart,
  IconMapPin,
} from "@tabler/icons-react";

import { useAuth } from "@/features/auth/hooks/useAuth";
import Box from "@component/ui/Box";
import FlexBox from "@component/ui/FlexBox";
import { Button } from "@component/ui/buttons";
import { Paragraph } from "@component/ui/Typography";
import { DashboardNavigationWrapper, StyledDashboardNav } from "./styles";

export default function DashboardNavigation() {
  const t = useTranslations("profile");
  const pathname = usePathname();
  const { isSeller, logout, isLoggingOut } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const NAVIGATION_LINKS = [
    {
      title: t("nav.dashboard"),
      links: [
        {
          href: "/orders",
          title: t("nav.orders"),
          Icon: IconShoppingCart,
        },
        {
          href: "/wishlist",
          title: t("nav.wishlist"),
          Icon: IconHeart,
        },
        {
          href: "/addresses",
          title: t("nav.addresses"),
          Icon: IconMapPin,
        },
      ],
    },
    {
      title: t("nav.account"),
      links: [
        {
          href: "/profile",
          title: t("nav.myProfile"),
          Icon: IconUser,
        },
      ],
    },
    // Section VENDEUR uniquement si isSeller
    ...(isSeller
      ? [
          {
            title: t("nav.seller"),
            links: [
              {
                href: process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3002",
                title: t("nav.sellerDashboard"),
                Icon: IconBuildingStore,
                external: true,
              },
            ],
          },
        ]
      : []),
  ];

  return (
    <Box>
      <DashboardNavigationWrapper px="0px" py="1.5rem" color="gray.900" borderRadius={8}>
        {NAVIGATION_LINKS.map((navGroup) => (
          <Fragment key={navGroup.title}>
            <Paragraph p="26px 30px 1rem" color="text.muted" fontSize="12px">
              {navGroup.title}
            </Paragraph>

            {navGroup.links.map(({ Icon, href, title, external }) =>
              external ? (
                <StyledDashboardNav
                  key={title}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  isActive={false}
                >
                  <FlexBox alignItems="center" style={{ gap: 8 }}>
                    <Icon size={20} className="icon" />
                    <span>{title}</span>
                  </FlexBox>
                </StyledDashboardNav>
              ) : (
                <StyledDashboardNav key={title} href={href} isActive={pathname.includes(href)}>
                  <FlexBox alignItems="center" style={{ gap: 8 }}>
                    <Icon size={20} className="icon" />
                    <span>{title}</span>
                  </FlexBox>
                </StyledDashboardNav>
              )
            )}
          </Fragment>
        ))}
      </DashboardNavigationWrapper>

      {/* Logout button - outside card */}
      <Button
        mt="1rem"
        fullWidth
        color="error"
        variant="outlined"
        onClick={handleLogout}
        disabled={isLoggingOut}
      >
        <FlexBox alignItems="center" justifyContent="center" style={{ gap: 8 }}>
          <IconLogout size={18} />
          <span>{isLoggingOut ? t("nav.loggingOut") : t("nav.logout")}</span>
        </FlexBox>
      </Button>
    </Box>
  );
}
