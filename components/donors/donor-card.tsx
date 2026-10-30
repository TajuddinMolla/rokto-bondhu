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
  Droplet,
  Heart,
} from "lucide-react";

import type { PublicDonorProfile, DonorPublicSummary } from "@/types/donor";
import { formatLocation } from "@/constants/locations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  }#request-form`;

  return (
    <article
      aria-label={`${donor.displayName} - ${donor.bloodGroup} Blood Donor`}
      className="relative overflow-hidden rounded-3xl border border-border/80 bg-surface/95 backdrop-blur-xs p-5 sm:p-7 shadow-xs hover:shadow-xl hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-200 group space-y-5"
    >
      {/* Top subtle highlight hairline that illuminates on card hover */}
      <div
        className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
        aria-hidden="true"
      />

      {/* Top Tier: Blood Group Shield + Identity + Live Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-4 sm:gap-5 min-w-0">
          {/* Striking Blood Group Badge Shield */}
          <div className="relative flex flex-col items-center justify-center size-16 sm:size-20 rounded-2xl bg-gradient-to-br from-rose-600 via-primary to-rose-900 text-white shadow-md shadow-primary/20 shrink-0 select-none overflow-hidden ring-4 ring-primary/10 group-hover:ring-primary/25 transition-all">
            <Droplet
              className="absolute -right-2 -bottom-2 size-12 fill-white/10 text-white/10 pointer-events-none"
              aria-hidden="true"
            />
            <span className="relative z-10 text-2xl sm:text-3xl font-black tracking-tight leading-none">
              {donor.bloodGroup}
            </span>
            <span className="relative z-10 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white/80 leading-tight mt-0.5">
              {locale === "en" ? "Group" : "গ্রুপ"}
            </span>
          </div>

          {/* Identity & Location */}
          <div className="space-y-1.5 min-w-0 pt-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-black text-lg sm:text-xl text-foreground tracking-tight leading-tight group-hover:text-primary transition-colors truncate">
                {donor.displayName}
              </h3>

              {/* Verified Volunteer Donor Chip */}
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-full shadow-2xs">
                <CheckCircle2 className="size-3.5 shrink-0" aria-hidden="true" />
                <span>{locale === "en" ? "Verified" : "ভেরিফায়েড"}</span>
              </span>

              {isPublicContact && (
                <Badge variant="subtle" className="text-[10px] py-0 px-2 font-bold rounded-md">
                  {locale === "en" ? "Direct Call" : "সরাসরি কল"}
                </Badge>
              )}
            </div>

            {/* Formatted Location Tag */}
            <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground bg-muted/40 border border-border/70 py-1 px-3 rounded-xl max-w-full">
              <MapPin className="size-3.5 text-primary shrink-0" aria-hidden="true" />
              <span className="truncate font-semibold text-foreground/90">{locationText}</span>
            </div>
          </div>
        </div>

        {/* Live Availability Status Pill */}
        <div className="self-start sm:self-auto shrink-0">
          {donor.availabilityStatus === "available" ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 shadow-2xs">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
              </span>
              <span>{t.domain.donorStatus.available}</span>
            </div>
          ) : donor.availabilityStatus === "pending" ? (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25 shadow-2xs">
              <Clock className="size-3.5 shrink-0" aria-hidden="true" />
              <span>{t.domain.donorStatus.pending}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-muted/70 text-muted-foreground border border-border shadow-2xs">
              <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
              <span>{t.domain.donorStatus.unavailable}</span>
            </div>
          )}
        </div>
      </div>

      {/* Middle Tier: Key Feature Attributes & Privacy Ribbon */}
      <div className="pt-2 flex flex-wrap items-center gap-2.5 text-xs">
        {/* Contact Mode Visibility Chip */}
        {isPublicContact ? (
          <div className="inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/25 py-1.5 px-3.5 rounded-xl shadow-2xs">
            <Phone className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="font-mono tracking-wider">{donor.phoneNumber}</span>
            <span className="text-[10px] uppercase font-bold text-emerald-700/80 dark:text-emerald-400/80">
              ({locale === "en" ? "Public" : "সরাসরি উন্মুক্ত"})
            </span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 text-muted-foreground bg-muted/40 border border-border/70 py-1.5 px-3.5 rounded-xl">
            <ShieldCheck
              className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0"
              aria-hidden="true"
            />
            <span className="font-semibold text-foreground/90">{t.donorsPage.results.contactProtected}</span>
            <span className="text-[11px] text-muted-foreground/80">
              ({locale === "en" ? "Private Mode" : "গোপনীয় সংরক্ষিত"})
            </span>
          </div>
        )}

        {/* Donation History Chip */}
        {donor.lastDonationDate ? (
          <div className="inline-flex items-center gap-2 text-muted-foreground bg-muted/40 border border-border/70 py-1.5 px-3.5 rounded-xl">
            <Calendar className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span>
              {t.donorsPage.results.lastDonationLabel}{" "}
              <strong className="text-foreground font-black">{donor.lastDonationDate}</strong>
            </span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 text-muted-foreground bg-muted/40 border border-border/70 py-1.5 px-3.5 rounded-xl">
            <Heart className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
            <span>
              {locale === "en"
                ? "Registered Voluntary Donor"
                : "স্বেচ্ছায় রক্তদানে নিবন্ধিত"}
            </span>
          </div>
        )}
      </div>

      {/* Bottom Tier: Elevated Action Dock */}
      <div className="pt-4 border-t border-border/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Reassurance text for desktop */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
          <span>
            {locale === "en"
              ? "Safe & non-commercial humanitarian coordination"
              : "নিরাপদ ও অবাণিজ্যিক মানবিক রক্তদান"}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {isPublicContact ? (
            /* PUBLIC MODE: Direct Calling Button */
            <Button
              asChild
              size="default"
              className="flex-1 sm:flex-none min-h-[46px] px-6 text-sm gap-2 font-black bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-sm shadow-emerald-600/20 active:scale-95 rounded-xl transition-all"
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
              size="default"
              onClick={() => onRequestContact?.(donor)}
              className="flex-1 sm:flex-none min-h-[46px] px-6 text-sm gap-2 font-black shadow-sm shadow-primary/20 bg-gradient-to-r from-primary via-primary to-rose-700 hover:from-primary-hover hover:to-rose-800 text-white active:scale-95 rounded-xl transition-all"
            >
              <Send className="size-4" aria-hidden="true" />
              <span>{t.donorsPage.results.requestContactCta}</span>
            </Button>
          )}

          {/* Request Blood Secondary CTA */}
          <Button
            asChild
            size="default"
            variant="outline"
            className="flex-1 sm:flex-none min-h-[46px] px-4 text-sm gap-2 font-bold border-border/80 hover:bg-muted text-foreground rounded-xl transition-colors"
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
            className="min-h-[46px] min-w-[46px] text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors shrink-0"
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
    </article>
  );
}
