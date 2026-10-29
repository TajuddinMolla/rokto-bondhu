"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  UserPlus,
  X,
  Search,
  Loader2,
  AlertCircle,
  RefreshCw,
  RotateCcw,
  CheckCircle,
} from "lucide-react";

import { getDivisionById, getDistrictById, getUpazilaById } from "@/constants/locations";
import { normalizeBloodGroup } from "@/constants/blood-groups";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { DonorCard } from "@/components/donors/donor-card";
import { ContactRequestModal } from "@/components/donors/contact-request-modal";
import { useDonorSearch } from "@/hooks/queries/use-donor-search";
import { useIsDonor } from "@/hooks/use-is-donor";
import { getTranslations } from "@/i18n/translations";
import type { Locale } from "@/i18n/config";
import type {
  DonorSearchFilterParams,
  PublicDonorProfile,
  DonorPublicSummary,
} from "@/types/donor";

interface DonorResultsStateProps {
  locale: Locale;
}

function DonorCardSkeleton() {
  return (
    <Card className="rounded-3xl border border-border/80 bg-surface/90 p-5 sm:p-7 space-y-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-4 sm:gap-5">
          <Skeleton className="size-16 sm:size-20 rounded-2xl shrink-0" />
          <div className="space-y-2 pt-1">
            <Skeleton className="h-6 w-44 sm:w-56 rounded-md" />
            <Skeleton className="h-4 w-32 sm:w-44 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-8 w-28 rounded-full self-start sm:self-auto" />
      </div>

      <div className="pt-2 flex flex-wrap items-center gap-2.5">
        <Skeleton className="h-8 w-36 rounded-xl" />
        <Skeleton className="h-8 w-44 rounded-xl" />
      </div>

      <div className="pt-4 border-t border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Skeleton className="h-4 w-48 rounded hidden lg:block" />
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Skeleton className="h-11 w-36 rounded-xl flex-1 sm:flex-none" />
          <Skeleton className="h-11 w-32 rounded-xl flex-1 sm:flex-none" />
          <Skeleton className="size-11 rounded-xl shrink-0" />
        </div>
      </div>
    </Card>
  );
}

