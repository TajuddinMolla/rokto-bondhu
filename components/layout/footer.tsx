"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Droplet, Heart, ShieldCheck, ChevronRight } from "lucide-react";

import { getLocaleFromPathname, isAuthPathname } from "@/i18n/config";
import { getTranslations } from "@/i18n/translations";
import { getMainNavItems, getUserNavItems } from "@/constants/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useIsDonor } from "@/hooks/use-is-donor";

const emptySubscribe = () => () => {};
const getClientYear = () => new Date().getFullYear();
const getServerYear = () => 2026;

function DynamicYear() {
  const year = React.useSyncExternalStore(
    emptySubscribe,
    getClientYear,
    getServerYear
  );
  return <>{year}</>;
}

export function Footer() {
  const pathname = usePathname();
  const { user, status } = useAuth();
  const { isDonor } = useIsDonor();

  // Completely omit footer on authentication routes
  if (isAuthPathname(pathname)) {
    return null;
  }

  const currentLocale = getLocaleFromPathname(pathname);
  const t = getTranslations(currentLocale);

  const isAuthenticated = status === "authenticated" && Boolean(user);

  const mainNavItems = getMainNavItems(currentLocale);
  const userNavItems = getUserNavItems(currentLocale, {
    isAuthenticated,
    isDonor,
  });
  const homeHref = currentLocale === "en" ? "/en" : "/";

  return (
    <footer
      role="contentinfo"
      className="relative w-full border-t border-border/60 bg-gradient-to-b from-background to-surface text-foreground transition-colors mt-auto overflow-hidden"
    >
      {/* Top Ambient Glow Line */}
      <div
        className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          {/* Brand Info & Mission Statement (5 cols) */}
          <div className="md:col-span-6 lg:col-span-5 flex flex-col space-y-4">
            <Link
              href={homeHref}
              className="flex items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-fit group"
              aria-label={`${t.brand.name} ${t.nav.home}`}
            >
              <div className="flex items-center justify-center size-9 rounded-xl bg-gradient-to-br from-primary via-rose-600 to-rose-700 text-white shadow-xs group-hover:shadow-sm group-hover:scale-105 transition-all">
                <Droplet className="size-5 fill-current" aria-hidden="true" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-foreground leading-tight">
                  {t.brand.name}
                </span>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider leading-none mt-0.5">
                  {t.brand.tagline}
                </span>
              </div>
            </Link>

            <p className="text-sm font-bold text-primary tracking-tight">
              {t.footer.tagline}
            </p>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md">
              {t.footer.donationMessage}
            </p>

            {/* Live Network & Non-Commercial Safety Indicator */}
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold w-fit shadow-2xs">
                <span className="relative flex size-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
                </span>
                <span>
                  {currentLocale === "en"
                    ? "Live Voluntary Network • All 64 Districts of BD"
                    : "সক্রিয় স্বেচ্ছাসেবী নেটওয়ার্ক • ৬৪ জেলায় প্রস্তুত"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
              <ShieldCheck className="size-4 text-primary shrink-0" aria-hidden="true" />
              <span>
                {currentLocale === "en"
                  ? "100% Free & Voluntary • Zero Commercial Brokerage"
                  : "১০০% বিনামূল্যে ও স্বেচ্ছাসেবী • কোনো আর্থিক মধ্যস্থতা নেই"}
              </span>
            </div>
          </div>

          {/* Quick Navigation Links (3 cols) */}
          <div className="md:col-span-3 lg:col-span-3 lg:col-start-7 flex flex-col space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              {t.footer.quickLinks}
            </h3>
            <ul className="flex flex-col space-y-2 text-sm text-muted-foreground">
              {mainNavItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group hover:text-foreground hover:translate-x-1 transition-all duration-150 rounded-sm py-1 inline-flex items-center gap-1.5"
                  >
                    <ChevronRight className="size-3 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform Participation (3 cols) */}
          <div className="md:col-span-3 lg:col-span-3 flex flex-col space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              {isAuthenticated
                ? (currentLocale === "en" ? "My Account" : "আমার অ্যাকাউন্ট")
                : t.footer.participation}
            </h3>
            <ul className="flex flex-col space-y-2 text-sm text-muted-foreground">
              {userNavItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group hover:text-foreground hover:translate-x-1 transition-all duration-150 rounded-sm py-1 inline-flex items-center gap-1.5"
                  >
                    <ChevronRight className="size-3 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Community Mission Notice */}
        <div className="border-t border-border mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p className="font-medium">
            © <DynamicYear /> {t.footer.copyright}
          </p>

          <div className="flex items-center gap-1.5 font-medium">
            <span>{t.footer.missionNote}</span>
            <Heart className="size-3.5 text-primary fill-primary inline-block animate-pulse" aria-hidden="true" />
          </div>
        </div>
      </div>
    </footer>
  );
}
