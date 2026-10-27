"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2, CheckCircle2, AlertCircle, ArrowRight, RotateCcw, Heart } from "lucide-react";

import { createRegisterSchema } from "@/lib/validations/auth";
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
  const formId = React.useId();

  const [formData, setFormData] = React.useState<RegisterState>(INITIAL_STATE);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [submittedSummary, setSubmittedSummary] = React.useState<{
    name: string;
    email: string;
    phone: string;
  } | null>(null);

  const registerSchema = React.useMemo(() => createRegisterSchema(locale), [locale]);

  const prefix = locale === "en" ? "/en" : "";
  const donorRegisterHref = `${prefix}/donors/register`;

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
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

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

      // Focus first error field for accessibility
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
      // NOTE: Passwords are NEVER persisted. Only non-sensitive summary details are retained for demo display.
      setSubmittedSummary({
        name: formData.fullName,
        email: formData.email,
        phone: formData.phoneNumber,
      });
      setIsSuccess(true);
      // Clean up sensitive state immediately
      setFormData(INITIAL_STATE);
    }, 600);
  };

  const handleResetDemo = () => {
    setIsSuccess(false);
    setSubmittedSummary(null);
    setFormData(INITIAL_STATE);
    setErrors({});
  };

  if (isSuccess && submittedSummary) {
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
            {t.auth.register.demoSuccessTitle}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            {t.auth.register.demoSuccessDesc}
          </p>
        </div>

        <div className="bg-surface rounded-lg p-3 text-xs text-muted-foreground border border-border text-left space-y-1.5 max-w-sm mx-auto">
          <div>
            <span className="font-semibold text-foreground mr-1">
              {t.auth.register.fullNameLabel}:
            </span>
            {submittedSummary.name}
          </div>
          <div>
            <span className="font-semibold text-foreground mr-1">
              {t.auth.register.emailLabel}:
            </span>
            {submittedSummary.email}
          </div>
          <div>
            <span className="font-semibold text-foreground mr-1">
              {t.auth.register.phoneLabel}:
            </span>
            {submittedSummary.phone}
          </div>
        </div>

        <div className="pt-2">
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
