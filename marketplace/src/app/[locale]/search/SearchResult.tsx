"use client";

import { Fragment, useCallback, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useTheme } from "styled-components";
import { IconLayoutGrid, IconList, IconAdjustments } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";

import Box from "@component/ui/Box";
import Card from "@component/ui/Card";
import Select from "@component/ui/form/Select";
import Grid from "@component/ui/grid/Grid";
import FlexBox from "@component/ui/FlexBox";
import Spinner from "@component/ui/Spinner";
import { IconButton } from "@component/ui/buttons";
import Sidenav from "@component/ui/sidenav";
import { H5, Paragraph } from "@component/ui/Typography";

import ProductGridView from "@component/products/ProductGridView";
import ProductListView from "@component/products/ProductListView";
import ProductFilterCard from "@component/products/ProductFilterCard";

import useWindowSize from "@hook/useWindowSize";
import { getAds } from "@/services/ads.service";

export default function SearchResult() {
  const theme = useTheme();
  const width = useWindowSize();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("search");

  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");

  const isTablet = width < 1025;

  // Extract filter values from URL
  const searchQuery = searchParams.get("search") || "";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";
  const categoryId = searchParams.get("categoryId") || "";
  const subCategoryId = searchParams.get("subCategoryId") || "";
  const type = searchParams.get("type") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";

  const sortOptions = [
    { label: t("sortRecent"), value: "createdAt-desc" },
    { label: t("sortOldest"), value: "createdAt-asc" },
    { label: t("sortPriceLow"), value: "price-asc" },
    { label: t("sortPriceHigh"), value: "price-desc" },
  ];

  const currentSortValue = `${sortBy}-${sortOrder}`;
  const currentSortOption = sortOptions.find((opt) => opt.value === currentSortValue) || sortOptions[0];

  // React Query for fetching products
  const { data, isLoading } = useQuery({
    queryKey: ["ads", { searchQuery, currentPage, sortBy, sortOrder, categoryId, subCategoryId, type, minPrice, maxPrice }],
    queryFn: async () => {
      const params: Record<string, string> = {
        page: currentPage.toString(),
        limit: "20",
        sortBy,
        sortOrder,
      };

      if (searchQuery) params.search = searchQuery;
      if (categoryId) params.categoryId = categoryId;
      if (subCategoryId) params.subCategoryId = subCategoryId;
      if (type) params.type = type;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      return getAds(params);
    },
  });

  const products = data?.products || [];
  const meta = data?.meta || { total: 0, page: 1, totalPages: 1 };

  const handleOpenSidenav = useCallback(() => setOpen(true), []);
  const handleCloseSidenav = useCallback(() => setOpen(false), []);
  const toggleView = useCallback((v: "grid" | "list") => () => setView(v), []);

  const handleSortChange = useCallback(
    (option: { value: string } | null) => {
      if (!option) return;
      const [newSortBy, newSortOrder] = option.value.split("-");
      const params = new URLSearchParams(searchParams.toString());
      params.set("sortBy", newSortBy);
      params.set("sortOrder", newSortOrder);
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", page.toString());
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router]
  );

  return (
    <Fragment>
      {/* HEADER */}
      <FlexBox
        as={Card}
        mb="55px"
        p="1.25rem"
        elevation={5}
        flexWrap="wrap"
        borderRadius={12}
        alignItems="center"
        justifyContent="space-between">
        <div>
          <H5>
            {searchQuery
              ? `${t("searchingFor")} "${searchQuery}"`
              : t("allProducts")}
          </H5>
          <Paragraph color="text.muted">
            {meta.total} {t("results")}
          </Paragraph>
        </div>

        <FlexBox alignItems="center" flexWrap="wrap" style={{ gap: "1rem" }}>
          <FlexBox alignItems="center">
            <Paragraph color="text.muted" mr="0.5rem">
              {t("sortBy")}:
            </Paragraph>

            <Box minWidth="180px">
              <Select
                placeholder={t("sortBy")}
                value={currentSortOption}
                options={sortOptions}
                onChange={handleSortChange}
              />
            </Box>
          </FlexBox>

          <FlexBox alignItems="center">
            <Paragraph color="text.muted" mr="0.5rem">
              {t("view")}:
            </Paragraph>

            <IconButton onClick={toggleView("grid")}>
              <IconLayoutGrid
                size={22}
                color={view === "grid" ? theme.colors.primary.main : theme.colors.text.muted}
              />
            </IconButton>

            <IconButton onClick={toggleView("list")}>
              <IconList
                size={22}
                color={view === "list" ? theme.colors.primary.main : theme.colors.text.muted}
              />
            </IconButton>

            {isTablet && (
              <Sidenav
                position="left"
                open={open}
                scroll={true}
                onClose={handleCloseSidenav}
                handle={
                  <IconButton onClick={handleOpenSidenav}>
                    <IconAdjustments size={22} />
                  </IconButton>
                }>
                <Box p="1rem">
                  <ProductFilterCard onFilterChange={handleCloseSidenav} />
                </Box>
              </Sidenav>
            )}
          </FlexBox>
        </FlexBox>
      </FlexBox>

      {/* CONTENT */}
      <Grid container spacing={6}>
        {/* SIDEBAR - Desktop only */}
        {!isTablet && (
          <Grid item lg={3} xs={12}>
            <ProductFilterCard />
          </Grid>
        )}

        {/* PRODUCTS */}
        <Grid item lg={isTablet ? 12 : 9} xs={12}>
          {isLoading ? (
            <FlexBox justifyContent="center" alignItems="center" minHeight="300px">
              <Spinner size={40} />
            </FlexBox>
          ) : products.length === 0 ? (
            <FlexBox justifyContent="center" alignItems="center" minHeight="300px">
              <Paragraph color="text.muted">{t("noResults")}</Paragraph>
            </FlexBox>
          ) : view === "grid" ? (
            <ProductGridView
              products={products}
              total={meta.total}
              page={meta.page}
              totalPages={meta.totalPages}
              onPageChange={handlePageChange}
            />
          ) : (
            <ProductListView
              products={products}
              total={meta.total}
              page={meta.page}
              totalPages={meta.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </Grid>
      </Grid>
    </Fragment>
  );
}
