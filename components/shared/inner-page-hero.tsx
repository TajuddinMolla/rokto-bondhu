import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface InnerPageHeroProps {
  badge?: React.ReactNode;
  badgeIcon?: React.ComponentType<{ className?: string }>;
  badgePulse?: boolean;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

export function InnerPageHero({
  badge,
  badgeIcon: BadgeIcon,
  badgePulse = false,
  title,
  description,
  children,
  className,
  containerClassName,
}: InnerPageHeroProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-gradient-to-b from-primary/8 via-surface to-background pt-10 sm:pt-14 pb-8 sm:pb-12 border-b border-border/70",
        className
      )}
    >
      {/* Soft ambient lighting orbs */}
      <div
        className="pointer-events-none absolute -top-24 right-0 -z-10 size-96 rounded-full bg-primary/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 -z-10 size-80 rounded-full bg-rose-500/5 blur-3xl"
        aria-hidden="true"
      />

      <div className={cn("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6", containerClassName)}>
        {/* Title & Headline */}
        <div className="space-y-3.5 max-w-3xl">
          {badge && (
            <Badge
              variant="subtle"
              className="gap-2 px-3.5 py-1 text-xs font-bold rounded-full border border-primary-border shadow-2xs"
            >
              {badgePulse && (
                <span className="relative flex size-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
                </span>
              )}
              {BadgeIcon && <BadgeIcon className="size-3.5" aria-hidden="true" />}
              <span>{badge}</span>
            </Badge>
          )}

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight leading-[1.15]">
            {title}
          </h1>

          {description && (
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
              {description}
            </p>
          )}
        </div>

        {/* Optional Context Callout / Actions / Trust Signals */}
        {children}
      </div>
    </section>
  );
}

