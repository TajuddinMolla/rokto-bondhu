"use client";

import * as React from "react";
import {
  MapPin,
  Calendar,
  ShieldCheck,
  PhoneCall,
  Send,
  Phone,
  CheckCircle2,
  Navigation,
} from "lucide-react";

import type { MatchingDonorItem } from "@/types/donor";
import { formatLocation } from "@/constants/locations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getTranslations } from "@/i18n/translations";
import type { Locale } from "@/i18n/config";

interface MatchingDonorCardProps {
  donor: MatchingDonorItem;
  locale: Locale;
  isRequestClosed?: boolean;
  onRequestContact?: (donor: MatchingDonorItem) => void;
}

export function MatchingDonorCard({
  donor,
  locale,
  isRequestClosed = false,
  onRequestContact,
}: MatchingDonorCardProps) {
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

  return (
    <Card className="border border-border bg-surface hover:border-primary/40 transition-all duration-200 hover:shadow-xs">
      <CardContent className="p-5 sm:p-6 space-y-4">
        {/* Header: Blood Group, Name, Location & Availability Status */}
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

        {/* Explainable Match Badges Strip */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {/* Exact Blood Group Match */}
          <Badge
            variant="outline"
            className="text-[11px] font-semibold border-primary/30 text-primary bg-primary/5 gap-1"
          >
            <CheckCircle2 className="size-3" aria-hidden="true" />
            <span>{t.matchingDonors.matchExactGroup}</span>
          </Badge>

          {/* Location Proximity Badge */}
          {donor.isSameUpazila ? (
            <Badge
              variant="outline"
              className="text-[11px] font-semibold border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 gap-1"
            >
              <Navigation className="size-3" aria-hidden="true" />
              <span>{t.matchingDonors.matchSameUpazila}</span>
            </Badge>
          ) : donor.isSameDistrict ? (
            <Badge
              variant="outline"
              className="text-[11px] font-semibold border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/10 gap-1"
            >
              <Navigation className="size-3" aria-hidden="true" />
              <span>{t.matchingDonors.matchSameDistrict}</span>
            </Badge>
          ) : donor.isSameDivision ? (
            <Badge
              variant="outline"
              className="text-[11px] font-semibold border-border text-muted-foreground bg-muted/40 gap-1"
            >
              <Navigation className="size-3" aria-hidden="true" />
              <span>{t.matchingDonors.matchSameDivision}</span>
            </Badge>
          ) : null}
        </div>

        {/* Footer: Privacy/Phone Details & Contact Action Buttons */}
        <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
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

          {/* Action Button: Call Now vs Request Contact */}
          <div className="flex items-center gap-2">
            {isRequestClosed ? (
              <span className="text-xs text-muted-foreground italic">
                {locale === "en" ? "Request closed" : "অনুরোধ সমাপ্ত"}
              </span>
            ) : isPublicContact ? (
              <Button
                asChild
                size="sm"
                className="h-8 text-xs gap-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              >
                <a href={`tel:${donor.phoneNumber}`}>
                  <PhoneCall className="size-3.5" aria-hidden="true" />
                  <span>{t.matchingDonors.callNow}</span>
                </a>
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                variant="default"
                onClick={() => onRequestContact?.(donor)}
                className="h-8 text-xs gap-1.5 font-semibold shadow-xs"
              >
                <Send className="size-3.5" aria-hidden="true" />
                <span>{t.matchingDonors.requestContact}</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

