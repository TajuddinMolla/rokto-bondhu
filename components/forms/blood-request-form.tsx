"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@/lib/validations/zod-resolver";
import {
  AlertCircle,
  Loader2,
  RotateCcw,
  Hospital,
  MapPin,
  User,
  PhoneCall,
  ClipboardList,
  Search,
  Droplet,
  Clock,
  HeartPulse,
  BadgeCheck,
  ShieldCheck,
  Phone,
  FileText,
  SlidersHorizontal,
  CheckCircle2,
} from "lucide-react";

import { BLOOD_GROUPS } from "@/constants/blood-groups";
import {
  getDivisions,
  getDistricts,
  getUpazilas,
  getDistrictById,
  getDivisionById,
  getUpazilaById,
} from "@/constants/locations";
import {
  createBloodRequestSchema,
  type BloodRequestInput,
} from "@/lib/validations/blood-request";
import type { BloodRequest } from "@/types/request";
import { useAuth } from "@/hooks/use-auth";
import { useUserProfile } from "@/hooks/queries/use-user-profile";
import { useCreateBloodRequest } from "@/hooks/mutations/use-create-blood-request";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
  scope: "LOCAL",
  divisionId: "",
  districtId: "",
  upazilaId: "",
  hospitalName: "",
  locationAddress: "",
  neededAt: "",
  additionalNotes: "",
  consent: false,
};

