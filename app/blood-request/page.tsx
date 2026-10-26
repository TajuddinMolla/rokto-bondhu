import * as React from "react";
import type { Metadata } from "next";
import { AlertCircle } from "lucide-react";

import { constructMetadata } from "@/lib/seo/metadata";
import { getTranslations } from "@/i18n/translations";
import { Badge } from "@/components/ui/badge";
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
    <main className="flex-1 bg-background py-8 sm:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        {/* Page Header */}
        <div className="space-y-3">
          <Badge
            variant="outline"
            className="border-destructive/30 text-destructive bg-destructive/5 px-3 py-1 text-xs font-semibold rounded-full"
          >
            <AlertCircle className="size-3.5 mr-1" aria-hidden="true" />
            {t.bloodRequestsPage.badge}
          </Badge>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
            {t.bloodRequestsPage.title}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
            {t.bloodRequestsPage.description}
          </p>
        </div>

        {/* Content Layout Grid */}
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
    </main>
  );
}
