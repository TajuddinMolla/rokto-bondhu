"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Filter, RotateCcw, SlidersHorizontal } from "lucide-react";

import { BLOOD_GROUPS, normalizeBloodGroup } from "@/constants/blood-groups";
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
import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
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
  const [mobileDrawerOpen, setMobileDrawerOpen] = React.useState(false);

  // Read initial values from URL query parameters
  const initialBloodGroup = normalizeBloodGroup(searchParams.get("bloodGroup")) || "";
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

  const [bloodGroup, setBloodGroup] = React.useState<string>(initialBloodGroup);
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
    const bg = normalizeBloodGroup(searchParams.get("bloodGroup")) || "";
    const dist = searchParams.get("district") || "";
    const rawDiv = searchParams.get("division") || "";
    const div = rawDiv || (dist ? getDistrictById(dist)?.divisionId || "" : "");
    const upa = searchParams.get("upazila") || "";
    const av = searchParams.get("availability") || "";

    setBloodGroup(bg);
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
  const handleBloodGroupSelect = (group: string) => {
    const nextGroup = group === bloodGroup ? "" : group;
    setBloodGroup(nextGroup);
    updateUrl({
      bloodGroup: nextGroup,
      division: divisionId,
      district: districtId,
      upazila: upazilaId,
      availability,
    });
  };

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

  const activeFilterCount = [
    Boolean(bloodGroup),
    Boolean(divisionId),
    Boolean(districtId),
    Boolean(upazilaId),
    Boolean(availability),
  ].filter(Boolean).length;

  const hasActiveFilters = activeFilterCount > 0;

  // Reusable Filter Form Fields JSX
  const renderFilterControls = (prefixId: string) => (
    <div className="space-y-4">
      {/* Blood Group Selection */}
      <div className="space-y-2">
        <label
          htmlFor={`${prefixId}-blood-group`}
          className="block text-xs font-bold text-foreground uppercase tracking-wider"
        >
          {t.donorsPage.filters.bloodGroupLabel}
        </label>

        {/* 8 Blood Groups Pill Matrix */}
        <div
          role="group"
          aria-label={t.donorsPage.filters.bloodGroupLabel}
          className="grid grid-cols-4 gap-1.5"
        >
          {BLOOD_GROUPS.map((group) => {
            const isSelected = bloodGroup === group;
            return (
              <button
                key={group}
                type="button"
                onClick={() => handleBloodGroupSelect(group)}
                aria-pressed={isSelected}
                className={`flex items-center justify-center h-10 rounded-xl border text-xs font-black transition-all cursor-pointer min-h-[40px] touch-manipulation ${
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground shadow-2xs scale-[1.02]"
                    : "border-border bg-surface text-foreground hover:border-primary/50 hover:bg-primary-subtle"
                }`}
              >
                <span>{group}</span>
              </button>
            );
          })}
        </div>

        {/* Fallback Accessible Select */}
        <Select
          id={`${prefixId}-blood-group`}
          value={bloodGroup}
          onChange={handleBloodGroupChange}
          className="min-h-[44px] mt-1"
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
          htmlFor={`${prefixId}-division`}
          className="block text-xs font-bold text-foreground uppercase tracking-wider"
        >
          {t.donorsPage.filters.divisionLabel}
        </label>
        <Select
          id={`${prefixId}-division`}
          value={divisionId}
          onChange={handleDivisionChange}
          className="min-h-[44px]"
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
          htmlFor={`${prefixId}-district`}
          className="block text-xs font-bold text-foreground uppercase tracking-wider"
        >
          {t.donorsPage.filters.districtLabel}
        </label>
        <Select
          id={`${prefixId}-district`}
          value={districtId}
          onChange={handleDistrictChange}
          className="min-h-[44px]"
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
          htmlFor={`${prefixId}-upazila`}
          className="block text-xs font-bold text-foreground uppercase tracking-wider"
        >
          {t.donorsPage.filters.upazilaLabel}
        </label>
        <Select
          id={`${prefixId}-upazila`}
          value={upazilaId}
          onChange={handleUpazilaChange}
          disabled={!districtId}
          className="min-h-[44px]"
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
          htmlFor={`${prefixId}-availability`}
          className="block text-xs font-bold text-foreground uppercase tracking-wider"
        >
          {t.donorsPage.filters.availabilityLabel}
        </label>
        <Select
          id={`${prefixId}-availability`}
          value={availability}
          onChange={handleAvailabilityChange}
          className="min-h-[44px]"
        >
          <option value="">{t.donorsPage.filters.allAvailability}</option>
          {DONOR_AVAILABILITY_STATUSES.map((status) => (
            <option key={status} value={status}>
              {t.domain.donorStatus[status]}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );

  return (
    <>
      {/* ---------------- MOBILE & TABLET FILTER TOOLBAR (< lg) ---------------- */}
      <div className="lg:hidden space-y-3">
        {/* Quick Horizontal Blood Group Selector Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            type="button"
            onClick={() => handleBloodGroupSelect("")}
            className={`shrink-0 h-10 px-3 rounded-xl border text-xs font-bold transition-all min-h-[40px] touch-manipulation cursor-pointer ${
              !bloodGroup
                ? "border-primary bg-primary text-primary-foreground shadow-2xs"
                : "border-border bg-surface text-muted-foreground hover:text-foreground"
            }`}
          >
            {locale === "en" ? "All Groups" : "সকল গ্রুপ"}
          </button>
          {BLOOD_GROUPS.map((group) => {
            const isSelected = bloodGroup === group;
            return (
              <button
                key={group}
                type="button"
                onClick={() => handleBloodGroupSelect(group)}
                className={`shrink-0 h-10 px-3.5 rounded-xl border text-xs font-black transition-all min-h-[40px] touch-manipulation cursor-pointer ${
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground shadow-2xs scale-[1.02]"
                    : "border-border bg-surface text-foreground hover:border-primary/50 hover:bg-primary-subtle"
                }`}
              >
                <span>{group}</span>
              </button>
            );
          })}
        </div>

        {/* Mobile Filter Trigger Bar with Active Count & Drawer */}
        <div className="flex items-center justify-between gap-3 p-2.5 rounded-2xl border border-border/80 bg-surface shadow-xs">
          <Drawer open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
            <DrawerTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 min-h-[44px] justify-between font-bold text-foreground border-border hover:bg-muted"
              >
                <span className="flex items-center gap-2">
                  <SlidersHorizontal className="size-4 text-primary" aria-hidden="true" />
                  <span>{t.donorsPage.filters.title}</span>
                </span>
                {hasActiveFilters && (
                  <Badge variant="subtle" className="text-[11px] font-bold py-0.5 px-2">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </DrawerTrigger>

            <DrawerContent className="p-0">
              <DrawerHeader className="border-b border-border/80 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="size-5 text-primary" aria-hidden="true" />
                    <DrawerTitle className="text-lg font-black text-foreground">
                      {t.donorsPage.filters.title}
                    </DrawerTitle>
                  </div>
                  {hasActiveFilters && (
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
                  )}
                </div>
                <DrawerDescription className="text-xs text-muted-foreground text-left">
                  {t.donorsPage.filters.subtitle}
                </DrawerDescription>
              </DrawerHeader>

              <div className="p-5 overflow-y-auto max-h-[60vh] space-y-4">
                {renderFilterControls("mobile-drawer")}
              </div>

              <DrawerFooter className="border-t border-border/80 pt-3">
                <DrawerClose asChild>
                  <Button
                    type="button"
                    size="lg"
                    className="w-full min-h-[48px] font-bold bg-primary hover:bg-primary-hover text-white shadow-xs"
                  >
                    <span>{t.donorsPage.filters.applyButton}</span>
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>

          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-xs text-muted-foreground hover:text-foreground min-h-[44px] px-3 shrink-0 gap-1.5"
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
              <span>{t.donorsPage.filters.resetButton}</span>
            </Button>
          )}
        </div>
      </div>

      {/* ---------------- DESKTOP SIDEBAR FILTER CARD (lg:block) ---------------- */}
      <Card className="hidden lg:block border border-border/80 bg-surface shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="pb-4 border-b border-border/80">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary-subtle text-primary border border-primary-border">
                <Filter className="size-4" aria-hidden="true" />
              </div>
              <CardTitle className="text-base font-extrabold text-foreground">
                {t.donorsPage.filters.title}
              </CardTitle>
            </div>

            {hasActiveFilters ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-xs text-muted-foreground hover:text-foreground gap-1.5 h-8 px-2 min-h-[36px]"
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

        <CardContent className="p-5">
          {renderFilterControls(formId)}
        </CardContent>
      </Card>
    </>
  );
}
