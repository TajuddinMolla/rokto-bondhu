"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Droplet, Heart } from "lucide-react";

import { getLocaleFromPathname, isAuthPathname } from "@/i18n/config";
import { getTranslations } from "@/i18n/translations";
import { getMainNavItems, getUserNavItems } from "@/constants/navigation";

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

  // Completely omit footer on authentication routes
  if (isAuthPathname(pathname)) {
    return null;
  }

  const currentLocale = getLocaleFromPathname(pathname);
  const t = getTranslations(currentLocale);

  const mainNavItems = getMainNavItems(currentLocale);
  const userNavItems = getUserNavItems(currentLocale);
  const homeHref = currentLocale === "en" ? "/en" : "/";

  return (
    <footer
      role="contentinfo"
      className="w-full border-t border-border bg-surface text-foreground transition-colors mt-auto"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Info & Mission Statement */}
          <div className="md:col-span-2 flex flex-col space-y-4">
            <Link
              href={homeHref}
              className="flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-fit"
              aria-label={`${t.brand.name} ${t.nav.home}`}
            >
              <div className="flex items-center justify-center size-8 rounded-lg bg-primary text-primary-foreground shadow-sm">
                <Droplet className="size-4 fill-current" aria-hidden="true" />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">
                {t.brand.name}
              </span>
            </Link>
            <p className="text-sm font-semibold text-primary">
              {t.footer.tagline}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
              {t.footer.donationMessage}
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col space-y-3">
            <h3 className="text-sm font-semibold text-foreground tracking-wide">
              {t.footer.quickLinks}
            </h3>
            <ul className="flex flex-col space-y-2 text-sm text-muted-foreground">
              {mainNavItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm py-0.5 inline-block"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform Participation */}
          <div className="flex flex-col space-y-3">
            <h3 className="text-sm font-semibold text-foreground tracking-wide">
              {t.footer.participation}
            </h3>
            <ul className="flex flex-col space-y-2 text-sm text-muted-foreground">
              {userNavItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm py-0.5 inline-block"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Responsible Notice */}
        <div className="border-t border-border mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>
            © <DynamicYear /> {t.footer.copyright}
          </p>
          <div className="flex items-center gap-1.5">
            <span>{t.footer.missionNote}</span>
            <Heart className="size-3.5 text-primary fill-primary inline-block" aria-hidden="true" />
          </div>
        </div>
      </div>
    </footer>
  );
}
