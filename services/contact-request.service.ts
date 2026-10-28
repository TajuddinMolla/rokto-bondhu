import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

import { getFirebaseDb } from "@/lib/firebase/config";
import {
  dispatchNotificationSafely,
  createInAppNotification,
  getDeterministicNotificationId,
} from "@/services/notification.service";
import type {
  DonorContactRequest,
  CreateContactRequestInput,
  ContactRequestStatus,
  SharedContactDetails,
} from "@/types/contact-request";
import type { BloodGroup, RequestUrgency } from "@/types/blood";

export const DONOR_CONTACT_REQUESTS_COLLECTION = "donorContactRequests";

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

function mapContactRequestDoc(
  id: string,
  data: Record<string, unknown>
): DonorContactRequest {
  let sharedDetails: SharedContactDetails | undefined = undefined;
  if (data.sharedContactDetails && typeof data.sharedContactDetails === "object") {
    const s = data.sharedContactDetails as Record<string, unknown>;
    if (s.phoneNumber) {
      sharedDetails = {
        phoneNumber: String(s.phoneNumber),
        consentedAt: s.consentedAt ? timestampToIso(s.consentedAt) : new Date().toISOString(),
      };
    }
  }

  return {
    id,
    donorId: String(data.donorId || ""),
    requesterId: String(data.requesterId || ""),
    donorName: String(data.donorName || ""),
    donorBloodGroup: (data.donorBloodGroup || "O+") as BloodGroup,
    requesterName: String(data.requesterName || ""),
    requesterPhone: String(data.requesterPhone || ""),
    patientName: data.patientName ? String(data.patientName) : undefined,
    hospitalName: data.hospitalName ? String(data.hospitalName) : undefined,
    urgency: (data.urgency || "normal") as RequestUrgency,
    message: data.message ? String(data.message) : undefined,
    status: (data.status || "PENDING") as ContactRequestStatus,
    donorConsentGiven: Boolean(data.donorConsentGiven),
    sharedContactDetails: sharedDetails,
    createdAt: timestampToIso(data.createdAt),
    updatedAt: timestampToIso(data.updatedAt),
  };
}

/**
 * Checks whether an active contact request (PENDING or ACCEPTED) already exists
 * between a requester and a specific donor to prevent duplicates.
 */
export async function hasActiveContactRequest(
  requesterId: string,
  donorId: string
): Promise<{ hasActive: boolean; existingRequestId?: string }> {
  const db = getFirebaseDb();
  if (!db || !requesterId || !donorId) {
    return { hasActive: false };
  }

  try {
    const colRef = collection(db, DONOR_CONTACT_REQUESTS_COLLECTION);
    const q = query(
      colRef,
      where("requesterId", "==", requesterId),
      where("donorId", "==", donorId)
    );
    const snap = await getDocs(q);

    for (const docSnap of snap.docs) {
      const data = docSnap.data();
      const status = data.status;
      if (status === "PENDING" || status === "ACCEPTED") {
        return { hasActive: true, existingRequestId: docSnap.id };
      }
    }
    return { hasActive: false };
  } catch {
    return { hasActive: false };
  }
}

/**
 * Creates a direct 1-to-1 contact request from an authenticated requester to a private donor.
 * Strictly prevents self-requests and duplicate active requests.
 */
