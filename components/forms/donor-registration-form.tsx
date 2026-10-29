"use client";

import * as React from "react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@/lib/validations/zod-resolver";
import {
  Heart,
  User,
  MapPin,
  Calendar,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
  RotateCcw,
  ShieldAlert,
  Edit3,
} from "lucide-react";

import { BLOOD_GROUPS } from "@/constants/blood-groups";
import {
  getDivisions,
  getDistricts,
  getUpazilas,
  getDivisionById,
  getDistrictById,
  getUpazilaById,
} from "@/constants/locations";
import { createDonorSchema, type DonorInput } from "@/lib/validations/donor";
import { useDonorProfile } from "@/hooks/queries/use-donor-profile";
import { useSaveDonorProfile } from "@/hooks/mutations/use-save-donor-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FormField } from "@/components/forms/form-field";
import { getTranslations } from "@/i18n/translations";
import { useAuth } from "@/hooks/use-auth";
import type { Locale } from "@/i18n/config";
import type { DonorProfile } from "@/types/donor";

interface DonorRegistrationFormProps {
  locale: Locale;
}

const INITIAL_FORM_STATE: DonorInput = {
  displayName: "",
  bloodGroup: "" as unknown as DonorInput["bloodGroup"],
  phoneNumber: "",
  isPhonePublic: false,
  contactMode: "PRIVATE",
  divisionId: "",
  districtId: "",
  upazilaId: "",
  area: "",
  lastDonationDate: "",
  availabilityStatus: "available",
  consent: false,
};

const emptySubscribe = () => () => {};
let cachedMaxDate: string | undefined;
function getMaxDate(): string {
  if (!cachedMaxDate) {
    cachedMaxDate = new Date().toISOString().split("T")[0];
  }
  return cachedMaxDate;
}
function getServerMaxDate(): undefined {
  return undefined;
}

