import {
  BLOOD_GROUPS,
  type BloodGroup,
  isBloodGroup,
} from "@/constants/blood-groups";

export { BLOOD_GROUPS, type BloodGroup, isBloodGroup };

/**
 * Donor Availability Status
 * Represents the current eligibility and willingness of a donor to donate.
 */
export const DONOR_AVAILABILITY_STATUSES = [
  "available",
  "unavailable",
  "pending",
] as const;

export type DonorAvailabilityStatus =
  (typeof DONOR_AVAILABILITY_STATUSES)[number];

export function isDonorAvailabilityStatus(
  value: unknown
): value is DonorAvailabilityStatus {
  return (
    typeof value === "string" &&
    DONOR_AVAILABILITY_STATUSES.includes(value as DonorAvailabilityStatus)
  );
}

/**
 * Blood Request Urgency Level
 * Indicates the clinical time-criticality of a blood request.
 */
export const REQUEST_URGENCIES = ["normal", "urgent", "critical"] as const;

export type RequestUrgency = (typeof REQUEST_URGENCIES)[number];

export function isRequestUrgency(value: unknown): value is RequestUrgency {
  return (
    typeof value === "string" &&
    REQUEST_URGENCIES.includes(value as RequestUrgency)
  );
}

/**
 * Blood Request Lifecycle Status
 * Represents the state of a blood requisition in the system.
 */
export const REQUEST_STATUSES = [
  "open",
  "fulfilled",
  "cancelled",
  "expired",
] as const;

export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export function isRequestStatus(value: unknown): value is RequestStatus {
  return (
    typeof value === "string" &&
    REQUEST_STATUSES.includes(value as RequestStatus)
  );
}
