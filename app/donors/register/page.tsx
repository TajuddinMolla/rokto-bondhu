import * as React from "react";
import type { Metadata } from "next";
import {
  Heart,
  ShieldCheck,
  MapPin,
  HeartPulse,
  Sparkles,
  Users,
} from "lucide-react";

import { constructMetadata } from "@/lib/seo/metadata";
import { getTranslations } from "@/i18n/translations";
import { InnerPageHero } from "@/components/shared/inner-page-hero";
import { DonorRegistrationForm } from "@/components/forms/donor-registration-form";

export const metadata: Metadata = constructMetadata({
  title: "স্বেচ্ছাসেবী রক্তদাতা নিবন্ধন",
  path: "/donors/register",
  locale: "bn",
});

export default function DonorRegisterPage() {
  const t = getTranslations("bn");

  return (
    <main className="flex-1 bg-background">
      {/* Unified Modern Hero & Context Header */}
      <InnerPageHero
        badge={t.registrationPage.badge}
        badgeIcon={Heart}
        badgePulse={true}
        title={t.registrationPage.heading}
        description={t.registrationPage.subtitle}
      >
        {/* Dedicated Modern Donor Callout Banner */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-primary/25 bg-gradient-to-r from-primary/[0.08] via-surface to-rose-500/[0.06] p-4 sm:p-5 lg:p-6 shadow-xs transition-all hover:border-primary/40 group">
          <div
            className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-primary/10 blur-2xl group-hover:bg-primary/15 transition-colors"
            aria-hidden="true"
          />

          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
            <div className="flex items-start gap-3.5 sm:gap-4 min-w-0">
              <div className="flex size-11 sm:size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary to-rose-700 text-white shadow-sm ring-4 ring-primary/10 mt-0.5">
                <HeartPulse className="size-6 animate-pulse" aria-hidden="true" />
              </div>

              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 shadow-2xs">
                    <span className="relative flex size-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex rounded-full size-2 bg-primary" />
                    </span>
                    <span>স্বেচ্ছাসেবী রক্তদান মিশন</span>
                  </span>
                </div>

                <h2 className="text-base sm:text-lg md:text-xl font-black text-foreground tracking-tight leading-snug">
                  আপনার ১ ব্যাগ রক্ত বাঁচাতে পারে একটি মুমূর্ষু জীবন
                </h2>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
                  রক্তবন্ধু সম্পূর্ণ বিনামূল্যে পরিচালিত একটি মানবিক প্ল্যাটফর্ম। আপনার মোবাইল নম্বর সুরক্ষিত রেখে এবং প্রাপ্যতা নিজের নিয়ন্ত্রণে রেখে নিরাপদে রক্তদান করতে পারেন।
                </p>
              </div>
            </div>

            {/* Platform Trust & Safety Badges */}
            <div className="shrink-0 flex flex-wrap items-center gap-2.5 pt-1 md:pt-0 w-full md:w-auto">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-border/80 text-foreground text-xs font-bold shadow-2xs">
                <Sparkles className="size-4 text-primary shrink-0" aria-hidden="true" />
                <span>১০০% অবাণিজ্যিক মানবিক সেবা</span>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Trust & Safety Guarantees Bar */}
        <div className="pt-2 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
            <span>মোবাইল নম্বর ও তথ্যের সর্বোচ্চ গোপনীয়তা নিশ্চিত</span>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="size-4 text-primary shrink-0" aria-hidden="true" />
            <span>১০০% স্বেচ্ছাসেবী মানবিক উদ্যোগ</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-primary shrink-0" aria-hidden="true" />
            <span>৬৪ জেলা ও সকল উপজেলার জন্য প্রযোজ্য</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="size-4 text-primary shrink-0" aria-hidden="true" />
            <span>যেকোনো সময় প্রাপ্যতা পরিবর্তনযোগ্য</span>
          </div>
        </div>
      </InnerPageHero>

      {/* Main 12-Column Form & Guidelines Section */}
      <section className="py-8 sm:py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <React.Suspense
            fallback={
              <div className="h-96 rounded-3xl border border-border bg-surface/50 animate-pulse" />
            }
          >
            <DonorRegistrationForm locale="bn" />
          </React.Suspense>
        </div>
      </section>
    </main>
  );
}
