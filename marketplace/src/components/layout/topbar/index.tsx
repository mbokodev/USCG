"use client";

import { useCallback, useEffect, useState } from "react";
import NextImage from "next/image";
import { IconChevronDown, IconMail, IconPhone } from "@tabler/icons-react";

import Menu from "@component/ui/menu";
import Image from "@component/ui/Image";
import NavLink from "@component/ui/nav-link";
import MenuItem from "@component/ui/MenuItem";
import Container from "@component/ui/Container";
import { Small } from "@component/ui/Typography";
import { StyledTopbar } from "./styles";
import { LANGUAGES, CURRENCIES } from "./data";

import logo from "../../../../public/assets/images/logo.svg";

export default function Topbar() {
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [language, setLanguage] = useState(LANGUAGES[0]);

  const handleCurrencyClick = useCallback((curr: typeof currency) => () => setCurrency(curr), []);

  const handleLanguageClick = useCallback((lang: typeof language) => () => setLanguage(lang), []);

  useEffect(() => {
    // get language from browser
    // console.log(navigator.language);
  }, []);

  return (
    <StyledTopbar>
      <Container className="container">
        <div className="topbar-left">
          <div className="logo">
            <NextImage src={logo} alt="Bonik" />
          </div>

          <div className="phone">
            <IconPhone size={16} stroke={1.5} />
            <span>+242 06 654 40 11</span>
          </div>

          <div className="email">
            <IconMail size={16} stroke={1.5} />
            <span>support@universal-services-cg.com.com</span>
          </div>
        </div>

        <div className="topbar-right">
          <NavLink className="link" href="/">
            Need Help?
          </NavLink>

          <Menu
            direction="right"
            handler={(handleOpen) => (
              <div className="dropdown-handler" onClick={handleOpen}>
                <Image src={language.imgUrl} alt={language.title} />
                <Small fontWeight="600">{language.title}</Small>
                <IconChevronDown size={16} stroke={1.5} />
              </div>
            )}>
            {LANGUAGES.map((item) => (
              <MenuItem key={item.id} onClick={handleLanguageClick(item)}>
                <Image src={item.imgUrl} borderRadius="2px" mr="0.5rem" alt={item.title} />
                <Small fontWeight="600">{item.title}</Small>
              </MenuItem>
            ))}
          </Menu>

          {/* <Menu
            direction="right"
            handler={
              <FlexBox className="dropdown-handler" alignItems="center" height="40px">
                <Image src={currency.imgUrl} alt={currency.title} />
                <Small fontWeight="600">{currency.title}</Small>
                <IconChevronDown size={16} stroke={1.5} />
              </FlexBox>
            }>
            {CURRENCIES.map((item) => (
              <MenuItem key={item.id} onClick={handleCurrencyClick(item)}>
                <Image src={item.imgUrl} borderRadius="2px" mr="0.5rem" alt={item.title} />
                <Small fontWeight="600">{item.title}</Small>
              </MenuItem>
            ))}
          </Menu> */}
        </div>
      </Container>
    </StyledTopbar>
  );
}
