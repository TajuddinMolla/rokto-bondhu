"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Droplet,
  LogOut,
  AlertCircle,
  ShieldCheck,
  User as UserIcon,
  ChevronDown,
  FileText,
  MessageSquare,
} from "lucide-react";

import { getLocaleFromPathname, isAuthPathname } from "@/i18n/config";
import { getTranslations } from "@/i18n/translations";
import { getMainNavItems, getUserNavItems } from "@/constants/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useIsDonor } from "@/hooks/use-is-donor";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MobileNav } from "@/components/layout/mobile-nav";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { cn } from "@/lib/utils";

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

  const prefix = currentLocale === "en" ? "/en" : "";
  const homeHref = prefix || "/";
  const accountHref = `${prefix}/account`;
  const myRequestsHref = `${prefix}/account/requests`;
  const contactRequestsHref = `${prefix}/account/contact-requests`;
  const adminHref = `${prefix}/admin`;
  const verifyEmailHref = `${prefix}/verify-email`;

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
      className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl backdrop-saturate-150 transition-all duration-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Real-time Indicator */}
        <Link
          href={homeHref}
          className="flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background group shrink-0"
          aria-label={`${t.brand.name} ${t.nav.home}`}
        >
          <div className="relative flex items-center justify-center size-9.5 rounded-xl bg-gradient-to-br from-primary via-rose-600 to-rose-700 text-white shadow-sm shadow-primary/25 ring-1 ring-white/20 transition-all duration-200 group-hover:scale-105 group-hover:shadow-md group-hover:shadow-primary/35">
            <Droplet className="size-5 fill-current" aria-hidden="true" />
            <span className="absolute -top-0.5 -right-0.5 flex size-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full size-2.5 bg-emerald-500 border-2 border-surface" />
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-foreground leading-tight group-hover:text-primary transition-colors">
              {t.brand.name}
            </span>
            <span className="hidden sm:inline-block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider leading-none mt-0.5">
              {t.brand.tagline}
            </span>
          </div>
        </Link>

        {/* Desktop Segmented Navigation Dock */}
        <nav
          className="hidden md:flex items-center p-1 rounded-full border border-border/70 bg-muted/40 backdrop-blur-md shadow-2xs"
          aria-label={t.accessibility.openMenu}
        >
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? "bg-surface text-foreground shadow-xs font-bold ring-1 ring-border/80"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface/50"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions: Language, Notifications & Account */}
        <div className="hidden md:flex items-center gap-2.5 lg:gap-3">
          <LanguageSwitcher />

          {!loading && status === "authenticated" && user ? (
            <div className="flex items-center gap-2">
              {/* Notification Bell */}
              <NotificationBell locale={currentLocale} />

              {/* User Profile Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label={
                    currentLocale === "en"
                      ? "Open user account menu"
                      : "ব্যবহারকারী অ্যাকাউন্ট মেনু খুলুন"
                  }
                  className="group flex items-center gap-2.5 py-1 pl-1 pr-2.5 rounded-full border border-border/80 bg-surface/90 hover:bg-surface transition-all duration-150 shadow-2xs hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background cursor-pointer select-none"
                >
                  <div className="flex items-center justify-center size-7 rounded-full bg-gradient-to-br from-primary to-rose-600 text-white font-bold text-xs shrink-0 ring-1 ring-white/20 shadow-2xs">
                    {userInitial}
                  </div>
                  <span
                    className="max-w-[110px] truncate text-xs font-semibold text-foreground text-left"
                    title={displayName}
                  >
                    {displayName}
                  </span>
                  {!user.emailVerified && (
                    <span
                      title={t.auth.userMenu.emailNotVerified}
                      className="size-2 rounded-full bg-amber-500 animate-pulse shrink-0"
                      aria-hidden="true"
                    />
                  )}
                  <ChevronDown className="size-3.5 text-muted-foreground group-hover:text-foreground transition-transform duration-150" aria-hidden="true" />
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-64 p-1.5 shadow-2xl border-border/80">
                  <DropdownMenuLabel className="space-y-1">
                    <div className="font-bold text-sm text-foreground truncate">
                      {displayName}
                    </div>
                    <div className="font-mono text-xs text-muted-foreground truncate normal-case">
                      {user.email}
                    </div>
                    {!user.emailVerified && (
                      <Link
                        href={verifyEmailHref}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 mt-1 hover:bg-amber-500/20 transition-colors normal-case"
                      >
                        <AlertCircle className="size-3" aria-hidden="true" />
                        <span>{t.auth.userMenu.verifyNow}</span>
                      </Link>
                    )}
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={() => router.push(accountHref)}>
                    <UserIcon className="size-4 text-muted-foreground" aria-hidden="true" />
                    <span>{t.auth.userMenu.profile}</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => router.push(myRequestsHref)}>
                    <FileText className="size-4 text-muted-foreground" aria-hidden="true" />
                    <span>
                      {currentLocale === "en" ? "My Blood Requests" : "আমার রক্তের অনুরোধ"}
                    </span>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => router.push(contactRequestsHref)}>
                    <MessageSquare className="size-4 text-muted-foreground" aria-hidden="true" />
                    <span>
                      {currentLocale === "en" ? "Contact Requests" : "যোগাযোগের তালিকা"}
                    </span>
                  </DropdownMenuItem>

                  {user.isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => router.push(adminHref)}>
                        <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
                        <span className="font-semibold text-primary">
                          {currentLocale === "en" ? "Admin Console" : "প্রশাসনিক প্যানেল"}
                        </span>
                        <Badge variant="subtle" className="ml-auto text-[10px] py-0 px-1.5 font-bold">
                          Admin
                        </Badge>
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive font-medium"
                  >
                    <LogOut className="size-4" aria-hidden="true" />
                    <span>{t.auth.userMenu.logout}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Subtle Become a Donor CTA for authenticated non-donors */}
              {!isDonor && primaryAction && (
                <Button asChild variant="subtle" size="sm" className="font-semibold shadow-2xs">
                  <Link href={primaryAction.href}>
                    <Droplet className="size-3.5 fill-current mr-1" aria-hidden="true" />
                    {primaryAction.label}
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {secondaryAction && (
                <Button asChild variant="ghost" size="sm" className="font-semibold text-xs sm:text-sm">
                  <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
                </Button>
              )}

              {primaryAction && (
                <Button
                  asChild
                  variant="default"
                  size="sm"
                  className="bg-gradient-to-b from-primary via-primary to-rose-700 hover:from-primary-hover hover:to-rose-800 text-white font-semibold shadow-xs shadow-primary/20 border border-primary/20"
                >
                  <Link href={primaryAction.href}>
                    <Droplet className="size-4 fill-current mr-1.5" aria-hidden="true" />
                    {primaryAction.label}
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Mobile Navigation Trigger */}
        <MobileNav />
      </div>
    </header>
  );
}
