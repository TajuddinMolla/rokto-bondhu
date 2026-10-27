"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, ArrowRight, ShieldAlert } from "lucide-react";

import { createLoginSchema } from "@/lib/validations/auth";
import { getFirebaseErrorMessage } from "@/lib/firebase/errors";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { PasswordInput } from "@/components/auth/password-input";
import { getTranslations } from "@/i18n/translations";
import type { Locale } from "@/i18n/config";

export interface LoginFormProps {
  locale: Locale;
}

interface LoginState {
  identifier: string;
  password: string;
  rememberMe: boolean;
}

const INITIAL_STATE: LoginState = {
  identifier: "",
  password: "",
  rememberMe: false,
};

export function LoginForm({ locale }: LoginFormProps) {
  const t = getTranslations(locale);
  const router = useRouter();
  const formId = React.useId();
  const { login, isConfigured, status, user } = useAuth();

  const [formData, setFormData] = React.useState<LoginState>(INITIAL_STATE);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [authError, setAuthError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const loginSchema = React.useMemo(() => createLoginSchema(locale), [locale]);

  const prefix = locale === "en" ? "/en" : "";
  const forgotPasswordHref = `${prefix}/forgot-password`;
  const homeHref = prefix || "/";

  // Redirect if already authenticated
  React.useEffect(() => {
    if (status === "authenticated" && user) {
      if (!user.emailVerified) {
        router.push(`${prefix}/verify-email`);
      } else {
        router.push(homeHref);
      }
    }
  }, [status, user, router, prefix, homeHref]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    if (authError) {
      setAuthError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setAuthError(null);

    const result = loginSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0]?.toString();
        if (key && !fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      }
      setErrors(fieldErrors);

      const firstField = Object.keys(fieldErrors)[0];
      if (firstField) {
        const el = document.getElementById(`${formId}-${firstField}`);
        el?.focus();
      }
      return;
    }

    if (!isConfigured) {
      setAuthError(getFirebaseErrorMessage("auth/not-configured", locale));
      return;
    }

    // Firebase Email Authentication requires a valid email string
    const emailToUse = formData.identifier.trim();
    if (!emailToUse.includes("@")) {
      setErrors({
        identifier: locale === "en"
          ? "Please enter your email address to log in (phone login will be supported in a later phase)."
          : "লগইন করতে অনুগ্রহ করে ইমেইল ঠিকানা প্রদান করুন (ফোন নম্বর লগইন পরবর্তী ধাপে যুক্ত করা হবে)।",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const loggedInUser = await login(emailToUse, formData.password);
      // Clean up sensitive state immediately
      setFormData(INITIAL_STATE);

      if (!loggedInUser.emailVerified) {
        router.push(`${prefix}/verify-email`);
      } else {
        router.push(homeHref);
      }
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      const errorCode = firebaseError?.code || "auth/generic-error";
      setAuthError(getFirebaseErrorMessage(errorCode, locale));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      id={formId}
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4"
    >
      {/* Configuration Status Notice (if .env.local is missing) */}
      {!isConfigured && (
        <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300">
          <AlertCircle className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span className="leading-relaxed">
            {t.auth.firebaseErrors.notConfigured}
          </span>
        </div>
      )}

      {/* Auth Error Banner */}
      {authError && (
        <div
          role="alert"
          aria-live="assertive"
          className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive font-medium animate-in fade-in duration-200"
        >
          <ShieldAlert className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span className="leading-relaxed">{authError}</span>
        </div>
      )}

      {/* Identifier Field: Email */}
      <FormField
        id={`${formId}-identifier`}
        label={t.auth.login.identifierLabel}
        required
        error={errors.identifier}
        helperText={t.auth.login.identifierHelper}
      >
        <Input
          id={`${formId}-identifier`}
          name="identifier"
          type="email"
          value={formData.identifier}
          onChange={handleChange}
          placeholder={t.auth.login.identifierPlaceholder}
          autoComplete="email"
          disabled={isSubmitting}
          aria-invalid={!!errors.identifier}
          aria-describedby={
            errors.identifier
              ? `${formId}-identifier-error`
              : `${formId}-identifier-help`
          }
        />
      </FormField>

      {/* Password Field */}
      <FormField
        id={`${formId}-password`}
        label={t.auth.login.passwordLabel}
        required
        error={errors.password}
      >
        <PasswordInput
          id={`${formId}-password`}
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder={t.auth.login.passwordPlaceholder}
          autoComplete="current-password"
          disabled={isSubmitting}
          showLabel={t.auth.common.showPassword}
          hideLabel={t.auth.common.hidePassword}
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? `${formId}-password-error` : undefined}
        />
      </FormField>

      {/* Remember Me & Forgot Password Bar */}
      <div className="flex items-center justify-between gap-2 pt-1 text-xs sm:text-sm">
        <label className="flex items-center gap-2 cursor-pointer select-none text-muted-foreground hover:text-foreground">
          <input
            type="checkbox"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
            disabled={isSubmitting}
            className="size-4 rounded border-input text-primary focus:ring-primary/20 accent-primary"
          />
          <span>{t.auth.login.rememberMe}</span>
        </label>

        <Link
          href={forgotPasswordHref}
          className="text-primary hover:underline font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          {t.auth.login.forgotPassword}
        </Link>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-11 text-base font-semibold shadow-sm"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin mr-2" aria-hidden="true" />
            {t.auth.login.submittingButton}
          </>
        ) : (
          <>
            {t.auth.login.submitButton}
            <ArrowRight className="size-4 ml-1.5" aria-hidden="true" />
          </>
        )}
      </Button>
    </form>
  );
}
