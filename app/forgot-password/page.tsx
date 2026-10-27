import * as React from "react";
import type { Metadata } from "next";

import { constructMetadata } from "@/lib/seo/metadata";
import { getTranslations } from "@/i18n/translations";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = constructMetadata({
  title: "পাসওয়ার্ড পুনরুদ্ধার",
  path: "/forgot-password",
  locale: "bn",
});

export default function ForgotPasswordPage() {
  const t = getTranslations("bn");

  return (
    <AuthLayout
      locale="bn"
      badgeText={t.auth.forgotPassword.badge}
      title={t.auth.forgotPassword.title}
      subtitle={t.auth.forgotPassword.subtitle}
    >
      <ForgotPasswordForm locale="bn" />
    </AuthLayout>
  );
}
