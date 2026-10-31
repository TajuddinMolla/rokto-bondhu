import * as React from "react";
import type { Metadata } from "next";

import { constructMetadata } from "@/lib/seo/metadata";
import { getTranslations } from "@/i18n/translations";
import { AuthLayout } from "@/components/auth/auth-layout";
import { RegisterForm } from "@/components/auth/register-form";
import { RegisterFooter } from "@/components/auth/auth-footer-links";

export const metadata: Metadata = constructMetadata({
  title: "Create Account",
  path: "/en/register",
  locale: "en",
});

export default function EnRegisterPage() {
  const t = getTranslations("en");

  return (
    <AuthLayout
      locale="en"
      maxWidth="lg"
      badgeText={t.auth.register.badge}
      title={t.auth.register.title}
      subtitle={t.auth.register.subtitle}
      footerContent={
        <React.Suspense fallback={null}>
          <RegisterFooter locale="en" />
        </React.Suspense>
      }
    >
      <React.Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-surface/50" />}>
        <RegisterForm locale="en" />
      </React.Suspense>
    </AuthLayout>
  );
}
