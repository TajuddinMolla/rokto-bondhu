import * as React from "react";
import type { Metadata } from "next";

import { constructMetadata } from "@/lib/seo/metadata";
import { getTranslations } from "@/i18n/translations";
import { AuthLayout } from "@/components/auth/auth-layout";
import { LoginForm } from "@/components/auth/login-form";
import { LoginFooter } from "@/components/auth/auth-footer-links";

export const metadata: Metadata = constructMetadata({
  title: "Login",
  path: "/en/login",
  locale: "en",
});

export default function EnLoginPage() {
  const t = getTranslations("en");

  return (
    <AuthLayout
      locale="en"
      badgeText={t.auth.login.badge}
      title={t.auth.login.title}
      subtitle={t.auth.login.subtitle}
      footerContent={
        <React.Suspense fallback={null}>
          <LoginFooter locale="en" />
        </React.Suspense>
      }
    >
      <React.Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-surface/50" />}>
        <LoginForm locale="en" />
      </React.Suspense>
    </AuthLayout>
  );
}
