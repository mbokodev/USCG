"use client";

import Image from "next/image";
import styled from "styled-components";

const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LogoText = styled.span`
  font-size: 28px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.primary.main};
  letter-spacing: -1px;
`;

export default function Logo() {
  return (
    <LogoWrapper>
      <Image src="/assets/logo/logo.png" alt="USCG" width={40} height={40} />
      <LogoText>USCG</LogoText>
    </LogoWrapper>
  );
}
