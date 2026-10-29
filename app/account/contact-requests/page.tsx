import * as React from "react";
import type { Metadata } from "next";

import { constructMetadata } from "@/lib/seo/metadata";
import { AccountNavTabs } from "@/components/account/account-nav-tabs";
import { ContactRequestsView } from "@/components/account/contact-requests-view";

export const metadata: Metadata = constructMetadata({
  title: "রক্তদাতার যোগাযোগের অনুরোধ",
  path: "/account/contact-requests",
  locale: "bn",
});

export default function ContactRequestsPage() {
  return (
    <main className="flex-1 bg-background py-6 sm:py-10 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        <AccountNavTabs locale="bn" />
        <ContactRequestsView locale="bn" />
      </div>
    </main>
  );
}
