"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Droplet,
  Search,
  UserPlus,
  ShieldCheck,
  MapPin,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIsDonor } from "@/hooks/use-is-donor";
import { getTranslations } from "@/i18n/translations";
import { BLOOD_GROUPS, type BloodGroup } from "@/constants/blood-groups";
import type { Locale } from "@/i18n/config";

interface HeroSectionProps {
  locale: Locale;
}

export function HeroSection({ locale }: HeroSectionProps) {
  const t = getTranslations(locale);
  const router = useRouter();
  const { isDonor } = useIsDonor();

  const prefix = locale === "en" ? "/en" : "";
  const registerHref = `${prefix}/donors/register#registration-form`;
  const createRequestHref = `${prefix}/blood-request/create#request-form`;
  const donorsBaseHref = `${prefix}/donors`;

  const handleQuickGroupSelect = (group: BloodGroup) => {
    router.push(`${donorsBaseHref}?bloodGroup=${encodeURIComponent(group)}`);
  };

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-16 sm:py-20 lg:py-24 border-b border-border/70"
    >
      {/* Subtle ambient lighting */}
      <div
        className="pointer-events-none absolute -top-24 right-0 -z-10 size-96 rounded-full bg-primary/8 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 -z-10 size-80 rounded-full bg-primary/5 blur-3xl"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Mission, Headings & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Top Mission Pill */}
            <div className="flex justify-center lg:justify-start">
              <Badge
                variant="subtle"
                className="gap-2 px-3.5 py-1 text-xs font-bold rounded-full shadow-2xs border border-primary-border"
              >
                <span className="relative flex size-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full size-2 bg-primary" />
                </span>
                <span>
                  {locale === "en"
                    ? "Find Blood, Save Lives • রক্ত খুঁজুন, জীবন বাঁচান"
                    : "রক্ত খুঁজুন, জীবন বাঁচান • Find Blood, Save Lives"}
                </span>
              </Badge>
            </div>

            {/* Main Headline */}
            <h1
              id="hero-heading"
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.18] sm:leading-[1.15]"
            >
              {t.home.hero.headline}
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {t.home.hero.supporting}
            </p>

            {/* Action Buttons Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 pt-2">
              {/* Primary Action: Search Donors */}
              <Button
                asChild
                size="lg"
                className="shadow-xs font-semibold text-base min-h-[48px] bg-gradient-to-b from-primary via-primary to-rose-700 hover:from-primary-hover hover:to-rose-800 text-white border border-primary/20"
              >
                <a href="#search-panel">
                  <Search className="size-4.5 mr-2" aria-hidden="true" />
                  {t.home.hero.primaryCta}
                </a>
              </Button>

              {/* Emergency Requisition Action */}
              <Button
                asChild
                variant="outline"
                size="lg"
                className="min-h-[48px] font-semibold text-base border-border hover:bg-muted text-foreground"
              >
                <Link href={createRequestHref}>
                  <AlertCircle className="size-4.5 mr-2 text-primary" aria-hidden="true" />
                  <span>
                    {locale === "en" ? "Post Blood Request" : "রক্তের আবেদন করুন"}
                  </span>
                </Link>
              </Button>

              {/* Voluntary Donor Action */}
              {!isDonor ? (
                <Button
                  asChild
                  variant="ghost"
                  size="lg"
                  className="min-h-[48px] font-semibold text-base text-primary hover:bg-primary/10 hover:text-primary"
                >
                  <Link href={registerHref}>
                    <UserPlus className="size-4.5 mr-2" aria-hidden="true" />
                    {t.home.hero.secondaryCta}
                  </Link>
                </Button>
              ) : (
                <Button
                  asChild
                  variant="ghost"
                  size="lg"
                  className="min-h-[48px] font-semibold text-base text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-700"
                >
                  <Link href={registerHref}>
                    <ShieldCheck className="size-4.5 mr-2" aria-hidden="true" />
                    <span>{locale === "en" ? "Donor Profile" : "রক্তদাতা প্রোফাইল"}</span>
                  </Link>
                </Button>
              )}
            </div>

            {/* Real Platform Capabilities Matrix (No Fake Stats) */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-border/80 max-w-lg mx-auto lg:mx-0">
              <div className="space-y-1">
                <div className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
                  {t.home.hero.quickStat1}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t.home.hero.quickStat1Desc}
                </div>
              </div>
              <div className="space-y-1 border-x border-border/80 px-2 sm:px-4">
                <div className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
                  {t.home.hero.quickStat2}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t.home.hero.quickStat2Desc}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-lg sm:text-xl font-extrabold text-primary tracking-tight">
                  {t.home.hero.quickStat3}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t.home.hero.quickStat3Desc}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Instant Blood Discovery Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md">
              {/* Outer soft ambient glow */}
              <div
                className="absolute inset-0 -m-3 rounded-3xl bg-gradient-to-tr from-primary/15 via-rose-500/5 to-transparent blur-xl pointer-events-none"
                aria-hidden="true"
              />

              {/* Discovery Card */}
              <div className="relative rounded-2xl border border-border/80 bg-surface/95 backdrop-blur-md p-6 sm:p-7 shadow-xl space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between pb-5 border-b border-border/80">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-rose-600 text-white shadow-xs">
                      <Droplet className="size-6 fill-current" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="font-extrabold text-foreground text-base leading-tight">
                        {locale === "en" ? "Instant Blood Discovery" : "তাৎক্ষণিক রক্তদাতা অনুসন্ধান"}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {locale === "en"
                          ? "Tap your blood group below"
                          : "আপনার প্রয়োজনীয় গ্রুপে ট্যাপ করুন"}
                      </div>
                    </div>
                  </div>
                  <Badge variant="available" className="text-[11px] shrink-0 font-bold">
                    {t.domain.donorStatus.available}
                  </Badge>
                </div>

                {/* Interactive 8 Blood Groups Grid (Direct Search Links) */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <span>{t.home.bloodGroups.badge}</span>
                    <span className="text-[11px] font-normal normal-case text-primary">
                      {locale === "en" ? "1-Click Search" : "১-ক্লিকে অনুসন্ধান"}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2.5" role="group" aria-label="Quick Blood Group Search">
                    {BLOOD_GROUPS.map((group) => (
                      <button
                        key={group}
                        type="button"
                        onClick={() => handleQuickGroupSelect(group)}
                        title={
                          locale === "en"
                            ? `Find ${group} blood donors`
                            : `${group} রক্তদাতা অনুসন্ধান করুন`
                        }
                        aria-label={
                          locale === "en"
                            ? `Find ${group} blood donors`
                            : `${group} রক্তদাতা অনুসন্ধান করুন`
                        }
                        className="flex flex-col items-center justify-center h-12 rounded-xl border border-border bg-surface hover:border-primary/50 hover:bg-primary-subtle text-foreground hover:text-primary font-black text-sm tracking-tight transition-all duration-150 shadow-2xs hover:scale-105 active:scale-95 cursor-pointer touch-manipulation group"
                      >
                        <span className="leading-none group-hover:scale-110 transition-transform">
                          {group}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reassurance Footer */}
                <div className="pt-4 border-t border-border/80 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                    <span className="truncate">{t.home.becomeDonor.point3Title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4 text-primary shrink-0" aria-hidden="true" />
                    <span className="truncate">{t.home.hero.quickStat1Desc}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
