import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

import { getFirebaseDb } from "@/lib/firebase/config";
import type { UserProfile, UpdateUserProfileInput } from "@/types/user";

const USERS_COLLECTION = "users";

function timestampToIso(value: unknown): string | undefined {
  if (!value) return undefined;
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  if (typeof value === "string") {
    return value;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  return undefined;
}

/**
 * Retrieves a user profile document from Firestore by user UID.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const db = getFirebaseDb();
  if (!db || !uid) return null;

  const docRef = doc(db, USERS_COLLECTION, uid);
  const snap = await getDoc(docRef);

  if (!snap.exists()) {
    return null;
  }

  const data = snap.data();
  return {
    uid: snap.id,
    displayName: data.displayName || "",
    email: data.email || "",
    phoneNumber: data.phoneNumber || undefined,
    emailVerified: Boolean(data.emailVerified),
    hasDonorProfile: Boolean(data.hasDonorProfile),
    createdAt: timestampToIso(data.createdAt),
    updatedAt: timestampToIso(data.updatedAt),
  };
}

/**
 * Idempotently ensures that a Firestore user profile exists.
 * If the profile does not exist, it creates it using `setDoc` with `merge: true`.
 * This provides self-healing behavior against registration network partial-failures.
 */
export async function ensureUserProfile(user: {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  phoneNumber?: string | null;
  emailVerified?: boolean;
}): Promise<UserProfile> {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error("Firestore is not configured");
  }

  const docRef = doc(db, USERS_COLLECTION, user.uid);
  const existing = await getDoc(docRef);

  if (existing.exists()) {
    const data = existing.data();
    // Keep emailVerified in sync if changed in Auth
    if (user.emailVerified !== undefined && data.emailVerified !== user.emailVerified) {
      await updateDoc(docRef, {
        emailVerified: user.emailVerified,
        updatedAt: serverTimestamp(),
      });
    }

    return {
      uid: existing.id,
      displayName: data.displayName || user.displayName || "",
      email: data.email || user.email || "",
      phoneNumber: data.phoneNumber || user.phoneNumber || undefined,
      emailVerified: Boolean(user.emailVerified ?? data.emailVerified),
      hasDonorProfile: Boolean(data.hasDonorProfile),
      createdAt: timestampToIso(data.createdAt),
      updatedAt: timestampToIso(data.updatedAt),
    };
  }

  // Create initial user profile
  const newProfileData = {
    uid: user.uid,
    displayName: user.displayName || "",
    email: user.email || "",
    phoneNumber: user.phoneNumber || null,
    emailVerified: Boolean(user.emailVerified),
    hasDonorProfile: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(docRef, newProfileData, { merge: true });

  return {
    uid: user.uid,
    displayName: user.displayName || "",
    email: user.email || "",
    phoneNumber: user.phoneNumber || undefined,
    emailVerified: Boolean(user.emailVerified),
    hasDonorProfile: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Updates editable account fields for the user.
 */
export async function updateUserProfile(
  uid: string,
  data: UpdateUserProfileInput
): Promise<void> {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error("Firestore is not configured");
  }

  const docRef = doc(db, USERS_COLLECTION, uid);
  const updatePayload: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (data.displayName !== undefined) {
    updatePayload.displayName = data.displayName.trim();
  }
  if (data.phoneNumber !== undefined) {
    updatePayload.phoneNumber = data.phoneNumber.trim() || null;
  }

  await updateDoc(docRef, updatePayload);
}

/**
 * Sets the `hasDonorProfile` flag on the user document.
 */
export async function setUserHasDonorProfile(
  uid: string,
  hasDonorProfile: boolean
): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;

  const docRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(docRef, {
    hasDonorProfile,
    updatedAt: serverTimestamp(),
  });
}
