"use client";

import { useTranslations } from "next-intl";
import { IconPhone, IconLoader2, IconAlertCircle, IconMessage } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { getAdWithContactAction } from "@/features/auth/actions/ads.actions";
import Box from "@component/ui/Box";
import FlexBox from "@component/ui/FlexBox";
import { Span } from "@component/ui/Typography";
import WhatsAppIcon from "@component/ui/icons/WhatsAppIcon";
import type { ISellerContact, ContactMethod } from "@uscg/shared/types";

interface ContactSellerButtonProps {
  adId: string;
  initialContact?: ISellerContact | null;
}

const formatPhoneForWhatsApp = (phone: string): string => {
  return phone.replace(/[+\s-]/g, "");
};

export default function ContactSellerButton({ adId, initialContact }: ContactSellerButtonProps) {
  const t = useTranslations("product");
  const tContact = useTranslations("product.contact");
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  // Fetch contact info when authenticated (via server action to access httpOnly cookies)
  const { data: adWithContact, isLoading: isContactLoading, isError } = useQuery({
    queryKey: ["ad-contact", adId],
    queryFn: () => getAdWithContactAction(adId),
    enabled: isAuthenticated && !isAuthLoading,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false, // Don't retry on auth failure
  });

  const sellerContact = adWithContact?.sellerContact || initialContact;
  const isLoading = isAuthLoading || (isAuthenticated && isContactLoading);

  // If contact fetch failed (likely 401) or not authenticated, show warning
  // This handles the case where cookies were cleared but React Query cache still has user data
  const shouldShowLoginWarning = !isAuthenticated || (isAuthenticated && !isAuthLoading && !isContactLoading && !adWithContact && !initialContact);

  // If loading auth state or contact info
  if (isLoading) {
    return (
      <FlexBox
        alignItems="center"
        justifyContent="center"
        p="16px"
        borderRadius={12}
        bg="gray.100"
      >
        <IconLoader2 size={20} style={{ marginRight: "10px", animation: "spin 1s linear infinite" }} />
        <Span>{t("loading")}</Span>
      </FlexBox>
    );
  }

  // If not authenticated or contact fetch failed, show warning message
  if (shouldShowLoginWarning) {
    return (
      <Box
        p="16px"
        borderRadius={12}
        style={{
          backgroundColor: "#FFF8E1",
          border: "1px solid #FFE082",
        }}
      >
        <FlexBox alignItems="center" style={{ gap: "12px" }}>
          <IconAlertCircle size={24} color="#F57C00" style={{ flexShrink: 0 }} />
          <Span fontSize="14px" color="#E65100" fontWeight={500}>
            {t("loginToContact")}
          </Span>
        </FlexBox>
      </Box>
    );
  }

  // If no contact methods configured
  if (!sellerContact || sellerContact.enabledContactMethods.length === 0) {
    return (
      <Box
        p="16px"
        borderRadius={12}
        style={{
          backgroundColor: "#f5f5f5",
          border: "1px solid #e0e0e0",
        }}
      >
        <FlexBox alignItems="center" justifyContent="center" style={{ gap: "10px" }}>
          <IconPhone size={20} color="#999" />
          <Span fontSize="14px" color="gray.500" fontWeight={500}>
            {t("contactNotAvailable")}
          </Span>
        </FlexBox>
      </Box>
    );
  }

  const { businessPhone, enabledContactMethods } = sellerContact;

  const contactButtons: {
    method: ContactMethod;
    label: string;
    icon: React.ReactNode;
    href: string;
    bgColor: string;
    hoverBgColor: string;
    target?: string;
  }[] = [
    {
      method: "PHONE" as ContactMethod,
      label: tContact("phone"),
      icon: <IconPhone size={20} />,
      href: `tel:${businessPhone}`,
      bgColor: "#4CAF50",
      hoverBgColor: "#43A047",
    },
    {
      method: "WHATSAPP" as ContactMethod,
      label: tContact("whatsapp"),
      icon: <WhatsAppIcon size={20} />,
      href: `https://wa.me/${formatPhoneForWhatsApp(businessPhone)}`,
      bgColor: "#25D366",
      hoverBgColor: "#1DA851",
      target: "_blank",
    },
    {
      method: "SMS" as ContactMethod,
      label: tContact("sms"),
      icon: <IconMessage size={20} />,
      href: `sms:${businessPhone}`,
      bgColor: "#2196F3",
      hoverBgColor: "#1E88E5",
    },
  ];

  const enabledButtons = contactButtons.filter((btn) =>
    enabledContactMethods.includes(btn.method)
  );

  return (
    <FlexBox flexDirection="column" style={{ gap: "10px" }}>
      {enabledButtons.map((btn) => (
        <a
          key={btn.method}
          href={btn.href}
          target={btn.target}
          rel={btn.target === "_blank" ? "noopener noreferrer" : undefined}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            padding: "14px 20px",
            borderRadius: "12px",
            backgroundColor: btn.bgColor,
            color: "white",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: "15px",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = btn.hoverBgColor;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = btn.bgColor;
          }}
        >
          {btn.icon}
          {btn.label}
        </a>
      ))}
    </FlexBox>
  );
}
