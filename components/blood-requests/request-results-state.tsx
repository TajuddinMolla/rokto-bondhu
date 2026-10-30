"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  PlusCircle,
  X,
  ShieldAlert,
  HeartHandshake,
  Radio,
  RefreshCw,
  Loader2,
  Droplet,
  RotateCcw,
} from "lucide-react";

import { useBloodRequestsFeed } from "@/hooks/queries/use-blood-requests-feed";
import { getDivisionById, getDistrictById, getUpazilaById } from "@/constants/locations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RequestCard } from "@/components/blood-requests/request-card";
import { getTranslations } from "@/i18n/translations";
import type { Locale } from "@/i18n/config";

interface RequestResultsStateProps {
  locale: Locale;
}

export function RequestResultsState({ locale }: RequestResultsStateProps) {
  const t = getTranslations(locale);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const bloodGroup = searchParams.get("bloodGroup");
  const divisionId = searchParams.get("division");
  const districtId = searchParams.get("district");
  const upazilaId = searchParams.get("upazila");
  const urgency = searchParams.get("urgency");

  const division = divisionId ? getDivisionById(divisionId) : undefined;
  const district = districtId ? getDistrictById(districtId) : undefined;
  const upazila = upazilaId ? getUpazilaById(upazilaId) : undefined;

  const filters = React.useMemo(
    () => ({
      bloodGroup: bloodGroup || null,
      divisionId: divisionId || null,
      districtId: districtId || null,
      upazilaId: upazilaId || null,
      urgency: urgency || null,
    }),
    [bloodGroup, divisionId, districtId, upazilaId, urgency]
  );

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isLiveConnected,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useBloodRequestsFeed({ filters, pageSize: 20 });

  const requests = React.useMemo(() => {
    return data?.pages.flatMap((page) => page.requests) ?? [];
  }, [data]);

  // Active filter pills
  const activeFilters = React.useMemo(() => {
    const list: { key: string; label: string; value: string }[] = [];

    if (bloodGroup) {
      list.push({
        key: "bloodGroup",
        label: t.bloodRequestsPage.filters.bloodGroupLabel,
        value: bloodGroup,
      });
    }
    if (division) {
      list.push({
        key: "division",
        label: t.bloodRequestsPage.filters.divisionLabel,
        value: locale === "en" ? division.nameEn : division.nameBn,
      });
    }
    if (district) {
      list.push({
        key: "district",
        label: t.bloodRequestsPage.filters.districtLabel,
        value: locale === "en" ? district.nameEn : district.nameBn,
      });
    }
    if (upazila) {
      list.push({
        key: "upazila",
        label: t.bloodRequestsPage.filters.upazilaLabel,
        value: locale === "en" ? upazila.nameEn : upazila.nameBn,
      });
    }
    if (urgency && urgency in t.domain.requestUrgency) {
      list.push({
        key: "urgency",
        label: t.bloodRequestsPage.filters.urgencyLabel,
        value: t.domain.requestUrgency[urgency as keyof typeof t.domain.requestUrgency],
      });
    }

    return list;
  }, [bloodGroup, division, district, upazila, urgency, locale, t]);

  const removeFilter = (key: string) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete(key);
    if (key === "division") {
      nextParams.delete("district");
      nextParams.delete("upazila");
    } else if (key === "district") {
      nextParams.delete("upazila");
    }

    const qs = nextParams.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const clearAllFilters = () => {
    router.replace(pathname, { scroll: false });
  };

  return (
    <div className="space-y-6">
      {/* Modern Results Header & Live Signal Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-3xl border border-border/80 bg-surface/95 backdrop-blur-xs shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-600 via-primary to-rose-900 text-white shadow-sm ring-4 ring-primary/10 shrink-0">
            <Droplet className="size-5 fill-current" />
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-base sm:text-lg text-foreground tracking-tight">
                {locale === "en" ? "Emergency Blood Requests" : "সক্রিয় রক্তের অনুরোধসমূহ"}
              </h2>
              <Badge variant="default" className="text-xs font-bold px-2 py-0.5 shadow-2xs">
                {requests.length}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {locale === "en"
                ? `Showing ${requests.length} open emergency blood request(s)`
                : `মোট ${requests.length} টি রক্তের সক্রিয় অনুরোধ দেখানো হচ্ছে`}
            </p>
          </div>
        </div>

        {/* Live Real-Time Feed Badge */}
        {isLiveConnected && (
          <div className="self-start sm:self-auto shrink-0">
            <span className="inline-flex items-center gap-2 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-bold rounded-full shadow-2xs">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
              </span>
              <Radio className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{locale === "en" ? "Live Real-Time Feed" : "লাইভ রিয়েল-টাইম ফিড"}</span>
            </span>
          </div>
        )}
      </div>

      {/* Active Filter Pills Bar */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 sm:p-3.5 rounded-2xl border border-border/80 bg-surface shadow-2xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground mr-1">
              {t.bloodRequestsPage.results.activeFiltersLabel}
            </span>
            {activeFilters.map((filter) => (
              <Badge
                key={filter.key}
                variant="subtle"
                className="gap-1.5 border-primary-border bg-primary-subtle text-primary py-1 px-2.5 rounded-xl text-xs font-bold shadow-2xs"
              >
                <span>
                  {filter.label}: <strong>{filter.value}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => removeFilter(filter.key)}
                  className="hover:text-primary-hover cursor-pointer p-0.5 rounded-full hover:bg-primary/10 transition-colors"
                  aria-label={`Remove ${filter.label} filter`}
                >
                  <X className="size-3" aria-hidden="true" />
                </button>
              </Badge>
            ))}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-xs text-muted-foreground hover:text-foreground h-8 px-2 gap-1.5"
          >
            <RotateCcw className="size-3" aria-hidden="true" />
            <span>{locale === "en" ? "Clear all" : "সব মুছুন"}</span>
          </Button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="space-y-4">
          <div className="h-44 rounded-3xl border border-border/80 bg-surface/50 animate-pulse" />
          <div className="h-44 rounded-3xl border border-border/80 bg-surface/50 animate-pulse" />
        </div>
      ) : isError ? (
        <Card className="border border-destructive/20 bg-destructive/5 text-center p-8 space-y-4 rounded-3xl shadow-xs">
          <ShieldAlert className="size-8 text-destructive mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">
              {locale === "en" ? "Failed to load blood requests" : "রক্তের অনুরোধ লোড করতে ব্যর্থ হয়েছে"}
            </h3>
            <p className="text-xs text-muted-foreground">{error?.message}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2 shadow-xs">
            <RefreshCw className="size-3.5" />
            <span>{locale === "en" ? "Retry" : "পুনরায় চেষ্টা করুন"}</span>
          </Button>
        </Card>
      ) : requests.length > 0 ? (
        /* Dynamic Real-Time Requisitions Feed */
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {requests.map((req) => (
              <RequestCard key={req.id} request={req} locale={locale} />
            ))}
          </div>

          {/* Load More Button */}
          {hasNextPage && (
            <div className="pt-4 text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="gap-2 px-6 font-semibold shadow-xs h-9 rounded-xl"
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>{locale === "en" ? "Loading more..." : "আরও লোড করা হচ্ছে..."}</span>
                  </>
                ) : (
                  <span>{locale === "en" ? "Load More Requests" : "আরও অনুরোধ দেখুন"}</span>
                )}
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* Empty State Box (Truthful Medical Notice) */
        <Card className="border border-border/80 bg-surface text-center p-8 sm:p-12 space-y-6 rounded-3xl shadow-xs">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto border border-primary/20 shadow-xs">
            <HeartHandshake className="size-7" aria-hidden="true" />
          </div>

          <div className="max-w-xl mx-auto space-y-2">
            <h3 className="text-lg sm:text-xl font-bold text-foreground">
              {activeFilters.length > 0
                ? (locale === "en" ? "No Matching Blood Requests Found" : "এই ফিল্টারে কোনো সক্রিয় অনুরোধ পাওয়া যায়নি")
                : t.bloodRequestsPage.results.demoNoticeTitle}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {activeFilters.length > 0
                ? (locale === "en"
                    ? "Try clearing some filters or broadcasting a new emergency requisition for your patient."
                    : "ফিল্টার পরিবর্তন করুন অথবা আপনার রোগীর জন্য জরুরি রক্তের একটি নতুন অনুরোধ তৈরি করুন।")
                : t.bloodRequestsPage.results.demoNoticeDesc}
            </p>
          </div>

          {/* Emergency Medical Notice */}
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 sm:p-5 max-w-xl mx-auto text-left flex items-start gap-3">
            <ShieldAlert className="size-5 text-destructive shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1">
              <h4 className="text-xs sm:text-sm font-bold text-destructive">
                {t.bloodRequestsPage.results.emergencyNoticeTitle}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t.bloodRequestsPage.results.emergencyNoticeDesc}
              </p>
            </div>
          </div>

          <div className="pt-2">
            <Button asChild size="default" className="shadow-xs font-bold gap-2 rounded-xl min-h-[44px] px-6">
              <Link
                href={
                  locale === "en"
                    ? "/en/blood-request/create#request-form"
                    : "/blood-request/create#request-form"
                }
              >
                <PlusCircle className="size-4" />
                <span>{t.bloodRequestsPage.createRequestCta}</span>
              </Link>
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
