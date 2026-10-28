import * as React from "react";
import type { Metadata } from "next";

import { constructMetadata } from "@/lib/seo/metadata";
import { AdminRequestsView } from "@/components/admin/admin-requests-view";

export const metadata: Metadata = constructMetadata({
  title: "রক্তের অনুরোধ মডারেশন",
  path: "/admin/requests",
  locale: "bn",
});

export default function AdminRequestsPage() {
  return <AdminRequestsView locale="bn" />;
}

