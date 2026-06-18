"use client";

import { useCallback, useState, useMemo } from "react";

import Box from "@component/ui/Box";
import Hidden from "@component/ui/hidden";
import Grid from "@component/ui/grid/Grid";
import FlexBox from "@component/ui/FlexBox";
import Container from "@component/ui/Container";
import { ProductCard1 } from "@component/products/cards";
import CategorySectionHeader from "@component/products/CategorySectionHeader";
import StyledProductCategory from "./styled";
import Product from "@models/product.model";
import type { IFilter, FilterType, I18nText, ICategory, ISubCategory } from "@uscg/shared/types";

// ==============================================================
interface SectionInfo {
  id: string;
  title: I18nText;
  filterType: FilterType;
  limit: number;
  category?: ICategory | null;
  subCategory?: ISubCategory | null;
}

type Props = {
  section: SectionInfo;
  products: Product[];
  filters: IFilter[];
  locale?: "fr" | "en";
  onFilterChange?: (sectionId: string, filterValue: string | null) => void;
};
// ==============================================================

// Max filters to display in sidebar
const MAX_FILTERS = 7;

// Max ads to display
const MAX_DISPLAY = 9;

export default function Section6({
  section,
  products,
  filters,
  locale = "fr",
  onFilterChange,
}: Props) {
  // Limit filters to max 7 and pre-select the first one
  const displayedFilters = filters.slice(0, MAX_FILTERS);
  const firstFilterValue = displayedFilters[0]?.value || null;

  const [selectedFilter, setSelectedFilter] = useState<string | null>(firstFilterValue);

  // Get title in current locale
  const title = section.title[locale] || section.title.fr || "";

  // Build "See More" link with search params
  const seeMoreLink = useMemo(() => {
    const params = new URLSearchParams();

    if (section.category?.id) {
      params.set("category", section.category.id);
    }
    if (section.subCategory?.id) {
      params.set("subcategory", section.subCategory.id);
    }
    if (selectedFilter) {
      if (section.filterType === "CITY") {
        params.set("city", selectedFilter);
      } else if (section.filterType === "SUBCATEGORY") {
        params.set("subcategory", selectedFilter);
      }
    }

    const queryString = params.toString();
    return queryString ? `/search?${queryString}` : "/search";
  }, [section.category?.id, section.subCategory?.id, section.filterType, selectedFilter]);

  // Filter products based on selected filter and filterType (max 9 displayed)
  const filteredProducts = useMemo(() => {


    let filtered = products;

    if (selectedFilter) {
      filtered = products.filter((product) => {
        switch (section.filterType) {
          case "CITY":
            return product.city === selectedFilter;
          case "SUBCATEGORY":
            return product.subCategoryId === selectedFilter;
          default:
            return true;
        }
      });
    }

    return filtered.slice(0, MAX_DISPLAY);
  }, [products, selectedFilter, section.filterType]);

  const handleFilterClick = useCallback(
    (filter: IFilter) => () => {
      const newValue = selectedFilter === filter.value ? null : filter.value;
      setSelectedFilter(newValue);
      onFilterChange?.(section.id, newValue);
    },
    [selectedFilter, section.id, onFilterChange]
  );

  // Don't render filters if filterType is NONE or no filters available
  const showFilters = section.filterType !== "NONE" && displayedFilters.length > 0;

  return (
    <Container mb="80px">
      <FlexBox>
        {/* Sidebar filters */}
        {showFilters && (
          <Hidden down={768} mr="1.75rem">
            <Box shadow={6} borderRadius={10} padding="1.25rem" bg="white" minWidth="240px">
              {displayedFilters.map((filter) => {
                const isSelected = selectedFilter === filter.value;
                return (
                  <StyledProductCategory
                    mb="0.75rem"
                    key={filter.value}
                    onClick={handleFilterClick(filter)}
                    bg={isSelected ? "primary.main" : "gray.100"}
                    color={isSelected ? "white" : "text.primary"}
                  >
                    <span className="product-category-title" style={{ marginLeft: 0 }}>
                      {filter.label}
                      {filter.count !== undefined && (
                        <span style={{
                          fontSize: "14px",
                          color: isSelected ? "rgba(255,255,255,0.8)" : "#666",
                          marginLeft: "8px"
                        }}>
                          ({filter.count})
                        </span>
                      )}
                    </span>
                  </StyledProductCategory>
                );
              })}

              {/*{selectedFilter && (*/}
              {/*  <StyledProductCategory*/}
              {/*    mt="1rem"*/}
              {/*    onClick={() => {*/}
              {/*      setSelectedFilter(null);*/}
              {/*      onFilterChange?.(section.id, null);*/}
              {/*    }}*/}
              {/*    bg="gray.100"*/}
              {/*  >*/}
              {/*    <span className="product-category-title show-all">*/}
              {/*      {locale === "fr" ? "Tout afficher" : "Show all"}*/}
              {/*    </span>*/}
              {/*  </StyledProductCategory>*/}
              {/*)}*/}
            </Box>
          </Hidden>
        )}

        {/* Products grid */}
        <Box flex="1 1 0" minWidth="0px">
          <CategorySectionHeader title={title} seeMoreLink={seeMoreLink} locale={locale} />

          {filteredProducts.length === 0 ? (
            <Box textAlign="center" py="3rem" color="text.muted">
              {locale === "fr"
                ? "Aucune annonce disponible"
                : "No ads available"}
            </Box>
          ) : (
            <Grid container spacing={6}>
              {filteredProducts.map((item) => (
                <Grid item lg={showFilters ? 4 : 3} sm={6} xs={12} key={item.id}>
                  <ProductCard1
                    hoverEffect
                    id={item.id}
                    slug={item.slug || item.id}
                    title={item.title}
                    price={item.price || 0}
                    off={item.discount}
                    rating={item.rating}
                    imgUrl={item.thumbnail}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </FlexBox>
    </Container>
  );
}
