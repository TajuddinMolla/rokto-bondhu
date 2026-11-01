import * as React from "react";
import type { Metadata } from "next";

import { constructMetadata } from "@/lib/seo/metadata";
import { TermsView } from "@/components/legal/terms-view";

export const metadata: Metadata = constructMetadata({
  title: "ব্যবহারের শর্তাবলী",
  description:
    "রক্তবন্ধু প্ল্যাটফর্মের ব্যবহারের নিয়মাবলী, রক্তদাতা ও অনুরোধকারীদের দায়িত্ব, চিকিৎসা সংক্রান্ত সতর্কতা এবং অবাণিজ্যিক সেবার শর্তাবলী।",
  path: "/terms",
  locale: "bn",
});

export default function TermsPage() {
  return <TermsView locale="bn" />;
}

