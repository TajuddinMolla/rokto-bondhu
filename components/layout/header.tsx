"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Droplet, LogOut, AlertCircle, ShieldCheck } from "lucide-react";

import { getLocaleFromPathname, isAuthPathname } from "@/i18n/config";
import { getTranslations } from "@/i18n/translations";
import { getMainNavItems, getUserNavItems } from "@/constants/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useIsDonor } from "@/hooks/use-is-donor";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/layout/mobile-nav";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { NotificationBell } from "@/components/notifications/notification-bell";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, status, loading, logout } = useAuth();
  const { isDonor } = useIsDonor();

  // Completely omit header on authentication routes
  if (isAuthPathname(pathname)) {
    return null;
  }

  const currentLocale = getLocaleFromPathname(pathname);
  const t = getTranslations(currentLocale);

  const mainNavItems = getMainNavItems(currentLocale);
  const userNavItems = getUserNavItems(currentLocale);

  const homeHref = currentLocale === "en" ? "/en" : "/";
  const accountHref = currentLocale === "en" ? "/en/account" : "/account";
  const primaryAction = userNavItems.find((item) => item.isPrimary);
  const secondaryAction = userNavItems.find((item) => !item.isPrimary);

  const handleLogout = async () => {
    await logout();
    router.push(homeHref);
  };

  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
  const userInitial = displayName.charAt(0).toUpperCase();

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

          {!loading && status === "authenticated" && user ? (
            <div className="flex items-center gap-2">
              {/* Notification Bell Dropdown */}
              <NotificationBell locale={currentLocale} />

              {/* Admin Console Link for Authorized Administrators */}
              {user.isAdmin && (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs border-primary/30 text-primary bg-primary/5 hover:bg-primary/10"
                >
                  <Link href={currentLocale === "en" ? "/en/admin" : "/admin"}>
                    <ShieldCheck className="size-3.5 mr-1" />
                    <span>{currentLocale === "en" ? "Admin" : "অ্যাডমিন"}</span>
                  </Link>
                </Button>
              )}

              {/* Authenticated User Status Chip (Links to Account Dashboard) */}
              <Link
                href={accountHref}
                className="flex items-center gap-2 px-2.5 py-1 rounded-lg border border-border bg-background hover:bg-muted/50 text-xs font-medium transition-colors"
                title={
                  currentLocale === "en"
                    ? "My Account & Profile"
                    : "আমার অ্যাকাউন্ট ও প্রোফাইল"
                }
              >
                <div className="flex items-center justify-center size-6 rounded-full bg-primary/10 text-primary font-bold text-[11px]">
                  {userInitial}
                </div>
                <span
                  className="max-w-[120px] truncate text-foreground"
                  title={user.email || ""}
                >
                  {displayName}
                </span>

                {!user.emailVerified && (
                  <span
                    title={t.auth.userMenu.emailNotVerified}
                    className="inline-flex items-center text-[10px] text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20"
                  >
                    <AlertCircle className="size-3 mr-1" aria-hidden="true" />
                    {t.auth.userMenu.verifyNow}
                  </span>
                )}
              </Link>

              {/* Logout Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-xs text-muted-foreground hover:text-foreground"
                aria-label={t.auth.userMenu.logout}
              >
                <LogOut className="size-3.5 mr-1" aria-hidden="true" />
                {t.auth.userMenu.logout}
              </Button>
            </div>
          ) : (
            secondaryAction && (
              <Button asChild variant="ghost" size="sm">
                <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
              </Button>
            )
          )}

          {!isDonor && primaryAction && (
            <Button asChild variant="default" size="sm" className="shadow-sm">
              <Link href={primaryAction.href}>
                <Droplet
                  className="size-4 fill-current mr-1.5"
                  aria-hidden="true"
                />
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
