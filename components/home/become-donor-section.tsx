import Link from "next/link";
import { Heart, Clock, ShieldCheck, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getTranslations } from "@/i18n/translations";
import type { Locale } from "@/i18n/config";

interface BecomeDonorSectionProps {
  locale: Locale;
}

export function BecomeDonorSection({ locale }: BecomeDonorSectionProps) {
  const t = getTranslations(locale);
  const registerHref = locale === "en" ? "/en/donors/register" : "/donors/register";

  return (
    <section
      aria-labelledby="become-donor-heading"
      className="py-16 sm:py-20 lg:py-24 bg-background border-b border-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-br from-primary/10 via-background to-surface border border-primary/20 p-8 sm:p-12 lg:p-16 overflow-hidden shadow-sm">
          {/* Subtle background embellishment */}
          <div
            className="pointer-events-none absolute -right-16 -top-16 size-80 rounded-full bg-primary/10 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative max-w-3xl space-y-6">
            <Badge
              variant="outline"
              className="border-primary/30 text-primary bg-primary/5 px-3 py-1 text-xs font-semibold rounded-full"
            >
              <Heart className="size-3.5 mr-1.5 fill-primary text-primary" aria-hidden="true" />
              {t.home.becomeDonor.badge}
            </Badge>

            <h2
              id="become-donor-heading"
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-tight"
            >
              {t.home.becomeDonor.heading}
            </h2>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              {t.home.becomeDonor.subheading}
            </p>

            {/* 3 Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-bold text-foreground text-sm">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Clock className="size-4" aria-hidden="true" />
                  </div>
                  <span>{t.home.becomeDonor.point1Title}</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {t.home.becomeDonor.point1Desc}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 font-bold text-foreground text-sm">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Heart className="size-4 fill-primary" aria-hidden="true" />
                  </div>
                  <span>{t.home.becomeDonor.point2Title}</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {t.home.becomeDonor.point2Desc}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 font-bold text-foreground text-sm">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <ShieldCheck className="size-4 text-available" aria-hidden="true" />
                  </div>
                  <span>{t.home.becomeDonor.point3Title}</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {t.home.becomeDonor.point3Desc}
                </p>
              </div>
            </div>

            <div className="pt-6">
              <Button asChild size="lg" className="font-semibold text-base shadow-sm">
                <Link href={registerHref}>
                  <UserPlus className="size-4 mr-2" aria-hidden="true" />
                  {t.home.becomeDonor.cta}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
