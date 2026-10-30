import type { Metadata } from "next";

import { defaultLocale, getLocalizedPath, type Locale } from "@/i18n/config";
import { getTranslations } from "@/i18n/translations";

/**
 * Retrieves the configured site base URL from environment variables.
 * Returns null if unset, ensuring no invented or fake domains are introduced.
 */
export function getSiteUrl(): string | null {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!envUrl || typeof envUrl !== "string") {
    return null;
  }
  const trimmed = envUrl.trim().replace(/\/+$/, "");
  return trimmed.length > 0 ? trimmed : null;
}

export interface MetadataParams {
  title?: string;
  description?: string;
  path?: string;
  locale?: Locale;
  noIndex?: boolean;
}

/**
 * Constructs type-safe Next.js App Router metadata with localized defaults and hreflang alternates.
 * Automatically handles canonical URL and metadataBase if NEXT_PUBLIC_SITE_URL is provided.
 */
export function constructMetadata({
  title,
  description,
  path = "",
  locale = defaultLocale,
  noIndex = false,
}: MetadataParams = {}): Metadata {
  const t = getTranslations(locale);
  const siteUrl = getSiteUrl();

  const finalDescription = description ?? t.seo.description;
  const pageTitle = title ? `${title} | ${t.brand.name}` : t.seo.defaultTitle;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const canonicalUrl = siteUrl ? `${siteUrl}${normalizedPath}` : undefined;

  const ogLocale = locale === "en" ? "en_US" : "bn_BD";

  const alternates = siteUrl
    ? {
        canonical: canonicalUrl,
        languages: {
          bn: `${siteUrl}${getLocalizedPath(normalizedPath, "bn")}`,
          en: `${siteUrl}${getLocalizedPath(normalizedPath, "en")}`,
          "x-default": `${siteUrl}${getLocalizedPath(normalizedPath, "bn")}`,
        },
      }
    : undefined;

  return {
    metadataBase: siteUrl ? new URL(siteUrl) : undefined,
    title: {
      default: t.seo.defaultTitle,
      template: t.seo.titleTemplate,
    },
    description: finalDescription,
    alternates,
    openGraph: {
      title: pageTitle,
      description: finalDescription,
      siteName: t.brand.name,
      locale: ogLocale,
      type: "website",
      url: canonicalUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: finalDescription,
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icon.svg", type: "image/svg+xml" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      ],
      apple: [
        { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
      ],
      shortcut: ["/favicon.ico"],
    },
    manifest: "/manifest.webmanifest",
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
        },
  };
}
