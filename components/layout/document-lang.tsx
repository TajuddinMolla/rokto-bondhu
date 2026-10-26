"use client";

import * as React from "react";
import type { Locale } from "@/i18n/config";

export function DocumentLang({ lang }: { lang: Locale }) {
  React.useEffect(() => {
    if (document.documentElement.lang !== lang) {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `document.documentElement.lang = "${lang}";`,
      }}
    />
  );
}
