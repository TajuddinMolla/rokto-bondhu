import { z } from "zod";

import { BLOOD_GROUPS } from "@/constants/blood-groups";
import { DONOR_AVAILABILITY_STATUSES } from "@/types/blood";
import { type Locale } from "@/i18n/config";
import { getTranslations } from "@/i18n/translations";

/**
 * Bangladesh Mobile Phone Number Regex.
 * Supports:
 * - 013XXXXXXXX to 019XXXXXXXX (11 digits, standard national format)
 * - +8801[3-9]XXXXXXXX (14 characters, international standard format)
 * - 8801[3-9]XXXXXXXX (13 digits, international format without plus)
 */
export const BD_PHONE_REGEX = /^(?:\+8801|8801|01)[3-9]\d{8}$/;

/**
 * Normalizes a Bangladeshi phone number into standard 11-digit national format (01XXXXXXXXX).
 * Strips whitespace, hyphens, and the +88 / 88 international dialing prefix.
 */
export function normalizeBdPhoneNumber(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  if (digits.startsWith("+8801")) {
    return digits.slice(3);
  }
  if (digits.startsWith("8801")) {
    return digits.slice(2);
  }
  return digits;
}

/**
 * ISO 8601 calendar date regex (YYYY-MM-DD).
 */
export const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Factory function creating a localized Zod schema for Donor Profile input.
 */
export function createDonorSchema(locale: Locale = "bn") {
  const t = getTranslations(locale);

  return z.object({
    displayName: z
      .string()
      .trim()
      .min(2, t.validation.nameMin)
      .max(100, t.validation.nameMax),

    bloodGroup: z.enum(BLOOD_GROUPS, {
      message: t.validation.bloodGroupRequired,
    }),

    phoneNumber: z
      .string()
      .trim()
      .regex(BD_PHONE_REGEX, t.validation.phoneInvalid),

    isPhonePublic: z.boolean().default(false),
    contactMode: z.enum(["PUBLIC", "PRIVATE"]).default("PRIVATE"),
    phoneVisibility: z.enum(["PUBLIC", "PRIVATE"]).optional(),

    divisionId: z
      .string()
      .trim()
      .min(1, t.validation.divisionRequired),

    districtId: z
      .string()
      .trim()
      .min(1, t.validation.districtRequired),

    upazilaId: z
      .string()
      .trim()
      .min(1, t.validation.upazilaRequired),

    area: z
      .string()
      .trim()
      .max(150, t.validation.areaMax)
      .optional()
      .or(z.literal("")),

    lastDonationDate: z
      .string()
      .trim()
      .regex(ISO_DATE_REGEX, t.validation.dateInvalid)
      .refine(
        (val) => {
          const parsed = Date.parse(val);
          if (isNaN(parsed)) return false;
          // Must not be in the future (compared to start of tomorrow UTC)
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          return new Date(val).getTime() < tomorrow.getTime();
        },
        { message: t.validation.futureDateNotAllowed }
      )
      .optional()
      .or(z.literal("")),

    availabilityStatus: z
      .enum(DONOR_AVAILABILITY_STATUSES)
      .default("available"),

    consent: z
      .boolean()
      .refine((val) => val === true, {
        message: t.validation.consentRequired,
      }),
  });
}

/**
 * Default static donor schema and inferred TypeScript type.
 */
export const donorSchema = createDonorSchema("bn");

export type DonorInput = z.infer<typeof donorSchema>;
