"use client";

import Link from "next/link";
import { Search, UserPlus, ArrowRight, Heart, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useIsDonor } from "@/hooks/use-is-donor";
import { getTranslations } from "@/i18n/translations";
import type { Locale } from "@/i18n/config";

interface FinalCtaSectionProps {
  locale: Locale;
}

export function FinalCtaSection({ locale }: FinalCtaSectionProps) {
  const t = getTranslations(locale);
  const { isDonor } = useIsDonor();
  const prefix = locale === "en" ? "/en" : "";
  const registerHref = `${prefix}/donors/register`;
  const donorsHref = `${prefix}/donors`;

  return (
    <section
      aria-labelledby="final-cta-heading"
      className="relative overflow-hidden py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-surface via-background to-background border-t border-border/80"
    >
      {/* Subtle ambient lighting */}
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 -z-10 size-96 rounded-full bg-primary/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl border border-border/80 bg-surface/90 backdrop-blur-md p-8 sm:p-12 lg:p-16 text-center space-y-6 shadow-xl">
          <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-primary-subtle text-primary border border-primary-border shadow-xs">
            <Heart className="size-6 fill-current" aria-hidden="true" />
          </div>

          <h2
            id="final-cta-heading"
            className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground max-w-2xl mx-auto leading-tight"
          >
            {t.home.finalCta.title}
          </h2>

          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {t.home.finalCta.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto min-h-[48px] px-8 bg-primary hover:bg-primary-hover text-white font-bold shadow-sm text-base gap-2"
            >
              <Link href={donorsHref}>
                <Search className="size-4.5" aria-hidden="true" />
                <span>{t.home.finalCta.findDonorsCta}</span>
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>

            {!isDonor ? (
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto min-h-[48px] px-7 border-border hover:bg-muted font-bold text-base gap-2"
              >
                <Link href={registerHref}>
                  <UserPlus className="size-4.5" aria-hidden="true" />
                  <span>{t.home.finalCta.registerCta}</span>
                </Link>
              </Button>
            ) : (
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto min-h-[48px] px-7 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-bold text-base gap-2"
              >
                <Link href={registerHref}>
                  <ShieldCheck className="size-4.5" aria-hidden="true" />
                  <span>{locale === "en" ? "Donor Profile" : "রক্তদাতা প্রোফাইল"}</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
