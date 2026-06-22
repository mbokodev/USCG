"use client";

import { useCallback } from "react";
import NextImage from "next/image";
import { IconChevronDown, IconMail, IconPhone } from "@tabler/icons-react";
import { useLocale, useTranslations } from "next-intl";

import Menu from "@component/ui/menu";
import NavLink from "@component/ui/nav-link";
import MenuItem from "@component/ui/MenuItem";
import Container from "@component/ui/Container";
import { Small } from "@component/ui/Typography";
import { StyledTopbar } from "./styles";
import { LANGUAGES } from "./data";
import { useRouter, usePathname } from "@/i18n/routing";

export default function Topbar() {
  const t = useTranslations("topbar");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const currentLanguage = LANGUAGES.find((lang) => lang.code === locale) || LANGUAGES[0];

  const handleLanguageClick = useCallback(
    (lang: typeof LANGUAGES[0]) => () => {
      router.replace(pathname, { locale: lang.code });
    },
    [router, pathname]
  );

  return (
    <StyledTopbar>
      <Container className="container">
        <div className="topbar-left">
          <div className="logo">
            <NextImage src="/assets/logo/logo-white.png" alt="USCG" width={32} height={32} />
            <span className="logo-text">USCG</span>
          </div>

          <div className="phone">
            <IconPhone size={16} stroke={1.5} />
            <span>+242 06 654 40 11</span>
          </div>

          <div className="email">
            <IconMail size={16} stroke={1.5} />
            <span>support@universal-services-cg.com</span>
          </div>
        </div>

        <div className="topbar-right">
          <NavLink className="link" href="/">
            {t("needHelp")}
          </NavLink>

          <Menu
            direction="right"
            handler={(handleOpen) => (
              <div className="dropdown-handler" onClick={handleOpen}>
                <Small fontWeight="600">{currentLanguage.title}</Small>
                <IconChevronDown size={16} stroke={1.5} />
              </div>
            )}>
            {LANGUAGES.map((item) => (
              <MenuItem key={item.id} onClick={handleLanguageClick(item)}>
                <Small fontWeight="600">{item.title}</Small>
              </MenuItem>
            ))}
          </Menu>
        </div>
      </Container>
    </StyledTopbar>
  );
}
