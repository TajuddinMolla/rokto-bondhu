import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { firebaseConfig, isFirebaseConfigured } from "@/lib/firebase/config";

let serverApp: FirebaseApp | null = null;
let serverDb: Firestore | null = null;

/**
 * Returns a dedicated Firestore instance for server-side Next.js route handlers.
 * Uses a distinct named app instance to avoid collision with client singleton.
 */
export function getServerFirestore(): Firestore | null {
  if (!isFirebaseConfigured()) {
    return null;
  }

  try {
    if (!serverApp) {
      serverApp =
        getApps().find((a) => a.name === "server-app") ||
        initializeApp(firebaseConfig, "server-app");
    }

    if (!serverDb) {
      serverDb = getFirestore(serverApp);
    }

    return serverDb;
  } catch (error) {
    console.warn("Failed to initialize server Firestore:", error);
    return null;
  }
}
