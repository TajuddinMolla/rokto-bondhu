import * as React from "react";
import type { Metadata } from "next";

import { constructMetadata } from "@/lib/seo/metadata";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminReportsView } from "@/components/admin/admin-reports-view";

export const instant = false;

export const metadata: Metadata = constructMetadata({
  title: "Reports & Safety Queue",
  path: "/admin/reports",
  locale: "en",
});

export default function EnglishAdminReportsPage() {
  return (
    <AdminGuard locale="en">
      <AdminReportsView locale="en" />
    </AdminGuard>
  );
}
