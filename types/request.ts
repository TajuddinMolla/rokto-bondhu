import type { BloodGroup, RequestStatus, RequestUrgency } from "@/types/blood";

/**
 * Blood Request Entity.
 * Represents an urgent or planned requisition for blood units from patients or hospitals.
 *
 * Date representation notes:
 * - `neededAt` is an ISO 8601 date-time string specifying when the blood is required.
 * - `createdAt` and `updatedAt` are ISO 8601 UTC timestamp strings.
 */
export interface BloodRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  contactNumber: string;
  bloodGroup: BloodGroup;
  unitsNeeded: number;
  hospitalName?: string;
  divisionId: string;
  districtId: string;
  upazilaId: string;
  locationAddress?: string;
  neededAt: string; // ISO 8601 string
  urgency: RequestUrgency;
  status: RequestStatus;
  additionalNotes?: string;
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
}

/**
 * Input type for creating a new blood request.
 */
export interface CreateBloodRequestInput {
  requesterName: string;
  contactNumber: string;
  bloodGroup: BloodGroup;
  unitsNeeded: number;
  divisionId: string;
  districtId: string;
  upazilaId: string;
  hospitalName?: string;
  locationAddress?: string;
  neededAt: string;
  urgency: RequestUrgency;
  additionalNotes?: string;
}

/**
 * Input type for updating an existing blood request.
 */
export interface UpdateBloodRequestInput {
  requesterName?: string;
  contactNumber?: string;
  bloodGroup?: BloodGroup;
  unitsNeeded?: number;
  divisionId?: string;
  districtId?: string;
  upazilaId?: string;
  hospitalName?: string;
  locationAddress?: string;
  neededAt?: string;
  urgency?: RequestUrgency;
  additionalNotes?: string;
  status?: RequestStatus;
}

/**
 * Public summary of a blood request for listing feeds and urgent alert cards.
 */
export interface BloodRequestSummary {
  id: string;
  bloodGroup: BloodGroup;
  unitsNeeded: number;
  hospitalName?: string;
  divisionId: string;
  districtId: string;
  upazilaId: string;
  neededAt: string;
  urgency: RequestUrgency;
  status: RequestStatus;
  createdAt: string;
}
