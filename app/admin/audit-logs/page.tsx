import * as React from "react";
import type { Metadata } from "next";

import { constructMetadata } from "@/lib/seo/metadata";
import { AdminAuditLogsView } from "@/components/admin/admin-audit-logs-view";

export const metadata: Metadata = constructMetadata({
  title: "সিস্টেম অডিট লগ",
  path: "/admin/audit-logs",
  locale: "bn",
});

export default function AdminAuditLogsPage() {
  return <AdminAuditLogsView locale="bn" />;
}

