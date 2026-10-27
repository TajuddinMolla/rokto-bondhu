import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

import { getFirebaseDb } from "@/lib/firebase/config";
import { setUserHasDonorProfile } from "@/services/user.service";
import type { DonorProfile } from "@/types/donor";
import type { DonorAvailabilityStatus } from "@/types/blood";
import type { DonorInput } from "@/lib/validations/donor";

export const DONOR_PROFILES_COLLECTION = "donorProfiles";
export const PUBLIC_DONOR_PROFILES_COLLECTION = "publicDonorProfiles";

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
 * Retrieves the donor profile for an authenticated user.
 */
export async function getDonorProfile(uid: string): Promise<DonorProfile | null> {
  const db = getFirebaseDb();
  if (!db || !uid) return null;

  const docRef = doc(db, DONOR_PROFILES_COLLECTION, uid);
  const snap = await getDoc(docRef);

  if (!snap.exists()) {
    return null;
  }

  const data = snap.data();
  const profile: DonorProfile = {
    id: snap.id,
    userId: snap.id,
    displayName: data.displayName || "",
    bloodGroup: data.bloodGroup,
    divisionId: data.divisionId,
    districtId: data.districtId,
    upazilaId: data.upazilaId,
    area: data.area || undefined,
    phoneNumber: data.phoneNumber,
    isPhonePublic: Boolean(data.isPhonePublic),
    lastDonationDate: data.lastDonationDate || undefined,
    availabilityStatus: data.availabilityStatus as DonorAvailabilityStatus,
    createdAt: timestampToIso(data.createdAt),
    updatedAt: timestampToIso(data.updatedAt),
  };

  // Self-heal: ensure public projection exists for search discovery
  ensurePublicDonorProfile(uid, profile).catch(() => {});

  return profile;
}

/**
 * Idempotently ensures that an authenticated user's public donor profile exists
 * if they have an active private donor profile.
 */
export async function ensurePublicDonorProfile(
  uid: string,
  existingProfile?: DonorProfile | null
): Promise<void> {
  const db = getFirebaseDb();
  if (!db || !uid) return;

  try {
    const publicDocRef = doc(db, PUBLIC_DONOR_PROFILES_COLLECTION, uid);
    const publicSnap = await getDoc(publicDocRef);
    if (publicSnap.exists()) return;

    let profile = existingProfile;
    if (!profile) {
      profile = await getDonorProfile(uid);
    }
    if (!profile) return;

    await setDoc(
      publicDocRef,
      {
        displayName: profile.displayName || "",
        bloodGroup: profile.bloodGroup,
        divisionId: profile.divisionId,
        districtId: profile.districtId,
        upazilaId: profile.upazilaId,
        availabilityStatus: profile.availabilityStatus || "available",
        lastDonationDate: profile.lastDonationDate || null,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch {
    // Non-fatal if offline
  }
}

/**
 * Creates or updates the donor profile for an authenticated user.
 * Document ID strictly matches the user UID to guarantee 1:1 uniqueness.
 * Synchronizes a public-safe representation to `publicDonorProfiles/{uid}`.
 */
export async function upsertDonorProfile(
  uid: string,
  input: DonorInput
): Promise<DonorProfile> {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error("Firestore is not configured");
  }

  const docRef = doc(db, DONOR_PROFILES_COLLECTION, uid);
  const publicDocRef = doc(db, PUBLIC_DONOR_PROFILES_COLLECTION, uid);
  const existing = await getDoc(docRef);
  const isNew = !existing.exists();

  const payload: Record<string, unknown> = {
    userId: uid,
    displayName: input.displayName.trim(),
    bloodGroup: input.bloodGroup,
    phoneNumber: input.phoneNumber.trim(),
    isPhonePublic: Boolean(input.isPhonePublic),
    divisionId: input.divisionId,
    districtId: input.districtId,
    upazilaId: input.upazilaId,
    area: input.area?.trim() || null,
    lastDonationDate: input.lastDonationDate?.trim() || null,
    availabilityStatus: input.availabilityStatus || "available",
    updatedAt: serverTimestamp(),
  };

  if (isNew || !existing.data()?.createdAt) {
    payload.createdAt = serverTimestamp();
  }

  // Dual-write: private profile & public projection without phone/area
  const publicPayload: Record<string, unknown> = {
    displayName: input.displayName.trim(),
    bloodGroup: input.bloodGroup,
    divisionId: input.divisionId,
    districtId: input.districtId,
    upazilaId: input.upazilaId,
    availabilityStatus: input.availabilityStatus || "available",
    lastDonationDate: input.lastDonationDate?.trim() || null,
    updatedAt: serverTimestamp(),
  };

  await Promise.all([
    setDoc(docRef, payload, { merge: true }),
    setDoc(publicDocRef, publicPayload, { merge: true }),
  ]);

  // Update hasDonorProfile flag on user document
  try {
    await setUserHasDonorProfile(uid, true);
  } catch {
    // Non-fatal if user doc update is throttled
  }

  const now = new Date().toISOString();
  const createdAtValue = isNew || !existing.data()?.createdAt
    ? now
    : timestampToIso(existing.data()?.createdAt);

  return {
    id: uid,
    userId: uid,
    displayName: input.displayName.trim(),
    bloodGroup: input.bloodGroup,
    divisionId: input.divisionId,
    districtId: input.districtId,
    upazilaId: input.upazilaId,
    area: input.area?.trim() || undefined,
    phoneNumber: input.phoneNumber.trim(),
    isPhonePublic: Boolean(input.isPhonePublic),
    lastDonationDate: input.lastDonationDate?.trim() || undefined,
    availabilityStatus: input.availabilityStatus || "available",
    createdAt: createdAtValue,
    updatedAt: now,
  };
}

/**
 * Updates a donor's availability status across both private and public records.
 */
export async function updateDonorAvailability(
  uid: string,
  status: DonorAvailabilityStatus
): Promise<void> {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error("Firestore is not configured");
  }

  const docRef = doc(db, DONOR_PROFILES_COLLECTION, uid);
  const publicDocRef = doc(db, PUBLIC_DONOR_PROFILES_COLLECTION, uid);

  await Promise.all([
    updateDoc(docRef, {
      availabilityStatus: status,
      updatedAt: serverTimestamp(),
    }),
    setDoc(
      publicDocRef,
      {
        availabilityStatus: status,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    ).catch(() => {
      // Non-fatal if public doc write experiences temporary network race
    }),
  ]);
}

/**
 * Deletes a donor profile and its public projection.
 */
export async function deleteDonorProfile(uid: string): Promise<void> {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error("Firestore is not configured");
  }

  const docRef = doc(db, DONOR_PROFILES_COLLECTION, uid);
  const publicDocRef = doc(db, PUBLIC_DONOR_PROFILES_COLLECTION, uid);

  await Promise.all([
    deleteDoc(docRef),
    deleteDoc(publicDocRef).catch(() => {}),
  ]);

  try {
    await setUserHasDonorProfile(uid, false);
  } catch {
    // Non-fatal
  }
}

