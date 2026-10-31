"use client";

import Link from "next/link";
import { Heart, Clock, ShieldCheck, UserPlus, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIsDonor } from "@/hooks/use-is-donor";
import { useAuth } from "@/hooks/use-auth";
import { getTranslations } from "@/i18n/translations";
import type { Locale } from "@/i18n/config";

interface BecomeDonorSectionProps {
  locale: Locale;
}

export function BecomeDonorSection({ locale }: BecomeDonorSectionProps) {
  const t = getTranslations(locale);
  const { isDonor } = useIsDonor();
  const { user, status } = useAuth();
  const prefix = locale === "en" ? "/en" : "";
  const targetHref = `${prefix}/donors/register#registration-form`;
  const registerHref =
    status === "unauthenticated" || !user
      ? `${prefix}/login?redirect=${encodeURIComponent(targetHref)}`
      : targetHref;

  return (
    <section
      aria-labelledby="become-donor-heading"
      className="py-16 sm:py-20 lg:py-24 bg-background border-b border-border/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-br from-primary-subtle/70 via-surface to-surface border border-primary-border p-8 sm:p-12 lg:p-16 overflow-hidden shadow-lg">
          {/* Subtle background ambient blur */}
          <div
            className="pointer-events-none absolute -right-16 -top-16 size-80 rounded-full bg-primary/10 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -left-16 -bottom-16 size-72 rounded-full bg-rose-500/5 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative max-w-3xl space-y-6">
            <Badge
              variant="subtle"
              className="border-primary-border text-primary bg-primary-subtle px-3.5 py-1 text-xs font-bold rounded-full shadow-2xs"
            >
              <Heart className="size-3.5 mr-1.5 fill-current text-primary" aria-hidden="true" />
              {t.home.becomeDonor.badge}
            </Badge>

            <h2
              id="become-donor-heading"
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-foreground tracking-tight leading-[1.2]"
            >
              {t.home.becomeDonor.heading}
            </h2>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              {t.home.becomeDonor.subheading}
            </p>

            {/* 3 Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
              <div className="space-y-2 rounded-2xl bg-surface/80 border border-border/60 p-4">
                <div className="flex items-center gap-2 font-bold text-foreground text-sm">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-primary-subtle text-primary border border-primary-border">
                    <Clock className="size-4" aria-hidden="true" />
                  </div>
                  <span>{t.home.becomeDonor.point1Title}</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {t.home.becomeDonor.point1Desc}
                </p>
              </div>

              <div className="space-y-2 rounded-2xl bg-surface/80 border border-border/60 p-4">
                <div className="flex items-center gap-2 font-bold text-foreground text-sm">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-primary-subtle text-primary border border-primary-border">
                    <Heart className="size-4 fill-primary" aria-hidden="true" />
                  </div>
                  <span>{t.home.becomeDonor.point2Title}</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {t.home.becomeDonor.point2Desc}
                </p>
              </div>

              <div className="space-y-2 rounded-2xl bg-surface/80 border border-border/60 p-4">
                <div className="flex items-center gap-2 font-bold text-foreground text-sm">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-available-subtle text-available border border-available-border">
                    <ShieldCheck className="size-4" aria-hidden="true" />
                  </div>
                  <span>{t.home.becomeDonor.point3Title}</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {t.home.becomeDonor.point3Desc}
                </p>
              </div>
            </div>

            {!isDonor ? (
              <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Button
                  asChild
                  size="lg"
                  className="min-h-[48px] px-7 font-bold text-base shadow-sm bg-primary hover:bg-primary-hover text-white gap-2"
                >
                  <Link href={registerHref}>
                    <UserPlus className="size-4.5" aria-hidden="true" />
                    <span>{t.home.becomeDonor.cta}</span>
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Button
                  asChild
                  size="lg"
                  className="min-h-[48px] px-7 font-bold text-base shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                >
                  <Link href={registerHref}>
                    <ShieldCheck className="size-4.5" aria-hidden="true" />
                    <span>
                      {locale === "en"
                        ? "Manage Donor Profile"
                        : "রক্তদাতা প্রোফাইল পরিচালনা"}
                    </span>
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
