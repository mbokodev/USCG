"use client";

import { ReactNode, useCallback, useState } from "react";
import { useTheme } from "styled-components";
import { IconMenu2 } from "@tabler/icons-react";

import Box from "@component/ui/Box";
import FlexBox from "@component/ui/FlexBox";
import { H2, Span } from "@component/ui/Typography";
import useWindowSize from "@/hooks/useWindowSize";
import Sidenav from "@component/ui/sidenav/Sidenav";
import DashboardNavigation from "./Navigation";

interface DashboardPageHeaderProps {
  title?: string;
  Icon?: ReactNode;
  button?: ReactNode;
}

export default function DashboardPageHeader({ Icon, title, button }: DashboardPageHeaderProps) {
  const theme = useTheme();
  const width = useWindowSize();
  const [open, setOpen] = useState(false);

  const isTablet = (width ?? 0) < 1025;

  const handleOpenSidenav = useCallback(() => setOpen(true), []);
  const handleCloseSidenav = useCallback(() => setOpen(false), []);

  return (
    <Box mb="1.5rem" mt="-1rem">
      <FlexBox justifyContent="space-between" alignItems="center" mt="1rem">
        <FlexBox alignItems="center">
          {Icon && (
            <Span color={theme.colors.primary.main} style={{ display: "flex" }}>
              {Icon}
            </Span>
          )}

          {title && (
            <H2 ml="12px" my="0px" lineHeight="1" style={{ whiteSpace: "pre" }}>
              {title}
            </H2>
          )}
        </FlexBox>

        {isTablet && (
          <Sidenav
            open={open}
            position="left"
            scroll
            handle={
              <Span onClick={handleOpenSidenav} style={{ cursor: "pointer", display: "flex" }}>
                <IconMenu2 size={24} />
              </Span>
            }
            onClose={handleCloseSidenav}
          >
            <DashboardNavigation />
          </Sidenav>
        )}

        {!isTablet && button}
      </FlexBox>

      {isTablet && !!button && <Box mt="1rem">{button}</Box>}
    </Box>
  );
}
