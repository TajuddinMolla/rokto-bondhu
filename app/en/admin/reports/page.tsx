import * as React from "react";
import type { Metadata } from "next";

import { constructMetadata } from "@/lib/seo/metadata";
import { AdminReportsView } from "@/components/admin/admin-reports-view";

export const metadata: Metadata = constructMetadata({
  title: "Reports & Safety Queue",
  path: "/admin/reports",
  locale: "en",
});

export default function EnglishAdminReportsPage() {
  return <AdminReportsView locale="en" />;
}

