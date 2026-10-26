"use client";

import * as React from "react";
import { Search, RotateCcw, AlertCircle, Info } from "lucide-react";

import { BLOOD_GROUPS, type BloodGroup } from "@/constants/blood-groups";
import {
  getDivisions,
  getDistricts,
  getUpazilas,
  getDivisionById,
  getDistrictById,
  getUpazilaById,
} from "@/constants/locations";
import { getTranslations } from "@/i18n/translations";
import type { Locale } from "@/i18n/config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select } from "@/components/ui/select";

interface DonorSearchPanelProps {
  locale: Locale;
  defaultBloodGroup?: BloodGroup;
}

export function DonorSearchPanel({
  locale,
  defaultBloodGroup,
}: DonorSearchPanelProps) {
  const t = getTranslations(locale);
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
  const [searchSubmitted, setSearchSubmitted] = React.useState<boolean>(false);
  const [submittedCriteria, setSubmittedCriteria] = React.useState<{
    bloodGroup: string;
    divisionName: string;
    districtName: string;
    upazilaName: string;
  } | null>(null);

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
    setSearchSubmitted(false);
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDistrict = e.target.value;
    setDistrictId(newDistrict);
    setUpazilaId("");
    setErrorMessage(null);
    setSearchSubmitted(false);
  };

  const handleUpazilaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUpazilaId(e.target.value);
    setErrorMessage(null);
    setSearchSubmitted(false);
  };

  const handleBloodGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBloodGroup(e.target.value);
    setErrorMessage(null);
    setSearchSubmitted(false);
  };

  const handleReset = () => {
    setBloodGroup("");
    setDivisionId("");
    setDistrictId("");
    setUpazilaId("");
    setErrorMessage(null);
    setSearchSubmitted(false);
    setSubmittedCriteria(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!bloodGroup) {
      setErrorMessage(t.home.search.pleaseSelectBloodGroup);
      setSearchSubmitted(false);
      return;
    }

    setErrorMessage(null);

    const divisionObj = divisionId ? getDivisionById(divisionId) : undefined;
    const districtObj = districtId ? getDistrictById(districtId) : undefined;
    const upazilaObj = upazilaId ? getUpazilaById(upazilaId) : undefined;

    setSubmittedCriteria({
      bloodGroup,
      divisionName: divisionObj
        ? locale === "en"
          ? divisionObj.nameEn
          : divisionObj.nameBn
        : t.home.search.allBangladesh,
      districtName: districtObj
        ? locale === "en"
          ? districtObj.nameEn
          : districtObj.nameBn
        : t.home.search.allDistricts,
      upazilaName: upazilaObj
        ? locale === "en"
          ? upazilaObj.nameEn
          : upazilaObj.nameBn
        : t.home.search.allUpazilas,
    });
    setSearchSubmitted(true);
  };

  return (
    <section
      id="search-panel"
      aria-labelledby="search-heading"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-12 relative z-20"
    >
      <Card className="border border-border/80 shadow-lg bg-surface">
        <CardHeader className="pb-4 sm:pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle id="search-heading" className="text-xl sm:text-2xl font-bold text-foreground">
                {t.home.search.title}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground mt-1">
                {t.home.search.subtitle}
              </CardDescription>
            </div>
            {bloodGroup || divisionId ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="self-start sm:self-auto text-xs text-muted-foreground hover:text-foreground gap-1.5"
              >
                <RotateCcw className="size-3.5" aria-hidden="true" />
                {t.home.search.resetCriteria}
              </Button>
            ) : null}
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Blood Group Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor={`${formId}-blood-group`}
                  className="block text-xs font-semibold text-foreground uppercase tracking-wider"
                >
                  {t.home.search.bloodGroupLabel} <span className="text-primary">*</span>
                </label>
                <Select
                  id={`${formId}-blood-group`}
                  value={bloodGroup}
                  onChange={handleBloodGroupChange}
                  aria-required="true"
                  aria-invalid={Boolean(errorMessage)}
                  aria-describedby={errorMessage ? `${formId}-error` : undefined}
                  className={errorMessage ? "border-destructive focus-visible:ring-destructive" : ""}
                >
                  <option value="">{t.home.search.bloodGroupPlaceholder}</option>
                  {BLOOD_GROUPS.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Division Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor={`${formId}-division`}
                  className="block text-xs font-semibold text-foreground uppercase tracking-wider"
                >
                  {t.home.search.divisionLabel}
                </label>
                <Select
                  id={`${formId}-division`}
                  value={divisionId}
                  onChange={handleDivisionChange}
                >
                  <option value="">{t.home.search.divisionPlaceholder}</option>
                  {divisions.map((div) => (
                    <option key={div.id} value={div.id}>
                      {locale === "en" ? div.nameEn : div.nameBn}
                    </option>
                  ))}
                </Select>
              </div>

              {/* District Field (Dependent on Division) */}
              <div className="space-y-1.5">
                <label
                  htmlFor={`${formId}-district`}
                  className="block text-xs font-semibold text-foreground uppercase tracking-wider"
                >
                  {t.home.search.districtLabel}
                </label>
                <Select
                  id={`${formId}-district`}
                  value={districtId}
                  onChange={handleDistrictChange}
                  disabled={!divisionId}
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

              {/* Upazila Field (Dependent on District) */}
              <div className="space-y-1.5">
                <label
                  htmlFor={`${formId}-upazila`}
                  className="block text-xs font-semibold text-foreground uppercase tracking-wider"
                >
                  {t.home.search.upazilaLabel}
                </label>
                <Select
                  id={`${formId}-upazila`}
                  value={upazilaId}
                  onChange={handleUpazilaChange}
                  disabled={!districtId || upazilas.length === 0}
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

            {/* Validation Error Feedback */}
            {errorMessage ? (
              <div
                id={`${formId}-error`}
                role="alert"
                className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 p-3 rounded-md"
              >
                <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
                <span>{errorMessage}</span>
              </div>
            ) : null}

            {/* Submit Action */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
              <Button type="submit" size="lg" className="font-semibold shadow-xs">
                <Search className="size-4 mr-2" aria-hidden="true" />
                {t.home.search.searchButton}
              </Button>
            </div>
          </form>

          {/* Localized Demo Feedback Card (Guaranteed Zero Fake Donor Records) */}
          {searchSubmitted && submittedCriteria ? (
            <div
              role="region"
              aria-live="polite"
              className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-6 space-y-4"
            >
              <div className="flex items-start gap-3">
                <Info className="size-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-foreground">
                    {t.home.search.demoTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {t.home.search.demoNotice}
                  </p>
                </div>
              </div>

              <div className="bg-surface rounded-lg border border-border p-3 sm:p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground block">
                    {t.home.search.bloodGroupLabel}:
                  </span>
                  <span className="font-extrabold text-primary text-sm">
                    {submittedCriteria.bloodGroup}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">
                    {t.home.search.divisionLabel}:
                  </span>
                  <span className="font-semibold text-foreground">
                    {submittedCriteria.divisionName}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">
                    {t.home.search.districtLabel}:
                  </span>
                  <span className="font-semibold text-foreground">
                    {submittedCriteria.districtName}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">
                    {t.home.search.upazilaLabel}:
                  </span>
                  <span className="font-semibold text-foreground">
                    {submittedCriteria.upazilaName}
                  </span>
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
