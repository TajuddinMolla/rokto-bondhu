import * as React from "react";
import type { Metadata } from "next";
import { Bell } from "lucide-react";

import { constructMetadata } from "@/lib/seo/metadata";
import { InnerPageHero } from "@/components/shared/inner-page-hero";
import { AccountNavTabs } from "@/components/account/account-nav-tabs";
import { NotificationsView } from "@/components/notifications/notifications-view";

export const metadata: Metadata = constructMetadata({
  title: "Notification Center",
  path: "/en/account/notifications",
  locale: "en",
});

export default function NotificationsPageEn() {
  return (
    <main className="flex-1 bg-background">
      {/* Unified Modern Hero & Context Header */}
      <InnerPageHero
        badge="Account Dashboard"
        badgeIcon={Bell}
        title="Notification Center"
        description="Stay updated with responses to your blood requests, direct messages, and system alerts."
      >
        {/* Navigation Tabs */}
        <div className="pt-2">
          <AccountNavTabs locale="en" />
        </div>
      </InnerPageHero>

      {/* Main Content Section */}
      <section className="py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <NotificationsView locale="en" />
        </div>
      </section>
    </main>
  );
}
