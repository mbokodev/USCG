import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import { Public_Sans } from "next/font/google";
// THEME PROVIDER
import StyledComponentsRegistry from "@lib/registry";
// THIRD PARTY CSS FILE
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { ThemeProvider } from "@/theme";
import NProgressBar from "@component/ui/NProgress";

const publicSans = Public_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "USCG Marketplace - Achetez et vendez au Congo",
  description: "Universal Services of Congo - Votre marketplace de confiance pour acheter et vendre au Congo.",
  authors: [{ name: "USCG", url: "https://uscg.com" }],
  keywords: ["marketplace", "e-commerce", "congo", "uscg", "annonces"]
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="fr">
      <body className={publicSans.className}>
        <StyledComponentsRegistry>
          <ThemeProvider>
            {children}
            <NProgressBar />
          </ThemeProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
