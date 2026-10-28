import * as React from "react";
import type { Metadata } from "next";

import { constructMetadata } from "@/lib/seo/metadata";
import { NotificationsView } from "@/components/notifications/notifications-view";

export const metadata: Metadata = constructMetadata({
  title: "বিজ্ঞপ্তি কেন্দ্র",
  path: "/account/notifications",
  locale: "bn",
});

export default function NotificationsPage() {
  return (
    <main className="flex-1 bg-background py-8 sm:py-12 lg:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <NotificationsView locale="bn" />
      </div>
    </main>
  );
}

