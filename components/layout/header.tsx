"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Droplet } from "lucide-react";

import { getLocaleFromPathname, isAuthPathname } from "@/i18n/config";
import { getTranslations } from "@/i18n/translations";
import { getMainNavItems, getUserNavItems } from "@/constants/navigation";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/layout/mobile-nav";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

export function Header() {
  const pathname = usePathname();

  // Completely omit header on authentication routes
  if (isAuthPathname(pathname)) {
    return null;
  }

  const currentLocale = getLocaleFromPathname(pathname);
  const t = getTranslations(currentLocale);

  const mainNavItems = getMainNavItems(currentLocale);
  const userNavItems = getUserNavItems(currentLocale);

  const homeHref = currentLocale === "en" ? "/en" : "/";
  const primaryAction = userNavItems.find((item) => item.isPrimary);
  const secondaryAction = userNavItems.find((item) => !item.isPrimary);

  return (
    <header
      role="banner"
      className="sticky top-0 z-40 w-full border-b border-border bg-surface/95 backdrop-blur-md transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Localized Tagline */}
        <Link
          href={homeHref}
          className="flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background group"
          aria-label={`${t.brand.name} ${t.nav.home}`}
        >
          <div className="flex items-center justify-center size-9 rounded-lg bg-primary text-primary-foreground shadow-sm group-hover:bg-primary/90 transition-colors">
            <Droplet className="size-5 fill-current" aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-foreground leading-tight">
              {t.brand.name}
            </span>
            <span className="hidden sm:inline-block text-[11px] font-medium text-muted-foreground tracking-normal">
              {t.brand.tagline}
            </span>
          </div>
        </Link>

        {/* Desktop Localized Navigation */}
        <nav
          className="hidden md:flex items-center gap-1 lg:gap-2"
          aria-label={t.accessibility.openMenu}
        >
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className="px-3 py-2 rounded-md text-sm font-medium text-foreground/90 hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions & Language Switcher */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher />

          {secondaryAction && (
            <Button asChild variant="ghost" size="sm">
              <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
            </Button>
          )}

          {primaryAction && (
            <Button asChild variant="default" size="sm" className="shadow-sm">
              <Link href={primaryAction.href}>
                <Droplet className="size-4 fill-current mr-1.5" aria-hidden="true" />
                {primaryAction.label}
              </Link>
            </Button>
          )}
        </div>

        {/* Mobile Navigation Trigger & Drawer */}
        <MobileNav />
      </div>
    </header>
  );
}
