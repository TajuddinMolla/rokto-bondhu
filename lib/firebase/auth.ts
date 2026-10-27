import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  type User,
} from "firebase/auth";

import { getFirebaseAuth } from "@/lib/firebase/config";

/**
 * Registers a new user account with Email + Password via Firebase Authentication.
 * Sets the display name and triggers the initial email verification dispatch.
 */
export async function signUpWithEmail(
  fullName: string,
  email: string,
  password: string
): Promise<User> {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error("auth/not-configured");
  }

  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);

  if (fullName.trim()) {
    try {
      await updateProfile(credential.user, {
        displayName: fullName.trim(),
      });
    } catch {
      // Non-fatal if display name update is throttled
    }
  }

  try {
    await sendEmailVerification(credential.user);
  } catch {
    // Non-fatal: user can re-trigger verification from the verification page
  }

  return credential.user;
}

/**
 * Authenticates an existing user account with Email + Password via Firebase Authentication.
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<User> {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error("auth/not-configured");
  }

  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  return credential.user;
}

/**
 * Signs out the current active user from Firebase Authentication.
 */
export async function signOutUser(): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) {
    return;
  }

  await signOut(auth);
}

/**
 * Dispatches a Firebase password reset email to the requested address.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error("auth/not-configured");
  }

  await sendPasswordResetEmail(auth, email.trim());
}

/**
 * Re-dispatches a verification email to the active Firebase user.
 */
export async function resendVerificationEmail(user: User): Promise<void> {
  await sendEmailVerification(user);
}

/**
 * Reloads the user's authentication token and status from Firebase servers
 * to check if email verification was completed in another window/tab.
 */
export async function reloadUser(user: User): Promise<void> {
  await user.reload();
}
