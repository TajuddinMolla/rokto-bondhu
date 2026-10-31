import * as React from "react";
import type { Metadata } from "next";

import { constructMetadata } from "@/lib/seo/metadata";
import { VerifyEmailView } from "@/components/auth/verify-email-view";

export const metadata: Metadata = constructMetadata({
  title: "Email Verification",
  path: "/en/verify-email",
  locale: "en",
});

export default function EnVerifyEmailPage() {
  return (
    <React.Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-surface/50" />}>
      <VerifyEmailView locale="en" />
    </React.Suspense>
  );
}