export function DonorRegistrationForm({ locale }: DonorRegistrationFormProps) {
  const t = getTranslations(locale);
  const formId = React.useId();
  const { user, status } = useAuth();

  const [isSuccess, setIsSuccess] = React.useState(false);
  const [submittedSnapshot, setSubmittedSnapshot] = React.useState<DonorProfile | DonorInput | null>(null);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const { data: existingProfile, isLoading: isProfileLoading } = useDonorProfile(user?.uid);
  const saveDonorMutation = useSaveDonorProfile();

  const maxDate = React.useSyncExternalStore(emptySubscribe, getMaxDate, getServerMaxDate);

  // Schema initialized with active locale
  const donorSchema = React.useMemo(() => createDonorSchema(locale), [locale]);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<DonorInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(donorSchema as any),
    defaultValues: {
      ...INITIAL_FORM_STATE,
      displayName: user?.displayName || "",
    },
    mode: "onTouched",
  });

  // Watch location fields for cascading dependencies
  const watchedDivisionId = useWatch({ control, name: "divisionId" });
  const watchedDistrictId = useWatch({ control, name: "districtId" });
  const watchedAvailabilityStatus = useWatch({ control, name: "availabilityStatus" });
  const watchedIsPhonePublic = useWatch({ control, name: "isPhonePublic" });

  // Pre-fill existing donor profile when loaded (Edit Mode)
  const hasInitializedRef = React.useRef(false);
  React.useEffect(() => {
    if (existingProfile && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      reset({
        displayName: existingProfile.displayName,
        bloodGroup: existingProfile.bloodGroup,
        phoneNumber: existingProfile.phoneNumber,
        isPhonePublic: existingProfile.isPhonePublic,
        divisionId: existingProfile.divisionId,
        districtId: existingProfile.districtId,
        upazilaId: existingProfile.upazilaId,
        area: existingProfile.area || "",
        lastDonationDate: existingProfile.lastDonationDate || "",
        availabilityStatus: existingProfile.availabilityStatus,
        consent: true,
      });
    } else if (user?.displayName && !hasInitializedRef.current && !existingProfile) {
      hasInitializedRef.current = true;
      setValue("displayName", user.displayName);
    }
  }, [existingProfile, user?.displayName, reset, setValue]);

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

  // Form submission: Persists directly to Firestore using React Query mutation
  const onSubmit = async (data: DonorInput) => {
    setSubmitError(null);

    if (!user) {
      setSubmitError(
        locale === "en"
          ? "Please sign in or create an account to save your donor profile."
          : "রক্তদাতা প্রোফাইল সংরক্ষণ করতে অনুগ্রহ করে লগইন করুন বা অ্যাকাউন্ট তৈরি করুন।"
      );
      return;
    }

    try {
      const contactMode = data.isPhonePublic ? "PUBLIC" : "PRIVATE";
      const savedProfile = await saveDonorMutation.mutateAsync({
        uid: user.uid,
        input: {
          ...data,
          contactMode,
          phoneVisibility: contactMode,
        },
      });
      setSubmittedSnapshot(savedProfile);
      setIsSuccess(true);
    } catch (err: unknown) {
      console.error("[DonorRegistrationForm] Submission error:", err);
      const firestoreErr = err as { code?: string; message?: string };
      const errorCode = firestoreErr?.code;

      if (errorCode === "permission-denied") {
        setSubmitError(
          locale === "en"
            ? "Permission denied by Firestore database. Please make sure the Firestore Security Rules are published in your Firebase Console."
            : "ডাটাবেজে তথ্য সংরক্ষণের অনুমতি নেই (Permission Denied)। অনুগ্রহ করে ফায়ারবেস কনসোলে সিকিউরিটি রুলস প্রকাশ করুন অথবা পুনরায় লগইন করুন।"
        );
      } else if (errorCode === "unauthenticated") {
        setSubmitError(
          locale === "en"
            ? "Your login session has expired. Please sign in again."
            : "লগইন সেশনের মেয়াদ শেষ হয়েছে। অনুগ্রহ করে পুনরায় লগইন করুন।"
        );
      } else if (errorCode === "unavailable") {
        setSubmitError(
          locale === "en"
            ? "Database is currently unavailable. Please check your internet connection."
            : "ডাটাবেজের সাথে সংযোগ স্থাপন সম্ভব হয়নি। ইন্টারনেট সংযোগ যাচাই করে পুনরায় চেষ্টা করুন।"
        );
      } else {
        setSubmitError(
          firestoreErr?.message ||
            (locale === "en"
              ? "Failed to save donor profile to database. Please check your connection and try again."
              : "ডাটাবেজে রক্তদাতা প্রোফাইল সংরক্ষণ ব্যর্থ হয়েছে। ইন্টারনেট সংযোগ যাচাই করে পুনরায় চেষ্টা করুন।")
        );
      }
    }
  };

  const handleReset = () => {
    reset({
      ...INITIAL_FORM_STATE,
      displayName: user?.displayName || "",
    });
    setSubmittedSnapshot(null);
    setIsSuccess(false);
    setSubmitError(null);
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
              {locale === "en" ? "Profile Saved" : "প্রোফাইল সংরক্ষিত"}
            </Badge>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              {status === "authenticated"
                ? (locale === "en" ? "Donor Profile Successfully Saved!" : "রক্তদাতা প্রোফাইল সফলভাবে সংরক্ষিত হয়েছে!")
                : t.registrationPage.demoSuccess.title}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {locale === "en"
              ? "Your profile has been saved to the database. You can manage your availability anytime from your account."
              : "আপনার প্রোফাইল ডাটাবেজে সংরক্ষিত হয়েছে। আপনার অ্যাকাউন্ট থেকে যেকোনো সময় প্রাপ্যতা পরিবর্তন করতে পারবেন।"}
          </p>
        </div>

        <CardContent className="p-6 sm:p-8 space-y-6">
          <div className="rounded-xl border border-border bg-muted/20 p-4 sm:p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {locale === "en" ? "Active Donor Profile" : "সক্রিয় রক্তদাতা প্রোফাইল"}
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
                  {submittedSnapshot.phoneNumber}
                  {submittedSnapshot.isPhonePublic
                    ? ` (${locale === "en" ? "Public" : "পাবলিক"})`
                    : ` (${locale === "en" ? "Private" : "ব্যক্তিগত"})`}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">
                  {t.registrationPage.form.locationTitle}:
                </span>
                <span className="text-foreground">{locationLabel || "—"}</span>
              </div>
              {submittedSnapshot.area ? (
                <div className="sm:col-span-2">
                  <span className="text-muted-foreground block text-xs">
                    {t.registrationPage.form.areaLabel}:
                  </span>
                  <span className="text-foreground">{submittedSnapshot.area}</span>
                </div>
              ) : null}
              <div>
                <span className="text-muted-foreground block text-xs">
                  {t.registrationPage.form.lastDonationDateLabel}:
                </span>
                <span className="text-foreground">
                  {submittedSnapshot.lastDonationDate ||
                    (locale === "en" ? "Never donated yet" : "এখনো রক্ত দেননি")}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">
                  {t.registrationPage.form.availabilityLabel}:
                </span>
                <Badge
                  variant={
                    submittedSnapshot.availabilityStatus === "available"
                      ? "default"
                      : "secondary"
                  }
                >
                  {submittedSnapshot.availabilityStatus === "available"
                    ? t.domain.donorStatus.available
                    : t.domain.donorStatus.unavailable}
                </Badge>
              </div>
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
              <span>{locale === "en" ? "Edit Again" : "পুনরায় সম্পাদনা"}</span>
            </Button>
            <Button asChild className="w-full sm:w-auto gap-2">
              <Link href={locale === "en" ? "/en/account" : "/account"}>
                <User className="size-4" aria-hidden="true" />
                <span>{locale === "en" ? "Go to Account" : "অ্যাকাউন্টে যান"}</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const loginHref = locale === "en" ? "/en/login" : "/login";
  const registerHref = locale === "en" ? "/en/register" : "/register";
  const verifyEmailHref = locale === "en" ? "/en/verify-email" : "/verify-email";

  const isPending = saveDonorMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Authentication Guidance / Status Callout */}
      {status === "unauthenticated" ? (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/10 text-xs sm:text-sm">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="size-4.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
            <span className="text-foreground leading-relaxed">
              {t.auth.donorFormAuth.unauthenticatedNotice}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button asChild variant="outline" size="sm">
              <Link href={loginHref}>
                {t.auth.donorFormAuth.loginPrompt}
              </Link>
            </Button>
            <Button asChild variant="default" size="sm">
              <Link href={registerHref}>
                {t.auth.donorFormAuth.registerPrompt}
              </Link>
            </Button>
          </div>
        </div>
      ) : user ? (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="size-4.5 text-primary shrink-0" aria-hidden="true" />
            <span className="text-foreground">
              <span className="text-muted-foreground mr-1.5">{t.auth.donorFormAuth.authenticatedAs}</span>
              <strong>{user.displayName || user.email}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            {existingProfile && (
              <Badge variant="outline" className="border-primary/40 text-primary bg-primary/10 flex items-center gap-1">
                <Edit3 className="size-3" />
                <span>{locale === "en" ? "Existing Donor Profile" : "বিদ্যমান রক্তদাতা প্রোফাইল"}</span>
              </Badge>
            )}
            {!user.emailVerified && (
              <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                <span>{t.auth.donorFormAuth.unverifiedWarning}</span>
                <Link href={verifyEmailHref} className="font-semibold underline">
                  {t.auth.userMenu.verifyNow}
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Submit Error Banner */}
      {submitError && (
        <div
          role="alert"
          aria-live="assertive"
          className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive font-medium animate-in fade-in duration-200"
        >
          <ShieldAlert className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span className="leading-relaxed">{submitError}</span>
        </div>
      )}

      <Card className="border border-border bg-surface shadow-sm">
        <CardHeader className="pb-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="size-5 text-primary" aria-hidden="true" />
              <CardTitle className="text-lg sm:text-xl font-bold text-foreground">
                {existingProfile
                  ? (locale === "en" ? "Edit Donor Profile" : "রক্তদাতা প্রোফাইল সম্পাদনা")
                  : t.registrationPage.form.personalInfoTitle}
              </CardTitle>
            </div>
            {isProfileLoading && (
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            )}
          </div>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground">
            {existingProfile
              ? (locale === "en" ? "Update your availability status, contact, or location details." : "আপনার প্রাপ্যতা, যোগাযোগ বা অবস্থানের তথ্য আপডেট করুন।")
              : t.registrationPage.form.personalInfoSubtitle}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
            {/* Section 1: Personal & Contact Details */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <FormField
                  id={`${formId}-displayName`}
                  label={t.registrationPage.form.nameLabel}
                  required
                  error={errors.displayName?.message}
                >
                  <div className="relative">
                    <Input
                      id={`${formId}-displayName`}
                      type="text"
                      autoComplete="name"
                      placeholder={t.registrationPage.form.namePlaceholder}
                      aria-invalid={Boolean(errors.displayName)}
                      aria-describedby={errors.displayName ? `${formId}-displayName-error` : undefined}
                      className="pl-9"
                      {...register("displayName")}
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
                  error={errors.bloodGroup?.message}
                >
                  <Select
                    id={`${formId}-bloodGroup`}
                    aria-invalid={Boolean(errors.bloodGroup)}
                    aria-describedby={errors.bloodGroup ? `${formId}-bloodGroup-error` : undefined}
                    {...register("bloodGroup")}
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
                  error={errors.phoneNumber?.message}
                  helperText={t.registrationPage.form.phoneHelper}
                >
                  <Input
                    id={`${formId}-phoneNumber`}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder={t.registrationPage.form.phonePlaceholder}
                    aria-invalid={Boolean(errors.phoneNumber)}
                    aria-describedby={
                      errors.phoneNumber
                        ? `${formId}-phoneNumber-error`
                        : `${formId}-phoneNumber-help`
                    }
                    {...register("phoneNumber")}
                  />
                </FormField>

                {/* Phone Public Checkbox */}
                <div className="flex flex-col justify-end pt-1 space-y-2">
                  <label className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors">
                    <input
                      id={`${formId}-isPhonePublic`}
                      type="checkbox"
                      className="mt-0.5 size-4 rounded border-input text-primary focus:ring-primary cursor-pointer"
                      {...register("isPhonePublic")}
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

                  {watchedIsPhonePublic && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-900 dark:text-amber-200 animate-in fade-in duration-200">
                      <ShieldAlert className="size-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <strong className="font-semibold block">
                          {locale === "en" ? "Explicit Consent & Privacy Notice:" : "স্পষ্ট সম্মতি ও গোপনীয়তা নোটিশ:"}
                        </strong>
                        <p className="leading-relaxed">
                          {locale === "en"
                            ? "By enabling public phone visibility, your contact number will be visible to all visitors on public searches and profile pages with a direct 'Call Now' (tel:) link, without requiring an in-app contact request."
                            : "ফোন নম্বর উন্মুক্ত করলে যেকোনো সাধারণ ব্যবহারকারী বা রোগী রক্তদাতা অনুসন্ধানে আপনার নম্বর দেখতে পাবেন এবং সরাসরি কল করতে পারবেন। ব্যক্তিগত যোগাযোগের সুরক্ষা প্রযোজ্য হবে না।"}
                        </p>
                      </div>
                    </div>
                  )}
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
                  error={errors.divisionId?.message}
                >
                  <Select
                    id={`${formId}-divisionId`}
                    value={watchedDivisionId}
                    onChange={handleDivisionChange}
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
                  error={errors.districtId?.message}
                >
                  <Select
                    id={`${formId}-districtId`}
                    value={watchedDistrictId}
                    onChange={handleDistrictChange}
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
                  error={errors.upazilaId?.message}
                >
                  <Select
                    id={`${formId}-upazilaId`}
                    disabled={!watchedDistrictId}
                    aria-invalid={Boolean(errors.upazilaId)}
                    aria-describedby={errors.upazilaId ? `${formId}-upazilaId-error` : undefined}
                    {...register("upazilaId")}
                  >
                    <option value="">
                      {!watchedDistrictId
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
                error={errors.area?.message}
              >
                <Input
                  id={`${formId}-area`}
                  type="text"
                  placeholder={t.registrationPage.form.areaPlaceholder}
                  maxLength={150}
                  aria-invalid={Boolean(errors.area)}
                  aria-describedby={errors.area ? `${formId}-area-error` : undefined}
                  {...register("area")}
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
                  error={errors.lastDonationDate?.message}
                  helperText={t.registrationPage.form.lastDonationDateHelper}
                >
                  <Input
                    id={`${formId}-lastDonationDate`}
                    type="date"
                    max={maxDate}
                    aria-invalid={Boolean(errors.lastDonationDate)}
                    aria-describedby={
                      errors.lastDonationDate
                        ? `${formId}-lastDonationDate-error`
                        : `${formId}-lastDonationDate-help`
                    }
                    {...register("lastDonationDate")}
                  />
                </FormField>

                {/* Availability Status */}
                <FormField
                  id={`${formId}-availabilityStatus`}
                  label={t.registrationPage.form.availabilityLabel}
                  required
                  error={errors.availabilityStatus?.message}
                >
                  <Select
                    id={`${formId}-availabilityStatus`}
                    value={watchedAvailabilityStatus}
                    aria-invalid={Boolean(errors.availabilityStatus)}
                    aria-describedby={
                      errors.availabilityStatus ? `${formId}-availabilityStatus-error` : undefined
                    }
                    {...register("availabilityStatus")}
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
                    type="checkbox"
                    aria-invalid={Boolean(errors.consent)}
                    aria-describedby={errors.consent ? `${formId}-consent-error` : undefined}
                    className="mt-0.5 size-4 rounded border-input text-primary focus:ring-primary cursor-pointer"
                    {...register("consent")}
                  />
                  <span className="text-xs text-foreground font-medium leading-relaxed">
                    {t.registrationPage.form.consentLabel}{" "}
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

              {/* Submission Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isPending}
                  className="w-full sm:w-auto font-semibold shadow-xs min-w-[220px]"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" aria-hidden="true" />
                      <span>{t.registrationPage.form.submittingButton}</span>
                    </>
                  ) : existingProfile ? (
                    <>
                      <Edit3 className="size-4 mr-2" aria-hidden="true" />
                      <span>{locale === "en" ? "Update Donor Profile" : "রক্তদাতা প্রোফাইল আপডেট করুন"}</span>
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
    </div>
  );
}
