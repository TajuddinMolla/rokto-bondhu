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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DonorSearchFilters } from "@/components/donors/donor-search-filters";
import { DonorResultsState } from "@/components/donors/donor-results-state";
import { EmergencyBanner } from "@/components/shared/emergency-banner";

export const metadata: Metadata = constructMetadata({
  title: "Find Blood Donors",
  path: "/en/donors",
  locale: "en",
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

export default function EnglishDonorsPage() {
  const t = getTranslations("en");

  return (
    <main className="flex-1 bg-background">
      {/* Modern Hero & Search Context Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/8 via-surface to-background pt-10 sm:pt-14 pb-8 sm:pb-12 border-b border-border/70">
        {/* Soft ambient lighting */}
        <div
          className="pointer-events-none absolute -top-24 right-0 -z-10 size-96 rounded-full bg-primary/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-0 left-0 -z-10 size-80 rounded-full bg-rose-500/5 blur-3xl"
          aria-hidden="true"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Title & Headline */}
          <div className="space-y-3.5 max-w-3xl">
            <Badge
              variant="subtle"
              className="gap-2 px-3.5 py-1 text-xs font-bold rounded-full border border-primary-border shadow-2xs"
            >
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
              </span>
              <span>24/7 Verified Voluntary Donor Registry</span>
            </Badge>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight leading-[1.15]">
              {t.donorsPage.title}
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
              {t.donorsPage.description}
            </p>
          </div>

          {/* Dedicated Modern Emergency Callout Banner */}
          <EmergencyBanner locale="en" />

          {/* Platform Trust & Safety Guarantees Bar */}
          <div className="pt-2 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
              <span>Full Phone & Privacy Protection</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="size-4 text-primary shrink-0" aria-hidden="true" />
              <span>100% Free & Voluntary Mission</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-primary shrink-0" aria-hidden="true" />
              <span>Nationwide 64-District Network</span>
            </div>
            <div className="flex items-center gap-2">
              <Droplet className="size-4 text-primary shrink-0" aria-hidden="true" />
              <span>All 8 Blood Groups</span>
            </div>
          </div>
        </div>
      </section>

      {/* Directory Grid Section */}
      <section className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Filters Sidebar (Desktop) / Mobile Toolbar (< lg) */}
            <aside className="lg:col-span-4 lg:sticky lg:top-24">
              <React.Suspense fallback={<LoadingSkeleton />}>
                <DonorSearchFilters locale="en" />
              </React.Suspense>
            </aside>

            {/* Results State Column */}
            <div
              aria-label={t.donorsPage.results.title}
              className="lg:col-span-8"
            >
              <React.Suspense fallback={<LoadingSkeleton />}>
                <DonorResultsState locale="en" />
              </React.Suspense>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
