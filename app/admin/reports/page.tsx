import * as React from "react";
import type { Metadata } from "next";

import { constructMetadata } from "@/lib/seo/metadata";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminReportsView } from "@/components/admin/admin-reports-view";

export const instant = false;

export const metadata: Metadata = constructMetadata({
  title: "অভিযোগ ও নিরাপত্তা ফ্ল্যাগ তালিকা",
  path: "/admin/reports",
  locale: "bn",
});

export default function AdminReportsPage() {
  return (
    <AdminGuard locale="bn">
      <AdminReportsView locale="bn" />
    </AdminGuard>
  );
}
