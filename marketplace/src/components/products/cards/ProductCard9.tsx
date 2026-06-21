"use client";

import Link from "next/link";
import styled from "styled-components";
import { IconEye, IconHeart } from "@tabler/icons-react";

import Box from "@component/ui/Box";
import Card from "@component/ui/Card";
import Chip from "@component/ui/Chip";
import Grid from "@component/ui/grid/Grid";
import FlexBox from "@component/ui/FlexBox";
import NavLink from "@component/ui/nav-link";
import NextImage from "@component/ui/NextImage";
import DefaultImage from "@component/ui/DefaultImage";
import { IconButton } from "@component/ui/buttons";
import { H5, SemiSpan } from "@component/ui/Typography";

import { calculateDiscount, currency } from "@utils/utils";

// STYLED COMPONENT
const Wrapper = styled(Card)`
  border-radius: 12px;

  .quick-view {
    top: 0.75rem;
    display: none;
    right: 0.75rem;
    cursor: pointer;
    position: absolute;
  }

  .categories {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    display: flex;

    .link {
      font-size: 14px;
      margin-right: 0.5rem;
      text-decoration: underline;
      color: ${({ theme }) => theme.colors.text.hint};
    }
  }

  h4 {
    text-align: left;
    margin: 0.5rem 0px;
    color: ${({ theme }) => theme.colors.text.secondary};
  }

  .price {
    display: flex;
    font-weight: 600;
    margin-top: 0.5rem;

    h4 {
      margin: 0px;
      padding-right: 0.5rem;
      color: ${({ theme }) => theme.colors.primary.main};
    }
    del {
      color: ${({ theme }) => theme.colors.text.hint};
    }
  }

  .icon-holder {
    display: flex;
    align-items: flex-end;
    flex-direction: column;
    justify-content: space-between;
  }

  .favorite-icon {
    cursor: pointer;
  }

  .outlined-icon {
    svg path {
      fill: ${({ theme }) => theme.colors.text.hint};
    }
  }

  &:hover {
    .quick-view {
      display: block;
    }
  }
`;

// ============================================================================
type ProductCard9Props = {
  off?: number;
  slug: string;
  title: string;
  price: number;
  salePrice?: number;
  imgUrl?: string;
  category?: string;
  id?: string | number;
  [key: string]: unknown;
};
// ============================================================================

export default function ProductCard9({
  id,
  off,
  slug,
  title,
  price,
  salePrice,
  imgUrl,
  category,
  ...props
}: ProductCard9Props) {
  return (
    <Wrapper overflow="hidden" width="100%" {...props}>
      <Grid container spacing={1} alignItems="stretch">
        <Grid item md={3} sm={4} xs={12}>
          <Box position="relative" height="100%" minHeight="150px">
            {!!off && (
              <Chip
                top="10px"
                left="10px"
                p="5px 10px"
                fontSize="10px"
                fontWeight="600"
                bg="primary.main"
                position="absolute"
                color="primary.text"
                zIndex={1}>
                {off}% off
              </Chip>
            )}

            <Box className="quick-view">
              <IconButton size="small" style={{ width: 35, height: 35, padding: "0.5rem" }}>
                <IconEye size={18} />
              </IconButton>
            </Box>

            <Link href={`/product/${slug}`} style={{ display: "block", height: "100%" }}>
              {imgUrl ? (
                <NextImage
                  alt={title}
                  src={imgUrl}
                  fill
                  style={{ borderRadius: "0.5rem", objectFit: "cover" }}
                />
              ) : (
                <DefaultImage />
              )}
            </Link>
          </Box>
        </Grid>

        <Grid item md={8} sm={7} xs={12}>
          <FlexBox flexDirection="column" justifyContent="center" height="100%" p="1rem">
            {category && (
              <div className="categories">
                <NavLink className="link" href={`/search?categoryId=${category}`}>
                  {category}
                </NavLink>
              </div>
            )}

            <Link href={`/product/${slug}`}>
              <H5 fontWeight="600" my="0.5rem">
                {title}
              </H5>
            </Link>

            <FlexBox mt="0.5rem" mb="1rem" alignItems="center">
              <H5 fontWeight={600} color="primary.main" mr="0.5rem">
                {salePrice ? currency(salePrice) : calculateDiscount(price, off as number)}
              </H5>

              {(!!off || salePrice) && (
                <SemiSpan fontWeight="600">
                  <del>{currency(price)}</del>
                </SemiSpan>
              )}
            </FlexBox>
          </FlexBox>
        </Grid>

        <Grid item flex={1} md={1} xs={12}>
          <FlexBox
            ml="auto"
            p="1rem 0rem"
            width="100%"
            height="100%"
            minWidth="30px"
            alignItems="center"
            flexDirection="column"
            justifyContent="flex-start">
            <IconButton size="small" style={{ width: 35, height: 35, padding: "0.5rem" }}>
              <IconHeart size={18} />
            </IconButton>
          </FlexBox>
        </Grid>
      </Grid>
    </Wrapper>
  );
}
