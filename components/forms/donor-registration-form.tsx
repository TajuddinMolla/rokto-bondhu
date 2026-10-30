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
  Phone,
  Lock,
  Check,
  Sparkles,
  Activity,
  PhoneCall,
  Droplet,
} from "lucide-react";

import {
  BLOOD_GROUPS,
  getCompatibleRecipientGroups,
  isBloodGroup,
} from "@/constants/blood-groups";
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
  const prefix = locale === "en" ? "/en" : "";

  const [isSuccess, setIsSuccess] = React.useState(false);
  const [submittedSnapshot, setSubmittedSnapshot] = React.useState<
    DonorProfile | DonorInput | null
  >(null);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const { data: existingProfile, isLoading: isProfileLoading } =
    useDonorProfile(user?.uid);
  const saveDonorMutation = useSaveDonorProfile();

  const maxDate = React.useSyncExternalStore(
    emptySubscribe,
    getMaxDate,
    getServerMaxDate
  );

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

  // Watch fields for reactive UI updates
  const watchedBloodGroup = useWatch({ control, name: "bloodGroup" });
  const watchedDivisionId = useWatch({ control, name: "divisionId" });
  const watchedDistrictId = useWatch({ control, name: "districtId" });
  const watchedAvailabilityStatus =
    useWatch({ control, name: "availabilityStatus" }) || "available";
  const watchedIsPhonePublic =
    useWatch({ control, name: "isPhonePublic" }) ?? false;

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
        contactMode: existingProfile.contactMode || "PRIVATE",
        divisionId: existingProfile.divisionId,
        districtId: existingProfile.districtId,
        upazilaId: existingProfile.upazilaId,
        area: existingProfile.area || "",
        lastDonationDate: existingProfile.lastDonationDate || "",
        availabilityStatus: existingProfile.availabilityStatus,
        consent: true,
      });
    } else if (
      user?.displayName &&
      !hasInitializedRef.current &&
      !existingProfile
    ) {
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
    const parentDivision = val
      ? getDistrictById(val)?.divisionId
      : watchedDivisionId;
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
            ? "Permission denied by Firestore database. Please make sure you are signed in and try again."
            : "ডাটাবেজে তথ্য সংরক্ষণের অনুমতি নেই (Permission Denied)। অনুগ্রহ করে পুনরায় লগইন করে চেষ্টা করুন।"
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

  // ---------------------------------------------------------------------------
  // SUCCESS STATE: Celebratory Virtual Donor Card Preview
  // ---------------------------------------------------------------------------
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

    const recipientGroups = isBloodGroup(submittedSnapshot.bloodGroup)
      ? getCompatibleRecipientGroups(submittedSnapshot.bloodGroup)
      : [];

    return (
      <Card className="rounded-3xl border border-primary/25 bg-surface shadow-md overflow-hidden animate-in fade-in duration-300">
        <div className="bg-gradient-to-br from-primary/10 via-surface to-rose-500/10 border-b border-border/80 p-6 sm:p-10 text-center space-y-3">
          <div className="inline-flex items-center justify-center size-16 rounded-3xl bg-primary text-white shadow-lg shadow-primary/25 mb-1">
            <CheckCircle2 className="size-9" aria-hidden="true" />
          </div>
          <div>
            <Badge
              variant="default"
              className="bg-emerald-600 hover:bg-emerald-600 text-white font-bold text-xs px-3 py-1 mb-2"
            >
              {locale === "en" ? "Profile Verified & Saved" : "প্রোফাইল সংরক্ষিত ও সক্রিয়"}
            </Badge>
            <h2 className="text-xl sm:text-2xl font-black text-foreground">
              {locale === "en"
                ? "Voluntary Donor Profile Saved Successfully!"
                : "স্বেচ্ছাসেবী রক্তদাতা প্রোফাইল সফলভাবে সংরক্ষিত হয়েছে!"}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {locale === "en"
              ? "Your donor profile is now live in the cloud database. You can manage your contact privacy mode and availability status anytime from your account dashboard."
              : "আপনার রক্তদাতা প্রোফাইল ক্লাউড ডাটাবেজে সক্রিয় হয়েছে। আপনার অ্যাকাউন্ট ড্যাশবোর্ড থেকে যেকোনো সময় প্রাপ্যতা ও যোগাযোগের গোপনীয়তা পরিচালনা করতে পারবেন।"}
          </p>
        </div>

        <CardContent className="p-6 sm:p-10 space-y-6">
          {/* Virtual Donor Identity Card Preview */}
          <div className="relative rounded-3xl border border-primary/20 bg-gradient-to-br from-surface via-primary/[0.03] to-surface p-5 sm:p-7 shadow-xs space-y-5 overflow-hidden">
            <div
              className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-primary/10 blur-2xl"
              aria-hidden="true"
            />

            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center justify-center size-16 sm:size-20 rounded-2xl bg-gradient-to-br from-rose-600 via-primary to-rose-900 text-white font-black text-2xl sm:text-3xl shadow-md shrink-0">
                  <span>{submittedSnapshot.bloodGroup}</span>
                  <span className="text-[9px] uppercase tracking-wider font-semibold opacity-90">
                    {locale === "en" ? "Group" : "গ্রুপ"}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-primary font-bold uppercase tracking-wider">
                    <ShieldCheck className="size-4" />
                    <span>{locale === "en" ? "Verified Voluntary Donor" : "ভেরিফায়েড স্বেচ্ছাসেবী রক্তদাতা"}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-foreground">
                    {submittedSnapshot.displayName}
                  </h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="size-3.5 text-primary shrink-0" />
                    <span>{locationLabel || "—"}</span>
                  </p>
                </div>
              </div>

              <Badge
                variant={
                  submittedSnapshot.availabilityStatus === "available"
                    ? "default"
                    : "secondary"
                }
                className={`text-xs px-3 py-1 font-bold ${
                  submittedSnapshot.availabilityStatus === "available"
                    ? "bg-emerald-600 text-white"
                    : ""
                }`}
              >
                {submittedSnapshot.availabilityStatus === "available"
                  ? t.domain.donorStatus.available
                  : t.domain.donorStatus.unavailable}
              </Badge>
            </div>

            {/* Recipient Groups Pill Bar */}
            {recipientGroups.length > 0 && (
              <div className="pt-3 border-t border-border/60 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-muted-foreground font-semibold">
                  {locale === "en" ? "Can donate to:" : "রক্ত গ্রহণ করতে পারবেন:"}
                </span>
                <div className="flex flex-wrap items-center gap-1">
                  {recipientGroups.map((grp) => (
                    <span
                      key={grp}
                      className="px-2 py-0.5 rounded-lg bg-surface border border-primary/30 text-primary font-black text-xs"
                    >
                      {grp}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="w-full sm:w-auto gap-2 min-h-[46px] rounded-xl px-5 cursor-pointer font-semibold"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              <span>{locale === "en" ? "Edit Again" : "পুনরায় সম্পাদনা"}</span>
            </Button>
            <Button
              asChild
              className="w-full sm:w-auto gap-2 min-h-[46px] rounded-xl px-6 font-bold cursor-pointer"
            >
              <Link href={`${prefix}/account`}>
                <User className="size-4" aria-hidden="true" />
                <span>{locale === "en" ? "Go to My Account" : "আমার অ্যাকাউন্টে যান"}</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isPending = saveDonorMutation.isPending;
  const loginHref = `${prefix}/login`;
  const registerHref = `${prefix}/register`;
  const verifyEmailHref = `${prefix}/verify-email`;

  // Compatible recipients preview
  const compatibleRecipients =
    watchedBloodGroup && isBloodGroup(watchedBloodGroup)
      ? getCompatibleRecipientGroups(watchedBloodGroup)
      : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* ----------------------------------------------------------------- */}
      {/* LEFT / MAIN COLUMN: The Registration & Profile Form (8 cols)      */}
      {/* ----------------------------------------------------------------- */}
      <div className="lg:col-span-8 space-y-6">
        {/* Guest Authentication Guidance */}
        {status === "unauthenticated" ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl border border-amber-500/25 bg-amber-500/10 text-xs sm:text-sm">
            <div className="flex items-start gap-2.5">
              <AlertCircle
                className="size-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <span className="text-foreground leading-relaxed">
                {t.auth.donorFormAuth.unauthenticatedNotice}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto pt-2 sm:pt-0">
              <Button asChild variant="outline" size="sm" className="flex-1 sm:flex-none rounded-xl">
                <Link href={loginHref}>{t.auth.donorFormAuth.loginPrompt}</Link>
              </Button>
              <Button asChild size="sm" className="flex-1 sm:flex-none rounded-xl font-bold">
                <Link href={registerHref}>{t.auth.donorFormAuth.registerPrompt}</Link>
              </Button>
            </div>
          </div>
        ) : user ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl border border-primary/20 bg-primary/5 text-xs sm:text-sm">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="size-4.5 text-primary shrink-0" aria-hidden="true" />
              <span className="text-foreground">
                <span className="text-muted-foreground mr-1.5">{t.auth.donorFormAuth.authenticatedAs}</span>
                <strong>{user.displayName || user.email}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              {existingProfile && (
                <Badge variant="outline" className="border-primary/40 text-primary bg-primary/10 flex items-center gap-1 font-bold">
                  <Edit3 className="size-3" />
                  <span>{locale === "en" ? "Existing Donor Profile" : "বিদ্যমান রক্তদাতা প্রোফাইল"}</span>
                </Badge>
              )}
              {!user.emailVerified && (
                <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20 font-semibold">
                  <span>{t.auth.donorFormAuth.unverifiedWarning}</span>
                  <Link href={verifyEmailHref} className="underline">
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
            className="flex items-start gap-2.5 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-xs sm:text-sm text-destructive font-medium animate-in fade-in duration-200"
          >
            <ShieldAlert className="size-5 shrink-0 mt-0.5" aria-hidden="true" />
            <span className="leading-relaxed">{submitError}</span>
          </div>
        )}

        {/* Form Card Container */}
        <Card className="rounded-3xl border border-border/80 bg-surface shadow-xs overflow-hidden">
          <CardHeader className="p-5 sm:p-7 border-b border-border/70 bg-surface">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Heart className="size-5 fill-current" aria-hidden="true" />
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl font-black text-foreground tracking-tight">
                    {existingProfile
                      ? locale === "en"
                        ? "Edit Voluntary Donor Profile"
                        : "রক্তদাতা প্রোফাইল সম্পাদনা"
                      : t.registrationPage.form.personalInfoTitle}
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    {existingProfile
                      ? locale === "en"
                        ? "Update your availability status, contact privacy, or location details."
                        : "আপনার প্রাপ্যতা, যোগাযোগের গোপনীয়তা বা অবস্থানের তথ্য আপডেট করুন।"
                      : t.registrationPage.form.personalInfoSubtitle}
                  </CardDescription>
                </div>
              </div>

              {isProfileLoading && (
                <Loader2 className="size-4 text-muted-foreground animate-spin" />
              )}
            </div>
          </CardHeader>

          <CardContent className="p-5 sm:p-8">
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
              {/* ------------------------------------------------------------- */}
              {/* GROUP 1: BLOOD GROUP & PERSONAL IDENTITY                      */}
              {/* ------------------------------------------------------------- */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                  <Droplet className="size-4 text-primary shrink-0" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                    {locale === "en" ? "Blood Group & Personal Info" : "রক্তের গ্রুপ ও ব্যক্তিগত তথ্য"}
                  </h3>
                </div>

                {/* 1.1 Blood Group with 1-Tap 8-Group Matrix */}
                <FormField
                  id={`${formId}-bloodGroup`}
                  label={t.registrationPage.form.bloodGroupLabel}
                  required
                  error={errors.bloodGroup?.message}
                >
                  <div className="space-y-2.5">
                    {/* 8-Group Button Grid */}
                    <div
                      role="group"
                      aria-label={t.registrationPage.form.bloodGroupLabel}
                      className="grid grid-cols-4 sm:grid-cols-8 gap-2"
                    >
                      {BLOOD_GROUPS.map((group) => {
                        const isSelected = watchedBloodGroup === group;
                        return (
                          <button
                            key={group}
                            type="button"
                            onClick={() =>
                              setValue("bloodGroup", group as DonorInput["bloodGroup"], {
                                shouldValidate: true,
                              })
                            }
                            aria-pressed={isSelected}
                            className={`flex items-center justify-center h-12 rounded-2xl border text-sm font-black transition-all cursor-pointer min-h-[46px] touch-manipulation ${
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground shadow-md scale-[1.03]"
                                : "border-border bg-surface text-foreground hover:border-primary/50 hover:bg-primary-subtle"
                            }`}
                          >
                            <span>{group}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Accessible fallback Select */}
                    <Select
                      id={`${formId}-bloodGroup`}
                      aria-invalid={Boolean(errors.bloodGroup)}
                      aria-describedby={
                        errors.bloodGroup ? `${formId}-bloodGroup-error` : undefined
                      }
                      className="min-h-[46px] rounded-xl text-sm font-semibold"
                      {...register("bloodGroup")}
                    >
                      <option value="">{t.registrationPage.form.bloodGroupPlaceholder}</option>
                      {BLOOD_GROUPS.map((group) => (
                        <option key={group} value={group}>
                          {group} {locale === "en" ? "Group" : "গ্রুপ"}
                        </option>
                      ))}
                    </Select>

                    {/* Live Compatibility Recipient Assistant */}
                    {compatibleRecipients.length > 0 && (
                      <div className="p-3.5 rounded-2xl border border-primary/20 bg-primary/[0.04] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="text-muted-foreground font-semibold flex items-center gap-1.5">
                          <Sparkles className="size-3.5 text-primary shrink-0" />
                          <span>{t.registrationPage.recipientCompatibility}</span>
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {compatibleRecipients.map((grp) => (
                            <span
                              key={grp}
                              className="px-2 py-0.5 rounded-md bg-surface border border-primary/30 text-primary font-black text-xs shadow-2xs"
                            >
                              {grp}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </FormField>

                {/* 1.2 Full Name & Phone Number */}
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
                        aria-describedby={
                          errors.displayName ? `${formId}-displayName-error` : undefined
                        }
                        className="pl-9.5 min-h-[46px] rounded-xl text-sm font-semibold"
                        {...register("displayName")}
                      />
                      <User
                        className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
                        aria-hidden="true"
                      />
                    </div>
                  </FormField>

                  {/* Phone Number */}
                  <FormField
                    id={`${formId}-phoneNumber`}
                    label={t.registrationPage.form.phoneLabel}
                    required
                    error={errors.phoneNumber?.message}
                    helperText={t.registrationPage.form.phoneHelper}
                  >
                    <div className="relative">
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
                        className="pl-9.5 min-h-[46px] rounded-xl text-sm font-semibold font-mono"
                        {...register("phoneNumber")}
                      />
                      <Phone
                        className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
                        aria-hidden="true"
                      />
                    </div>
                  </FormField>
                </div>

                {/* 1.3 Interactive Contact Privacy Mode Cards */}
                <div className="space-y-2 pt-1">
                  <span className="block text-xs font-bold text-foreground uppercase tracking-wider">
                    {locale === "en" ? "Contact Privacy Mode" : "যোগাযোগের গোপনীয়তা মোড"}
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Private Mode Card (Default) */}
                    <button
                      type="button"
                      onClick={() => {
                        setValue("isPhonePublic", false, { shouldValidate: true });
                        setValue("contactMode", "PRIVATE");
                      }}
                      className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                        !watchedIsPhonePublic
                          ? "border-primary bg-primary/[0.04] ring-2 ring-primary/20 shadow-xs"
                          : "border-border/80 bg-surface hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex size-9 items-center justify-center rounded-xl shrink-0 ${
                            !watchedIsPhonePublic
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Lock className="size-4.5" />
                        </div>
                        <div className="space-y-1 min-w-0">
                          <strong className="text-xs sm:text-sm font-bold text-foreground block">
                            {t.registrationPage.privacyModes.privateTitle}
                          </strong>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            {t.registrationPage.privacyModes.privateDesc}
                          </p>
                        </div>
                      </div>
                    </button>

                    {/* Public Visibility Mode Card */}
                    <button
                      type="button"
                      onClick={() => {
                        setValue("isPhonePublic", true, { shouldValidate: true });
                        setValue("contactMode", "PUBLIC");
                      }}
                      className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                        watchedIsPhonePublic
                          ? "border-amber-500 bg-amber-500/[0.05] ring-2 ring-amber-500/20 shadow-xs"
                          : "border-border/80 bg-surface hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex size-9 items-center justify-center rounded-xl shrink-0 ${
                            watchedIsPhonePublic
                              ? "bg-amber-600 text-white"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <PhoneCall className="size-4.5" />
                        </div>
                        <div className="space-y-1 min-w-0">
                          <strong className="text-xs sm:text-sm font-bold text-foreground block">
                            {t.registrationPage.privacyModes.publicTitle}
                          </strong>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            {t.registrationPage.privacyModes.publicDesc}
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* GROUP 2: LOCATION & ADMINISTRATIVE GEOGRAPHY                  */}
              {/* ------------------------------------------------------------- */}
              <div className="space-y-5 pt-4 border-t border-border/60">
                <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                  <MapPin className="size-4 text-primary shrink-0" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                    {t.registrationPage.form.locationTitle}
                  </h3>
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
                      aria-describedby={
                        errors.divisionId ? `${formId}-divisionId-error` : undefined
                      }
                      className="min-h-[46px] rounded-xl text-sm font-semibold"
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
                      aria-describedby={
                        errors.districtId ? `${formId}-districtId-error` : undefined
                      }
                      className="min-h-[46px] rounded-xl text-sm font-semibold"
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
                      aria-describedby={
                        errors.upazilaId ? `${formId}-upazilaId-error` : undefined
                      }
                      className="min-h-[46px] rounded-xl text-sm font-semibold"
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

                {/* Specific Area / Street Address */}
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
                    className="min-h-[46px] rounded-xl text-sm font-semibold"
                    {...register("area")}
                  />
                </FormField>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* GROUP 3: READINESS & DONATION HISTORY                         */}
              {/* ------------------------------------------------------------- */}
              <div className="space-y-5 pt-4 border-t border-border/60">
                <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                  <Calendar className="size-4 text-primary shrink-0" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                    {t.registrationPage.form.donationTitle}
                  </h3>
                </div>

                {/* 3.1 Availability Interactive Cards */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
                    {t.registrationPage.form.availabilityLabel}
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setValue("availabilityStatus", "available", {
                          shouldValidate: true,
                        })
                      }
                      className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                        watchedAvailabilityStatus === "available"
                          ? "border-emerald-500 bg-emerald-500/[0.06] ring-2 ring-emerald-500/20 shadow-xs"
                          : "border-border/80 bg-surface hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex size-3 rounded-full bg-emerald-500 animate-pulse" />
                        <div>
                          <strong className="text-xs sm:text-sm font-bold text-foreground block">
                            {t.domain.donorStatus.available}
                          </strong>
                          <span className="text-[11px] text-muted-foreground block mt-0.5">
                            {locale === "en"
                              ? "Healthy and currently available to donate"
                              : "শারীরিকভাবে সুস্থ এবং রক্তদানের জন্য প্রস্তুত"}
                          </span>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setValue("availabilityStatus", "unavailable", {
                          shouldValidate: true,
                        })
                      }
                      className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                        watchedAvailabilityStatus === "unavailable"
                          ? "border-amber-500 bg-amber-500/[0.06] ring-2 ring-amber-500/20 shadow-xs"
                          : "border-border/80 bg-surface hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex size-3 rounded-full bg-amber-500" />
                        <div>
                          <strong className="text-xs sm:text-sm font-bold text-foreground block">
                            {t.domain.donorStatus.unavailable}
                          </strong>
                          <span className="text-[11px] text-muted-foreground block mt-0.5">
                            {locale === "en"
                              ? "Temporarily on break or recovering"
                              : "অসুস্থতা বা সাম্প্রতিক রক্তদানের কারণে সাময়িক বিরতি"}
                          </span>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 3.2 Last Donation Date */}
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
                    className="min-h-[46px] rounded-xl text-sm font-semibold"
                    {...register("lastDonationDate")}
                  />
                </FormField>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* GROUP 4: CONSENT & SUBMISSION                                 */}
              {/* ------------------------------------------------------------- */}
              <div className="space-y-4 pt-4 border-t border-border/60">
                <div className="p-4 sm:p-5 rounded-2xl border border-primary/20 bg-primary/5 space-y-3">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="size-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {t.registrationPage.form.privacyNotice}
                    </p>
                  </div>

                  <label className="flex items-start gap-3 pt-3 cursor-pointer border-t border-primary/10">
                    <input
                      id={`${formId}-consent`}
                      type="checkbox"
                      aria-invalid={Boolean(errors.consent)}
                      aria-describedby={errors.consent ? `${formId}-consent-error` : undefined}
                      className="mt-0.5 size-4 rounded border-input text-primary focus:ring-primary cursor-pointer"
                      {...register("consent")}
                    />
                    <span className="text-xs text-foreground font-semibold leading-relaxed">
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

                {/* Submission CTA */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isPending}
                    className="w-full sm:w-auto font-black shadow-md shadow-primary/20 min-h-[50px] px-8 rounded-2xl text-sm sm:text-base cursor-pointer"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="size-4.5 mr-2 animate-spin" aria-hidden="true" />
                        <span>{t.registrationPage.form.submittingButton}</span>
                      </>
                    ) : existingProfile ? (
                      <>
                        <Edit3 className="size-4.5 mr-2" aria-hidden="true" />
                        <span>
                          {locale === "en"
                            ? "Update Donor Profile"
                            : "রক্তদাতা প্রোফাইল আপডেট করুন"}
                        </span>
                      </>
                    ) : (
                      <>
                        <Heart className="size-4.5 mr-2 fill-current" aria-hidden="true" />
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

      {/* ----------------------------------------------------------------- */}
      {/* RIGHT COLUMN: Senior Medical Eligibility & Trust Sidebar (4 cols) */}
      {/* ----------------------------------------------------------------- */}
      <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
        {/* Card 1: Medical Donor Eligibility Checklist */}
        <Card className="rounded-3xl border border-border/80 bg-surface shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border/60">
            <div className="size-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Activity className="size-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-foreground">
                {t.registrationPage.sidebar.eligibilityTitle}
              </h3>
              <span className="text-[11px] text-muted-foreground block">
                {locale === "en" ? "Medical Pre-Screening" : "চিকিৎসা সংক্রান্ত যোগ্যতা"}
              </span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            {t.registrationPage.sidebar.eligibilityDesc}
          </p>

          <ul className="space-y-3 text-xs text-foreground font-medium">
            <li className="flex items-start gap-2.5">
              <Check className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t.registrationPage.sidebar.ageRule}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Check className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t.registrationPage.sidebar.weightRule}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Check className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t.registrationPage.sidebar.intervalRule}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Check className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t.registrationPage.sidebar.healthRule}</span>
            </li>
          </ul>
        </Card>

        {/* Card 2: Privacy & Protection Guarantees */}
        <Card className="rounded-3xl border border-border/80 bg-surface shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border/60">
            <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <ShieldCheck className="size-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-foreground">
                {t.registrationPage.sidebar.privacyTitle}
              </h3>
              <span className="text-[11px] text-muted-foreground block">
                {locale === "en" ? "100% Volunteer Privacy" : "সম্পূর্ণ সুরক্ষা নিশ্চয়তা"}
              </span>
            </div>
          </div>

          <ul className="space-y-2.5 text-xs text-muted-foreground leading-relaxed">
            <li className="flex items-start gap-2.5">
              <div className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              <span>{t.registrationPage.sidebar.privacy1}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <div className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              <span>{t.registrationPage.sidebar.privacy2}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <div className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              <span>{t.registrationPage.sidebar.privacy3}</span>
            </li>
          </ul>
        </Card>

        {/* Card 3: Health Benefits */}
        <Card className="rounded-3xl border border-border/80 bg-gradient-to-br from-surface to-primary/[0.03] shadow-xs p-5 sm:p-6 space-y-3.5">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-primary">
            <Heart className="size-4 fill-primary" />
            <span>{t.registrationPage.sidebar.benefitsTitle}</span>
          </div>

          <ul className="space-y-2 text-xs text-muted-foreground leading-relaxed">
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span>{t.registrationPage.sidebar.benefit1}</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span>{t.registrationPage.sidebar.benefit2}</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span>{t.registrationPage.sidebar.benefit3}</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
