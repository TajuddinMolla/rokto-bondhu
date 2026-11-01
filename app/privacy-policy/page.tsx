import * as React from "react";
import type { Metadata } from "next";

import { constructMetadata } from "@/lib/seo/metadata";
import { PrivacyPolicyView } from "@/components/legal/privacy-policy-view";

export const metadata: Metadata = constructMetadata({
  title: "গোপনীয়তা নীতি",
  description:
    "রক্তবন্ধু প্ল্যাটফর্মে রক্তদাতা ও ব্যবহারকারীদের তথ্যের সুরক্ষা, মোবাইল নম্বর গোপনীয়তা ব্যবস্থাপনা এবং তথ্য ব্যবহারের নীতি।",
  path: "/privacy-policy",
  locale: "bn",
});

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyView locale="bn" />;
}

