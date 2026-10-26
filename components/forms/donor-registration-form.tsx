"use client";

import * as React from "react";
import Link from "next/link";
import {
  Heart,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RotateCcw,
  Search,
  ShieldCheck,
  User,
  MapPin,
  Calendar,
} from "lucide-react";

import { BLOOD_GROUPS } from "@/constants/blood-groups";
import { type DonorAvailabilityStatus } from "@/types/blood";
import {
  getDivisions,
  getDistricts,
  getUpazilas,
  getDistrictById,
  getDivisionById,
  getUpazilaById,
} from "@/constants/locations";
import { createDonorSchema } from "@/lib/validations/donor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FormField } from "@/components/forms/form-field";
import { getTranslations } from "@/i18n/translations";
import type { Locale } from "@/i18n/config";

interface DonorRegistrationFormProps {
  locale: Locale;
}

interface FormState {
  displayName: string;
  bloodGroup: string;
  phoneNumber: string;
  isPhonePublic: boolean;
  divisionId: string;
  districtId: string;
  upazilaId: string;
  area: string;
  lastDonationDate: string;
  availabilityStatus: DonorAvailabilityStatus;
  consent: boolean;
}

const INITIAL_FORM_STATE: FormState = {
  displayName: "",
  bloodGroup: "",
  phoneNumber: "",
  isPhonePublic: false,
  divisionId: "",
  districtId: "",
  upazilaId: "",
  area: "",
  lastDonationDate: "",
  availabilityStatus: "available",
  consent: false,
};

