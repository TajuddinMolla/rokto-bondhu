import * as React from "react";
import type { Metadata } from "next";
import { User } from "lucide-react";

import { constructMetadata } from "@/lib/seo/metadata";
import { Badge } from "@/components/ui/badge";
import { ProfileManager } from "@/components/account/profile-manager";

export const metadata: Metadata = constructMetadata({
  title: "আমার অ্যাকাউন্ট ও প্রোফাইল",
  path: "/account",
  locale: "bn",
});

export default function AccountPage() {
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
            অ্যাকাউন্ট ড্যাশবোর্ড
          </Badge>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
            আমার অ্যাকাউন্ট ও রক্তদাতা প্রোফাইল
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
            আপনার অ্যাকাউন্ট তথ্য পরিচালনা করুন এবং রক্তদানের প্রাপ্যতা
            স্ট্যাটাস পরিবর্তন করুন।
          </p>
        </div>

        {/* Profile Manager Component */}
        <ProfileManager locale="bn" />
      </div>
    </main>
  );
}
