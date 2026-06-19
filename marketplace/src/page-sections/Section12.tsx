import { getTranslations } from "next-intl/server";
import Card from "@component/ui/Card";
import Grid from "@component/ui/grid/Grid";
import Icon from "@component/ui/icon/Icon";
import FlexBox from "@component/ui/FlexBox";
import Container from "@component/ui/Container";
import { H4, SemiSpan } from "@component/ui/Typography";

const SERVICES = [
  { id: 1, icon: "truck", titleKey: "delivery", descKey: "deliveryDesc" },
  { id: 2, icon: "credit", titleKey: "secure", descKey: "secureDesc" },
  { id: 3, icon: "customer-service", titleKey: "support", descKey: "supportDesc" },
  { id: 4, icon: "shield", titleKey: "returns", descKey: "returnsDesc" },
];

export default async function Section12() {
  const t = await getTranslations("services");

  return (
    <Container mb="70px">
      <Grid container spacing={6}>
        {SERVICES.map((item) => (
          <Grid item lg={3} md={6} xs={12} key={item.id}>
            <FlexBox
              p="3rem"
              as={Card}
              hoverEffect
              height="100%"
              borderRadius={8}
              boxShadow="border"
              alignItems="center"
              flexDirection="column">
              <FlexBox
                size="64px"
                bg="gray.200"
                alignItems="center"
                borderRadius="300px"
                justifyContent="center">
                <Icon color="secondary" size="1.75rem">
                  {item.icon}
                </Icon>
              </FlexBox>

              <H4 mt="20px" mb="10px" textAlign="center">
                {t(item.titleKey)}
              </H4>

              <SemiSpan textAlign="center">{t(item.descKey)}</SemiSpan>
            </FlexBox>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
