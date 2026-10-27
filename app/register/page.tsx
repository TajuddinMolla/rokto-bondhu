import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { constructMetadata } from "@/lib/seo/metadata";
import { getTranslations } from "@/i18n/translations";
import { AuthLayout } from "@/components/auth/auth-layout";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = constructMetadata({
  title: "নতুন একাউন্ট নিবন্ধন",
  path: "/register",
  locale: "bn",
});

export default function RegisterPage() {
  const t = getTranslations("bn");

  return (
    <AuthLayout
      locale="bn"
      maxWidth="lg"
      badgeText={t.auth.register.badge}
      title={t.auth.register.title}
      subtitle={t.auth.register.subtitle}
      footerContent={
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          <span>{t.auth.register.hasAccountText}</span>
          <Link
            href="/login"
            className="font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            {t.auth.register.loginLink}
          </Link>
        </div>
      }
    >
      <RegisterForm locale="bn" />
    </AuthLayout>
  );
}
