import Link from "next/link";
import { ReactNode } from "react";
import { IconChevronRight } from "@tabler/icons-react";
import LucideIcon from "@component/ui/LucideIcon";
import { StyledCategoryMenuItem } from "./styles";

// ===============================================================
interface CategoryMenuItemProps {
  href: string;
  icon?: string;
  title: string;
  caret?: boolean;
  children: ReactNode;
}
// ===============================================================

export default function CategoryMenuItem({
  href,
  icon,
  title,
  children,
  caret = true
}: CategoryMenuItemProps) {
  return (
    <StyledCategoryMenuItem>
      <Link href={href}>
        <div className="category-dropdown-link">
          {icon && <LucideIcon name={icon} size={18} />}
          <span className="title">{title}</span>
          {caret && <IconChevronRight stroke={1.5} size={16} />}
        </div>
      </Link>

      {children}
    </StyledCategoryMenuItem>
  );
}
