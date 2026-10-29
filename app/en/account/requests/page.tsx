import * as React from "react";
import type { Metadata } from "next";
import { ClipboardList } from "lucide-react";

import { constructMetadata } from "@/lib/seo/metadata";
import { InnerPageHero } from "@/components/shared/inner-page-hero";
import { AccountNavTabs } from "@/components/account/account-nav-tabs";
import { MyRequestsView } from "@/components/blood-requests/my-requests-view";

export const metadata: Metadata = constructMetadata({
  title: "My Blood Requests",
  path: "/account/requests",
  locale: "en",
});

export default function MyRequestsEnglishPage() {
  return (
    <main className="flex-1 bg-background">
      {/* Unified Modern Hero & Context Header */}
      <InnerPageHero
        badge="Account Dashboard"
        badgeIcon={ClipboardList}
        title="My Blood Requests"
        description="Track, update details, or close your broadcasted emergency blood requests."
      >
        {/* Navigation Tabs */}
        <div className="pt-2">
          <AccountNavTabs locale="en" />
        </div>
      </InnerPageHero>

      {/* Main Content Section */}
      <section className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MyRequestsView locale="en" />
        </div>
      </section>
    </main>
  );
}
