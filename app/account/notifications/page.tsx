import * as React from "react";
import type { Metadata } from "next";
import { Bell } from "lucide-react";

import { constructMetadata } from "@/lib/seo/metadata";
import { InnerPageHero } from "@/components/shared/inner-page-hero";
import { AccountNavTabs } from "@/components/account/account-nav-tabs";
import { NotificationsView } from "@/components/notifications/notifications-view";

export const metadata: Metadata = constructMetadata({
  title: "বিজ্ঞপ্তি কেন্দ্র",
  path: "/account/notifications",
  locale: "bn",
});

export default function NotificationsPage() {
  return (
    <main className="flex-1 bg-background">
      {/* Unified Modern Hero & Context Header */}
      <InnerPageHero
        badge="অ্যাকাউন্ট ড্যাশবোর্ড"
        badgeIcon={Bell}
        title="বিজ্ঞপ্তি কেন্দ্র"
        description="আপনার রক্তের অনুরোধ, যোগাযোগের বার্তা ও সিস্টেম আপডেটের সকল সাম্প্রতিক নোটিফিকেশন।"
      >
        {/* Navigation Tabs */}
        <div className="pt-2">
          <AccountNavTabs locale="bn" />
        </div>
      </InnerPageHero>

      {/* Main Content Section */}
      <section className="py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <NotificationsView locale="bn" />
        </div>
      </section>
    </main>
  );
}
