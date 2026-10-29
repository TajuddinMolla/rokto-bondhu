import { getFirebaseApp, getFirebaseDb } from "@/lib/firebase/config";
import { doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";

export type PushPermissionStatus = "default" | "granted" | "denied" | "unsupported";

/**
 * Checks if the current browser and platform support Push Notifications and Service Workers.
 */
export function isPushSupported(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return Boolean(
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}

/**
 * Returns current browser notification permission status.
 */
export function getPushPermissionStatus(): PushPermissionStatus {
  if (!isPushSupported()) {
    return "unsupported";
  }
  return Notification.permission as PushPermissionStatus;
}

/**
 * Creates a deterministic, URL-safe document ID from an FCM token.
 */
function hashTokenToId(token: string): string {
  // Simple deterministic hash for doc ID
  let hash = 0;
  for (let i = 0; i < token.length; i++) {
    const char = token.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `token_${Math.abs(hash)}_${token.slice(-12)}`;
}

/**
 * Requests notification permission from user and registers the FCM token in Firestore.
 */
export async function registerPushNotificationToken(
  userId: string
): Promise<{ success: boolean; token?: string; status: PushPermissionStatus; error?: string }> {
  if (!isPushSupported()) {
    return {
      success: false,
      status: "unsupported",
      error: "This browser or device does not support Web Push notifications.",
    };
  }

  if (!userId) {
    return {
      success: false,
      status: getPushPermissionStatus(),
      error: "User must be authenticated to enable push notifications.",
    };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return {
        success: false,
        status: permission as PushPermissionStatus,
        error:
          permission === "denied"
            ? "Notifications are blocked in your browser settings. Please permit notifications to continue."
            : "Notification permission was dismissed.",
      };
    }

    const app = getFirebaseApp();
    if (!app) {
      throw new Error("Firebase is not initialized.");
    }

    const { getMessaging, getToken } = await import("firebase/messaging");
    const messaging = getMessaging(app);

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

    // Register service worker explicitly
    const swRegistration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
      { scope: "/" }
    );
    await navigator.serviceWorker.ready;

    const token = await getToken(messaging, {
      vapidKey: vapidKey || undefined,
      serviceWorkerRegistration: swRegistration,
    });

    if (!token) {
      throw new Error("No registration token retrieved from Firebase Cloud Messaging.");
    }

    // Persist token in Firestore under user document
    const db = getFirebaseDb();
    if (db) {
      const tokenId = hashTokenToId(token);
      const tokenDocRef = doc(db, "users", userId, "pushTokens", tokenId);

      await setDoc(
        tokenDocRef,
        {
          token,
          userId,
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
          platform: typeof navigator !== "undefined" ? navigator.platform : null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }

    // Store token in localStorage for fast local reference
    try {
      localStorage.setItem(`roktobondhu_fcm_token_${userId}`, token);
    } catch {
      // localStorage may fail in private mode
    }

    return {
      success: true,
      token,
      status: "granted",
    };
  } catch (err: unknown) {
    console.error("[FCM Registration Error]:", err);
    return {
      success: false,
      status: getPushPermissionStatus(),
      error: (err as Error)?.message || "Failed to register push token.",
    };
  }
}

/**
 * Removes the push token from Firestore and unregisters FCM messaging for this device.
 */
export async function unregisterPushNotificationToken(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  if (!userId) return { success: false, error: "User is required." };

  try {
    let localToken: string | null = null;
    try {
      localToken = localStorage.getItem(`roktobondhu_fcm_token_${userId}`);
    } catch {
      // ignore
    }

    const db = getFirebaseDb();
    if (db && localToken) {
      const tokenId = hashTokenToId(localToken);
      const tokenDocRef = doc(db, "users", userId, "pushTokens", tokenId);
      await deleteDoc(tokenDocRef).catch(() => {});
    }

    try {
      localStorage.removeItem(`roktobondhu_fcm_token_${userId}`);
    } catch {
      // ignore
    }

    const app = getFirebaseApp();
    if (app && isPushSupported()) {
      try {
        const { getMessaging, deleteToken } = await import("firebase/messaging");
        const messaging = getMessaging(app);
        await deleteToken(messaging);
      } catch {
        // Token deletion non-fatal
      }
    }

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: (err as Error)?.message || "Failed to remove push token.",
    };
  }
}
