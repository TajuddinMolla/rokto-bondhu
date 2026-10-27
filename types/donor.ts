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
