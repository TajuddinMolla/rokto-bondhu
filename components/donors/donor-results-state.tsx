"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { UserPlus, X, Search, Loader2, AlertCircle, RefreshCw, Compass } from "lucide-react";

import { getDivisionById, getDistrictById, getUpazilaById } from "@/constants/locations";
import { normalizeBloodGroup } from "@/constants/blood-groups";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DonorCard } from "@/components/donors/donor-card";
import { useDonorSearch } from "@/hooks/queries/use-donor-search";
import { getTranslations } from "@/i18n/translations";
import type { Locale } from "@/i18n/config";
import type { DonorSearchFilterParams } from "@/types/donor";

interface DonorResultsStateProps {
  locale: Locale;
}

function DonorCardSkeleton() {
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

export function DonorResultsState({ locale }: DonorResultsStateProps) {
  const t = getTranslations(locale);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const rawBloodGroup = searchParams.get("bloodGroup");
  const bloodGroup = normalizeBloodGroup(rawBloodGroup);
  const divisionId = searchParams.get("division") || undefined;
  const districtId = searchParams.get("district") || undefined;
  const upazilaId = searchParams.get("upazila") || undefined;
  const availability = searchParams.get("availability") || undefined;

  const [hasRequestedBrowseAll, setHasRequestedBrowseAll] = React.useState(false);

  const registerHref = locale === "en" ? "/en/donors/register" : "/donors/register";

  const division = divisionId ? getDivisionById(divisionId) : undefined;
  const district = districtId ? getDistrictById(districtId) : undefined;
  const upazila = upazilaId ? getUpazilaById(upazilaId) : undefined;

  // Active filter pills list
  const activeFilters = React.useMemo(() => {
    const list: { key: string; label: string; value: string }[] = [];

    if (bloodGroup) {
      list.push({
        key: "bloodGroup",
        label: t.donorsPage.filters.bloodGroupLabel,
        value: bloodGroup,
      });
    }
    if (division) {
      list.push({
        key: "division",
        label: t.donorsPage.filters.divisionLabel,
        value: locale === "en" ? division.nameEn : division.nameBn,
      });
    }
    if (district) {
      list.push({
        key: "district",
        label: t.donorsPage.filters.districtLabel,
        value: locale === "en" ? district.nameEn : district.nameBn,
      });
    }
    if (upazila) {
      list.push({
        key: "upazila",
        label: t.donorsPage.filters.upazilaLabel,
        value: locale === "en" ? upazila.nameEn : upazila.nameBn,
      });
    }
    if (availability && availability in t.domain.donorStatus) {
      list.push({
        key: "availability",
        label: t.donorsPage.filters.availabilityLabel,
        value: t.domain.donorStatus[availability as keyof typeof t.domain.donorStatus],
      });
    }

    return list;
  }, [bloodGroup, division, district, upazila, availability, locale, t]);

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

  const filters = React.useMemo<DonorSearchFilterParams>(
    () => ({
      bloodGroup,
      divisionId,
      districtId,
      upazilaId,
      availabilityStatus: availability,
    }),
    [bloodGroup, divisionId, districtId, upazilaId, availability]
  );

  // Search activates when at least one filter is selected OR user clicks browse all
  const isSearchActive = activeFilters.length > 0 || hasRequestedBrowseAll;

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useDonorSearch(filters, {
    enabled: isSearchActive,
    pageSize: 20,
  });

  const allDonors = data?.pages.flatMap((page) => page.donors) ?? [];

  return (
    <div className="space-y-6">
      {/* Active Filter Pills Bar */}
      {activeFilters.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg border border-border bg-surface text-xs">
          <span className="font-semibold text-muted-foreground">
            {t.donorsPage.results.activeFiltersLabel}
          </span>
          {activeFilters.map((filter) => (
            <Badge
              key={filter.key}
              variant="outline"
              className="gap-1 border-primary/20 bg-primary/5 text-primary py-1 px-2.5 rounded-md text-xs font-medium"
            >
              <span>
                {filter.label}: <strong>{filter.value}</strong>
              </span>
              <button
                type="button"
                onClick={() => removeFilter(filter.key)}
                className="hover:text-foreground cursor-pointer focus:outline-none"
                aria-label={`Remove ${filter.label} filter`}
              >
                <X className="size-3" aria-hidden="true" />
              </button>
            </Badge>
          ))}
        </div>
      ) : null}

      {/* State 1: Guided Initial Prompt (No filters chosen yet) */}
      {!isSearchActive ? (
        <Card className="border border-border bg-surface text-center p-8 sm:p-12 space-y-6">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto border border-primary/20 shadow-xs">
            <Compass className="size-7" aria-hidden="true" />
          </div>

          <div className="max-w-xl mx-auto space-y-2">
            <h3 className="text-lg sm:text-xl font-bold text-foreground">
              {t.donorsPage.results.guidedPromptTitle}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t.donorsPage.results.guidedPromptDesc}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setHasRequestedBrowseAll(true)}
              className="font-medium gap-2 border-primary/30 text-primary hover:bg-primary/5"
            >
              <Search className="size-4" aria-hidden="true" />
              <span>{t.donorsPage.results.browseAllAction}</span>
            </Button>
            <Button asChild className="font-medium gap-2 shadow-xs">
              <Link href={registerHref}>
                <UserPlus className="size-4" aria-hidden="true" />
                <span>{t.donorsPage.results.becomeDonorCta}</span>
              </Link>
            </Button>
          </div>
        </Card>
      ) : null}

      {/* State 2: Initial Loading Skeletons */}
      {isSearchActive && isLoading ? (
        <div className="space-y-4">
          <DonorCardSkeleton />
          <DonorCardSkeleton />
          <DonorCardSkeleton />
        </div>
      ) : null}

      {/* State 3: Error Banner */}
      {isSearchActive && !isLoading && isError ? (
        <Card className="border border-destructive/20 bg-destructive/5 p-6 sm:p-8 text-center space-y-4">
          <div className="inline-flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive border border-destructive/20">
            <AlertCircle className="size-6" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base sm:text-lg text-foreground">
              {t.donorsPage.results.errorTitle}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              {t.donorsPage.results.errorDesc}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => refetch()}
            className="gap-2 text-xs"
          >
            <RefreshCw className="size-3.5" aria-hidden="true" />
            <span>{t.donorsPage.results.retryButton}</span>
          </Button>
        </Card>
      ) : null}

      {/* State 4: Empty State (0 Donors Found) */}
      {isSearchActive && !isLoading && !isError && allDonors.length === 0 ? (
        <Card className="border border-border bg-surface text-center p-8 sm:p-12 space-y-6">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/40 text-muted-foreground mx-auto border border-border shadow-xs">
            <Search className="size-7" aria-hidden="true" />
          </div>

          <div className="max-w-xl mx-auto space-y-2">
            <h3 className="text-lg sm:text-xl font-bold text-foreground">
              {t.donorsPage.results.noDonorsFound}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t.donorsPage.results.noDonorsFoundDesc}
            </p>
          </div>

          <div className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-md max-w-md mx-auto border border-border/50">
            {t.donorsPage.results.emptyStateSuggestion}
          </div>

          {/* Become a Donor Callout */}
          <div className="pt-6 border-t border-border max-w-lg mx-auto space-y-4">
            <div className="space-y-1">
              <h4 className="text-sm sm:text-base font-bold text-foreground">
                {t.donorsPage.results.becomeDonorTitle}
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {t.donorsPage.results.becomeDonorDesc}
              </p>
            </div>

            <Button asChild className="font-semibold shadow-xs">
              <Link href={registerHref}>
                <UserPlus className="size-4 mr-2" aria-hidden="true" />
                {t.donorsPage.results.becomeDonorCta}
              </Link>
            </Button>
          </div>
        </Card>
      ) : null}

      {/* State 5: Donors List with Cursor-Based Pagination */}
      {isSearchActive && !isLoading && allDonors.length > 0 ? (
        <div className="space-y-4">
          {/* Result Count Indicator */}
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>
              {t.donorsPage.results.resultsCount.replace("{count}", String(allDonors.length))}
            </span>
          </div>

          {/* Donor Cards Grid */}
          <div className="space-y-4">
            {allDonors.map((donor) => (
              <DonorCard key={donor.id} donor={donor} locale={locale} />
            ))}
          </div>

          {/* Cursor-Based Pagination Action ("Load More") */}
          {hasNextPage ? (
            <div className="pt-4 text-center">
              <Button
                type="button"
                variant="outline"
                disabled={isFetchingNextPage}
                onClick={() => fetchNextPage()}
                className="w-full sm:w-auto min-w-[200px] gap-2 border-primary/30 text-primary hover:bg-primary/5 font-semibold"
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    <span>{t.donorsPage.results.loadingMore}</span>
                  </>
                ) : (
                  <span>{t.donorsPage.results.loadMore}</span>
                )}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

