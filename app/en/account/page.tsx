import * as React from "react";
import type { Metadata } from "next";
import { User } from "lucide-react";

import { constructMetadata } from "@/lib/seo/metadata";
import { Badge } from "@/components/ui/badge";
import { ProfileManager } from "@/components/account/profile-manager";

export const metadata: Metadata = constructMetadata({
  title: "My Account & Profile",
  path: "/en/account",
  locale: "en",
});

export default function EnglishAccountPage() {
  return (
    <main className="flex-1 bg-background py-8 sm:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Header */}
        <div className="space-y-2 text-center sm:text-left">
          <Badge
            variant="outline"
            className="border-primary/30 text-primary bg-primary/5 px-3 py-1 text-xs font-semibold rounded-full"
          >
            <User className="size-3.5 mr-1.5" aria-hidden="true" />
            Account Dashboard
          </Badge>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
            My Account & Donor Profile
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
            Manage your personal profile, contact preferences, and blood
            donation availability status.
          </p>
        </div>

        {/* Profile Manager Component */}
        <ProfileManager locale="en" />
      </div>
    </main>
  );
}
