"use client";

import * as React from "react";
import Link from "next/link";
import {
  Droplet,
  MapPin,
  Calendar,
  Hospital,
  AlertCircle,
  Loader2,
  ShieldAlert,
  Search,
  RefreshCw,
  Navigation,
  CheckCircle2,
  PhoneCall,
  Share2,
  Flag,
  Clock,
  User,
  Check,
  Globe,
  FileText,
  ChevronRight,
  ShieldCheck,
  HeartHandshake,
  ArrowDown,
  Sparkles,
} from "lucide-react";

import { useBloodRequest } from "@/hooks/queries/use-blood-request";
import { useMatchingDonors } from "@/hooks/queries/use-matching-donors";
import { MatchingDonorCard } from "@/components/blood-requests/matching-donor-card";
import { ContactRequestModal } from "@/components/donors/contact-request-modal";
import { ReportModal } from "@/components/reports/report-modal";
import { formatLocation } from "@/constants/locations";
import {
  getCompatibleDonorGroups,
  isBloodGroup,
} from "@/constants/blood-groups";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTranslations } from "@/i18n/translations";
import type { Locale } from "@/i18n/config";
import type {
  MatchingLocationScope,
  MatchingDonorItem,
  PublicDonorProfile,
  DonorPublicSummary,
} from "@/types/donor";
import type { RequestStatus } from "@/types/blood";

interface RequestMatchingViewProps {
  requestId: string;
  locale: Locale;
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.711 1.456h.005c6.554 0 11.89-5.336 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function MatchingSkeleton() {
  return (
    <Card className="border border-border/80 bg-surface/90 p-5 sm:p-6 space-y-4 animate-pulse rounded-2xl">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-xl bg-muted/60 shrink-0" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-muted/60 rounded" />
            <div className="h-3 w-44 bg-muted/40 rounded" />
          </div>
        </div>
        <div className="h-5 w-20 bg-muted/50 rounded-full" />
      </div>
      <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-3">
        <div className="h-4 w-28 bg-muted/40 rounded" />
        <div className="h-7 w-28 bg-muted/50 rounded-md" />
      </div>
    </Card>
  );
}

function formatNeededDate(dateStr: string, locale: Locale): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString(locale === "bn" ? "bn-BD" : "en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dateStr;
  }
}

