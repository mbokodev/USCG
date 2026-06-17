import MegaMenu1 from "./mega-menu/MegaMenu1";
import MegaMenu2 from "./mega-menu/MegaMenu2";
import CategoryMenuItem from "./CategoryMenuItem";
import { StyledCategoryDropdown } from "./styles";
import type { NavigationItem } from "@/utils/category-utils";

// =========================================
type CategoryDropdownProps = {
  open: boolean;
  position?: "absolute" | "relative";
  categories?: NavigationItem[];
};
// =========================================

const megaMenu = { MegaMenu1, MegaMenu2 };

export default function CategoryDropdown({
  open,
  position = "absolute",
  categories = []
}: CategoryDropdownProps) {
  return (
    <StyledCategoryDropdown open={open} position={position}>
      {categories.map((item) => {
        const MegaMenu = megaMenu[item.menuComponent];

        return (
          <CategoryMenuItem
            key={item.title}
            href={item.href}
            icon={item.icon}
            title={item.title}
            caret={!!item.menuData}>
            <MegaMenu data={item.menuData || []} />
          </CategoryMenuItem>
        );
      })}
    </StyledCategoryDropdown>
  );
}
