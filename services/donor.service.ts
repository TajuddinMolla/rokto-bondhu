import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  deleteField,
  writeBatch,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

import { getFirebaseDb } from "@/lib/firebase/config";
import { setUserHasDonorProfile } from "@/services/user.service";
import { calculateDonorEligibility } from "@/lib/utils/donor-eligibility";
import type { DonorProfile, DonorContactMode, DonorUnavailableReason } from "@/types/donor";
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
 * Retrieves the private donor profile for an authenticated user.
 * Returns null if no donor profile exists yet.
 */
export async function getDonorProfile(uid: string): Promise<DonorProfile | null> {
  const db = getFirebaseDb();
  if (!db || !uid) {
    return null;
  }

  const docRef = doc(db, DONOR_PROFILES_COLLECTION, uid);
  const snap = await getDoc(docRef);

  if (!snap.exists()) {
    return null;
  }

  const data = snap.data();
  const contactMode: DonorContactMode =
    data.phoneVisibility || data.contactMode || (data.isPhonePublic ? "PUBLIC" : "PRIVATE");

  const eligibility = calculateDonorEligibility(data.lastDonationDate);
  let effectiveStatus: DonorAvailabilityStatus =
    (data.availabilityStatus as DonorAvailabilityStatus) || "available";
  let effectiveReason: DonorUnavailableReason | null =
    (data.unavailableReason as DonorUnavailableReason) || null;
  let nextEligibleDate = (data.nextEligibleDate as string) || eligibility.nextEligibleDate;

  // Self-heal: If donor has recent lastDonationDate, enforce recovery
  if (!eligibility.isEligible) {
    effectiveStatus = "unavailable";
    effectiveReason = "MEDICAL_RECOVERY";
    nextEligibleDate = eligibility.nextEligibleDate;
  } else if (effectiveReason === "MEDICAL_RECOVERY" && eligibility.isEligible) {
    // 120-day recovery has ended for this donor
    effectiveStatus = "available";
    effectiveReason = null;
    nextEligibleDate = null;
  }

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
    isPhonePublic: contactMode === "PUBLIC",
    contactMode,
    phoneVisibility: contactMode,
    lastDonationDate: eligibility.lastDonationDate || undefined,
    availabilityStatus: effectiveStatus,
    unavailableReason: effectiveReason,
    nextEligibleDate,
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

    const isPublic =
      profile.phoneVisibility === "PUBLIC" ||
      profile.contactMode === "PUBLIC" ||
      Boolean(profile.isPhonePublic);
    const contactMode: DonorContactMode = isPublic ? "PUBLIC" : "PRIVATE";

    const publicPayload: Record<string, unknown> = {
      displayName: profile.displayName || "",
      bloodGroup: profile.bloodGroup,
      divisionId: profile.divisionId,
      districtId: profile.districtId,
      upazilaId: profile.upazilaId,
      availabilityStatus: profile.availabilityStatus || "available",
      unavailableReason: profile.unavailableReason || null,
      nextEligibleDate: profile.nextEligibleDate || null,
      lastDonationDate: profile.lastDonationDate || null,
      contactMode,
      phoneVisibility: contactMode,
      updatedAt: serverTimestamp(),
    };

    if (isPublic) {
      publicPayload.phoneNumber = profile.phoneNumber;
    }

    await setDoc(publicDocRef, publicPayload, { merge: true });
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

  const isPublic =
    (input as Record<string, unknown>).phoneVisibility === "PUBLIC" ||
    input.contactMode === "PUBLIC" ||
    Boolean(input.isPhonePublic);
  const contactMode: DonorContactMode = isPublic ? "PUBLIC" : "PRIVATE";

  // Calculate medical eligibility from lastDonationDate
  const eligibility = calculateDonorEligibility(input.lastDonationDate);

  let finalStatus: DonorAvailabilityStatus = "available";
  let unavailableReason: DonorUnavailableReason | null = null;
  let nextEligibleDate: string | null = null;

  if (!eligibility.isEligible) {
    // In mandatory 120-day recovery period
    finalStatus = "unavailable";
    unavailableReason = "MEDICAL_RECOVERY";
    nextEligibleDate = eligibility.nextEligibleDate;
  } else if (input.availabilityStatus === "unavailable") {
    // Medically eligible, but explicitly paused by donor preference
    finalStatus = "unavailable";
    unavailableReason = "MANUAL_PAUSE";
    nextEligibleDate = null;
  } else {
    // Medically eligible and available
    finalStatus = "available";
    unavailableReason = null;
    nextEligibleDate = null;
  }

  const payload: Record<string, unknown> = {
    userId: uid,
    displayName: input.displayName.trim(),
    bloodGroup: input.bloodGroup,
    phoneNumber: input.phoneNumber.trim(),
    isPhonePublic: isPublic,
    contactMode,
    phoneVisibility: contactMode,
    divisionId: input.divisionId,
    districtId: input.districtId,
    upazilaId: input.upazilaId,
    area: input.area?.trim() || null,
    lastDonationDate: eligibility.lastDonationDate,
    availabilityStatus: finalStatus,
    unavailableReason,
    nextEligibleDate,
    updatedAt: serverTimestamp(),
  };

  if (isNew || !existing.data()?.createdAt) {
    payload.createdAt = serverTimestamp();
  }

  // Dual-write: private profile & public projection
  const publicPayload: Record<string, unknown> = {
    displayName: input.displayName.trim(),
    bloodGroup: input.bloodGroup,
    divisionId: input.divisionId,
    districtId: input.districtId,
    upazilaId: input.upazilaId,
    availabilityStatus: finalStatus,
    unavailableReason,
    nextEligibleDate,
    lastDonationDate: eligibility.lastDonationDate,
    contactMode,
    phoneVisibility: contactMode,
    updatedAt: serverTimestamp(),
  };

  if (isPublic) {
    publicPayload.phoneNumber = input.phoneNumber.trim();
  } else {
    publicPayload.phoneNumber = deleteField();
  }

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
  const createdAtValue =
    isNew || !existing.data()?.createdAt
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
    isPhonePublic: isPublic,
    contactMode,
    lastDonationDate: eligibility.lastDonationDate || undefined,
    availabilityStatus: finalStatus,
    unavailableReason,
    nextEligibleDate,
    createdAt: createdAtValue,
    updatedAt: now,
  };
}

