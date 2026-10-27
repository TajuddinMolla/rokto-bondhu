import type { BloodGroup, DonorAvailabilityStatus } from "@/types/blood";

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
  phoneNumber?: string; // Only present if isPhonePublic is true
  lastDonationDate?: string;
  availabilityStatus: DonorAvailabilityStatus;
}

/**
 * Dedicated public donor representation stored in `/publicDonorProfiles/{uid}`.
 * Strictly omits all private phone numbers, street addresses, and auth credentials.
 */
export interface PublicDonorProfile {
  id: string;
  displayName: string;
  bloodGroup: BloodGroup;
  divisionId: string;
  districtId: string;
  upazilaId: string;
  availabilityStatus: DonorAvailabilityStatus;
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

