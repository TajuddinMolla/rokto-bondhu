"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n/config";

interface OnboardingProgressProps {
  currentStepIndex: number;
  totalSteps: number;
  locale: Locale;
  onSelectStep?: (index: number) => void;
  className?: string;
}

const bnDigits: Record<string, string> = {
  "0": "০",
  "1": "১",
  "2": "২",
  "3": "৩",
  "4": "৪",
  "5": "৫",
  "6": "৬",
  "7": "৭",
  "8": "৮",
  "9": "৯",
};

function toBengaliNumber(num: number): string {
  return String(num).replace(/\d/g, (d) => bnDigits[d] || d);
}

export function OnboardingProgress({
  currentStepIndex,
  totalSteps,
  locale,
  onSelectStep,
  className,
}: OnboardingProgressProps) {
  const currentStepNumber = currentStepIndex + 1;

  const stepLabel =
    locale === "en"
      ? `Step ${currentStepNumber} of ${totalSteps}`
      : `ধাপ ${toBengaliNumber(currentStepNumber)} / ${toBengaliNumber(totalSteps)}`;

  return (
    <div
      role="progressbar"
      aria-label={locale === "en" ? "Onboarding tour progress" : "অনবোর্ডিং ট্যুর অগ্রগতি"}
      aria-valuenow={currentStepNumber}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-valuetext={stepLabel}
      className={cn("flex items-center justify-between gap-3 w-full", className)}
    >
      {/* Step Dots */}
      <div className="flex items-center gap-1.5 flex-wrap" aria-hidden="true">
        {Array.from({ length: totalSteps }).map((_, idx) => {
          const isActive = idx === currentStepIndex;
          const isPassed = idx < currentStepIndex;

          return (
            <button
              key={idx}
              type="button"
              disabled={!onSelectStep}
              onClick={() => onSelectStep?.(idx)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                isActive
                  ? "w-6 bg-primary"
                  : isPassed
                  ? "w-2.5 bg-primary/40 hover:bg-primary/60 cursor-pointer"
                  : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50 cursor-pointer",
                !onSelectStep && "cursor-default"
              )}
              title={
                locale === "en"
                  ? `Go to step ${idx + 1}`
                  : `ধাপ ${toBengaliNumber(idx + 1)}-এ যান`
              }
              tabIndex={onSelectStep ? 0 : -1}
            />
          );
        })}
      </div>

      {/* Step Counter Badge */}
      <div className="text-[11px] font-bold text-muted-foreground shrink-0 tabular-nums">
        {stepLabel}
      </div>
    </div>
  );
}
