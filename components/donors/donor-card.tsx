"use client";

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
  Flag,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";

import type { PublicDonorProfile, DonorPublicSummary } from "@/types/donor";
import { formatLocation } from "@/constants/locations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ReportModal } from "@/components/reports/report-modal";
import { getTranslations } from "@/i18n/translations";
import type { Locale } from "@/i18n/config";

interface DonorCardProps {
  donor: PublicDonorProfile | DonorPublicSummary;
  locale: Locale;
  onRequestContact?: (donor: PublicDonorProfile | DonorPublicSummary) => void;
}

export function DonorCard({ donor, locale, onRequestContact }: DonorCardProps) {
  const t = getTranslations(locale);
  const [reportOpen, setReportOpen] = React.useState(false);

  const locationText = formatLocation(
    {
      divisionId: donor.divisionId,
      districtId: donor.districtId,
      upazilaId: donor.upazilaId,
    },
    locale
  );

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
    <Card className="border border-border/80 bg-surface rounded-2xl hover:border-primary/40 transition-all duration-200 hover:shadow-md group overflow-hidden">
      <CardContent className="p-5 sm:p-6 space-y-5">
        {/* Top Header Row: Blood Group, Name, Location, Status Badge */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Blood Group Avatar */}
            <div className="flex size-13 sm:size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-rose-700 text-white font-black text-xl sm:text-2xl leading-none text-center shadow-xs shrink-0 select-none">
              <span className="leading-none flex items-center justify-center">
                {donor.bloodGroup}
              </span>
            </div>

            {/* Name and Location */}
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-base sm:text-lg text-foreground leading-tight tracking-tight">
                  {donor.displayName}
                </h3>
                {isPublicContact && (
                  <Badge variant="subtle" className="text-[10px] py-0 px-2 font-semibold">
                    {locale === "en" ? "Direct Call" : "সরাসরি কল"}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="size-3.5 text-primary shrink-0" aria-hidden="true" />
                <span className="truncate font-medium">{locationText}</span>
              </div>
            </div>
          </div>

          {/* Status Badge with accessible icon + text */}
          <div className="self-start sm:self-auto shrink-0">
            {donor.availabilityStatus === "available" ? (
              <Badge variant="available" className="text-xs font-bold gap-1.5 py-1 px-3 shadow-2xs">
                <CheckCircle2 className="size-3.5 shrink-0" aria-hidden="true" />
                <span>{t.domain.donorStatus.available}</span>
              </Badge>
            ) : donor.availabilityStatus === "pending" ? (
              <Badge variant="pending" className="text-xs font-bold gap-1.5 py-1 px-3 shadow-2xs">
                <Clock className="size-3.5 shrink-0" aria-hidden="true" />
                <span>{t.domain.donorStatus.pending}</span>
              </Badge>
            ) : (
              <Badge variant="unavailable" className="text-xs font-bold gap-1.5 py-1 px-3 shadow-2xs">
                <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
                <span>{t.domain.donorStatus.unavailable}</span>
              </Badge>
            )}
          </div>
        </div>

        {/* Middle Meta Row: Privacy Mode & Last Donation */}
        <div className="pt-3 border-t border-border/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Contact Visibility Indicator */}
            {isPublicContact ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 py-1 px-2.5 rounded-lg">
                <Phone className="size-3.5 shrink-0" aria-hidden="true" />
                <span className="font-mono font-bold tracking-wide">{donor.phoneNumber}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-muted-foreground bg-muted/30 border border-border/60 py-1 px-2.5 rounded-lg">
                <ShieldCheck
                  className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0"
                  aria-hidden="true"
                />
                <span className="font-medium">{t.donorsPage.results.contactProtected}</span>
              </span>
            )}

            {donor.lastDonationDate ? (
              <span className="inline-flex items-center gap-1.5 text-muted-foreground bg-muted/30 border border-border/60 py-1 px-2.5 rounded-lg">
                <Calendar className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span>
                  {t.donorsPage.results.lastDonationLabel}{" "}
                  <strong className="text-foreground">{donor.lastDonationDate}</strong>
                </span>
              </span>
            ) : null}
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 w-full sm:w-auto pt-2 sm:pt-0">
            {isPublicContact ? (
              /* PUBLIC MODE: Direct Calling with tel: */
              <Button
                asChild
                size="sm"
                className="flex-1 sm:flex-none min-h-[44px] px-4 text-xs sm:text-sm gap-2 font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              >
                <a href={`tel:${donor.phoneNumber}`}>
                  <PhoneCall className="size-4" aria-hidden="true" />
                  <span>{t.donorsPage.results.callNowCta}</span>
                </a>
              </Button>
            ) : (
              /* PRIVATE MODE: Direct Contact Request */
              <Button
                type="button"
                size="sm"
                onClick={() => onRequestContact?.(donor)}
                className="flex-1 sm:flex-none min-h-[44px] px-4 text-xs sm:text-sm gap-2 font-bold shadow-xs bg-primary hover:bg-primary-hover text-white"
              >
                <Send className="size-4" aria-hidden="true" />
                <span>{t.donorsPage.results.requestContactCta}</span>
              </Button>
            )}

            {/* Request Blood Secondary CTA */}
            <Button
              asChild
              size="sm"
              variant="outline"
              className="flex-1 sm:flex-none min-h-[44px] px-3.5 text-xs sm:text-sm gap-1.5 font-semibold border-border hover:bg-muted text-foreground"
            >
              <Link href={requestBloodHref} title={t.donorsPage.results.requestBloodCta}>
                <HeartHandshake className="size-4 text-primary shrink-0" aria-hidden="true" />
                <span>{t.donorsPage.results.requestBloodCta}</span>
              </Link>
            </Button>

            {/* Report Profile Action */}
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => setReportOpen(true)}
              className="min-h-[44px] min-w-[44px] text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
              title={locale === "en" ? "Report this donor profile" : "এই রক্তদাতার বিরুদ্ধে অভিযোগ করুন"}
              aria-label={locale === "en" ? "Report donor" : "অভিযোগ করুন"}
            >
              <Flag className="size-4" />
            </Button>
          </div>
        </div>

        {/* Security & Verification Modal */}
        <ReportModal
          isOpen={reportOpen}
          targetType="DONOR"
          targetId={donor.id}
          targetTitle={donor.displayName}
          locale={locale}
          onClose={() => setReportOpen(false)}
        />
      </CardContent>
    </Card>
  );
}
