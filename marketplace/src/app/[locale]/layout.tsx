import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
// THEME PROVIDER
import StyledComponentsRegistry from "@lib/registry";
import { ThemeProvider } from "@/theme";
import NProgressBar from "@component/ui/NProgress";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  // Validate locale
  if (!routing.locales.includes(locale as typeof routing.locales[number])) {
    notFound();
  }

  // Get messages for the locale
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <StyledComponentsRegistry>
        <ThemeProvider>
          {children}
          <NProgressBar />
        </ThemeProvider>
      </StyledComponentsRegistry>
    </NextIntlClientProvider>
  );
}
