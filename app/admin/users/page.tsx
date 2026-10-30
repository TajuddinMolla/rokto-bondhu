import * as React from "react";
import type { Metadata } from "next";

import { constructMetadata } from "@/lib/seo/metadata";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminUsersView } from "@/components/admin/admin-users-view";

export const instant = false;

export const metadata: Metadata = constructMetadata({
  title: "ব্যবহারকারী অ্যাকাউন্ট মডারেশন",
  path: "/admin/users",
  locale: "bn",
});

export default function AdminUsersPage() {
  return (
    <AdminGuard locale="bn">
      <AdminUsersView locale="bn" />
    </AdminGuard>
  );
}
