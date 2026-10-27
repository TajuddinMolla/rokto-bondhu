"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, ArrowRight, Heart, ShieldAlert } from "lucide-react";

import { createRegisterSchema } from "@/lib/validations/auth";
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

interface RegisterState {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  consent: boolean;
}

const INITIAL_STATE: RegisterState = {
  fullName: "",
  email: "",
  phoneNumber: "",
  password: "",
  confirmPassword: "",
  consent: false,
};

export function RegisterForm({ locale }: RegisterFormProps) {
  const t = getTranslations(locale);
  const router = useRouter();
  const formId = React.useId();
  const { register, isConfigured, status, user } = useAuth();

  const [formData, setFormData] = React.useState<RegisterState>(INITIAL_STATE);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [authError, setAuthError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const registerSchema = React.useMemo(() => createRegisterSchema(locale), [locale]);

  const prefix = locale === "en" ? "/en" : "";
  const donorRegisterHref = `${prefix}/donors/register`;
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

    const result = registerSchema.safeParse(formData);

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

    setIsSubmitting(true);

    try {
      await register(formData.fullName, formData.email, formData.password);
      // Clean up sensitive state immediately
      setFormData(INITIAL_STATE);
      // Direct user to verify email
      router.push(`${prefix}/verify-email`);
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
        error={errors.fullName}
      >
        <Input
          id={`${formId}-fullName`}
          name="fullName"
          type="text"
          value={formData.fullName}
          onChange={handleChange}
          placeholder={t.auth.register.fullNamePlaceholder}
          autoComplete="name"
          disabled={isSubmitting}
          aria-invalid={!!errors.fullName}
          aria-describedby={errors.fullName ? `${formId}-fullName-error` : undefined}
        />
      </FormField>

      {/* Email */}
      <FormField
        id={`${formId}-email`}
        label={t.auth.register.emailLabel}
        required
        error={errors.email}
      >
        <Input
          id={`${formId}-email`}
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder={t.auth.register.emailPlaceholder}
          autoComplete="email"
          disabled={isSubmitting}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? `${formId}-email-error` : undefined}
        />
      </FormField>

      {/* Phone Number */}
      <FormField
        id={`${formId}-phoneNumber`}
        label={t.auth.register.phoneLabel}
        required
        error={errors.phoneNumber}
        helperText={t.auth.register.phoneHelper}
      >
        <Input
          id={`${formId}-phoneNumber`}
          name="phoneNumber"
          type="tel"
          value={formData.phoneNumber}
          onChange={handleChange}
          placeholder={t.auth.register.phonePlaceholder}
          autoComplete="tel"
          disabled={isSubmitting}
          aria-invalid={!!errors.phoneNumber}
          aria-describedby={
            errors.phoneNumber
              ? `${formId}-phoneNumber-error`
              : `${formId}-phoneNumber-help`
          }
        />
      </FormField>

      {/* Password */}
      <FormField
        id={`${formId}-password`}
        label={t.auth.register.passwordLabel}
        required
        error={errors.password}
        helperText={t.auth.register.passwordHint}
      >
        <PasswordInput
          id={`${formId}-password`}
          name="password"
          value={formData.password}
          onChange={handleChange}
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
        />
      </FormField>

      {/* Confirm Password */}
      <FormField
        id={`${formId}-confirmPassword`}
        label={t.auth.register.confirmPasswordLabel}
        required
        error={errors.confirmPassword}
      >
        <PasswordInput
          id={`${formId}-confirmPassword`}
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
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
        />
      </FormField>

      {/* Consent Checkbox */}
      <div className="space-y-1.5 pt-1">
        <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs sm:text-sm text-muted-foreground hover:text-foreground">
          <input
            type="checkbox"
            name="consent"
            checked={formData.consent}
            onChange={handleChange}
            disabled={isSubmitting}
            className="size-4 mt-0.5 rounded border-input text-primary focus:ring-primary/20 accent-primary shrink-0"
            aria-invalid={!!errors.consent}
            aria-describedby={errors.consent ? `${formId}-consent-error` : undefined}
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
            {errors.consent}
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
