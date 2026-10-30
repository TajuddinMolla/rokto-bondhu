import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  Timestamp,
  writeBatch,
  getCountFromServer,
  type DocumentSnapshot,
  type QueryConstraint,
} from "firebase/firestore";

import { getFirebaseDb, getFirebaseAuth } from "@/lib/firebase/config";
import type {
  AppNotification,
  NotificationType,
  EmailDeliveryStatus,
  PaginatedNotificationsResult,
} from "@/types/notification";

export const NOTIFICATIONS_COLLECTION = "notifications";

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

function mapNotificationDoc(
  id: string,
  data: Record<string, unknown>
): AppNotification {
  const title = (data.title && typeof data.title === "object")
    ? (data.title as { bn?: string; en?: string })
    : { bn: String(data.title || ""), en: String(data.title || "") };

  const message = (data.message && typeof data.message === "object")
    ? (data.message as { bn?: string; en?: string })
    : { bn: String(data.message || ""), en: String(data.message || "") };

  return {
    id,
    recipientId: String(data.recipientId || ""),
    senderId: data.senderId ? String(data.senderId) : undefined,
    type: (data.type || "CONTACT_REQUEST_RECEIVED") as NotificationType,
    title: {
      bn: title.bn || "",
      en: title.en || "",
    },
    message: {
      bn: message.bn || "",
      en: message.en || "",
    },
    relatedRequestId: data.relatedRequestId ? String(data.relatedRequestId) : undefined,
    relatedContactRequestId: data.relatedContactRequestId
      ? String(data.relatedContactRequestId)
      : undefined,
    actionUrl: String(data.actionUrl || "/account"),
    read: Boolean(data.read),
    readAt: data.readAt ? timestampToIso(data.readAt) : null,
    emailStatus: (data.emailStatus || "NOT_APPLICABLE") as EmailDeliveryStatus,
    emailSentAt: data.emailSentAt ? timestampToIso(data.emailSentAt) : null,
    emailError: data.emailError ? String(data.emailError) : null,
    createdAt: timestampToIso(data.createdAt),
    updatedAt: timestampToIso(data.updatedAt),
  };
}

/**
 * Returns a deterministic document ID for a notification to ensure idempotency.
 */
export function getDeterministicNotificationId(
  type: NotificationType,
  entityId: string
): string {
  const sanitizedType = type.toLowerCase().replace(/_/g, "-");
  return `notif_${sanitizedType}_${entityId}`;
}

/**
 * Retrieves paginated notifications for an authenticated user using Firestore cursor pagination.
 */
export async function getNotifications(params: {
  recipientId: string;
  pageSize?: number;
  cursorDoc?: DocumentSnapshot | null;
  unreadOnly?: boolean;
}): Promise<PaginatedNotificationsResult> {
  const db = getFirebaseDb();
  if (!db || !params.recipientId) {
    return {
      notifications: [],
      nextCursorDoc: null,
      hasMore: false,
    };
  }

  const requestedSize = Math.min(Math.max(params.pageSize || 20, 1), 50);
  const colRef = collection(db, NOTIFICATIONS_COLLECTION);

  try {
    // Try primary query with server-side orderBy
    const constraints: QueryConstraint[] = [
      where("recipientId", "==", params.recipientId),
    ];

    if (params.unreadOnly) {
      constraints.push(where("read", "==", false));
    }

    constraints.push(orderBy("createdAt", "desc"));
    constraints.push(limit(requestedSize + 1));

    if (params.cursorDoc) {
      constraints.push(startAfter(params.cursorDoc));
    }

    const q = query(colRef, ...constraints);
    const snap = await getDocs(q);

    const docs = snap.docs;
    const hasMore = docs.length > requestedSize;
    const resultDocs = hasMore ? docs.slice(0, requestedSize) : docs;
    const nextCursorDoc =
      hasMore && resultDocs.length > 0 ? resultDocs[resultDocs.length - 1] : null;

    const notifications = resultDocs.map((d) =>
      mapNotificationDoc(d.id, d.data())
    );

    return {
      notifications,
      nextCursorDoc,
      hasMore,
    };
  } catch (error: unknown) {
    const errorMsg = (error as { message?: string })?.message || String(error);

    console.warn(
      "Index-ordered notifications query failed, falling back to simple single-field query with in-memory sorting:",
      errorMsg
    );

    // Fallback query: single-field equality only.
    // In Firestore, single-field queries NEVER require compound indexes and always succeed.
    try {
      const fallbackQ = query(
        colRef,
        where("recipientId", "==", params.recipientId)
      );
      const snap = await getDocs(fallbackQ);

      let items = snap.docs.map((d) => mapNotificationDoc(d.id, d.data()));

      if (params.unreadOnly) {
        items = items.filter((n) => !n.read);
      }

      // Sort descending by creation date in memory
      items.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const hasMore = items.length > requestedSize;
      const notifications = items.slice(0, requestedSize);

      return {
        notifications,
        nextCursorDoc: null,
        hasMore,
      };
    } catch (fallbackError: unknown) {
      console.error("Notifications fallback query also failed:", fallbackError);
      throw fallbackError;
    }
  }
}

