import { Search, PhoneCall, HeartHandshake } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getTranslations } from "@/i18n/translations";
import type { Locale } from "@/i18n/config";

interface HowItWorksSectionProps {
  locale: Locale;
}

export function HowItWorksSection({ locale }: HowItWorksSectionProps) {
  const t = getTranslations(locale);

  const steps = [
    {
      number: locale === "bn" ? "০১" : "01",
      icon: Search,
      title: t.home.howItWorks.step1Title,
      description: t.home.howItWorks.step1Desc,
    },
    {
      number: locale === "bn" ? "০২" : "02",
      icon: PhoneCall,
      title: t.home.howItWorks.step2Title,
      description: t.home.howItWorks.step2Desc,
    },
    {
      number: locale === "bn" ? "০৩" : "03",
      icon: HeartHandshake,
      title: t.home.howItWorks.step3Title,
      description: t.home.howItWorks.step3Desc,
    },
  ];

  return (
    <section
      aria-labelledby="how-it-works-heading"
      className="py-16 sm:py-20 lg:py-24 bg-background border-b border-border/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge
            variant="subtle"
            className="border-primary-border text-primary bg-primary-subtle px-3 py-1 text-xs font-semibold rounded-full"
          >
            {t.home.howItWorks.badge}
          </Badge>
          <h2
            id="how-it-works-heading"
            className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground tracking-tight"
          >
            {t.home.howItWorks.sectionTitle}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {t.home.howItWorks.sectionSubtitle}
          </p>
        </div>

        {/* 3 Steps Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card
                key={index}
                className="relative overflow-hidden border border-border/80 bg-surface rounded-2xl transition-all duration-200 hover:shadow-lg hover:border-primary/40 group"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-hidden="true"
                />
                <CardContent className="pt-8 pb-7 px-6 sm:px-7 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex size-13 items-center justify-center rounded-2xl bg-primary-subtle text-primary border border-primary-border group-hover:scale-105 transition-transform">
                      <Icon className="size-6.5" aria-hidden="true" />
                    </div>
                    <span className="text-3xl sm:text-4xl font-black text-muted-foreground/30 font-mono leading-none select-none">
                      {step.number}
                    </span>
                  </div>

                  <div className="space-y-2 pt-1">
                    <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
