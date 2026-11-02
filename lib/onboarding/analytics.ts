/**
 * Non-PII Analytics tracking helper for RoktoBondhu Onboarding.
 * Wraps @vercel/analytics safely to measure tour funnel progression.
 */

import { track } from "@vercel/analytics";

export type OnboardingAnalyticsEvent =
  | "onboarding_started"
  | "onboarding_step_viewed"
  | "onboarding_completed"
  | "onboarding_skipped"
  | "onboarding_cta_clicked";

export function trackOnboarding(
  event: OnboardingAnalyticsEvent,
  properties?: Record<string, string | number | boolean>
): void {
  if (typeof window === "undefined") return;
  try {
    track(event, properties);
  } catch {
    // Non-fatal if analytics is blocked or fails
  }
}