export async function createContactRequest(
  requesterId: string,
  input: CreateContactRequestInput
): Promise<DonorContactRequest> {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error("Firestore is not configured");
  }

  if (requesterId === input.donorId) {
    throw new Error("You cannot send a contact request to yourself");
  }

  const { hasActive } = await hasActiveContactRequest(requesterId, input.donorId);
  if (hasActive) {
    throw new Error("You already have an active contact request with this donor");
  }

  const colRef = collection(db, DONOR_CONTACT_REQUESTS_COLLECTION);
  const newDocRef = doc(colRef);
  const id = newDocRef.id;

  const payload: Record<string, unknown> = {
    donorId: input.donorId,
    requesterId,
    donorName: input.donorName.trim(),
    donorBloodGroup: input.donorBloodGroup,
    requesterName: input.requesterName.trim(),
    requesterPhone: input.requesterPhone.trim(),
    patientName: input.patientName?.trim() || null,
    hospitalName: input.hospitalName?.trim() || null,
    urgency: input.urgency,
    message: input.message?.trim() || null,
    status: "PENDING",
    donorConsentGiven: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(newDocRef, payload);

  // Dispatch background notification & email for the recipient donor
  dispatchNotificationSafely({
    event: "CONTACT_REQUEST_RECEIVED",
    contactRequestId: id,
  }).catch(() => {});

  // Create immediate in-app confirmation notification for the requester
  createInAppNotification({
    id: getDeterministicNotificationId("CONTACT_REQUEST_SUBMITTED", id),
    recipientId: requesterId,
    type: "CONTACT_REQUEST_SUBMITTED",
    title: {
      bn: "অনুরোধ পাঠানো হয়েছে",
      en: "Contact Request Submitted",
    },
    message: {
      bn: `${input.donorName} (${input.donorBloodGroup})-এর কাছে যোগাযোগের অনুরোধ সফলভাবে পাঠানো হয়েছে।`,
      en: `Your contact request to ${input.donorName} (${input.donorBloodGroup}) has been submitted.`,
    },
    relatedContactRequestId: id,
    actionUrl: "/account/contact-requests",
    read: false,
    emailStatus: "NOT_APPLICABLE",
  }).catch(() => {});

  const now = new Date().toISOString();
  return {
    id,
    donorId: input.donorId,
    requesterId,
    donorName: input.donorName.trim(),
    donorBloodGroup: input.donorBloodGroup,
    requesterName: input.requesterName.trim(),
    requesterPhone: input.requesterPhone.trim(),
    patientName: input.patientName?.trim() || undefined,
    hospitalName: input.hospitalName?.trim() || undefined,
    urgency: input.urgency,
    message: input.message?.trim() || undefined,
    status: "PENDING",
    donorConsentGiven: false,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Retrieves all incoming contact requests sent to the specified donor.
 */
export async function getIncomingContactRequests(
  donorId: string
): Promise<DonorContactRequest[]> {
  const db = getFirebaseDb();
  if (!db || !donorId) return [];

  const colRef = collection(db, DONOR_CONTACT_REQUESTS_COLLECTION);
  const q = query(colRef, where("donorId", "==", donorId));
  const snap = await getDocs(q);

  const list = snap.docs.map((docSnap) =>
    mapContactRequestDoc(docSnap.id, docSnap.data())
  );

  // In-memory descending order by creation date
  return list.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Retrieves all outgoing contact requests initiated by the specified requester.
 */
export async function getOutgoingContactRequests(
  requesterId: string
): Promise<DonorContactRequest[]> {
  const db = getFirebaseDb();
  if (!db || !requesterId) return [];

  const colRef = collection(db, DONOR_CONTACT_REQUESTS_COLLECTION);
  const q = query(colRef, where("requesterId", "==", requesterId));
  const snap = await getDocs(q);

  const list = snap.docs.map((docSnap) =>
    mapContactRequestDoc(docSnap.id, docSnap.data())
  );

  return list.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Donor accepts a pending contact request.
 * Does NOT reveal phone number; requires subsequent explicit consent.
 */
export async function acceptContactRequest(
  requestId: string,
  donorId: string
): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firestore is not configured");

  const docRef = doc(db, DONOR_CONTACT_REQUESTS_COLLECTION, requestId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error("Contact request not found");
  if (snap.data().donorId !== donorId) throw new Error("Unauthorized");

  await updateDoc(docRef, {
    status: "ACCEPTED",
    updatedAt: serverTimestamp(),
  });

  dispatchNotificationSafely({
    event: "CONTACT_REQUEST_ACCEPTED",
    contactRequestId: requestId,
  }).catch(() => {});
}

/**
 * Donor declines a pending contact request.
 */
export async function declineContactRequest(
  requestId: string,
  donorId: string
): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firestore is not configured");

  const docRef = doc(db, DONOR_CONTACT_REQUESTS_COLLECTION, requestId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error("Contact request not found");
  if (snap.data().donorId !== donorId) throw new Error("Unauthorized");

  await updateDoc(docRef, {
    status: "DECLINED",
    updatedAt: serverTimestamp(),
  });

  dispatchNotificationSafely({
    event: "CONTACT_REQUEST_DECLINED",
    contactRequestId: requestId,
  }).catch(() => {});
}

/**
 * Requester cancels their pending contact request.
 */
export async function cancelContactRequest(
  requestId: string,
  requesterId: string
): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firestore is not configured");

  const docRef = doc(db, DONOR_CONTACT_REQUESTS_COLLECTION, requestId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error("Contact request not found");
  if (snap.data().requesterId !== requesterId) throw new Error("Unauthorized");
  if (snap.data().status !== "PENDING") {
    throw new Error("Only pending requests can be cancelled");
  }

  await updateDoc(docRef, {
    status: "CANCELLED",
    updatedAt: serverTimestamp(),
  });

  dispatchNotificationSafely({
    event: "CONTACT_REQUEST_CANCELLED",
    contactRequestId: requestId,
  }).catch(() => {});
}

/**
 * Separate, explicit donor consent step to share private contact details with the requester.
 * Attaches the verified donor phone number to `sharedContactDetails`.
 */
export async function shareContactConsent(
  requestId: string,
  donorId: string,
  donorPhoneNumber: string
): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firestore is not configured");

  const docRef = doc(db, DONOR_CONTACT_REQUESTS_COLLECTION, requestId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error("Contact request not found");
  if (snap.data().donorId !== donorId) throw new Error("Unauthorized");
  if (snap.data().status !== "ACCEPTED") {
    throw new Error("Request must be accepted before sharing contact details");
  }

  await updateDoc(docRef, {
    donorConsentGiven: true,
    sharedContactDetails: {
      phoneNumber: donorPhoneNumber.trim(),
      consentedAt: serverTimestamp(),
    },
    updatedAt: serverTimestamp(),
  });

  dispatchNotificationSafely({
    event: "CONTACT_INFO_SHARED",
    contactRequestId: requestId,
  }).catch(() => {});
}

/**
 * Marks an accepted contact request as COMPLETED once communication/donation is finished.
 */
export async function completeContactRequest(
  requestId: string,
  actorId: string
): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firestore is not configured");

  const docRef = doc(db, DONOR_CONTACT_REQUESTS_COLLECTION, requestId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error("Contact request not found");
  const data = snap.data();
  if (data.donorId !== actorId && data.requesterId !== actorId) {
    throw new Error("Unauthorized");
  }

  await updateDoc(docRef, {
    status: "COMPLETED",
    updatedAt: serverTimestamp(),
  });
}
