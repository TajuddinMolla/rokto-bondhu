"use client";

import * as React from "react";
import { onAuthStateChanged, type User } from "firebase/auth";

import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase/config";
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
}

export const AuthContext = React.createContext<AuthContextValue | undefined>(
  undefined,
);

async function resolveAuthUser(firebaseUser: User): Promise<AuthUser> {
  let isAdmin = false;
  let isSuspended = false;
  let role = "user";

  try {
    const tokenResult = await firebaseUser.getIdTokenResult();
    isAdmin = Boolean(
      tokenResult.claims.admin === true || tokenResult.claims.role === "admin",
    );
    isSuspended = Boolean(tokenResult.claims.suspended === true);
    if (
      tokenResult.claims.role &&
      typeof tokenResult.claims.role === "string"
    ) {
      role = tokenResult.claims.role;
    }
  } catch {
    // Non-fatal if offline
  }

  // Support local development / bootstrap via NEXT_PUBLIC_ADMIN_EMAILS
  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (
    firebaseUser.email &&
    adminEmails.includes(firebaseUser.email.toLowerCase())
  ) {
    isAdmin = true;
    role = "admin";
  }

  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    phoneNumber: firebaseUser.phoneNumber,
    displayName: firebaseUser.displayName,
    emailVerified: firebaseUser.emailVerified,
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
        const resolved = await resolveAuthUser(firebaseUser);
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
      const resolved = await resolveAuthUser(loggedInUser);
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
    await signOutUser();
    setUser(null);
    setRawUser(null);
    setStatus("unauthenticated");
  }, []);

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
    await reloadUser(rawUser);
    const auth = getFirebaseAuth();
    const updated = auth?.currentUser;
    if (updated) {
      const resolved = await resolveAuthUser(updated);
      setUser(resolved);
      setRawUser(updated);
    }
  }, [rawUser]);

  const resetPassword = React.useCallback(async (email: string) => {
    await requestPasswordReset(email);
  }, []);

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
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