function formatPostedDate(dateStr: string, locale: Locale): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(locale === "bn" ? "bn-BD" : "en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function RequestMatchingView({
  requestId,
  locale,
}: RequestMatchingViewProps) {
  const t = getTranslations(locale);
  const prefix = locale === "en" ? "/en" : "";
  const allRequestsHref = `${prefix}/blood-request`;
  const homeHref = prefix || "/";

  // Fetch target blood request
  const {
    data: bloodRequest,
    isLoading: isRequestLoading,
    isError: isRequestError,
    refetch: refetchRequest,
  } = useBloodRequest(requestId);

  // Matching configuration state
  const [userSelectedScope, setUserSelectedScope] = React.useState<MatchingLocationScope | null>(null);
  const [availabilityOnly, setAvailabilityOnly] = React.useState(true);
  const [contactTargetDonor, setContactTargetDonor] = React.useState<
    PublicDonorProfile | DonorPublicSummary | null
  >(null);
  const [isReportModalOpen, setIsReportModalOpen] = React.useState(false);
  const [isLinkCopied, setIsLinkCopied] = React.useState(false);

  // Compute default initial scope: Upazila if request has upazilaId, otherwise district
  const defaultScope: MatchingLocationScope = bloodRequest?.upazilaId
    ? "upazila"
    : bloodRequest?.districtId
    ? "district"
    : "division";

  const scope: MatchingLocationScope = userSelectedScope ?? defaultScope;
  const setScope = setUserSelectedScope;

  // Query matching donors
  const matchingParams = React.useMemo(
    () => ({
      bloodGroup: bloodRequest?.bloodGroup || "",
      divisionId: bloodRequest?.divisionId || "",
      districtId: bloodRequest?.districtId || "",
      upazilaId: bloodRequest?.upazilaId || undefined,
      scope,
      availabilityOnly,
    }),
    [bloodRequest, scope, availabilityOnly]
  );

  const {
    data: matchingPages,
    isLoading: isDonorsLoading,
    isError: isDonorsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchDonors,
  } = useMatchingDonors(matchingParams, {
    requestId,
    enabled: Boolean(bloodRequest?.bloodGroup),
    pageSize: 20,
  });

  const allDonors: MatchingDonorItem[] =
    matchingPages?.pages.flatMap((page) => page.donors) ?? [];

  // Share handlers
  const handleCopyLink = async () => {
    if (typeof window === "undefined") return;
    const shareUrl = window.location.href;
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setIsLinkCopied(true);
        setTimeout(() => setIsLinkCopied(false), 2500);
      } catch {
        // Fallback
      }
    }
  };

  const handleShareNative = async () => {
    if (!bloodRequest) return;
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    const shareTitle =
      locale === "en"
        ? `Emergency: ${bloodRequest.bloodGroup} Blood Needed (${bloodRequest.unitsNeeded} Bag${bloodRequest.unitsNeeded > 1 ? "s" : ""})`
        : `জরুরি: ${bloodRequest.bloodGroup} রক্ত প্রয়োজন (${bloodRequest.unitsNeeded} ব্যাগ)`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: `${shareTitle} - ${bloodRequest.hospitalName || ""}`,
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    await handleCopyLink();
  };

  const handleWhatsAppShare = () => {
    if (!bloodRequest) return;
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    const locText = formatLocation(
      {
        divisionId: bloodRequest.divisionId,
        districtId: bloodRequest.districtId,
        upazilaId: bloodRequest.upazilaId,
      },
      locale
    );

    const shareText =
      locale === "en"
        ? `🚨 EMERGENCY BLOOD REQUEST\n🩸 Blood Group: ${bloodRequest.bloodGroup} (${bloodRequest.unitsNeeded} ${bloodRequest.unitsNeeded > 1 ? "Bags" : "Bag"})\n🏥 Hospital: ${bloodRequest.hospitalName || "Not specified"}\n📍 Location: ${locText}\n⏰ Needed By: ${formatNeededDate(bloodRequest.neededAt, locale)}\n📞 Contact: ${bloodRequest.contactNumber} (${bloodRequest.requesterName})\n\n👉 View details & available donors:\n${shareUrl}\n\n- Shared via RoktoBondhu (রক্তবন্ধু)`
        : `🚨 জরুরি রক্তের আবেদন!\n🩸 রক্তের গ্রুপ: ${bloodRequest.bloodGroup} (${bloodRequest.unitsNeeded} ব্যাগ)\n🏥 হাসপাতাল: ${bloodRequest.hospitalName || "নির্দিষ্ট করা নেই"}\n📍 এলাকা: ${locText}\n⏰ প্রয়োজনের সময়: ${formatNeededDate(bloodRequest.neededAt, locale)}\n📞 যোগাযোগ: ${bloodRequest.contactNumber} (${bloodRequest.requesterName})\n\n👉 রোগীর বিস্তারিত ও রক্তদাতা দেখতে ক্লিক করুন:\n${shareUrl}\n\n- রক্তবন্ধু (RoktoBondhu) এর মাধ্যমে প্রচারিত`;

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  const scrollToDonors = () => {
    const el = document.getElementById("matching-donors-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Loading skeleton state
  if (isRequestLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-200">
        <div className="h-48 rounded-3xl border border-border/80 bg-surface/50 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 h-[420px] rounded-3xl border border-border/80 bg-surface animate-pulse" />
          <div className="lg:col-span-7 space-y-4">
            <MatchingSkeleton />
            <MatchingSkeleton />
            <MatchingSkeleton />
          </div>
        </div>
      </div>
    );
  }

  // Not Found State
  if (isRequestError || !bloodRequest) {
    return (
      <Card className="border border-border/80 bg-surface/95 text-center p-8 sm:p-14 space-y-5 max-w-lg mx-auto my-12 rounded-3xl shadow-sm">
        <div className="inline-flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mx-auto">
          <AlertCircle className="size-8" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-foreground">
            {t.matchingDonors.notFoundTitle}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {t.matchingDonors.notFoundDesc}
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchRequest()}
            className="gap-2 rounded-xl"
          >
            <RefreshCw className="size-3.5" />
            <span>{t.matchingDonors.retry}</span>
          </Button>
          <Button asChild size="sm" className="rounded-xl font-semibold">
            <Link href={allRequestsHref}>
              <span>{t.matchingDonors.backToAllRequests || t.matchingDonors.allRequests}</span>
            </Link>
          </Button>
        </div>
      </Card>
    );
  }

  const locationText = formatLocation(
    {
      divisionId: bloodRequest.divisionId,
      districtId: bloodRequest.districtId,
      upazilaId: bloodRequest.upazilaId,
    },
    locale
  );

  const isClosed = bloodRequest.status !== "open";
  const urgencyLabel = t.domain.requestUrgency[bloodRequest.urgency] || bloodRequest.urgency;

  const urgencyStyles =
    bloodRequest.urgency === "critical"
      ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30"
      : bloodRequest.urgency === "urgent"
      ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
      : "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30";

  // Compatible donor groups for medical helper
  const compatibleGroups = isBloodGroup(bloodRequest.bloodGroup)
    ? getCompatibleDonorGroups(bloodRequest.bloodGroup)
    : [bloodRequest.bloodGroup];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* ----------------------------------------------------------------- */}
      {/* 1. DEDICATED MODERN EMERGENCY REQUISITION HERO BANNER             */}
      {/* ----------------------------------------------------------------- */}
      <section
        role="region"
        aria-label={t.matchingDonors.emergencyBannerHeading}
        className="relative overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-rose-500/[0.08] via-surface to-primary/[0.05] p-5 sm:p-7 lg:p-8 shadow-sm transition-all"
      >
        {/* Soft Ambient Corner Glows */}
        <div
          className="pointer-events-none absolute -right-16 -top-16 size-72 rounded-full bg-primary/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-0 left-1/3 size-64 rounded-full bg-rose-500/10 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative space-y-6">
          {/* Breadcrumbs & Live Status Badges Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
            {/* Breadcrumb Navigation */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-medium text-muted-foreground flex-wrap">
              <Link href={homeHref} className="hover:text-foreground transition-colors">
                {t.nav.home}
              </Link>
              <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />
              <Link href={allRequestsHref} className="hover:text-foreground transition-colors">
                {t.matchingDonors.allRequests}
              </Link>
              <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="text-foreground font-bold">
                {bloodRequest.bloodGroup} • {bloodRequest.unitsNeeded} {t.matchingDonors.units}
              </span>
            </nav>

            {/* Badges Cluster */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-2xs ${urgencyStyles}`}>
                <span className="size-2 rounded-full bg-current animate-ping" />
                <span>{urgencyLabel}</span>
              </span>

              <StatusBadge status={bloodRequest.status} locale={locale} />

              {bloodRequest.scope === "GLOBAL" && (
                <Badge variant="outline" className="text-[11px] font-bold border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5">
                  <Globe className="size-3 mr-1" />
                  <span>{t.matchingDonors.scopeGlobal}</span>
                </Badge>
              )}
            </div>
          </div>

          {/* Main Hero Requisition Presentation */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left: Giant Blood Emblem + Requisition Title */}
            <div className="lg:col-span-8 flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6 min-w-0">
              {/* High-Impact Blood Group Emblem */}
              <div className="relative flex flex-col items-center justify-center size-24 sm:size-28 rounded-3xl bg-gradient-to-br from-rose-600 via-primary to-rose-900 text-white shadow-xl shadow-primary/25 shrink-0 select-none overflow-hidden ring-4 ring-primary/20">
                <Droplet
                  className="absolute -right-2 -bottom-2 size-16 fill-white/10 text-white/10 pointer-events-none"
                  aria-hidden="true"
                />
                <span className="relative z-10 text-4xl sm:text-5xl font-black tracking-tight leading-none drop-shadow-sm">
                  {bloodRequest.bloodGroup}
                </span>
                <span className="relative z-10 text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-white/90 leading-tight mt-1">
                  {locale === "en" ? "Group" : "গ্রুপ"}
                </span>
              </div>

              {/* Title & Core Summary */}
              <div className="space-y-2 min-w-0 flex-1">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                  <Sparkles className="size-3.5" aria-hidden="true" />
                  <span>{t.matchingDonors.emergencyBannerHeading}</span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground tracking-tight leading-tight">
                  {locale === "bn"
                    ? `${bloodRequest.unitsNeeded} ব্যাগ ${bloodRequest.bloodGroup} রক্ত প্রয়োজন`
                    : `${bloodRequest.unitsNeeded} Bag${bloodRequest.unitsNeeded > 1 ? "s" : ""} of ${bloodRequest.bloodGroup} Blood Needed`}
                </h1>

                {/* Key Facility & Patient Info */}
                <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs sm:text-sm text-muted-foreground pt-1">
                  {bloodRequest.hospitalName && (
                    <div className="flex items-center gap-1.5 font-semibold text-foreground">
                      <Hospital className="size-4 text-primary shrink-0" aria-hidden="true" />
                      <span className="truncate">{bloodRequest.hospitalName}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-primary shrink-0" aria-hidden="true" />
                    <span>{locationText}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <User className="size-3.5 text-primary shrink-0" aria-hidden="true" />
                    <span>{bloodRequest.requesterName}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Quick Metric Cards in Hero */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 sm:p-3.5 rounded-2xl border border-border/80 bg-surface/80 backdrop-blur-xs space-y-1 shadow-2xs">
                <span className="text-[11px] text-muted-foreground font-medium block">
                  {locale === "en" ? "Needed Units" : "প্রয়োজনীয় পরিমাণ"}
                </span>
                <span className="text-base sm:text-lg font-black text-foreground block">
                  {bloodRequest.unitsNeeded} {t.matchingDonors.units}
                </span>
              </div>

              <div className="p-3 sm:p-3.5 rounded-2xl border border-border/80 bg-surface/80 backdrop-blur-xs space-y-1 shadow-2xs">
                <span className="text-[11px] text-muted-foreground font-medium block">
                  {t.matchingDonors.neededAt}
                </span>
                <span className="text-xs sm:text-sm font-bold text-foreground block truncate">
                  {formatNeededDate(bloodRequest.neededAt, locale)}
                </span>
              </div>
            </div>
          </div>

          {/* Integrated Immediate Action Center */}
          <div className="pt-4 border-t border-border/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Primary Calling & WhatsApp Sharing CTA buttons */}
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              {!isClosed ? (
                <Button
                  asChild
                  size="lg"
                  className="rounded-2xl font-black text-xs sm:text-sm gap-2.5 shadow-md shadow-emerald-600/20 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white min-h-[48px] px-5 sm:px-6 cursor-pointer"
                >
                  <a href={`tel:${bloodRequest.contactNumber}`}>
                    <PhoneCall className="size-4.5 animate-bounce" />
                    <span>{t.matchingDonors.callRequester}</span>
                    <span className="font-mono text-xs sm:text-sm font-semibold opacity-95">
                      ({bloodRequest.contactNumber})
                    </span>
                  </a>
                </Button>
              ) : null}

              {/* 1-Tap WhatsApp Emergency Viral Share */}
              <Button
                type="button"
                onClick={handleWhatsAppShare}
                className="rounded-2xl font-black text-xs sm:text-sm gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white shadow-md shadow-green-600/20 min-h-[48px] px-5 cursor-pointer transition-all"
                title={locale === "en" ? "Share request on WhatsApp" : "অনুরোধটি হোয়াটসঅ্যাপে শেয়ার করুন"}
              >
                <WhatsAppIcon className="size-4.5" />
                <span>{t.matchingDonors.shareWhatsApp}</span>
              </Button>

              {/* Copy Link Button */}
              <Button
                type="button"
                variant="outline"
                onClick={handleCopyLink}
                className="rounded-2xl font-bold text-xs gap-2 min-h-[48px] px-4 border-border/80 hover:bg-muted/60 cursor-pointer"
              >
                {isLinkCopied ? (
                  <>
                    <Check className="size-4 text-emerald-600" />
                    <span className="text-emerald-600 font-bold">{t.matchingDonors.copied}</span>
                  </>
                ) : (
                  <>
                    <Share2 className="size-4 text-muted-foreground" />
                    <span>{t.matchingDonors.copyLink}</span>
                  </>
                )}
              </Button>
            </div>

            {/* Jump to Donors Button */}
            <Button
              type="button"
              variant="secondary"
              onClick={scrollToDonors}
              className="rounded-2xl font-bold text-xs gap-1.5 min-h-[48px] px-4 cursor-pointer self-start sm:self-auto shrink-0"
            >
              <span>{t.matchingDonors.scrollToDonors}</span>
              <ArrowDown className="size-3.5" />
            </Button>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* 2. MAIN TWO-COLUMN BALANCED WORKSPACE                             */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* LEFT COLUMN: Detailed Requisition & Compatibility Card (Sticky) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <Card className="rounded-3xl border border-border/80 bg-surface shadow-xs overflow-hidden">
            <CardHeader className="p-5 sm:p-6 bg-gradient-to-br from-primary/5 via-rose-500/5 to-transparent border-b border-border/60">
              <div className="flex items-center gap-2">
                <FileText className="size-4.5 text-primary" aria-hidden="true" />
                <CardTitle className="text-lg font-black text-foreground tracking-tight">
                  {locale === "en" ? "Requisition Details" : "অনুরোধের পূর্ণ বিবরণ"}
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent className="p-5 sm:p-6 space-y-5">
              {/* Closed Warning if not active */}
              {isClosed && (
                <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
                  <AlertCircle className="size-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <strong className="font-bold block">
                      {t.matchingDonors.closedNoticeTitle}
                    </strong>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {t.matchingDonors.closedNoticeDesc}
                    </p>
                  </div>
                </div>
              )}

              {/* Full Requisition Data Points */}
              <div className="space-y-3.5 text-xs sm:text-sm">
                {/* Hospital Information */}
                <div className="flex items-start gap-3 p-3.5 rounded-2xl border border-border/80 bg-muted/20">
                  <Hospital className="size-4.5 text-primary shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="text-[11px] text-muted-foreground block font-medium">
                      {t.matchingDonors.hospital}
                    </span>
                    <strong className="text-foreground font-bold block text-xs sm:text-sm">
                      {bloodRequest.hospitalName || (locale === "en" ? "Not specified" : "নির্দিষ্ট করা হয়নি")}
                    </strong>
                    {bloodRequest.locationAddress && (
                      <span className="text-[11px] text-muted-foreground block mt-0.5">
                        {bloodRequest.locationAddress}
                      </span>
                    )}
                  </div>
                </div>

                {/* Location Area */}
                <div className="flex items-start gap-3 p-3.5 rounded-2xl border border-border/80 bg-muted/20">
                  <MapPin className="size-4.5 text-primary shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="text-[11px] text-muted-foreground block font-medium">
                      {locale === "en" ? "District & Area" : "জেলা ও এলাকা"}
                    </span>
                    <strong className="text-foreground font-semibold block text-xs sm:text-sm">
                      {locationText || "—"}
                    </strong>
                  </div>
                </div>

                {/* Needed By Time */}
                <div className="flex items-start gap-3 p-3.5 rounded-2xl border border-border/80 bg-muted/20">
                  <Clock className="size-4.5 text-primary shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="text-[11px] text-muted-foreground block font-medium">
                      {t.matchingDonors.neededAt}
                    </span>
                    <strong className="text-foreground font-bold block text-xs sm:text-sm">
                      {formatNeededDate(bloodRequest.neededAt, locale)}
                    </strong>
                  </div>
                </div>

                {/* Date Published */}
                <div className="flex items-start gap-3 p-3.5 rounded-2xl border border-border/80 bg-muted/20">
                  <Calendar className="size-4.5 text-primary shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="text-[11px] text-muted-foreground block font-medium">
                      {locale === "en" ? "Request Published" : "অনুরোধ প্রকাশের তারিখ"}
                    </span>
                    <span className="text-foreground font-medium block text-xs">
                      {formatPostedDate(bloodRequest.createdAt, locale)}
                    </span>
                  </div>
                </div>

                {/* Additional Clinical Notes */}
                {bloodRequest.additionalNotes && (
                  <div className="p-4 rounded-2xl border border-border/80 bg-muted/30 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-primary text-xs font-bold">
                      <FileText className="size-3.5" />
                      <span>{t.matchingDonors.additionalNotes}</span>
                    </div>
                    <p className="text-xs text-muted-foreground italic leading-relaxed">
                      &ldquo;{bloodRequest.additionalNotes}&rdquo;
                    </p>
                  </div>
                )}
              </div>

              {/* ------------------------------------------------------------- */}
              {/* MEDICAL COMPATIBILITY ASSISTANT (LIFE-SAVING HELPER FEATURE) */}
              {/* ------------------------------------------------------------- */}
              <div className="p-4 rounded-2xl border border-primary/20 bg-primary/[0.03] space-y-3">
                <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-wider">
                  <HeartHandshake className="size-4" aria-hidden="true" />
                  <span>{t.matchingDonors.compatibilityTitle}</span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t.matchingDonors.compatibilitySubtitle}:
                </p>

                {/* Matrix Pills */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  {compatibleGroups.map((grp) => (
                    <span
                      key={grp}
                      className="inline-flex items-center justify-center px-2.5 py-1 rounded-xl bg-surface border border-primary/30 text-primary font-black text-xs shadow-2xs"
                    >
                      {grp}
                    </span>
                  ))}
                </div>

                <p className="text-[10px] text-muted-foreground leading-relaxed pt-1 border-t border-border/60">
                  {locale === "en"
                    ? "Under certified blood bank screening, whole blood or packed red cells from the groups above can be crossmatched."
                    : "হাসপাতালের ব্লাড ব্যাংকে ক্রস-ম্যাচিং পরীক্ষার মাধ্যমে উপরোক্ত রক্তের গ্রুপের রক্ত নিরাপদে গ্রহণ করা সম্ভব।"}
                </p>
              </div>

              {/* Utility Toolbar: General Native Share & Report Flag */}
              <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleShareNative}
                  className="flex-1 h-9 rounded-xl gap-2 text-xs font-semibold border-border/80 hover:bg-muted/60 cursor-pointer"
                >
                  <Share2 className="size-3.5" />
                  <span>{t.matchingDonors.shareRequisition}</span>
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsReportModalOpen(true)}
                  className="h-9 px-3 rounded-xl gap-1.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                >
                  <Flag className="size-3.5" />
                  <span className="hidden sm:inline">{t.matchingDonors.reportRequisition}</span>
                </Button>
              </div>

              {/* Trust & Non-Commercial Safety Disclaimer */}
              <div className="p-3.5 rounded-2xl border border-border/70 bg-muted/20 text-xs flex items-start gap-2.5 text-muted-foreground">
                <ShieldAlert className="size-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                <div className="space-y-0.5 leading-relaxed">
                  <strong className="font-bold text-foreground block text-[11px]">
                    {t.matchingDonors.disclaimerTitle}
                  </strong>
                  <p className="text-[11px]">
                    {t.matchingDonors.disclaimerDesc}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Matching Donors List & Location Controls */}
        <div id="matching-donors-section" className="lg:col-span-7 space-y-6 scroll-mt-24">
          {/* Section Header & Subtitle */}
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
              <ShieldCheck className="size-6 text-primary" />
              <span>{t.matchingDonors.matchingDonorsTitle}</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {t.matchingDonors.matchingDonorsSubtitle}
            </p>
          </div>

          {/* Location Scope & Availability Card */}
          <Card className="rounded-2xl border border-border/80 bg-surface shadow-xs p-4 sm:p-5 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t.matchingDonors.scopeTitle}
              </span>

              {/* Availability Filter Switch */}
              <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={availabilityOnly}
                  onChange={(e) => setAvailabilityOnly(e.target.checked)}
                  className="size-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                />
                <span>{t.matchingDonors.filterAvailableOnly}</span>
              </label>
            </div>

            {/* Scope Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/60">
              {bloodRequest.upazilaId && (
                <button
                  type="button"
                  onClick={() => setScope("upazila")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    scope === "upazila"
                      ? "bg-primary text-primary-foreground shadow-xs font-bold"
                      : "bg-surface hover:bg-muted text-muted-foreground border border-border/80"
                  }`}
                >
                  <Navigation className="size-3" />
                  <span>{t.matchingDonors.scopeUpazila}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setScope("district")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  scope === "district"
                    ? "bg-primary text-primary-foreground shadow-xs font-bold"
                    : "bg-surface hover:bg-muted text-muted-foreground border border-border/80"
                }`}
              >
                <span>{t.matchingDonors.scopeDistrict}</span>
              </button>

              <button
                type="button"
                onClick={() => setScope("division")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  scope === "division"
                    ? "bg-primary text-primary-foreground shadow-xs font-bold"
                    : "bg-surface hover:bg-muted text-muted-foreground border border-border/80"
                }`}
              >
                <span>{t.matchingDonors.scopeDivision}</span>
              </button>

              <button
                type="button"
                onClick={() => setScope("all")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  scope === "all"
                    ? "bg-primary text-primary-foreground shadow-xs font-bold"
                    : "bg-surface hover:bg-muted text-muted-foreground border border-border/80"
                }`}
              >
                <span>{t.matchingDonors.scopeAll}</span>
              </button>
            </div>
          </Card>

          {/* Results Count Bar */}
          {!isDonorsLoading && !isDonorsError && allDonors.length > 0 && (
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span className="font-bold text-foreground">
                {t.matchingDonors.resultsCount.replace(
                  "{count}",
                  String(allDonors.length)
                )}
              </span>
              <span className="text-[11px] text-muted-foreground italic hidden sm:inline">
                {locale === "en" ? "Prioritizing available voluntary donors" : "প্রস্তুত স্বেচ্ছাসেবী রক্তদাতাদের অগ্রাধিকার"}
              </span>
            </div>
          )}

          {/* Loading Skeletons */}
          {isDonorsLoading && (
            <div className="space-y-4">
              <MatchingSkeleton />
              <MatchingSkeleton />
              <MatchingSkeleton />
            </div>
          )}

          {/* Error State */}
          {!isDonorsLoading && isDonorsError && (
            <Card className="border border-destructive/20 bg-destructive/5 p-6 sm:p-8 text-center space-y-4 rounded-3xl">
              <div className="inline-flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertCircle className="size-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-foreground">
                  {t.donorsPage.results.errorTitle}
                </h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  {t.donorsPage.results.errorDesc}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => refetchDonors()}
                className="gap-2 text-xs rounded-xl"
              >
                <RefreshCw className="size-3.5" />
                <span>{t.matchingDonors.retry}</span>
              </Button>
            </Card>
          )}

          {/* Empty State with Broaden Scope Helpers */}
          {!isDonorsLoading && !isDonorsError && allDonors.length === 0 && (
            <Card className="border border-border/80 bg-surface/95 text-center p-8 sm:p-12 space-y-5 rounded-3xl shadow-xs">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/40 text-muted-foreground mx-auto border border-border shadow-2xs">
                <Search className="size-7" aria-hidden="true" />
              </div>

              <div className="max-w-md mx-auto space-y-1.5">
                <h3 className="text-base sm:text-lg font-bold text-foreground">
                  {t.matchingDonors.noDonorsFound}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {t.matchingDonors.noDonorsFoundDesc}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-muted/20 border border-border/70 max-w-md mx-auto text-xs text-muted-foreground space-y-2.5">
                <p className="font-medium text-foreground">{t.matchingDonors.tryWiderScope}</p>
                <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
                  {scope !== "district" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setScope("district")}
                      className="text-xs rounded-xl"
                    >
                      {t.matchingDonors.scopeDistrict}
                    </Button>
                  )}
                  {scope !== "division" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setScope("division")}
                      className="text-xs rounded-xl"
                    >
                      {t.matchingDonors.scopeDivision}
                    </Button>
                  )}
                  {scope !== "all" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setScope("all")}
                      className="text-xs rounded-xl"
                    >
                      {t.matchingDonors.scopeAll}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Donors List with Infinite Scroll */}
          {!isDonorsLoading && !isDonorsError && allDonors.length > 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {allDonors.map((donor) => (
                  <MatchingDonorCard
                    key={donor.id}
                    donor={donor}
                    locale={locale}
                    isRequestClosed={isClosed}
                    onRequestContact={setContactTargetDonor}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {hasNextPage && (
                <div className="pt-4 text-center">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isFetchingNextPage}
                    onClick={() => fetchNextPage()}
                    className="w-full sm:w-auto min-w-[220px] gap-2 border-primary/30 text-primary hover:bg-primary/5 font-semibold text-xs rounded-xl h-10 shadow-xs cursor-pointer"
                  >
                    {isFetchingNextPage ? (
                      <>
                        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                        <span>{t.matchingDonors.loadingMore}</span>
                      </>
                    ) : (
                      <span>{t.matchingDonors.loadMore}</span>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Contact Request Modal Integration */}
      {contactTargetDonor && (
        <ContactRequestModal
          donor={contactTargetDonor}
          locale={locale}
          onClose={() => setContactTargetDonor(null)}
        />
      )}

      {/* User Flag / Report Modal */}
      {bloodRequest && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          targetType="BLOOD_REQUEST"
          targetId={bloodRequest.id}
          targetTitle={`${bloodRequest.bloodGroup} Blood Request - ${bloodRequest.hospitalName || locationText}`}
          locale={locale}
        />
      )}
    </div>
  );
}

function StatusBadge({
  status,
  locale,
}: {
  status: RequestStatus;
  locale: Locale;
}) {
  if (status === "open") {
    return (
      <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[11px] font-bold gap-1 px-2.5 py-0.5 rounded-full">
        <CheckCircle2 className="size-3" />
        <span>{locale === "en" ? "Active" : "সক্রিয়"}</span>
      </Badge>
    );
  }
  if (status === "fulfilled") {
    return (
      <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
        {locale === "en" ? "Fulfilled" : "সম্পন্ন"}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-muted-foreground text-[11px] font-bold border-border px-2.5 py-0.5 rounded-full">
      {locale === "en" ? "Cancelled" : "বাতিল"}
    </Badge>
  );
}
