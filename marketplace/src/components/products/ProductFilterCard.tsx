"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import Card from "@component/ui/Card";
import Divider from "@component/ui/Divider";
import FlexBox from "@component/ui/FlexBox";
import CheckBox from "@component/ui/form/CheckBox";
import TextField from "@component/ui/form/text-field";
import { Accordion, AccordionHeader } from "@component/ui/accordion";
import { H6, Paragraph, SemiSpan } from "@component/ui/Typography";
import { Button } from "@component/ui/buttons";

import { getCategories } from "@/services/categories.service";
import type { ICategory, ISubCategory } from "@uscg/shared/types";

// ==============================================================
interface ProductFilterCardProps {
  onFilterChange?: () => void;
}
// ==============================================================

export default function ProductFilterCard({ onFilterChange }: ProductFilterCardProps) {
  const t = useTranslations("search");
  const tNav = useTranslations("nav");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState<ICategory[]>([]);
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [selectedType, setSelectedType] = useState<string | null>(
    searchParams.get("type") || null
  );

  const currentCategoryId = searchParams.get("categoryId");
  const currentSubCategoryId = searchParams.get("subCategoryId");

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  const updateSearchParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      // Reset to page 1 when filters change
      params.set("page", "1");

      router.push(`${pathname}?${params.toString()}`);
      onFilterChange?.();
    },
    [searchParams, pathname, router, onFilterChange]
  );

  const handleCategoryClick = useCallback(
    (categoryId: string) => {
      if (currentCategoryId === categoryId) {
        // Deselect category
        updateSearchParams({ categoryId: null, subCategoryId: null, search: null });
      } else {
        // Reset search when selecting a category
        updateSearchParams({ categoryId, subCategoryId: null, search: null });
      }
    },
    [currentCategoryId, updateSearchParams]
  );

  const handleSubCategoryClick = useCallback(
    (subCategoryId: string, categoryId: string) => {
      if (currentSubCategoryId === subCategoryId) {
        // Deselect subcategory
        updateSearchParams({ subCategoryId: null, search: null });
      } else {
        // Reset search when selecting a subcategory
        updateSearchParams({ categoryId, subCategoryId, search: null });
      }
    },
    [currentSubCategoryId, updateSearchParams]
  );

  const handleTypeChange = useCallback(
    (type: "SALE" | "RENT") => {
      if (selectedType === type) {
        setSelectedType(null);
        updateSearchParams({ type: null });
      } else {
        setSelectedType(type);
        updateSearchParams({ type });
      }
    },
    [selectedType, updateSearchParams]
  );

  const handlePriceApply = useCallback(() => {
    updateSearchParams({
      minPrice: minPrice || null,
      maxPrice: maxPrice || null,
    });
  }, [minPrice, maxPrice, updateSearchParams]);

  const handleReset = useCallback(() => {
    setMinPrice("");
    setMaxPrice("");
    setSelectedType(null);
    router.push(pathname);
    onFilterChange?.();
  }, [pathname, router, onFilterChange]);

  const renderSubCategories = (subCategories: ISubCategory[], categoryId: string) =>
    subCategories.map((sub) => (
      <Paragraph
        py="6px"
        pl="22px"
        key={sub.id}
        fontSize="14px"
        color={currentSubCategoryId === sub.id ? "primary.main" : "text.muted"}
        fontWeight={currentSubCategoryId === sub.id ? 600 : 400}
        className="cursor-pointer"
        onClick={() => handleSubCategoryClick(sub.id, categoryId)}>
        {typeof sub.name === "object" ? sub.name.fr || sub.name.en : sub.name}
      </Paragraph>
    ));

  return (
    <Card p="18px 27px" elevation={5} borderRadius={12}>
      {/* CATEGORIES */}
      <H6 mb="10px">{tNav("categories")}</H6>

      {categories.map((category) =>
        category.subCategories && category.subCategories.length > 0 ? (
          <Accordion key={category.id} expanded={currentCategoryId === category.id}>
            <AccordionHeader
              px="0px"
              py="6px"
              color={currentCategoryId === category.id ? "primary.main" : "text.muted"}
              onClick={() => handleCategoryClick(category.id)}>
              <SemiSpan
                className="cursor-pointer"
                mr="9px"
                fontWeight={currentCategoryId === category.id ? 600 : 400}>
                {typeof category.name === "object"
                  ? category.name.fr || category.name.en
                  : category.name}
              </SemiSpan>
            </AccordionHeader>

            {renderSubCategories(category.subCategories, category.id)}
          </Accordion>
        ) : (
          <Paragraph
            py="6px"
            fontSize="14px"
            key={category.id}
            color={currentCategoryId === category.id ? "primary.main" : "text.muted"}
            fontWeight={currentCategoryId === category.id ? 600 : 400}
            className="cursor-pointer"
            onClick={() => handleCategoryClick(category.id)}>
            {typeof category.name === "object"
              ? category.name.fr || category.name.en
              : category.name}
          </Paragraph>
        )
      )}

      <Divider mt="18px" mb="24px" />

      {/* PRICE RANGE FILTER */}
      <H6 mb="16px">{t("priceRange")}</H6>
      <FlexBox justifyContent="space-between" alignItems="center" style={{ gap: "0.5rem" }}>
        <TextField
          placeholder={t("minPrice")}
          type="number"
          fullWidth
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />

        <SemiSpan color="text.muted" px="0.25rem">
          -
        </SemiSpan>

        <TextField
          placeholder={t("maxPrice")}
          type="number"
          fullWidth
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
      </FlexBox>

      <Button
        mt="1rem"
        size="small"
        variant="outlined"
        color="primary"
        fullWidth
        onClick={handlePriceApply}>
        {t("apply")}
      </Button>

      <Divider my="24px" />

      {/* TYPE FILTER */}
      <H6 mb="16px">{t("adType")}</H6>
      <CheckBox
        my="10px"
        name="sale"
        value="SALE"
        color="secondary"
        checked={selectedType === "SALE"}
        label={<SemiSpan color="inherit">{t("typeSale")}</SemiSpan>}
        onChange={() => handleTypeChange("SALE")}
      />
      <CheckBox
        my="10px"
        name="rent"
        value="RENT"
        color="secondary"
        checked={selectedType === "RENT"}
        label={<SemiSpan color="inherit">{t("typeRent")}</SemiSpan>}
        onChange={() => handleTypeChange("RENT")}
      />

      <Divider my="24px" />

      {/* RESET BUTTON */}
      <Button size="small" variant="text" color="primary" fullWidth onClick={handleReset}>
        {t("reset")}
      </Button>
    </Card>
  );
}
