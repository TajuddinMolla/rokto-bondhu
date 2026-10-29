"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Languages } from "lucide-react";

import {
  getLocaleFromPathname,
  getLocalizedPath,
  type Locale,
} from "@/i18n/config";
import { getTranslations } from "@/i18n/translations";
import { cn } from "@/lib/utils";

export interface LanguageSwitcherProps {
  className?: string;
  variant?: "header" | "mobile";
}

export function LanguageSwitcher({
  className,
  variant = "header",
}: LanguageSwitcherProps) {
  const pathname = usePathname();
  const currentLocale = getLocaleFromPathname(pathname);
  const t = getTranslations(currentLocale);

  const targetLocale: Locale = currentLocale === "bn" ? "en" : "bn";
  const targetHref = getLocalizedPath(pathname, targetLocale);

  if (variant === "mobile") {
    return (
      <div
        className={cn(
          "flex items-center justify-between p-3.5 rounded-2xl border border-border bg-surface shadow-2xs",
          className
        )}
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Languages className="size-4" aria-hidden="true" />
          </div>
          <span>{t.languageSwitcher.label}</span>
        </div>
        <div className="flex items-center gap-1 bg-muted p-1 rounded-xl text-xs font-semibold">
          <Link
            href={getLocalizedPath(pathname, "bn")}
            aria-current={currentLocale === "bn" ? "true" : undefined}
            className={cn(
              "px-3 py-1.5 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring touch-manipulation",
              currentLocale === "bn"
                ? "bg-surface text-foreground font-bold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            বাংলা
          </Link>
          <Link
            href={getLocalizedPath(pathname, "en")}
            aria-current={currentLocale === "en" ? "true" : undefined}
            className={cn(
              "px-3 py-1.5 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring touch-manipulation",
              currentLocale === "en"
                ? "bg-surface text-foreground font-bold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            English
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label={t.languageSwitcher.accessibleAria}
      className={cn("flex items-center", className)}
    >
      <Link
        href={targetHref}
        aria-label={`${t.languageSwitcher.label}: ${targetLocale === "bn" ? "বাংলা" : "English"}`}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border bg-surface hover:bg-muted text-foreground transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background shadow-2xs select-none touch-manipulation cursor-pointer"
      >
        <Languages className="size-3.5 text-primary" aria-hidden="true" />
        <span>{targetLocale === "bn" ? "বাংলা" : "English"}</span>
      </Link>
    </div>
  );
}
