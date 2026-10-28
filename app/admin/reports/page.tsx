import * as React from "react";
import type { Metadata } from "next";

import { constructMetadata } from "@/lib/seo/metadata";
import { AdminReportsView } from "@/components/admin/admin-reports-view";

export const metadata: Metadata = constructMetadata({
  title: "অভিযোগ ও নিরাপত্তা ফ্ল্যাগ তালিকা",
  path: "/admin/reports",
  locale: "bn",
});

export default function AdminReportsPage() {
  return <AdminReportsView locale="bn" />;
}

