import {
  collection,
  doc,
  getDocs,
  query,
  where,
  limit,
  startAfter,
  writeBatch,
  serverTimestamp,
  Timestamp,
  getCountFromServer,
  type DocumentSnapshot,
  type QueryConstraint,
  deleteField,
} from "firebase/firestore";

import { getFirebaseDb } from "@/lib/firebase/config";
import {
  DONOR_PROFILES_COLLECTION,
  PUBLIC_DONOR_PROFILES_COLLECTION,
} from "@/services/donor.service";
import { createInAppNotification } from "@/services/notification.service";
import type {
  AdminDashboardStats,
  AuditLogEntry,
  AuditActionType,
  UserReport,
  PaginatedAdminResult,
  ResolveReportInput,
} from "@/types/admin";
import type { DonorProfile } from "@/types/donor";
import type { BloodRequest } from "@/types/request";
import type { UserProfile } from "@/types/user";
import type { BloodGroup, RequestStatus } from "@/types/blood";

export const AUDIT_LOGS_COLLECTION = "auditLogs";
export const REPORTS_COLLECTION = "reports";
export const USERS_COLLECTION = "users";
export const BLOOD_REQUESTS_COLLECTION = "bloodRequests";

export const ADMIN_PAGE_SIZE = 20;

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
 * Retrieves real Firestore aggregation metrics for the admin dashboard.
 * Zero fake numbers: each stat is retrieved from real document collections.
 */
export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const db = getFirebaseDb();
  if (!db) {
    return {
      totalUsers: 0,
      activeDonors: 0,
      publicDonors: 0,
      privateDonors: 0,
      openRequests: 0,
      pendingReports: 0,
      recentAuditCount: 0,
    };
  }

  const [
    usersSnap,
    donorsSnap,
    publicDonorsSnap,
    privateDonorsSnap,
    openReqSnap,
    pendingReportsSnap,
    auditCountSnap,
  ] = await Promise.all([
    getCountFromServer(collection(db, USERS_COLLECTION)).catch(() => ({
      data: () => ({ count: 0 }),
    })),
    getCountFromServer(collection(db, DONOR_PROFILES_COLLECTION)).catch(() => ({
      data: () => ({ count: 0 }),
    })),
    getCountFromServer(
      query(
        collection(db, PUBLIC_DONOR_PROFILES_COLLECTION),
        where("contactMode", "==", "PUBLIC"),
      ),
    ).catch(() => ({ data: () => ({ count: 0 }) })),
    getCountFromServer(
      query(
        collection(db, PUBLIC_DONOR_PROFILES_COLLECTION),
        where("contactMode", "==", "PRIVATE"),
      ),
    ).catch(() => ({ data: () => ({ count: 0 }) })),
    getCountFromServer(
      query(
        collection(db, BLOOD_REQUESTS_COLLECTION),
        where("status", "==", "open"),
      ),
    ).catch(() => ({ data: () => ({ count: 0 }) })),
    getCountFromServer(
      query(
        collection(db, REPORTS_COLLECTION),
        where("status", "==", "PENDING"),
      ),
    ).catch(() => ({ data: () => ({ count: 0 }) })),
    getCountFromServer(collection(db, AUDIT_LOGS_COLLECTION)).catch(() => ({
      data: () => ({ count: 0 }),
    })),
  ]);

  return {
    totalUsers: usersSnap.data().count,
    activeDonors: donorsSnap.data().count,
    publicDonors: publicDonorsSnap.data().count,
    privateDonors: privateDonorsSnap.data().count,
    openRequests: openReqSnap.data().count,
    pendingReports: pendingReportsSnap.data().count,
    recentAuditCount: auditCountSnap.data().count,
  };
}

/**
 * Retrieves paginated donor profiles for admin moderation.
 */
