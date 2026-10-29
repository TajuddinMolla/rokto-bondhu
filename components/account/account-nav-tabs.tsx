"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  ClipboardList,
  MessageSquare,
  Bell,
} from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { useMyBloodRequests } from "@/hooks/queries/use-my-blood-requests";
import { useIncomingContactRequests } from "@/hooks/queries/use-contact-requests";
import { useUnreadNotificationsCount } from "@/hooks/queries/use-notifications";
import { Badge } from "@/components/ui/badge";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

interface AccountNavTabsProps {
  locale: Locale;
  className?: string;
}

export function AccountNavTabs({ locale, className }: AccountNavTabsProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const { data: myRequests = [] } = useMyBloodRequests(user?.uid);
  const { data: incomingRequests = [] } = useIncomingContactRequests(user?.uid);
  const { data: unreadNotifications = 0 } = useUnreadNotificationsCount(user?.uid);

  const activeBloodRequestsCount = React.useMemo(
    () => myRequests.filter((r) => r.status === "open").length,
    [myRequests]
  );
  const pendingIncomingCount = React.useMemo(
    () => incomingRequests.filter((r) => r.status === "PENDING").length,
    [incomingRequests]
  );

  const prefix = locale === "en" ? "/en" : "";

  const tabs = [
    {
      id: "overview",
      label: locale === "en" ? "Overview & Profile" : "ড্যাশবোর্ড ও প্রোফাইল",
      href: `${prefix}/account`,
      icon: User,
      exact: true,
      badge: null,
    },
    {
      id: "requests",
      label: locale === "en" ? "My Blood Requests" : "আমার রক্তের অনুরোধ",
      href: `${prefix}/account/requests`,
      icon: ClipboardList,
      exact: false,
      badge: activeBloodRequestsCount > 0 ? String(activeBloodRequestsCount) : null,
      badgeVariant: "default" as const,
    },
    {
      id: "contact-requests",
      label: locale === "en" ? "Contact Inquiries" : "যোগাযোগের অনুরোধ",
      href: `${prefix}/account/contact-requests`,
      icon: MessageSquare,
      exact: false,
      badge: pendingIncomingCount > 0 ? String(pendingIncomingCount) : null,
      badgeVariant: "default" as const,
    },
    {
      id: "notifications",
      label: locale === "en" ? "Notifications" : "বিজ্ঞপ্তি কেন্দ্র",
      href: `${prefix}/account/notifications`,
      icon: Bell,
      exact: false,
      badge: unreadNotifications > 0 ? String(unreadNotifications) : null,
      badgeVariant: "destructive" as const,
    },
  ];

  return (
    <nav
      aria-label={locale === "en" ? "Account navigation tabs" : "অ্যাকাউন্ট নেভিগেশন ট্যাব"}
      className={cn(
        "flex items-center gap-1.5 sm:gap-2 p-1.5 rounded-2xl border border-border/80 bg-muted/30 overflow-x-auto no-scrollbar",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.exact
          ? pathname === tab.href
          : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        const Icon = tab.icon;

        return (
          <Link
            key={tab.id}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap select-none shrink-0 min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              isActive
                ? "bg-surface text-foreground shadow-xs font-bold border border-border/80"
                : "text-muted-foreground hover:text-foreground hover:bg-surface/50"
            )}
          >
            <Icon
              className={cn(
                "size-4 shrink-0 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
              aria-hidden="true"
            />
            <span>{tab.label}</span>
            {tab.badge && (
              <Badge
                variant={tab.badgeVariant}
                className={cn(
                  "ml-0.5 px-1.5 py-0 text-[10px] font-bold h-4.5 rounded-full flex items-center justify-center min-w-4.5",
                  tab.badgeVariant === "destructive" ? "bg-destructive text-white" : ""
                )}
              >
                {tab.badge}
              </Badge>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

