"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, RotateCcw, AlertCircle, AlertTriangle, ArrowRight, Droplet, MapPin } from "lucide-react";

import { BLOOD_GROUPS, type BloodGroup } from "@/constants/blood-groups";
import {
  getDivisions,
  getDistricts,
  getUpazilas,
} from "@/constants/locations";
import { getTranslations } from "@/i18n/translations";
import type { Locale } from "@/i18n/config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface DonorSearchPanelProps {
  locale: Locale;
  defaultBloodGroup?: BloodGroup;
}

export function DonorSearchPanel({
  locale,
  defaultBloodGroup,
}: DonorSearchPanelProps) {
  const t = getTranslations(locale);
  const router = useRouter();
  const formId = React.useId();

  // Search state
  const [bloodGroup, setBloodGroup] = React.useState<string>(defaultBloodGroup || "");
  const [prevDefaultBloodGroup, setPrevDefaultBloodGroup] = React.useState<BloodGroup | undefined>(
    defaultBloodGroup
  );
  if (defaultBloodGroup !== prevDefaultBloodGroup) {
    setPrevDefaultBloodGroup(defaultBloodGroup);
    if (defaultBloodGroup) {
      setBloodGroup(defaultBloodGroup);
    }
  }

  const [divisionId, setDivisionId] = React.useState<string>("");
  const [districtId, setDistrictId] = React.useState<string>("");
  const [upazilaId, setUpazilaId] = React.useState<string>("");

  // Feedback state
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isSearching, setIsSearching] = React.useState<boolean>(false);

  // Derived location datasets
  const divisions = React.useMemo(() => getDivisions(), []);
  const districts = React.useMemo(
    () => (divisionId ? getDistricts(divisionId) : []),
    [divisionId]
  );
  const upazilas = React.useMemo(
    () => (districtId ? getUpazilas(districtId) : []),
    [districtId]
  );

  // Handlers with strict dependent resets
  const handleDivisionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDivision = e.target.value;
    setDivisionId(newDivision);
    setDistrictId("");
    setUpazilaId("");
    setErrorMessage(null);
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDistrict = e.target.value;
    setDistrictId(newDistrict);
    setUpazilaId("");
    setErrorMessage(null);
  };

  const handleUpazilaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUpazilaId(e.target.value);
    setErrorMessage(null);
  };

  const handleBloodGroupSelect = (group: string) => {
    setBloodGroup(group === bloodGroup ? "" : group);
    setErrorMessage(null);
  };

  const handleReset = () => {
    setBloodGroup("");
    setDivisionId("");
    setDistrictId("");
    setUpazilaId("");
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!bloodGroup) {
      setErrorMessage(t.home.search.pleaseSelectBloodGroup);
      return;
    }

    setErrorMessage(null);
    setIsSearching(true);

    const params = new URLSearchParams();
    if (bloodGroup) params.set("bloodGroup", bloodGroup);
    if (divisionId) params.set("division", divisionId);
    if (districtId) params.set("district", districtId);
    if (upazilaId) params.set("upazila", upazilaId);

    const prefix = locale === "en" ? "/en" : "";
    const queryString = params.toString();
    const destination = `${prefix}/donors${queryString ? `?${queryString}` : ""}`;

    router.push(destination);
  };

  const prefix = locale === "en" ? "/en" : "";
  const requestCreateHref = `${prefix}/blood-request/create`;

  return (
    <section
      id="search-panel"
      aria-labelledby="search-heading"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-12 relative z-20 space-y-4"
    >
      {/* Emergency Requisition Top Notice */}
      <div className="rounded-2xl border border-emergency-border bg-gradient-to-r from-emergency-subtle via-surface to-emergency-subtle/30 p-4 sm:p-5 shadow-sm transition-all duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emergency/10 text-emergency border border-emergency/20">
              <AlertTriangle className="size-5" aria-hidden="true" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground text-sm sm:text-base">
                  {locale === "en"
                    ? "Need Blood Urgently for a Patient?"
                    : "রোগীর জন্য জরুরি রক্তের প্রয়োজন?"}
                </span>
                <Badge variant="emergency" className="text-[10px] font-bold py-0.5 px-2">
                  {locale === "en" ? "Emergency" : "জরুরি"}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {locale === "en"
                  ? "Post a verified blood request to reach nearby donors and volunteers instantly."
                  : "নিকটস্থ রক্তদাতা ও ভলান্টিয়ারদের তাৎক্ষণিক সাড়া পেতে রক্তের অনুরোধ পোস্ট করুন।"}
              </p>
            </div>
          </div>

          <Button
            asChild
            size="sm"
            className="self-start sm:self-auto min-h-[44px] bg-emergency hover:bg-emergency/90 text-white font-semibold shadow-xs shrink-0"
          >
            <Link href={requestCreateHref}>
              <span>{locale === "en" ? "Post Blood Request" : "রক্তের আবেদন করুন"}</span>
              <ArrowRight className="size-4 ml-1.5" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Donor Search Card */}
      <Card className="border border-border/80 shadow-xl bg-surface">
        <CardHeader className="pb-4 sm:pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Search className="size-4" aria-hidden="true" />
                </div>
                <CardTitle id="search-heading" className="text-xl sm:text-2xl font-black text-foreground">
                  {t.home.search.title}
                </CardTitle>
              </div>
              <CardDescription className="text-sm text-muted-foreground">
                {t.home.search.subtitle}
              </CardDescription>
            </div>

            {bloodGroup || divisionId ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="self-start sm:self-auto text-xs text-muted-foreground hover:text-foreground gap-1.5 min-h-[36px]"
              >
                <RotateCcw className="size-3.5" aria-hidden="true" />
                {t.home.search.resetCriteria}
              </Button>
            ) : null}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Quick Blood Group Buttons Row */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor={`${formId}-blood-group`}
                className="block text-xs font-bold text-foreground uppercase tracking-wider"
              >
                {t.home.search.bloodGroupLabel} <span className="text-primary">*</span>
              </label>
              <span className="text-xs text-muted-foreground">
                {locale === "en" ? "Select group or pick below" : "গ্রুপ নির্বাচন করুন বা ট্যাপ করুন"}
              </span>
            </div>

            <div
              role="group"
              aria-label={t.home.search.bloodGroupLabel}
              className="grid grid-cols-4 sm:grid-cols-8 gap-2"
            >
              {BLOOD_GROUPS.map((group) => {
                const isSelected = bloodGroup === group;
                return (
                  <button
                    key={group}
                    type="button"
                    onClick={() => handleBloodGroupSelect(group)}
                    aria-pressed={isSelected}
                    className={`flex items-center justify-center h-12 rounded-xl border text-sm font-extrabold transition-all duration-150 cursor-pointer touch-manipulation min-h-[44px] ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground shadow-xs ring-2 ring-primary/20 scale-[1.02]"
                        : "border-border bg-surface text-foreground hover:border-primary/50 hover:bg-primary-subtle"
                    }`}
                  >
                    <Droplet
                      className={`size-3.5 mr-1 shrink-0 ${
                        isSelected ? "fill-current" : "text-primary fill-primary/30"
                      }`}
                      aria-hidden="true"
                    />
                    <span>{group}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Blood Group Select (Accessible fallback / alternative) */}
              <div className="space-y-1.5">
                <label
                  htmlFor={`${formId}-blood-group`}
                  className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                >
                  {t.home.search.bloodGroupLabel}
                </label>
                <Select
                  id={`${formId}-blood-group`}
                  value={bloodGroup}
                  onChange={(e) => {
                    setBloodGroup(e.target.value);
                    setErrorMessage(null);
                  }}
                  aria-required="true"
                  aria-invalid={Boolean(errorMessage)}
                  aria-describedby={errorMessage ? `${formId}-error` : undefined}
                  className={`min-h-[44px] ${
                    errorMessage
                      ? "border-destructive focus-visible:ring-destructive enabled:hover:border-destructive"
                      : ""
                  }`}
                >
                  <option value="">{t.home.search.bloodGroupPlaceholder}</option>
                  {BLOOD_GROUPS.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Division Select */}
              <div className="space-y-1.5">
                <label
                  htmlFor={`${formId}-division`}
                  className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                >
                  {t.home.search.divisionLabel}
                </label>
                <Select
                  id={`${formId}-division`}
                  value={divisionId}
                  onChange={handleDivisionChange}
                  className="min-h-[44px]"
                >
                  <option value="">{t.home.search.divisionPlaceholder}</option>
                  {divisions.map((div) => (
                    <option key={div.id} value={div.id}>
                      {locale === "en" ? div.nameEn : div.nameBn}
                    </option>
                  ))}
                </Select>
              </div>

              {/* District Select */}
              <div className="space-y-1.5">
                <label
                  htmlFor={`${formId}-district`}
                  className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                >
                  {t.home.search.districtLabel}
                </label>
                <Select
                  id={`${formId}-district`}
                  value={districtId}
                  onChange={handleDistrictChange}
                  disabled={!divisionId}
                  className="min-h-[44px]"
                >
                  <option value="">
                    {divisionId
                      ? t.home.search.districtPlaceholder
                      : t.home.search.selectDivisionFirst}
                  </option>
                  {districts.map((dist) => (
                    <option key={dist.id} value={dist.id}>
                      {locale === "en" ? dist.nameEn : dist.nameBn}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Upazila Select */}
              <div className="space-y-1.5">
                <label
                  htmlFor={`${formId}-upazila`}
                  className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                >
                  {t.home.search.upazilaLabel}
                </label>
                <Select
                  id={`${formId}-upazila`}
                  value={upazilaId}
                  onChange={handleUpazilaChange}
                  disabled={!districtId || upazilas.length === 0}
                  className="min-h-[44px]"
                >
                  <option value="">
                    {!districtId
                      ? t.home.search.selectDistrictFirst
                      : upazilas.length === 0
                      ? t.home.search.allUpazilas
                      : t.home.search.upazilaPlaceholder}
                  </option>
                  {upazilas.map((upa) => (
                    <option key={upa.id} value={upa.id}>
                      {locale === "en" ? upa.nameEn : upa.nameBn}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Inline Error Message */}
            {errorMessage ? (
              <div
                id={`${formId}-error`}
                role="alert"
                className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 p-3 rounded-xl"
              >
                <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            ) : null}

            {/* Search Submit Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2 border-t border-border/80">
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <MapPin className="size-3.5 text-primary shrink-0" aria-hidden="true" />
                <span>
                  {locale === "en"
                    ? "Direct navigation to verified donor registry"
                    : "যাচাইকৃত রক্তদাতাদের তালিকায় সরাসরি অনুসন্ধান"}
                </span>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={isSearching}
                className="min-h-[48px] px-8 font-bold text-base shadow-xs bg-primary hover:bg-primary-hover text-primary-foreground gap-2"
              >
                <Search className="size-4.5" aria-hidden="true" />
                <span>
                  {isSearching ? t.home.search.searching : t.home.search.searchButton}
                </span>
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
