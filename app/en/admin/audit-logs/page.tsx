import * as React from "react";
import type { Metadata } from "next";

import { constructMetadata } from "@/lib/seo/metadata";
import { AdminAuditLogsView } from "@/components/admin/admin-audit-logs-view";

export const metadata: Metadata = constructMetadata({
  title: "System Audit Logs",
  path: "/admin/audit-logs",
  locale: "en",
});

export default function EnglishAdminAuditLogsPage() {
  return <AdminAuditLogsView locale="en" />;
}

