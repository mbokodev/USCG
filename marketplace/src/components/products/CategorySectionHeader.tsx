"use client";

import Link from "next/link";
import { IconChevronRight } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import Icon from "@component/ui/icon/Icon";
import FlexBox from "@component/ui/FlexBox";
import { H2, SemiSpan } from "@component/ui/Typography";

// ==============================================================
interface Props {
  title?: string;
  iconName?: string;
  seeMoreLink?: string;
  locale?: "fr" | "en";
}
// ==============================================================

export default function CategorySectionHeader({ title, iconName, seeMoreLink }: Props) {
  const t = useTranslations("common");

  return (
    <FlexBox justifyContent="space-between" alignItems="center" mb="1.5rem">
      <FlexBox alignItems="center">
        {iconName && (
          <Icon mr="0.5rem" color="primary">
            {iconName}
          </Icon>
        )}

        <H2 fontWeight="bold" lineHeight="1">
          {title}
        </H2>
      </FlexBox>

      {seeMoreLink && (
        <Link href={seeMoreLink}>
          <FlexBox alignItems="center" ml="0.5rem" color="text.muted">
            <SemiSpan mr="0.5rem">
              {t("viewAll")}
            </SemiSpan>
            <IconChevronRight size={16} stroke={1.5} />
          </FlexBox>
        </Link>
      )}
    </FlexBox>
  );
}
