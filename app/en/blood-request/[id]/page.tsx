import * as React from "react";
import type { Metadata } from "next";

import { constructMetadata } from "@/lib/seo/metadata";
import { InnerPageHero } from "@/components/shared/inner-page-hero";
import { RequestMatchingView } from "@/components/blood-requests/request-matching-view";

export const instant = false;

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  return constructMetadata({
    title: "Find Matching Donors",
    description: "Discover and contact voluntary blood donors matching this requisition.",
    path: `/blood-request/${id}`,
    locale: "en",
  });
}

export default async function RequestMatchingEnglishPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <main className="flex-1 bg-background">
      {/* Unified Modern Hero & Context Header */}
      <InnerPageHero
        badge="Matching Donors Search"
        badgePulse={true}
        title="Matching Donors & Direct Contact"
        description="Connect promptly with voluntary donors compatible with your emergency requisition."
      />

      {/* Matching Results Section */}
      <section className="py-8 sm:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <React.Suspense
            fallback={
              <div className="py-16 text-center text-sm text-muted-foreground animate-pulse">
                Loading matching donor profiles...
              </div>
            }
          >
            <RequestMatchingView requestId={id} locale="en" />
          </React.Suspense>
        </div>
      </section>
    </main>
  );
}
