import * as React from "react";
import type { Metadata } from "next";

import { constructMetadata } from "@/lib/seo/metadata";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";

export const metadata: Metadata = constructMetadata({
  title: "Admin Console & Moderation",
  path: "/admin",
  locale: "en",
});

export default function EnglishAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard locale="en">
      <AdminLayoutShell locale="en">{children}</AdminLayoutShell>
    </AdminGuard>
  );
}
