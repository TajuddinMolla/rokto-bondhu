import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

import { getFirebaseDb } from "@/lib/firebase/config";
import { dispatchNotificationSafely } from "@/services/notification.service";
import type { BloodRequest, CreateBloodRequestInput, UpdateBloodRequestInput } from "@/types/request";

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
    status: "open",
    additionalNotes: input.additionalNotes?.trim() || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
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
    status: "open",
    additionalNotes: input.additionalNotes?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
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
      status: data.status || "open",
      additionalNotes: data.additionalNotes || undefined,
      createdAt: timestampToIso(data.createdAt),
      updatedAt: timestampToIso(data.updatedAt),
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
    status: data.status || "open",
    additionalNotes: data.additionalNotes || undefined,
    createdAt: timestampToIso(data.createdAt),
    updatedAt: timestampToIso(data.updatedAt),
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
  if (updates.neededAt !== undefined) payload.neededAt = updates.neededAt;
  if (updates.urgency !== undefined) payload.urgency = updates.urgency;
  if (updates.additionalNotes !== undefined) payload.additionalNotes = updates.additionalNotes?.trim() || null;
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
