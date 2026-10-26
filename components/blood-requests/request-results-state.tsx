"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { PlusCircle, X, ShieldAlert, HeartHandshake } from "lucide-react";

import { getDivisionById, getDistrictById, getUpazilaById } from "@/constants/locations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

  // Active filter pills list
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

  return (
    <div className="space-y-6">
      {/* Active Filter Pills Bar */}
      {activeFilters.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg border border-border bg-surface text-xs">
          <span className="font-semibold text-muted-foreground">
            {t.bloodRequestsPage.results.activeFiltersLabel}
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

      {/* Demo / Empty State Box (100% Truthful, Zero Fabricated Emergency Cases) */}
      <Card className="border border-border bg-surface text-center p-8 sm:p-12 space-y-6">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto border border-primary/20 shadow-xs">
          <HeartHandshake className="size-7" aria-hidden="true" />
        </div>

        <div className="max-w-xl mx-auto space-y-2">
          <h3 className="text-lg sm:text-xl font-bold text-foreground">
            {t.bloodRequestsPage.results.demoNoticeTitle}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t.bloodRequestsPage.results.demoNoticeDesc}
          </p>
        </div>

        {/* Emergency Medical Notice */}
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 sm:p-5 max-w-xl mx-auto text-left flex items-start gap-3">
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

        {/* Create Request Action CTA */}
        <div className="pt-2 max-w-md mx-auto">
          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto font-semibold shadow-xs"
          >
            <Link href={locale === "en" ? "/en/blood-request/create" : "/blood-request/create"}>
              <PlusCircle className="size-4 mr-2" aria-hidden="true" />
              {t.bloodRequestsPage.createRequestCta}
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
