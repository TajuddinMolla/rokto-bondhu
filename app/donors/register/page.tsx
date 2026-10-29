import * as React from "react";
import type { Metadata } from "next";
import { Heart, ShieldCheck, MapPin } from "lucide-react";

import { constructMetadata } from "@/lib/seo/metadata";
import { getTranslations } from "@/i18n/translations";
import { InnerPageHero } from "@/components/shared/inner-page-hero";
import { DonorRegistrationForm } from "@/components/forms/donor-registration-form";

export const metadata: Metadata = constructMetadata({
  title: "রক্তদাতা নিবন্ধন",
  path: "/donors/register",
  locale: "bn",
});

export default function DonorRegisterPage() {
  const t = getTranslations("bn");

  return (
    <main className="flex-1 bg-background">
      {/* Unified Modern Hero & Context Header */}
      <InnerPageHero
        badge={t.registrationPage.badge}
        badgeIcon={Heart}
        title={t.registrationPage.heading}
        description={t.registrationPage.subtitle}
      >
        {/* Trust Signals */}
        <div className="pt-2 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
            <span>আপনার মোবাইল নম্বর ও তথ্যের সর্বোচ্চ গোপনীয়তা নিশ্চিত</span>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="size-4 text-primary shrink-0" aria-hidden="true" />
            <span>১০০% স্বেচ্ছাসেবী মানবিক উদ্যোগ</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-primary shrink-0" aria-hidden="true" />
            <span>৬৪ জেলা ও সকল উপজেলার জন্য প্রযোজ্য</span>
          </div>
        </div>
      </InnerPageHero>

      {/* Form Content Section */}
      <section className="py-8 sm:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <React.Suspense
            fallback={
              <div className="h-96 rounded-2xl border border-border bg-surface/50 animate-pulse" />
            }
          >
            <DonorRegistrationForm locale="bn" />
          </React.Suspense>
        </div>
      </section>
    </main>
  );
}