export function DonorResultsState({ locale }: DonorResultsStateProps) {
  const t = getTranslations(locale);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { isDonor } = useIsDonor();
  const [contactTargetDonor, setContactTargetDonor] =
    React.useState<PublicDonorProfile | DonorPublicSummary | null>(null);

  const rawBloodGroup = searchParams.get("bloodGroup");
  const bloodGroup = normalizeBloodGroup(rawBloodGroup);
  const divisionId = searchParams.get("division") || undefined;
  const districtId = searchParams.get("district") || undefined;
  const upazilaId = searchParams.get("upazila") || undefined;
  const availability = searchParams.get("availability") || undefined;

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

  const clearAllFilters = () => {
    router.replace(pathname, { scroll: false });
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

  // Search is active by default to display all donors immediately on page load
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useDonorSearch(filters, {
    enabled: true,
    pageSize: 20,
  });

  const allDonors = data?.pages.flatMap((page) => page.donors) ?? [];

  return (
    <div className="space-y-6">
      {/* Active Filter Pills Bar */}
      {activeFilters.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 sm:p-3.5 rounded-2xl border border-border/80 bg-surface shadow-2xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground mr-1">
              {t.donorsPage.results.activeFiltersLabel}
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
      ) : null}

      {/* State 1: Initial Loading Skeletons */}
      {isLoading ? (
        <div className="space-y-4">
          <DonorCardSkeleton />
          <DonorCardSkeleton />
          <DonorCardSkeleton />
        </div>
      ) : null}

      {/* State 2: Error Banner */}
      {!isLoading && isError ? (
        <Card className="border border-destructive/20 bg-destructive/5 p-6 sm:p-8 text-center space-y-4 rounded-2xl">
          <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 shadow-xs">
            <AlertCircle className="size-7" aria-hidden="true" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-extrabold text-base sm:text-lg text-foreground">
              {t.donorsPage.results.errorTitle}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              {t.donorsPage.results.errorDesc}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => refetch()}
            className="gap-2 text-sm font-bold min-h-[44px] px-6 border-destructive/30 hover:bg-destructive/10 text-destructive"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            <span>{t.donorsPage.results.retryButton}</span>
          </Button>
        </Card>
      ) : null}

      {/* State 3: Empty State (0 Donors Found) */}
      {!isLoading && !isError && allDonors.length === 0 ? (
        <div className="space-y-6">
          <EmptyState
            icon={Search}
            title={t.donorsPage.results.noDonorsFound}
            description={t.donorsPage.results.noDonorsFoundDesc}
            action={
              activeFilters.length > 0 ? (
                <Button
                  type="button"
                  onClick={clearAllFilters}
                  className="min-h-[44px] px-6 font-bold shadow-xs bg-primary hover:bg-primary-hover text-white gap-2"
                >
                  <RotateCcw className="size-4" aria-hidden="true" />
                  <span>{t.donorsPage.filters.resetButton}</span>
                </Button>
              ) : undefined
            }
          />

          {/* Become a Donor Callout - Hidden if user is already a registered donor */}
          {!isDonor && (
            <Card className="border border-border/80 bg-surface rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-sm">
              <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-primary-subtle text-primary border border-primary-border shadow-2xs">
                <UserPlus className="size-6" aria-hidden="true" />
              </div>

              <div className="space-y-1.5 max-w-md mx-auto">
                <h4 className="text-base sm:text-lg font-bold text-foreground">
                  {t.donorsPage.results.becomeDonorTitle}
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {t.donorsPage.results.becomeDonorDesc}
                </p>
              </div>

              <Button
                asChild
                size="lg"
                className="min-h-[48px] px-7 font-bold shadow-xs bg-primary hover:bg-primary-hover text-white gap-2"
              >
                <Link href={registerHref}>
                  <UserPlus className="size-4.5" aria-hidden="true" />
                  <span>{t.donorsPage.results.becomeDonorCta}</span>
                </Link>
              </Button>
            </Card>
          )}
        </div>
      ) : null}

      {/* State 4: Donors List with Cursor-Based Pagination */}
      {!isLoading && !isError && allDonors.length > 0 ? (
        <div className="space-y-4">
          {/* Result Count Indicator */}
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1 pb-1">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
              <span className="font-semibold text-foreground">
                {t.donorsPage.results.resultsCount.replace("{count}", String(allDonors.length))}
              </span>
            </div>
            {hasNextPage && (
              <span className="text-[11px] text-muted-foreground">
                {locale === "en" ? "More donors available" : "আরও রক্তদাতা রয়েছে"}
              </span>
            )}
          </div>

          {/* Donor Cards Grid */}
          <div className="space-y-4">
            {allDonors.map((donor) => (
              <DonorCard
                key={donor.id}
                donor={donor}
                locale={locale}
                onRequestContact={setContactTargetDonor}
              />
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
                className="w-full sm:w-auto min-w-[220px] min-h-[48px] gap-2 border-primary/30 text-primary hover:bg-primary/5 font-bold shadow-xs text-sm"
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="size-4.5 animate-spin" aria-hidden="true" />
                    <span>{t.donorsPage.results.loadingMore}</span>
                  </>
                ) : (
                  <span>{t.donorsPage.results.loadMore}</span>
                )}
              </Button>
            </div>
          ) : (
            <div className="pt-6 pb-2 text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
              <CheckCircle className="size-3.5 text-available shrink-0" aria-hidden="true" />
              <span>
                {locale === "en"
                  ? "All available donors displayed"
                  : "সকল উপলব্ধ রক্তদাতা প্রদর্শিত হয়েছে"}
              </span>
            </div>
          )}
        </div>
      ) : null}

      {/* Direct Contact Request Modal */}
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
