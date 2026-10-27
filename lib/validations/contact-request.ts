import { z } from "zod";

import { REQUEST_URGENCIES } from "@/types/blood";
import { type Locale } from "@/i18n/config";
import { getTranslations } from "@/i18n/translations";
import { BD_PHONE_REGEX } from "@/lib/validations/donor";

/**
 * Factory function creating a localized Zod schema for Contact Request input.
 */
export function createContactRequestSchema(locale: Locale = "bn") {
  const t = getTranslations(locale);

  return z.object({
    requesterName: z
      .string()
      .trim()
      .min(2, t.validation.nameMin)
      .max(100, t.validation.nameMax),

    requesterPhone: z
      .string()
      .trim()
      .regex(BD_PHONE_REGEX, t.validation.phoneInvalid),

    patientName: z
      .string()
      .trim()
      .max(100, locale === "en" ? "Patient name cannot exceed 100 characters" : "রোগীর নাম সর্বোচ্চ ১০০ অক্ষরের হতে পারে")
      .optional()
      .or(z.literal("")),

    hospitalName: z
      .string()
      .trim()
      .max(150, t.validation.hospitalMax)
      .optional()
      .or(z.literal("")),

    urgency: z.enum(REQUEST_URGENCIES, {
      message: t.validation.urgencyRequired,
    }),

    message: z
      .string()
      .trim()
      .max(300, locale === "en" ? "Message cannot exceed 300 characters" : "বার্তা সর্বোচ্চ ৩০০ অক্ষরের হতে পারে")
      .optional()
      .or(z.literal("")),

    consent: z
      .boolean()
      .refine((val) => val === true, {
        message:
          locale === "en"
            ? "You must acknowledge contact guidelines before sending"
            : "অনুরোধ পাঠানোর আগে আপনাকে শর্তাবলী মেনে নিতে হবে",
      }),
  });
}

export type ContactRequestFormData = z.infer<
  ReturnType<typeof createContactRequestSchema>
>;
