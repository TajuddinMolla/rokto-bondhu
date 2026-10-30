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
    title: "রক্তের অনুরোধের বিবরণ ও উপযুক্ত রক্তদাতা",
    description: "জরুরি রক্তের অনুরোধের বিস্তারিত তথ্য ও উপযুক্ত স্বেচ্ছাসেবী রক্তদাতাদের তালিকা।",
    path: `/blood-request/${id}`,
    locale: "bn",
  });
}

export default async function RequestMatchingPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <main className="flex-1 bg-background py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <React.Suspense
          fallback={
            <div className="py-24 text-center text-sm text-muted-foreground animate-pulse">
              রক্তের অনুরোধ ও ম্যাচিং রক্তদাতাদের তথ্য লোড হচ্ছে...
            </div>
          }
        >
          <RequestMatchingView requestId={id} locale="bn" />
        </React.Suspense>
      </div>
    </main>
  );
}
