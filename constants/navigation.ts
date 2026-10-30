import type { Locale } from "@/i18n/config";
import { getTranslations } from "@/i18n/translations";

export interface NavItem {
  label: string;
  href: string;
  isPrimary?: boolean;
}

export interface UserNavOptions {
  isAuthenticated?: boolean;
  isDonor?: boolean;
}

export function getMainNavItems(locale: Locale): readonly NavItem[] {
  const t = getTranslations(locale);
  const prefix = locale === "en" ? "/en" : "";

  return [
    { label: t.nav.home, href: prefix || "/" },
    { label: t.nav.findDonors, href: `${prefix}/donors` },
    { label: t.nav.bloodRequests, href: `${prefix}/blood-request` },
    {
      label: locale === "en" ? "Post Request" : "রক্তের আবেদন",
      href: `${prefix}/blood-request/create#request-form`,
    },
  ];
}

export function getUserNavItems(
  locale: Locale,
  options?: UserNavOptions
): readonly NavItem[] {
  const t = getTranslations(locale);
  const prefix = locale === "en" ? "/en" : "";

  if (options?.isAuthenticated) {
    const items: NavItem[] = [
      {
        label: locale === "en" ? "My Account" : "আমার অ্যাকাউন্ট",
        href: `${prefix}/account`,
      },
      {
        label: locale === "en" ? "My Requests" : "আমার রক্তের অনুরোধ",
        href: `${prefix}/account/requests`,
      },
      {
        label: locale === "en" ? "Contact Requests" : "যোগাযোগের তালিকা",
        href: `${prefix}/account/contact-requests`,
      },
    ];

    if (options.isDonor) {
      items.push({
        label: locale === "en" ? "Donor Profile" : "রক্তদাতা প্রোফাইল",
        href: `${prefix}/donors/register#registration-form`,
        isPrimary: true,
      });
    } else {
      items.push({
        label: t.nav.becomeDonor,
        href: `${prefix}/donors/register#registration-form`,
        isPrimary: true,
      });
    }

    return items;
  }

  return [
    { label: t.nav.login, href: `${prefix}/login` },
    {
      label: t.nav.becomeDonor,
      href: `${prefix}/donors/register#registration-form`,
      isPrimary: true,
    },
    {
      label: locale === "en" ? "Create Account" : "একাউন্ট নিবন্ধন",
      href: `${prefix}/register`,
    },
  ];
}
