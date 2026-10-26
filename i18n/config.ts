export type Locale = "bn" | "en";

export const defaultLocale: Locale = "bn";
export const supportedLocales: readonly Locale[] = ["bn", "en"] as const;

export const localeLabels: Record<Locale, string> = {
  bn: "বাংলা",
  en: "English",
};

/**
 * Checks whether a given string is a supported locale.
 */
export function isValidLocale(locale: string): locale is Locale {
  return supportedLocales.includes(locale as Locale);
}

/**
 * Extracts the current locale from a URL pathname.
 * Routes starting with '/en' are English; all other routes default to Bangla.
 */
export function getLocaleFromPathname(pathname: string): Locale {
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    return "en";
  }
  return "bn";
}

/**
 * Maps known route paths between Bangla and English.
 */
const ROUTE_MAP: Record<string, string> = {
  "/": "/en",
  "/donors": "/en/donors",
  "/blood-request": "/en/blood-request",
  "/register": "/en/register",
  "/login": "/en/login",
};

// Inverted map for English -> Bangla lookup
const REVERSE_ROUTE_MAP: Record<string, string> = Object.entries(
  ROUTE_MAP
).reduce<Record<string, string>>((acc, [bnPath, enPath]) => {
  acc[enPath] = bnPath;
  return acc;
}, {});

/**
 * Generates the corresponding path in the target language.
 *
 * Rules:
 * - Switching from Bangla to English maps known routes (e.g. /donors -> /en/donors).
 * - Switching from English to Bangla maps known routes (e.g. /en/donors -> /donors).
 * - Unknown paths fallback safely to the corresponding language homepage without constructing broken URLs.
 */
export function getLocalizedPath(pathname: string, targetLocale: Locale): string {
  // Normalize path by stripping trailing slash (except root)
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;

  if (targetLocale === "en") {
    if (normalized.startsWith("/en")) {
      return normalized; // Already English
    }
    return ROUTE_MAP[normalized] ?? "/en";
  }

  // Target locale is Bangla ("bn")
  if (!normalized.startsWith("/en")) {
    return normalized; // Already Bangla
  }

  return REVERSE_ROUTE_MAP[normalized] ?? "/";
}
