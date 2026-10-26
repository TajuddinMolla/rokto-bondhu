import * as React from "react";
import { Phone, MapPin, Calendar, ShieldCheck } from "lucide-react";

import type { DonorPublicSummary } from "@/types/donor";
import { formatLocation } from "@/constants/locations";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getTranslations } from "@/i18n/translations";
import type { Locale } from "@/i18n/config";

interface DonorCardProps {
  donor: DonorPublicSummary;
  locale: Locale;
}

export function DonorCard({ donor, locale }: DonorCardProps) {
  const t = getTranslations(locale);

  const locationText = formatLocation(
    {
      divisionId: donor.divisionId,
      districtId: donor.districtId,
      upazilaId: donor.upazilaId,
      area: donor.area,
    },
    locale
  );

  const statusVariant =
    donor.availabilityStatus === "available"
      ? "border-available/40 text-available bg-available/10"
      : donor.availabilityStatus === "pending"
      ? "border-pending/40 text-pending bg-pending/10"
      : "border-border text-muted-foreground bg-muted/40";

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
          {donor.isPhonePublic && donor.phoneNumber ? (
            <a
              href={`tel:${donor.phoneNumber}`}
              className="inline-flex items-center gap-1.5 text-primary font-semibold hover:underline"
            >
              <Phone className="size-3.5" aria-hidden="true" />
              <span>{donor.phoneNumber}</span>
            </a>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <ShieldCheck className="size-3.5 text-available" aria-hidden="true" />
              <span>{t.home.becomeDonor.point3Title}</span>
            </span>
          )}

          {donor.lastDonationDate ? (
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="size-3.5" aria-hidden="true" />
              <span>{donor.lastDonationDate}</span>
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
