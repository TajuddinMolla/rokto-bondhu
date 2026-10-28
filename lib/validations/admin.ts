import { z } from "zod";
import type { Locale } from "@/i18n/config";

export const REPORT_REASONS = [
  "INAPPROPRIATE_CONTENT",
  "SPAM",
  "FAKE_INFORMATION",
  "HARASSMENT",
  "OTHER",
] as const;

export const REPORT_TARGET_TYPES = ["DONOR", "BLOOD_REQUEST", "USER"] as const;

/**
 * Zod schema for moderation actions (requires an explicit reason).
 */
export function createModerationActionSchema(locale: Locale = "bn") {
  return z.object({
    reason: z
      .string()
      .trim()
      .min(
        5,
        locale === "en"
          ? "Please provide a detailed reason (minimum 5 characters)"
          : "অনুগ্রহ করে বিস্তারিত কারণ উল্লেখ করুন (কমপক্ষে ৫ অক্ষর)",
      )
      .max(
        500,
        locale === "en"
          ? "Reason cannot exceed 500 characters"
          : "কারণ সর্বোচ্চ ৫০০ অক্ষরের হতে পারে",
      ),
  });
}

export type ModerationActionFormData = z.infer<
  ReturnType<typeof createModerationActionSchema>
>;

/**
 * Zod schema for user-facing report creation.
 */
export function createReportSchema(locale: Locale = "bn") {
  return z.object({
    targetType: z.enum(REPORT_TARGET_TYPES),
    targetId: z.string().min(1),
    targetTitle: z.string().optional(),
    reason: z.enum(REPORT_REASONS, {
      message:
        locale === "en"
          ? "Please select a valid reason"
          : "অনুগ্রহ করে একটি উপযুক্ত কারণ নির্বাচন করুন",
    }),
    description: z
      .string()
      .trim()
      .max(
        500,
        locale === "en"
          ? "Description cannot exceed 500 characters"
          : "বিবরণ সর্বোচ্চ ৫০০ অক্ষরের হতে পারে",
      )
      .optional()
      .or(z.literal("")),
  });
}

export type CreateReportFormData = z.infer<
  ReturnType<typeof createReportSchema>
>;

/**
 * Zod schema for resolving/dismissing a report in the admin queue.
 */
export function createResolveReportSchema(locale: Locale = "bn") {
  return z.object({
    status: z.enum(["RESOLVED", "DISMISSED"], {
      message:
        locale === "en"
          ? "Please select a resolution status"
          : "অনুগ্রহ করে সমাধানের অবস্থা নির্বাচন করুন",
    }),
    resolutionNotes: z
      .string()
      .trim()
      .min(
        5,
        locale === "en"
          ? "Please enter resolution notes (minimum 5 characters)"
          : "অনুগ্রহ করে সমাধানের বিবরণ দিন (কমপক্ষে ৫ অক্ষর)",
      )
      .max(
        500,
        locale === "en"
          ? "Notes cannot exceed 500 characters"
          : "বিবরণ সর্বোচ্চ ৫০০ অক্ষরের হতে পারে",
      ),
  });
}

export type ResolveReportFormData = z.infer<
  ReturnType<typeof createResolveReportSchema>
>;
