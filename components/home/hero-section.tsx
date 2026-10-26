import Link from "next/link";
import { Droplet, Search, UserPlus, ShieldCheck, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getTranslations } from "@/i18n/translations";
import type { Locale } from "@/i18n/config";

interface HeroSectionProps {
  locale: Locale;
}

export function HeroSection({ locale }: HeroSectionProps) {
  const t = getTranslations(locale);
  const registerHref = locale === "en" ? "/en/register" : "/register";

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-16 sm:py-24 lg:py-28 border-b border-border"
    >
      {/* Subtle decorative background circles */}
      <div
        className="pointer-events-none absolute -top-24 right-0 -z-10 size-96 rounded-full bg-primary/5 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 -z-10 size-80 rounded-full bg-primary/5 blur-3xl"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Text and CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="flex justify-center lg:justify-start">
              <Badge
                variant="outline"
                className="gap-1.5 border-primary/30 bg-primary/5 text-primary px-3.5 py-1 text-xs font-semibold rounded-full shadow-xs"
              >
                <Droplet className="size-3.5 fill-primary text-primary animate-pulse" aria-hidden="true" />
                <span>{t.home.hero.badge}</span>
              </Badge>
            </div>

            <h1
              id="hero-heading"
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]"
            >
              {t.home.hero.headline}
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {t.home.hero.supporting}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Button asChild size="lg" className="w-full sm:w-auto text-base shadow-sm font-semibold">
                <a href="#search-panel">
                  <Search className="size-4 mr-2" aria-hidden="true" />
                  {t.home.hero.primaryCta}
                </a>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto text-base border-primary/20 hover:border-primary/50 hover:bg-primary/5 hover:text-primary font-semibold"
              >
                <Link href={registerHref}>
                  <UserPlus className="size-4 mr-2" aria-hidden="true" />
                  {t.home.hero.secondaryCta}
                </Link>
              </Button>
            </div>

            {/* Micro Highlights */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-border/80 max-w-lg mx-auto lg:mx-0">
              <div className="space-y-1">
                <div className="text-xl sm:text-2xl font-bold text-foreground">
                  {t.home.hero.quickStat1}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t.home.hero.quickStat1Desc}
                </div>
              </div>
              <div className="space-y-1 border-x border-border/80 px-2 sm:px-4">
                <div className="text-xl sm:text-2xl font-bold text-foreground">
                  {t.home.hero.quickStat2}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t.home.hero.quickStat2Desc}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xl sm:text-2xl font-bold text-primary">
                  {t.home.hero.quickStat3}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t.home.hero.quickStat3Desc}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual / Graphic Composition */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md">
              {/* Outer decorative glow */}
              <div
                className="absolute inset-0 -m-3 rounded-3xl bg-gradient-to-tr from-primary/15 via-primary/5 to-transparent blur-xl"
                aria-hidden="true"
              />

              {/* Main Illustration Card */}
              <div className="relative rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-md">
                <div className="flex items-center justify-between pb-6 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                      <Droplet className="size-6 fill-primary" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="font-bold text-foreground text-base">
                        {t.brand.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t.brand.tagline}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-available/40 text-available bg-available/10 text-xs">
                    {t.domain.donorStatus.available}
                  </Badge>
                </div>

                {/* Visual Blood Group Badges Matrix */}
                <div className="py-6 space-y-4">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t.home.bloodGroups.badge}
                  </div>
                  <div className="grid grid-cols-4 gap-2.5">
                    {["A+", "B+", "O+", "AB+", "A-", "B-", "O-", "AB-"].map((group) => (
                      <div
                        key={group}
                        className="flex flex-col items-center justify-center py-2.5 rounded-lg border border-border bg-background hover:border-primary/40 hover:bg-primary/5 transition-colors"
                      >
                        <span className="font-extrabold text-foreground text-sm">
                          {group}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Platform Trust Highlights */}
                <div className="pt-4 border-t border-border grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-available shrink-0" aria-hidden="true" />
                    <span>{t.home.becomeDonor.point3Title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4 text-primary shrink-0" aria-hidden="true" />
                    <span>{t.home.hero.quickStat1Desc}</span>
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
