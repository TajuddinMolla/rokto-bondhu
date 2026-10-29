import * as React from "react";
import type { Metadata } from "next";
import {
  HeartPulse,
  ShieldCheck,
  Clock,
  Users,
  PhoneCall,
} from "lucide-react";

import { constructMetadata } from "@/lib/seo/metadata";
import { getTranslations } from "@/i18n/translations";
import { InnerPageHero } from "@/components/shared/inner-page-hero";
import { BloodRequestForm } from "@/components/forms/blood-request-form";

export const metadata: Metadata = constructMetadata({
  title: "Create a Blood Request",
  path: "/en/blood-request/create",
  locale: "en",
});

export default function EnCreateBloodRequestPage() {
  const t = getTranslations("en");

  return (
    <main className="flex-1 bg-background">
      {/* Modern Hero & Context Header */}
      <InnerPageHero
        badge={t.bloodRequestCreatePage.badge}
        badgePulse={true}
        title={t.bloodRequestCreatePage.heading}
        description={t.bloodRequestCreatePage.subtitle}
      >
        {/* Dedicated Modern Emergency Callout Banner */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-destructive/25 bg-gradient-to-r from-destructive/[0.08] via-surface to-primary/[0.06] p-4 sm:p-5 lg:p-6 shadow-xs transition-all hover:border-destructive/40 group">
          <div
            className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-destructive/10 blur-2xl group-hover:bg-destructive/15 transition-colors"
            aria-hidden="true"
          />

          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
            {/* Left Side: Glyph & Info */}
            <div className="flex items-start gap-3.5 sm:gap-4 min-w-0">
              <div className="flex size-11 sm:size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-destructive via-destructive to-rose-700 text-white shadow-sm ring-4 ring-destructive/10 mt-0.5">
                <HeartPulse className="size-6 animate-pulse" aria-hidden="true" />
              </div>

              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-destructive/10 text-destructive border border-destructive/20 shadow-2xs">
                    <span className="relative flex size-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                      <span className="relative inline-flex rounded-full size-2 bg-destructive" />
                    </span>
                    <span>{t.bloodRequestCreatePage.emergencyBanner.title}</span>
                  </span>
                </div>

                <h2 className="text-base sm:text-lg md:text-xl font-black text-foreground tracking-tight leading-snug">
                  Patient in Critical Condition? Urgent Blood Needed?
                </h2>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
                  {t.bloodRequestCreatePage.emergencyBanner.desc}
                </p>
              </div>
            </div>

            {/* Right Side: Hotline Call Buttons */}
            <div className="shrink-0 flex flex-wrap items-center gap-2.5 pt-1 md:pt-0 w-full md:w-auto">
              <a
                href="tel:999"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-destructive hover:bg-destructive/90 text-white text-xs font-black shadow-xs transition-all flex-1 md:flex-none min-h-[46px]"
              >
                <PhoneCall className="size-4 shrink-0" aria-hidden="true" />
                <span>National Emergency (999)</span>
              </a>
              <a
                href="tel:029116563"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-surface border border-border/80 hover:bg-muted text-foreground text-xs font-bold transition-all flex-1 md:flex-none min-h-[46px]"
              >
                <PhoneCall className="size-4 text-primary shrink-0" aria-hidden="true" />
                <span>Red Crescent Blood Bank</span>
              </a>
            </div>
          </div>
        </div>

        {/* Platform Trust & Safety Guarantees Bar */}
        <div className="pt-2 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-primary shrink-0" aria-hidden="true" />
            <span>Submit in just 60 seconds</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="size-4 text-primary shrink-0" aria-hidden="true" />
            <span>Instant broadcast to nearby voluntary donors</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck
              className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0"
              aria-hidden="true"
            />
            <span>100% Free & Secure Humanitarian Service</span>
          </div>
          <div className="flex items-center gap-2">
            <HeartPulse className="size-4 text-primary shrink-0" aria-hidden="true" />
            <span>24/7 Verified Emergency Network</span>
          </div>
        </div>
      </InnerPageHero>

      {/* Main Form Section */}
      <section className="py-8 sm:py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <React.Suspense
            fallback={
              <div className="h-96 rounded-3xl border border-border bg-surface/50 animate-pulse" />
            }
          >
            <BloodRequestForm locale="en" />
          </React.Suspense>
        </div>
      </section>
    </main>
  );
}
