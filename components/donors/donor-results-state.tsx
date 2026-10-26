"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { UserPlus, X, Search } from "lucide-react";

import { getDivisionById, getDistrictById, getUpazilaById } from "@/constants/locations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getTranslations } from "@/i18n/translations";
import type { Locale } from "@/i18n/config";

interface DonorResultsStateProps {
  locale: Locale;
}

export function DonorResultsState({ locale }: DonorResultsStateProps) {
  const t = getTranslations(locale);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const bloodGroup = searchParams.get("bloodGroup");
  const divisionId = searchParams.get("division");
  const districtId = searchParams.get("district");
  const upazilaId = searchParams.get("upazila");
  const availability = searchParams.get("availability");

  const registerHref = locale === "en" ? "/en/register" : "/register";

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

      {/* Demo / Empty State Box (100% Truthful, Zero Fabricated Donor Records) */}
      <Card className="border border-border bg-surface text-center p-8 sm:p-12 space-y-6">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto border border-primary/20 shadow-xs">
          <Search className="size-7" aria-hidden="true" />
        </div>

        <div className="max-w-xl mx-auto space-y-2">
          <h3 className="text-lg sm:text-xl font-bold text-foreground">
            {t.donorsPage.results.demoNoticeTitle}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t.donorsPage.results.demoNoticeDesc}
          </p>
        </div>

        {activeFilters.length > 0 ? (
          <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-md max-w-md mx-auto">
            {t.donorsPage.results.emptyStateSuggestion}
          </div>
        ) : null}

        {/* Responsible Donor Registration Callout */}
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
    </div>
  );
}
