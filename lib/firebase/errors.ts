import { type Locale } from "@/i18n/config";
import { getTranslations } from "@/i18n/translations";

/**
 * Maps raw Firebase Auth error codes to safe, localized, user-friendly messages.
 * Never leaks raw stack traces, API keys, or internal details to the user.
 */
export function getFirebaseErrorMessage(errorCode: string, locale: Locale = "bn"): string {
  const t = getTranslations(locale);
  const errors = t.auth.firebaseErrors;

  switch (errorCode) {
    case "auth/email-already-in-use":
      return errors.emailAlreadyInUse;
    case "auth/invalid-email":
      return errors.invalidEmail;
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return errors.invalidCredentials;
    case "auth/user-disabled":
      return errors.userDisabled;
    case "auth/too-many-requests":
      return errors.tooManyRequests;
    case "auth/weak-password":
      return errors.weakPassword;
    case "auth/network-request-failed":
      return errors.networkError;
    case "auth/requires-recent-login":
      return errors.requiresRecentLogin;
    case "auth/not-configured":
      return errors.notConfigured;
    default:
      return errors.genericError;
  }
}
