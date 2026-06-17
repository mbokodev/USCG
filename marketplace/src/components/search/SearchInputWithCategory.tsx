import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconChevronDown, IconSearch } from "@tabler/icons-react";
import debounce from "lodash/debounce";

import Box from "@component/ui/Box";
import Menu from "@component/ui/menu/Menu";
import Card from "@component/ui/Card";
import FlexBox from "@component/ui/FlexBox";
import MenuItem from "@component/ui/MenuItem";
import { Span } from "@component/ui/Typography";
import TextField from "@component/ui/form/text-field";
import StyledSearchBox from "./styled";
import type { CategoryOption } from "@/utils/category-utils";

const dropdownVariants = {
  hidden: {
    y: -10,
    opacity: 0,
    scale: 0.95
  },
  visible: {
    y: 0,
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  exit: {
    y: -10,
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.15 }
  }
};

interface SearchInputWithCategoryProps {
  categories?: CategoryOption[];
}

export default function SearchInputWithCategory({ categories = [] }: SearchInputWithCategoryProps) {
  const [resultList, setResultList] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryOption>({ label: "Toutes", slug: "" });

  const allCategories: CategoryOption[] = [
    { label: "Toutes", slug: "" },
    ...categories
  ];

  const handleCategoryChange = (cat: CategoryOption) => () => setSelectedCategory(cat);

  const search = debounce((e) => {
    const value = e.target?.value;

    if (!value) setResultList([]);
    else setResultList(dummySearchResult);
  }, 200);

  const handleSearch = useCallback((event: any) => {
    event.persist();
    search(event);
  }, []);

  const handleDocumentClick = () => setResultList([]);

  useEffect(() => {
    window.addEventListener("click", handleDocumentClick);
    return () => window.removeEventListener("click", handleDocumentClick);
  }, []);

  return (
    <Box zIndex={99} position="relative" flex="1 1 0" maxWidth="670px" mx="auto">
      <StyledSearchBox>
        <IconSearch size={18} stroke={1.5} className="search-icon" />

        <TextField
          fullWidth
          onChange={handleSearch}
          className="search-field"
          placeholder="Search and hit enter..."
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
            <MenuItem key={item.slug || "all"} onClick={handleCategoryChange(item)}>
              {item.label}
            </MenuItem>
          ))}
        </Menu>
      </StyledSearchBox>

      {/* SEARCH RESULT */}
      <AnimatePresence>
        {resultList.length > 0 && (
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
              {resultList.map((item) => (
                <Link href={`/product/search/${item}`} key={item}>
                  <MenuItem key={item}>
                    <Span fontSize="14px">{item}</Span>
                  </MenuItem>
                </Link>
              ))}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}

const dummySearchResult = ["Macbook Air 13", "Ksus K555LA", "Acer Aspire X453", "iPad Mini 3"];