export async function getAdminDonors(options: {
  pageSize?: number;
  cursorDoc?: DocumentSnapshot | null;
  bloodGroup?: BloodGroup | string;
  statusFilter?: "ALL" | "ACTIVE" | "SUSPENDED";
}): Promise<PaginatedAdminResult<DonorProfile>> {
  const db = getFirebaseDb();
  if (!db) return { items: [], nextCursorDoc: null, hasMore: false };

  const pageSize = options.pageSize || ADMIN_PAGE_SIZE;
  const colRef = collection(db, DONOR_PROFILES_COLLECTION);
  const constraints: QueryConstraint[] = [];

  if (options.bloodGroup && options.bloodGroup !== "ALL") {
    constraints.push(where("bloodGroup", "==", options.bloodGroup));
  }
  if (options.statusFilter === "ACTIVE") {
    constraints.push(where("isSuspended", "!=", true));
  } else if (options.statusFilter === "SUSPENDED") {
    constraints.push(where("isSuspended", "==", true));
  }

  constraints.push(limit(pageSize + 1));
  if (options.cursorDoc) {
    constraints.push(startAfter(options.cursorDoc));
  }

  const q = query(colRef, ...constraints);
  const snap = await getDocs(q);

  const docs = snap.docs;
  const hasMore = docs.length > pageSize;
  const resultDocs = hasMore ? docs.slice(0, pageSize) : docs;
  const nextCursorDoc = hasMore ? resultDocs[resultDocs.length - 1] : null;

  const items: DonorProfile[] = resultDocs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      userId: data.userId || d.id,
      displayName: data.displayName || "",
      bloodGroup: data.bloodGroup,
      divisionId: data.divisionId,
      districtId: data.districtId,
      upazilaId: data.upazilaId,
      area: data.area || undefined,
      phoneNumber: data.phoneNumber || "",
      isPhonePublic: Boolean(data.isPhonePublic),
      contactMode:
        data.contactMode || (data.isPhonePublic ? "PUBLIC" : "PRIVATE"),
      lastDonationDate: data.lastDonationDate || undefined,
      availabilityStatus: data.availabilityStatus || "available",
      isSuspended: Boolean(data.isSuspended),
      suspendedAt: data.suspendedAt
        ? timestampToIso(data.suspendedAt)
        : undefined,
      suspendedReason: data.suspendedReason || undefined,
      createdAt: timestampToIso(data.createdAt),
      updatedAt: timestampToIso(data.updatedAt),
    };
  });

  return { items, nextCursorDoc, hasMore };
}

/**
 * Retrieves paginated blood requests for admin moderation.
 */
export async function getAdminRequests(options: {
  pageSize?: number;
  cursorDoc?: DocumentSnapshot | null;
  status?: RequestStatus | string;
}): Promise<PaginatedAdminResult<BloodRequest>> {
  const db = getFirebaseDb();
  if (!db) return { items: [], nextCursorDoc: null, hasMore: false };

  const pageSize = options.pageSize || ADMIN_PAGE_SIZE;
  const colRef = collection(db, BLOOD_REQUESTS_COLLECTION);
  const constraints: QueryConstraint[] = [];

  if (options.status && options.status !== "ALL") {
    constraints.push(where("status", "==", options.status));
  }

  constraints.push(limit(pageSize + 1));
  if (options.cursorDoc) {
    constraints.push(startAfter(options.cursorDoc));
  }

  const q = query(colRef, ...constraints);
  const snap = await getDocs(q);

  const docs = snap.docs;
  const hasMore = docs.length > pageSize;
  const resultDocs = hasMore ? docs.slice(0, pageSize) : docs;
  const nextCursorDoc = hasMore ? resultDocs[resultDocs.length - 1] : null;

  const items: BloodRequest[] = resultDocs.map((d) => {
    const data = d.data();
    return {
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
      hiddenReason: data.hiddenReason || undefined,
      moderatedAt: data.moderatedAt
        ? timestampToIso(data.moderatedAt)
        : undefined,
      moderatedBy: data.moderatedBy || undefined,
      createdAt: timestampToIso(data.createdAt),
      updatedAt: timestampToIso(data.updatedAt),
    };
  });

  return { items, nextCursorDoc, hasMore };
}

/**
 * Retrieves paginated user profiles for admin moderation.
 */
