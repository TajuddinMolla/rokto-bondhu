import * as React from "react";
import type { Metadata } from "next";

import { constructMetadata } from "@/lib/seo/metadata";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminDonorsView } from "@/components/admin/admin-donors-view";

export const metadata: Metadata = constructMetadata({
  title: "Donor Profiles Moderation",
  path: "/admin/donors",
  locale: "en",
});

export default function EnglishAdminDonorsPage() {
  return (
    <AdminGuard locale="en">
      <AdminDonorsView locale="en" />
    </AdminGuard>
  );
}
