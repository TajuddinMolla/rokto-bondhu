"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2, CheckCircle2, AlertCircle, ArrowLeft, Send, RotateCcw } from "lucide-react";

import { createForgotPasswordSchema } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { getTranslations } from "@/i18n/translations";
import type { Locale } from "@/i18n/config";

export interface ForgotPasswordFormProps {
  locale: Locale;
}

export function ForgotPasswordForm({ locale }: ForgotPasswordFormProps) {
  const t = getTranslations(locale);
  const formId = React.useId();

  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [submittedEmail, setSubmittedEmail] = React.useState("");

  const forgotSchema = React.useMemo(() => createForgotPasswordSchema(locale), [locale]);

  const prefix = locale === "en" ? "/en" : "";
  const loginHref = `${prefix}/login`;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(undefined);

    const result = forgotSchema.safeParse({ email });

    if (!result.success) {
      const issue = result.error.issues[0];
      setError(issue?.message);
      const el = document.getElementById(`${formId}-email`);
      el?.focus();
      return;
    }

    // Input is valid: simulate latency for demo
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedEmail(email);
      setIsSuccess(true);
      setEmail("");
    }, 500);
  };

  const handleResetDemo = () => {
    setIsSuccess(false);
    setSubmittedEmail("");
    setEmail("");
    setError(undefined);
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
            {t.auth.forgotPassword.demoSuccessTitle}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            {t.auth.forgotPassword.demoSuccessDesc}
          </p>
        </div>

        <div className="bg-surface rounded-lg p-3 text-xs text-muted-foreground border border-border inline-block max-w-xs break-all">
          <span className="font-semibold text-foreground mr-1">
            {t.auth.forgotPassword.emailLabel}:
          </span>
          {submittedEmail}
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
              {t.auth.forgotPassword.backToLogin}
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

      {/* Email Input */}
      <FormField
        id={`${formId}-email`}
        label={t.auth.forgotPassword.emailLabel}
        required
        error={error}
        helperText={t.auth.forgotPassword.emailHelper}
      >
        <Input
          id={`${formId}-email`}
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError(undefined);
          }}
          placeholder={t.auth.forgotPassword.emailPlaceholder}
          autoComplete="email"
          disabled={isSubmitting}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${formId}-email-error` : `${formId}-email-help`
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
            {t.auth.forgotPassword.submittingButton}
          </>
        ) : (
          <>
            <Send className="size-4 mr-1.5" aria-hidden="true" />
            {t.auth.forgotPassword.submitButton}
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
          {t.auth.forgotPassword.backToLogin}
        </Link>
      </div>
    </form>
  );
}
