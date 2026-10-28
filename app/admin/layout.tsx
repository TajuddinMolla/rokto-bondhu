import * as React from "react";
import type { Metadata } from "next";

import { constructMetadata } from "@/lib/seo/metadata";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";

export const metadata: Metadata = constructMetadata({
  title: "প্রশাসনিক প্যানেল ও মডারেশন",
  path: "/admin",
  locale: "bn",
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutShell locale="bn">{children}</AdminLayoutShell>;
}
