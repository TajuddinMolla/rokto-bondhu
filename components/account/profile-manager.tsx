"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/validations/zod-resolver";
import { z } from "zod";
import {
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  Heart,
  Droplet,
  Edit3,
  Loader2,
  CheckCircle2,
  LogOut,
  Power,
  ClipboardList,
  PlusCircle,
  ArrowRight,
  Lock,
  Globe,
  PhoneCall,
  MessageSquare,
  Bell,
  Mail,
} from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { useUserProfile } from "@/hooks/queries/use-user-profile";
import { useDonorProfile } from "@/hooks/queries/use-donor-profile";
import { useMyBloodRequests } from "@/hooks/queries/use-my-blood-requests";
import {
  useIncomingContactRequests,
  useOutgoingContactRequests,
} from "@/hooks/queries/use-contact-requests";
import { useUnreadNotificationsCount } from "@/hooks/queries/use-notifications";
import { useUpdateDonorAvailability } from "@/hooks/mutations/use-update-donor-availability";
import { useUpdateUserProfile } from "@/hooks/mutations/use-update-user-profile";
import { useUpdateDonorContactMode } from "@/hooks/mutations/use-contact-request-mutations";
import { useUpdateNotificationPreferences } from "@/hooks/mutations/use-notification-mutations";
import { getDivisionById, getDistrictById, getUpazilaById } from "@/constants/locations";
import { BD_PHONE_REGEX } from "@/lib/validations/donor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FormField } from "@/components/forms/form-field";
import { getTranslations } from "@/i18n/translations";
import type { Locale } from "@/i18n/config";
import type { DonorContactMode } from "@/types/donor";

interface ProfileManagerProps {
  locale: Locale;
}

