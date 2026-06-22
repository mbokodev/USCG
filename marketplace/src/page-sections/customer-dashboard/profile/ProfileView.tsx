"use client";

import Link from "next/link";
import { Fragment } from "react";
import { useTranslations } from "next-intl";
import { IconUserFilled } from "@tabler/icons-react";

import { useAuth } from "@/features/auth/hooks/useAuth";
import Box from "@component/ui/Box";
import Card from "@component/ui/Card";
import Grid from "@component/ui/grid/Grid";
import FlexBox from "@component/ui/FlexBox";
import TableRow from "@component/ui/TableRow";
import { Button } from "@component/ui/buttons";
import { H3, Small, Paragraph } from "@component/ui/Typography";
import { DashboardPageHeader } from "@component/layout/customer-dashboard";

export default function ProfileView() {
  const t = useTranslations("profile");
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box p="2rem" textAlign="center">
        <Paragraph>{t("loading")}</Paragraph>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box p="2rem" textAlign="center">
        <Paragraph>{t("notFound")}</Paragraph>
      </Box>
    );
  }

  const HEADER_LINK = (
    <Link href="/profile/edit">
      <Button color="primary" variant="contained">
        {t("editProfile")}
      </Button>
    </Link>
  );

  const orderStats = [
    { title: "0", subtitle: t("stats.allOrders") },
    { title: "0", subtitle: t("stats.pendingOrders") },
    { title: "0", subtitle: t("stats.cancelledOrders") },
  ];

  return (
    <Fragment>
      <DashboardPageHeader
        title={t("title")}
        button={HEADER_LINK}
        Icon={<IconUserFilled size={27} />}
      />

      <TableRow
        p="0.75rem 1.5rem"
        borderRadius={12}
        boxShadow="none"
        border="1px solid"
        borderColor="gray.200"
        mb="30px"
      >
        <FlexBox flexDirection="column" p="0.5rem">
          <Small color="text.muted" mb="4px">
            {t("fields.firstName")}
          </Small>
          <span>{user.firstName || "-"}</span>
        </FlexBox>

        <FlexBox flexDirection="column" p="0.5rem">
          <Small color="text.muted" mb="4px">
            {t("fields.lastName")}
          </Small>
          <span>{user.lastName || "-"}</span>
        </FlexBox>

        <FlexBox flexDirection="column" p="0.5rem">
          <Small color="text.muted" mb="4px">
            {t("fields.email")}
          </Small>
          <span>{user.email || "-"}</span>
        </FlexBox>

        <FlexBox flexDirection="column" p="0.5rem">
          <Small color="text.muted" mb="4px" textAlign="left">
            {t("fields.phone")}
          </Small>
          <span>{user.phone || "-"}</span>
        </FlexBox>
      </TableRow>

      <Grid container spacing={4}>
        {orderStats.map((item) => (
          <Grid item lg={4} sm={6} xs={6} key={item.subtitle}>
            <Card
              style={{
                height: "100%",
                padding: "1.5rem 1.25rem",
                borderRadius: 12,
                alignItems: "center",
                flexDirection: "column",
                justifyContent: "center",
                textAlign: "center",
                boxShadow: "none",
                display: "flex",
              }}
              border="1px solid"
              borderColor="gray.200"
            >
              <H3 color="primary.main" my="0px" fontWeight="600">
                {item.title}
              </H3>

              <Small color="text.muted" textAlign="center">
                {item.subtitle}
              </Small>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Fragment>
  );
}
