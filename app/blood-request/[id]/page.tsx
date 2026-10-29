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
    title: "ম্যাচিং রক্তদাতা সন্ধান",
    description: "জরুরি রক্তের চাহিদার সাথে সামঞ্জস্যপূর্ণ রক্তদাতাদের তালিকা ও যোগাযোগ ব্যবস্থা।",
    path: `/blood-request/${id}`,
    locale: "bn",
  });
}

export default async function RequestMatchingPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <main className="flex-1 bg-background">
      {/* Unified Modern Hero & Context Header */}
      <InnerPageHero
        badge="ম্যাচিং রক্তদাতা সন্ধান"
        badgePulse={true}
        title="উপযুক্ত রক্তদাতা ও সরাসরি যোগাযোগ"
        description="আপনার জরুরি রক্তের চাহিদার সাথে সামঞ্জস্যপূর্ণ রক্তদাতাদের তালিকা ও তাদের সাথে সরাসরি যোগাযোগের ব্যবস্থা।"
      />

      {/* Matching Results Section */}
      <section className="py-8 sm:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <React.Suspense
            fallback={
              <div className="py-16 text-center text-sm text-muted-foreground animate-pulse">
                ম্যাচিং রক্তদাতাদের তথ্য লোড হচ্ছে...
              </div>
            }
          >
            <RequestMatchingView requestId={id} locale="bn" />
          </React.Suspense>
        </div>
      </section>
    </main>
  );
}
