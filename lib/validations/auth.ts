import { z } from "zod";

import { BD_PHONE_REGEX } from "@/lib/validations/donor";
import { type Locale } from "@/i18n/config";
import { getTranslations } from "@/i18n/translations";

/**
 * Creates localized Zod schema for User Account Login.
 * Supports email address OR Bangladeshi mobile number as identifier.
 */
export function createLoginSchema(locale: Locale = "bn") {
  const t = getTranslations(locale);

  return z.object({
    identifier: z
      .string()
      .trim()
      .min(1, t.validation.identifierRequired)
      .refine(
        (val) => {
          if (val.includes("@")) {
            return z.string().email().safeParse(val).success;
          }
          return BD_PHONE_REGEX.test(val);
        },
        { message: t.validation.identifierInvalid }
      ),

    password: z
      .string()
      .min(1, t.validation.passwordRequired),

    rememberMe: z.boolean().optional().default(false),
  });
}

/**
 * Creates localized Zod schema for User Account Registration.
 * Validates full name, email, BD phone, strong password rules, match confirmation, and user consent.
 */
export function createRegisterSchema(locale: Locale = "bn") {
  const t = getTranslations(locale);

  return z
    .object({
      fullName: z
        .string()
        .trim()
        .min(2, t.validation.nameMin)
        .max(100, t.validation.nameMax),

      email: z
        .string()
        .trim()
        .min(1, t.validation.emailRequired)
        .email(t.validation.emailInvalid),

      phoneNumber: z
        .string()
        .trim()
        .regex(BD_PHONE_REGEX, t.validation.phoneInvalid),

      password: z
        .string()
        .min(8, t.validation.passwordMin)
        .refine(
          (val) => /[A-Za-z]/.test(val) && /\d/.test(val),
          { message: t.validation.passwordRule }
        ),

      confirmPassword: z
        .string()
        .min(1, t.validation.confirmPasswordRequired),

      consent: z
        .boolean()
        .refine((val) => val === true, {
          message: t.validation.consentRequired,
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t.validation.passwordMismatch,
      path: ["confirmPassword"],
    });
}

/**
 * Creates localized Zod schema for Password Recovery request.
 */
export function createForgotPasswordSchema(locale: Locale = "bn") {
  const t = getTranslations(locale);

  return z.object({
    email: z
      .string()
      .trim()
      .min(1, t.validation.emailRequired)
      .email(t.validation.emailInvalid),
  });
}

/**
 * Creates localized Zod schema for Password Reset completion.
 */
export function createResetPasswordSchema(locale: Locale = "bn") {
  const t = getTranslations(locale);

  return z
    .object({
      password: z
        .string()
        .min(8, t.validation.passwordMin)
        .refine(
          (val) => /[A-Za-z]/.test(val) && /\d/.test(val),
          { message: t.validation.passwordRule }
        ),

      confirmPassword: z
        .string()
        .min(1, t.validation.confirmPasswordRequired),

      token: z.string().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t.validation.passwordMismatch,
      path: ["confirmPassword"],
    });
}
