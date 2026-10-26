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
      number: "০১" === "০১" && locale === "bn" ? "১" : "1",
      icon: Search,
      title: t.home.howItWorks.step1Title,
      description: t.home.howItWorks.step1Desc,
    },
    {
      number: locale === "bn" ? "২" : "2",
      icon: PhoneCall,
      title: t.home.howItWorks.step2Title,
      description: t.home.howItWorks.step2Desc,
    },
    {
      number: locale === "bn" ? "৩" : "3",
      icon: HeartHandshake,
      title: t.home.howItWorks.step3Title,
      description: t.home.howItWorks.step3Desc,
    },
  ];

  return (
    <section
      aria-labelledby="how-it-works-heading"
      className="py-16 sm:py-20 lg:py-24 bg-background border-b border-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge
            variant="outline"
            className="border-primary/20 text-primary bg-primary/5 px-3 py-1 text-xs font-semibold rounded-full"
          >
            {t.home.howItWorks.badge}
          </Badge>
          <h2
            id="how-it-works-heading"
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight"
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
                className="relative overflow-hidden border border-border bg-surface transition-all duration-200 hover:shadow-md hover:border-primary/30"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/30 via-primary to-primary/30"
                  aria-hidden="true"
                />
                <CardContent className="pt-8 pb-6 px-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                      <Icon className="size-6" aria-hidden="true" />
                    </div>
                    <span className="text-2xl sm:text-3xl font-extrabold text-muted-foreground/30 font-mono leading-none select-none">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-foreground">
                    {step.title}
                  </h3>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
