import * as React from "react";
import type { Metadata } from "next";

import { constructMetadata } from "@/lib/seo/metadata";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminDonorsView } from "@/components/admin/admin-donors-view";

export const metadata: Metadata = constructMetadata({
  title: "রক্তদাতা প্রোফাইল মডারেশন",
  path: "/admin/donors",
  locale: "bn",
});

export default function AdminDonorsPage() {
  return (
    <AdminGuard locale="bn">
      <AdminDonorsView locale="bn" />
    </AdminGuard>
  );
}
