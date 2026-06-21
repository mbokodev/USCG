"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { IconSearch } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

import Box from "@component/ui/Box";
import Card from "@component/ui/Card";
import FlexBox from "@component/ui/FlexBox";
import MenuItem from "@component/ui/MenuItem";
import { Button } from "@component/ui/buttons";
import { Span } from "@component/ui/Typography";
import TextField from "@component/ui/form/text-field";
import SearchBoxStyle from "./styled";

import { searchAds } from "@/services/ads.service";
import { currency } from "@/utils/utils";

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

export default function SearchInput() {
  const router = useRouter();
  const t = useTranslations("common");

  const [searchValue, setSearchValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(searchValue, 300);

  const { data: resultList = [], isLoading } = useQuery({
    queryKey: ["search-autocomplete", debouncedSearch],
    queryFn: () => searchAds(debouncedSearch),
    enabled: debouncedSearch.length >= 2,
  });

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
        router.push(`/search?search=${encodeURIComponent(searchValue.trim())}`);
      }
    },
    [searchValue, router]
  );

  const handleSearchClick = useCallback(() => {
    if (searchValue.trim()) {
      setIsOpen(false);
      router.push(`/search?search=${encodeURIComponent(searchValue.trim())}`);
    }
  }, [searchValue, router]);

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
    router.push(`/search?search=${encodeURIComponent(searchValue.trim())}`);
  }, [searchValue, router]);

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
    <Box position="relative" flex="1 1 0" maxWidth="670px" mx="auto" className="search-box-container">
      <SearchBoxStyle>
        <IconSearch className="search-icon" size={18} />

        <TextField
          fullWidth
          value={searchValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="search-field"
          placeholder={t("searchPlaceholder")}
        />

        <Button
          className="search-button"
          variant="contained"
          color="primary"
          onClick={handleSearchClick}>
          {t("search")}
        </Button>
      </SearchBoxStyle>

      {/* SEARCH RESULTS DROPDOWN */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            exit="exit"
            initial="hidden"
            animate="visible"
            variants={dropdownVariants}
            style={{ position: "absolute", top: "100%", width: "100%", zIndex: 99 }}>
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
