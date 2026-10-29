import type { Metadata } from "next";
import { Noto_Sans_Bengali } from "next/font/google";

import "./globals.css";
import { constructMetadata } from "@/lib/seo/metadata";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SkipLink } from "@/components/layout/skip-link";
import { AuthProvider } from "@/components/auth/auth-provider";
import { QueryProvider } from "@/components/providers/query-provider";

const notoSansBengali = Noto_Sans_Bengali({
  variable: "--font-noto-sans-bengali",
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = constructMetadata({
  locale: "bn",
  path: "/",
});

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="bn"
      className={`${notoSansBengali.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <QueryProvider>
          <AuthProvider>
            {/* Dynamic localized skip-to-content accessible link */}
            <SkipLink />

            <Header />

            {/* Stable target ID for skip link without creating nested <main> tags */}
            {/* pb-24 ensures mobile floating dock never overlaps page content */}
            <div
              id="main-content"
              className="flex-1 flex flex-col focus:outline-none pb-24 md:pb-0"
              tabIndex={-1}
            >
              {children}
            </div>

            <Footer />

            {/* Mobile bottom navigation bar (hidden on md+ viewports) */}
            <BottomNav />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
