"use client";

import * as React from "react";
import Link from "next/link";
import {
  Clock,
  MapPin,
  Hospital,
  Search,
  Flag,
  Droplet,
  ArrowRight,
  Share2,
  CheckCircle2,
  ShieldCheck,
  Globe,
} from "lucide-react";

import type { BloodRequestSummary } from "@/types/request";
import { formatLocation } from "@/constants/locations";
import { Button } from "@/components/ui/button";
import { ReportModal } from "@/components/reports/report-modal";
import { getTranslations } from "@/i18n/translations";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

interface RequestCardProps {
  request: BloodRequestSummary;
  locale: Locale;
}

function formatNeededDate(dateStr: string, locale: Locale): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString(locale === "bn" ? "bn-BD" : "en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dateStr;
  }
}

export function RequestCard({ request, locale }: RequestCardProps) {
  const t = getTranslations(locale);
  const [reportOpen, setReportOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const locationText = formatLocation(
    {
      divisionId: request.divisionId,
      districtId: request.districtId,
      upazilaId: request.upazilaId,
    },
    locale
  );

  const formattedDate = formatNeededDate(request.neededAt, locale);
  const requestHref = `${locale === "en" ? "/en" : ""}/blood-request/${request.id}`;

  const urgencyClasses =
    request.urgency === "critical"
      ? "bg-destructive/10 text-destructive border-destructive/30"
      : request.urgency === "urgent"
      ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30"
      : "bg-primary/10 text-primary border-primary/20";

  const handleShare = async () => {
    const shareUrl = typeof window !== "undefined" ? `${window.location.origin}${requestHref}` : requestHref;
    const shareTitle =
      locale === "en"
        ? `Urgent: ${request.bloodGroup} Blood Needed (${request.unitsNeeded} Units)`
        : `জরুরি: ${request.bloodGroup} রক্তের প্রয়োজন (${request.unitsNeeded} ব্যাগ)`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: `${shareTitle} - ${request.hospitalName || locationText}`,
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {
        // Silent fail
      }
    }
  };

  return (
    <article
      aria-label={`${request.bloodGroup} Blood Request - ${request.unitsNeeded} Units`}
      className="relative overflow-hidden rounded-3xl border border-border/80 bg-surface/95 backdrop-blur-xs p-5 sm:p-7 shadow-xs hover:shadow-xl hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-200 group space-y-5"
    >
      {/* Top subtle highlight hairline that illuminates on card hover */}
      <div
        className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
        aria-hidden="true"
      />

      {/* Top Tier: Blood Group Shield + Details + Live Urgency Badge */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-4 sm:gap-5 min-w-0">
          {/* Striking Blood Group Shield */}
          <div className="relative flex flex-col items-center justify-center size-16 sm:size-20 rounded-2xl bg-gradient-to-br from-rose-600 via-primary to-rose-900 text-white shadow-md shadow-primary/20 shrink-0 select-none overflow-hidden ring-4 ring-primary/10 group-hover:ring-primary/25 transition-all">
            <Droplet
              className="absolute -right-2 -bottom-2 size-12 fill-white/10 text-white/10 pointer-events-none"
              aria-hidden="true"
            />
            <span className="relative z-10 text-2xl sm:text-3xl font-black tracking-tight leading-none">
              {request.bloodGroup}
            </span>
            <span className="relative z-10 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white/80 leading-tight mt-0.5">
              {locale === "en" ? "Group" : "গ্রুপ"}
            </span>
          </div>

          {/* Requisition Title & Hospital/Location */}
          <div className="space-y-1.5 min-w-0 pt-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-black text-lg sm:text-xl text-foreground tracking-tight leading-tight group-hover:text-primary transition-colors">
                {locale === "bn"
                  ? `${request.unitsNeeded} ব্যাগ রক্ত প্রয়োজন`
                  : `${request.unitsNeeded} Bag${request.unitsNeeded > 1 ? "s" : ""} of Blood Needed`}
              </h3>

              {/* Scope Badge if Global */}
              {request.scope === "GLOBAL" && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 dark:text-blue-400 bg-blue-500/10 border border-blue-500/25 px-2.5 py-0.5 rounded-full shadow-2xs">
                  <Globe className="size-3.5 shrink-0" aria-hidden="true" />
                  <span>{locale === "en" ? "All Bangladesh" : "সারা দেশ"}</span>
                </span>
              )}
            </div>

            {/* Hospital Facility */}
            {request.hospitalName && (
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-foreground/90">
                <Hospital className="size-4 text-primary shrink-0" aria-hidden="true" />
                <span className="truncate">{request.hospitalName}</span>
              </div>
            )}

            {/* Location Area */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="size-3.5 text-primary shrink-0" aria-hidden="true" />
              <span className="truncate">{locationText}</span>
            </div>
          </div>
        </div>

        {/* Urgency Badge */}
        <div className="self-start shrink-0">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-2xs",
              urgencyClasses
            )}
          >
            {request.urgency === "critical" && (
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                <span className="relative inline-flex rounded-full size-2 bg-destructive" />
              </span>
            )}
            <span>{t.domain.requestUrgency[request.urgency]}</span>
          </span>
        </div>
      </div>

      {/* Middle Section: Clean Structured Info Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 text-xs">
        {/* Quantity */}
        <div className="p-3 rounded-2xl border border-border/70 bg-muted/20 space-y-1">
          <span className="text-[11px] text-muted-foreground block font-medium">
            {locale === "en" ? "Required Amount" : "রক্তের পরিমাণ"}
          </span>
          <div className="flex items-center gap-1.5 font-bold text-foreground">
            <Droplet className="size-3.5 text-primary shrink-0" />
            <span>
              {request.unitsNeeded} {locale === "en" ? (request.unitsNeeded > 1 ? "Bags" : "Bag") : "ব্যাগ"}
            </span>
          </div>
        </div>

        {/* Date Required */}
        <div className="p-3 rounded-2xl border border-border/70 bg-muted/20 space-y-1">
          <span className="text-[11px] text-muted-foreground block font-medium">
            {locale === "en" ? "Needed By" : "প্রয়োজনীয় সময়"}
          </span>
          <div className="flex items-center gap-1.5 font-bold text-foreground truncate">
            <Clock className="size-3.5 text-primary shrink-0" />
            <span className="truncate">{formattedDate}</span>
          </div>
        </div>

        {/* Verification Status */}
        <div className="p-3 rounded-2xl border border-border/70 bg-muted/20 space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[11px] text-muted-foreground block font-medium">
            {locale === "en" ? "Requisition Status" : "অনুরোধের স্ট্যাটাস"}
          </span>
          <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
            <ShieldCheck className="size-3.5 shrink-0" />
            <span>{locale === "en" ? "Active Broadcast" : "সক্রিয় সম্প্রচার"}</span>
          </div>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-border/60">
        {/* Primary Action Button */}
        <Button
          asChild
          size="default"
          className="gap-2 shadow-xs font-bold text-xs sm:text-sm rounded-xl min-h-[44px] px-5 flex-1 sm:flex-initial"
        >
          <Link href={requestHref}>
            <Search className="size-4" aria-hidden="true" />
            <span>{locale === "en" ? "Find Matching Donors" : "উপযুক্ত রক্তদাতা খুঁজুন"}</span>
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>

        {/* Secondary Actions (Share + Report) */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleShare}
            className="h-10 px-3.5 rounded-xl text-xs gap-1.5 font-medium hover:border-primary/50"
            title={locale === "en" ? "Share request link" : "অনুরোধের লিংক শেয়ার করুন"}
          >
            {copied ? (
              <>
                <CheckCircle2 className="size-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-semibold">
                  {locale === "en" ? "Copied" : "কপি হয়েছে"}
                </span>
              </>
            ) : (
              <>
                <Share2 className="size-3.5 text-muted-foreground" />
                <span>{locale === "en" ? "Share" : "শেয়ার"}</span>
              </>
            )}
          </Button>

          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => setReportOpen(true)}
            className="size-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            title={
              locale === "en"
                ? "Report this blood request"
                : "এই রক্তের অনুরোধটি রিপোর্ট করুন"
            }
            aria-label={locale === "en" ? "Report request" : "রিপোর্ট করুন"}
          >
            <Flag className="size-4" />
          </Button>
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={reportOpen}
        targetType="BLOOD_REQUEST"
        targetId={request.id}
        targetTitle={`${request.bloodGroup} (${request.unitsNeeded} units)`}
        locale={locale}
        onClose={() => setReportOpen(false)}
      />
    </article>
  );
}
