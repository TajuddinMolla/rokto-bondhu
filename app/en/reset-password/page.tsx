import * as React from "react";
import type { Metadata } from "next";

import { constructMetadata } from "@/lib/seo/metadata";
import { getTranslations } from "@/i18n/translations";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = constructMetadata({
  title: "Reset Password",
  path: "/en/reset-password",
  locale: "en",
});

export default function EnResetPasswordPage() {
  const t = getTranslations("en");

  return (
    <AuthLayout
      locale="en"
      badgeText={t.auth.resetPassword.badge}
      title={t.auth.resetPassword.title}
      subtitle={t.auth.resetPassword.subtitle}
    >
      <ResetPasswordForm locale="en" />
    </AuthLayout>
  );
}
