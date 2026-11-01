import * as React from "react";
import type { Metadata } from "next";

import { constructMetadata } from "@/lib/seo/metadata";
import { PrivacyPolicyView } from "@/components/legal/privacy-policy-view";

export const metadata: Metadata = constructMetadata({
  title: "Privacy Policy",
  description:
    "Privacy policy, donor phone number protection, data retention, and user choices on the RoktoBondhu platform.",
  path: "/en/privacy-policy",
  locale: "en",
});

export default function EnPrivacyPolicyPage() {
  return <PrivacyPolicyView locale="en" />;
}