/**
 * Bounded query counting unread notifications using Firestore server count aggregation,
 * with graceful in-memory calculation fallback.
 */
export async function getUnreadNotificationsCount(
  recipientId: string
): Promise<number> {
  const db = getFirebaseDb();
  if (!db || !recipientId) return 0;

  try {
    const colRef = collection(db, NOTIFICATIONS_COLLECTION);
    const q = query(
      colRef,
      where("recipientId", "==", recipientId),
      where("read", "==", false)
    );
    const countSnap = await getCountFromServer(q);
    return countSnap.data().count;
  } catch {
    // Graceful fallback: calculate unread count via simple single-field query
    try {
      const colRef = collection(db, NOTIFICATIONS_COLLECTION);
      const fallbackQ = query(colRef, where("recipientId", "==", recipientId));
      const snap = await getDocs(fallbackQ);
      return snap.docs.filter((d) => d.data().read === false).length;
    } catch {
      return 0;
    }
  }
}

/**
 * Marks a specific notification as read.
 */
export async function markNotificationAsRead(
  notificationId: string
): Promise<void> {
  const db = getFirebaseDb();
  if (!db || !notificationId) return;

  const docRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
  await updateDoc(docRef, {
    read: true,
    readAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Marks all unread notifications for a user as read using a batch write.
 */
export async function markAllNotificationsAsRead(
  recipientId: string
): Promise<void> {
  const db = getFirebaseDb();
  if (!db || !recipientId) return;

  const colRef = collection(db, NOTIFICATIONS_COLLECTION);
  const q = query(
    colRef,
    where("recipientId", "==", recipientId),
    where("read", "==", false),
    limit(100)
  );

  const snap = await getDocs(q);
  if (snap.empty) return;

  const batch = writeBatch(db);
  const now = serverTimestamp();

  snap.forEach((d) => {
    batch.update(d.ref, {
      read: true,
      readAt: now,
      updatedAt: now,
    });
  });

  await batch.commit();
}

/**
 * Creates or idempotently upserts an in-app notification in Firestore.
 */
export async function createInAppNotification(
  notification: Omit<AppNotification, "id" | "createdAt" | "updatedAt"> & { id?: string }
): Promise<AppNotification> {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error("Firestore is not configured");
  }

  const colRef = collection(db, NOTIFICATIONS_COLLECTION);
  const docId = notification.id || doc(colRef).id;
  const docRef = doc(colRef, docId);

  const payload: Record<string, unknown> = {
    recipientId: notification.recipientId,
    senderId: notification.senderId || null,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    relatedRequestId: notification.relatedRequestId || null,
    relatedContactRequestId: notification.relatedContactRequestId || null,
    actionUrl: notification.actionUrl,
    read: Boolean(notification.read),
    readAt: notification.readAt || null,
    emailStatus: notification.emailStatus || "NOT_APPLICABLE",
    emailSentAt: notification.emailSentAt || null,
    emailError: notification.emailError || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(docRef, payload, { merge: true });

  const now = new Date().toISOString();
  return {
    ...notification,
    id: docId,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Safely dispatches a notification event to the server route handler.
 * Failure is gracefully swallowed and logged so the caller's main action never breaks.
 */
export async function dispatchNotificationSafely(input: {
  event: NotificationType;
  contactRequestId?: string;
  bloodRequestId?: string;
}): Promise<void> {
  try {
    const auth = getFirebaseAuth();
    let currentUser = auth?.currentUser;
    if (!currentUser && auth) {
      await new Promise((r) => setTimeout(r, 250));
      currentUser = auth.currentUser;
    }
    const token = currentUser ? await currentUser.getIdToken(false) : null;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch("/api/notifications/dispatch", {
      method: "POST",
      headers,
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      console.warn(
        `Notification dispatch returned status ${res.status} for event ${input.event}`
      );
    }
  } catch (err) {
    console.warn(`Failed to dispatch notification for event ${input.event}:`, err);
  }
}
