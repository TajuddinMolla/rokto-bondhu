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

  const donors: PublicDonorProfile[] = snap.docs.map((docSnap) => {
    const data = docSnap.data();
    const contactMode = (data.contactMode ||
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
