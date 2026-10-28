import * as React from "react";
import type { Metadata } from "next";

import { constructMetadata } from "@/lib/seo/metadata";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminRequestsView } from "@/components/admin/admin-requests-view";

export const metadata: Metadata = constructMetadata({
  title: "Blood Requests Moderation",
  path: "/admin/requests",
  locale: "en",
});

export default function EnglishAdminRequestsPage() {
  return (
    <AdminGuard locale="en">
      <AdminRequestsView locale="en" />
    </AdminGuard>
  );
}
