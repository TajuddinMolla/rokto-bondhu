"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { getLocaleFromPathname } from "@/i18n/config";
import { getTranslations } from "@/i18n/translations";

export function SkipLink() {
  const pathname = usePathname();
  const currentLocale = getLocaleFromPathname(pathname);
  const t = getTranslations(currentLocale);

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:top-4 focus:left-4 focus:px-4 focus:py-2.5 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background font-medium text-sm transition-transform"
    >
      {t.accessibility.skipToContent}
    </a>
  );
}
