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
  isConfigured: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (fullName: string, email: string, password: string, phoneNumber?: string) => Promise<User>;
  logout: () => Promise<void>;
  sendVerification: () => Promise<void>;
  refreshUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

function mapFirebaseUser(firebaseUser: User): AuthUser {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    phoneNumber: firebaseUser.phoneNumber,
    displayName: firebaseUser.displayName,
    emailVerified: firebaseUser.emailVerified,
    createdAt: firebaseUser.metadata.creationTime,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const isConfigured = React.useMemo(() => isFirebaseConfigured(), []);
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [rawUser, setRawUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(() => isFirebaseConfigured());
  const [status, setStatus] = React.useState<AuthStatus>(() =>
    isFirebaseConfigured() ? "loading" : "unauthenticated"
  );

  React.useEffect(() => {
    if (!isConfigured) {
      return;
    }

    const auth = getFirebaseAuth();
    if (!auth) {
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(mapFirebaseUser(firebaseUser));
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
      setUser(mapFirebaseUser(loggedInUser));
      setRawUser(loggedInUser);
      setStatus("authenticated");
      return loggedInUser;
    },
    []
  );

  const register = React.useCallback(
    async (fullName: string, email: string, password: string, phoneNumber?: string): Promise<User> => {
      const newUser = await signUpWithEmail(fullName, email, password, phoneNumber);
      setUser(mapFirebaseUser(newUser));
      setRawUser(newUser);
      setStatus("authenticated");
      return newUser;
    },
    []
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
      setUser(mapFirebaseUser(updated));
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
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
