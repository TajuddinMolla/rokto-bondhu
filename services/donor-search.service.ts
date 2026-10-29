import {
  collection,
  getDocs,
  query,
  where,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  type DocumentData,
  type QueryConstraint,
  Timestamp,
} from "firebase/firestore";

import { getFirebaseDb } from "@/lib/firebase/config";
import { PUBLIC_DONOR_PROFILES_COLLECTION } from "@/services/donor.service";
import { normalizeBloodGroup } from "@/constants/blood-groups";
import type {
  PublicDonorProfile,
  DonorSearchFilterParams,
  DonorContactMode,
  MatchingDonorsParams,
  MatchingDonorItem,
  SearchMatchingDonorsResult,
  MatchingLocationScope,
} from "@/types/donor";
import type { DonorAvailabilityStatus, BloodGroup } from "@/types/blood";

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 50;

/**
 * Safely clamps page size to enforce minimum 1, default 20, and absolute maximum 50.
 */
export function clampPageSize(size?: number): number {
  if (!size || isNaN(size) || size < 1) {
    return DEFAULT_PAGE_SIZE;
  }
  return Math.min(Math.floor(size), MAX_PAGE_SIZE);
}

function timestampToIso(value: unknown): string {
  if (!value) return new Date().toISOString();
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  if (typeof value === "string") {
    return value;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  return new Date().toISOString();
}

export interface SearchPublicDonorsResult {
  donors: PublicDonorProfile[];
  nextCursor: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

/**
 * Searches the public donor collection with bounded cursor pagination.
 * Zero private personal information (phones, street addresses, UIDs) is queried or returned.
 */
export async function searchPublicDonors(
  filters: DonorSearchFilterParams = {},
  options?: {
    pageSize?: number;
    cursor?: QueryDocumentSnapshot<DocumentData> | null;
  }
): Promise<SearchPublicDonorsResult> {
  const db = getFirebaseDb();
  if (!db) {
    return {
      donors: [],
      nextCursor: null,
      hasMore: false,
    };
  }

  const colRef = collection(db, PUBLIC_DONOR_PROFILES_COLLECTION);
  const constraints: QueryConstraint[] = [];

  // Dynamic equality filters
  if (filters.bloodGroup) {
    const normalized = normalizeBloodGroup(filters.bloodGroup);
    if (normalized) {
      constraints.push(where("bloodGroup", "==", normalized));
    }
  }
  if (filters.divisionId) {
    constraints.push(where("divisionId", "==", filters.divisionId));
  }
  if (filters.districtId) {
    constraints.push(where("districtId", "==", filters.districtId));
  }
  if (filters.upazilaId) {
    constraints.push(where("upazilaId", "==", filters.upazilaId));
  }
  if (filters.availabilityStatus) {
    constraints.push(where("availabilityStatus", "==", filters.availabilityStatus));
  }

  const pageSize = clampPageSize(options?.pageSize);

  // Cursor-based pagination using document snapshot
  if (options?.cursor) {
    constraints.push(startAfter(options.cursor));
  }

  // Explicit bounded limit - NEVER unbounded
  constraints.push(limit(pageSize));

  const q = query(colRef, ...constraints);
  const snap = await getDocs(q);

  const donors: PublicDonorProfile[] = snap.docs
    .filter((docSnap) => !docSnap.data().isSuspended)
    .map((docSnap) => {
    const data = docSnap.data();
    const contactMode = (data.phoneVisibility ||
      data.contactMode ||
      (data.phoneNumber ? "PUBLIC" : "PRIVATE")) as DonorContactMode;

    return {
      id: docSnap.id,
      displayName: data.displayName || "",
      bloodGroup: data.bloodGroup as BloodGroup,
      divisionId: data.divisionId || "",
      districtId: data.districtId || "",
      upazilaId: data.upazilaId || "",
      availabilityStatus: (data.availabilityStatus ||
        "available") as DonorAvailabilityStatus,
      lastDonationDate: data.lastDonationDate || undefined,
      contactMode,
      phoneVisibility: contactMode,
      phoneNumber:
        contactMode === "PUBLIC" ? data.phoneNumber || undefined : undefined,
      updatedAt: timestampToIso(data.updatedAt),
    };
  });

  const hasMore = snap.docs.length === pageSize;
  const nextCursor = hasMore ? snap.docs[snap.docs.length - 1] : null;

  return {
    donors,
    nextCursor,
    hasMore,
  };
}

/**
 * Searches for donors matching an emergency blood requisition.
 * Uses exact blood group matching, scoped administrative location filtering,
 * and deterministic prioritization (available > pending > unavailable, same upazila > same district > same division).
 */
export async function searchMatchingDonors(
  params: MatchingDonorsParams,
  options?: {
    pageSize?: number;
    cursor?: QueryDocumentSnapshot<DocumentData> | null;
  }
): Promise<SearchMatchingDonorsResult> {
  const db = getFirebaseDb();
  const normalizedBlood = normalizeBloodGroup(params.bloodGroup);
  const scope: MatchingLocationScope = params.scope || "district";

  if (!db || !normalizedBlood) {
    return {
      donors: [],
      nextCursor: null,
      hasMore: false,
      scopeUsed: scope,
    };
  }

  const colRef = collection(db, PUBLIC_DONOR_PROFILES_COLLECTION);
  const constraints: QueryConstraint[] = [
    where("bloodGroup", "==", normalizedBlood),
  ];

  // Apply location constraints based on selected scope
  if (scope === "upazila" && params.upazilaId && params.districtId) {
    constraints.push(where("districtId", "==", params.districtId));
    constraints.push(where("upazilaId", "==", params.upazilaId));
  } else if (scope === "district" && params.districtId) {
    constraints.push(where("districtId", "==", params.districtId));
  } else if (scope === "division" && params.divisionId) {
    constraints.push(where("divisionId", "==", params.divisionId));
  }

  // Filter available only if explicitly requested
  if (params.availabilityOnly) {
    constraints.push(where("availabilityStatus", "==", "available"));
  }

  const pageSize = clampPageSize(options?.pageSize);

  if (options?.cursor) {
    constraints.push(startAfter(options.cursor));
  }

  constraints.push(limit(pageSize));

  const q = query(colRef, ...constraints);
  const snap = await getDocs(q);

  const mappedDonors: MatchingDonorItem[] = snap.docs
    .filter((docSnap) => !docSnap.data().isSuspended)
    .map((docSnap) => {
    const data = docSnap.data();
    const contactMode = (data.phoneVisibility ||
      data.contactMode ||
      (data.phoneNumber ? "PUBLIC" : "PRIVATE")) as DonorContactMode;

    const donorUpazila = String(data.upazilaId || "");
    const donorDistrict = String(data.districtId || "");
    const donorDivision = String(data.divisionId || "");

    return {
      id: docSnap.id,
      displayName: String(data.displayName || ""),
      bloodGroup: data.bloodGroup as BloodGroup,
      divisionId: donorDivision,
      districtId: donorDistrict,
      upazilaId: donorUpazila,
      availabilityStatus: (data.availabilityStatus ||
        "available") as DonorAvailabilityStatus,
      lastDonationDate: data.lastDonationDate ? String(data.lastDonationDate) : undefined,
      contactMode,
      phoneVisibility: contactMode,
      phoneNumber:
        contactMode === "PUBLIC" ? (data.phoneNumber ? String(data.phoneNumber) : undefined) : undefined,
      updatedAt: timestampToIso(data.updatedAt),
      isSameUpazila: Boolean(params.upazilaId && donorUpazila === params.upazilaId),
      isSameDistrict: Boolean(params.districtId && donorDistrict === params.districtId),
      isSameDivision: Boolean(params.divisionId && donorDivision === params.divisionId),
    };
  });

  // Deterministic in-page ranking:
  // 1. Availability: available (0) > pending (1) > unavailable (2)
  // 2. Proximity: same upazila > same district > same division
  // 3. updatedAt descending
  const availabilityRank = (status: DonorAvailabilityStatus) => {
    if (status === "available") return 0;
    if (status === "pending") return 1;
    return 2;
  };

  mappedDonors.sort((a, b) => {
    // Availability status priority
    const availDiff = availabilityRank(a.availabilityStatus) - availabilityRank(b.availabilityStatus);
    if (availDiff !== 0) return availDiff;

    // Upazila proximity
    if (a.isSameUpazila !== b.isSameUpazila) {
      return a.isSameUpazila ? -1 : 1;
    }

    // District proximity
    if (a.isSameDistrict !== b.isSameDistrict) {
      return a.isSameDistrict ? -1 : 1;
    }

    // Tie-breaker: creation/update date descending
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const hasMore = snap.docs.length === pageSize;
  const nextCursor = hasMore ? snap.docs[snap.docs.length - 1] : null;

  return {
    donors: mappedDonors,
    nextCursor,
    hasMore,
    scopeUsed: scope,
  };
}
