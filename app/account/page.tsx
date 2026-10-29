import * as React from "react";
import type { Metadata } from "next";
import { User } from "lucide-react";

import { constructMetadata } from "@/lib/seo/metadata";
import { InnerPageHero } from "@/components/shared/inner-page-hero";
import { AccountNavTabs } from "@/components/account/account-nav-tabs";
import { ProfileManager } from "@/components/account/profile-manager";

export const metadata: Metadata = constructMetadata({
  title: "আমার অ্যাকাউন্ট ও প্রোফাইল",
  path: "/account",
  locale: "bn",
});

export default function AccountPage() {
  return (
    <main className="flex-1 bg-background">
      {/* Unified Modern Hero & Context Header */}
      <InnerPageHero
        badge="অ্যাকাউন্ট ড্যাশবোর্ড"
        badgeIcon={User}
        title="আমার অ্যাকাউন্ট ও রক্তদাতা প্রোফাইল"
        description="আপনার ব্যক্তিগত প্রোফাইল, রক্তদানের প্রাপ্যতা স্ট্যাটাস, জরুরি রক্তের অনুরোধ ও সরাসরি যোগাযোগের তথ্য পরিচালনা করুন।"
      >
        {/* Navigation Tabs */}
        <div className="pt-2">
          <AccountNavTabs locale="bn" />
        </div>
      </InnerPageHero>

      {/* Main Account Content */}
      <section className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProfileManager locale="bn" />
        </div>
      </section>
    </main>
  );
}
