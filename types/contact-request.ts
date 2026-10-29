import type { BloodGroup, RequestUrgency } from "@/types/blood";

export type ContactRequestStatus =
  | "PENDING"
  | "ACCEPTED"
  | "DECLINED"
  | "CANCELLED"
  | "COMPLETED"
  | "EXPIRED";

export interface SharedContactDetails {
  phoneNumber: string;
  consentedAt: string; // ISO 8601 UTC timestamp
}

/**
 * Domain representation of a direct 1-to-1 donor contact request in Firestore.
 * Stored at `/donorContactRequests/{requestId}`.
 */
export interface DonorContactRequest {
  id: string;
  donorId: string;
  requesterId: string;
  donorName: string;
  donorBloodGroup: BloodGroup;
  requesterName: string;
  requesterPhone: string;
  patientName?: string;
  hospitalName?: string;
  urgency: RequestUrgency;
  message?: string;
  status: ContactRequestStatus;
  donorConsentGiven: boolean;
  sharedContactDetails?: SharedContactDetails;
  createdAt: string; // ISO 8601 UTC string
  updatedAt: string; // ISO 8601 UTC string
}

/**
 * Input payload when an authenticated requester submits a contact request to a private donor.
 */
export interface CreateContactRequestInput {
  donorId: string;
  donorName: string;
  donorBloodGroup: BloodGroup;
  requesterName: string;
  requesterPhone: string;
  patientName?: string;
  hospitalName?: string;
  urgency: RequestUrgency;
  message?: string;
  consent: boolean;
}
