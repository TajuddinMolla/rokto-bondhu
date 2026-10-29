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
import { InnerPageHero } from "@/components/shared/inner-page-hero";
import { EmergencyBanner } from "@/components/shared/emergency-banner";
import { RequestFilters } from "@/components/blood-requests/request-filters";
import { RequestResultsState } from "@/components/blood-requests/request-results-state";

export const metadata: Metadata = constructMetadata({
  title: "জরুরি রক্তের অনুরোধ",
  path: "/blood-request",
  locale: "bn",
});

function LoadingSkeleton() {
  return (
    <div className="h-64 rounded-xl border border-border bg-surface/50 animate-pulse" />
  );
}

export default function BloodRequestsPage() {
  const t = getTranslations("bn");

  return (
    <main className="flex-1 bg-background">
      {/* Unified Modern Hero & Context Header */}
      <InnerPageHero
        badge={t.bloodRequestsPage.badge}
        badgePulse={true}
        title={t.bloodRequestsPage.title}
        description={t.bloodRequestsPage.description}
      >
        {/* Dedicated Modern Emergency Callout Banner */}
        <EmergencyBanner locale="bn" />

        {/* Platform Trust & Safety Guarantees Bar */}
        <div className="pt-2 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
            <span>ভেরিফায়েড রোগী ও রক্তের অনুরোধ</span>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="size-4 text-primary shrink-0" aria-hidden="true" />
            <span>১০০% অবাণিজ্যিক মানবিক সহায়তা</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-primary shrink-0" aria-hidden="true" />
            <span>৬৪ জেলা ও সকল হাসপাতালে সংযোগ</span>
          </div>
          <div className="flex items-center gap-2">
            <Droplet className="size-4 text-primary shrink-0" aria-hidden="true" />
            <span>সকল রক্তের গ্রুপের রিয়েল-টাইম চাহিদা</span>
          </div>
        </div>
      </InnerPageHero>

      {/* Directory Grid Section */}
      <section className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Filters Sidebar */}
            <aside className="lg:col-span-4 lg:sticky lg:top-24">
              <React.Suspense fallback={<LoadingSkeleton />}>
                <RequestFilters locale="bn" />
              </React.Suspense>
            </aside>

            {/* Results State Column */}
            <section
              aria-label={t.bloodRequestsPage.results.title}
              className="lg:col-span-8"
            >
              <React.Suspense fallback={<LoadingSkeleton />}>
                <RequestResultsState locale="bn" />
              </React.Suspense>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
