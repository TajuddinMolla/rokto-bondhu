import * as React from "react";
import type { Metadata } from "next";

import { constructMetadata } from "@/lib/seo/metadata";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminDashboardView } from "@/components/admin/admin-dashboard-view";

export const metadata: Metadata = constructMetadata({
  title: "Admin Dashboard",
  path: "/admin",
  locale: "en",
});

export default function EnglishAdminDashboardPage() {
  return (
    <AdminGuard locale="en">
      <AdminDashboardView locale="en" />
    </AdminGuard>
  );
}
