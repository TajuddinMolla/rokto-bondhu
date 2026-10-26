"use client";

import * as React from "react";
import type { Locale } from "@/i18n/config";

export function DocumentLang({ lang }: { lang: Locale }) {
  React.useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
    return () => {
      if (typeof document !== "undefined") {
        document.documentElement.lang = "bn";
      }
    };
  }, [lang]);

  return null;
}