export function DonorRegistrationForm({ locale }: DonorRegistrationFormProps) {
  const t = getTranslations(locale);
  const formId = React.useId();

  const [formData, setFormData] = React.useState<FormState>(INITIAL_FORM_STATE);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [submittedSnapshot, setSubmittedSnapshot] = React.useState<FormState | null>(null);
  const maxDate = React.useSyncExternalStore(
    () => () => {},
    () => new Date().toISOString().split("T")[0],
    () => undefined
  );

  // Schema initialized with active locale
  const donorSchema = React.useMemo(() => createDonorSchema(locale), [locale]);

  // Location datasets
  const divisions = React.useMemo(() => getDivisions(), []);
  const districts = React.useMemo(
    () => (formData.divisionId ? getDistricts(formData.divisionId) : getDistricts()),
    [formData.divisionId]
  );
  const upazilas = React.useMemo(
    () => (formData.districtId ? getUpazilas(formData.districtId) : []),
    [formData.districtId]
  );

  // Field change handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSelectChange = (name: keyof FormState) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;

    if (name === "divisionId") {
      setFormData((prev) => ({
        ...prev,
        divisionId: val,
        districtId: "",
        upazilaId: "",
      }));
    } else if (name === "districtId") {
      const parentDivision = val ? getDistrictById(val)?.divisionId : formData.divisionId;
      setFormData((prev) => ({
        ...prev,
        divisionId: parentDivision || prev.divisionId,
        districtId: val,
        upazilaId: "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: val,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // Form submission with simulated preview latency
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const result = donorSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0]?.toString();
        if (key && !fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      }
      setErrors(fieldErrors);

      // Focus first error field for accessibility
      const firstErrorField = Object.keys(fieldErrors)[0];
      if (firstErrorField) {
        const elem = document.getElementById(`${formId}-${firstErrorField}`);
        elem?.focus();
      }
      return;
    }

    // Input is valid: simulate processing
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedSnapshot(formData);
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 600);
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM_STATE);
    setErrors({});
    setIsSuccess(false);
    setSubmittedSnapshot(null);
  };

  if (isSuccess && submittedSnapshot) {
    const divObj = getDivisionById(submittedSnapshot.divisionId);
    const distObj = getDistrictById(submittedSnapshot.districtId);
    const upaObj = getUpazilaById(submittedSnapshot.upazilaId);

    const locationLabel = [
      upaObj ? (locale === "en" ? upaObj.nameEn : upaObj.nameBn) : "",
      distObj ? (locale === "en" ? distObj.nameEn : distObj.nameBn) : "",
      divObj ? (locale === "en" ? divObj.nameEn : divObj.nameBn) : "",
    ]
      .filter(Boolean)
      .join(", ");

    return (
      <Card className="border border-primary/20 bg-surface shadow-sm overflow-hidden animate-in fade-in duration-300">
        <div className="bg-primary/5 border-b border-primary/10 p-6 sm:p-8 text-center space-y-3">
          <div className="inline-flex items-center justify-center size-14 rounded-full bg-primary/10 text-primary border border-primary/20 mb-1">
            <CheckCircle2 className="size-8" aria-hidden="true" />
          </div>
          <div>
            <Badge variant="outline" className="border-primary/30 text-primary mb-2">
              {t.registrationPage.demoSuccess.badge}
            </Badge>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              {t.registrationPage.demoSuccess.title}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {t.registrationPage.demoSuccess.desc}
          </p>
        </div>

        <CardContent className="p-6 sm:p-8 space-y-6">
          <div className="rounded-xl border border-border bg-muted/20 p-4 sm:p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {locale === "en" ? "Validated Profile Preview" : "যাচাইকৃত প্রোফাইল প্রিভিউ"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs">
                  {t.registrationPage.form.nameLabel}:
                </span>
                <strong className="text-foreground">{submittedSnapshot.displayName}</strong>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">
                  {t.registrationPage.form.bloodGroupLabel}:
                </span>
                <strong className="text-primary font-bold">{submittedSnapshot.bloodGroup}</strong>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">
                  {t.registrationPage.form.phoneLabel}:
                </span>
                <span className="text-foreground font-mono">
                  {submittedSnapshot.phoneNumber}{" "}
                  {submittedSnapshot.isPhonePublic ? (
                    <span className="text-xs text-muted-foreground">
                      ({locale === "en" ? "Public" : "প্রকাশ্য"})
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      ({locale === "en" ? "Private" : "ব্যক্তিগত"})
                    </span>
                  )}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">
                  {t.registrationPage.form.locationTitle}:
                </span>
                <span className="text-foreground">{locationLabel}</span>
              </div>
              {submittedSnapshot.lastDonationDate ? (
                <div>
                  <span className="text-muted-foreground block text-xs">
                    {t.registrationPage.form.lastDonationDateLabel}:
                  </span>
                  <span className="text-foreground">{submittedSnapshot.lastDonationDate}</span>
                </div>
              ) : null}
              <div>
                <span className="text-muted-foreground block text-xs">
                  {t.registrationPage.form.availabilityLabel}:
                </span>
                <span className="text-foreground">
                  {t.domain.donorStatus[submittedSnapshot.availabilityStatus]}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="w-full sm:w-auto gap-2"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              <span>{t.registrationPage.demoSuccess.resetButton}</span>
            </Button>
            <Button asChild className="w-full sm:w-auto gap-2">
              <Link href={locale === "en" ? "/en/donors" : "/donors"}>
                <Search className="size-4" aria-hidden="true" />
                <span>{t.registrationPage.demoSuccess.searchDonorsButton}</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border bg-surface shadow-sm">
      <CardHeader className="pb-6 border-b border-border">
        <div className="flex items-center gap-2">
          <Heart className="size-5 text-primary" aria-hidden="true" />
          <CardTitle className="text-lg sm:text-xl font-bold text-foreground">
            {t.registrationPage.form.personalInfoTitle}
          </CardTitle>
        </div>
        <CardDescription className="text-xs sm:text-sm text-muted-foreground">
          {t.registrationPage.form.personalInfoSubtitle}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} noValidate className="space-y-8">
          {/* Section 1: Personal & Contact Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <FormField
                id={`${formId}-displayName`}
                label={t.registrationPage.form.nameLabel}
                required
                error={errors.displayName}
              >
                <div className="relative">
                  <Input
                    id={`${formId}-displayName`}
                    name="displayName"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.displayName}
                    onChange={handleInputChange}
                    placeholder={t.registrationPage.form.namePlaceholder}
                    aria-invalid={Boolean(errors.displayName)}
                    aria-describedby={errors.displayName ? `${formId}-displayName-error` : undefined}
                    className="pl-9"
                  />
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
                    aria-hidden="true"
                  />
                </div>
              </FormField>

              {/* Blood Group */}
              <FormField
                id={`${formId}-bloodGroup`}
                label={t.registrationPage.form.bloodGroupLabel}
                required
                error={errors.bloodGroup}
              >
                <Select
                  id={`${formId}-bloodGroup`}
                  name="bloodGroup"
                  required
                  value={formData.bloodGroup}
                  onChange={handleSelectChange("bloodGroup")}
                  aria-invalid={Boolean(errors.bloodGroup)}
                  aria-describedby={errors.bloodGroup ? `${formId}-bloodGroup-error` : undefined}
                >
                  <option value="">{t.registrationPage.form.bloodGroupPlaceholder}</option>
                  {BLOOD_GROUPS.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Phone Number */}
              <FormField
                id={`${formId}-phoneNumber`}
                label={t.registrationPage.form.phoneLabel}
                required
                error={errors.phoneNumber}
                helperText={t.registrationPage.form.phoneHelper}
              >
                <Input
                  id={`${formId}-phoneNumber`}
                  name="phoneNumber"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder={t.registrationPage.form.phonePlaceholder}
                  aria-invalid={Boolean(errors.phoneNumber)}
                  aria-describedby={
                    errors.phoneNumber
                      ? `${formId}-phoneNumber-error`
                      : `${formId}-phoneNumber-help`
                  }
                />
              </FormField>

              {/* Phone Public Checkbox */}
              <div className="flex flex-col justify-end pt-1">
                <label className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors">
                  <input
                    id={`${formId}-isPhonePublic`}
                    name="isPhonePublic"
                    type="checkbox"
                    checked={formData.isPhonePublic}
                    onChange={handleInputChange}
                    className="mt-0.5 size-4 rounded border-input text-primary focus:ring-primary cursor-pointer"
                  />
                  <div className="space-y-0.5">
                    <span className="block text-xs font-semibold text-foreground">
                      {t.registrationPage.form.phonePublicLabel}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {t.registrationPage.form.phonePublicHelper}
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Section 2: Location */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-primary" aria-hidden="true" />
                <h3 className="text-sm font-bold text-foreground">
                  {t.registrationPage.form.locationTitle}
                </h3>
              </div>
              <p className="text-xs text-muted-foreground">
                {t.registrationPage.form.locationSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Division */}
              <FormField
                id={`${formId}-divisionId`}
                label={t.registrationPage.form.divisionLabel}
                required
                error={errors.divisionId}
              >
                <Select
                  id={`${formId}-divisionId`}
                  name="divisionId"
                  value={formData.divisionId}
                  onChange={handleSelectChange("divisionId")}
                  aria-invalid={Boolean(errors.divisionId)}
                  aria-describedby={errors.divisionId ? `${formId}-divisionId-error` : undefined}
                >
                  <option value="">{t.registrationPage.form.divisionPlaceholder}</option>
                  {divisions.map((div) => (
                    <option key={div.id} value={div.id}>
                      {locale === "en" ? div.nameEn : div.nameBn}
                    </option>
                  ))}
                </Select>
              </FormField>

              {/* District */}
              <FormField
                id={`${formId}-districtId`}
                label={t.registrationPage.form.districtLabel}
                required
                error={errors.districtId}
              >
                <Select
                  id={`${formId}-districtId`}
                  name="districtId"
                  value={formData.districtId}
                  onChange={handleSelectChange("districtId")}
                  aria-invalid={Boolean(errors.districtId)}
                  aria-describedby={errors.districtId ? `${formId}-districtId-error` : undefined}
                >
                  <option value="">{t.registrationPage.form.districtPlaceholder}</option>
                  {districts.map((dist) => (
                    <option key={dist.id} value={dist.id}>
                      {locale === "en" ? dist.nameEn : dist.nameBn}
                    </option>
                  ))}
                </Select>
              </FormField>

              {/* Upazila */}
              <FormField
                id={`${formId}-upazilaId`}
                label={t.registrationPage.form.upazilaLabel}
                required
                error={errors.upazilaId}
              >
                <Select
                  id={`${formId}-upazilaId`}
                  name="upazilaId"
                  value={formData.upazilaId}
                  onChange={handleSelectChange("upazilaId")}
                  disabled={!formData.districtId}
                  aria-invalid={Boolean(errors.upazilaId)}
                  aria-describedby={errors.upazilaId ? `${formId}-upazilaId-error` : undefined}
                >
                  <option value="">
                    {!formData.districtId
                      ? locale === "en"
                        ? "Select district first"
                        : "প্রথমে জেলা নির্বাচন করুন"
                      : t.registrationPage.form.upazilaPlaceholder}
                  </option>
                  {upazilas.map((upa) => (
                    <option key={upa.id} value={upa.id}>
                      {locale === "en" ? upa.nameEn : upa.nameBn}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>

            {/* Optional Area / Address */}
            <FormField
              id={`${formId}-area`}
              label={t.registrationPage.form.areaLabel}
              error={errors.area}
            >
              <Input
                id={`${formId}-area`}
                name="area"
                type="text"
                value={formData.area}
                onChange={handleInputChange}
                placeholder={t.registrationPage.form.areaPlaceholder}
                maxLength={150}
                aria-invalid={Boolean(errors.area)}
                aria-describedby={errors.area ? `${formId}-area-error` : undefined}
              />
            </FormField>
          </div>

          {/* Section 3: Donation History & Availability */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-primary" aria-hidden="true" />
                <h3 className="text-sm font-bold text-foreground">
                  {t.registrationPage.form.donationTitle}
                </h3>
              </div>
              <p className="text-xs text-muted-foreground">
                {t.registrationPage.form.donationSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Last Donation Date */}
              <FormField
                id={`${formId}-lastDonationDate`}
                label={t.registrationPage.form.lastDonationDateLabel}
                error={errors.lastDonationDate}
                helperText={t.registrationPage.form.lastDonationDateHelper}
              >
                <Input
                  id={`${formId}-lastDonationDate`}
                  name="lastDonationDate"
                  type="date"
                  value={formData.lastDonationDate}
                  onChange={handleInputChange}
                  max={maxDate}
                  aria-invalid={Boolean(errors.lastDonationDate)}
                  aria-describedby={
                    errors.lastDonationDate
                      ? `${formId}-lastDonationDate-error`
                      : `${formId}-lastDonationDate-help`
                  }
                />
              </FormField>

              {/* Availability Status */}
              <FormField
                id={`${formId}-availabilityStatus`}
                label={t.registrationPage.form.availabilityLabel}
                required
                error={errors.availabilityStatus}
              >
                <Select
                  id={`${formId}-availabilityStatus`}
                  name="availabilityStatus"
                  value={formData.availabilityStatus}
                  onChange={handleSelectChange("availabilityStatus")}
                  aria-invalid={Boolean(errors.availabilityStatus)}
                  aria-describedby={
                    errors.availabilityStatus ? `${formId}-availabilityStatus-error` : undefined
                  }
                >
                  <option value="available">{t.domain.donorStatus.available}</option>
                  <option value="unavailable">{t.domain.donorStatus.unavailable}</option>
                </Select>
              </FormField>
            </div>
          </div>

          {/* Section 4: Consent & Privacy Notice */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
              <div className="flex items-start gap-3">
                <ShieldCheck className="size-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t.registrationPage.form.privacyNotice}
                </p>
              </div>

              <label className="flex items-start gap-3 pt-2 cursor-pointer border-t border-primary/10">
                <input
                  id={`${formId}-consent`}
                  name="consent"
                  type="checkbox"
                  required
                  checked={formData.consent}
                  onChange={handleInputChange}
                  aria-invalid={Boolean(errors.consent)}
                  aria-describedby={errors.consent ? `${formId}-consent-error` : undefined}
                  className="mt-0.5 size-4 rounded border-input text-primary focus:ring-primary cursor-pointer"
                />
                <span className="text-xs text-foreground font-medium leading-relaxed">
                  {t.registrationPage.form.consentLabel}{" "}
                  <span className="text-destructive" aria-hidden="true">
                    *
                  </span>
                </span>
              </label>

              {errors.consent ? (
                <p
                  id={`${formId}-consent-error`}
                  role="alert"
                  className="text-xs font-semibold text-destructive flex items-center gap-1.5 pt-1"
                >
                  <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
                  <span>{errors.consent}</span>
                </p>
              ) : null}
            </div>

            {/* Submission Button */}
            <div className="pt-2">
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full sm:w-auto font-semibold shadow-xs min-w-[220px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" aria-hidden="true" />
                    <span>{t.registrationPage.form.submittingButton}</span>
                  </>
                ) : (
                  <>
                    <Heart className="size-4 mr-2" aria-hidden="true" />
                    <span>{t.registrationPage.form.submitButton}</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
