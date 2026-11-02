"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useIsDonor } from "@/hooks/use-is-donor";
import { getLocaleFromPathname, type Locale } from "@/i18n/config";
import {
  isOnboardingCompleted,
  markOnboardingCompleted,
  OPEN_TOUR_EVENT,
} from "@/lib/onboarding/storage";
import { trackOnboarding } from "@/lib/onboarding/analytics";
import { OnboardingProgress } from "@/components/onboarding/onboarding-progress";
import {
  OnboardingStepContent,
  type OnboardingStepId,
} from "@/components/onboarding/onboarding-step-content";

interface OnboardingTourProps {
  forceOpen?: boolean;
  onClose?: () => void;
  locale?: Locale;
}

const emptySubscribe = () => () => {};

export function OnboardingTour({
  forceOpen = false,
  onClose,
  locale: explicitLocale,
}: OnboardingTourProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = explicitLocale || getLocaleFromPathname(pathname);

  const { user, status } = useAuth();
  const { isDonor } = useIsDonor();
  const isAuthenticated = status === "authenticated" && Boolean(user);

  const [isOpen, setIsOpen] = React.useState<boolean>(forceOpen);
  const [currentStepIndex, setCurrentStepIndex] = React.useState<number>(0);

  // SSR hydration safety
  const isClient = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  // Calculate dynamic steps based on auth state
  const activeSteps = React.useMemo<OnboardingStepId[]>(() => {
    const steps: OnboardingStepId[] = [
      "welcome",
      "what_can_you_do",
    ];

    // Omit account creation step if the user is already authenticated
    if (!isAuthenticated) {
      steps.push("create_account");
    }

    steps.push(
      "become_donor",
      "donor_availability",
      "find_donor",
      "create_blood_request",
      "after_request",
      "donation_complete",
      "choose_journey"
    );

    return steps;
  }, [isAuthenticated]);

  const totalSteps = activeSteps.length;
  const currentStepId = activeSteps[currentStepIndex] || activeSteps[0];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  // Auto-trigger on homepage for first-time visitors or if ?tour=open query param is present
  React.useEffect(() => {
    if (!isClient) return;

    let hasTourQuery = false;
    try {
      const params = new URLSearchParams(window.location.search);
      hasTourQuery = params.get("tour") === "open" || params.get("tour") === "1";
    } catch {
      hasTourQuery = false;
    }

    const isHomePage = pathname === "/" || pathname === "/en" || pathname === "/en/";
    const shouldAutoOpen = hasTourQuery || (isHomePage && !isOnboardingCompleted());

    if (shouldAutoOpen) {
      const delay = hasTourQuery ? 150 : 700;
      const timer = window.setTimeout(() => {
        setIsOpen(true);
        setCurrentStepIndex(0);
        trackOnboarding("onboarding_started", {
          trigger: hasTourQuery ? "query_param" : "first_time_auto",
          locale: currentLocale,
          is_auth: isAuthenticated,
          is_donor: Boolean(isDonor),
        });
      }, delay);

      return () => window.clearTimeout(timer);
    }
  }, [isClient, pathname, currentLocale, isAuthenticated, isDonor]);

  // Listen for manual open requests from Footer, Header, or Help buttons
  React.useEffect(() => {
    if (!isClient) return;

    const handleOpenTour = () => {
      setIsOpen(true);
      setCurrentStepIndex(0);
      trackOnboarding("onboarding_started", {
        trigger: "manual_click",
        locale: currentLocale,
        is_auth: isAuthenticated,
        is_donor: Boolean(isDonor),
      });
    };

    window.addEventListener(OPEN_TOUR_EVENT, handleOpenTour);
    return () => window.removeEventListener(OPEN_TOUR_EVENT, handleOpenTour);
  }, [isClient, currentLocale, isAuthenticated, isDonor]);

  // Track step view on step transition
  React.useEffect(() => {
    if (isOpen && currentStepId) {
      trackOnboarding("onboarding_step_viewed", {
        step_id: currentStepId,
        step_index: currentStepIndex + 1,
        total_steps: totalSteps,
        locale: currentLocale,
      });
    }
  }, [isOpen, currentStepId, currentStepIndex, totalSteps, currentLocale]);

  // Lock body scroll while tour is active
  React.useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Close & Skip handlers
  const handleClose = React.useCallback(() => {
    markOnboardingCompleted();
    setIsOpen(false);
    onClose?.();
    trackOnboarding("onboarding_skipped", {
      at_step_id: currentStepId,
      at_step_index: currentStepIndex + 1,
    });
  }, [currentStepId, currentStepIndex, onClose]);

  const handleFinish = React.useCallback(() => {
    markOnboardingCompleted();
    setIsOpen(false);
    onClose?.();
    trackOnboarding("onboarding_completed", {
      locale: currentLocale,
    });
  }, [currentLocale, onClose]);

  // Next & Back
  const handleNext = React.useCallback(() => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleFinish();
    }
  }, [currentStepIndex, totalSteps, handleFinish]);

  const handleBack = React.useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  // Action navigation
  const handleNavigateAction = React.useCallback(
    (url: string, ctaId: string) => {
      markOnboardingCompleted();
      setIsOpen(false);
      onClose?.();
      trackOnboarding("onboarding_cta_clicked", {
        cta_id: ctaId,
        target_url: url,
        from_step: currentStepId,
      });
      router.push(url);
    },
    [currentStepId, onClose, router]
  );

  // Keyboard navigation
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      } else if (e.key === "ArrowRight") {
        // Only advance if not on the interactive final step
        if (!isLastStep) {
          handleNext();
        }
      } else if (e.key === "ArrowLeft") {
        if (!isFirstStep) {
          handleBack();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose, handleNext, handleBack, isFirstStep, isLastStep]);

  if (!isClient || !isOpen) {
    return null;
  }

  const dialogTitleId = "roktobondhu-onboarding-title";
  const dialogDescId = "roktobondhu-onboarding-desc";

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={dialogTitleId}
      aria-describedby={dialogDescId}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
    >
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={handleClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
      />

      {/* Main Container: Mobile Bottom-Sheet, Desktop Centered Card */}
      <div
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative w-full sm:max-w-xl max-h-[90vh] flex flex-col",
          "rounded-t-3xl sm:rounded-3xl border border-border/80 bg-surface shadow-2xl",
          "text-foreground focus:outline-none transition-all duration-200",
          "animate-in slide-in-from-bottom-6 sm:zoom-in-95"
        )}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 sm:px-6 pt-5 pb-3 border-b border-border/60">
          <OnboardingProgress
            currentStepIndex={currentStepIndex}
            totalSteps={totalSteps}
            locale={currentLocale}
            onSelectStep={(idx) => setCurrentStepIndex(idx)}
          />

          <button
            type="button"
            onClick={handleClose}
            className="ml-3 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shrink-0"
            aria-label={currentLocale === "en" ? "Close onboarding tour" : "অনবোর্ডিং ট্যুর বন্ধ করুন"}
            title={currentLocale === "en" ? "Close (Esc)" : "বন্ধ করুন (Esc)"}
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div id={dialogDescId} className="flex-1 overflow-y-auto px-5 sm:px-7 py-5">
          <OnboardingStepContent
            stepId={currentStepId}
            locale={currentLocale}
            isAuthenticated={isAuthenticated}
            isDonor={Boolean(isDonor)}
            onNavigateAction={handleNavigateAction}
            onComplete={handleFinish}
          />
        </div>

        {/* Footer Navigation Bar (hidden on the final step as it provides direct large journey cards) */}
        {!isLastStep && (
          <div className="flex items-center justify-between gap-3 px-5 sm:px-7 py-4 border-t border-border/60 bg-surface-raised/40 rounded-b-3xl">
            {/* Left: Skip / Later / Back */}
            <div>
              {isFirstStep ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="text-xs text-muted-foreground hover:text-foreground font-semibold"
                >
                  {currentLocale === "en" ? "Maybe Later" : "পরে দেখব"}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleBack}
                  className="font-semibold text-xs"
                >
                  <ChevronLeft className="size-4 mr-1" aria-hidden="true" />
                  {currentLocale === "en" ? "Back" : "পূর্ববর্তী"}
                </Button>
              )}
            </div>

            {/* Right: Next / Start / Skip */}
            <div className="flex items-center gap-2">
              {!isFirstStep && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="text-xs text-muted-foreground hover:text-foreground hidden sm:inline-flex"
                >
                  {currentLocale === "en" ? "Skip Tour" : "বাদ দিন"}
                </Button>
              )}

              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={handleNext}
                className="font-bold text-xs shadow-xs"
              >
                <span>
                  {isFirstStep
                    ? currentLocale === "en"
                      ? "Start Tour"
                      : "পরিচিতি শুরু করুন"
                    : currentLocale === "en"
                    ? "Next Step"
                    : "পরবর্তী ধাপ"}
                </span>
                <ChevronRight className="size-4 ml-1" aria-hidden="true" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
