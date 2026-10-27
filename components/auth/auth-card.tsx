import * as React from "react";
import Link from "next/link";
import { Droplet, Shield } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { getTranslations } from "@/i18n/translations";
import type { Locale } from "@/i18n/config";

export interface AuthCardProps {
  locale: Locale;
  badgeText: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footerContent?: React.ReactNode;
  maxWidth?: "md" | "lg";
}

export function AuthCard({
  locale,
  badgeText,
  title,
  subtitle,
  children,
  footerContent,
  maxWidth = "md",
}: AuthCardProps) {
  const t = getTranslations(locale);
  const homeHref = locale === "en" ? "/en" : "/";

  return (
    <div className="w-full max-w-full flex flex-col items-center justify-center py-6 sm:py-10 px-4 sm:px-6">
      <div
        className={`w-full ${
          maxWidth === "lg" ? "max-w-xl" : "max-w-md"
        } space-y-6 animate-in fade-in duration-300`}
      >
        {/* Top Quick Bar: Branding and Language Switcher */}
        <div className="flex items-center justify-between gap-3 px-1">
          <Link
            href={homeHref}
            className="inline-flex items-center gap-2 group rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
            aria-label={`${t.brand.name} ${t.nav.home}`}
          >
            <div className="flex items-center justify-center size-8 rounded-lg bg-primary text-primary-foreground shadow-sm group-hover:bg-primary/90 transition-colors">
              <Droplet className="size-4 fill-current" aria-hidden="true" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
              {t.brand.name}
            </span>
          </Link>

          <LanguageSwitcher />
        </div>

        {/* Auth Card Container */}
        <Card className="relative overflow-hidden border border-border bg-card shadow-sm sm:shadow-md">
          {/* Subtle Top Crimson Brand Accent Line */}
          <div
            className="h-1.5 w-full bg-gradient-to-r from-primary via-primary/80 to-primary/60"
            aria-hidden="true"
          />

          <CardHeader className="space-y-3 pb-6 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start">
              <Badge
                variant="outline"
                className="border-primary/30 text-primary bg-primary/5 px-3 py-1 text-xs font-semibold rounded-full"
              >
                <Shield className="size-3.5 mr-1.5" aria-hidden="true" />
                {badgeText}
              </Badge>
            </div>

            <CardTitle className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {title}
            </CardTitle>

            <CardDescription className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {subtitle}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {children}

            {footerContent ? (
              <div className="pt-4 border-t border-border text-center text-sm text-muted-foreground">
                {footerContent}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
