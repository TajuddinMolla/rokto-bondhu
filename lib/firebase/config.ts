import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator, type Auth } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, type Firestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Validates whether the essential Firebase configuration environment variables are present.
 */
export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.projectId &&
      !firebaseConfig.apiKey.includes("your_firebase_api_key")
  );
}

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let authEmulatorConnected = false;
let firestoreEmulatorConnected = false;

/**
 * Initializes and retrieves the client Firebase App instance using singleton pattern.
 * Safely guards against server-side rendering execution.
 */
export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (!isFirebaseConfigured()) {
    return null;
  }

  if (!appInstance) {
    appInstance = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }

  return appInstance;
}

/**
 * Retrieves the client Firebase Auth instance.
 * Connects to local emulator if NEXT_PUBLIC_USE_FIREBASE_EMULATOR is set to 'true'.
 */
export function getFirebaseAuth(): Auth | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (authInstance) {
    return authInstance;
  }

  const app = getFirebaseApp();
  if (!app) {
    return null;
  }

  authInstance = getAuth(app);

  if (
    process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true" &&
    !authEmulatorConnected
  ) {
    try {
      connectAuthEmulator(authInstance, "http://localhost:9099", {
        disableWarnings: true,
      });
      authEmulatorConnected = true;
      console.info("[RoktoBondhu] Connected to Firebase Auth Emulator on localhost:9099");
    } catch {
      // Emulator connection error or already connected
    }
  }

  return authInstance;
}

/**
 * Retrieves the client Firestore Database instance using singleton pattern.
 * Connects to local emulator if NEXT_PUBLIC_USE_FIREBASE_EMULATOR is set to 'true'.
 */
export function getFirebaseDb(): Firestore | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (dbInstance) {
    return dbInstance;
  }

  const app = getFirebaseApp();
  if (!app) {
    return null;
  }

  dbInstance = getFirestore(app);

  if (
    process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true" &&
    !firestoreEmulatorConnected
  ) {
    try {
      connectFirestoreEmulator(dbInstance, "localhost", 8080);
      firestoreEmulatorConnected = true;
      console.info("[RoktoBondhu] Connected to Firestore Emulator on localhost:8080");
    } catch {
      // Emulator connection error or already connected
    }
  }

  return dbInstance;
}
