"use client";

import * as React from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { getFirebaseAuth, getFirebaseDb, isFirebaseConfigured } from "@/lib/firebase/config";
import {
  signInWithEmail,
  signUpWithEmail,
  signOutUser,
  requestPasswordReset,
  resendVerificationEmail,
  reloadUser,
} from "@/lib/firebase/auth";
import type { AuthUser } from "@/types/auth";

import { ensureUserProfile } from "@/services/user.service";
import { unregisterPushNotificationToken } from "@/lib/firebase/messaging";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthContextValue {
  user: AuthUser | null;
  rawUser: User | null;
  loading: boolean;
  status: AuthStatus;
  isEmailVerified: boolean;
  isAdmin: boolean;
  isSuspended: boolean;
  isConfigured: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (
    fullName: string,
    email: string,
    password: string,
    phoneNumber?: string,
  ) => Promise<User>;
  logout: () => Promise<void>;
  sendVerification: () => Promise<void>;
  refreshUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  claimAdmin: () => Promise<{ success: boolean; message: string; role?: string }>;
}

export const AuthContext = React.createContext<AuthContextValue | undefined>(
  undefined,
);

async function resolveAuthUser(
  firebaseUser: User,
  forceRefresh: boolean = false,
): Promise<AuthUser> {
  let isAdmin = false;
  let isSuspended = false;
  let role = "user";

  try {
    const tokenResult = await firebaseUser.getIdTokenResult(forceRefresh);
    const claimRole =
      typeof tokenResult.claims.role === "string"
        ? tokenResult.claims.role
        : "";
    isAdmin = Boolean(
      tokenResult.claims.admin === true ||
        claimRole === "ADMIN" ||
        claimRole.toLowerCase() === "admin",
    );
    isSuspended = Boolean(tokenResult.claims.suspended === true);
    if (claimRole) {
      role = claimRole;
    }
  } catch {
    // Non-fatal if offline
  }

  // Support authorized administrators via NEXT_PUBLIC_ADMIN_EMAILS
  const defaultAdmins = "taj.unicart@gmail.com,admin@roktobondhu.com";
  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || defaultAdmins)
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (
    firebaseUser.email &&
    adminEmails.includes(firebaseUser.email.toLowerCase())
  ) {
    isAdmin = true;
    role = "ADMIN";
  }

  // Also inspect Firestore profile document for persistent admin role
  try {
    const db = getFirebaseDb();
    if (db) {
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (
          data?.role === "ADMIN" ||
          data?.role === "admin" ||
          data?.isAdmin === true
        ) {
          isAdmin = true;
          role = "ADMIN";
        }
        if (data?.isSuspended === true) {
          isSuspended = true;
        }
      }
    }
  } catch {
    // Non-fatal if offline
  }

  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    phoneNumber: firebaseUser.phoneNumber,
    displayName: firebaseUser.displayName,
    emailVerified: Boolean(firebaseUser.emailVerified || isAdmin),
    isAdmin,
    role,
    isSuspended,
    createdAt: firebaseUser.metadata.creationTime,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const isConfigured = React.useMemo(() => isFirebaseConfigured(), []);
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [rawUser, setRawUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(() => isFirebaseConfigured());
  const [status, setStatus] = React.useState<AuthStatus>(() =>
    isFirebaseConfigured() ? "loading" : "unauthenticated",
  );

  React.useEffect(() => {
    if (!isConfigured) {
      return;
    }

    const auth = getFirebaseAuth();
    if (!auth) {
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // If locally unverified, reload from Firebase Auth server to catch
        // verification performed in Firebase Console or via external link
        if (!firebaseUser.emailVerified) {
          try {
            await firebaseUser.reload();
            await firebaseUser.getIdToken(true);
          } catch {
            // Non-fatal if offline
          }
        }

        const resolved = await resolveAuthUser(firebaseUser, true);
        setUser(resolved);
        setRawUser(firebaseUser);
        setStatus("authenticated");

        // Self-healing: ensure user profile document exists in Firestore
        ensureUserProfile(firebaseUser).catch(() => {
          // Non-fatal if offline
        });
      } else {
        setUser(null);
        setRawUser(null);
        setStatus("unauthenticated");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isConfigured]);

  const login = React.useCallback(
    async (email: string, password: string): Promise<User> => {
      const loggedInUser = await signInWithEmail(email, password);
      try {
        await loggedInUser.reload();
        await loggedInUser.getIdToken(true);
      } catch {
        // Non-fatal if offline
      }
      const resolved = await resolveAuthUser(loggedInUser, true);
      setUser(resolved);
      setRawUser(loggedInUser);
      setStatus("authenticated");
      return loggedInUser;
    },
    [],
  );

  const register = React.useCallback(
    async (
      fullName: string,
      email: string,
      password: string,
      phoneNumber?: string,
    ): Promise<User> => {
      const newUser = await signUpWithEmail(
        fullName,
        email,
        password,
        phoneNumber,
      );
      const resolved = await resolveAuthUser(newUser);
      setUser(resolved);
      setRawUser(newUser);
      setStatus("authenticated");
      return newUser;
    },
    [],
  );

  const logout = React.useCallback(async () => {
    if (user?.uid) {
      try {
        await unregisterPushNotificationToken(user.uid);
      } catch (err) {
        console.warn("[AuthContext] Push token cleanup error on logout:", err);
      }
    }
    await signOutUser();
    setUser(null);
    setRawUser(null);
    setStatus("unauthenticated");
  }, [user?.uid]);

  const sendVerification = React.useCallback(async () => {
    if (!rawUser) {
      throw new Error("auth/user-not-found");
    }
    await resendVerificationEmail(rawUser);
  }, [rawUser]);

  const refreshUser = React.useCallback(async () => {
    if (!rawUser) {
      return;
    }
    try {
      await reloadUser(rawUser);
      await rawUser.getIdToken(true);
    } catch {
      // Non-fatal if offline
    }
    const auth = getFirebaseAuth();
    const updated = auth?.currentUser;
    if (updated) {
      const resolved = await resolveAuthUser(updated, true);
      setUser(resolved);
      setRawUser(updated);
    }
  }, [rawUser]);

  const resetPassword = React.useCallback(async (email: string) => {
    await requestPasswordReset(email);
  }, []);

  const claimAdmin = React.useCallback(async () => {
    if (!rawUser) {
      throw new Error("No authenticated user session found");
    }
    const token = await rawUser.getIdToken();
    const res = await fetch("/api/admin/claim", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || errData.details || "Failed to activate admin claims");
    }

    const data = await res.json();
    try {
      await reloadUser(rawUser);
      await rawUser.getIdToken(true);
    } catch {
      // Non-fatal
    }
    await refreshUser();
    return data;
  }, [rawUser, refreshUser]);

  const value: AuthContextValue = React.useMemo(
    () => ({
      user,
      rawUser,
      loading,
      status,
      isEmailVerified: Boolean(user?.emailVerified),
      isAdmin: Boolean(user?.isAdmin),
      isSuspended: Boolean(user?.isSuspended),
      isConfigured,
      login,
      register,
      logout,
      sendVerification,
      refreshUser,
      resetPassword,
      claimAdmin,
    }),
    [
      user,
      rawUser,
      loading,
      status,
      isConfigured,
      login,
      register,
      logout,
      sendVerification,
      refreshUser,
      resetPassword,
      claimAdmin,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
