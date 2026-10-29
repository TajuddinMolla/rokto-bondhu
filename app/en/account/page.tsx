import * as React from "react";
import type { Metadata } from "next";
import { User } from "lucide-react";

import { constructMetadata } from "@/lib/seo/metadata";
import { InnerPageHero } from "@/components/shared/inner-page-hero";
import { AccountNavTabs } from "@/components/account/account-nav-tabs";
import { ProfileManager } from "@/components/account/profile-manager";

export const metadata: Metadata = constructMetadata({
  title: "My Account & Profile",
  path: "/en/account",
  locale: "en",
});

export default function EnglishAccountPage() {
  return (
    <main className="flex-1 bg-background">
      {/* Unified Modern Hero & Context Header */}
      <InnerPageHero
        badge="Account Dashboard"
        badgeIcon={User}
        title="My Account & Donor Profile"
        description="Manage your personal profile, blood donation availability, urgent requisition broadcasts, and direct inquiries in one place."
      >
        {/* Navigation Tabs */}
        <div className="pt-2">
          <AccountNavTabs locale="en" />
        </div>
      </InnerPageHero>

      {/* Main Account Content */}
      <section className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProfileManager locale="en" />
        </div>
      </section>
    </main>
  );
}
