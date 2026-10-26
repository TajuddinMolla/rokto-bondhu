import { z } from "zod";

import { BLOOD_GROUPS } from "@/constants/blood-groups";
import { REQUEST_URGENCIES } from "@/types/blood";
import { type Locale } from "@/i18n/config";
import { getTranslations } from "@/i18n/translations";
import { BD_PHONE_REGEX } from "@/lib/validations/donor";

/**
 * Factory function creating a localized Zod schema for Blood Requisition input.
 */
export function createBloodRequestSchema(locale: Locale = "bn") {
  const t = getTranslations(locale);

  return z.object({
    requesterName: z
      .string()
      .trim()
      .min(2, t.validation.nameMin)
      .max(100, t.validation.nameMax),

    contactNumber: z
      .string()
      .trim()
      .regex(BD_PHONE_REGEX, t.validation.phoneInvalid),

    bloodGroup: z.enum(BLOOD_GROUPS, {
      message: t.validation.bloodGroupRequired,
    }),

    unitsNeeded: z
      .number()
      .int(t.validation.unitsInteger)
      .min(1, t.validation.unitsMin)
      .max(20, t.validation.unitsMax),

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

    hospitalName: z
      .string()
      .trim()
      .max(200, t.validation.hospitalMax)
      .optional()
      .or(z.literal("")),

    locationAddress: z
      .string()
      .trim()
      .max(250, t.validation.areaMax)
      .optional()
      .or(z.literal("")),

    neededAt: z
      .string()
      .trim()
      .min(1, t.validation.neededAtRequired)
      .refine(
        (val) => !isNaN(Date.parse(val)),
        { message: t.validation.dateInvalid }
      ),

    urgency: z.enum(REQUEST_URGENCIES, {
      message: t.validation.urgencyInvalid,
    }),

    additionalNotes: z
      .string()
      .trim()
      .max(500, t.validation.notesMax)
      .optional()
      .or(z.literal("")),
  });
}

/**
 * Default static blood request schema and inferred TypeScript type.
 */
export const bloodRequestSchema = createBloodRequestSchema("bn");

export type BloodRequestInput = z.infer<typeof bloodRequestSchema>;
