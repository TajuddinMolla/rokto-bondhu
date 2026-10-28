import * as React from "react";
import type { Metadata } from "next";

import { constructMetadata } from "@/lib/seo/metadata";
import { AdminUsersView } from "@/components/admin/admin-users-view";

export const metadata: Metadata = constructMetadata({
  title: "User Account Moderation",
  path: "/admin/users",
  locale: "en",
});

export default function EnglishAdminUsersPage() {
  return <AdminUsersView locale="en" />;
}

