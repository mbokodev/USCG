import Link from "next/link";

import Icon from "@component/ui/icon/Icon";
import FlexBox from "@component/ui/FlexBox";
import Container from "@component/ui/Container";
import Categories from "@component/categories/Categories";
import { SearchInput } from "@component/search";
import StyledHeader from "./styles";
import Logo from "./Logo";
import UserButton from "./UserButton";
import type { NavigationItem } from "@/utils/category-utils";

// ====================================================================
type HeaderProps = {
  isFixed?: boolean;
  className?: string;
  categories?: NavigationItem[];
};
// =====================================================================

export default function Header({ isFixed, className, categories = [] }: HeaderProps) {
  return (
    <StyledHeader className={className}>
      <Container className="container">
        <FlexBox className="logo" alignItems="center" mr="1rem">
          <Link href="/">
            <Logo />
          </Link>

          {isFixed && (
            <div className="category-holder">
              <Categories
                categories={categories}
                handler={(handleOpen) => (
                  <FlexBox color="text.hint" alignItems="center" ml="1rem" onClick={handleOpen}>
                    <Icon>categories</Icon>
                    <Icon>arrow-down-filled</Icon>
                  </FlexBox>
                )}
              />
            </div>
          )}
        </FlexBox>

        <FlexBox justifyContent="center" flex="1 1 0">
          <SearchInput />
        </FlexBox>

        <FlexBox className="header-right" alignItems="center">
          <UserButton />
        </FlexBox>
      </Container>
    </StyledHeader>
  );
}
