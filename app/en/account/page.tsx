import * as React from "react";
import type { Metadata } from "next";
import { User, ShieldCheck } from "lucide-react";

import { constructMetadata } from "@/lib/seo/metadata";
import { Badge } from "@/components/ui/badge";
import { AccountNavTabs } from "@/components/account/account-nav-tabs";
import { ProfileManager } from "@/components/account/profile-manager";

export const metadata: Metadata = constructMetadata({
  title: "My Account & Profile",
  path: "/en/account",
  locale: "en",
});

export default function EnglishAccountPage() {
  return (
    <main className="flex-1 bg-background py-6 sm:py-10 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Page Ambient Hero Header */}
        <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-surface via-surface to-primary/5 p-6 sm:p-8 shadow-xs">
          <div className="absolute -right-16 -top-16 size-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="border-primary/30 text-primary bg-primary/10 px-3 py-1 text-xs font-semibold rounded-full gap-1.5"
              >
                <User className="size-3.5" aria-hidden="true" />
                <span>Account Dashboard</span>
              </Badge>
              <Badge
                variant="secondary"
                className="text-[11px] font-medium text-muted-foreground bg-muted/60"
              >
                <ShieldCheck className="size-3 mr-1 text-emerald-600" />
                Safe & Verified
              </Badge>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
                My Account & Donor Profile
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
                Manage your personal profile, blood donation availability, urgent blood requisition broadcasts, and direct patient inquiries in one place.
              </p>
            </div>
          </div>
        </div>

        {/* Unified Account Navigation Tabs */}
        <AccountNavTabs locale="en" />

        {/* Main Dashboard / Profile Content */}
        <ProfileManager locale="en" />
      </div>
    </main>
  );
}
