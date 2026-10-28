import * as React from "react";
import type { Metadata } from "next";

import { constructMetadata } from "@/lib/seo/metadata";
import { AdminDonorsView } from "@/components/admin/admin-donors-view";

export const metadata: Metadata = constructMetadata({
  title: "Donor Moderation",
  path: "/admin/donors",
  locale: "en",
});

export default function EnglishAdminDonorsPage() {
  return <AdminDonorsView locale="en" />;
}