export async function getAdminUsers(options: {
  pageSize?: number;
  cursorDoc?: DocumentSnapshot | null;
  isSuspended?: boolean;
}): Promise<PaginatedAdminResult<UserProfile>> {
  const db = getFirebaseDb();
  if (!db) return { items: [], nextCursorDoc: null, hasMore: false };

  const pageSize = options.pageSize || ADMIN_PAGE_SIZE;
  const colRef = collection(db, USERS_COLLECTION);
  const constraints: QueryConstraint[] = [];

  if (options.isSuspended !== undefined) {
    constraints.push(where("isSuspended", "==", options.isSuspended));
  }

  constraints.push(limit(pageSize + 1));
  if (options.cursorDoc) {
    constraints.push(startAfter(options.cursorDoc));
  }

  const q = query(colRef, ...constraints);
  const snap = await getDocs(q);

  const docs = snap.docs;
  const hasMore = docs.length > pageSize;
  const resultDocs = hasMore ? docs.slice(0, pageSize) : docs;
  const nextCursorDoc = hasMore ? resultDocs[resultDocs.length - 1] : null;

  const items: UserProfile[] = resultDocs.map((d) => {
    const data = d.data();
    return {
      uid: d.id,
      displayName: data.displayName || "",
      email: data.email || "",
      phoneNumber: data.phoneNumber || undefined,
      emailVerified: Boolean(data.emailVerified),
      hasDonorProfile: Boolean(data.hasDonorProfile),
      emailNotificationsEnabled: data.emailNotificationsEnabled !== false,
      role: data.role || "user",
      isSuspended: Boolean(data.isSuspended),
      suspendedAt: data.suspendedAt
        ? timestampToIso(data.suspendedAt)
        : undefined,
      suspendedReason: data.suspendedReason || undefined,
      createdAt: timestampToIso(data.createdAt),
      updatedAt: timestampToIso(data.updatedAt),
    };
  });

  return { items, nextCursorDoc, hasMore };
}

/**
 * Retrieves paginated reports for moderation resolution.
 */
export async function getAdminReports(options: {
  pageSize?: number;
  cursorDoc?: DocumentSnapshot | null;
  status?: string;
}): Promise<PaginatedAdminResult<UserReport>> {
  const db = getFirebaseDb();
  if (!db) return { items: [], nextCursorDoc: null, hasMore: false };

  const pageSize = options.pageSize || ADMIN_PAGE_SIZE;
  const colRef = collection(db, REPORTS_COLLECTION);
  const constraints: QueryConstraint[] = [];

  if (options.status && options.status !== "ALL") {
    constraints.push(where("status", "==", options.status));
  }

  constraints.push(limit(pageSize + 1));
  if (options.cursorDoc) {
    constraints.push(startAfter(options.cursorDoc));
  }

  const q = query(colRef, ...constraints);
  const snap = await getDocs(q);

  const docs = snap.docs;
  const hasMore = docs.length > pageSize;
  const resultDocs = hasMore ? docs.slice(0, pageSize) : docs;
  const nextCursorDoc = hasMore ? resultDocs[resultDocs.length - 1] : null;

  const items: UserReport[] = resultDocs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      reporterId: data.reporterId || "",
      reporterEmail: data.reporterEmail || undefined,
      targetType: data.targetType,
      targetId: data.targetId,
      targetTitle: data.targetTitle || undefined,
      reason: data.reason,
      description: data.description || undefined,
      status: data.status,
      resolutionNotes: data.resolutionNotes || undefined,
      resolvedBy: data.resolvedBy || undefined,
      resolvedAt: data.resolvedAt ? timestampToIso(data.resolvedAt) : undefined,
      createdAt: timestampToIso(data.createdAt),
      updatedAt: timestampToIso(data.updatedAt),
    };
  });

  return { items, nextCursorDoc, hasMore };
}

/**
 * Retrieves paginated audit log history.
 */
