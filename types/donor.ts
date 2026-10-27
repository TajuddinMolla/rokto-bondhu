import type { BloodGroup, DonorAvailabilityStatus } from "@/types/blood";

/**
 * Donor-controlled contact visibility mode.
 * - `PUBLIC`: Phone number is publicly displayed with direct "Call Now" (tel:) access.
 * - `PRIVATE`: Phone number is protected; requesters must send an explicit contact request.
 */
export type DonorContactMode = "PUBLIC" | "PRIVATE";

/**
 * Full Donor Profile representation.
 *
 * Date representation notes:
 * - `lastDonationDate` is stored as an ISO 8601 calendar date string (`YYYY-MM-DD`) to avoid timezone skew.
 * - `createdAt` and `updatedAt` are stored as full ISO 8601 UTC timestamp strings.
 */
export interface DonorProfile {
  id: string;
  userId?: string;
  displayName: string;
  bloodGroup: BloodGroup;
  divisionId: string;
  districtId: string;
  upazilaId: string;
  area?: string;
  phoneNumber: string;
  isPhonePublic: boolean;
  contactMode?: DonorContactMode;
  lastDonationDate?: string; // YYYY-MM-DD
  availabilityStatus: DonorAvailabilityStatus;
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
}

/**
 * Publicly visible donor summary used in search listings and cards.
 * Omits private contact details when the donor chooses not to display their phone number publicly.
 */
export interface DonorPublicSummary {
  id: string;
  displayName: string;
  bloodGroup: BloodGroup;
  divisionId: string;
  districtId: string;
  upazilaId: string;
  area?: string;
  isPhonePublic: boolean;
  contactMode?: DonorContactMode;
  phoneNumber?: string; // Only present if contactMode === "PUBLIC" or isPhonePublic is true
  lastDonationDate?: string;
  availabilityStatus: DonorAvailabilityStatus;
}

/**
 * Dedicated public donor representation stored in `/publicDonorProfiles/{uid}`.
 * Only includes phone number if the donor explicitly consented to PUBLIC contact mode.
 */
export interface PublicDonorProfile {
  id: string;
  displayName: string;
  bloodGroup: BloodGroup;
  divisionId: string;
  districtId: string;
  upazilaId: string;
  availabilityStatus: DonorAvailabilityStatus;
  contactMode?: DonorContactMode;
  phoneNumber?: string; // Strictly present ONLY when contactMode === "PUBLIC"
  lastDonationDate?: string; // YYYY-MM-DD
  updatedAt: string; // ISO 8601 string
}

/**
 * Filter parameters for public donor discovery queries.
 */
export interface DonorSearchFilterParams {
  bloodGroup?: BloodGroup | string;
  divisionId?: string;
  districtId?: string;
  upazilaId?: string;
  availabilityStatus?: DonorAvailabilityStatus | string;
}

/**
 * Paginated result representation from cursor-based public donor queries.
 */
export interface PublicDonorSearchResult {
  donors: PublicDonorProfile[];
  nextCursorId: string | null;
  hasMore: boolean;
}

