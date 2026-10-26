"use client";

import * as React from "react";
import Link from "next/link";
import {
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RotateCcw,
  ListFilter,
  ShieldAlert,
  Hospital,
  MapPin,
  CalendarClock,
  User,
  PhoneCall,
} from "lucide-react";

import { BLOOD_GROUPS } from "@/constants/blood-groups";
import { REQUEST_URGENCIES, type RequestUrgency } from "@/types/blood";
import {
  getDivisions,
  getDistricts,
  getUpazilas,
  getDistrictById,
  getDivisionById,
  getUpazilaById,
} from "@/constants/locations";
import { createBloodRequestSchema } from "@/lib/validations/blood-request";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FormField } from "@/components/forms/form-field";
import { getTranslations } from "@/i18n/translations";
import type { Locale } from "@/i18n/config";

interface BloodRequestFormProps {
  locale: Locale;
}

interface FormState {
  requesterName: string;
  contactNumber: string;
  bloodGroup: string;
  unitsNeeded: number;
  urgency: RequestUrgency;
  divisionId: string;
  districtId: string;
  upazilaId: string;
  hospitalName: string;
  locationAddress: string;
  neededAt: string;
  additionalNotes: string;
  consent: boolean;
}

const INITIAL_FORM_STATE: FormState = {
  requesterName: "",
  contactNumber: "",
  bloodGroup: "",
  unitsNeeded: 1,
  urgency: "urgent",
  divisionId: "",
  districtId: "",
  upazilaId: "",
  hospitalName: "",
  locationAddress: "",
  neededAt: "",
  additionalNotes: "",
  consent: false,
};

