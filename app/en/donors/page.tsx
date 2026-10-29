import * as React from "react";
import type { Metadata } from "next";
import { Droplet } from "lucide-react";

import { constructMetadata } from "@/lib/seo/metadata";
import { getTranslations } from "@/i18n/translations";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DonorSearchFilters } from "@/components/donors/donor-search-filters";
import { DonorResultsState } from "@/components/donors/donor-results-state";

export const metadata: Metadata = constructMetadata({
  title: "Find Blood Donors",
  path: "/en/donors",
  locale: "en",
});

function LoadingSkeleton() {
  return (
    <Skeleton className="h-64 rounded-2xl border border-border/80 bg-surface/50" />
  );
}

export default function EnglishDonorsPage() {
  const t = getTranslations("en");

  return (
    <main className="flex-1 bg-background py-8 sm:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        {/* Page Header */}
        <div className="space-y-3">
          <Badge
            variant="subtle"
            className="border-primary-border text-primary bg-primary-subtle px-3.5 py-1 text-xs font-bold rounded-full shadow-2xs"
          >
            <Droplet className="size-3.5 mr-1 fill-current text-primary" aria-hidden="true" />
            {t.donorsPage.badge}
          </Badge>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground tracking-tight">
            {t.donorsPage.title}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
            {t.donorsPage.description}
          </p>
        </div>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Filters Column */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24">
            <React.Suspense fallback={<LoadingSkeleton />}>
              <DonorSearchFilters locale="en" />
            </React.Suspense>
          </aside>

          {/* Results State Column */}
          <section
            aria-label={t.donorsPage.results.title}
            className="lg:col-span-8"
          >
            <React.Suspense fallback={<LoadingSkeleton />}>
              <DonorResultsState locale="en" />
            </React.Suspense>
          </section>
        </div>
      </div>
    </main>
  );
}
