"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Droplet, Bell, User, LogIn } from "lucide-react";

import { getLocaleFromPathname, isAuthPathname } from "@/i18n/config";
import { useAuth } from "@/hooks/use-auth";
import { useUnreadNotificationsCount } from "@/hooks/queries/use-notifications";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const { user, status } = useAuth();
  const { data: unreadCount = 0 } = useUnreadNotificationsCount(user?.uid);

  // Omit bottom navigation on authentication pages
  if (isAuthPathname(pathname)) {
    return null;
  }

  const locale = getLocaleFromPathname(pathname);
  const prefix = locale === "en" ? "/en" : "";
  const isAuthenticated = status === "authenticated" && Boolean(user);

  const homeHref = prefix || "/";
  const donorsHref = `${prefix}/donors`;
  const requestsHref = `${prefix}/blood-request`;
  const notificationsHref = `${prefix}/account/notifications`;
  const accountHref = isAuthenticated ? `${prefix}/account` : `${prefix}/login`;

  const navItems = [
    {
      label: locale === "en" ? "Home" : "হোম",
      href: homeHref,
      icon: Home,
      exact: true,
    },
    {
      label: locale === "en" ? "Donors" : "রক্তদাতা",
      href: donorsHref,
      icon: Search,
      exact: false,
    },
    {
      label: locale === "en" ? "Requests" : "অনুরোধ",
      href: requestsHref,
      icon: Droplet,
      exact: false,
      isEmergency: true,
    },
    {
      label: locale === "en" ? "Alerts" : "বিজ্ঞপ্তি",
      href: notificationsHref,
      icon: Bell,
      exact: false,
      badge: unreadCount > 0 ? (unreadCount > 9 ? "9+" : String(unreadCount)) : null,
    },
    {
      label: isAuthenticated
        ? locale === "en"
          ? "Account"
          : "অ্যাকাউন্ট"
        : locale === "en"
        ? "Login"
        : "লগইন",
      href: accountHref,
      icon: isAuthenticated ? User : LogIn,
      exact: false,
    },
  ];

  return (
    <nav
      aria-label={locale === "en" ? "Mobile floating navigation dock" : "মোবাইল ভাসমান নেভিগেশন ডক"}
      className="fixed bottom-3 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[440px] z-40 md:hidden pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="grid grid-cols-5 h-16 items-center px-1.5 rounded-2xl border border-border/80 bg-surface/90 backdrop-blur-2xl backdrop-saturate-150 shadow-2xl shadow-black/15 ring-1 ring-black/5 dark:ring-white/10 transition-all">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || (item.href !== "/" && item.href !== "/en" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex flex-col items-center justify-center h-[52px] w-full rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring touch-manipulation select-none",
                isActive
                  ? "bg-primary/10 text-primary font-bold shadow-2xs"
                  : "text-muted-foreground hover:text-foreground font-medium hover:bg-muted/40"
              )}
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  className={cn(
                    "size-5 transition-transform duration-200",
                    isActive && "scale-110",
                    item.isEmergency && !isActive && "text-primary/90"
                  )}
                  aria-hidden="true"
                />
                {item.badge && (
                  <span
                    className="absolute -top-1.5 -right-2.5 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-primary text-primary-foreground font-extrabold text-[9px] shadow-xs ring-1 ring-surface"
                    aria-hidden="true"
                  >
                    {item.badge}
                  </span>
                )}
              </div>

              <span className="text-[10.5px] leading-tight truncate max-w-[58px] mt-0.5">
                {item.label}
              </span>

              {isActive && (
                <span
                  className="absolute bottom-1 size-1 rounded-full bg-primary shadow-xs shadow-primary"
                  aria-hidden="true"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
