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
    title: "ম্যাচিং রক্তদাতা সন্ধান",
    description: "জরুরি রক্তের চাহিদার সাথে সামঞ্জস্যপূর্ণ রক্তদাতাদের তালিকা ও যোগাযোগ ব্যবস্থা।",
    path: `/blood-request/${id}`,
    locale: "bn",
  });
}

export default async function RequestMatchingPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <main className="flex-1 bg-background py-8 sm:py-12 lg:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <React.Suspense fallback={<div className="py-12 text-center text-sm text-muted-foreground">লোড হচ্ছে...</div>}>
          <RequestMatchingView requestId={id} locale="bn" />
        </React.Suspense>
      </div>
    </main>
  );
}

