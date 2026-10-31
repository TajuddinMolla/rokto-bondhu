import type { Metadata } from "next";

import { defaultLocale, getLocalizedPath, type Locale } from "@/i18n/config";
import { getTranslations } from "@/i18n/translations";

/**
 * Retrieves the configured site base URL.
 * Automatically checks NEXT_PUBLIC_SITE_URL, Vercel environment variables,
 * and falls back to the production URL.
 */
export function getSiteUrl(): string {
  // 1. Explicit environment variable
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl && typeof envUrl === "string" && envUrl.trim().length > 0) {
    const trimmed = envUrl.trim().replace(/\/+$/, "");
    if (process.env.NODE_ENV !== "production" || !trimmed.includes("localhost")) {
      return trimmed;
    }
  }

  // 2. Vercel production project domain (in production deployments)
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/+$/, "")}`;
  }

  // 3. Vercel preview deployment URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/+$/, "")}`;
  }

  // 4. Fallback to envUrl if defined (e.g. localhost in development)
  if (envUrl && typeof envUrl === "string" && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, "");
  }

  // 5. Default production domain fallback
  return "https://roktobondhu.org";
}

export interface MetadataParams {
  title?: string;
  description?: string;
  path?: string;
  locale?: Locale;
  image?: string;
  noIndex?: boolean;
}

/**
 * Constructs type-safe Next.js App Router metadata with localized defaults,
 * absolute canonical URLs, hreflang alternates, Open Graph, Twitter/X cards, and robots.
 */
export function constructMetadata({
  title,
  description,
  path = "",
  locale = defaultLocale,
  image,
  noIndex = false,
}: MetadataParams = {}): Metadata {
  const t = getTranslations(locale);
  const siteUrl = getSiteUrl();

  const finalDescription = description ?? t.seo.description;
  const brandName = "RoktoBondhu";

  // For social cards and fallback page titles
  const pageTitle = title ? `${title} | ${brandName}` : t.seo.defaultTitle;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const canonicalUrl = `${siteUrl}${normalizedPath}`;

  const ogLocale = locale === "en" ? "en_US" : "bn_BD";
  const defaultOgImage = `${siteUrl}/og-image.png`;
  const finalOgImage = image ? (image.startsWith("http") ? image : `${siteUrl}${image}`) : defaultOgImage;

  const alternates = {
    canonical: canonicalUrl,
    languages: {
      bn: `${siteUrl}${getLocalizedPath(normalizedPath, "bn")}`,
      en: `${siteUrl}${getLocalizedPath(normalizedPath, "en")}`,
      "x-default": `${siteUrl}${getLocalizedPath(normalizedPath, "bn")}`,
    },
  };

  // If a child page supplies a title string, Next.js applies the layout template automatically.
  // If no title is supplied, default to the full localized brand defaultTitle using absolute to prevent parent template duplication.
  const titleConfig = title
    ? title
    : {
        default: t.seo.defaultTitle,
        absolute: t.seo.defaultTitle,
        template: t.seo.titleTemplate,
      };

  return {
    metadataBase: new URL(siteUrl),
    applicationName: brandName,
    title: titleConfig,
    description: finalDescription,
    alternates,
    openGraph: {
      title: pageTitle,
      description: finalDescription,
      siteName: brandName,
      locale: ogLocale,
      type: "website",
      url: canonicalUrl,
      images: [
        {
          url: finalOgImage,
          secureUrl: finalOgImage,
          width: 1200,
          height: 630,
          alt:
            locale === "en"
              ? "RoktoBondhu — Find Blood Donors, Save Lives"
              : "RoktoBondhu — রক্তদাতা খুঁজুন, জীবন বাঁচান",
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: finalDescription,
      images: [finalOgImage],
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
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
}
