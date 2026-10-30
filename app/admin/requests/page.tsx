import * as React from "react";
import type { Metadata } from "next";

import { constructMetadata } from "@/lib/seo/metadata";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminRequestsView } from "@/components/admin/admin-requests-view";

export const instant = false;

export const metadata: Metadata = constructMetadata({
  title: "রক্তের অনুরোধ মডারেশন",
  path: "/admin/requests",
  locale: "bn",
});

export default function AdminRequestsPage() {
  return (
    <AdminGuard locale="bn">
      <AdminRequestsView locale="bn" />
    </AdminGuard>
  );
}
