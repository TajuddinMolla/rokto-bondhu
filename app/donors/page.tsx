import * as React from "react";
import type { Metadata } from "next";
import {
  ShieldCheck,
  Heart,
  MapPin,
  Droplet,
} from "lucide-react";

import { constructMetadata } from "@/lib/seo/metadata";
import { getTranslations } from "@/i18n/translations";
import { Skeleton } from "@/components/ui/skeleton";
import { InnerPageHero } from "@/components/shared/inner-page-hero";
import { DonorSearchFilters } from "@/components/donors/donor-search-filters";
import { DonorResultsState } from "@/components/donors/donor-results-state";
import { EmergencyBanner } from "@/components/shared/emergency-banner";

export const metadata: Metadata = constructMetadata({
  title: "রক্তদাতা অনুসন্ধান",
  path: "/donors",
  locale: "bn",
});

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-44 rounded-3xl border border-border/80 bg-surface/50" />
      <Skeleton className="h-44 rounded-3xl border border-border/80 bg-surface/50" />
      <Skeleton className="h-44 rounded-3xl border border-border/80 bg-surface/50" />
    </div>
  );
}

export default function DonorsPage() {
  const t = getTranslations("bn");

  return (
    <main className="flex-1 bg-background">
      {/* Modern Hero & Search Context Header */}
      <InnerPageHero
        badge="২৪/৭ ভেরিফায়েড স্বেচ্ছাসেবী রক্তদাতা নেটওয়ার্ক"
        badgePulse={true}
        title={t.donorsPage.title}
        description={t.donorsPage.description}
      >
        {/* Dedicated Modern Emergency Callout Banner */}
        <EmergencyBanner locale="bn" />

        {/* Platform Trust & Safety Guarantees Bar */}
        <div className="pt-2 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
            <span>মোবাইল নম্বর ও তথ্যের সর্বোচ্চ সুরক্ষা</span>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="size-4 text-primary shrink-0" aria-hidden="true" />
            <span>১০০% অবাণিজ্যিক মানবিক সেবা</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-primary shrink-0" aria-hidden="true" />
            <span>৬৪ জেলা ও সকল উপজেলায় সংযোগ</span>
          </div>
          <div className="flex items-center gap-2">
            <Droplet className="size-4 text-primary shrink-0" aria-hidden="true" />
            <span>৮টি রক্তের গ্রুপের তালিকা</span>
          </div>
        </div>
      </InnerPageHero>

      {/* Directory Grid Section */}
      <section className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Filters Sidebar (Desktop) / Mobile Toolbar (< lg) */}
            <aside className="lg:col-span-4 lg:sticky lg:top-24">
              <React.Suspense fallback={<LoadingSkeleton />}>
                <DonorSearchFilters locale="bn" />
              </React.Suspense>
            </aside>

            {/* Results State Column */}
            <section
              aria-label={t.donorsPage.results.title}
              className="lg:col-span-8"
            >
              <React.Suspense fallback={<LoadingSkeleton />}>
                <DonorResultsState locale="bn" />
              </React.Suspense>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
