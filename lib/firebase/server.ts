import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getMessaging, type Messaging } from "firebase-admin/messaging";
import { getAuth, type Auth } from "firebase-admin/auth";
import { firebaseConfig } from "@/lib/firebase/config";

const ADMIN_APP_NAME = "rokto-bondhu-admin";

let adminApp: App | null = null;
let adminDb: Firestore | null = null;
let adminMessaging: Messaging | null = null;
let adminAuth: Auth | null = null;

function resolveServiceAccountCredential(): ReturnType<typeof cert> | null {
  // 1. Direct JSON string or base64 environment variable (ideal for Vercel/production)
  const envKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (envKey) {
    try {
      const decoded = envKey.trim().startsWith("{")
        ? envKey
        : Buffer.from(envKey, "base64").toString("utf-8");
      const parsed = JSON.parse(decoded);
      return cert(parsed);
    } catch (err) {
      console.warn("[RoktoBondhu Server] Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", err);
    }
  }

  // 2. File path from GOOGLE_APPLICATION_CREDENTIALS
  const envPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (envPath && existsSync(resolve(envPath))) {
    try {
      const content = readFileSync(resolve(envPath), "utf-8");
      const parsed = JSON.parse(content);
      return cert(parsed);
    } catch (err) {
      console.warn("[RoktoBondhu Server] Failed to read GOOGLE_APPLICATION_CREDENTIALS:", err);
    }
  }

  // 3. Local service-account.json (development fallback)
  const defaultLocalPath = resolve(process.cwd(), "service-account.json");
  if (existsSync(defaultLocalPath)) {
    try {
      const content = readFileSync(defaultLocalPath, "utf-8");
      const parsed = JSON.parse(content);
      return cert(parsed);
    } catch (err) {
      console.warn("[RoktoBondhu Server] Failed to read local service-account.json:", err);
    }
  }

  return null;
}

/**
 * Returns the singleton Firebase Admin App instance.
 * Safe across hot-reloading and route handler invocations.
 */
export function getAdminApp(): App | null {
  if (adminApp) {
    return adminApp;
  }

  const existingApp = getApps().find((a) => a.name === ADMIN_APP_NAME);
  if (existingApp) {
    adminApp = existingApp;
    return adminApp;
  }

  try {
    const credential = resolveServiceAccountCredential();

    if (credential) {
      adminApp = initializeApp(
        {
          credential,
          projectId: firebaseConfig.projectId || undefined,
        },
        ADMIN_APP_NAME
      );
    } else if (firebaseConfig.projectId) {
      // Fallback for GCP ADC or Emulator environments
      adminApp = initializeApp(
        {
          projectId: firebaseConfig.projectId,
        },
        ADMIN_APP_NAME
      );
    }

    return adminApp;
  } catch (error) {
    console.warn("[RoktoBondhu Server] Failed to initialize Firebase Admin app:", error);
    return null;
  }
}

/**
 * Returns a dedicated Firestore instance for server-side Next.js route handlers
 * backed by the Firebase Admin SDK. Bypasses client security rules safely.
 */
export function getServerFirestore(): Firestore | null {
  if (adminDb) {
    return adminDb;
  }

  const app = getAdminApp();
  if (!app) {
    return null;
  }

  try {
    adminDb = getFirestore(app);
    return adminDb;
  } catch (error) {
    console.warn("[RoktoBondhu Server] Failed to get Admin Firestore instance:", error);
    return null;
  }
}

/**
 * Returns the Firebase Admin Messaging instance for dispatching web push notifications.
 */
export function getServerMessaging(): Messaging | null {
  if (adminMessaging) {
    return adminMessaging;
  }

  const app = getAdminApp();
  if (!app) {
    return null;
  }

  try {
    adminMessaging = getMessaging(app);
    return adminMessaging;
  } catch (error) {
    console.warn("[RoktoBondhu Server] Failed to get Admin Messaging instance:", error);
    return null;
  }
}

/**
 * Returns the Firebase Admin Auth instance for verifying tokens on the server.
 */
export function getServerAuth(): Auth | null {
  if (adminAuth) {
    return adminAuth;
  }

  const app = getAdminApp();
  if (!app) {
    return null;
  }

  try {
    adminAuth = getAuth(app);
    return adminAuth;
  } catch (error) {
    console.warn("[RoktoBondhu Server] Failed to get Admin Auth instance:", error);
    return null;
  }
}
