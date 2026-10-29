"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { UserProfile } from "@/types/user";
import type { DonorProfile } from "@/types/donor";
import type { Locale } from "@/i18n/config";

interface AccountAlertsProps {
  userProfile?: UserProfile | null;
  donorProfile?: DonorProfile | null;
  emailVerified: boolean;
  updateSuccess: boolean;
  locale: Locale;
}

export function AccountAlerts({
  userProfile,
  donorProfile,
  emailVerified,
  updateSuccess,
  locale,
}: AccountAlertsProps) {
  const prefix = locale === "en" ? "/en" : "";
  const verifyEmailHref = `${prefix}/verify-email`;

  return (
    <div className="space-y-4">
      {/* Account Update Success Banner */}
      {updateSuccess && (
        <div
          role="status"
          className="flex items-center gap-2.5 p-3.5 text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl animate-in fade-in duration-200"
        >
          <CheckCircle2 className="size-4.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span className="font-medium">
            {locale === "en"
              ? "Account information updated successfully."
              : "অ্যাকাউন্টের তথ্য সফলভাবে আপডেট করা হয়েছে।"}
          </span>
        </div>
      )}

      {/* Account Suspended Warning Banner */}
      {userProfile?.isSuspended && (
        <div
          role="alert"
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl border border-destructive/30 bg-destructive/10 text-xs sm:text-sm"
        >
          <div className="flex items-start gap-3">
            <ShieldAlert className="size-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <strong className="text-destructive block font-bold">
                {locale === "en"
                  ? "Account Suspended by Moderation"
                  : "মডারেশন দ্বারা আপনার অ্যাকাউন্ট স্থগিত করা হয়েছে"}
              </strong>
              <span className="text-muted-foreground leading-relaxed mt-0.5 block">
                {userProfile.suspendedReason
                  ? locale === "en"
                    ? `Reason: ${userProfile.suspendedReason}`
                    : `কারণ: ${userProfile.suspendedReason}`
                  : locale === "en"
                  ? "Your account has been temporarily restricted due to platform policy review."
                  : "নীতিমালা পর্যালোচনার কারণে আপনার অ্যাকাউন্ট সাময়িকভাবে স্থগিত করা হয়েছে।"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Donor Profile Suspended Warning Banner */}
      {donorProfile?.isSuspended && !userProfile?.isSuspended && (
        <div
          role="alert"
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl border border-destructive/30 bg-destructive/10 text-xs sm:text-sm"
        >
          <div className="flex items-start gap-3">
            <ShieldAlert className="size-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <strong className="text-destructive block font-bold">
                {locale === "en"
                  ? "Donor Profile Suspended"
                  : "আপনার রক্তদাতা প্রোফাইল স্থগিত করা হয়েছে"}
              </strong>
              <span className="text-muted-foreground leading-relaxed mt-0.5 block">
                {donorProfile.suspendedReason
                  ? locale === "en"
                    ? `Reason: ${donorProfile.suspendedReason}`
                    : `কারণ: ${donorProfile.suspendedReason}`
                  : locale === "en"
                  ? "Your donor listing is currently hidden from search pending administrative review."
                  : "প্রশাসনিক পর্যালোচনার অপেক্ষায় আপনার রক্তদাতা প্রোফাইল অনুসন্ধান তালিকা থেকে লুকানো রয়েছে।"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Unverified Email Warning Banner */}
      {!emailVerified && (
        <div
          role="alert"
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 p-4 sm:p-5 rounded-2xl border border-amber-500/25 bg-amber-500/10 text-xs sm:text-sm shadow-2xs"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="size-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-foreground block font-bold">
                {locale === "en"
                  ? "Email Address Not Verified"
                  : "ইমেইল ঠিকানা যাচাই করা হয়নি"}
              </strong>
              <span className="text-muted-foreground leading-relaxed mt-0.5 block">
                {locale === "en"
                  ? "Please verify your email address to ensure account security, notifications, and emergency alerts."
                  : "অ্যাকাউন্টের নিরাপত্তা এবং জরুরি বিজ্ঞপ্তির বার্তা পেতে অনুগ্রহ করে আপনার ইমেইল যাচাই করুন।"}
              </span>
            </div>
          </div>
          <Button
            asChild
            size="sm"
            variant="default"
            className="shrink-0 min-h-[40px] rounded-xl px-4 font-bold shadow-2xs"
          >
            <Link href={verifyEmailHref}>
              {locale === "en" ? "Verify Email" : "ইমেইল যাচাই করুন"}
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

