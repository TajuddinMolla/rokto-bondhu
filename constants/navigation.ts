import type { Locale } from "@/i18n/config";
import { getTranslations } from "@/i18n/translations";

export interface NavItem {
  label: string;
  href: string;
  isPrimary?: boolean;
}

export function getMainNavItems(locale: Locale): readonly NavItem[] {
  const t = getTranslations(locale);
  const prefix = locale === "en" ? "/en" : "";

  return [
    { label: t.nav.home, href: prefix || "/" },
    { label: t.nav.findDonors, href: `${prefix}/donors` },
    { label: t.nav.bloodRequests, href: `${prefix}/blood-request` },
  ];
}

export function getUserNavItems(locale: Locale): readonly NavItem[] {
  const t = getTranslations(locale);
  const prefix = locale === "en" ? "/en" : "";

  return [
    { label: t.nav.login, href: `${prefix}/login` },
    {
      label: t.nav.becomeDonor,
      href: `${prefix}/register`,
      isPrimary: true,
    },
  ];
}
