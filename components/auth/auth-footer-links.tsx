"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getTranslations } from "@/i18n/translations";
import type { Locale } from "@/i18n/config";

export function LoginFooter({ locale }: { locale: Locale }) {
  const t = getTranslations(locale);
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect");
  const prefix = locale === "en" ? "/en" : "";
  const registerHref = rawRedirect
    ? `${prefix}/register?redirect=${encodeURIComponent(rawRedirect)}`
    : `${prefix}/register`;

  return (
    <div className="flex items-center justify-center gap-1.5 flex-wrap">
      <span>{t.auth.login.noAccountText}</span>
      <Link
        href={registerHref}
        className="font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
      >
        {t.auth.login.registerLink}
      </Link>
    </div>
  );
}

export function RegisterFooter({ locale }: { locale: Locale }) {
  const t = getTranslations(locale);
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect");
  const prefix = locale === "en" ? "/en" : "";
  const loginHref = rawRedirect
    ? `${prefix}/login?redirect=${encodeURIComponent(rawRedirect)}`
    : `${prefix}/login`;

  return (
    <div className="flex items-center justify-center gap-1.5 flex-wrap">
      <span>{t.auth.register.hasAccountText}</span>
      <Link
        href={loginHref}
        className="font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
      >
        {t.auth.register.loginLink}
      </Link>
    </div>
  );
}

