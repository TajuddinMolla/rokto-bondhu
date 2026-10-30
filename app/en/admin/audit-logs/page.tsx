import * as React from "react";
import type { Metadata } from "next";

import { constructMetadata } from "@/lib/seo/metadata";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminAuditLogsView } from "@/components/admin/admin-audit-logs-view";

export const instant = false;

export const metadata: Metadata = constructMetadata({
  title: "System Audit Logs",
  path: "/admin/audit-logs",
  locale: "en",
});

export default function EnglishAdminAuditLogsPage() {
  return (
    <AdminGuard locale="en">
      <AdminAuditLogsView locale="en" />
    </AdminGuard>
  );
}
