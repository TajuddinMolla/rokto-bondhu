import * as React from "react";
import type { Metadata } from "next";
import { MessageSquare } from "lucide-react";

import { constructMetadata } from "@/lib/seo/metadata";
import { InnerPageHero } from "@/components/shared/inner-page-hero";
import { AccountNavTabs } from "@/components/account/account-nav-tabs";
import { ContactRequestsView } from "@/components/account/contact-requests-view";

export const metadata: Metadata = constructMetadata({
  title: "রক্তদাতার যোগাযোগের অনুরোধ",
  path: "/account/contact-requests",
  locale: "bn",
});

export default function ContactRequestsPage() {
  return (
    <main className="flex-1 bg-background">
      {/* Unified Modern Hero & Context Header */}
      <InnerPageHero
        badge="অ্যাকাউন্ট ড্যাশবোর্ড"
        badgeIcon={MessageSquare}
        title="রক্তদাতার যোগাযোগের অনুরোধ"
        description="ব্যক্তিগত রক্তদাতাদের সাথে যোগাযোগ এবং রক্তগ্রহীতাদের পাঠানো অনুরোধের তালিকা পরিচালনা করুন।"
      >
        {/* Navigation Tabs */}
        <div className="pt-2">
          <AccountNavTabs locale="bn" />
        </div>
      </InnerPageHero>

      {/* Main Content Section */}
      <section className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ContactRequestsView locale="bn" />
        </div>
      </section>
    </main>
  );
}
