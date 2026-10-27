"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/validations/zod-resolver";
import { Loader2, CheckCircle2, AlertCircle, ArrowLeft, Send, RotateCcw, ShieldAlert } from "lucide-react";

import { createForgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth";
import { getFirebaseErrorMessage } from "@/lib/firebase/errors";
import { useAuth } from "@/hooks/use-auth";
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
  const { resetPassword, isConfigured } = useAuth();

  const [authError, setAuthError] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [submittedEmail, setSubmittedEmail] = React.useState("");

  const forgotSchema = React.useMemo(() => createForgotPasswordSchema(locale), [locale]);

  const prefix = locale === "en" ? "/en" : "";
  const loginHref = `${prefix}/login`;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotSchema),
    defaultValues: {
      email: "",
    },
    mode: "onTouched",
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setAuthError(null);

    if (!isConfigured) {
      setAuthError(getFirebaseErrorMessage("auth/not-configured", locale));
      return;
    }

    const emailToUse = data.email.trim();

    try {
      await resetPassword(emailToUse);
      setSubmittedEmail(emailToUse);
      setIsSuccess(true);
      reset();
    } catch (err: unknown) {
      const firebaseError = err as { code?: string };
      // User enumeration defense: if user-not-found or invalid-credential, still show generic success confirmation!
      if (
        firebaseError?.code === "auth/user-not-found" ||
        firebaseError?.code === "auth/invalid-credential"
      ) {
        setSubmittedEmail(emailToUse);
        setIsSuccess(true);
        reset();
      } else {
        const errorCode = firebaseError?.code || "auth/generic-error";
        setAuthError(getFirebaseErrorMessage(errorCode, locale));
      }
    }
  };

  const handleResetDemo = () => {
    setIsSuccess(false);
    setSubmittedEmail("");
    setAuthError(null);
    reset();
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
      onSubmit={handleSubmit(onSubmit)}
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

      {/* Email Field */}
      <FormField
        id={`${formId}-email`}
        label={t.auth.forgotPassword.emailLabel}
        required
        error={errors.email?.message}
        helperText={t.auth.forgotPassword.emailHelper}
      >
        <Input
          id={`${formId}-email`}
          type="email"
          placeholder={t.auth.forgotPassword.emailPlaceholder}
          autoComplete="email"
          disabled={isSubmitting}
          aria-invalid={!!errors.email}
          aria-describedby={
            errors.email
              ? `${formId}-email-error`
              : `${formId}-email-help`
          }
          {...register("email", {
            onChange: () => {
              if (authError) setAuthError(null);
            },
          })}
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
            <Send className="size-4 mr-2" aria-hidden="true" />
            {t.auth.forgotPassword.submitButton}
          </>
        )}
      </Button>

      {/* Back to Login Link */}
      <div className="pt-2 text-center">
        <Link
          href={loginHref}
          className="inline-flex items-center text-xs sm:text-sm text-muted-foreground hover:text-foreground font-medium transition-colors"
        >
          <ArrowLeft className="size-3.5 mr-1.5" aria-hidden="true" />
          {t.auth.forgotPassword.backToLogin}
        </Link>
      </div>
    </form>
  );
}
