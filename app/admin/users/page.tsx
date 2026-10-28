import * as React from "react";
import type { Metadata } from "next";

import { constructMetadata } from "@/lib/seo/metadata";
import { AdminUsersView } from "@/components/admin/admin-users-view";

export const metadata: Metadata = constructMetadata({
  title: "ব্যবহারকারী অ্যাকাউন্ট মডারেশন",
  path: "/admin/users",
  locale: "bn",
});

export default function AdminUsersPage() {
  return <AdminUsersView locale="bn" />;
}

