import * as React from "react";
import type { Metadata } from "next";

import { constructMetadata } from "@/lib/seo/metadata";
import { AccountNavTabs } from "@/components/account/account-nav-tabs";
import { NotificationsView } from "@/components/notifications/notifications-view";

export const metadata: Metadata = constructMetadata({
  title: "বিজ্ঞপ্তি কেন্দ্র",
  path: "/account/notifications",
  locale: "bn",
});

export default function NotificationsPage() {
  return (
    <main className="flex-1 bg-background py-6 sm:py-10 lg:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        <AccountNavTabs locale="bn" />
        <NotificationsView locale="bn" />
      </div>
    </main>
  );
}
