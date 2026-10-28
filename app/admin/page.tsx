import * as React from "react";
import type { Metadata } from "next";

import { constructMetadata } from "@/lib/seo/metadata";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminDashboardView } from "@/components/admin/admin-dashboard-view";

export const metadata: Metadata = constructMetadata({
  title: "প্রশাসনিক ড্যাশবোর্ড",
  path: "/admin",
  locale: "bn",
});

export default function AdminDashboardPage() {
  return (
    <AdminGuard locale="bn">
      <AdminDashboardView locale="bn" />
    </AdminGuard>
  );
}