export async function getAdminAuditLogs(options: {
  pageSize?: number;
  cursorDoc?: DocumentSnapshot | null;
  targetType?: string;
}): Promise<PaginatedAdminResult<AuditLogEntry>> {
  const db = getFirebaseDb();
  if (!db) return { items: [], nextCursorDoc: null, hasMore: false };

  const pageSize = options.pageSize || ADMIN_PAGE_SIZE;
  const colRef = collection(db, AUDIT_LOGS_COLLECTION);
  const constraints: QueryConstraint[] = [];

  if (options.targetType && options.targetType !== "ALL") {
    constraints.push(where("targetType", "==", options.targetType));
  }

  constraints.push(limit(pageSize + 1));
  if (options.cursorDoc) {
    constraints.push(startAfter(options.cursorDoc));
  }

  const q = query(colRef, ...constraints);
  const snap = await getDocs(q);

  const docs = snap.docs;
  const hasMore = docs.length > pageSize;
  const resultDocs = hasMore ? docs.slice(0, pageSize) : docs;
  const nextCursorDoc = hasMore ? resultDocs[resultDocs.length - 1] : null;

  const items: AuditLogEntry[] = resultDocs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      adminId: data.adminId || "",
      adminEmail: data.adminEmail || "",
      action: data.action as AuditActionType,
      targetType: data.targetType,
      targetId: data.targetId,
      targetTitle: data.targetTitle || undefined,
      reason: data.reason || "",
      metadata: data.metadata || undefined,
      createdAt: timestampToIso(data.createdAt),
    };
  });

  // Client sort if unindexed
  items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return { items, nextCursorDoc, hasMore };
}

// -------------------------------------------------------------
// Moderation Action Implementations (Atomic Batch + Audit Log)
// -------------------------------------------------------------

interface AdminOperator {
  uid: string;
  email: string | null;
}

/**
 * Suspends a donor profile and removes/hides their public card from search.
 */
export async function suspendDonor(
  admin: AdminOperator,
  input: { donorId: string; donorName?: string; reason: string },
): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firestore is not configured");

  const donorDocRef = doc(db, DONOR_PROFILES_COLLECTION, input.donorId);
  const publicDocRef = doc(db, PUBLIC_DONOR_PROFILES_COLLECTION, input.donorId);
  const auditDocRef = doc(collection(db, AUDIT_LOGS_COLLECTION));

  const batch = writeBatch(db);

  batch.update(donorDocRef, {
    isSuspended: true,
    suspendedReason: input.reason.trim(),
    suspendedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  batch.update(publicDocRef, {
    isSuspended: true,
    updatedAt: serverTimestamp(),
  });

  batch.set(auditDocRef, {
    adminId: admin.uid,
    adminEmail: admin.email || "",
    action: "DONOR_SUSPEND",
    targetType: "DONOR",
    targetId: input.donorId,
    targetTitle: input.donorName || null,
    reason: input.reason.trim(),
    createdAt: serverTimestamp(),
  });

  await batch.commit();

  // Send in-app notification to donor
  createInAppNotification({
    recipientId: input.donorId,
    type: "MODERATION_NOTICE",
    title: {
      bn: "আপনার রক্তদাতা প্রোফাইল স্থগিত করা হয়েছে",
      en: "Your donor profile has been suspended",
    },
    message: {
      bn: `মডারেশনের কারণে আপনার রক্তদাতা প্রোফাইল সাময়িকভাবে স্থগিত করা হয়েছে। কারণ: ${input.reason}`,
      en: `Your donor profile was suspended due to moderation. Reason: ${input.reason}`,
    },
    actionUrl: "/account",
    read: false,
    emailStatus: "NOT_APPLICABLE",
  }).catch(() => {});
}

/**
 * Restores a suspended donor profile and reactivates their public projection.
 */
export async function restoreDonor(
  admin: AdminOperator,
  input: { donorId: string; donorName?: string; reason: string },
): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firestore is not configured");

  const donorDocRef = doc(db, DONOR_PROFILES_COLLECTION, input.donorId);
  const publicDocRef = doc(db, PUBLIC_DONOR_PROFILES_COLLECTION, input.donorId);
  const auditDocRef = doc(collection(db, AUDIT_LOGS_COLLECTION));

  const batch = writeBatch(db);

  batch.update(donorDocRef, {
    isSuspended: false,
    suspendedReason: deleteField(),
    suspendedAt: deleteField(),
    updatedAt: serverTimestamp(),
  });

  batch.update(publicDocRef, {
    isSuspended: false,
    updatedAt: serverTimestamp(),
  });

  batch.set(auditDocRef, {
    adminId: admin.uid,
    adminEmail: admin.email || "",
    action: "DONOR_RESTORE",
    targetType: "DONOR",
    targetId: input.donorId,
    targetTitle: input.donorName || null,
    reason: input.reason.trim(),
    createdAt: serverTimestamp(),
  });

  await batch.commit();

  createInAppNotification({
    recipientId: input.donorId,
    type: "MODERATION_NOTICE",
    title: {
      bn: "আপনার রক্তদাতা প্রোফাইল পুনরায় সক্রিয় করা হয়েছে",
      en: "Your donor profile has been restored",
    },
    message: {
      bn: "পর্যালোচনার পর আপনার রক্তদাতা প্রোফাইল পুনরায় সক্রিয় করা হয়েছে।",
      en: "Your donor profile has been restored following review.",
    },
    actionUrl: "/account",
    read: false,
    emailStatus: "NOT_APPLICABLE",
  }).catch(() => {});
}

