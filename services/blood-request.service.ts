import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  Timestamp,
  type QueryConstraint,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";

import { getFirebaseDb } from "@/lib/firebase/config";
import { dispatchNotificationSafely } from "@/services/notification.service";
import type {
  BloodRequest,
  BloodRequestSummary,
  CreateBloodRequestInput,
  UpdateBloodRequestInput,
} from "@/types/request";
import type { BloodGroup, RequestStatus, RequestUrgency } from "@/types/blood";

const BLOOD_REQUESTS_COLLECTION = "bloodRequests";

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

/**
 * Calculates a reliable expiration date for a blood request.
 * Standard validity is 7 days from baseDate.
 * If neededAt specifies a planned transfusion date further out,
 * expiry extends to 24 hours after neededAt.
 */
export function computeRequestExpiry(neededAt?: string, baseDate = new Date()): {
  expiryDate: Date;
  expiryTimestamp: Timestamp;
  expiryIso: string;
} {
  const defaultExpiryMs = baseDate.getTime() + 7 * 24 * 60 * 60 * 1000;
  let finalExpiryMs = defaultExpiryMs;

  if (neededAt) {
    const neededTime = new Date(neededAt).getTime();
    if (!isNaN(neededTime)) {
      const neededPlusGraceMs = neededTime + 24 * 60 * 60 * 1000;
      if (neededPlusGraceMs > defaultExpiryMs) {
        finalExpiryMs = neededPlusGraceMs;
      }
    }
  }

  const expiryDate = new Date(finalExpiryMs);
  return {
    expiryDate,
    expiryTimestamp: Timestamp.fromDate(expiryDate),
    expiryIso: expiryDate.toISOString(),
  };
}

/**
 * Checks whether a blood request is expired either by stored status
 * or by immediate evaluation of its expiresAt / legacy fallback cutoff.
 */
export function isBloodRequestExpired(request: {
  status?: string;
  expiresAt?: string | null;
  createdAt?: string | null;
  neededAt?: string | null;
}): boolean {
  if (request.status === "expired") {
    return true;
  }
  if (request.status && request.status !== "open") {
    return false; // fulfilled, cancelled, hidden
  }

  const nowMs = Date.now();

  // 1. Direct expiresAt evaluation
  if (request.expiresAt) {
    const expTime = new Date(request.expiresAt).getTime();
    if (!isNaN(expTime)) {
      return expTime <= nowMs;
    }
  }

  // 2. Legacy fallback: 7 days after createdAt
  if (request.createdAt) {
    const createdTime = new Date(request.createdAt).getTime();
    if (!isNaN(createdTime) && createdTime + 7 * 24 * 60 * 60 * 1000 <= nowMs) {
      return true;
    }
  }

  return false;
}

/**
 * Creates a new Blood Request in Firestore for the authenticated user.
 */
export async function createBloodRequest(
  userId: string,
  input: CreateBloodRequestInput
): Promise<BloodRequest> {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error("Firestore is not configured");
  }

  if (!userId) {
    throw new Error("User must be authenticated to create a blood request");
  }

  const { expiryTimestamp, expiryIso } = computeRequestExpiry(input.neededAt.trim());

  const payload: Record<string, unknown> = {
    requesterId: userId,
    requesterName: input.requesterName.trim(),
    contactNumber: input.contactNumber.trim(),
    bloodGroup: input.bloodGroup,
    unitsNeeded: Number(input.unitsNeeded),
    divisionId: input.divisionId,
    districtId: input.districtId,
    upazilaId: input.upazilaId,
    hospitalName: input.hospitalName?.trim() || null,
    locationAddress: input.locationAddress?.trim() || null,
    neededAt: input.neededAt.trim(),
    urgency: input.urgency,
    scope: input.scope || "LOCAL",
    status: "open",
    additionalNotes: input.additionalNotes?.trim() || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    expiresAt: expiryTimestamp,
  };

  const colRef = collection(db, BLOOD_REQUESTS_COLLECTION);
  const docRef = await addDoc(colRef, payload);

  // Trigger self-notification for requester
  dispatchNotificationSafely({
    event: "BLOOD_REQUEST_CREATED",
    bloodRequestId: docRef.id,
  }).catch(() => {});

  const now = new Date().toISOString();
  return {
    id: docRef.id,
    requesterId: userId,
    requesterName: input.requesterName.trim(),
    contactNumber: input.contactNumber.trim(),
    bloodGroup: input.bloodGroup,
    unitsNeeded: Number(input.unitsNeeded),
    divisionId: input.divisionId,
    districtId: input.districtId,
    upazilaId: input.upazilaId,
    hospitalName: input.hospitalName?.trim() || undefined,
    locationAddress: input.locationAddress?.trim() || undefined,
    neededAt: input.neededAt.trim(),
    urgency: input.urgency,
    scope: input.scope || "LOCAL",
    status: "open",
    additionalNotes: input.additionalNotes?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
    expiresAt: expiryIso,
  };
}

