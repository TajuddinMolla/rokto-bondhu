import type { Metadata } from "next";

import { constructMetadata } from "@/lib/seo/metadata";
import { DocumentLang } from "@/components/layout/document-lang";

export const metadata: Metadata = constructMetadata({
  locale: "en",
  path: "/en",
});

export default function EnglishLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DocumentLang lang="en" />
      {children}
    </>
  );
}
