"use client";

import { Fragment } from "react";
import { useTranslations } from "next-intl";

import FlexBox from "@component/ui/FlexBox";
import Pagination from "@component/ui/pagination";
import { SemiSpan } from "@component/ui/Typography";
import { ProductCard9 } from "@component/products/cards";

import Product from "@models/product.model";

// ==========================================================
interface ProductListViewProps {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
// ==========================================================

export default function ProductListView({
  products,
  total,
  page,
  totalPages,
  onPageChange,
}: ProductListViewProps) {
  const t = useTranslations("search");

  const startItem = (page - 1) * 20 + 1;
  const endItem = Math.min(page * 20, total);

  return (
    <Fragment>
      {products.map((item) => (
        <ProductCard9
          mb="1.25rem"
          id={item.id}
          key={item.id}
          slug={item.slug || item.id}
          price={item.price}
          title={item.title}
          off={item.discount}
          imgUrl={item.thumbnail}
          salePrice={item.discountedPrice}
          category={
            typeof item.category?.name === "object"
              ? item.category.name.fr || item.category.name.en
              : item.category?.name
          }
        />
      ))}

      {products.length > 0 && (
        <FlexBox
          flexWrap="wrap"
          justifyContent="space-between"
          alignItems="center"
          mt="32px">
          <SemiSpan>
            {t("showing")} {startItem}-{endItem} {t("of")} {total} {t("products")}
          </SemiSpan>
          {totalPages > 1 && (
            <Pagination pageCount={totalPages} currentPage={page} onChange={onPageChange} />
          )}
        </FlexBox>
      )}
    </Fragment>
  );
}
