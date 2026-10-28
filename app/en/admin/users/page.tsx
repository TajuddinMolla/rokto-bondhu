import * as React from "react";
import type { Metadata } from "next";

import { constructMetadata } from "@/lib/seo/metadata";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminUsersView } from "@/components/admin/admin-users-view";

export const metadata: Metadata = constructMetadata({
  title: "User Accounts Moderation",
  path: "/admin/users",
  locale: "en",
});

export default function EnglishAdminUsersPage() {
  return (
    <AdminGuard locale="en">
      <AdminUsersView locale="en" />
    </AdminGuard>
  );
}
