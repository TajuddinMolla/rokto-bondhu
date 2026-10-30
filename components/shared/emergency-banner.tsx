"use client";

import * as React from "react";
import Link from "next/link";
import { HeartPulse, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useIsDonor } from "@/hooks/use-is-donor";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

interface EmergencyBannerProps {
  locale: Locale;
  className?: string;
}

export function EmergencyBanner({ locale, className }: EmergencyBannerProps) {
  const prefix = locale === "en" ? "/en" : "";
  const requestCreateHref = `${prefix}/blood-request/create`;
  const { isDonor } = useIsDonor();

  const donorActionLabel = isDonor
    ? (locale === "en" ? "Donor Profile" : "রক্তদাতা প্রোফাইল")
    : (locale === "en" ? "Become a Donor" : "রক্তদাতা হোন");

  return (
    <div
      role="region"
      aria-label={
        locale === "en"
          ? "Emergency blood requisition assistance"
          : "জরুরি রক্তের আবেদন সহায়তা"
      }
      className={cn(
        "relative overflow-hidden rounded-2xl sm:rounded-3xl border border-primary/25 bg-gradient-to-r from-rose-500/[0.08] via-surface to-primary/[0.06] p-4 sm:p-5 lg:p-6 shadow-xs transition-all hover:border-primary/40 group",
        className
      )}
    >
      {/* Soft ambient corner blur */}
      <div
        className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-primary/10 blur-2xl group-hover:bg-primary/15 transition-colors"
        aria-hidden="true"
      />

      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
        {/* Left Side: Pulse Glyph & Context */}
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
                <span>
                  {locale === "en" ? "Emergency Requisition" : "জরুরি জীবনরক্ষা সহায়তা"}
                </span>
              </span>
            </div>

            <h2 className="text-base sm:text-lg md:text-xl font-black text-foreground tracking-tight leading-snug">
              {locale === "en"
                ? "Need Blood Urgently for a Patient?"
                : "রোগীর জন্য জরুরি রক্তের প্রয়োজন?"}
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
              {locale === "en"
                ? "Post a verified blood request in 60 seconds to notify registered voluntary donors and coordinators nearby."
                : "নিকটস্থ রক্তদাতা ও ভলান্টিয়ার নেটওয়ার্কের তাৎক্ষণিক সাড়া পেতে মাত্র ৬০ সেকেন্ডে রক্তের আবেদন প্রকাশ করুন।"}
            </p>
          </div>
        </div>

        {/* Right Side: CTA Buttons */}
        <div className="shrink-0 flex flex-wrap items-center gap-2.5 self-start md:self-auto w-full md:w-auto pt-1 md:pt-0">
          <Button
            asChild
            size="default"
            className="flex-1 md:flex-initial min-h-[46px] px-6 rounded-xl font-black text-sm shadow-sm bg-gradient-to-r from-primary to-rose-700 hover:from-primary-hover hover:to-rose-800 text-white gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <Link href={requestCreateHref}>
              <span>{locale === "en" ? "Post Blood Request" : "রক্তের আবেদন করুন"}</span>
              <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="default"
            className="flex-1 md:flex-initial min-h-[46px] px-5 rounded-xl font-bold text-xs sm:text-sm border-border/80 hover:bg-muted text-foreground cursor-pointer"
          >
            <Link href={`${prefix}/donors/register`}>
              <span>{donorActionLabel}</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

