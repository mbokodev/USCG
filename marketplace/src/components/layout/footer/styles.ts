"use client";

import Link from "next/link";
import styled from "styled-components";

import { deviceSize } from "@utils/constants";

// STYLED COMPONENTS
export const LogoWrapper = styled.div`
  img {
    width: 180px;
    height: auto;
  }

  @media only screen and (max-width: ${deviceSize.sm}px) {
    img {
      width: 120px;
    }
  }
`;

export const StyledLink = styled(Link)`
  position: relative;
  display: block;
  cursor: pointer;
  border-radius: 4px;
  padding: 0.3rem 0rem;
  color: ${({ theme }) => theme.colors.gray[500]};
  &:hover {
    color: ${({ theme }) => theme.colors.gray[100]};
  }
`;