/**
 * Retrieves all blood requests created by a specific user.
 * Sorted client-side by creation date descending to avoid mandatory compound index creation.
 */
export async function getMyBloodRequests(userId: string): Promise<BloodRequest[]> {
  const db = getFirebaseDb();
  if (!db || !userId) return [];

  const colRef = collection(db, BLOOD_REQUESTS_COLLECTION);
  const q = query(colRef, where("requesterId", "==", userId));
  const snap = await getDocs(q);

  const requests: BloodRequest[] = [];
  snap.forEach((d) => {
    const data = d.data();
    const rawStatus = (data.status || "open") as RequestStatus;
    const createdAtIso = timestampToIso(data.createdAt);
    const updatedAtIso = timestampToIso(data.updatedAt);
    const expiresAtIso = data.expiresAt
      ? timestampToIso(data.expiresAt)
      : new Date(new Date(createdAtIso).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const isExpired = isBloodRequestExpired({
      status: rawStatus,
      expiresAt: expiresAtIso,
      createdAt: createdAtIso,
      neededAt: data.neededAt,
    });

    requests.push({
      id: d.id,
      requesterId: data.requesterId,
      requesterName: data.requesterName || "",
      contactNumber: data.contactNumber || "",
      bloodGroup: data.bloodGroup,
      unitsNeeded: data.unitsNeeded || 1,
      divisionId: data.divisionId,
      districtId: data.districtId,
      upazilaId: data.upazilaId,
      hospitalName: data.hospitalName || undefined,
      locationAddress: data.locationAddress || undefined,
      neededAt: data.neededAt || "",
      urgency: data.urgency || "urgent",
      status: isExpired ? "expired" : rawStatus,
      scope: data.scope || "LOCAL",
      additionalNotes: data.additionalNotes || undefined,
      createdAt: createdAtIso,
      updatedAt: updatedAtIso,
      expiresAt: expiresAtIso,
    });
  });

  // Sort descending by createdAt
  requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return requests;
}

/**
 * Retrieves a single blood request by its document ID.
 */
export async function getBloodRequestById(requestId: string): Promise<BloodRequest | null> {
  const db = getFirebaseDb();
  if (!db || !requestId) return null;

  const docRef = doc(db, BLOOD_REQUESTS_COLLECTION, requestId);
  const snap = await getDoc(docRef);

  if (!snap.exists()) {
    return null;
  }

  const data = snap.data();
  const rawStatus = (data.status || "open") as RequestStatus;
  const createdAtIso = timestampToIso(data.createdAt);
  const updatedAtIso = timestampToIso(data.updatedAt);
  const expiresAtIso = data.expiresAt
    ? timestampToIso(data.expiresAt)
    : new Date(new Date(createdAtIso).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const isExpired = isBloodRequestExpired({
    status: rawStatus,
    expiresAt: expiresAtIso,
    createdAt: createdAtIso,
    neededAt: data.neededAt,
  });

  return {
    id: snap.id,
    requesterId: data.requesterId,
    requesterName: data.requesterName || "",
    contactNumber: data.contactNumber || "",
    bloodGroup: data.bloodGroup,
    unitsNeeded: data.unitsNeeded || 1,
    divisionId: data.divisionId,
    districtId: data.districtId,
    upazilaId: data.upazilaId,
    hospitalName: data.hospitalName || undefined,
    locationAddress: data.locationAddress || undefined,
    neededAt: data.neededAt || "",
    urgency: data.urgency || "urgent",
    status: isExpired ? "expired" : rawStatus,
    scope: data.scope || "LOCAL",
    additionalNotes: data.additionalNotes || undefined,
    createdAt: createdAtIso,
    updatedAt: updatedAtIso,
    expiresAt: expiresAtIso,
  };
}

/**
 * Updates an editable open blood request.
 */
export async function updateBloodRequest(
  requestId: string,
  userId: string,
  updates: UpdateBloodRequestInput
): Promise<void> {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error("Firestore is not configured");
  }

  const docRef = doc(db, BLOOD_REQUESTS_COLLECTION, requestId);
  const existing = await getDoc(docRef);

  if (!existing.exists()) {
    throw new Error("Blood request not found");
  }

  const data = existing.data();
  if (data.requesterId !== userId) {
    throw new Error("Unauthorized to edit this blood request");
  }

  if (data.status !== "open" && updates.status !== "fulfilled" && updates.status !== "cancelled") {
    throw new Error("Only open requests can be modified");
  }

  const payload: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (updates.requesterName !== undefined) payload.requesterName = updates.requesterName.trim();
  if (updates.contactNumber !== undefined) payload.contactNumber = updates.contactNumber.trim();
  if (updates.bloodGroup !== undefined) payload.bloodGroup = updates.bloodGroup;
  if (updates.unitsNeeded !== undefined) payload.unitsNeeded = Number(updates.unitsNeeded);
  if (updates.divisionId !== undefined) payload.divisionId = updates.divisionId;
  if (updates.districtId !== undefined) payload.districtId = updates.districtId;
  if (updates.upazilaId !== undefined) payload.upazilaId = updates.upazilaId;
  if (updates.hospitalName !== undefined) payload.hospitalName = updates.hospitalName?.trim() || null;
  if (updates.locationAddress !== undefined) payload.locationAddress = updates.locationAddress?.trim() || null;
  if (updates.neededAt !== undefined) {
    payload.neededAt = updates.neededAt;
    const { expiryTimestamp } = computeRequestExpiry(updates.neededAt);
    payload.expiresAt = expiryTimestamp;
  }
  if (updates.urgency !== undefined) payload.urgency = updates.urgency;
  if (updates.additionalNotes !== undefined) payload.additionalNotes = updates.additionalNotes?.trim() || null;
  if (updates.scope !== undefined) payload.scope = updates.scope;
  if (updates.status !== undefined) payload.status = updates.status;

  await updateDoc(docRef, payload);
}

/**
 * Cancels a blood request.
 */
export async function cancelBloodRequest(requestId: string, userId: string): Promise<void> {
  await updateBloodRequest(requestId, userId, { status: "cancelled" });
  dispatchNotificationSafely({
    event: "BLOOD_REQUEST_CANCELLED",
    bloodRequestId: requestId,
  }).catch(() => {});
}

/**
 * Marks a blood request as fulfilled.
 */
export async function fulfillBloodRequest(requestId: string, userId: string): Promise<void> {
  await updateBloodRequest(requestId, userId, { status: "fulfilled" });
  dispatchNotificationSafely({
    event: "BLOOD_REQUEST_FULFILLED",
    bloodRequestId: requestId,
  }).catch(() => {});
}

export interface BloodRequestsFeedFilters {
  bloodGroup?: string | null;
  divisionId?: string | null;
  districtId?: string | null;
  upazilaId?: string | null;
  urgency?: string | null;
}

export interface PaginatedBloodRequestsFeedResult {
  requests: BloodRequestSummary[];
  nextCursor: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

/**
 * Retrieves paginated open blood requests for the live feed.
 * Orders by createdAt desc and supports cursor pagination.
 */
export async function getBloodRequestsFeed(
  filters: BloodRequestsFeedFilters = {},
  options?: {
    pageSize?: number;
    cursor?: QueryDocumentSnapshot<DocumentData> | null;
  }
): Promise<PaginatedBloodRequestsFeedResult> {
  const db = getFirebaseDb();
  if (!db) {
    return {
      requests: [],
      nextCursor: null,
      hasMore: false,
    };
  }

  const requestedSize = Math.min(Math.max(options?.pageSize || 20, 1), 50);
  const colRef = collection(db, BLOOD_REQUESTS_COLLECTION);

  const constraints: QueryConstraint[] = [
    where("status", "==", "open"),
  ];

  if (filters.bloodGroup) {
    constraints.push(where("bloodGroup", "==", filters.bloodGroup));
  }
  if (filters.districtId) {
    constraints.push(where("districtId", "==", filters.districtId));
  } else if (filters.divisionId) {
    constraints.push(where("divisionId", "==", filters.divisionId));
  }

  // Primary ordered query
  try {
    const orderedConstraints = [
      ...constraints,
      orderBy("createdAt", "desc"),
      limit(requestedSize + 1),
    ];

    if (options?.cursor) {
      orderedConstraints.push(startAfter(options.cursor));
    }

    const q = query(colRef, ...orderedConstraints);
    const snap = await getDocs(q);

    let docs = snap.docs;

    // Filter out expired requests immediately so they never appear as active
    docs = docs.filter((d) => {
      const data = d.data();
      const createdAtIso = timestampToIso(data.createdAt);
      const expiresAtIso = data.expiresAt
        ? timestampToIso(data.expiresAt)
        : new Date(new Date(createdAtIso).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      return !isBloodRequestExpired({
        status: data.status || "open",
        expiresAt: expiresAtIso,
        createdAt: createdAtIso,
        neededAt: data.neededAt,
      });
    });

    // In-memory filter for sub-fields (upazila and urgency)
    if (filters.upazilaId) {
      docs = docs.filter((d) => d.data().upazilaId === filters.upazilaId);
    }
    if (filters.urgency) {
      docs = docs.filter((d) => d.data().urgency === filters.urgency);
    }

    const hasMore = snap.docs.length > requestedSize;
    const resultDocs = hasMore ? docs.slice(0, requestedSize) : docs;
    const nextCursor =
      hasMore && snap.docs.length > 0 ? snap.docs[requestedSize - 1] : null;

    const requests: BloodRequestSummary[] = resultDocs.map((d) => {
      const data = d.data();
      const createdAtIso = timestampToIso(data.createdAt);
      const expiresAtIso = data.expiresAt
        ? timestampToIso(data.expiresAt)
        : new Date(new Date(createdAtIso).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      return {
        id: d.id,
        bloodGroup: data.bloodGroup as BloodGroup,
        unitsNeeded: Number(data.unitsNeeded || 1),
        hospitalName: data.hospitalName || undefined,
        divisionId: data.divisionId || "",
        districtId: data.districtId || "",
        upazilaId: data.upazilaId || "",
        neededAt: data.neededAt || "",
        urgency: (data.urgency || "urgent") as RequestUrgency,
        status: (data.status || "open") as RequestStatus,
        scope: data.scope || "LOCAL",
        createdAt: createdAtIso,
        expiresAt: expiresAtIso,
      };
    });

    return {
      requests,
      nextCursor,
      hasMore,
    };
  } catch (err: unknown) {
    console.warn(
      "[Blood Requests Feed] Ordered query failed (fallback to equality query):",
      err
    );

    const fallbackConstraints = [...constraints, limit(requestedSize * 2)];
    const fallbackQ = query(colRef, ...fallbackConstraints);
    const snap = await getDocs(fallbackQ);

    let docs = snap.docs;

    // Filter out expired requests immediately in fallback path as well
    docs = docs.filter((d) => {
      const data = d.data();
      const createdAtIso = timestampToIso(data.createdAt);
      const expiresAtIso = data.expiresAt
        ? timestampToIso(data.expiresAt)
        : new Date(new Date(createdAtIso).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      return !isBloodRequestExpired({
        status: data.status || "open",
        expiresAt: expiresAtIso,
        createdAt: createdAtIso,
        neededAt: data.neededAt,
      });
    });

    if (filters.upazilaId) {
      docs = docs.filter((d) => d.data().upazilaId === filters.upazilaId);
    }
    if (filters.urgency) {
      docs = docs.filter((d) => d.data().urgency === filters.urgency);
    }

    const requests: BloodRequestSummary[] = docs.map((d) => {
      const data = d.data();
      const createdAtIso = timestampToIso(data.createdAt);
      const expiresAtIso = data.expiresAt
        ? timestampToIso(data.expiresAt)
        : new Date(new Date(createdAtIso).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      return {
        id: d.id,
        bloodGroup: data.bloodGroup as BloodGroup,
        unitsNeeded: Number(data.unitsNeeded || 1),
        hospitalName: data.hospitalName || undefined,
        divisionId: data.divisionId || "",
        districtId: data.districtId || "",
        upazilaId: data.upazilaId || "",
        neededAt: data.neededAt || "",
        urgency: (data.urgency || "urgent") as RequestUrgency,
        status: (data.status || "open") as RequestStatus,
        scope: data.scope || "LOCAL",
        createdAt: createdAtIso,
        expiresAt: expiresAtIso,
      };
    });

    requests.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const hasMore = requests.length > requestedSize;
    return {
      requests: hasMore ? requests.slice(0, requestedSize) : requests,
      nextCursor: null,
      hasMore,
    };
  }
}

