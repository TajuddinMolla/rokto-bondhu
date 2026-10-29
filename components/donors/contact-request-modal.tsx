"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/validations/zod-resolver";
import {
  X,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  LogIn,
  ExternalLink,
} from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { useUserProfile } from "@/hooks/queries/use-user-profile";
import { useActiveContactRequest } from "@/hooks/queries/use-contact-requests";
import { useCreateContactRequest } from "@/hooks/mutations/use-contact-request-mutations";
import {
  createContactRequestSchema,
  type ContactRequestFormData,
} from "@/lib/validations/contact-request";
import { formatLocation } from "@/constants/locations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FormField } from "@/components/forms/form-field";
import { getTranslations } from "@/i18n/translations";
import type { Locale } from "@/i18n/config";
import type { PublicDonorProfile, DonorPublicSummary } from "@/types/donor";
import type { RequestUrgency } from "@/types/blood";

interface ContactRequestModalProps {
  donor: PublicDonorProfile | DonorPublicSummary;
  locale: Locale;
  onClose: () => void;
}

export function ContactRequestModal({
  donor,
  locale,
  onClose,
}: ContactRequestModalProps) {
  const t = getTranslations(locale);
  const { user, status } = useAuth();
  const { data: userProfile } = useUserProfile(user?.uid);
  const { data: activeCheck, isLoading: isCheckingActive } =
    useActiveContactRequest(user?.uid, donor.id);

  const createMutation = useCreateContactRequest();
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const prefix = locale === "en" ? "/en" : "";
  const loginHref = `${prefix}/login?redirect=${encodeURIComponent(
    typeof window !== "undefined" ? window.location.pathname : "/donors"
  )}`;
  const outgoingRequestsHref = `${prefix}/account/contact-requests`;

  const isSelf = user?.uid === donor.id;
  const hasActiveRequest = Boolean(activeCheck?.hasActive);

  const schema = React.useMemo(
    () => createContactRequestSchema(locale),
    [locale]
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ContactRequestFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any),
    defaultValues: {
      requesterName: user?.displayName || userProfile?.displayName || "",
      requesterPhone: userProfile?.phoneNumber || "",
      patientName: "",
      hospitalName: "",
      urgency: "urgent" as RequestUrgency,
      message: "",
      consent: true,
    },
    mode: "onTouched",
  });

  // Autofill requester details when userProfile loads
  React.useEffect(() => {
    if (userProfile) {
      if (userProfile.displayName) {
        setValue("requesterName", userProfile.displayName);
      }
      if (userProfile.phoneNumber) {
        setValue("requesterPhone", userProfile.phoneNumber);
      }
    }
  }, [userProfile, setValue]);

  const onSubmit = async (data: ContactRequestFormData) => {
    if (!user?.uid) return;
    setErrorMessage(null);

    try {
      await createMutation.mutateAsync({
        requesterId: user.uid,
        input: {
          donorId: donor.id,
          donorName: donor.displayName,
          donorBloodGroup: donor.bloodGroup,
          requesterName: data.requesterName,
          requesterPhone: data.requesterPhone,
          patientName: data.patientName || undefined,
          hospitalName: data.hospitalName || undefined,
          urgency: data.urgency,
          message: data.message || undefined,
          consent: true,
        },
      });
      setIsSuccess(true);
    } catch (err: unknown) {
      const msg =
        (err as { message?: string })?.message ||
        "Failed to submit contact request";
      setErrorMessage(msg);
    }
  };

  const donorLocation = formatLocation(
    {
      divisionId: donor.divisionId,
      districtId: donor.districtId,
      upazilaId: donor.upazilaId,
    },
    locale
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <Card className="w-full max-w-lg border border-border/80 bg-surface shadow-2xl my-8 overflow-hidden rounded-2xl">
        <CardHeader className="border-b border-border/80 pb-4 flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-black text-foreground">
              {t.contactRequests.modalTitle}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              {t.contactRequests.modalDesc}
            </CardDescription>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground size-11 flex items-center justify-center rounded-xl hover:bg-muted transition-colors cursor-pointer shrink-0"
            aria-label="Close dialog"
          >
            <X className="size-5" />
          </button>
        </CardHeader>

        <CardContent className="pt-5 space-y-5">
          {/* Recipient Donor Header Chip */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-primary/20 bg-primary/5 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-sm select-none">
                {donor.bloodGroup}
              </div>
              <div>
                <strong className="text-foreground block font-semibold text-sm">
                  {donor.displayName}
                </strong>
                <span className="text-muted-foreground">{donorLocation}</span>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
              {donor.bloodGroup} Donor
            </Badge>
          </div>

          {/* Unauthenticated Guard */}
          {status === "unauthenticated" ? (
            <div className="py-6 px-4 text-center space-y-4 rounded-xl border border-dashed border-border bg-muted/10">
              <div className="inline-flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto">
                <LogIn className="size-6" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h4 className="font-bold text-sm text-foreground">
                  {locale === "en" ? "Sign In Required" : "লগইন করা আবশ্যক"}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {locale === "en"
                    ? "To protect voluntary donors from spam, you must be logged in to send a secure contact request."
                    : "স্বেচ্ছাসেবী রক্তদাতাদের নিরাপত্তা রক্ষায় সরাসরি যোগাযোগের অনুরোধ পাঠাতে লগইন করা আবশ্যক।"}
                </p>
              </div>
              <Button asChild size="default" className="shadow-xs gap-2">
                <Link href={loginHref}>
                  <LogIn className="size-4" />
                  <span>{locale === "en" ? "Sign In to Proceed" : "লগইন করুন"}</span>
                </Link>
              </Button>
            </div>
          ) : isSelf ? (
            /* Self-Request Prevention Guard */
            <div className="py-6 px-4 text-center space-y-3 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive text-xs sm:text-sm">
              <AlertCircle className="size-8 mx-auto text-destructive" />
              <div className="space-y-1">
                <strong className="block font-semibold">
                  {t.donorsPage.results.selfRequestWarning}
                </strong>
                <p className="text-muted-foreground text-xs">
                  {locale === "en"
                    ? "You are logged in as this donor. You cannot send contact requests to your own profile."
                    : "আপনি এই রক্তদাতার অ্যাকাউন্টে লগইন আছেন। আপনি নিজের কাছে অনুরোধ পাঠাতে পারবেন না।"}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={onClose} className="mt-2 text-xs">
                {locale === "en" ? "Close" : "বন্ধ করুন"}
              </Button>
            </div>
          ) : hasActiveRequest ? (
            /* Duplicate Active Request Guard */
            <div className="py-6 px-4 text-center space-y-3 rounded-xl border border-amber-500/20 bg-amber-500/10 text-foreground text-xs sm:text-sm">
              <Clock className="size-8 mx-auto text-amber-600 dark:text-amber-400" />
              <div className="space-y-1">
                <strong className="block font-semibold text-foreground">
                  {t.donorsPage.results.duplicateRequestWarning}
                </strong>
                <p className="text-muted-foreground text-xs">
                  {locale === "en"
                    ? "You already have a pending or accepted request with this donor. Please check your request status."
                    : "এই রক্তদাতার কাছে আপনার একটি সক্রিয় অনুরোধ ইতিমধ্যেই রয়েছে। অনুগ্রহ করে অনুরোধের অবস্থা দেখুন।"}
                </p>
              </div>
              <Button asChild variant="default" size="sm" className="mt-2 gap-1.5 shadow-xs">
                <Link href={outgoingRequestsHref}>
                  <span>{t.donorsPage.results.viewOutgoingRequests}</span>
                  <ExternalLink className="size-3.5" />
                </Link>
              </Button>
            </div>
          ) : isSuccess ? (
            /* Success State */
            <div className="py-6 px-4 text-center space-y-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
              <div className="inline-flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="size-6" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h4 className="font-bold text-base text-foreground">
                  {t.contactRequests.successTitle}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t.contactRequests.successDesc}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                <Button asChild size="sm" className="w-full sm:w-auto shadow-xs gap-1.5">
                  <Link href={outgoingRequestsHref}>
                    <span>{t.contactRequests.trackAction}</span>
                    <ExternalLink className="size-3.5" />
                  </Link>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="w-full sm:w-auto text-xs"
                >
                  {locale === "en" ? "Done" : "ঠিক আছে"}
                </Button>
              </div>
            </div>
          ) : (
            /* Request Submission Form */
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive text-xs flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField
                  id="req-name"
                  label={t.contactRequests.requesterName}
                  required
                  error={errors.requesterName?.message}
                >
                  <Input
                    id="req-name"
                    {...register("requesterName")}
                    placeholder="e.g. Tanvir Hasan"
                  />
                </FormField>

                <FormField
                  id="req-phone"
                  label={t.contactRequests.requesterPhone}
                  required
                  error={errors.requesterPhone?.message}
                >
                  <Input
                    id="req-phone"
                    type="tel"
                    {...register("requesterPhone")}
                    placeholder="017XXXXXXXX"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField
                  id="req-patient"
                  label={t.contactRequests.patientName}
                  error={errors.patientName?.message}
                >
                  <Input
                    id="req-patient"
                    {...register("patientName")}
                    placeholder="Patient Name"
                  />
                </FormField>

                <FormField
                  id="req-urgency"
                  label={t.contactRequests.urgency}
                  required
                  error={errors.urgency?.message}
                >
                  <Select id="req-urgency" {...register("urgency")}>
                    <option value="normal">
                      {t.domain.requestUrgency.normal}
                    </option>
                    <option value="urgent">
                      {t.domain.requestUrgency.urgent}
                    </option>
                    <option value="critical">
                      {t.domain.requestUrgency.critical}
                    </option>
                  </Select>
                </FormField>
              </div>

              <FormField
                id="req-hospital"
                label={t.contactRequests.hospitalName}
                error={errors.hospitalName?.message}
              >
                <Input
                  id="req-hospital"
                  {...register("hospitalName")}
                  placeholder="e.g. Dhaka Medical College Hospital"
                />
              </FormField>

              <FormField
                id="req-msg"
                label={t.contactRequests.message}
                error={errors.message?.message}
              >
                <Textarea
                  id="req-msg"
                  rows={2}
                  {...register("message")}
                  placeholder={
                    locale === "en"
                      ? "Brief explanation of blood requirement..."
                      : "রক্তের প্রয়োজনীয়তা সম্পর্কে সংক্ষেপে লিখুন..."
                  }
                />
              </FormField>

              {/* Consent Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 text-xs text-muted-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    {...register("consent")}
                    className="mt-0.5 size-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="leading-relaxed">
                    {t.contactRequests.consent}
                  </span>
                </label>
                {errors.consent?.message && (
                  <p className="text-destructive text-[11px] mt-1 font-medium">
                    {errors.consent.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/80">
                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  onClick={onClose}
                  disabled={isSubmitting || createMutation.isPending}
                  className="min-h-[44px] px-5 font-semibold text-xs sm:text-sm border-border hover:bg-muted"
                >
                  {locale === "en" ? "Cancel" : "বাতিল"}
                </Button>
                <Button
                  type="submit"
                  size="default"
                  disabled={isSubmitting || createMutation.isPending || isCheckingActive}
                  className="min-h-[44px] px-6 font-bold text-xs sm:text-sm gap-2 shadow-xs bg-primary hover:bg-primary-hover text-white"
                >
                  {isSubmitting || createMutation.isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>{t.contactRequests.submitting}</span>
                    </>
                  ) : (
                    <>
                      <Send className="size-4" />
                      <span>{t.contactRequests.submitBtn}</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
