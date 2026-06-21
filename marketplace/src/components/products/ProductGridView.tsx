"use client";

import { useTranslations } from "next-intl";

import Grid from "@component/ui/grid/Grid";
import FlexBox from "@component/ui/FlexBox";
import Pagination from "@component/ui/pagination";
import { SemiSpan } from "@component/ui/Typography";
import { ProductCard1 } from "@component/products/cards";

import Product from "@models/product.model";
import useWindowSize from "@hook/useWindowSize";

// ==========================================================
interface ProductGridViewProps {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
// ==========================================================

export default function ProductGridView({
  products,
  total,
  page,
  totalPages,
  onPageChange,
}: ProductGridViewProps) {
  const t = useTranslations("search");
  const width = useWindowSize();
  const isTablet = width < 1025;

  const startItem = (page - 1) * 20 + 1;
  const endItem = Math.min(page * 20, total);

  return (
    <div>
      <Grid container spacing={6}>
        {products.map((item) => (
          <Grid item lg={4} sm={6} xs={12} key={item.id}>
            <ProductCard1
              id={item.id}
              slug={item.slug || item.id}
              price={item.price}
              title={item.title}
              off={item.discount}
              imgUrl={item.thumbnail}
              salePrice={item.discountedPrice}
            />
          </Grid>
        ))}
      </Grid>

      {products.length > 0 && (
        <FlexBox
          style={{
            gap: "1rem",
            display: "flex",
            flexWrap: "wrap",
            marginTop: "2rem",
            alignItems: "center",
            justifyContent: "space-between",
            flexDirection: isTablet ? "column" : "row",
          }}>
          <SemiSpan>
            {t("showing")} {startItem}-{endItem} {t("of")} {total} {t("products")}
          </SemiSpan>
          {totalPages > 1 && (
            <Pagination pageCount={totalPages} currentPage={page} onChange={onPageChange} />
          )}
        </FlexBox>
      )}
    </div>
  );
}
