"use client";

import { PropsWithChildren } from "react";
import Grid from "@component/ui/grid/Grid";
import Container from "@component/ui/Container";
import DashboardNavigation from "./Navigation";
import { StyledGrid } from "./styles";

export default function CustomerDashboardLayout({ children }: PropsWithChildren) {
  return (
    <Container my="2rem" style={{ minHeight: "calc(100vh - 200px)" }}>
      <Grid container spacing={6}>
        <StyledGrid item lg={3} xs={12}>
          <DashboardNavigation />
        </StyledGrid>

        <Grid item lg={9} xs={12}>
          {children}
        </Grid>
      </Grid>
    </Container>
  );
}
