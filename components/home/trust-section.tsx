import { Shield, EyeOff, FileCheck2, AlertCircle, HeartHandshake } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getTranslations } from "@/i18n/translations";
import type { Locale } from "@/i18n/config";

interface TrustSectionProps {
  locale: Locale;
}

export function TrustSection({ locale }: TrustSectionProps) {
  const t = getTranslations(locale);

  const principles = [
    {
      icon: EyeOff,
      title: t.home.trust.principle1Title,
      description: t.home.trust.principle1Desc,
    },
    {
      icon: FileCheck2,
      title: t.home.trust.principle2Title,
      description: t.home.trust.principle2Desc,
    },
    {
      icon: AlertCircle,
      title: t.home.trust.principle3Title,
      description: t.home.trust.principle3Desc,
    },
    {
      icon: HeartHandshake,
      title: t.home.trust.principle4Title,
      description: t.home.trust.principle4Desc,
    },
  ];

  return (
    <section
      aria-labelledby="trust-safety-heading"
      className="py-16 sm:py-20 lg:py-24 bg-surface border-b border-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge
            variant="outline"
            className="border-primary/20 text-primary bg-primary/5 px-3 py-1 text-xs font-semibold rounded-full"
          >
            <Shield className="size-3.5 mr-1 text-primary" aria-hidden="true" />
            {t.home.trust.badge}
          </Badge>
          <h2
            id="trust-safety-heading"
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight"
          >
            {t.home.trust.sectionTitle}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {t.home.trust.sectionSubtitle}
          </p>
        </div>

        {/* 4 Responsible Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {principles.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card
                key={index}
                className="border border-border bg-background transition-shadow hover:shadow-xs"
              >
                <CardContent className="p-6 sm:p-8 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0 mt-0.5">
                      <Icon className="size-5" aria-hidden="true" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-base sm:text-lg font-bold text-foreground">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </div>
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
