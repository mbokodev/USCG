import Link from "next/link";

import Box from "@component/ui/Box";
import Card from "@component/ui/Card";
import Grid from "@component/ui/grid/Grid";
import FlexBox from "@component/ui/FlexBox";
import NavLink from "@component/ui/nav-link";
import NextImage from "@component/ui/NextImage";
import { SemiSpan } from "@component/ui/Typography";
import { StyledMegaMenu1 } from "./styles";
import { MegaMenu1Props } from "./type";

export default function MegaMenu1({
  data: { categories, rightImage, bottomImage },
  minWidth = "760px"
}: MegaMenu1Props) {
  if (!categories || categories.length === 0) return null;

  return (
    <StyledMegaMenu1 className="mega-menu">
      <Card ml="1rem" minWidth={minWidth} boxShadow="regular" overflow="hidden" borderRadius={8}>
        <FlexBox px="1.25rem" py="0.875rem">
          <Box flex="1 1 0">
            <Grid container spacing={4}>
              {categories?.map((item, ind) => (
                <Grid item md={3} key={ind}>
                  {item.href ? (
                    <NavLink className="title-link" href={item.href}>
                      {item.title}
                    </NavLink>
                  ) : (
                    <SemiSpan className="title-link">{item.title}</SemiSpan>
                  )}

                  {item.subCategories?.map((sub, ind) => (
                    <NavLink key={ind} className="child-link" href={sub.href}>
                      {sub.title}
                    </NavLink>
                  ))}
                </Grid>
              ))}
            </Grid>
          </Box>

          {rightImage && (
            <Link href={rightImage.href}>
              <Box position="relative" width="153px" height="100%">
                <NextImage src={rightImage.imgUrl} width={137} height={318} alt="offer" />
              </Box>
            </Link>
          )}
        </FlexBox>

        {bottomImage && (
          <Link href={bottomImage.href}>
            <Box position="relative" height="170px">
              <NextImage src={bottomImage.imgUrl} width={711} height={162} alt="offer" />
            </Box>
          </Link>
        )}
      </Card>
    </StyledMegaMenu1>
  );
}
