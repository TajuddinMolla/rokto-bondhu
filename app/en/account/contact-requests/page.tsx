import * as React from "react";
import type { Metadata } from "next";

import { constructMetadata } from "@/lib/seo/metadata";
import { ContactRequestsView } from "@/components/account/contact-requests-view";

export const metadata: Metadata = constructMetadata({
  title: "Donor Contact Requests",
  path: "/account/contact-requests",
  locale: "en",
});

export default function ContactRequestsEnglishPage() {
  return (
    <main className="flex-1 bg-background py-8 sm:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <ContactRequestsView locale="en" />
      </div>
    </main>
  );
}
