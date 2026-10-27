"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2, CheckCircle2, AlertCircle, ArrowRight, RotateCcw } from "lucide-react";

import { createLoginSchema } from "@/lib/validations/auth";
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
  const formId = React.useId();

  const [formData, setFormData] = React.useState<LoginState>(INITIAL_STATE);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [submittedIdentifier, setSubmittedIdentifier] = React.useState<string>("");

  const loginSchema = React.useMemo(() => createLoginSchema(locale), [locale]);

  const prefix = locale === "en" ? "/en" : "";
  const forgotPasswordHref = `${prefix}/forgot-password`;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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
      // NOTE: We only store the identifier for the display confirmation. Passwords are NEVER persisted.
      setSubmittedIdentifier(formData.identifier);
      setIsSuccess(true);
      // Clean up sensitive state immediately
      setFormData(INITIAL_STATE);
    }, 500);
  };

  const handleResetDemo = () => {
    setIsSuccess(false);
    setSubmittedIdentifier("");
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
            {t.auth.login.demoSuccessTitle}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            {t.auth.login.demoSuccessDesc}
          </p>
        </div>

        <div className="bg-surface rounded-lg p-3 text-xs text-muted-foreground border border-border inline-block max-w-xs break-all">
          <span className="font-semibold text-foreground mr-1">
            {t.auth.login.identifierLabel}:
          </span>
          {submittedIdentifier}
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

      {/* Identifier Field: Email or BD Phone */}
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
          type="text"
          value={formData.identifier}
          onChange={handleChange}
          placeholder={t.auth.login.identifierPlaceholder}
          autoComplete="username"
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
