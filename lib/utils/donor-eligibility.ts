/**
 * Donor Eligibility & Recovery Period Calculation Engine
 *
 * Enforces the medical recovery rule: at least 4 months (120 days)
 * between whole blood donations.
 *
 * Calendar Date Handling:
 * Input dates are formatted as ISO 8601 calendar strings (`YYYY-MM-DD`).
 * Calculations strictly operate on UTC calendar boundaries to prevent
 * timezone drift (e.g. Asia/Dhaka UTC+6 vs UTC).
 */

export const DONOR_RECOVERY_PERIOD_DAYS = 120;

export interface DonorEligibilityResult {
  /** Whether the donor has passed the 120-day recovery period (or never donated) */
  isEligible: boolean;
  /** Whether the provided date is strictly in the future relative to the reference date */
  isFutureDate: boolean;
  /** ISO date string (YYYY-MM-DD) when the donor becomes eligible again, or null if eligible/never donated */
  nextEligibleDate: string | null;
  /** Number of days remaining in the recovery period (0 if eligible) */
  daysRemaining: number;
  /** Number of days elapsed since the last donation date (null if never donated or future) */
  daysElapsed: number | null;
  /** The sanitized calendar date string of the last donation, or null */
  lastDonationDate: string | null;
}

/**
 * Parses a YYYY-MM-DD calendar date string into a UTC Date object at midnight (00:00:00.000Z).
 * Returns null if the format is invalid or represents an impossible calendar date.
 */
export function parseCalendarDateUtc(dateStr?: string | null): Date | null {
  if (!dateStr || typeof dateStr !== "string") return null;
  const trimmed = dateStr.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;

  const [yearStr, monthStr, dayStr] = trimmed.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  // Validate leap year and month-end correctness
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

/**
 * Formats a Date object into a YYYY-MM-DD calendar string based on its UTC values.
 */
export function formatCalendarDateUtc(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Obtains the current calendar date in Bangladesh (Asia/Dhaka) or UTC as a YYYY-MM-DD string.
 */
export function getReferenceCalendarDate(referenceDate?: Date | string | null): Date {
  if (referenceDate instanceof Date) {
    // If a Date is passed, normalize to UTC midnight of its year/month/day
    return new Date(
      Date.UTC(
        referenceDate.getFullYear(),
        referenceDate.getMonth(),
        referenceDate.getDate(),
        0,
        0,
        0,
        0
      )
    );
  }

  if (typeof referenceDate === "string") {
    const parsed = parseCalendarDateUtc(referenceDate);
    if (parsed) return parsed;
  }

  // Default to current date in Bangladesh (Asia/Dhaka, UTC+6)
  const now = new Date();
  try {
    const dhakaStr = now.toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" });
    const parsed = parseCalendarDateUtc(dhakaStr);
    if (parsed) return parsed;
  } catch {
    // Fallback if environment doesn't support IANA time zones
  }

  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
}

/**
 * Calculates a donor's medical eligibility and recovery timeline based on their `lastDonationDate`.
 *
 * Rules:
 * - Null / empty / missing date: Donor has never donated or date is unrecorded. Eligible.
 * - Future date: Invalid for eligibility. Ineligible until verified.
 * - Days elapsed < 120: Ineligible (recovering).
 * - Days elapsed >= 120: Eligible.
 *
 * @param lastDonationDate - ISO 8601 calendar date (YYYY-MM-DD)
 * @param referenceDate - Optional reference date (defaults to current date in Asia/Dhaka)
 */
export function calculateDonorEligibility(
  lastDonationDate?: string | null,
  referenceDate?: Date | string | null
): DonorEligibilityResult {
  const parsedDonation = parseCalendarDateUtc(lastDonationDate);

  if (!parsedDonation) {
    return {
      isEligible: true,
      isFutureDate: false,
      nextEligibleDate: null,
      daysRemaining: 0,
      daysElapsed: null,
      lastDonationDate: null,
    };
  }

  const sanitizedDateStr = formatCalendarDateUtc(parsedDonation);
  const refDate = getReferenceCalendarDate(referenceDate);

  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const diffMs = refDate.getTime() - parsedDonation.getTime();
  const daysElapsed = Math.floor(diffMs / MS_PER_DAY);

  // Future donation date check
  if (daysElapsed < 0) {
    return {
      isEligible: false,
      isFutureDate: true,
      nextEligibleDate: null,
      daysRemaining: DONOR_RECOVERY_PERIOD_DAYS,
      daysElapsed,
      lastDonationDate: sanitizedDateStr,
    };
  }

  // Calculate next eligible date: donationDate + 120 days
  const nextDateUtc = new Date(parsedDonation.getTime() + DONOR_RECOVERY_PERIOD_DAYS * MS_PER_DAY);
  const nextEligibleDateStr = formatCalendarDateUtc(nextDateUtc);

  const isEligible = daysElapsed >= DONOR_RECOVERY_PERIOD_DAYS;
  const daysRemaining = isEligible ? 0 : DONOR_RECOVERY_PERIOD_DAYS - daysElapsed;

  return {
    isEligible,
    isFutureDate: false,
    nextEligibleDate: nextEligibleDateStr,
    daysRemaining,
    daysElapsed,
    lastDonationDate: sanitizedDateStr,
  };
}

/**
 * Formats a calendar date (YYYY-MM-DD) into a localized, user-friendly string.
 * Supports Bengali numerals and month names.
 */
export function formatEligibleDateDisplay(
  dateStr: string | null,
  locale: "bn" | "en" = "bn"
): string {
  if (!dateStr) return "";
  const parsed = parseCalendarDateUtc(dateStr);
  if (!parsed) return dateStr;

  const day = parsed.getUTCDate();
  const month = parsed.getUTCMonth();
  const year = parsed.getUTCFullYear();

  const bnMonths = [
    "জানুয়ারি",
    "ফেব্রুয়ারি",
    "মার্চ",
    "এপ্রিল",
    "মে",
    "জুন",
    "জুলাই",
    "আগস্ট",
    "সেপ্টেম্বর",
    "অক্টোবর",
    "নভেম্বর",
    "ডিসেম্বর",
  ];

  const enMonths = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  if (locale === "bn") {
    const toBengaliNumber = (num: number): string =>
      String(num).replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);
    return `${toBengaliNumber(day)} ${bnMonths[month]} ${toBengaliNumber(year)}`;
  }

  return `${day} ${enMonths[month]} ${year}`;
}

