import * as React from "react";
import type { Metadata } from "next";

import { constructMetadata } from "@/lib/seo/metadata";
import { TermsView } from "@/components/legal/terms-view";

export const metadata: Metadata = constructMetadata({
  title: "Terms of Service",
  description:
    "Terms of service, voluntary donor responsibilities, requester obligations, medical disclaimers, and non-commercial guidelines for RoktoBondhu.",
  path: "/en/terms",
  locale: "en",
});

export default function EnTermsPage() {
  return <TermsView locale="en" />;
}

