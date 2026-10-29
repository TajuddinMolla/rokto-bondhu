import * as React from "react";
import type { Metadata } from "next";

import { constructMetadata } from "@/lib/seo/metadata";
import { AccountNavTabs } from "@/components/account/account-nav-tabs";
import { MyRequestsView } from "@/components/blood-requests/my-requests-view";

export const metadata: Metadata = constructMetadata({
  title: "আমার রক্তের অনুরোধ",
  path: "/account/requests",
  locale: "bn",
});

export default function MyRequestsPage() {
  return (
    <main className="flex-1 bg-background py-6 sm:py-10 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        <AccountNavTabs locale="bn" />
        <MyRequestsView locale="bn" />
      </div>
    </main>
  );
}
