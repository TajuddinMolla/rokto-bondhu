"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  KeyRound,
  RotateCcw,
  Info,
} from "lucide-react";

import { createResetPasswordSchema } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/form-field";
import { PasswordInput } from "@/components/auth/password-input";
import { getTranslations } from "@/i18n/translations";
import type { Locale } from "@/i18n/config";

export interface ResetPasswordFormProps {
  locale: Locale;
}

interface ResetState {
  password: string;
  confirmPassword: string;
}

const INITIAL_STATE: ResetState = {
  password: "",
  confirmPassword: "",
};

function ResetPasswordFormInternal({ locale }: ResetPasswordFormProps) {
  const t = getTranslations(locale);
  const formId = React.useId();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || undefined;

  const [formData, setFormData] = React.useState<ResetState>(INITIAL_STATE);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const resetSchema = React.useMemo(() => createResetPasswordSchema(locale), [locale]);

  const prefix = locale === "en" ? "/en" : "";
  const loginHref = `${prefix}/login`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const result = resetSchema.safeParse({
      ...formData,
      token,
    });

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

    // Input is valid: simulate latency for demo
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      // Immediately wipe passwords from memory
      setFormData(INITIAL_STATE);
    }, 500);
  };

  const handleResetDemo = () => {
    setIsSuccess(false);
    setFormData(INITIAL_STATE);
    setErrors({});
  };

  if (isSuccess) {
    return (
      <div
        role="region"
        aria-live="polite"
        className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center space-y-4 animate-in fade-in duration-200"
      >
        <div className="inline-flex items-center justify-center size-12 rounded-full bg-primary/10 text-primary border border-primary/20">
          <CheckCircle2 className="size-6" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-bold text-foreground">
            {t.auth.resetPassword.demoSuccessTitle}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            {t.auth.resetPassword.demoSuccessDesc}
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetDemo}
            className="w-full sm:w-auto"
          >
            <RotateCcw className="size-3.5 mr-1.5" aria-hidden="true" />
            {t.auth.common.tryAnother}
          </Button>

          <Button
            asChild
            variant="default"
            size="sm"
            className="w-full sm:w-auto"
          >
            <Link href={loginHref}>
              <ArrowLeft className="size-3.5 mr-1.5" aria-hidden="true" />
              {t.auth.resetPassword.backToLogin}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      id={formId}
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4"
    >
      {/* Demo Notice Banner */}
      <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-400">
        <AlertCircle className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
        <span className="leading-relaxed">{t.auth.common.demoNotice}</span>
      </div>

      {/* Token Readiness Info Callout */}
      <div className="flex items-start gap-2.5 rounded-lg border border-primary/15 bg-primary/5 p-3 text-xs text-muted-foreground">
        <Info className="size-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-0.5 leading-relaxed">
          <span className="font-semibold text-foreground block">
            {t.auth.resetPassword.tokenNoticeTitle}
          </span>
          <span>{t.auth.resetPassword.tokenNoticeDesc}</span>
        </div>
      </div>

      {/* New Password */}
      <FormField
        id={`${formId}-password`}
        label={t.auth.resetPassword.passwordLabel}
        required
        error={errors.password}
        helperText={t.auth.resetPassword.passwordHint}
      >
        <PasswordInput
          id={`${formId}-password`}
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder={t.auth.resetPassword.passwordPlaceholder}
          autoComplete="new-password"
          disabled={isSubmitting}
          showLabel={t.auth.common.showPassword}
          hideLabel={t.auth.common.hidePassword}
          aria-invalid={!!errors.password}
          aria-describedby={
            errors.password
              ? `${formId}-password-error`
              : `${formId}-password-help`
          }
        />
      </FormField>

      {/* Confirm New Password */}
      <FormField
        id={`${formId}-confirmPassword`}
        label={t.auth.resetPassword.confirmPasswordLabel}
        required
        error={errors.confirmPassword}
      >
        <PasswordInput
          id={`${formId}-confirmPassword`}
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder={t.auth.resetPassword.confirmPasswordPlaceholder}
          autoComplete="new-password"
          disabled={isSubmitting}
          showLabel={t.auth.common.showPassword}
          hideLabel={t.auth.common.hidePassword}
          aria-invalid={!!errors.confirmPassword}
          aria-describedby={
            errors.confirmPassword
              ? `${formId}-confirmPassword-error`
              : undefined
          }
        />
      </FormField>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-11 text-base font-semibold shadow-sm"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin mr-2" aria-hidden="true" />
            {t.auth.resetPassword.submittingButton}
          </>
        ) : (
          <>
            <KeyRound className="size-4 mr-1.5" aria-hidden="true" />
            {t.auth.resetPassword.submitButton}
          </>
        )}
      </Button>

      {/* Back to Login Link */}
      <div className="text-center pt-2">
        <Link
          href={loginHref}
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          <ArrowLeft className="size-4 mr-1.5" aria-hidden="true" />
          {t.auth.resetPassword.backToLogin}
        </Link>
      </div>
    </form>
  );
}

export function ResetPasswordForm(props: ResetPasswordFormProps) {
  return (
    <React.Suspense
      fallback={
        <div className="h-64 rounded-xl border border-border bg-surface/50 animate-pulse" />
      }
    >
      <ResetPasswordFormInternal {...props} />
    </React.Suspense>
  );
}
