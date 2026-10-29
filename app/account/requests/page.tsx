import * as React from "react";
import type { Metadata } from "next";
import { ClipboardList } from "lucide-react";

import { constructMetadata } from "@/lib/seo/metadata";
import { InnerPageHero } from "@/components/shared/inner-page-hero";
import { AccountNavTabs } from "@/components/account/account-nav-tabs";
import { MyRequestsView } from "@/components/blood-requests/my-requests-view";

export const metadata: Metadata = constructMetadata({
  title: "আমার রক্তের অনুরোধ",
  path: "/account/requests",
  locale: "bn",
});

export default function MyRequestsPage() {
  return (
    <main className="flex-1 bg-background">
      {/* Unified Modern Hero & Context Header */}
      <InnerPageHero
        badge="অ্যাকাউন্ট ড্যাশবোর্ড"
        badgeIcon={ClipboardList}
        title="আমার রক্তের অনুরোধ"
        description="আপনার তৈরি করা জরুরি রক্তের অনুরোধ পর্যবেক্ষণ, বিবরণ হালনাগাদ ও সমাপ্তি পরিচালনা করুন।"
      >
        {/* Navigation Tabs */}
        <div className="pt-2">
          <AccountNavTabs locale="bn" />
        </div>
      </InnerPageHero>

      {/* Main Content Section */}
      <section className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MyRequestsView locale="bn" />
        </div>
      </section>
    </main>
  );
}