export function ProfileManager({ locale }: ProfileManagerProps) {
  const t = getTranslations(locale);
  const router = useRouter();
  const { user, status, logout } = useAuth();

  const [isEditingAccount, setIsEditingAccount] = React.useState(false);
  const [accountUpdateSuccess, setAccountUpdateSuccess] = React.useState(false);

  // Queries
  const { data: userProfile, isLoading: isUserLoading } = useUserProfile(user?.uid);
  const { data: donorProfile, isLoading: isDonorLoading } = useDonorProfile(user?.uid);
  const { data: myRequests = [] } = useMyBloodRequests(user?.uid);
  const { data: incomingContactRequests = [] } = useIncomingContactRequests(user?.uid);
  const { data: outgoingContactRequests = [] } = useOutgoingContactRequests(user?.uid);
  const { data: unreadCount = 0 } = useUnreadNotificationsCount(user?.uid);

  // Mutations
  const updateAvailabilityMutation = useUpdateDonorAvailability();
  const updateUserMutation = useUpdateUserProfile();
  const updateContactModeMutation = useUpdateDonorContactMode();
  const updatePreferencesMutation = useUpdateNotificationPreferences();

  const prefix = locale === "en" ? "/en" : "";
  const loginHref = `${prefix}/login`;
  const donorRegisterHref = `${prefix}/donors/register`;
  const verifyEmailHref = `${prefix}/verify-email`;
  const myRequestsHref = `${prefix}/account/requests`;
  const contactRequestsHref = `${prefix}/account/contact-requests`;
  const notificationsHref = `${prefix}/account/notifications`;
  const createRequestHref = `${prefix}/blood-request/create`;

  // Redirect if not logged in
  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push(loginHref);
    }
  }, [status, router, loginHref]);

  // Account edit schema
  const accountSchema = React.useMemo(() => {
    return z.object({
      displayName: z
        .string()
        .trim()
        .min(2, locale === "en" ? "Name must be at least 2 characters" : "নাম কমপক্ষে ২ অক্ষরের হতে হবে"),
      phoneNumber: z
        .string()
        .trim()
        .regex(
          BD_PHONE_REGEX,
          locale === "en"
            ? "Enter a valid Bangladeshi phone number"
            : "সঠিক বাংলাদেশী মোবাইল নম্বর প্রদান করুন"
        )
        .optional()
        .or(z.literal("")),
    });
  }, [locale]);

  type AccountFormValues = z.infer<typeof accountSchema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting: isAccountSubmitting },
  } = useForm<AccountFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(accountSchema as any),
    defaultValues: {
      displayName: "",
      phoneNumber: "",
    },
  });

  // Pre-fill account edit form
  React.useEffect(() => {
    if (userProfile) {
      reset({
        displayName: userProfile.displayName || "",
        phoneNumber: userProfile.phoneNumber || "",
      });
    }
  }, [userProfile, reset]);

  const onUpdateAccount = async (data: AccountFormValues) => {
    if (!user) return;
    try {
      await updateUserMutation.mutateAsync({
        uid: user.uid,
        data: {
          displayName: data.displayName,
          phoneNumber: data.phoneNumber || undefined,
        },
      });
      setIsEditingAccount(false);
      setAccountUpdateSuccess(true);
      setTimeout(() => setAccountUpdateSuccess(false), 4000);
    } catch {
      // Error handled by mutation
    }
  };

  const handleToggleAvailability = async () => {
    if (!user || !donorProfile) return;
    const nextStatus = donorProfile.availabilityStatus === "available" ? "unavailable" : "available";
    await updateAvailabilityMutation.mutateAsync({
      uid: user.uid,
      status: nextStatus,
    });
  };

  const [contactModeSuccess, setContactModeSuccess] = React.useState(false);

  const handleSelectContactMode = async (mode: DonorContactMode) => {
    if (!user || !donorProfile) return;
    if (donorProfile.contactMode === mode) return;
    try {
      await updateContactModeMutation.mutateAsync({
        uid: user.uid,
        mode,
      });
      setContactModeSuccess(true);
      setTimeout(() => setContactModeSuccess(false), 3000);
    } catch {
      // Error handled by mutation
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push(prefix || "/");
  };

  if (status === "loading" || (isUserLoading && !userProfile)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          {locale === "en" ? "Loading profile..." : "প্রোফাইল লোড হচ্ছে..."}
        </p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Location display labels for donor profile
  const divObj = donorProfile?.divisionId ? getDivisionById(donorProfile.divisionId) : null;
  const distObj = donorProfile?.districtId ? getDistrictById(donorProfile.districtId) : null;
  const upaObj = donorProfile?.upazilaId ? getUpazilaById(donorProfile.upazilaId) : null;

  const locationText = [
    upaObj ? (locale === "en" ? upaObj.nameEn : upaObj.nameBn) : "",
    distObj ? (locale === "en" ? distObj.nameEn : distObj.nameBn) : "",
    divObj ? (locale === "en" ? divObj.nameEn : divObj.nameBn) : "",
  ]
    .filter(Boolean)
    .join(", ");

  const isAvailable = donorProfile?.availabilityStatus === "available";

  return (
    <div className="space-y-8">
      {/* Account Notification Bar */}
      {accountUpdateSuccess && (
        <div className="flex items-center gap-2 p-3 text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-lg animate-in fade-in">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{locale === "en" ? "Account information updated successfully." : "অ্যাকাউন্টের তথ্য সফলভাবে আপডেট করা হয়েছে।"}</span>
        </div>
      )}

      {/* Account Suspended Warning Banner */}
      {(userProfile?.isSuspended || user.isSuspended) && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-xs sm:text-sm">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="size-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <strong className="text-destructive block font-semibold">
                {locale === "en" ? "Account Suspended by Moderation" : "মডারেশন দ্বারা আপনার অ্যাকাউন্ট স্থগিত করা হয়েছে"}
              </strong>
              <span className="text-muted-foreground leading-relaxed">
                {userProfile?.suspendedReason
                  ? (locale === "en" ? `Reason: ${userProfile.suspendedReason}` : `কারণ: ${userProfile.suspendedReason}`)
                  : (locale === "en"
                      ? "Your account has been temporarily restricted due to policy violations."
                      : "নিয়ম লঙ্ঘনের কারণে আপনার অ্যাকাউন্ট সাময়িকভাবে স্থগিত করা হয়েছে।")}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Donor Profile Suspended Warning Banner */}
      {donorProfile?.isSuspended && !(userProfile?.isSuspended || user.isSuspended) && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-xs sm:text-sm">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="size-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <strong className="text-destructive block font-semibold">
                {locale === "en" ? "Donor Profile Suspended" : "আপনার রক্তদাতা প্রোফাইল স্থগিত করা হয়েছে"}
              </strong>
              <span className="text-muted-foreground leading-relaxed">
                {donorProfile.suspendedReason
                  ? (locale === "en" ? `Reason: ${donorProfile.suspendedReason}` : `কারণ: ${donorProfile.suspendedReason}`)
                  : (locale === "en"
                      ? "Your donor listing is hidden from public search pending administrative review."
                      : "প্রশাসনিক পর্যালোচনার অপেক্ষায় আপনার রক্তদাতা প্রোফাইল পাবলিক সার্চ থেকে লুকানো রয়েছে।")}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Unverified Email Warning */}
      {!user.emailVerified && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/10 text-xs sm:text-sm">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="size-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-foreground block font-semibold">
                {locale === "en" ? "Email Address Not Verified" : "ইমেইল ঠিকানা যাচাই করা হয়নি"}
              </strong>
              <span className="text-muted-foreground leading-relaxed">
                {locale === "en"
                  ? "Please verify your email address to ensure account security and reliability."
                  : "অ্যাকাউন্টের নিরাপত্তা এবং নির্ভরযোগ্যতা নিশ্চিত করতে অনুগ্রহ করে আপনার ইমেইল যাচাই করুন।"}
              </span>
            </div>
          </div>
          <Button asChild size="sm" variant="default" className="shrink-0">
            <Link href={verifyEmailHref}>
              {locale === "en" ? "Verify Email" : "ইমেইল যাচাই করুন"}
            </Link>
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Account Details Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border border-border bg-surface shadow-xs">
            <CardHeader className="pb-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="size-10 rounded-full bg-primary/10 text-primary font-bold text-base flex items-center justify-center">
                    {(userProfile?.displayName || user.displayName || "U").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-foreground">
                      {userProfile?.displayName || user.displayName || (locale === "en" ? "User Account" : "ব্যবহারকারী অ্যাকাউন্ট")}
                    </CardTitle>
                    <span className="text-xs text-muted-foreground block font-mono truncate max-w-[160px]">
                      {user.email}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-5 space-y-4 text-xs sm:text-sm">
              <div>
                <span className="text-muted-foreground block text-xs">
                  {locale === "en" ? "Email Status" : "ইমেইল স্ট্যাটাস"}
                </span>
                {user.emailVerified ? (
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-500/10 mt-1">
                    <ShieldCheck className="size-3 mr-1" />
                    {locale === "en" ? "Verified" : "যাচাইকৃত"}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-amber-500/30 text-amber-600 bg-amber-500/10 mt-1">
                    <AlertCircle className="size-3 mr-1" />
                    {locale === "en" ? "Unverified" : "যাচাইহীন"}
                  </Badge>
                )}
              </div>

              <div>
                <span className="text-muted-foreground block text-xs">
                  {locale === "en" ? "Account Phone" : "অ্যাকাউন্ট ফোন"}
                </span>
                <span className="text-foreground font-mono">
                  {userProfile?.phoneNumber || (locale === "en" ? "Not set" : "দেওয়া হয়নি")}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground block text-xs">
                  {locale === "en" ? "Member Since" : "নিবন্ধনের সময়"}
                </span>
                <span className="text-foreground">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString(locale === "en" ? "en-US" : "bn-BD") : "—"}
                </span>
              </div>

              <div className="pt-2 border-t border-border flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingAccount((prev) => !prev)}
                  className="w-full justify-center gap-1.5"
                >
                  <Edit3 className="size-3.5" />
                  <span>{isEditingAccount ? (locale === "en" ? "Cancel Edit" : "বাতিল") : (locale === "en" ? "Edit Account Info" : "অ্যাকাউন্ট তথ্য সম্পাদনা")}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full justify-center text-destructive hover:bg-destructive/10 gap-1.5"
                >
                  <LogOut className="size-3.5" />
                  <span>{locale === "en" ? "Sign Out" : "লগআউট"}</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Edit Form (if toggled) */}
          {isEditingAccount && (
            <Card className="border border-primary/20 bg-surface shadow-xs animate-in fade-in duration-200">
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-sm font-bold text-foreground">
                  {locale === "en" ? "Update Account Details" : "অ্যাকাউন্ট তথ্য পরিবর্তন"}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <form onSubmit={handleSubmit(onUpdateAccount)} className="space-y-4">
                  <FormField
                    id="acc-name"
                    label={locale === "en" ? "Full Name" : "পুরো নাম"}
                    required
                    error={errors.displayName?.message}
                  >
                    <Input id="acc-name" {...register("displayName")} />
                  </FormField>

                  <FormField
                    id="acc-phone"
                    label={locale === "en" ? "Phone Number" : "ফোন নম্বর"}
                    error={errors.phoneNumber?.message}
                  >
                    <Input id="acc-phone" type="tel" placeholder="017XXXXXXXX" {...register("phoneNumber")} />
                  </FormField>

                  <Button type="submit" size="sm" disabled={isAccountSubmitting} className="w-full">
                    {isAccountSubmitting ? (
                      <Loader2 className="size-3.5 animate-spin mr-1.5" />
                    ) : (
                      <CheckCircle2 className="size-3.5 mr-1.5" />
                    )}
                    <span>{locale === "en" ? "Save Changes" : "সংরক্ষণ করুন"}</span>
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Notification Preferences Card */}
          <Card className="border border-border bg-surface shadow-xs">
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Mail className="size-4 text-primary" />
                <CardTitle className="text-sm font-bold text-foreground">
                  {locale === "en" ? "Notification Preferences" : "বিজ্ঞপ্তি পছন্দসমূহ"}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-foreground block">
                    {locale === "en" ? "Email Notifications" : "ইমেইল বিজ্ঞপ্তি"}
                  </span>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {locale === "en"
                      ? "Receive email alerts for incoming private donor contact requests when you are offline."
                      : "জরুরি যোগাযোগের অনুরোধ আসলে অফলাইনে থাকা অবস্থায়ও আপনার ইমেইলে বার্তা পাঠানো হবে।"}
                  </p>
                </div>

                <Button
                  size="sm"
                  variant={userProfile?.emailNotificationsEnabled !== false ? "default" : "outline"}
                  disabled={updatePreferencesMutation.isPending}
                  onClick={() => {
                    if (!user?.uid) return;
                    updatePreferencesMutation.mutate({
                      userId: user.uid,
                      emailNotificationsEnabled: userProfile?.emailNotificationsEnabled === false,
                    });
                  }}
                  className="shrink-0 h-7 text-xs px-2.5"
                >
                  {updatePreferencesMutation.isPending ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : userProfile?.emailNotificationsEnabled !== false ? (
                    locale === "en" ? "Enabled" : "চালু"
                  ) : (
                    locale === "en" ? "Disabled" : "বন্ধ"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Donor Profile Management */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-border bg-surface shadow-xs">
            <CardHeader className="pb-4 border-b border-border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Heart className="size-5 text-primary" />
                  <CardTitle className="text-base sm:text-lg font-bold text-foreground">
                    {locale === "en" ? "Blood Donor Profile" : "রক্তদাতা প্রোফাইল"}
                  </CardTitle>
                </div>
                {donorProfile && (
                  <Badge
                    variant={isAvailable ? "default" : "secondary"}
                    className="self-start sm:self-auto text-xs py-1 px-2.5"
                  >
                    {isAvailable
                      ? (locale === "en" ? "Active Donor (Available)" : "সক্রিয় রক্তদাতা (রক্তদানে প্রস্তুত)")
                      : (locale === "en" ? "Inactive (Unavailable)" : "নিষ্ক্রিয় (এখন রক্ত দিতে অপারগ)")}
                  </Badge>
                )}
              </div>
              <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                {locale === "en"
                  ? "Manage your voluntary blood donation profile, contact visibility, and readiness status."
                  : "আপনার স্বেচ্ছাসেবী রক্তদাতা প্রোফাইল, যোগাযোগের তথ্য এবং রক্তদানের প্রাপ্যতা পরিচালনা করুন।"}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              {isDonorLoading ? (
                <div className="flex items-center justify-center py-10 gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin text-primary" />
                  <span>{locale === "en" ? "Loading donor profile..." : "রক্তদাতা প্রোফাইল লোড হচ্ছে..."}</span>
                </div>
              ) : donorProfile ? (
                <div className="space-y-6">
                  {/* Availability Quick Action Switcher */}
                  <div className="p-4 rounded-xl border border-border bg-muted/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <strong className="text-sm font-bold text-foreground block">
                        {locale === "en" ? "Donation Availability Status" : "রক্তদানের প্রাপ্যতা স্ট্যাটাস"}
                      </strong>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {isAvailable
                          ? (locale === "en"
                              ? "You are currently marked as available to donate blood when requests arise."
                              : "আপনি বর্তমানে রক্তদানে প্রস্তুত হিসেবে তালিকাভুক্ত আছেন।")
                          : (locale === "en"
                              ? "You are currently marked as unavailable. You will not receive urgent donor requests."
                              : "আপনি বর্তমানে রক্তদানে অপারগ আছেন।")}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant={isAvailable ? "outline" : "default"}
                      onClick={handleToggleAvailability}
                      disabled={
                        updateAvailabilityMutation.isPending ||
                        Boolean(donorProfile.isSuspended) ||
                        Boolean(userProfile?.isSuspended || user.isSuspended)
                      }
                      className="shrink-0 gap-1.5 shadow-xs"
                    >
                      {updateAvailabilityMutation.isPending ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Power className="size-3.5" />
                      )}
                      <span>
                        {isAvailable
                          ? (locale === "en" ? "Set to Unavailable" : "অপ্রস্তুত হিসেবে চিহ্নিত করুন")
                          : (locale === "en" ? "Set to Available" : "প্রস্তুত হিসেবে চিহ্নিত করুন")}
                      </span>
                    </Button>
                  </div>

                  {/* Donor Profile Summary Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                    <div className="p-3.5 rounded-lg border border-border bg-surface">
                      <span className="text-muted-foreground text-xs block mb-1">
                        {locale === "en" ? "Blood Group" : "রক্তের গ্রুপ"}
                      </span>
                      <strong className="text-primary font-bold text-lg">
                        {donorProfile.bloodGroup}
                      </strong>
                    </div>

                    <div className="p-3.5 rounded-lg border border-border bg-surface">
                      <span className="text-muted-foreground text-xs block mb-1">
                        {locale === "en" ? "Donor Name" : "রক্তদাতার নাম"}
                      </span>
                      <strong className="text-foreground text-sm">
                        {donorProfile.displayName}
                      </strong>
                    </div>

                    <div className="p-3.5 rounded-lg border border-border bg-surface">
                      <span className="text-muted-foreground text-xs block mb-1">
                        {locale === "en" ? "Donor Contact" : "যোগাযোগের নম্বর"}
                      </span>
                      <span className="font-mono text-foreground font-semibold">
                        {donorProfile.phoneNumber}
                      </span>
                      <span className="text-[11px] text-muted-foreground block mt-0.5">
                        {donorProfile.contactMode === "PUBLIC"
                          ? (locale === "en" ? "Public (Direct Calling)" : "পাবলিক (সরাসরি কল)")
                          : (locale === "en" ? "Private (Request Required)" : "প্রাইভেট (অনুরোধ সাপেক্ষে)")}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-lg border border-border bg-surface">
                      <span className="text-muted-foreground text-xs block mb-1">
                        {locale === "en" ? "Location / District" : "অবস্থান / জেলা"}
                      </span>
                      <span className="text-foreground">
                        {locationText || "—"}
                      </span>
                      {donorProfile.area && (
                        <span className="text-[11px] text-muted-foreground block mt-0.5">
                          {donorProfile.area}
                        </span>
                      )}
                    </div>

                    <div className="p-3.5 rounded-lg border border-border bg-surface sm:col-span-2">
                      <span className="text-muted-foreground text-xs block mb-1">
                        {locale === "en" ? "Last Blood Donation Date" : "সর্বশেষ রক্তদানের তারিখ"}
                      </span>
                      <span className="text-foreground font-medium">
                        {donorProfile.lastDonationDate || (locale === "en" ? "Never donated yet" : "এখনো রক্ত দেননি")}
                      </span>
                    </div>
                  </div>

                  {/* Donor Contact Privacy Mode Switcher */}
                  <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {donorProfile.contactMode === "PUBLIC" ? (
                          <Globe className="size-4 text-emerald-600" />
                        ) : (
                          <Lock className="size-4 text-primary" />
                        )}
                        <strong className="text-sm font-bold text-foreground">
                          {t.contactModeSettings.title}
                        </strong>
                      </div>
                      <Badge variant={donorProfile.contactMode === "PUBLIC" ? "default" : "secondary"}>
                        {donorProfile.contactMode === "PUBLIC" ? "PUBLIC" : "PRIVATE"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t.contactModeSettings.description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => handleSelectContactMode("PUBLIC")}
                        disabled={updateContactModeMutation.isPending}
                        className={`text-left p-3 rounded-lg border transition-all ${
                          donorProfile.contactMode === "PUBLIC"
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100 ring-1 ring-emerald-500"
                            : "border-border bg-surface hover:border-muted-foreground/30 text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2 font-semibold text-xs mb-1">
                          <PhoneCall className="size-3.5 text-emerald-600 shrink-0" />
                          <span>{t.contactModeSettings.publicMode}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          {t.contactModeSettings.publicDesc}
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectContactMode("PRIVATE")}
                        disabled={updateContactModeMutation.isPending}
                        className={`text-left p-3 rounded-lg border transition-all ${
                          (donorProfile.contactMode || "PRIVATE") === "PRIVATE"
                            ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary"
                            : "border-border bg-surface hover:border-muted-foreground/30 text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2 font-semibold text-xs mb-1">
                          <Lock className="size-3.5 text-primary shrink-0" />
                          <span>{t.contactModeSettings.privateMode}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          {t.contactModeSettings.privateDesc}
                        </p>
                      </button>
                    </div>

                    {donorProfile.contactMode === "PUBLIC" && (
                      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-900 dark:text-amber-200">
                        <AlertCircle className="size-3.5 shrink-0 mt-0.5 text-amber-600" />
                        <span>{t.contactModeSettings.publicPrivacyWarning}</span>
                      </div>
                    )}

                    {contactModeSuccess && (
                      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="size-3.5 shrink-0" />
                        <span>{t.contactModeSettings.switchSuccess}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
                    <Button asChild variant="default" size="sm" className="w-full sm:w-auto gap-1.5 shadow-xs">
                      <Link href={donorRegisterHref}>
                        <Edit3 className="size-3.5" />
                        <span>{locale === "en" ? "Edit Full Donor Profile" : "সম্পূর্ণ রক্তদাতা প্রোফাইল সম্পাদনা"}</span>
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                /* Empty State: Not yet registered as donor */
                <div className="text-center py-8 px-4 rounded-xl border border-dashed border-border bg-muted/10 space-y-4">
                  <div className="inline-flex items-center justify-center size-12 rounded-full bg-primary/10 text-primary">
                    <Droplet className="size-6 fill-current" />
                  </div>
                  <div className="space-y-1 max-w-md mx-auto">
                    <h3 className="text-base font-bold text-foreground">
                      {locale === "en" ? "You are not registered as a blood donor yet" : "আপনি এখনো রক্তদাতা হিসেবে নিবন্ধিত নন"}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {locale === "en"
                        ? "Registering as a blood donor is completely voluntary. If you wish to donate blood in emergencies, register your profile now."
                        : "রক্তদাতা হিসেবে নিবন্ধন করা সম্পূর্ণ ঐচ্ছিক। আপনি যদি জরুরি মুহূর্তে রক্তদানে আগ্রহী হন, তবে আপনার রক্তদাতা প্রোফাইল নিবন্ধন করুন।"}
                    </p>
                  </div>
                  <Button asChild size="default" variant="default" className="shadow-xs gap-2">
                    <Link href={donorRegisterHref}>
                      <Heart className="size-4 fill-current" />
                      <span>{locale === "en" ? "Register as Blood Donor" : "রক্তদাতা হিসেবে নিবন্ধন করুন"}</span>
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Blood Requests Management Card */}
          <Card className="border border-border bg-surface shadow-xs">
            <CardHeader className="pb-4 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <ClipboardList className="size-5 text-primary" aria-hidden="true" />
                <div>
                  <CardTitle className="text-base sm:text-lg font-bold text-foreground">
                    {locale === "en" ? "My Blood Requests" : "আমার রক্তের অনুরোধ"}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    {locale === "en"
                      ? "Manage urgent blood requisition broadcasts"
                      : "আপনার জরুরি রক্তের চাহিদা ও অনুরোধসমূহ পরিচালনা করুন"}
                  </CardDescription>
                </div>
              </div>
              <Button asChild size="sm" variant="outline" className="gap-1.5 self-start sm:self-auto">
                <Link href={myRequestsHref}>
                  <span>{locale === "en" ? "View All" : "সব দেখুন"}</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-muted/10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-medium">
                      {locale === "en" ? "Active Broadcasts:" : "সক্রিয় অনুরোধ:"}
                    </span>
                    <Badge variant="default" className="text-xs font-bold">
                      {myRequests.filter((r) => r.status === "open").length}
                    </Badge>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground font-medium">
                      {locale === "en" ? "Total Submitted:" : "মোট অনুরোধ:"}
                    </span>
                    <span className="text-xs font-semibold text-foreground">
                      {myRequests.length}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {locale === "en"
                      ? "You can update request details, mark requests as fulfilled, or cancel requests anytime."
                      : "যেকোনো সময় অনুরোধের বিবরণ পরিবর্তন, সম্পন্ন অথবা বাতিল করতে পারবেন।"}
                  </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  <Button asChild size="sm" className="w-full sm:w-auto gap-1.5 shadow-xs">
                    <Link href={createRequestHref}>
                      <PlusCircle className="size-3.5" />
                      <span>{locale === "en" ? "Create Request" : "নতুন অনুরোধ"}</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Direct Contact Requests Summary Card */}
          <Card className="border border-border bg-surface shadow-xs">
            <CardHeader className="pb-4 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <MessageSquare className="size-5 text-primary" aria-hidden="true" />
                <div>
                  <CardTitle className="text-base sm:text-lg font-bold text-foreground">
                    {t.contactModeSettings.contactRequestsSummary}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    {t.contactModeSettings.contactRequestsDesc}
                  </CardDescription>
                </div>
              </div>
              <Button asChild size="sm" variant="outline" className="gap-1.5 self-start sm:self-auto">
                <Link href={contactRequestsHref}>
                  <span>{t.contactModeSettings.manageRequestsAction}</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-5 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Incoming Requests Box */}
                <div className="p-4 rounded-xl border border-border bg-muted/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium">
                      {locale === "en" ? "Incoming (For Donor)" : "ইনকামিং (রক্তদাতা হিসেবে)"}
                    </span>
                    <Badge
                      variant={incomingContactRequests.some((r) => r.status === "PENDING") ? "default" : "secondary"}
                      className="text-xs font-bold"
                    >
                      {incomingContactRequests.filter((r) => r.status === "PENDING").length} {locale === "en" ? "Pending" : "অপেক্ষমান"}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {locale === "en"
                      ? `${incomingContactRequests.length} total direct requests received from patients.`
                      : `রোগীদের থেকে মোট ${incomingContactRequests.length} টি অনুরোধ এসেছে।`}
                  </p>
                </div>

                {/* Outgoing Requests Box */}
                <div className="p-4 rounded-xl border border-border bg-muted/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium">
                      {locale === "en" ? "Outgoing (For Patient)" : "আউটগোয়িং (গ্রহীতা হিসেবে)"}
                    </span>
                    <Badge variant="outline" className="text-xs font-bold">
                      {outgoingContactRequests.filter((r) => r.status === "ACCEPTED").length} {locale === "en" ? "Accepted" : "গৃহীত"}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {locale === "en"
                      ? `${outgoingContactRequests.length} total requests sent to private donors.`
                      : `ব্যক্তিগত রক্তদাতাদের কাছে মোট ${outgoingContactRequests.length} টি অনুরোধ পাঠানো হয়েছে।`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* In-App Notifications Summary Card */}
          <Card className="border border-border bg-surface shadow-xs">
            <CardHeader className="pb-4 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Bell className="size-5 text-primary" aria-hidden="true" />
                <div>
                  <CardTitle className="text-base sm:text-lg font-bold text-foreground">
                    {locale === "en" ? "Notification Center" : "বিজ্ঞপ্তি কেন্দ্র"}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    {locale === "en"
                      ? "Recent updates on your blood requests and direct donor contact"
                      : "আপনার রক্তের অনুরোধ এবং সরাসরি যোগাযোগের সর্বশেষ আপডেট"}
                  </CardDescription>
                </div>
              </div>
              <Button asChild size="sm" variant="outline" className="gap-1.5 self-start sm:self-auto">
                <Link href={notificationsHref}>
                  <span>{locale === "en" ? "View All" : "সব দেখুন"}</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-muted/10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-medium">
                      {locale === "en" ? "Unread Notifications:" : "অপঠিত বিজ্ঞপ্তি:"}
                    </span>
                    <Badge variant={unreadCount > 0 ? "default" : "secondary"} className="text-xs font-bold">
                      {unreadCount} {locale === "en" ? "unread" : "না পড়া"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {locale === "en"
                      ? "Notifications alert you when donors respond or new private contact requests arrive."
                      : "রক্তদাতা সাড়া দিলে কিংবা নতুন অনুরোধ আসলে বিজ্ঞপ্তি কেন্দ্রে সঙ্গে সঙ্গে দেখতে পাবেন।"}
                  </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  <Button asChild size="sm" className="w-full sm:w-auto gap-1.5 shadow-xs">
                    <Link href={notificationsHref}>
                      <Bell className="size-3.5" />
                      <span>{locale === "en" ? "Open Notifications" : "বিজ্ঞপ্তি খুলুন"}</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