/**
 * Privatizes a donor's contact mode, stripping their public phone number.
 */
export async function privatizeDonorPhone(
  admin: AdminOperator,
  input: { donorId: string; donorName?: string; reason: string },
): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firestore is not configured");

  const donorDocRef = doc(db, DONOR_PROFILES_COLLECTION, input.donorId);
  const publicDocRef = doc(db, PUBLIC_DONOR_PROFILES_COLLECTION, input.donorId);
  const auditDocRef = doc(collection(db, AUDIT_LOGS_COLLECTION));

  const batch = writeBatch(db);

  batch.update(donorDocRef, {
    contactMode: "PRIVATE",
    isPhonePublic: false,
    updatedAt: serverTimestamp(),
  });

  batch.update(publicDocRef, {
    contactMode: "PRIVATE",
    phoneNumber: deleteField(),
    updatedAt: serverTimestamp(),
  });

  batch.set(auditDocRef, {
    adminId: admin.uid,
    adminEmail: admin.email || "",
    action: "DONOR_PHONE_PRIVATIZE",
    targetType: "DONOR",
    targetId: input.donorId,
    targetTitle: input.donorName || null,
    reason: input.reason.trim(),
    createdAt: serverTimestamp(),
  });

  await batch.commit();
}

/**
 * Hides a problematic or abusive blood request from public listings.
 */
export async function hideBloodRequest(
  admin: AdminOperator,
  input: {
    requestId: string;
    requesterId: string;
    requesterName?: string;
    reason: string;
  },
): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firestore is not configured");

  const reqDocRef = doc(db, BLOOD_REQUESTS_COLLECTION, input.requestId);
  const auditDocRef = doc(collection(db, AUDIT_LOGS_COLLECTION));

  const batch = writeBatch(db);

  batch.update(reqDocRef, {
    status: "hidden",
    hiddenReason: input.reason.trim(),
    moderatedAt: serverTimestamp(),
    moderatedBy: admin.uid,
    updatedAt: serverTimestamp(),
  });

  batch.set(auditDocRef, {
    adminId: admin.uid,
    adminEmail: admin.email || "",
    action: "REQUEST_HIDE",
    targetType: "BLOOD_REQUEST",
    targetId: input.requestId,
    targetTitle: input.requesterName || null,
    reason: input.reason.trim(),
    createdAt: serverTimestamp(),
  });

  await batch.commit();

  if (input.requesterId) {
    createInAppNotification({
      recipientId: input.requesterId,
      type: "MODERATION_NOTICE",
      title: {
        bn: "আপনার রক্তের অনুরোধ লুকানো হয়েছে",
        en: "Your blood request has been hidden",
      },
      message: {
        bn: `মডারেশনের কারণে আপনার রক্তের অনুরোধ প্রকাশনা বন্ধ করা হয়েছে। কারণ: ${input.reason}`,
        en: `Your blood request has been hidden by moderation. Reason: ${input.reason}`,
      },
      actionUrl: "/account",
      read: false,
      emailStatus: "NOT_APPLICABLE",
    }).catch(() => {});
  }
}

/**
 * Restores a mistakenly hidden blood request back to open status.
 */
