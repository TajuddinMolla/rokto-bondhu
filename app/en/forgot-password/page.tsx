import * as React from "react";
import type { Metadata } from "next";

import { constructMetadata } from "@/lib/seo/metadata";
import { getTranslations } from "@/i18n/translations";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = constructMetadata({
  title: "Password Recovery",
  path: "/en/forgot-password",
  locale: "en",
});

export default function EnForgotPasswordPage() {
  const t = getTranslations("en");

  return (
    <AuthLayout
      locale="en"
      badgeText={t.auth.forgotPassword.badge}
      title={t.auth.forgotPassword.title}
      subtitle={t.auth.forgotPassword.subtitle}
    >
      <ForgotPasswordForm locale="en" />
    </AuthLayout>
  );
}