/**
 * Updates a donor's availability status across both private and public records.
 * Protects donors in the mandatory 120-day recovery cooldown from prematurely becoming available.
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

  // Validate recovery period before allowing availability transition
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    const data = snap.data();
    const eligibility = calculateDonorEligibility(data.lastDonationDate);
    if (status === "available" && !eligibility.isEligible) {
      const remainingDays = eligibility.daysRemaining;
      const nextDate = eligibility.nextEligibleDate;
      throw new Error(
        `রক্তদানের ১২০ দিনের বিরতি চলমান রয়েছে। আপনি ${nextDate || ""} (আরও ${remainingDays} দিন পর) রক্তদানে প্রস্তুত হতে পারবেন।`
      );
    }
  }

  const unavailableReason: DonorUnavailableReason | null =
    status === "unavailable" ? "MANUAL_PAUSE" : null;

  const updates: Record<string, unknown> = {
    availabilityStatus: status,
    unavailableReason,
    nextEligibleDate: null,
    updatedAt: serverTimestamp(),
  };

  await Promise.all([
    updateDoc(docRef, updates),
    setDoc(publicDocRef, updates, { merge: true }).catch(() => {
      // Non-fatal if public doc write experiences temporary network race
    }),
  ]);
}

/**
 * Updates a donor's contact privacy mode (PUBLIC vs PRIVATE).
 * When mode is PUBLIC, publishes phone number to public card.
 * When mode is PRIVATE, immediately removes phone number from public card.
 */
export async function updateDonorContactMode(
  uid: string,
  mode: DonorContactMode
): Promise<void> {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error("Firestore is not configured");
  }

  const docRef = doc(db, DONOR_PROFILES_COLLECTION, uid);
  const publicDocRef = doc(db, PUBLIC_DONOR_PROFILES_COLLECTION, uid);

  const existingSnap = await getDoc(docRef);
  if (!existingSnap.exists()) {
    throw new Error("Donor profile not found");
  }

  const existingData = existingSnap.data() || {};
  const isPublic = mode === "PUBLIC";

  const privateUpdates: Record<string, unknown> = {
    userId: uid,
    contactMode: mode,
    phoneVisibility: mode,
    isPhonePublic: isPublic,
    updatedAt: serverTimestamp(),
  };

  const publicUpdates: Record<string, unknown> = {
    userId: uid,
    contactMode: mode,
    phoneVisibility: mode,
    updatedAt: serverTimestamp(),
  };

  // Ensure public projection retains vital donor discovery attributes
  if (existingData.displayName) publicUpdates.displayName = existingData.displayName;
  if (existingData.bloodGroup) publicUpdates.bloodGroup = existingData.bloodGroup;
  if (existingData.divisionId) publicUpdates.divisionId = existingData.divisionId;
  if (existingData.districtId) publicUpdates.districtId = existingData.districtId;
  if (existingData.upazilaId) publicUpdates.upazilaId = existingData.upazilaId;
  if (existingData.availabilityStatus) publicUpdates.availabilityStatus = existingData.availabilityStatus;
  if (existingData.area) publicUpdates.area = existingData.area;

  if (isPublic) {
    publicUpdates.phoneNumber = existingData.phoneNumber || "";
  } else {
    publicUpdates.phoneNumber = deleteField();
  }

  const batch = writeBatch(db);
  batch.set(docRef, privateUpdates, { merge: true });
  batch.set(publicDocRef, publicUpdates, { merge: true });
  await batch.commit();
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
