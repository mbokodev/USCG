"use client";

import { PropsWithChildren, ReactElement } from "react";
import Topbar from "@component/layout/topbar";
import Sticky from "@component/ui/sticky";
import { Header } from "@component/layout/header";
import { Footer1 } from "@component/layout/footer";
import MobileNavigationBar from "@component/layout/mobile-navigation";
import { StyledRoot } from "./styles";
import type { NavigationItem } from "@/utils/category-utils";

// ===============================================================================
interface Props {
  title?: string;
  navbar?: ReactElement;
  categories?: NavigationItem[];
}
// ===============================================================================

export default function ShopLayout({ navbar, children, categories = [] }: PropsWithChildren<Props>) {
  return (
    <StyledRoot>
      <Topbar />

      <Sticky fixedOn={0} scrollDistance={300}>
        <Header categories={categories} />
      </Sticky>

      {navbar ? (
        <>
          <div className="section-after-sticky">{navbar}</div>
          {children}
        </>
      ) : (
        <div className="section-after-sticky">{children}</div>
      )}

      <MobileNavigationBar />

      <Footer1 />
    </StyledRoot>
  );
}
