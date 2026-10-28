import * as React from "react";
import type { Metadata } from "next";

import { constructMetadata } from "@/lib/seo/metadata";
import { AdminRequestsView } from "@/components/admin/admin-requests-view";

export const metadata: Metadata = constructMetadata({
  title: "Blood Request Moderation",
  path: "/admin/requests",
  locale: "en",
});

export default function EnglishAdminRequestsPage() {
  return <AdminRequestsView locale="en" />;
}

