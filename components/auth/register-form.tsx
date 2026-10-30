"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/validations/zod-resolver";
import { Loader2, AlertCircle, ArrowRight, Heart, ShieldAlert } from "lucide-react";

import { createRegisterSchema, type RegisterInput } from "@/lib/validations/auth";
import { getFirebaseErrorMessage } from "@/lib/firebase/errors";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { PasswordInput } from "@/components/auth/password-input";
import { getTranslations } from "@/i18n/translations";
import type { Locale } from "@/i18n/config";

export interface RegisterFormProps {
  locale: Locale;
}

export function RegisterForm({ locale }: RegisterFormProps) {
  const t = getTranslations(locale);
  const router = useRouter();
  const formId = React.useId();
  const { register: registerAuth, isConfigured, status, user } = useAuth();
  const [authError, setAuthError] = React.useState<string | null>(null);

  const registerSchema = React.useMemo(() => createRegisterSchema(locale), [locale]);

  const prefix = locale === "en" ? "/en" : "";
  const donorRegisterHref = `${prefix}/donors/register`;
  const homeHref = prefix || "/";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      consent: false,
    },
    mode: "onTouched",
  });

  // Redirect if already authenticated
  React.useEffect(() => {
    if (status === "authenticated" && user) {
      router.push(homeHref);
    }
  }, [status, user, router, homeHref]);

  const onSubmit = async (data: RegisterInput) => {
    setAuthError(null);

    if (!isConfigured) {
      setAuthError(getFirebaseErrorMessage("auth/not-configured", locale));
      return;
    }

    try {
      await registerAuth(data.fullName, data.email, data.password, data.phoneNumber);
      // Clean up sensitive state immediately
      reset();
      // Direct user to verify email
      router.push(`${prefix}/verify-email`);
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      const errorCode = firebaseError?.code || "auth/generic-error";
      setAuthError(getFirebaseErrorMessage(errorCode, locale));
    }
  };

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

      {/* Cross-link to Donor Registration */}
      <div className="flex items-center justify-between gap-2 rounded-lg border border-primary/15 bg-primary/5 p-3 text-xs">
        <div className="flex items-center gap-1.5 text-foreground font-medium">
          <Heart className="size-3.5 text-primary shrink-0" aria-hidden="true" />
          <span>{t.auth.register.donorNotice}</span>
        </div>
        <Link
          href={donorRegisterHref}
          className="text-primary hover:underline font-semibold shrink-0"
        >
          {t.auth.register.donorRegisterLink}
        </Link>
      </div>

      {/* Full Name */}
      <FormField
        id={`${formId}-fullName`}
        label={t.auth.register.fullNameLabel}
        required
        error={errors.fullName?.message}
      >
        <Input
          id={`${formId}-fullName`}
          type="text"
          placeholder={t.auth.register.fullNamePlaceholder}
          autoComplete="name"
          disabled={isSubmitting}
          aria-invalid={!!errors.fullName}
          aria-describedby={errors.fullName ? `${formId}-fullName-error` : undefined}
          {...register("fullName", {
            onChange: () => {
              if (authError) setAuthError(null);
            },
          })}
        />
      </FormField>

      {/* Email */}
      <FormField
        id={`${formId}-email`}
        label={t.auth.register.emailLabel}
        required
        error={errors.email?.message}
      >
        <Input
          id={`${formId}-email`}
          type="email"
          placeholder={t.auth.register.emailPlaceholder}
          autoComplete="email"
          disabled={isSubmitting}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? `${formId}-email-error` : undefined}
          {...register("email", {
            onChange: () => {
              if (authError) setAuthError(null);
            },
          })}
        />
      </FormField>

      {/* Phone Number */}
      <FormField
        id={`${formId}-phoneNumber`}
        label={t.auth.register.phoneLabel}
        required
        error={errors.phoneNumber?.message}
        helperText={t.auth.register.phoneHelper}
      >
        <Input
          id={`${formId}-phoneNumber`}
          type="tel"
          placeholder={t.auth.register.phonePlaceholder}
          autoComplete="tel"
          disabled={isSubmitting}
          aria-invalid={!!errors.phoneNumber}
          aria-describedby={
            errors.phoneNumber
              ? `${formId}-phoneNumber-error`
              : `${formId}-phoneNumber-help`
          }
          {...register("phoneNumber", {
            onChange: () => {
              if (authError) setAuthError(null);
            },
          })}
        />
      </FormField>

      {/* Password */}
      <FormField
        id={`${formId}-password`}
        label={t.auth.register.passwordLabel}
        required
        error={errors.password?.message}
        helperText={t.auth.register.passwordHint}
      >
        <PasswordInput
          id={`${formId}-password`}
          placeholder={t.auth.register.passwordPlaceholder}
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
          {...register("password", {
            onChange: () => {
              if (authError) setAuthError(null);
            },
          })}
        />
      </FormField>

      {/* Confirm Password */}
      <FormField
        id={`${formId}-confirmPassword`}
        label={t.auth.register.confirmPasswordLabel}
        required
        error={errors.confirmPassword?.message}
      >
        <PasswordInput
          id={`${formId}-confirmPassword`}
          placeholder={t.auth.register.confirmPasswordPlaceholder}
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
          {...register("confirmPassword", {
            onChange: () => {
              if (authError) setAuthError(null);
            },
          })}
        />
      </FormField>

      {/* Consent Checkbox */}
      <div className="space-y-1.5 pt-1">
        <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs sm:text-sm text-muted-foreground hover:text-foreground">
          <input
            type="checkbox"
            disabled={isSubmitting}
            className="size-4 mt-0.5 rounded border-input text-primary focus:ring-primary/20 accent-primary shrink-0"
            aria-invalid={!!errors.consent}
            aria-describedby={errors.consent ? `${formId}-consent-error` : undefined}
            {...register("consent")}
          />
          <span className="leading-relaxed">
            {t.auth.register.consentLabel}
            <span className="text-destructive ml-1" aria-hidden="true">
              *
            </span>
          </span>
        </label>
        {errors.consent && (
          <p
            id={`${formId}-consent-error`}
            role="alert"
            className="text-xs font-medium text-destructive transition-all"
          >
            {errors.consent.message}
          </p>
        )}
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
            {t.auth.register.submittingButton}
          </>
        ) : (
          <>
            {t.auth.register.submitButton}
            <ArrowRight className="size-4 ml-1.5" aria-hidden="true" />
          </>
        )}
      </Button>
    </form>
  );
}
