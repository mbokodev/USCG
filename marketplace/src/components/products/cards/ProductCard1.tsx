"use client";

import Link from "next/link";
import styled, { useTheme } from "styled-components";
import { IconEye, IconHeart } from "@tabler/icons-react";

import Box from "@component/ui/Box";
import Rating from "@component/ui/rating";
import Chip from "@component/ui/Chip";
import FlexBox from "@component/ui/FlexBox";
import NextImage from "@component/ui/NextImage";
import DefaultImage from "@component/ui/DefaultImage";
import Card, { CardProps } from "@component/ui/Card";
import { H3, SemiSpan } from "@component/ui/Typography";
import { IconButton } from "@component/ui/buttons";

import { calculateDiscount, currency } from "@utils/utils";
import { deviceSize } from "@utils/constants";

// STYLED COMPONENT
const Wrapper = styled(Card)`
  height: 100%;
  display: flex;
  overflow: hidden;
  flex-direction: column;
  justify-content: space-between;
  transition: all 250ms ease-in-out;

  &:hover {
    .image-holder {
      .extra-icons {
        display: flex;
      }
    }
  }

  .image-holder {
    text-align: center;
    position: relative;
    display: block;
    height: 220px;
    padding: 0.75rem;
    overflow: hidden;

    a {
      display: block;
      width: 100%;
      height: 100%;
    }

    img {
      width: 100% !important;
      height: 100% !important;
      object-fit: cover !important;
      border-radius: 8px;
    }

    .extra-icons {
      z-index: 2;
      top: 1.25rem;
      display: none;
      right: 1.25rem;
      cursor: pointer;
      position: absolute;
      flex-direction: column;
      gap: 0.25rem;
    }

    @media only screen and (max-width: ${deviceSize.sm}px) {
      height: 180px;
      padding: 0.5rem;
    }

    @media only screen and (max-width: 450px) {
      height: 220px;
      padding: 0.75rem;
    }
  }

  .details {
    padding: 1rem;

    .title,
    .categories {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    @media only screen and (max-width: ${deviceSize.sm}px) {
      padding: 0.75rem;
    }
  }
`;

// =======================================================================
interface ProductCard1Props extends CardProps {
  off?: number;
  slug: string;
  title: string;
  price: number;
  salePrice?: number;
  imgUrl?: string;
  rating?: number;
  images?: string[];
  id?: string | number;
}
// =======================================================================

export default function ProductCard1({
  id,
  off,
  slug,
  title,
  price,
  salePrice,
  imgUrl,
  rating = 4,
  ...props
}: ProductCard1Props) {
  const theme = useTheme();

  return (
    <Wrapper borderRadius={12} {...props}>
      <div className="image-holder">
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

        <FlexBox className="extra-icons">
          <IconButton size="small" style={{ width: 35, height: 35, padding: "0.5rem" }}>
            <IconEye size={18} color={theme.colors.gray[500]} />
          </IconButton>

          <IconButton size="small" style={{ width: 35, height: 35, padding: "0.5rem" }}>
            <IconHeart size={18} color={theme.colors.gray[500]} />
          </IconButton>
        </FlexBox>

        <Link href={`/product/${slug}`}>
          {imgUrl ? (
            <NextImage alt={title} src={imgUrl} width={270}  height={210} />
          ) : (
            <DefaultImage />
          )}
        </Link>
      </div>

      <div className="details">
        <Box flex="1 1 0" minWidth="0px">
          <Link href={`/product/${slug}`}>
            <H3
              mb="10px"
              title={title}
              fontSize="14px"
              textAlign="left"
              fontWeight="600"
              className="title"
              color="text.secondary">
              {title}
            </H3>
          </Link>

          {/*<Rating value={rating || 0} outof={5} color="warn" readOnly />*/}

          <FlexBox alignItems="center" mt="10px">
            <SemiSpan pr="0.5rem" fontWeight="600" color="primary.main">
              {salePrice ? currency(salePrice) : calculateDiscount(price, off as number)}
            </SemiSpan>

            {(!!off || salePrice) && (
              <SemiSpan color="text.muted" fontWeight="600">
                <del>{currency(price)}</del>
              </SemiSpan>
            )}
          </FlexBox>
        </Box>
      </div>
    </Wrapper>
  );
}
