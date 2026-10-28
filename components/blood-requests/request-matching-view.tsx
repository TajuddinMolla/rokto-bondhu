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
  ArrowLeft,
  ShieldAlert,
  Search,
  RefreshCw,
  Navigation,
  CheckCircle2,
} from "lucide-react";

import { useBloodRequest } from "@/hooks/queries/use-blood-request";
import { useMatchingDonors } from "@/hooks/queries/use-matching-donors";
import { MatchingDonorCard } from "@/components/blood-requests/matching-donor-card";
import { ContactRequestModal } from "@/components/donors/contact-request-modal";
import { formatLocation } from "@/constants/locations";
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

function MatchingSkeleton() {
  return (
    <Card className="border border-border bg-surface p-5 sm:p-6 space-y-4 animate-pulse">
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
      <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
        <div className="h-4 w-28 bg-muted/40 rounded" />
        <div className="h-7 w-28 bg-muted/50 rounded-md" />
      </div>
    </Card>
  );
}

export function RequestMatchingView({
  requestId,
  locale,
}: RequestMatchingViewProps) {
  const t = getTranslations(locale);
  const prefix = locale === "en" ? "/en" : "";
  const myRequestsHref = `${prefix}/account/requests`;

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

  // Loading blood request skeleton
  if (isRequestLoading) {
    return (
      <div className="space-y-6">
        <div className="h-36 rounded-xl border border-border bg-surface animate-pulse" />
        <div className="space-y-4">
          <MatchingSkeleton />
          <MatchingSkeleton />
        </div>
      </div>
    );
  }

  // Blood Request Not Found State
  if (isRequestError || !bloodRequest) {
    return (
      <Card className="border border-border bg-surface text-center p-8 sm:p-12 space-y-4 max-w-lg mx-auto my-12">
        <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mx-auto">
          <AlertCircle className="size-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-foreground">
            {t.matchingDonors.notFoundTitle}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {t.matchingDonors.notFoundDesc}
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchRequest()}
            className="gap-1.5"
          >
            <RefreshCw className="size-3.5" />
            <span>{t.matchingDonors.retry}</span>
          </Button>
          <Button asChild size="sm">
            <Link href={myRequestsHref}>
              <span>{t.matchingDonors.backToRequests}</span>
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

  return (
    <div className="space-y-6">
      {/* Back Link & Header */}
      <div className="space-y-2 border-b border-border pb-4">
        <Link
          href={myRequestsHref}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>{t.matchingDonors.backToRequests}</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              <Droplet className="size-7 text-primary fill-current" />
              <span>{t.matchingDonors.pageTitle}</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {t.matchingDonors.pageSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Requisition Context Card */}
      <Card className="border border-primary/20 bg-primary/5 shadow-xs overflow-hidden">
        <CardHeader className="pb-3 border-b border-primary/10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-xl select-none shadow-xs">
                {bloodRequest.bloodGroup}
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg font-bold text-foreground">
                  {bloodRequest.requesterName}
                </CardTitle>
                <span className="text-xs text-muted-foreground block">
                  {bloodRequest.unitsNeeded} {t.matchingDonors.unitsNeeded}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant={bloodRequest.urgency === "critical" ? "destructive" : "default"}
                className="text-[10px] uppercase font-bold"
              >
                {t.domain.requestUrgency[bloodRequest.urgency]}
              </Badge>
              <StatusBadge status={bloodRequest.status} locale={locale} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-3 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-muted-foreground">
            {bloodRequest.hospitalName && (
              <div className="flex items-center gap-1.5">
                <Hospital className="size-3.5 text-primary shrink-0" />
                <span className="truncate">{bloodRequest.hospitalName}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <MapPin className="size-3.5 text-primary shrink-0" />
              <span className="truncate">{locationText || "—"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="size-3.5 text-primary shrink-0" />
              <span>
                {t.matchingDonors.neededAt}:{" "}
                <strong className="text-foreground">{bloodRequest.neededAt}</strong>
              </span>
            </div>
          </div>

          {bloodRequest.locationAddress && (
            <p className="text-xs text-muted-foreground bg-surface/60 p-2.5 rounded-lg border border-border/60">
              <span className="font-semibold text-foreground">
                {locale === "en" ? "Address / Ward:" : "ঠিকানা / ওয়ার্ড:"}{" "}
              </span>
              {bloodRequest.locationAddress}
            </p>
          )}

          {bloodRequest.additionalNotes && (
            <p className="text-xs text-muted-foreground italic bg-surface/60 p-2.5 rounded-lg border border-border/60">
              &ldquo;{bloodRequest.additionalNotes}&rdquo;
            </p>
          )}
        </CardContent>
      </Card>

      {/* Closed Requisition Notice */}
      {isClosed && (
        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/10 text-xs sm:text-sm flex items-start gap-3">
          <AlertCircle className="size-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <strong className="font-bold text-foreground block">
              {t.matchingDonors.closedNoticeTitle}
            </strong>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t.matchingDonors.closedNoticeDesc}
            </p>
          </div>
        </div>
      )}

      {/* Non-Medical Eligibility Disclaimer */}
      <div className="p-4 rounded-xl border border-border bg-muted/20 text-xs flex items-start gap-3">
        <ShieldAlert className="size-4.5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-0.5">
          <strong className="font-bold text-foreground block">
            {t.matchingDonors.disclaimerTitle}
          </strong>
          <p className="text-muted-foreground leading-relaxed">
            {t.matchingDonors.disclaimerDesc}
          </p>
        </div>
      </div>

      {/* Matching Scope & Availability Controls Bar */}
      <div className="p-4 rounded-xl border border-border bg-surface space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t.matchingDonors.scopeTitle}
            </span>
          </div>

          {/* Availability Filter Toggle */}
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

        {/* Location Scope Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border">
          {bloodRequest.upazilaId && (
            <button
              type="button"
              onClick={() => setScope("upazila")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                scope === "upazila"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-surface hover:bg-muted text-muted-foreground border border-border"
              }`}
            >
              <Navigation className="size-3" />
              <span>{t.matchingDonors.scopeUpazila}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setScope("district")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              scope === "district"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-surface hover:bg-muted text-muted-foreground border border-border"
            }`}
          >
            <span>{t.matchingDonors.scopeDistrict}</span>
          </button>

          <button
            type="button"
            onClick={() => setScope("division")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              scope === "division"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-surface hover:bg-muted text-muted-foreground border border-border"
            }`}
          >
            <span>{t.matchingDonors.scopeDivision}</span>
          </button>

          <button
            type="button"
            onClick={() => setScope("all")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              scope === "all"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-surface hover:bg-muted text-muted-foreground border border-border"
            }`}
          >
            <span>{t.matchingDonors.scopeAll}</span>
          </button>
        </div>
      </div>

      {/* Results Header Count */}
      {!isDonorsLoading && !isDonorsError && allDonors.length > 0 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span className="font-medium">
            {t.matchingDonors.resultsCount.replace(
              "{count}",
              String(allDonors.length)
            )}
          </span>
          <span className="text-[11px] text-muted-foreground italic">
            {locale === "en" ? "Prioritizing available donors" : "প্রস্তুত রক্তদাতাদের অগ্রাধিকার প্রদান করা হচ্ছে"}
          </span>
        </div>
      )}

      {/* Skeletons while Loading Matching Donors */}
      {isDonorsLoading && (
        <div className="space-y-4">
          <MatchingSkeleton />
          <MatchingSkeleton />
          <MatchingSkeleton />
        </div>
      )}

      {/* Error State */}
      {!isDonorsLoading && isDonorsError && (
        <Card className="border border-destructive/20 bg-destructive/5 p-6 sm:p-8 text-center space-y-4">
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
            className="gap-2 text-xs"
          >
            <RefreshCw className="size-3.5" />
            <span>{t.matchingDonors.retry}</span>
          </Button>
        </Card>
      )}

      {/* Empty State (0 Donors in selected scope) */}
      {!isDonorsLoading && !isDonorsError && allDonors.length === 0 && (
        <Card className="border border-border bg-surface text-center p-8 sm:p-12 space-y-6">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/40 text-muted-foreground mx-auto border border-border shadow-xs">
            <Search className="size-7" aria-hidden="true" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-base sm:text-lg font-bold text-foreground">
              {t.matchingDonors.noDonorsFound}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {t.matchingDonors.noDonorsFoundDesc}
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-muted/20 border border-border max-w-md mx-auto text-xs text-muted-foreground space-y-2">
            <p>{t.matchingDonors.tryWiderScope}</p>
            <div className="flex items-center justify-center gap-2 pt-1">
              {scope !== "district" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setScope("district")}
                  className="text-xs"
                >
                  {t.matchingDonors.scopeDistrict}
                </Button>
              )}
              {scope !== "division" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setScope("division")}
                  className="text-xs"
                >
                  {t.matchingDonors.scopeDivision}
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Donors List with Infinite Scroll Cursor */}
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
                className="w-full sm:w-auto min-w-[200px] gap-2 border-primary/30 text-primary hover:bg-primary/5 font-semibold text-xs"
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

      {/* Phase 13 Contact Request Modal Integration */}
      {contactTargetDonor && (
        <ContactRequestModal
          donor={contactTargetDonor}
          locale={locale}
          onClose={() => setContactTargetDonor(null)}
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
      <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-semibold gap-1">
        <CheckCircle2 className="size-3" />
        <span>{locale === "en" ? "Open" : "সক্রিয়"}</span>
      </Badge>
    );
  }
  if (status === "fulfilled") {
    return (
      <Badge className="bg-blue-500/10 text-blue-600 border border-blue-500/20 text-[10px] font-semibold">
        {locale === "en" ? "Fulfilled" : "সম্পন্ন"}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-muted-foreground text-[10px] font-semibold">
      {locale === "en" ? "Cancelled" : "বাতিল"}
    </Badge>
  );
}
