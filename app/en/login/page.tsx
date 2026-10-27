import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { constructMetadata } from "@/lib/seo/metadata";
import { getTranslations } from "@/i18n/translations";
import { AuthLayout } from "@/components/auth/auth-layout";
import { LoginForm } from "@/components/auth/login-form";

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
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          <span>{t.auth.login.noAccountText}</span>
          <Link
            href="/en/register"
            className="font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            {t.auth.login.registerLink}
          </Link>
        </div>
      }
    >
      <LoginForm locale="en" />
    </AuthLayout>
  );
}
