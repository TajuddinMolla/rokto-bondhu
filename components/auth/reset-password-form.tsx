"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/validations/zod-resolver";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  KeyRound,
  ShieldAlert,
  Send,
  Mail,
} from "lucide-react";

import {
  createResetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validations/auth";
import { verifyResetCode, confirmNewPassword } from "@/lib/firebase/auth";
import { getFirebaseErrorMessage } from "@/lib/firebase/errors";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/form-field";
import { PasswordInput } from "@/components/auth/password-input";
import { getTranslations } from "@/i18n/translations";
import type { Locale } from "@/i18n/config";

export interface ResetPasswordFormProps {
  locale: Locale;
}

type CodeState =
  | { status: "verifying" }
  | { status: "valid"; email?: string; code: string }
  | { status: "invalid"; error: string };

function ResetPasswordFormInternal({ locale }: ResetPasswordFormProps) {
  const t = getTranslations(locale);
  const formId = React.useId();
  const searchParams = useSearchParams();

  // Firebase passes oobCode for password reset. Check oobCode first, fallback to token.
  const actionCode =
    searchParams.get("oobCode") || searchParams.get("token") || undefined;

  const prefix = locale === "en" ? "/en" : "";
  const loginHref = `${prefix}/login`;
  const forgotHref = `${prefix}/forgot-password`;

  const [codeState, setCodeState] = React.useState<CodeState>(() => {
    if (!actionCode) {
      return {
        status: "invalid",
        error: t.auth.resetPassword.invalidCodeDesc,
      };
    }
    return { status: "verifying" };
  });

  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const resetSchema = React.useMemo(
    () => createResetPasswordSchema(locale),
    [locale]
  );

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
      token: actionCode || "",
    },
    mode: "onTouched",
  });

  // Verify action code on mount
  React.useEffect(() => {
    if (!actionCode) {
      setCodeState({
        status: "invalid",
        error: t.auth.resetPassword.invalidCodeDesc,
      });
      return;
    }

    let isMounted = true;
    verifyResetCode(actionCode)
      .then((accountEmail) => {
        if (!isMounted) return;
        setCodeState({
          status: "valid",
          email: accountEmail,
          code: actionCode,
        });
        setValue("token", actionCode);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        const fbError = err as { code?: string };
        const mappedMsg = getFirebaseErrorMessage(
          fbError?.code || "auth/invalid-action-code",
          locale
        );
        setCodeState({
          status: "invalid",
          error: mappedMsg,
        });
      });

    return () => {
      isMounted = false;
    };
  }, [actionCode, locale, setValue, t.auth.resetPassword.invalidCodeDesc]);

  const onSubmit = async (data: ResetPasswordInput) => {
    if (codeState.status !== "valid") return;
    setSubmitError(null);

    try {
      await confirmNewPassword(codeState.code, data.password);
      setIsSuccess(true);
      reset();
    } catch (err: unknown) {
      const fbError = err as { code?: string };
      setSubmitError(
        getFirebaseErrorMessage(fbError?.code || "auth/generic-error", locale)
      );
    }
  };

  // State 1: Verification in progress
  if (codeState.status === "verifying") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-xl border border-border bg-surface p-8 text-center space-y-4"
      >
        <div className="inline-flex items-center justify-center size-12 rounded-full bg-primary/10 text-primary">
          <Loader2 className="size-6 animate-spin" aria-hidden="true" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          {t.auth.resetPassword.verifyingCode}
        </p>
      </div>
    );
  }

  // State 2: Invalid or expired action code
  if (codeState.status === "invalid") {
    return (
      <div
        role="alert"
        className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center space-y-4 animate-in fade-in duration-200"
      >
        <div className="inline-flex items-center justify-center size-12 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
          <ShieldAlert className="size-6" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-bold text-foreground">
            {t.auth.resetPassword.invalidCodeTitle}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            {codeState.error}
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
          <Button asChild variant="default" size="sm" className="w-full sm:w-auto">
            <Link href={forgotHref}>
              <Send className="size-3.5 mr-1.5" aria-hidden="true" />
              {t.auth.resetPassword.requestNewLink}
            </Link>
          </Button>

          <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
            <Link href={loginHref}>
              <ArrowLeft className="size-3.5 mr-1.5" aria-hidden="true" />
              {t.auth.resetPassword.backToLogin}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // State 3: Successfully updated password
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
            {t.auth.resetPassword.successTitle}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            {t.auth.resetPassword.successDesc}
          </p>
        </div>

        <div className="pt-2">
          <Button asChild variant="default" size="sm" className="w-full sm:w-auto">
            <Link href={loginHref}>
              <ArrowLeft className="size-3.5 mr-1.5" aria-hidden="true" />
              {t.auth.resetPassword.backToLogin}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // State 4: Valid action code - Render Form
  return (
    <form
      id={formId}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-4"
    >
      {/* Account email notification if available */}
      {codeState.email && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface p-3 text-xs text-muted-foreground">
          <Mail className="size-4 text-primary shrink-0" aria-hidden="true" />
          <span>
            {t.auth.resetPassword.accountEmail}:{" "}
            <strong className="text-foreground">{codeState.email}</strong>
          </span>
        </div>
      )}

      {/* Submission Error Banner */}
      {submitError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive animate-in fade-in duration-150"
        >
          <AlertCircle className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span className="leading-relaxed">{submitError}</span>
        </div>
      )}

      {/* New Password */}
      <FormField
        id={`${formId}-password`}
        label={t.auth.resetPassword.passwordLabel}
        required
        error={errors.password?.message}
        helperText={t.auth.resetPassword.passwordHint}
      >
        <PasswordInput
          id={`${formId}-password`}
          {...register("password")}
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
        error={errors.confirmPassword?.message}
      >
        <PasswordInput
          id={`${formId}-confirmPassword`}
          {...register("confirmPassword")}
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