export async function restoreBloodRequest(
  admin: AdminOperator,
  input: {
    requestId: string;
    requesterId: string;
    requesterName?: string;
    reason: string;
  },
): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firestore is not configured");

  const reqDocRef = doc(db, BLOOD_REQUESTS_COLLECTION, input.requestId);
  const auditDocRef = doc(collection(db, AUDIT_LOGS_COLLECTION));

  const batch = writeBatch(db);

  batch.update(reqDocRef, {
    status: "open",
    hiddenReason: deleteField(),
    updatedAt: serverTimestamp(),
  });

  batch.set(auditDocRef, {
    adminId: admin.uid,
    adminEmail: admin.email || "",
    action: "REQUEST_RESTORE",
    targetType: "BLOOD_REQUEST",
    targetId: input.requestId,
    targetTitle: input.requesterName || null,
    reason: input.reason.trim(),
    createdAt: serverTimestamp(),
  });

  await batch.commit();
}

/**
 * Suspends a user account.
 */
export async function suspendUserAccount(
  admin: AdminOperator,
  input: { userId: string; userEmail?: string; reason: string },
): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firestore is not configured");

  const userDocRef = doc(db, USERS_COLLECTION, input.userId);
  const auditDocRef = doc(collection(db, AUDIT_LOGS_COLLECTION));

  const batch = writeBatch(db);

  batch.update(userDocRef, {
    isSuspended: true,
    suspendedReason: input.reason.trim(),
    suspendedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  batch.set(auditDocRef, {
    adminId: admin.uid,
    adminEmail: admin.email || "",
    action: "USER_SUSPEND",
    targetType: "USER",
    targetId: input.userId,
    targetTitle: input.userEmail || null,
    reason: input.reason.trim(),
    createdAt: serverTimestamp(),
  });

  await batch.commit();

  createInAppNotification({
    recipientId: input.userId,
    type: "MODERATION_NOTICE",
    title: {
      bn: "আপনার অ্যাকাউন্ট স্থগিত করা হয়েছে",
      en: "Your account has been suspended",
    },
    message: {
      bn: `নিয়ম লঙ্ঘনের কারণে আপনার অ্যাকাউন্ট সাময়িকভাবে স্থগিত করা হয়েছে। কারণ: ${input.reason}`,
      en: `Your account was suspended due to policy violations. Reason: ${input.reason}`,
    },
    actionUrl: "/account",
    read: false,
    emailStatus: "NOT_APPLICABLE",
  }).catch(() => {});
}

/**
 * Restores a suspended user account.
 */
export async function restoreUserAccount(
  admin: AdminOperator,
  input: { userId: string; userEmail?: string; reason: string },
): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firestore is not configured");

  const userDocRef = doc(db, USERS_COLLECTION, input.userId);
  const auditDocRef = doc(collection(db, AUDIT_LOGS_COLLECTION));

  const batch = writeBatch(db);

  batch.update(userDocRef, {
    isSuspended: false,
    suspendedReason: deleteField(),
    suspendedAt: deleteField(),
    updatedAt: serverTimestamp(),
  });

  batch.set(auditDocRef, {
    adminId: admin.uid,
    adminEmail: admin.email || "",
    action: "USER_RESTORE",
    targetType: "USER",
    targetId: input.userId,
    targetTitle: input.userEmail || null,
    reason: input.reason.trim(),
    createdAt: serverTimestamp(),
  });

  await batch.commit();
}

/**
 * Resolves or dismisses a report in the reports queue.
 */
export async function resolveReport(
  admin: AdminOperator,
  input: ResolveReportInput & { targetType?: string; targetId?: string },
): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firestore is not configured");

  const reportDocRef = doc(db, REPORTS_COLLECTION, input.reportId);
  const auditDocRef = doc(collection(db, AUDIT_LOGS_COLLECTION));

  const batch = writeBatch(db);

  batch.update(reportDocRef, {
    status: input.status,
    resolutionNotes: input.resolutionNotes.trim(),
    resolvedBy: admin.uid,
    resolvedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  batch.set(auditDocRef, {
    adminId: admin.uid,
    adminEmail: admin.email || "",
    action: input.status === "RESOLVED" ? "REPORT_RESOLVE" : "REPORT_DISMISS",
    targetType: "REPORT",
    targetId: input.reportId,
    reason: input.resolutionNotes.trim(),
    metadata: {
      status: input.status,
      targetType: input.targetType,
      targetId: input.targetId,
    },
    createdAt: serverTimestamp(),
  });

  await batch.commit();
}
