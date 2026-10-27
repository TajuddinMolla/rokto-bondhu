import * as React from "react";
import type { Metadata } from "next";

import { constructMetadata } from "@/lib/seo/metadata";
import { getTranslations } from "@/i18n/translations";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = constructMetadata({
  title: "নতুন পাসওয়ার্ড নির্ধারণ",
  path: "/reset-password",
  locale: "bn",
});

export default function ResetPasswordPage() {
  const t = getTranslations("bn");

  return (
    <AuthLayout
      locale="bn"
      badgeText={t.auth.resetPassword.badge}
      title={t.auth.resetPassword.title}
      subtitle={t.auth.resetPassword.subtitle}
    >
      <ResetPasswordForm locale="bn" />
    </AuthLayout>
  );
}