export function BloodRequestForm({ locale }: BloodRequestFormProps) {
  const t = getTranslations(locale);
  const formId = React.useId();

  const [formData, setFormData] = React.useState<FormState>(INITIAL_FORM_STATE);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [submittedSnapshot, setSubmittedSnapshot] = React.useState<FormState | null>(null);

  // Schema initialized with active locale
  const requestSchema = React.useMemo(() => createBloodRequestSchema(locale), [locale]);

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

  // Input change handlers
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === "checkbox";
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: isCheckbox
        ? checked
        : name === "unitsNeeded"
        ? Math.max(1, Math.min(20, parseInt(value, 10) || 1))
        : value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSelectChange = (name: keyof FormState) => (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
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

    const result = requestSchema.safeParse(formData);

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
              {t.bloodRequestCreatePage.demoSuccess.badge}
            </Badge>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              {t.bloodRequestCreatePage.demoSuccess.title}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {t.bloodRequestCreatePage.demoSuccess.desc}
          </p>
        </div>

        <CardContent className="p-6 sm:p-8 space-y-6">
          <div className="rounded-xl border border-border bg-muted/20 p-4 sm:p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {locale === "en" ? "Validated Requisition Preview" : "যাচাইকৃত রক্তের অনুরোধ প্রিভিউ"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs">
                  {t.bloodRequestCreatePage.form.requesterNameLabel}:
                </span>
                <strong className="text-foreground">{submittedSnapshot.requesterName}</strong>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">
                  {t.bloodRequestCreatePage.form.contactLabel}:
                </span>
                <span className="text-foreground font-mono font-bold">
                  {submittedSnapshot.contactNumber}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">
                  {t.bloodRequestCreatePage.form.bloodGroupLabel}:
                </span>
                <strong className="text-primary font-bold">
                  {submittedSnapshot.bloodGroup} ({submittedSnapshot.unitsNeeded}{" "}
                  {locale === "en" ? "Units" : "ব্যাগ"})
                </strong>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">
                  {t.bloodRequestCreatePage.form.urgencyLabel}:
                </span>
                <span className="font-semibold text-destructive">
                  {t.domain.requestUrgency[submittedSnapshot.urgency]}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">
                  {t.bloodRequestCreatePage.form.hospitalLocationTitle}:
                </span>
                <span className="text-foreground">
                  {submittedSnapshot.hospitalName ? `${submittedSnapshot.hospitalName}, ` : ""}
                  {locationLabel}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">
                  {t.bloodRequestCreatePage.form.neededAtLabel}:
                </span>
                <span className="text-foreground">{submittedSnapshot.neededAt}</span>
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
              <span>{t.bloodRequestCreatePage.demoSuccess.resetButton}</span>
            </Button>
            <Button asChild className="w-full sm:w-auto gap-2">
              <Link href={locale === "en" ? "/en/blood-request" : "/blood-request"}>
                <ListFilter className="size-4" aria-hidden="true" />
                <span>{t.bloodRequestCreatePage.demoSuccess.viewRequestsButton}</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Emergency Medical Alert Banner */}
      <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive flex items-start gap-3">
        <ShieldAlert className="size-5 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-1">
          <h3 className="text-xs sm:text-sm font-bold">
            {t.bloodRequestCreatePage.emergencyBanner.title}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t.bloodRequestCreatePage.emergencyBanner.desc}
          </p>
          <div className="pt-1 flex flex-wrap items-center gap-3 text-xs font-semibold">
            <a
              href="tel:999"
              className="inline-flex items-center gap-1.5 text-destructive underline hover:opacity-80"
            >
              <PhoneCall className="size-3.5" aria-hidden="true" />
              <span>{locale === "en" ? "National Emergency (999)" : "জাতীয় জরুরি সেবা (৯৯৯)"}</span>
            </a>
            <span className="text-muted-foreground">•</span>
            <a
              href="tel:029116563"
              className="inline-flex items-center gap-1.5 text-destructive underline hover:opacity-80"
            >
              <PhoneCall className="size-3.5" aria-hidden="true" />
              <span>
                {locale === "en" ? "Red Crescent Blood Bank (02-9116563)" : "রেড ক্রিসেন্ট ব্লাড ব্যাংক (০২-৯১১৬৫৬৩)"}
              </span>
            </a>
          </div>
        </div>
      </div>

      <Card className="border border-border bg-surface shadow-sm">
        <CardHeader className="pb-6 border-b border-border">
          <div className="flex items-center gap-2">
            <PlusCircle className="size-5 text-primary" aria-hidden="true" />
            <CardTitle className="text-lg sm:text-xl font-bold text-foreground">
              {t.bloodRequestCreatePage.form.patientInfoTitle}
            </CardTitle>
          </div>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground">
            {t.bloodRequestCreatePage.form.patientInfoSubtitle}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} noValidate className="space-y-8">
            {/* Section 1: Contact Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Requester Name */}
              <FormField
                id={`${formId}-requesterName`}
                label={t.bloodRequestCreatePage.form.requesterNameLabel}
                required
                error={errors.requesterName}
              >
                <div className="relative">
                  <Input
                    id={`${formId}-requesterName`}
                    name="requesterName"
                    type="text"
                    required
                    value={formData.requesterName}
                    onChange={handleInputChange}
                    placeholder={t.bloodRequestCreatePage.form.requesterNamePlaceholder}
                    aria-invalid={Boolean(errors.requesterName)}
                    aria-describedby={
                      errors.requesterName ? `${formId}-requesterName-error` : undefined
                    }
                    className="pl-9"
                  />
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
                    aria-hidden="true"
                  />
                </div>
              </FormField>

              {/* Contact Number */}
              <FormField
                id={`${formId}-contactNumber`}
                label={t.bloodRequestCreatePage.form.contactLabel}
                required
                error={errors.contactNumber}
                helperText={t.bloodRequestCreatePage.form.contactHelper}
              >
                <Input
                  id={`${formId}-contactNumber`}
                  name="contactNumber"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  placeholder={t.bloodRequestCreatePage.form.contactPlaceholder}
                  aria-invalid={Boolean(errors.contactNumber)}
                  aria-describedby={
                    errors.contactNumber
                      ? `${formId}-contactNumber-error`
                      : `${formId}-contactNumber-help`
                  }
                />
              </FormField>
            </div>

            {/* Section 2: Blood Requirements & Urgency */}
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CalendarClock className="size-4 text-primary" aria-hidden="true" />
                  <h3 className="text-sm font-bold text-foreground">
                    {t.bloodRequestCreatePage.form.bloodDetailsTitle}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t.bloodRequestCreatePage.form.bloodDetailsSubtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Blood Group */}
                <FormField
                  id={`${formId}-bloodGroup`}
                  label={t.bloodRequestCreatePage.form.bloodGroupLabel}
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
                    aria-describedby={
                      errors.bloodGroup ? `${formId}-bloodGroup-error` : undefined
                    }
                  >
                    <option value="">{t.bloodRequestCreatePage.form.bloodGroupPlaceholder}</option>
                    {BLOOD_GROUPS.map((group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </Select>
                </FormField>

                {/* Units Needed */}
                <FormField
                  id={`${formId}-unitsNeeded`}
                  label={t.bloodRequestCreatePage.form.unitsLabel}
                  required
                  error={errors.unitsNeeded}
                  helperText={t.bloodRequestCreatePage.form.unitsHelper}
                >
                  <Input
                    id={`${formId}-unitsNeeded`}
                    name="unitsNeeded"
                    type="number"
                    min={1}
                    max={20}
                    step={1}
                    required
                    value={formData.unitsNeeded}
                    onChange={handleInputChange}
                    placeholder={t.bloodRequestCreatePage.form.unitsPlaceholder}
                    aria-invalid={Boolean(errors.unitsNeeded)}
                    aria-describedby={
                      errors.unitsNeeded
                        ? `${formId}-unitsNeeded-error`
                        : `${formId}-unitsNeeded-help`
                    }
                  />
                </FormField>

                {/* Urgency Level */}
                <FormField
                  id={`${formId}-urgency`}
                  label={t.bloodRequestCreatePage.form.urgencyLabel}
                  required
                  error={errors.urgency}
                >
                  <Select
                    id={`${formId}-urgency`}
                    name="urgency"
                    required
                    value={formData.urgency}
                    onChange={handleSelectChange("urgency")}
                    aria-invalid={Boolean(errors.urgency)}
                    aria-describedby={errors.urgency ? `${formId}-urgency-error` : undefined}
                  >
                    {REQUEST_URGENCIES.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {t.domain.requestUrgency[lvl]}
                      </option>
                    ))}
                  </Select>
                </FormField>
              </div>

              {/* Needed At Date & Time */}
              <FormField
                id={`${formId}-neededAt`}
                label={t.bloodRequestCreatePage.form.neededAtLabel}
                required
                error={errors.neededAt}
                helperText={t.bloodRequestCreatePage.form.neededAtHelper}
              >
                <Input
                  id={`${formId}-neededAt`}
                  name="neededAt"
                  type="datetime-local"
                  required
                  value={formData.neededAt}
                  onChange={handleInputChange}
                  aria-invalid={Boolean(errors.neededAt)}
                  aria-describedby={
                    errors.neededAt ? `${formId}-neededAt-error` : `${formId}-neededAt-help`
                  }
                />
              </FormField>
            </div>

            {/* Section 3: Hospital & Location */}
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-primary" aria-hidden="true" />
                  <h3 className="text-sm font-bold text-foreground">
                    {t.bloodRequestCreatePage.form.hospitalLocationTitle}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t.bloodRequestCreatePage.form.hospitalLocationSubtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Division */}
                <FormField
                  id={`${formId}-divisionId`}
                  label={t.bloodRequestCreatePage.form.divisionLabel}
                  required
                  error={errors.divisionId}
                >
                  <Select
                    id={`${formId}-divisionId`}
                    name="divisionId"
                    value={formData.divisionId}
                    onChange={handleSelectChange("divisionId")}
                    aria-invalid={Boolean(errors.divisionId)}
                    aria-describedby={
                      errors.divisionId ? `${formId}-divisionId-error` : undefined
                    }
                  >
                    <option value="">{t.bloodRequestCreatePage.form.divisionPlaceholder}</option>
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
                  label={t.bloodRequestCreatePage.form.districtLabel}
                  required
                  error={errors.districtId}
                >
                  <Select
                    id={`${formId}-districtId`}
                    name="districtId"
                    value={formData.districtId}
                    onChange={handleSelectChange("districtId")}
                    aria-invalid={Boolean(errors.districtId)}
                    aria-describedby={
                      errors.districtId ? `${formId}-districtId-error` : undefined
                    }
                  >
                    <option value="">{t.bloodRequestCreatePage.form.districtPlaceholder}</option>
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
                  label={t.bloodRequestCreatePage.form.upazilaLabel}
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
                    aria-describedby={
                      errors.upazilaId ? `${formId}-upazilaId-error` : undefined
                    }
                  >
                    <option value="">
                      {!formData.districtId
                        ? locale === "en"
                          ? "Select district first"
                          : "প্রথমে জেলা নির্বাচন করুন"
                        : t.bloodRequestCreatePage.form.upazilaPlaceholder}
                    </option>
                    {upazilas.map((upa) => (
                      <option key={upa.id} value={upa.id}>
                        {locale === "en" ? upa.nameEn : upa.nameBn}
                      </option>
                    ))}
                  </Select>
                </FormField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Hospital Name */}
                <FormField
                  id={`${formId}-hospitalName`}
                  label={t.bloodRequestCreatePage.form.hospitalNameLabel}
                  error={errors.hospitalName}
                >
                  <div className="relative">
                    <Input
                      id={`${formId}-hospitalName`}
                      name="hospitalName"
                      type="text"
                      value={formData.hospitalName}
                      onChange={handleInputChange}
                      placeholder={t.bloodRequestCreatePage.form.hospitalNamePlaceholder}
                      maxLength={200}
                      aria-invalid={Boolean(errors.hospitalName)}
                      aria-describedby={
                        errors.hospitalName ? `${formId}-hospitalName-error` : undefined
                      }
                      className="pl-9"
                    />
                    <Hospital
                      className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
                      aria-hidden="true"
                    />
                  </div>
                </FormField>

                {/* Location / Ward */}
                <FormField
                  id={`${formId}-locationAddress`}
                  label={t.bloodRequestCreatePage.form.locationAddressLabel}
                  error={errors.locationAddress}
                >
                  <Input
                    id={`${formId}-locationAddress`}
                    name="locationAddress"
                    type="text"
                    value={formData.locationAddress}
                    onChange={handleInputChange}
                    placeholder={t.bloodRequestCreatePage.form.locationAddressPlaceholder}
                    maxLength={250}
                    aria-invalid={Boolean(errors.locationAddress)}
                    aria-describedby={
                      errors.locationAddress ? `${formId}-locationAddress-error` : undefined
                    }
                  />
                </FormField>
              </div>

              {/* Additional Notes */}
              <FormField
                id={`${formId}-additionalNotes`}
                label={t.bloodRequestCreatePage.form.notesLabel}
                error={errors.additionalNotes}
              >
                <Textarea
                  id={`${formId}-additionalNotes`}
                  name="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={handleInputChange}
                  placeholder={t.bloodRequestCreatePage.form.notesPlaceholder}
                  maxLength={500}
                  aria-invalid={Boolean(errors.additionalNotes)}
                  aria-describedby={
                    errors.additionalNotes ? `${formId}-additionalNotes-error` : undefined
                  }
                />
              </FormField>
            </div>

            {/* Section 4: Consent & Submission */}
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
                <label className="flex items-start gap-3 cursor-pointer">
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
                    {t.bloodRequestCreatePage.form.consentLabel}{" "}
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
                      <span>{t.bloodRequestCreatePage.form.submittingButton}</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="size-4 mr-2" aria-hidden="true" />
                      <span>{t.bloodRequestCreatePage.form.submitButton}</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
