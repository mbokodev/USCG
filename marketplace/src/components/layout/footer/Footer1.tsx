import Link from "next/link";

import Box from "@component/ui/Box";
import Image from "@component/ui/Image";
import Grid from "@component/ui/grid/Grid";
import Icon from "@component/ui/icon/Icon";
import FlexBox from "@component/ui/FlexBox";
import AppStore from "@component/ui/AppStore";
import Container from "@component/ui/Container";
import Typography, { Paragraph } from "@component/ui/Typography";
// STYLED COMPONENTS
import { StyledLink } from "./styles";
// CUSTOM DATA
import { aboutLinks, customerCareLinks, iconList } from "./data";

export default function Footer1() {
  return (
    <footer>
      <Box bg="#0F3460">
        <Container p="1rem" color="white">
          <Box py="5rem" overflow="hidden">
            <Grid container spacing={6}>
              <Grid item lg={4} md={6} sm={6} xs={12}>
                <Link href="/">
                  <Image alt="USCG" mb="1rem" src="/assets/logo/logo-white.png" width={180} />
                </Link>

                <Paragraph mb="1.25rem" color="gray.500" maxWidth="320px">
                  Votre marketplace de confiance au Congo. Achetez et vendez en toute simplicité :
                  immobilier, véhicules, électroménager et bien plus encore. Connectez-vous avec
                  des vendeurs vérifiés près de chez vous.
                </Paragraph>

                <AppStore />
              </Grid>

              <Grid item lg={3} md={6} sm={6} xs={12}>
                <Typography mb="1.25rem" lineHeight="1" fontSize={20} fontWeight="600">
                  Customer Care
                </Typography>

                <div>
                  {customerCareLinks.map((item, ind) => (
                    <StyledLink href="/" key={ind}>
                      {item}
                    </StyledLink>
                  ))}
                </div>
              </Grid>

              <Grid item lg={2} md={6} sm={6} xs={12}>
                <Typography mb="1.25rem" lineHeight="1" fontSize={20} fontWeight="600">
                  About Us
                </Typography>

                <div>
                  {aboutLinks.map((item, ind) => (
                      <StyledLink href="/" key={ind}>
                        {item}
                      </StyledLink>
                  ))}
                </div>
              </Grid>

              <Grid item lg={3} md={6} sm={6} xs={12}>
                <Typography mb="1.25rem" lineHeight="1" fontSize={20} fontWeight="600">
                  Contact Us
                </Typography>

                <Typography py="0.3rem" color="gray.500">
                  Carrefour Raffinerie - Siafoumou Bloc 7-8
                </Typography>

                <Typography py="0.3rem" color="gray.500">
                  Email: support@universal-services-cg.com.com
                </Typography>

                <Typography py="0.3rem" mb="1rem" color="gray.500">
                  Phone: +242 06 654 40 11
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
