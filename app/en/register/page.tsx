import * as React from "react";
import type { Metadata } from "next";
import { Heart } from "lucide-react";

import { constructMetadata } from "@/lib/seo/metadata";
import { getTranslations } from "@/i18n/translations";
import { Badge } from "@/components/ui/badge";
import { DonorRegistrationForm } from "@/components/forms/donor-registration-form";

export const metadata: Metadata = constructMetadata({
  title: "Donor Registration",
  path: "/en/register",
  locale: "en",
});

export default function EnRegisterPage() {
  const t = getTranslations("en");

  return (
    <main className="flex-1 bg-background py-8 sm:py-12 lg:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        {/* Page Header */}
        <div className="space-y-3 text-center sm:text-left">
          <Badge
            variant="outline"
            className="border-primary/30 text-primary bg-primary/5 px-3 py-1 text-xs font-semibold rounded-full"
          >
            <Heart className="size-3.5 mr-1.5" aria-hidden="true" />
            {t.registrationPage.badge}
          </Badge>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
            {t.registrationPage.heading}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
            {t.registrationPage.subtitle}
          </p>
        </div>

        {/* Registration Form Component */}
        <React.Suspense
          fallback={
            <div className="h-96 rounded-xl border border-border bg-surface/50 animate-pulse" />
          }
        >
          <DonorRegistrationForm locale="en" />
        </React.Suspense>
      </div>
    </main>
  );
}
