"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { IconChevronDown, IconSearch } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

import Box from "@component/ui/Box";
import Menu from "@component/ui/menu/Menu";
import Card from "@component/ui/Card";
import FlexBox from "@component/ui/FlexBox";
import MenuItem from "@component/ui/MenuItem";
import { Span } from "@component/ui/Typography";
import TextField from "@component/ui/form/text-field";
import StyledSearchBox from "./styled";

import { searchAds } from "@/services/ads.service";
import { currency } from "@/utils/utils";
import type { CategoryOption } from "@/utils/category-utils";

const dropdownVariants = {
  hidden: { y: -10, opacity: 0, scale: 0.95 },
  visible: {
    y: 0,
    scale: 1,
    opacity: 1,
    transition: { duration: 0.2, ease: "easeOut" as const }
  },
  exit: { y: -10, opacity: 0, scale: 0.95, transition: { duration: 0.15 } }
};

interface SearchInputWithCategoryProps {
  categories?: CategoryOption[];
}

export default function SearchInputWithCategory({ categories = [] }: SearchInputWithCategoryProps) {
  const router = useRouter();
  const t = useTranslations("common");
  const tNav = useTranslations("nav");

  const [searchValue, setSearchValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryOption>({
    label: tNav("allCategories"),
    slug: "",
    id: ""
  });

  const debouncedSearch = useDebouncedValue(searchValue, 300);

  const allCategories: CategoryOption[] = useMemo(
    () => [{ label: tNav("allCategories"), slug: "", id: "" }, ...categories],
    [categories, tNav]
  );

  const { data: resultList = [], isLoading } = useQuery({
    queryKey: ["search-autocomplete", debouncedSearch, selectedCategory.id],
    queryFn: () => searchAds(debouncedSearch, selectedCategory.id || undefined),
    enabled: debouncedSearch.length >= 2,
  });

  const handleCategoryChange = (cat: CategoryOption) => () => {
    setSelectedCategory(cat);
  };

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchValue(event.target.value);
      setIsOpen(true);
    },
    []
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter" && searchValue.trim()) {
        setIsOpen(false);

        const params = new URLSearchParams({ search: searchValue.trim() });
        if (selectedCategory.id) {
          params.append("categoryId", selectedCategory.id);
        }

        router.push(`/search?${params.toString()}`);
      }
    },
    [searchValue, selectedCategory.id, router]
  );

  const handleResultClick = useCallback(
    (productId: string) => {
      setIsOpen(false);
      setSearchValue("");
      router.push(`/product/${productId}`);
    },
    [router]
  );

  const handleViewAllClick = useCallback(() => {
    setIsOpen(false);

    const params = new URLSearchParams({ search: searchValue.trim() });
    if (selectedCategory.id) {
      params.append("categoryId", selectedCategory.id);
    }

    router.push(`/search?${params.toString()}`);
  }, [searchValue, selectedCategory.id, router]);

  const handleDocumentClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest(".search-box-container")) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("click", handleDocumentClick);
    return () => window.removeEventListener("click", handleDocumentClick);
  }, [handleDocumentClick]);

  const showDropdown = isOpen && (resultList.length > 0 || isLoading);

  return (
    <Box
      zIndex={99}
      position="relative"
      flex="1 1 0"
      maxWidth="670px"
      mx="auto"
      className="search-box-container">
      <StyledSearchBox>
        <IconSearch size={18} stroke={1.5} className="search-icon" />

        <TextField
          fullWidth
          value={searchValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="search-field"
          placeholder={t("searchPlaceholder")}
        />

        <Menu
          direction="right"
          className="category-dropdown"
          handler={(openMenu) => (
            <FlexBox className="dropdown-handler" alignItems="center" onClick={openMenu}>
              <span>{selectedCategory.label}</span>
              <IconChevronDown size={18} stroke={1.5} />
            </FlexBox>
          )}>
          {allCategories.map((item) => (
            <MenuItem key={item.id || "all"} onClick={handleCategoryChange(item)}>
              {item.label}
            </MenuItem>
          ))}
        </Menu>
      </StyledSearchBox>

      {/* SEARCH RESULTS DROPDOWN */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            exit="exit"
            initial="hidden"
            animate="visible"
            variants={dropdownVariants}
            style={{
              top: "100%",
              zIndex: 99,
              width: "100%",
              position: "absolute"
            }}>
            <Card py="0.5rem" mt="0.25rem" boxShadow="large" borderRadius=".5rem">
              {isLoading ? (
                <MenuItem>
                  <Span fontSize="14px" color="text.muted">
                    {t("loading")}
                  </Span>
                </MenuItem>
              ) : (
                <>
                  {resultList.map((item) => (
                    <MenuItem
                      key={item.id}
                      onClick={() => handleResultClick(item.id)}
                      style={{ cursor: "pointer" }}>
                      <FlexBox justifyContent="space-between" alignItems="center" width="100%">
                        <Span fontSize="14px">{item.title}</Span>
                        <Span fontSize="12px" color="primary.main" fontWeight={600}>
                          {currency(item.price)}
                        </Span>
                      </FlexBox>
                    </MenuItem>
                  ))}

                  <MenuItem
                    onClick={handleViewAllClick}
                    style={{
                      cursor: "pointer",
                      borderTop: "1px solid #eee",
                      marginTop: "0.5rem",
                      paddingTop: "0.75rem"
                    }}>
                    <Span fontSize="14px" color="primary.main" fontWeight={600}>
                      {t("viewAll")} →
                    </Span>
                  </MenuItem>
                </>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
