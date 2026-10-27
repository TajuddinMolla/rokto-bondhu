"use client";

import * as React from "react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@/lib/validations/zod-resolver";
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
import { REQUEST_URGENCIES } from "@/types/blood";
import {
  getDivisions,
  getDistricts,
  getUpazilas,
  getDistrictById,
  getDivisionById,
  getUpazilaById,
} from "@/constants/locations";
import { createBloodRequestSchema, type BloodRequestInput } from "@/lib/validations/blood-request";
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

const INITIAL_FORM_STATE: BloodRequestInput = {
  requesterName: "",
  contactNumber: "",
  bloodGroup: "" as unknown as BloodRequestInput["bloodGroup"],
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

  const [isSuccess, setIsSuccess] = React.useState(false);
  const [submittedSnapshot, setSubmittedSnapshot] = React.useState<BloodRequestInput | null>(null);

  // Schema initialized with active locale
  const requestSchema = React.useMemo(() => createBloodRequestSchema(locale), [locale]);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BloodRequestInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(requestSchema as any),
    defaultValues: INITIAL_FORM_STATE,
    mode: "onTouched",
  });

  // Watch location fields for cascading dependencies
  const watchedDivisionId = useWatch({ control, name: "divisionId" });
  const watchedDistrictId = useWatch({ control, name: "districtId" });
  const watchedUrgency = useWatch({ control, name: "urgency" });

  // Location datasets
  const divisions = React.useMemo(() => getDivisions(), []);
  const districts = React.useMemo(
    () => (watchedDivisionId ? getDistricts(watchedDivisionId) : getDistricts()),
    [watchedDivisionId]
  );
  const upazilas = React.useMemo(
    () => (watchedDistrictId ? getUpazilas(watchedDistrictId) : []),
    [watchedDistrictId]
  );

  const handleDivisionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setValue("divisionId", val, { shouldValidate: true });
    setValue("districtId", "", { shouldValidate: false });
    setValue("upazilaId", "", { shouldValidate: false });
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const parentDivision = val ? getDistrictById(val)?.divisionId : watchedDivisionId;
    if (parentDivision && parentDivision !== watchedDivisionId) {
      setValue("divisionId", parentDivision, { shouldValidate: true });
    }
    setValue("districtId", val, { shouldValidate: true });
    setValue("upazilaId", "", { shouldValidate: false });
  };

  const onSubmit = async (data: BloodRequestInput) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSubmittedSnapshot(data);
    setIsSuccess(true);
  };

  const handleReset = () => {
    reset(INITIAL_FORM_STATE);
    setSubmittedSnapshot(null);
    setIsSuccess(false);
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
              {locale === "en" ? "Broadcast Preview" : "অনুরোধের তথ্য প্রিভিউ"}
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
                  {t.bloodRequestCreatePage.form.bloodGroupLabel}:
                </span>
                <strong className="text-primary font-bold text-base">
                  {submittedSnapshot.bloodGroup} ({submittedSnapshot.unitsNeeded}{" "}
                  {locale === "en" ? "Bags" : "ব্যাগ"})
                </strong>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">
                  {t.bloodRequestCreatePage.form.contactLabel}:
                </span>
                <span className="text-foreground font-mono">{submittedSnapshot.contactNumber}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">
                  {t.bloodRequestCreatePage.form.urgencyLabel}:
                </span>
                <Badge
                  variant={submittedSnapshot.urgency === "critical" ? "destructive" : "default"}
                >
                  {t.domain.requestUrgency[submittedSnapshot.urgency]}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">
                  {t.bloodRequestCreatePage.form.hospitalNameLabel}:
                </span>
                <span className="text-foreground">{submittedSnapshot.hospitalName || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">
                  {t.bloodRequestCreatePage.form.hospitalLocationTitle}:
                </span>
                <span className="text-foreground">{locationLabel || "—"}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-muted-foreground block text-xs">
                  {t.bloodRequestCreatePage.form.neededAtLabel}:
                </span>
                <span className="text-foreground font-medium">{submittedSnapshot.neededAt}</span>
              </div>
              {submittedSnapshot.additionalNotes ? (
                <div className="sm:col-span-2">
                  <span className="text-muted-foreground block text-xs">
                    {t.bloodRequestCreatePage.form.notesLabel}:
                  </span>
                  <p className="text-xs text-muted-foreground italic bg-surface p-2 rounded border border-border">
                    {submittedSnapshot.additionalNotes}
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
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
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
            {/* Section 1: Contact Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Requester Name */}
              <FormField
                id={`${formId}-requesterName`}
                label={t.bloodRequestCreatePage.form.requesterNameLabel}
                required
                error={errors.requesterName?.message}
              >
                <div className="relative">
                  <Input
                    id={`${formId}-requesterName`}
                    type="text"
                    placeholder={t.bloodRequestCreatePage.form.requesterNamePlaceholder}
                    aria-invalid={Boolean(errors.requesterName)}
                    aria-describedby={
                      errors.requesterName ? `${formId}-requesterName-error` : undefined
                    }
                    className="pl-9"
                    {...register("requesterName")}
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
                error={errors.contactNumber?.message}
                helperText={t.bloodRequestCreatePage.form.contactHelper}
              >
                <Input
                  id={`${formId}-contactNumber`}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder={t.bloodRequestCreatePage.form.contactPlaceholder}
                  aria-invalid={Boolean(errors.contactNumber)}
                  aria-describedby={
                    errors.contactNumber
                      ? `${formId}-contactNumber-error`
                      : `${formId}-contactNumber-help`
                  }
                  {...register("contactNumber")}
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
                  error={errors.bloodGroup?.message}
                >
                  <Select
                    id={`${formId}-bloodGroup`}
                    aria-invalid={Boolean(errors.bloodGroup)}
                    aria-describedby={
                      errors.bloodGroup ? `${formId}-bloodGroup-error` : undefined
                    }
                    {...register("bloodGroup")}
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
                  error={errors.unitsNeeded?.message}
                  helperText={t.bloodRequestCreatePage.form.unitsHelper}
                >
                  <Input
                    id={`${formId}-unitsNeeded`}
                    type="number"
                    min={1}
                    max={20}
                    step={1}
                    placeholder={t.bloodRequestCreatePage.form.unitsPlaceholder}
                    aria-invalid={Boolean(errors.unitsNeeded)}
                    aria-describedby={
                      errors.unitsNeeded
                        ? `${formId}-unitsNeeded-error`
                        : `${formId}-unitsNeeded-help`
                    }
                    {...register("unitsNeeded", { valueAsNumber: true })}
                  />
                </FormField>

                {/* Urgency Level */}
                <FormField
                  id={`${formId}-urgency`}
                  label={t.bloodRequestCreatePage.form.urgencyLabel}
                  required
                  error={errors.urgency?.message}
                >
                  <Select
                    id={`${formId}-urgency`}
                    value={watchedUrgency}
                    aria-invalid={Boolean(errors.urgency)}
                    aria-describedby={errors.urgency ? `${formId}-urgency-error` : undefined}
                    {...register("urgency")}
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
                error={errors.neededAt?.message}
                helperText={t.bloodRequestCreatePage.form.neededAtHelper}
              >
                <Input
                  id={`${formId}-neededAt`}
                  type="datetime-local"
                  aria-invalid={Boolean(errors.neededAt)}
                  aria-describedby={
                    errors.neededAt ? `${formId}-neededAt-error` : `${formId}-neededAt-help`
                  }
                  {...register("neededAt")}
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
                  error={errors.divisionId?.message}
                >
                  <Select
                    id={`${formId}-divisionId`}
                    value={watchedDivisionId}
                    onChange={handleDivisionChange}
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
                  error={errors.districtId?.message}
                >
                  <Select
                    id={`${formId}-districtId`}
                    value={watchedDistrictId}
                    onChange={handleDistrictChange}
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
                  error={errors.upazilaId?.message}
                >
                  <Select
                    id={`${formId}-upazilaId`}
                    disabled={!watchedDistrictId}
                    aria-invalid={Boolean(errors.upazilaId)}
                    aria-describedby={
                      errors.upazilaId ? `${formId}-upazilaId-error` : undefined
                    }
                    {...register("upazilaId")}
                  >
                    <option value="">
                      {!watchedDistrictId
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
                  error={errors.hospitalName?.message}
                >
                  <div className="relative">
                    <Input
                      id={`${formId}-hospitalName`}
                      type="text"
                      placeholder={t.bloodRequestCreatePage.form.hospitalNamePlaceholder}
                      maxLength={200}
                      aria-invalid={Boolean(errors.hospitalName)}
                      aria-describedby={
                        errors.hospitalName ? `${formId}-hospitalName-error` : undefined
                      }
                      className="pl-9"
                      {...register("hospitalName")}
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
                  error={errors.locationAddress?.message}
                >
                  <Input
                    id={`${formId}-locationAddress`}
                    type="text"
                    placeholder={t.bloodRequestCreatePage.form.locationAddressPlaceholder}
                    maxLength={250}
                    aria-invalid={Boolean(errors.locationAddress)}
                    aria-describedby={
                      errors.locationAddress ? `${formId}-locationAddress-error` : undefined
                    }
                    {...register("locationAddress")}
                  />
                </FormField>
              </div>

              {/* Additional Notes */}
              <FormField
                id={`${formId}-additionalNotes`}
                label={t.bloodRequestCreatePage.form.notesLabel}
                error={errors.additionalNotes?.message}
              >
                <Textarea
                  id={`${formId}-additionalNotes`}
                  placeholder={t.bloodRequestCreatePage.form.notesPlaceholder}
                  maxLength={500}
                  aria-invalid={Boolean(errors.additionalNotes)}
                  aria-describedby={
                    errors.additionalNotes ? `${formId}-additionalNotes-error` : undefined
                  }
                  {...register("additionalNotes")}
                />
              </FormField>
            </div>

            {/* Section 4: Consent & Submission */}
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    id={`${formId}-consent`}
                    type="checkbox"
                    aria-invalid={Boolean(errors.consent)}
                    aria-describedby={errors.consent ? `${formId}-consent-error` : undefined}
                    className="mt-0.5 size-4 rounded border-input text-primary focus:ring-primary cursor-pointer"
                    {...register("consent")}
                  />
                  <span className="text-xs text-foreground font-medium leading-relaxed">
                    {t.bloodRequestCreatePage.form.consentLabel}{" "}
                    <span className="text-destructive" aria-hidden="true">
                      *
                    </span>
                  </span>
                </label>

                {errors.consent?.message ? (
                  <p
                    id={`${formId}-consent-error`}
                    role="alert"
                    className="text-xs font-semibold text-destructive flex items-center gap-1.5 pt-1"
                  >
                    <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
                    <span>{errors.consent.message}</span>
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
