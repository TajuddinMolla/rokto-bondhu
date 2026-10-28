"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/validations/zod-resolver";
import { AlertTriangle, CheckCircle2, Loader2, Flag } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { useSubmitReport } from "@/hooks/mutations/use-report-mutations";
import {
  createReportSchema,
  type CreateReportFormData,
  REPORT_REASONS,
} from "@/lib/validations/admin";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/forms/form-field";
import type { ReportTargetType, ReportReason } from "@/types/admin";
import type { Locale } from "@/i18n/config";

interface ReportModalProps {
  isOpen: boolean;
  targetType: ReportTargetType;
  targetId: string;
  targetTitle?: string;
  locale: Locale;
  onClose: () => void;
}

export function ReportModal({
  isOpen,
  targetType,
  targetId,
  targetTitle,
  locale,
  onClose,
}: ReportModalProps) {
  const { user, status } = useAuth();
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [prevIsOpen, setPrevIsOpen] = React.useState(isOpen);

  // Synchronize state during render when modal opens (React 19 recommended pattern)
  if (prevIsOpen !== isOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setIsSuccess(false);
      setErrorMessage(null);
    }
  }

  const submitReportMutation = useSubmitReport();

  const reportSchema = React.useMemo(
    () => createReportSchema(locale),
    [locale],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      targetType,
      targetId,
      targetTitle: targetTitle || "",
      reason: "INAPPROPRIATE_CONTENT",
      description: "",
    },
  });

  const handleClose = React.useCallback(() => {
    setIsSuccess(false);
    setErrorMessage(null);
    reset();
    onClose();
  }, [reset, onClose]);

  if (!isOpen) return null;

  const isAuthenticated = status === "authenticated" && Boolean(user);

  const getReasonLabel = (reason: ReportReason) => {
    switch (reason) {
      case "INAPPROPRIATE_CONTENT":
        return locale === "en"
          ? "Inappropriate Content"
          : "অনুচিত বা আপত্তিকর তথ্য";
      case "SPAM":
        return locale === "en"
          ? "Spam or Unsolicited Promotion"
          : "স্প্যাম বা অপ্রাসঙ্গিক বিজ্ঞাপন";
      case "FAKE_INFORMATION":
        return locale === "en"
          ? "Fake or Misleading Details"
          : "ভুয়া বা বিভ্রান্তিকর তথ্য";
      case "HARASSMENT":
        return locale === "en"
          ? "Harassment or Abusive Behavior"
          : "হয়রানি বা অপব্যবহারমূলক আচরণ";
      case "OTHER":
        return locale === "en" ? "Other Violation" : "অন্যান্য সমস্যা";
    }
  };

  const onSubmit = async (data: CreateReportFormData) => {
    setErrorMessage(null);
    try {
      await submitReportMutation.mutateAsync({
        targetType,
        targetId,
        targetTitle,
        reason: data.reason as ReportReason,
        description: data.description || undefined,
      });
      setIsSuccess(true);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to submit report";
      if (msg.includes("pending report")) {
        setErrorMessage(
          locale === "en"
            ? "You have already submitted a pending report for this item."
            : "আপনি ইতিপূর্বে এই বিষয়ে একটি অভিযোগ দাখিল করেছেন যা বর্তমানে পর্যালোচনার অপেক্ষায় রয়েছে।",
        );
      } else {
        setErrorMessage(
          locale === "en"
            ? "Could not submit report. Please try again."
            : "অভিযোগ জমা দেওয়া যায়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।",
        );
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-lg">
        <Card className="border-border shadow-xl">
          {/* Header */}
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2.5 text-foreground">
              <div className="flex size-9 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <Flag className="size-5" />
              </div>
              <CardTitle className="text-lg sm:text-xl font-bold">
                {locale === "en"
                  ? "Report Safety Concern"
                  : "নিরাপত্তা সংক্রান্ত অভিযোগ"}
              </CardTitle>
            </div>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {locale === "en"
                ? "Help us keep RoktoBondhu safe and accurate. Reports are confidential and reviewed by authorized moderators."
                : "রক্তবন্ধুকে নিরাপদ ও নির্ভরযোগ্য রাখতে সহায়তা করুন। আপনার অভিযোগটি গোপন রাখা হবে এবং মডারেটর দ্বারা যাচাই করা হবে।"}
            </CardDescription>

            {targetTitle && (
              <div className="p-2.5 rounded-md bg-muted/60 text-xs text-foreground">
                <span className="text-muted-foreground">
                  {locale === "en" ? "Target: " : "বিষয়: "}
                </span>
                <span className="font-semibold">{targetTitle}</span>
              </div>
            )}
          </CardHeader>

          {/* Success State */}
          {isSuccess ? (
            <CardContent className="space-y-4 py-6 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="size-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">
                  {locale === "en"
                    ? "Report Submitted"
                    : "অভিযোগ সফলভাবে জমা হয়েছে"}
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  {locale === "en"
                    ? "Thank you for helping protect our community. A moderator will review this item shortly."
                    : "আমাদের কমিউনিটি সুরক্ষিত রাখতে সহায়তার জন্য ধন্যবাদ। মডারেটর দল দ্রুত এটি পর্যালোচনা করবে।"}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleClose}
                className="mt-2"
              >
                {locale === "en" ? "Close" : "বন্ধ করুন"}
              </Button>
            </CardContent>
          ) : !isAuthenticated ? (
            /* Unauthenticated Prompt */
            <CardContent className="space-y-4 py-4 text-center">
              <p className="text-xs text-muted-foreground">
                {locale === "en"
                  ? "You must be signed in to submit a safety report."
                  : "অভিযোগ জমা দেওয়ার জন্য আপনাকে লগইন করতে হবে।"}
              </p>
              <div className="flex justify-center gap-3">
                <Button asChild size="sm" variant="default">
                  <Link href={locale === "en" ? "/en/login" : "/login"}>
                    {locale === "en" ? "Sign In" : "লগইন করুন"}
                  </Link>
                </Button>
                <Button size="sm" variant="outline" onClick={handleClose}>
                  {locale === "en" ? "Cancel" : "বাতিল"}
                </Button>
              </div>
            </CardContent>
          ) : (
            /* Report Form */
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-4 pt-1">
                {errorMessage && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-2">
                    <AlertTriangle className="size-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <FormField
                  id="report-reason"
                  label={
                    locale === "en" ? "Reason for Report" : "অভিযোগের কারণ"
                  }
                  error={errors.reason?.message}
                  required
                >
                  <Select
                    id="report-reason"
                    {...register("reason")}
                    className="text-xs"
                  >
                    {REPORT_REASONS.map((reason) => (
                      <option key={reason} value={reason}>
                        {getReasonLabel(reason)}
                      </option>
                    ))}
                  </Select>
                </FormField>

                <FormField
                  id="report-description"
                  label={
                    locale === "en"
                      ? "Additional Details (Optional)"
                      : "অতিরিক্ত বিবরণ (ঐচ্ছিক)"
                  }
                  error={errors.description?.message}
                  helperText={
                    locale === "en"
                      ? "Describe why this profile or request is misleading, fraudulent, or harmful."
                      : "কেন এই তথ্যটি বিভ্রান্তিকর, ভুয়া বা ক্ষতিকর তা বিস্তারিত জানাতে পারেন।"
                  }
                >
                  <Textarea
                    id="report-description"
                    placeholder={
                      locale === "en"
                        ? "Provide any relevant context for the moderator..."
                        : "মডারেটরের বিবেচনার জন্য প্রাসঙ্গিক তথ্য লিখুন..."
                    }
                    rows={3}
                    className="resize-none"
                    {...register("description")}
                  />
                </FormField>
              </CardContent>

              <CardFooter className="flex justify-end gap-2.5 border-t border-border pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClose}
                  disabled={submitReportMutation.isPending}
                >
                  {locale === "en" ? "Cancel" : "বাতিল"}
                </Button>

                <Button
                  type="submit"
                  variant="destructive"
                  size="sm"
                  disabled={submitReportMutation.isPending}
                >
                  {submitReportMutation.isPending && (
                    <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                  )}
                  {locale === "en" ? "Submit Report" : "অভিযোগ জমা দিন"}
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