// Date & Time Utility Helpers
function getLocalDateString(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getLocalTimeString(offsetHours = 1): string {
  const d = new Date();
  d.setHours(d.getHours() + offsetHours);
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(Math.floor(d.getMinutes() / 15) * 15).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function computePresetDateTime(preset: string): string {
  switch (preset) {
    case "asap":
      return `${getLocalDateString(0)}T${getLocalTimeString(1)}`;
    case "today_afternoon":
      return `${getLocalDateString(0)}T14:00`;
    case "today_evening":
      return `${getLocalDateString(0)}T18:00`;
    case "today_night":
      return `${getLocalDateString(0)}T21:00`;
    case "tomorrow_morning":
      return `${getLocalDateString(1)}T09:00`;
    case "tomorrow_afternoon":
      return `${getLocalDateString(1)}T14:00`;
    case "tomorrow_evening":
      return `${getLocalDateString(1)}T18:00`;
    default:
      return `${getLocalDateString(0)}T${getLocalTimeString(1)}`;
  }
}

function formatDisplayDateTime(isoDateTimeStr: string, locale: Locale): string {
  if (!isoDateTimeStr) return "";
  const d = new Date(isoDateTimeStr);
  if (isNaN(d.getTime())) return "";

  const optionsDate: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const optionsTime: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };

  const dateFormatted = d.toLocaleDateString(
    locale === "en" ? "en-US" : "bn-BD",
    optionsDate
  );
  const timeFormatted = d.toLocaleTimeString(
    locale === "en" ? "en-US" : "bn-BD",
    optionsTime
  );

  return `${dateFormatted} • ${timeFormatted}`;
}

export function BloodRequestForm({ locale }: BloodRequestFormProps) {
  const t = getTranslations(locale);
  const formId = React.useId();
  const searchParams = useSearchParams();

  const { user, status } = useAuth();
  const { data: userProfile } = useUserProfile(user?.uid);
  const createRequestMutation = useCreateBloodRequest();

  const [isSuccess, setIsSuccess] = React.useState(false);
  const [submittedSnapshot, setSubmittedSnapshot] = React.useState<
    BloodRequest | BloodRequestInput | null
  >(null);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [timingPreset, setTimingPreset] = React.useState<string>("asap");

  // Schema initialized with active locale
  const requestSchema = React.useMemo(
    () => createBloodRequestSchema(locale),
    [locale]
  );

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

  // Pre-fill user data once available
  const hasInitializedUserRef = React.useRef(false);
  React.useEffect(() => {
    if (!hasInitializedUserRef.current) {
      if (user?.displayName || userProfile?.displayName) {
        setValue(
          "requesterName",
          user?.displayName || userProfile?.displayName || ""
        );
      }
      if (userProfile?.phoneNumber) {
        setValue("contactNumber", userProfile.phoneNumber);
      }
      if (user?.displayName || userProfile?.phoneNumber) {
        hasInitializedUserRef.current = true;
      }
    }
  }, [user?.displayName, userProfile?.displayName, userProfile?.phoneNumber, setValue]);

  // Read URL search params on mount to pre-fill blood group & locations (from homepage / donor-card clicks)
  const hasInitializedParamsRef = React.useRef(false);
  React.useEffect(() => {
    if (!hasInitializedParamsRef.current && searchParams) {
      const bgParam = searchParams.get("bloodGroup");
      if (bgParam && (BLOOD_GROUPS as readonly string[]).includes(bgParam)) {
        setValue("bloodGroup", bgParam as BloodRequestInput["bloodGroup"], {
          shouldValidate: true,
        });
      }
      const divParam = searchParams.get("division");
      if (divParam) {
        setValue("divisionId", divParam, { shouldValidate: true });
      }
      const distParam = searchParams.get("district");
      if (distParam) {
        setValue("districtId", distParam, { shouldValidate: true });
      }
      const upzParam = searchParams.get("upazila");
      if (upzParam) {
        setValue("upazilaId", upzParam, { shouldValidate: true });
      }
      hasInitializedParamsRef.current = true;
    }
  }, [searchParams, setValue]);

  // Watch fields for reactive UI updates
  const watchedBloodGroup = useWatch({ control, name: "bloodGroup" });
  const watchedUnits = useWatch({ control, name: "unitsNeeded" }) || 1;
  const watchedUrgency = useWatch({ control, name: "urgency" }) || "urgent";
  const watchedScope = useWatch({ control, name: "scope" }) || "LOCAL";
  const watchedNeededAt = useWatch({ control, name: "neededAt" }) || "";
  const watchedDivisionId = useWatch({ control, name: "divisionId" });
  const watchedDistrictId = useWatch({ control, name: "districtId" });

  // Initialize default neededAt if empty on mount
  React.useEffect(() => {
    if (!watchedNeededAt) {
      const initial = computePresetDateTime("asap");
      setValue("neededAt", initial);
    }
  }, [watchedNeededAt, setValue]);

  const handleTimingPresetChange = (preset: string) => {
    setTimingPreset(preset);
    if (preset !== "custom") {
      const val = computePresetDateTime(preset);
      setValue("neededAt", val, { shouldValidate: true });
    } else {
      if (!watchedNeededAt) {
        const val = computePresetDateTime("asap");
        setValue("neededAt", val, { shouldValidate: true });
      }
    }
  };

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
    const parentDivision = val
      ? getDistrictById(val)?.divisionId
      : watchedDivisionId;
    if (parentDivision && parentDivision !== watchedDivisionId) {
      setValue("divisionId", parentDivision, { shouldValidate: true });
    }
    setValue("districtId", val, { shouldValidate: true });
    setValue("upazilaId", "", { shouldValidate: false });
  };

  const onSubmit = async (data: BloodRequestInput) => {
    if (!user?.uid) {
      setSubmitError(
        locale === "en"
          ? "Please sign in to your RoktoBondhu account to submit a blood request."
          : "রক্তের অনুরোধ প্রকাশ করতে অনুগ্রহ করে আপনার রক্তবন্ধু একাউন্টে লগইন করুন।"
      );
      return;
    }

    setSubmitError(null);

    try {
      const created = await createRequestMutation.mutateAsync({
        userId: user.uid,
        input: {
          requesterName: data.requesterName,
          contactNumber: data.contactNumber,
          bloodGroup: data.bloodGroup,
          unitsNeeded: data.unitsNeeded,
          divisionId: data.divisionId,
          districtId: data.districtId,
          upazilaId: data.upazilaId,
          hospitalName: data.hospitalName || undefined,
          locationAddress: data.locationAddress || undefined,
          neededAt: data.neededAt,
          urgency: data.urgency,
          scope: data.scope || "LOCAL",
          additionalNotes: data.additionalNotes || undefined,
        },
      });

      setSubmittedSnapshot(created);
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      const msg =
        (err as { message?: string })?.message ||
        (locale === "en"
          ? "Failed to save blood request. Please try again."
          : "রক্তের অনুরোধ সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।");
      setSubmitError(msg);
    }
  };

  const handleReset = () => {
    reset({
      ...INITIAL_FORM_STATE,
      requesterName: user?.displayName || userProfile?.displayName || "",
      contactNumber: userProfile?.phoneNumber || "",
    });
    setTimingPreset("asap");
    const initial = computePresetDateTime("asap");
    setValue("neededAt", initial);
    setSubmittedSnapshot(null);
    setSubmitError(null);
    setIsSuccess(false);
  };

  const isPending = createRequestMutation.isPending || isSubmitting;

  // -------------------------------------------------------------------------
  // SUCCESS STATE PRESENTATION
  // -------------------------------------------------------------------------
  if (isSuccess && submittedSnapshot) {
    const divisionName = submittedSnapshot.divisionId
      ? getDivisionById(submittedSnapshot.divisionId)?.[
          locale === "en" ? "nameEn" : "nameBn"
        ] || ""
      : "";
    const districtName = submittedSnapshot.districtId
      ? getDistrictById(submittedSnapshot.districtId)?.[
          locale === "en" ? "nameEn" : "nameBn"
        ] || ""
      : "";
    const upazilaName =
      submittedSnapshot.upazilaId
        ? getUpazilaById(
            submittedSnapshot.upazilaId
          )?.[locale === "en" ? "nameEn" : "nameBn"] || ""
        : "";

    const locationLabel = [upazilaName, districtName, divisionName]
      .filter(Boolean)
      .join(", ");

    const myRequestsHref =
      locale === "en" ? "/en/account/requests" : "/account/requests";

    return (
      <Card className="border border-emerald-500/30 bg-surface shadow-md rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-transparent p-6 sm:p-10 border-b border-border/80 text-center space-y-3">
          <div className="size-16 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="size-9" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <Badge
              variant="default"
              className="bg-emerald-600 hover:bg-emerald-600 text-white font-bold text-xs px-3 py-1"
            >
              {t.bloodRequestCreatePage.demoSuccess.badge}
            </Badge>
            <h2 className="text-xl sm:text-2xl font-black text-foreground">
              {t.bloodRequestCreatePage.demoSuccess.title}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {locale === "en"
              ? "Your blood requisition has been saved and broadcasted. Nearby voluntary donors can now view and respond to your request."
              : "আপনার রক্তের অনুরোধ সফলভাবে সংরক্ষিত হয়েছে। নিকটস্থ রক্তদাতা ও ভলান্টিয়াররা অবিলম্বে অনুরোধটি দেখতে ও সাড়া দিতে পারবেন।"}
          </p>
        </div>

        <CardContent className="p-6 sm:p-10 space-y-6">
          <div className="rounded-2xl border border-border/80 bg-muted/20 p-5 sm:p-6 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              {locale === "en" ? "Broadcast Details" : "অনুরোধের বিবরণ"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs">
                  {t.bloodRequestCreatePage.form.requesterNameLabel}:
                </span>
                <strong className="text-foreground font-bold">
                  {submittedSnapshot.requesterName}
                </strong>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">
                  {t.bloodRequestCreatePage.form.bloodGroupLabel}:
                </span>
                <strong className="text-primary font-black text-base">
                  {submittedSnapshot.bloodGroup} ({submittedSnapshot.unitsNeeded}{" "}
                  {locale === "en" ? "Bags" : "ব্যাগ"})
                </strong>
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
                  {t.bloodRequestCreatePage.form.urgencyLabel}:
                </span>
                <Badge
                  variant={
                    submittedSnapshot.urgency === "critical"
                      ? "destructive"
                      : "default"
                  }
                  className="font-bold text-xs"
                >
                  {t.domain.requestUrgency[submittedSnapshot.urgency]}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">
                  {t.bloodRequestCreatePage.form.hospitalNameLabel}:
                </span>
                <span className="text-foreground font-semibold">
                  {submittedSnapshot.hospitalName || "—"}
                </span>
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
                <span className="text-foreground font-semibold">
                  {submittedSnapshot.neededAt}
                </span>
              </div>
              {submittedSnapshot.additionalNotes ? (
                <div className="sm:col-span-2">
                  <span className="text-muted-foreground block text-xs">
                    {t.bloodRequestCreatePage.form.notesLabel}:
                  </span>
                  <p className="text-xs text-muted-foreground italic bg-surface p-3 rounded-xl border border-border mt-1">
                    {submittedSnapshot.additionalNotes}
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
            {"id" in submittedSnapshot && submittedSnapshot.id ? (
              <Button
                asChild
                className="w-full sm:w-auto gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs font-bold min-h-[46px] rounded-xl px-6 cursor-pointer"
              >
                <Link
                  href={`${
                    locale === "en" ? "/en" : ""
                  }/blood-request/${submittedSnapshot.id}`}
                >
                  <Search className="size-4" aria-hidden="true" />
                  <span>{t.matchingDonors.findDonorsBtn}</span>
                </Link>
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="w-full sm:w-auto gap-2 min-h-[46px] rounded-xl px-5 cursor-pointer"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              <span>{t.bloodRequestCreatePage.demoSuccess.resetButton}</span>
            </Button>
            <Button
              asChild
              variant="secondary"
              className="w-full sm:w-auto gap-2 min-h-[46px] rounded-xl px-5 cursor-pointer"
            >
              <Link href={myRequestsHref}>
                <ClipboardList className="size-4" aria-hidden="true" />
                <span>
                  {locale === "en"
                    ? "My Blood Requests"
                    : "আমার রক্তের অনুরোধ"}
                </span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // -------------------------------------------------------------------------
  // MAIN FORM LAYOUT: Matching Donors Page 12-Column Layout
  // -------------------------------------------------------------------------
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* ------------------------------------------------------------------- */}
      {/* LEFT / MAIN COLUMN: Simple Fast Blood Request Form (lg:col-span-8)  */}
      {/* ------------------------------------------------------------------- */}
      <div className="lg:col-span-8 space-y-6">
        {/* Authentication Notice if guest */}
        {status === "unauthenticated" ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 text-xs sm:text-sm">
            <div className="flex items-start gap-2.5">
              <AlertCircle
                className="size-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <span className="text-foreground leading-relaxed">
                {locale === "en"
                  ? "You must be signed in to submit and broadcast a blood request."
                  : "রক্তের অনুরোধ প্রকাশ করতে এবং পরবর্তীতে পরিচালনা করতে একাউন্টে লগইন থাকতে হবে।"}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto pt-2 sm:pt-0">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none min-h-[40px] rounded-xl"
              >
                <Link href={locale === "en" ? "/en/login" : "/login"}>
                  {locale === "en" ? "Sign In" : "লগইন"}
                </Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="flex-1 sm:flex-none min-h-[40px] rounded-xl"
              >
                <Link href={locale === "en" ? "/en/register" : "/register"}>
                  {locale === "en" ? "Create Account" : "একাউন্ট তৈরি"}
                </Link>
              </Button>
            </div>
          </div>
        ) : null}

        {/* Submission Error Banner */}
        {submitError ? (
          <div
            role="alert"
            aria-live="assertive"
            className="flex items-start gap-2.5 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-xs sm:text-sm text-destructive font-medium animate-in fade-in duration-200"
          >
            <AlertCircle className="size-5 shrink-0 mt-0.5" aria-hidden="true" />
            <span className="leading-relaxed">{submitError}</span>
          </div>
        ) : null}

        {/* Main Card with Simple Select Fields */}
        <Card className="rounded-3xl border border-border/80 bg-surface shadow-xs overflow-hidden">
          <CardHeader className="p-5 sm:p-6 border-b border-border/70 bg-surface">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <SlidersHorizontal className="size-4.5" aria-hidden="true" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg font-bold text-foreground">
                  {locale === "en"
                    ? "Emergency Blood Requisition Form"
                    : "জরুরি রক্তের আবেদন ফরম"}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  {locale === "en"
                    ? "Fill the select options below to broadcast immediately to donors"
                    : "রক্তদাতাদের দ্রুত সাড়া পেতে নিচের তথ্যগুলো নির্বাচন করুন"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5 sm:p-8">
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
              {/* ------------------------------------------------------------- */}
              {/* GROUP 1: BLOOD DETAILS & URGENCY (ALL SELECT FIELDS)          */}
              {/* ------------------------------------------------------------- */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                  <Droplet className="size-4 text-primary shrink-0" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                    {t.bloodRequestCreatePage.form.bloodDetailsTitle}
                  </h3>
                </div>

                {/* 1.1 Blood Group & Units Needed (2 Selects Side-by-Side) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Blood Group Select */}
                  <FormField
                    id={`${formId}-bloodGroup`}
                    label={t.bloodRequestCreatePage.form.bloodGroupLabel}
                    required
                    error={errors.bloodGroup?.message}
                  >
                    <Select
                      id={`${formId}-bloodGroup`}
                      className="min-h-[46px] rounded-xl text-sm font-semibold"
                      value={watchedBloodGroup || ""}
                      onChange={(e) =>
                        setValue(
                          "bloodGroup",
                          e.target.value as BloodRequestInput["bloodGroup"],
                          { shouldValidate: true }
                        )
                      }
                      aria-invalid={Boolean(errors.bloodGroup)}
                      aria-describedby={
                        errors.bloodGroup
                          ? `${formId}-bloodGroup-error`
                          : undefined
                      }
                    >
                      <option value="">
                        {t.bloodRequestCreatePage.form.bloodGroupPlaceholder}
                      </option>
                      {BLOOD_GROUPS.map((group) => (
                        <option key={group} value={group}>
                          {group} {locale === "en" ? "Group" : "গ্রুপ"}
                        </option>
                      ))}
                    </Select>
                  </FormField>

                  {/* Units Needed Select */}
                  <FormField
                    id={`${formId}-unitsNeeded`}
                    label={t.bloodRequestCreatePage.form.unitsLabel}
                    required
                    error={errors.unitsNeeded?.message}
                  >
                    <Select
                      id={`${formId}-unitsNeeded`}
                      className="min-h-[46px] rounded-xl text-sm font-semibold"
                      value={watchedUnits}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) {
                          setValue("unitsNeeded", val, {
                            shouldValidate: true,
                          });
                        }
                      }}
                      aria-invalid={Boolean(errors.unitsNeeded)}
                      aria-describedby={
                        errors.unitsNeeded
                          ? `${formId}-unitsNeeded-error`
                          : undefined
                      }
                    >
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {n} {locale === "en" ? (n === 1 ? "Bag" : "Bags") : "ব্যাগ"}
                          {n === 1
                            ? locale === "en"
                              ? " (Standard Need)"
                              : " (সাধারণ প্রয়োজন)"
                            : n === 2
                            ? locale === "en"
                              ? " (Surgery / Urgent)"
                              : " (অস্ত্রোপচার / জরুরি)"
                            : n >= 3 && n <= 4
                            ? locale === "en"
                              ? " (Major Surgery / ICU)"
                              : " (জরুরি অপারেশন / আইসিইউ)"
                            : ""}
                        </option>
                      ))}
                      <option value="12">
                        12 {locale === "en" ? "Bags" : "ব্যাগ"}
                      </option>
                      <option value="15">
                        15 {locale === "en" ? "Bags" : "ব্যাগ"}
                      </option>
                      <option value="20">
                        20 {locale === "en" ? "Bags (Max)" : "ব্যাগ (সর্বোচ্চ)"}
                      </option>
                    </Select>
                  </FormField>
                </div>

                {/* 1.2 Urgency Level & Broadcast Scope (2 Selects Side-by-Side) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Urgency Select */}
                  <FormField
                    id={`${formId}-urgency`}
                    label={t.bloodRequestCreatePage.form.urgencyLabel}
                    required
                    error={errors.urgency?.message}
                  >
                    <Select
                      id={`${formId}-urgency`}
                      className="min-h-[46px] rounded-xl text-sm font-semibold"
                      value={watchedUrgency}
                      onChange={(e) =>
                        setValue(
                          "urgency",
                          e.target.value as BloodRequestInput["urgency"],
                          { shouldValidate: true }
                        )
                      }
                      aria-invalid={Boolean(errors.urgency)}
                      aria-describedby={
                        errors.urgency ? `${formId}-urgency-error` : undefined
                      }
                    >
                      <option value="critical">
                        {locale === "en"
                          ? "🚨 Immediate / Critical (Trauma / ICU / Emergency)"
                          : "🚨 অতি জরুরি / জীবনসংকট (আইসিইউ / ট্রমা / জরুরি অপারেশন)"}
                      </option>
                      <option value="urgent">
                        {locale === "en"
                          ? "⚠️ Urgent (Within today or next few hours)"
                          : "⚠️ জরুরি (আজকের মধ্যে বা কয়েক ঘণ্টার মধ্যে)"}
                      </option>
                      <option value="normal">
                        {locale === "en"
                          ? "📅 Routine / Scheduled (Planned transfusion / surgery)"
                          : "📅 সাধারণ / নির্ধারিত (পরিকল্পিত রক্ত পরিসঞ্চালন)"}
                      </option>
                    </Select>
                  </FormField>

                  {/* Broadcast Scope Select */}
                  <FormField
                    id={`${formId}-scope`}
                    label={
                      locale === "en"
                        ? "Broadcast Scope"
                        : "বিজ্ঞপ্তি সম্প্রচারের পরিধি"
                    }
                    required
                  >
                    <Select
                      id={`${formId}-scope`}
                      className="min-h-[46px] rounded-xl text-sm font-semibold"
                      value={watchedScope}
                      onChange={(e) =>
                        setValue(
                          "scope",
                          e.target.value as BloodRequestInput["scope"],
                          { shouldValidate: true }
                        )
                      }
                    >
                      <option value="LOCAL">
                        {locale === "en"
                          ? "📍 Local District (Notifies nearby donors in this district)"
                          : "📍 শুধু জেলা ভিত্তিক (শুধু এই জেলার রক্তদাতারা পাবেন)"}
                      </option>
                      <option value="GLOBAL">
                        {locale === "en"
                          ? "🌐 Nationwide Broadcast (Extreme emergency across Bangladesh)"
                          : "🌐 সারাদেশব্যাপী জরুরি সম্প্রচার (চরম সংকটে সারা দেশের রক্তদাতারা পাবেন)"}
                      </option>
                    </Select>
                  </FormField>
                </div>

                {/* 1.3 When Needed Select + Custom Time Option */}
                <FormField
                  id={`${formId}-timingPreset`}
                  label={t.bloodRequestCreatePage.form.neededAtLabel}
                  required
                  error={errors.neededAt?.message}
                  helperText={t.bloodRequestCreatePage.form.neededAtHelper}
                >
                  <div className="space-y-2.5">
                    <Select
                      id={`${formId}-timingPreset`}
                      className="min-h-[46px] rounded-xl text-sm font-semibold"
                      value={timingPreset}
                      onChange={(e) => handleTimingPresetChange(e.target.value)}
                    >
                      <option value="asap">
                        {locale === "en"
                          ? "⚡ Immediately / ASAP (Within 1 hour)"
                          : "⚡ অবিলম্বে / আগামী ১ ঘণ্টার মধ্যে"}
                      </option>
                      <option value="today_afternoon">
                        {locale === "en"
                          ? "☀️ Today Afternoon (2:00 PM)"
                          : "☀️ আজ দুপুর (২:০০)"}
                      </option>
                      <option value="today_evening">
                        {locale === "en"
                          ? "🌇 Today Evening (6:00 PM)"
                          : "🌇 আজ সন্ধ্যা (৬:০০)"}
                      </option>
                      <option value="today_night">
                        {locale === "en"
                          ? "🌙 Tonight (9:00 PM)"
                          : "🌙 আজ রাত (৯:০০)"}
                      </option>
                      <option value="tomorrow_morning">
                        {locale === "en"
                          ? "🌅 Tomorrow Morning (9:00 AM)"
                          : "🌅 আগামীকাল সকাল (৯:০০)"}
                      </option>
                      <option value="tomorrow_afternoon">
                        {locale === "en"
                          ? "🌤️ Tomorrow Afternoon (2:00 PM)"
                          : "🌤️ আগামীকাল দুপুর (২:০০)"}
                      </option>
                      <option value="custom">
                        {locale === "en"
                          ? "🗓️ Custom Specific Date & Time..."
                          : "🗓️ নির্দিষ্ট তারিখ ও সময় নির্বাচন করুন..."}
                      </option>
                    </Select>

                    {timingPreset === "custom" ? (
                      <Input
                        type="datetime-local"
                        min={getLocalDateString(0) + "T00:00"}
                        value={watchedNeededAt}
                        onChange={(e) =>
                          setValue("neededAt", e.target.value, {
                            shouldValidate: true,
                          })
                        }
                        className="min-h-[46px] rounded-xl font-bold"
                      />
                    ) : (
                      watchedNeededAt && (
                        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary/5 border border-primary/20 text-xs text-foreground font-semibold">
                          <Clock className="size-3.5 text-primary shrink-0" />
                          <span>
                            {locale === "en" ? "Scheduled: " : "নির্ধারিত সময়: "}
                            <strong className="text-primary font-bold">
                              {formatDisplayDateTime(watchedNeededAt, locale)}
                            </strong>
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </FormField>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* GROUP 2: HOSPITAL & LOCATION (SELECTS & INPUTS)               */}
              {/* ------------------------------------------------------------- */}
              <div className="space-y-5 pt-3 border-t border-border/80">
                <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                  <Hospital className="size-4 text-primary shrink-0" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                    {t.bloodRequestCreatePage.form.hospitalLocationTitle}
                  </h3>
                </div>

                {/* Cascading 3 Selects: Division -> District -> Upazila */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Division Select */}
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
                      className="min-h-[46px] rounded-xl text-sm font-semibold"
                      aria-invalid={Boolean(errors.divisionId)}
                      aria-describedby={
                        errors.divisionId
                          ? `${formId}-divisionId-error`
                          : undefined
                      }
                    >
                      <option value="">
                        {t.bloodRequestCreatePage.form.divisionPlaceholder}
                      </option>
                      {divisions.map((div) => (
                        <option key={div.id} value={div.id}>
                          {locale === "en" ? div.nameEn : div.nameBn}
                        </option>
                      ))}
                    </Select>
                  </FormField>

                  {/* District Select */}
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
                      className="min-h-[46px] rounded-xl text-sm font-semibold"
                      aria-invalid={Boolean(errors.districtId)}
                      aria-describedby={
                        errors.districtId
                          ? `${formId}-districtId-error`
                          : undefined
                      }
                    >
                      <option value="">
                        {t.bloodRequestCreatePage.form.districtPlaceholder}
                      </option>
                      {districts.map((dist) => (
                        <option key={dist.id} value={dist.id}>
                          {locale === "en" ? dist.nameEn : dist.nameBn}
                        </option>
                      ))}
                    </Select>
                  </FormField>

                  {/* Upazila Select */}
                  <FormField
                    id={`${formId}-upazilaId`}
                    label={t.bloodRequestCreatePage.form.upazilaLabel}
                    required
                    error={errors.upazilaId?.message}
                  >
                    <Select
                      id={`${formId}-upazilaId`}
                      disabled={!watchedDistrictId}
                      className="min-h-[46px] rounded-xl text-sm font-semibold"
                      aria-invalid={Boolean(errors.upazilaId)}
                      aria-describedby={
                        errors.upazilaId
                          ? `${formId}-upazilaId-error`
                          : undefined
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

                {/* Hospital Name & Specific Ward/Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    id={`${formId}-hospitalName`}
                    label={t.bloodRequestCreatePage.form.hospitalNameLabel}
                    error={errors.hospitalName?.message}
                  >
                    <div className="relative">
                      <Input
                        id={`${formId}-hospitalName`}
                        type="text"
                        placeholder={
                          t.bloodRequestCreatePage.form.hospitalNamePlaceholder
                        }
                        maxLength={200}
                        className="pl-10 min-h-[46px] rounded-xl"
                        {...register("hospitalName")}
                      />
                      <Hospital
                        className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
                        aria-hidden="true"
                      />
                    </div>
                  </FormField>

                  <FormField
                    id={`${formId}-locationAddress`}
                    label={t.bloodRequestCreatePage.form.locationAddressLabel}
                    error={errors.locationAddress?.message}
                  >
                    <div className="relative">
                      <Input
                        id={`${formId}-locationAddress`}
                        type="text"
                        placeholder={
                          t.bloodRequestCreatePage.form.locationAddressPlaceholder
                        }
                        maxLength={250}
                        className="pl-10 min-h-[46px] rounded-xl"
                        {...register("locationAddress")}
                      />
                      <MapPin
                        className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
                        aria-hidden="true"
                      />
                    </div>
                  </FormField>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* GROUP 3: CONTACT & CONFIRMATION                               */}
              {/* ------------------------------------------------------------- */}
              <div className="space-y-5 pt-3 border-t border-border/80">
                <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                  <User className="size-4 text-primary shrink-0" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                    {t.bloodRequestCreatePage.form.patientInfoTitle}
                  </h3>
                </div>

                {/* Requester Name & Mobile Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        placeholder={
                          t.bloodRequestCreatePage.form.requesterNamePlaceholder
                        }
                        className="pl-10 min-h-[46px] rounded-xl"
                        {...register("requesterName")}
                      />
                      <User
                        className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
                        aria-hidden="true"
                      />
                    </div>
                  </FormField>

                  <FormField
                    id={`${formId}-contactNumber`}
                    label={t.bloodRequestCreatePage.form.contactLabel}
                    required
                    error={errors.contactNumber?.message}
                    helperText={t.bloodRequestCreatePage.form.contactHelper}
                  >
                    <div className="relative">
                      <Input
                        id={`${formId}-contactNumber`}
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder={
                          t.bloodRequestCreatePage.form.contactPlaceholder
                        }
                        className="pl-10 min-h-[46px] rounded-xl font-mono"
                        {...register("contactNumber")}
                      />
                      <PhoneCall
                        className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
                        aria-hidden="true"
                      />
                    </div>
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
                    placeholder={
                      t.bloodRequestCreatePage.form.notesPlaceholder
                    }
                    maxLength={500}
                    rows={2}
                    className="rounded-xl"
                    {...register("additionalNotes")}
                  />
                </FormField>

                {/* Consent Checkbox */}
                <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 space-y-2">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      id={`${formId}-consent`}
                      type="checkbox"
                      className="mt-0.5 size-4 rounded border-input text-primary focus:ring-primary cursor-pointer"
                      {...register("consent")}
                    />
                    <span className="text-xs sm:text-sm text-foreground font-medium leading-relaxed">
                      {t.bloodRequestCreatePage.form.consentLabel}{" "}
                      <span className="text-destructive" aria-hidden="true">
                        *
                      </span>
                    </span>
                  </label>
                  {errors.consent?.message ? (
                    <p
                      role="alert"
                      className="text-xs font-semibold text-destructive flex items-center gap-1.5 pt-1"
                    >
                      <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
                      <span>{errors.consent.message}</span>
                    </p>
                  ) : null}
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* SUBMISSION ACTION BUTTON                                      */}
              {/* ------------------------------------------------------------- */}
              <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-muted-foreground text-center sm:text-left leading-relaxed">
                  {locale === "en"
                    ? "Broadcasted requests notify nearby matching voluntary blood donors immediately."
                    : "অনুরোধ জমা দেওয়ার সাথে সাথে নিকটস্থ সামঞ্জস্যপূর্ণ স্বেচ্ছাসেবী রক্তদাতাদের অবহিত করা হবে।"}
                </p>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isPending || status === "unauthenticated"}
                  className="w-full sm:w-auto min-h-[50px] px-9 rounded-2xl font-black text-sm sm:text-base shadow-md shadow-primary/20 bg-gradient-to-r from-primary via-primary to-rose-700 hover:from-primary-hover hover:to-rose-800 text-white gap-2.5 cursor-pointer transition-all active:scale-[0.98]"
                >
                  {isPending ? (
                    <>
                      <Loader2
                        className="size-4 animate-spin"
                        aria-hidden="true"
                      />
                      <span>
                        {t.bloodRequestCreatePage.form.submittingButton}
                      </span>
                    </>
                  ) : (
                    <>
                      <BadgeCheck className="size-5" aria-hidden="true" />
                      <span>{t.bloodRequestCreatePage.form.submitButton}</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* RIGHT / SIDEBAR COLUMN: Hotlines & Guidelines (lg:col-span-4)       */}
      {/* ------------------------------------------------------------------- */}
      <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
        {/* Emergency Hotlines Card */}
        <Card className="rounded-3xl border border-destructive/25 bg-gradient-to-br from-destructive/[0.08] via-surface to-primary/[0.05] shadow-xs overflow-hidden">
          <CardHeader className="p-5 border-b border-destructive/20">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-destructive/15 text-destructive flex items-center justify-center shrink-0">
                <HeartPulse className="size-5 animate-pulse" aria-hidden="true" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-foreground">
                  {locale === "en"
                    ? "Emergency Medical Hotlines"
                    : "জরুরি চিকিৎসা সেবা হটলাইন"}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  {locale === "en"
                    ? "Immediate 24/7 emergency response"
                    : "তাৎক্ষণিক জীবনরক্ষাকারী সহায়তা"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            <a
              href="tel:999"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-destructive text-white hover:bg-destructive/90 transition-all font-bold text-xs shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0" />
                <span>{locale === "en" ? "National Emergency Service" : "জাতীয় জরুরি সেবা"}</span>
              </div>
              <span className="font-mono font-black text-sm">999</span>
            </a>

            <a
              href="tel:029116563"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-surface border border-border/80 hover:bg-muted text-foreground transition-all font-semibold text-xs"
            >
              <div className="flex items-center gap-2.5">
                <PhoneCall className="size-4 text-primary shrink-0" />
                <span>{locale === "en" ? "Red Crescent Blood Bank" : "রেড ক্রিসেন্ট ব্লাড ব্যাংক"}</span>
              </div>
              <span className="font-mono text-xs text-muted-foreground">02-9116563</span>
            </a>

            <a
              href="tel:01714010869"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-surface border border-border/80 hover:bg-muted text-foreground transition-all font-semibold text-xs"
            >
              <div className="flex items-center gap-2.5">
                <PhoneCall className="size-4 text-primary shrink-0" />
                <span>{locale === "en" ? "Quantum Blood Lab" : "কোয়ান্টাম ব্লাড ব্যাংক"}</span>
              </div>
              <span className="font-mono text-xs text-muted-foreground">01714-010869</span>
            </a>
          </CardContent>
        </Card>

        {/* Emergency Checklist Card */}
        <Card className="rounded-3xl border border-border/80 bg-surface shadow-xs overflow-hidden">
          <CardHeader className="p-5 border-b border-border/70">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-primary" aria-hidden="true" />
              <CardTitle className="text-sm font-bold text-foreground">
                {locale === "en"
                  ? "Emergency Request Checklist"
                  : "জরুরি রক্ত পাওয়ার চেকলিস্ট"}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5 text-xs text-muted-foreground space-y-3">
            <div className="flex items-start gap-2.5">
              <span className="size-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-[11px]">
                ১
              </span>
              <p className="leading-relaxed">
                {locale === "en"
                  ? "Ensure patient's cross-matching blood sample is tested and ready at the hospital lab."
                  : "রোগীর রক্তের ক্রস-ম্যাচিং টেস্টের স্যাম্পল হাসপাতালের ল্যাবে প্রস্তুত রাখুন।"}
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="size-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-[11px]">
                ২
              </span>
              <p className="leading-relaxed">
                {locale === "en"
                  ? "Keep your provided contact phone reachable and active 24/7 for donor calls."
                  : "প্রদত্ত মোবাইল ফোনটি সার্বক্ষণিক সচল রাখুন যাতে রক্তদাতা সরাসরি কল করতে পারেন।"}
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="size-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-[11px]">
                ৩
              </span>
              <p className="leading-relaxed">
                {locale === "en"
                  ? "Never offer or accept any commercial financial payment. Blood donation is 100% voluntary."
                  : "রক্তদানের জন্য কোনো আর্থিক লেনদেন করবেন না। রক্তবন্ধু সম্পূর্ণ অবাণিজ্যিক ও মানবিক।"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Platform Trust & Safety Card */}
        <Card className="rounded-3xl border border-border/80 bg-surface shadow-xs overflow-hidden">
          <CardContent className="p-5 space-y-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 text-foreground font-bold">
              <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{locale === "en" ? "Safe & Voluntary Network" : "নিরাপদ ও স্বেচ্ছাসেবী নেটওয়ার্ক"}</span>
            </div>
            <p className="leading-relaxed">
              {locale === "en"
                ? "Every blood request broadcast connects attendants directly with voluntary donors in 64 districts without middleman."
                : "রক্তবন্ধুর প্রতিটি রক্তের অনুরোধ কোনো মধ্যস্বত্বভোগী ছাড়া সরাসরি ৬৪ জেলার ভেরিফায়েড রক্তদাতাদের কাছে পৌঁছায়।"}
            </p>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
