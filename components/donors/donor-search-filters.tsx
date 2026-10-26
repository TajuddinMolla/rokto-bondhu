"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Filter, RotateCcw } from "lucide-react";

import { BLOOD_GROUPS, isBloodGroup } from "@/constants/blood-groups";
import {
  DONOR_AVAILABILITY_STATUSES,
  isDonorAvailabilityStatus,
} from "@/types/blood";
import {
  getDivisions,
  getDistricts,
  getUpazilas,
  getDistrictById,
} from "@/constants/locations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { getTranslations } from "@/i18n/translations";
import type { Locale } from "@/i18n/config";

interface DonorSearchFiltersProps {
  locale: Locale;
}

export function DonorSearchFilters({ locale }: DonorSearchFiltersProps) {
  const t = getTranslations(locale);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const formId = React.useId();

  // Read initial values from URL query parameters
  const initialBloodGroup = searchParams.get("bloodGroup") || "";
  const initialDivision = searchParams.get("division") || "";
  const initialDistrict = searchParams.get("district") || "";
  const initialUpazila = searchParams.get("upazila") || "";
  const initialAvailability = searchParams.get("availability") || "";

  // Normalize initial district/division relationship
  const resolvedDivision = React.useMemo(() => {
    if (initialDivision) return initialDivision;
    if (initialDistrict) {
      const d = getDistrictById(initialDistrict);
      if (d) return d.divisionId;
    }
    return "";
  }, [initialDivision, initialDistrict]);

  const [bloodGroup, setBloodGroup] = React.useState<string>(
    isBloodGroup(initialBloodGroup) ? initialBloodGroup : ""
  );
  const [divisionId, setDivisionId] = React.useState<string>(resolvedDivision);
  const [districtId, setDistrictId] = React.useState<string>(initialDistrict);
  const [upazilaId, setUpazilaId] = React.useState<string>(initialUpazila);
  const [availability, setAvailability] = React.useState<string>(
    isDonorAvailabilityStatus(initialAvailability) ? initialAvailability : ""
  );

  // Synchronize state when URL search params change externally (e.g., browser back/forward)
  const currentParamsString = searchParams.toString();
  const [prevParamsString, setPrevParamsString] = React.useState(currentParamsString);
  if (currentParamsString !== prevParamsString) {
    setPrevParamsString(currentParamsString);
    const bg = searchParams.get("bloodGroup") || "";
    const dist = searchParams.get("district") || "";
    const rawDiv = searchParams.get("division") || "";
    const div = rawDiv || (dist ? getDistrictById(dist)?.divisionId || "" : "");
    const upa = searchParams.get("upazila") || "";
    const av = searchParams.get("availability") || "";

    setBloodGroup(isBloodGroup(bg) ? bg : "");
    setDivisionId(div);
    setDistrictId(dist);
    setUpazilaId(upa);
    setAvailability(isDonorAvailabilityStatus(av) ? av : "");
  }

  // Location datasets
  const divisions = React.useMemo(() => getDivisions(), []);
  const districts = React.useMemo(
    () => (divisionId ? getDistricts(divisionId) : getDistricts()),
    [divisionId]
  );
  const upazilas = React.useMemo(
    () => (districtId ? getUpazilas(districtId) : []),
    [districtId]
  );

  // Push new query parameters to the URL
  const updateUrl = React.useCallback(
    (params: {
      bloodGroup?: string;
      division?: string;
      district?: string;
      upazila?: string;
      availability?: string;
    }) => {
      const urlParams = new URLSearchParams();

      if (params.bloodGroup) urlParams.set("bloodGroup", params.bloodGroup);
      if (params.division) urlParams.set("division", params.division);
      if (params.district) urlParams.set("district", params.district);
      if (params.upazila) urlParams.set("upazila", params.upazila);
      if (params.availability) urlParams.set("availability", params.availability);

      const queryString = urlParams.toString();
      const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(targetUrl, { scroll: false });
    },
    [pathname, router]
  );

  // Field change handlers with cascade resets
  const handleBloodGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setBloodGroup(val);
    updateUrl({
      bloodGroup: val,
      division: divisionId,
      district: districtId,
      upazila: upazilaId,
      availability,
    });
  };

  const handleDivisionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setDivisionId(val);
    setDistrictId("");
    setUpazilaId("");
    updateUrl({
      bloodGroup,
      division: val,
      district: "",
      upazila: "",
      availability,
    });
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const parentDivision = val ? getDistrictById(val)?.divisionId : divisionId;
    const nextDiv = parentDivision || divisionId;
    setDivisionId(nextDiv);
    setDistrictId(val);
    setUpazilaId("");
    updateUrl({
      bloodGroup,
      division: nextDiv,
      district: val,
      upazila: "",
      availability,
    });
  };

  const handleUpazilaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setUpazilaId(val);
    const parentDivision = districtId ? getDistrictById(districtId)?.divisionId : divisionId;
    const nextDiv = parentDivision || divisionId;
    updateUrl({
      bloodGroup,
      division: nextDiv,
      district: districtId,
      upazila: val,
      availability,
    });
  };

  const handleAvailabilityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setAvailability(val);
    updateUrl({
      bloodGroup,
      division: divisionId,
      district: districtId,
      upazila: upazilaId,
      availability: val,
    });
  };

  const handleReset = () => {
    setBloodGroup("");
    setDivisionId("");
    setDistrictId("");
    setUpazilaId("");
    setAvailability("");
    router.replace(pathname, { scroll: false });
  };

  const hasActiveFilters = Boolean(
    bloodGroup || divisionId || districtId || upazilaId || availability
  );

  return (
    <Card className="border border-border bg-surface shadow-xs">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-primary" aria-hidden="true" />
            <CardTitle className="text-base font-bold text-foreground">
              {t.donorsPage.filters.title}
            </CardTitle>
          </div>
          {hasActiveFilters ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-xs text-muted-foreground hover:text-foreground gap-1.5 h-8 px-2"
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
              <span>{t.donorsPage.filters.resetButton}</span>
            </Button>
          ) : null}
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          {t.donorsPage.filters.subtitle}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Blood Group */}
        <div className="space-y-1.5">
          <label
            htmlFor={`${formId}-blood-group`}
            className="block text-xs font-semibold text-foreground uppercase tracking-wider"
          >
            {t.donorsPage.filters.bloodGroupLabel}
          </label>
          <Select
            id={`${formId}-blood-group`}
            value={bloodGroup}
            onChange={handleBloodGroupChange}
          >
            <option value="">{t.donorsPage.filters.allBloodGroups}</option>
            {BLOOD_GROUPS.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </Select>
        </div>

        {/* Division */}
        <div className="space-y-1.5">
          <label
            htmlFor={`${formId}-division`}
            className="block text-xs font-semibold text-foreground uppercase tracking-wider"
          >
            {t.donorsPage.filters.divisionLabel}
          </label>
          <Select
            id={`${formId}-division`}
            value={divisionId}
            onChange={handleDivisionChange}
          >
            <option value="">{t.donorsPage.filters.allDivisions}</option>
            {divisions.map((div) => (
              <option key={div.id} value={div.id}>
                {locale === "en" ? div.nameEn : div.nameBn}
              </option>
            ))}
          </Select>
        </div>

        {/* District */}
        <div className="space-y-1.5">
          <label
            htmlFor={`${formId}-district`}
            className="block text-xs font-semibold text-foreground uppercase tracking-wider"
          >
            {t.donorsPage.filters.districtLabel}
          </label>
          <Select
            id={`${formId}-district`}
            value={districtId}
            onChange={handleDistrictChange}
          >
            <option value="">{t.donorsPage.filters.allDistricts}</option>
            {districts.map((dist) => (
              <option key={dist.id} value={dist.id}>
                {locale === "en" ? dist.nameEn : dist.nameBn}
              </option>
            ))}
          </Select>
        </div>

        {/* Upazila */}
        <div className="space-y-1.5">
          <label
            htmlFor={`${formId}-upazila`}
            className="block text-xs font-semibold text-foreground uppercase tracking-wider"
          >
            {t.donorsPage.filters.upazilaLabel}
          </label>
          <Select
            id={`${formId}-upazila`}
            value={upazilaId}
            onChange={handleUpazilaChange}
            disabled={!districtId}
          >
            <option value="">
              {!districtId
                ? t.donorsPage.filters.selectDistrictFirst
                : t.donorsPage.filters.allUpazilas}
            </option>
            {upazilas.map((upa) => (
              <option key={upa.id} value={upa.id}>
                {locale === "en" ? upa.nameEn : upa.nameBn}
              </option>
            ))}
          </Select>
        </div>

        {/* Availability Status */}
        <div className="space-y-1.5">
          <label
            htmlFor={`${formId}-availability`}
            className="block text-xs font-semibold text-foreground uppercase tracking-wider"
          >
            {t.donorsPage.filters.availabilityLabel}
          </label>
          <Select
            id={`${formId}-availability`}
            value={availability}
            onChange={handleAvailabilityChange}
          >
            <option value="">{t.donorsPage.filters.allAvailability}</option>
            {DONOR_AVAILABILITY_STATUSES.map((status) => (
              <option key={status} value={status}>
                {t.domain.donorStatus[status]}
              </option>
            ))}
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
