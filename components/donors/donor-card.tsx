import * as React from "react";
import Link from "next/link";
import {
  MapPin,
  Calendar,
  ShieldCheck,
  PhoneCall,
  Send,
  HeartHandshake,
  Phone,
} from "lucide-react";

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
  onRequestContact?: (donor: PublicDonorProfile | DonorPublicSummary) => void;
}

export function DonorCard({ donor, locale, onRequestContact }: DonorCardProps) {
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

  const isPublicContact =
    donor.contactMode === "PUBLIC" && Boolean(donor.phoneNumber);

  const requestBloodHref = `${
    locale === "en" ? "/en" : ""
  }/blood-request/create?bloodGroup=${encodeURIComponent(
    donor.bloodGroup
  )}&division=${donor.divisionId}&district=${donor.districtId}&upazila=${
    donor.upazilaId
  }`;

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
            {/* Contact Visibility Badge */}
            {isPublicContact ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <Phone className="size-3.5 shrink-0" aria-hidden="true" />
                <span className="font-mono font-semibold">{donor.phoneNumber}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <ShieldCheck
                  className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0"
                  aria-hidden="true"
                />
                <span>{t.donorsPage.results.contactProtected}</span>
              </span>
            )}

            {donor.lastDonationDate ? (
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <Calendar className="size-3.5 shrink-0" aria-hidden="true" />
                <span>
                  {t.donorsPage.results.lastDonationLabel}{" "}
                  <strong>{donor.lastDonationDate}</strong>
                </span>
              </span>
            ) : null}
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2">
            {isPublicContact ? (
              /* PUBLIC MODE: Direct Calling with tel: */
              <Button
                asChild
                size="sm"
                className="h-8 text-xs gap-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              >
                <a href={`tel:${donor.phoneNumber}`}>
                  <PhoneCall className="size-3.5" aria-hidden="true" />
                  <span>{t.donorsPage.results.callNowCta}</span>
                </a>
              </Button>
            ) : (
              /* PRIVATE MODE: Direct Contact Request */
              <Button
                type="button"
                size="sm"
                variant="default"
                onClick={() => onRequestContact?.(donor)}
                className="h-8 text-xs gap-1.5 font-semibold shadow-xs"
              >
                <Send className="size-3.5" aria-hidden="true" />
                <span>{t.donorsPage.results.requestContactCta}</span>
              </Button>
            )}

            <Button
              asChild
              size="sm"
              variant="outline"
              className="h-8 text-xs gap-1 font-medium border-border hover:bg-muted"
            >
              <Link href={requestBloodHref} title={t.donorsPage.results.requestBloodCta}>
                <HeartHandshake className="size-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">
                  {t.donorsPage.results.requestBloodCta}
                </span>
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
