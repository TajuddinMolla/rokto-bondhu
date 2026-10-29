import * as React from "react";
import type { Metadata } from "next";
import { MessageSquare } from "lucide-react";

import { constructMetadata } from "@/lib/seo/metadata";
import { InnerPageHero } from "@/components/shared/inner-page-hero";
import { AccountNavTabs } from "@/components/account/account-nav-tabs";
import { ContactRequestsView } from "@/components/account/contact-requests-view";

export const metadata: Metadata = constructMetadata({
  title: "Donor Contact Requests",
  path: "/account/contact-requests",
  locale: "en",
});

export default function ContactRequestsEnglishPage() {
  return (
    <main className="flex-1 bg-background">
      {/* Unified Modern Hero & Context Header */}
      <InnerPageHero
        badge="Account Dashboard"
        badgeIcon={MessageSquare}
        title="Donor Contact Requests"
        description="Review incoming patient inquiries (as donor) and track outgoing contact requests to private donors."
      >
        {/* Navigation Tabs */}
        <div className="pt-2">
          <AccountNavTabs locale="en" />
        </div>
      </InnerPageHero>

      {/* Main Content Section */}
      <section className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ContactRequestsView locale="en" />
        </div>
      </section>
    </main>
  );
}
