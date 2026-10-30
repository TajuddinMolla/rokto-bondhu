"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/validations/zod-resolver";
import {
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  LogIn,
  ExternalLink,
  RotateCcw,
} from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { useUserProfile } from "@/hooks/queries/use-user-profile";
import { useActiveContactRequest } from "@/hooks/queries/use-contact-requests";
import {
  useCreateContactRequest,
  useCancelContactRequest,
} from "@/hooks/mutations/use-contact-request-mutations";
import {
  createContactRequestSchema,
  type ContactRequestFormData,
} from "@/lib/validations/contact-request";
import { formatLocation } from "@/constants/locations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
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
  const cancelMutation = useCancelContactRequest();
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isCancellingActive, setIsCancellingActive] = React.useState(false);

  const prefix = locale === "en" ? "/en" : "";
  const loginHref = `${prefix}/login?redirect=${encodeURIComponent(
    typeof window !== "undefined" ? window.location.pathname : "/donors"
  )}`;
  const outgoingRequestsHref = `${prefix}/account/contact-requests`;

  const isSelf = user?.uid === donor.id;
  const hasActiveRequest = Boolean(activeCheck?.hasActive);

  const handleCancelActiveRequest = async () => {
    if (!user?.uid || !activeCheck?.existingRequestId) return;
    setIsCancellingActive(true);
    try {
      await cancelMutation.mutateAsync({
        requestId: activeCheck.existingRequestId,
        requesterId: user.uid,
      });
    } catch (err) {
      console.warn("Failed to cancel active request:", err);
    } finally {
      setIsCancellingActive(false);
    }
  };

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
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t.contactRequests.modalTitle}</DialogTitle>
          <DialogDescription>{t.contactRequests.modalDesc}</DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-5">
          {/* Recipient Donor Header Chip */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl border border-primary/20 bg-primary/5 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-sm select-none shadow-xs">
                {donor.bloodGroup}
              </div>
              <div>
                <strong className="text-foreground block font-bold text-sm">
                  {donor.displayName}
                </strong>
                <span className="text-muted-foreground">{donorLocation}</span>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
              {donor.bloodGroup} Donor
            </Badge>
          </div>

          {/* 1. Success State (Checked FIRST so post-submit invalidation never flips to duplicate warning) */}
          {isSuccess ? (
            <div className="py-6 px-4 text-center space-y-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
              <div className="inline-flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 mx-auto">
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
                <Button asChild size="default" className="min-h-[44px] rounded-xl px-6 w-full sm:w-auto gap-1.5">
                  <Link href={outgoingRequestsHref}>
                    <span>{t.contactRequests.trackAction}</span>
                    <ExternalLink className="size-3.5" />
                  </Link>
                </Button>
                <Button size="default" variant="outline" onClick={onClose} className="min-h-[44px] rounded-xl px-6 w-full sm:w-auto">
                  {locale === "en" ? "Done" : "ঠিক আছে"}
                </Button>
              </div>
            </div>
          ) : status === "unauthenticated" ? (
            /* Unauthenticated Guard */
            <div className="py-6 px-4 text-center space-y-4 rounded-2xl border border-dashed border-border bg-muted/10">
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
              <Button asChild size="default" className="shadow-xs gap-2 min-h-[44px] rounded-xl px-6">
                <Link href={loginHref}>
                  <LogIn className="size-4" />
                  <span>{locale === "en" ? "Sign In to Proceed" : "লগইন করুন"}</span>
                </Link>
              </Button>
            </div>
          ) : isCheckingActive ? (
            /* Active Check Loading */
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="size-6 animate-spin text-primary" />
              <span className="text-xs">
                {locale === "en" ? "Checking request status..." : "অনুরোধের অবস্থা যাচাই করা হচ্ছে..."}
              </span>
            </div>
          ) : isSelf ? (
            /* Self-Request Prevention Guard */
            <div className="py-6 px-4 text-center space-y-3 rounded-2xl border border-destructive/20 bg-destructive/5 text-destructive text-xs sm:text-sm">
              <AlertCircle className="size-8 mx-auto text-destructive" />
              <div className="space-y-1">
                <strong className="block font-semibold">
                  {t.donorsPage.results.selfRequestWarning}
                </strong>
                <p className="text-muted-foreground text-xs">
                  {locale === "en"
                    ? "You cannot send a blood contact request to your own profile."
                    : "আপনি নিজের প্রোফাইলে রক্তের জন্য অনুরোধ পাঠাতে পারবেন না।"}
                </p>
              </div>
            </div>
          ) : hasActiveRequest ? (
            /* Active Duplicate Request Guard */
            <div className="py-6 px-4 text-center space-y-4 rounded-2xl border border-amber-500/25 bg-amber-500/5 text-xs sm:text-sm">
              <Clock className="size-8 mx-auto text-amber-600 dark:text-amber-400" />
              <div className="space-y-1 max-w-sm mx-auto">
                <strong className="block font-bold text-foreground">
                  {t.donorsPage.results.duplicateRequestWarning}
                </strong>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {locale === "en"
                    ? "You already have a pending or accepted request with this donor. Please check your request status or cancel to submit a fresh request."
                    : "এই রক্তদাতার কাছে আপনার একটি সক্রিয় অনুরোধ ইতিমধ্যেই রয়েছে। অনুরোধের অবস্থা দেখুন অথবা নতুন অনুরোধ পাঠাতে পূর্বেরটি বাতিল করুন।"}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
                <Button asChild size="sm" variant="default" className="min-h-[44px] rounded-xl px-4 gap-1.5 w-full sm:w-auto shadow-xs">
                  <Link href={outgoingRequestsHref}>
                    <span>{t.donorsPage.results.viewOutgoingRequests}</span>
                    <ExternalLink className="size-3.5" />
                  </Link>
                </Button>
                {activeCheck?.existingRequestId && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelActiveRequest}
                    disabled={isCancellingActive}
                    className="min-h-[44px] rounded-xl px-4 gap-1.5 w-full sm:w-auto border-border/80 cursor-pointer"
                  >
                    {isCancellingActive ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <RotateCcw className="size-3.5" />
                    )}
                    <span>{locale === "en" ? "Cancel & Send New" : "বাতিল করে নতুন পাঠান"}</span>
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={onClose} className="min-h-[44px] rounded-xl px-4 w-full sm:w-auto">
                  {locale === "en" ? "Close" : "বন্ধ করুন"}
                </Button>
              </div>
            </div>
          ) : (
            /* Contact Form */
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Requester Details */}
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

              {/* Patient & Hospital (Optional Context) */}
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

              <DialogFooter className="pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  onClick={onClose}
                  disabled={isSubmitting || createMutation.isPending}
                  className="min-h-[44px] px-5 font-semibold text-xs sm:text-sm border-border hover:bg-muted rounded-xl"
                >
                  {locale === "en" ? "Cancel" : "বাতিল"}
                </Button>
                <Button
                  type="submit"
                  size="default"
                  disabled={isSubmitting || createMutation.isPending || isCheckingActive}
                  className="min-h-[44px] px-6 font-bold text-xs sm:text-sm gap-2 shadow-xs bg-primary hover:bg-primary-hover text-white rounded-xl"
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
              </DialogFooter>
            </form>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
