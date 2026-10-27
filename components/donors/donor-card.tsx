import * as React from "react";
import Link from "next/link";
import { MapPin, Calendar, ShieldCheck, HeartHandshake } from "lucide-react";

import type { PublicDonorProfile, DonorPublicSummary } from "@/types/donor";
import { formatLocation } from "@/constants/locations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getTranslations } from "@/i18n/translations";
import type { Locale } from "@/i18n/config";

interface DonorCardProps {
  donor: PublicDonorProfile | DonorPublicSummary;
  locale: Locale;
}

export function DonorCard({ donor, locale }: DonorCardProps) {
  const t = getTranslations(locale);

  const locationText = formatLocation(
    {
      divisionId: donor.divisionId,
      districtId: donor.districtId,
      upazilaId: donor.upazilaId,
    },
    locale
  );

  const statusVariant =
    donor.availabilityStatus === "available"
      ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
      : donor.availabilityStatus === "pending"
      ? "border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10"
      : "border-border text-muted-foreground bg-muted/40";

  const requestHref = `${
    locale === "en" ? "/en" : ""
  }/blood-request/create?bloodGroup=${encodeURIComponent(
    donor.bloodGroup
  )}&division=${donor.divisionId}&district=${donor.districtId}&upazila=${donor.upazilaId}`;

  return (
    <Card className="border border-border bg-surface hover:border-primary/40 transition-all duration-200 hover:shadow-xs">
      <CardContent className="p-5 sm:p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-xl leading-none text-center shadow-xs shrink-0 select-none">
              <span className="leading-none flex items-center justify-center">
                {donor.bloodGroup}
              </span>
            </div>
            <div className="space-y-0.5">
              <h3 className="font-bold text-base sm:text-lg text-foreground leading-tight">
                {donor.displayName}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="size-3.5 text-primary shrink-0" aria-hidden="true" />
                <span className="truncate">{locationText}</span>
              </div>
            </div>
          </div>

          <Badge variant="outline" className={`text-xs ${statusVariant}`}>
            {t.domain.donorStatus[donor.availabilityStatus]}
          </Badge>
        </div>

        <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Privacy Protection Indicator: Never displays raw phone numbers */}
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
              <span>{t.donorsPage.results.contactProtected}</span>
            </span>

            {donor.lastDonationDate ? (
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <Calendar className="size-3.5 shrink-0" aria-hidden="true" />
                <span>
                  {t.donorsPage.results.lastDonationLabel} <strong>{donor.lastDonationDate}</strong>
                </span>
              </span>
            ) : null}
          </div>

          {/* Secure Contact Action: Links to Blood Request Creation */}
          <Button asChild size="sm" variant="outline" className="h-7 text-xs gap-1.5 font-medium border-primary/30 text-primary hover:bg-primary/10">
            <Link href={requestHref}>
              <HeartHandshake className="size-3.5" aria-hidden="true" />
              <span>{t.donorsPage.results.requestBloodCta}</span>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

