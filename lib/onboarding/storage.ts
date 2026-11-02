/**
 * Safe, versioned client-side persistence for RoktoBondhu Onboarding Tour Guide.
 *
 * Adheres to project storage conventions:
 * - Uses 'roktobondhu_' prefix
 * - SSR-safe with typeof window !== 'undefined'
 * - Wrapped in try/catch to protect against private browsing / quota restrictions
 */

export const ONBOARDING_STORAGE_KEY_V1 = "roktobondhu_onboarding_v1_completed";
export const OPEN_TOUR_EVENT = "roktobondhu_open_tour";

function isLocalStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const testKey = "__roktobondhu_storage_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks whether the v1 onboarding tour has already been completed or dismissed.
 */
export function isOnboardingCompleted(): boolean {
  if (!isLocalStorageAvailable()) return false;
  try {
    return window.localStorage.getItem(ONBOARDING_STORAGE_KEY_V1) === "true";
  } catch {
    return false;
  }
}

/**
 * Records that the v1 onboarding tour has been completed or dismissed.
 */
export function markOnboardingCompleted(): void {
  if (!isLocalStorageAvailable()) return;
  try {
    window.localStorage.setItem(ONBOARDING_STORAGE_KEY_V1, "true");
  } catch {
    // Non-fatal if storage fails
  }
}

/**
 * Resets the onboarding status, allowing the tour to run again.
 */
export function resetOnboarding(): void {
  if (!isLocalStorageAvailable()) return;
  try {
    window.localStorage.removeItem(ONBOARDING_STORAGE_KEY_V1);
  } catch {
    // Non-fatal if storage fails
  }
}

/**
 * Triggers the main onboarding tour to open immediately via custom window event.
 */
export function openTour(): void {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new CustomEvent(OPEN_TOUR_EVENT));
  } catch {
    // Non-fatal in unsupported environments
  }
}
