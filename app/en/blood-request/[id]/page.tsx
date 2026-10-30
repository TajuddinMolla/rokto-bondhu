import * as React from "react";
import type { Metadata } from "next";

import { constructMetadata } from "@/lib/seo/metadata";
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
    title: "Blood Request Details & Matching Donors",
    description: "Detailed blood requisition information and compatible voluntary donors.",
    path: `/blood-request/${id}`,
    locale: "en",
  });
}

export default async function RequestMatchingEnglishPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <main className="flex-1 bg-background py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <React.Suspense
          fallback={
            <div className="py-24 text-center text-sm text-muted-foreground animate-pulse">
              Loading blood requisition & matching donors...
            </div>
          }
        >
          <RequestMatchingView requestId={id} locale="en" />
        </React.Suspense>
      </div>
    </main>
  );
}
