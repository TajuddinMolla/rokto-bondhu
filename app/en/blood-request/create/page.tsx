import * as React from "react";
import type { Metadata } from "next";
import { PlusCircle } from "lucide-react";

import { constructMetadata } from "@/lib/seo/metadata";
import { getTranslations } from "@/i18n/translations";
import { Badge } from "@/components/ui/badge";
import { BloodRequestForm } from "@/components/forms/blood-request-form";

export const metadata: Metadata = constructMetadata({
  title: "Create a Blood Request",
  path: "/en/blood-request/create",
  locale: "en",
});

export default function EnCreateBloodRequestPage() {
  const t = getTranslations("en");

  return (
    <main className="flex-1 bg-background py-8 sm:py-12 lg:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        {/* Page Header */}
        <div className="space-y-3 text-center sm:text-left">
          <Badge
            variant="outline"
            className="border-destructive/30 text-destructive bg-destructive/5 px-3 py-1 text-xs font-semibold rounded-full"
          >
            <PlusCircle className="size-3.5 mr-1.5" aria-hidden="true" />
            {t.bloodRequestCreatePage.badge}
          </Badge>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
            {t.bloodRequestCreatePage.heading}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
            {t.bloodRequestCreatePage.subtitle}
          </p>
        </div>

        {/* Blood Request Form Component */}
        <React.Suspense
          fallback={
            <div className="h-96 rounded-xl border border-border bg-surface/50 animate-pulse" />
          }
        >
          <BloodRequestForm locale="en" />
        </React.Suspense>
      </div>
    </main>
  );
}
