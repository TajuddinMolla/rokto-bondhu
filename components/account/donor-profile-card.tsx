"use client";

import * as React from "react";
import Link from "next/link";
import {
  Heart,
  Droplet,
  Edit3,
  Loader2,
  CheckCircle2,
  Power,
  Lock,
  Globe,
  PhoneCall,
  AlertCircle,
  MapPin,
  Calendar,
} from "lucide-react";

import { getDivisionById, getDistrictById, getUpazilaById } from "@/constants/locations";
import type { DonorProfile, DonorContactMode } from "@/types/donor";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTranslations } from "@/i18n/translations";
import type { Locale } from "@/i18n/config";

interface DonorProfileCardProps {
  donorProfile?: DonorProfile | null;
  isLoading: boolean;
  isUpdatingAvailability: boolean;
  isUpdatingContactMode: boolean;
  onToggleAvailability: () => Promise<void>;
  onSelectContactMode: (mode: DonorContactMode) => Promise<void>;
  isSuspended?: boolean;
  locale: Locale;
}

export function DonorProfileCard({
  donorProfile,
  isLoading,
  isUpdatingAvailability,
  isUpdatingContactMode,
  onToggleAvailability,
  onSelectContactMode,
  isSuspended = false,
  locale,
}: DonorProfileCardProps) {
  const t = getTranslations(locale);
  const [contactModeSuccess, setContactModeSuccess] = React.useState(false);

  const prefix = locale === "en" ? "/en" : "";
  const donorRegisterHref = `${prefix}/donors/register`;

  const isAvailable = donorProfile?.availabilityStatus === "available";

  const handleContactModeClick = async (mode: DonorContactMode) => {
    if (!donorProfile || donorProfile.contactMode === mode) return;
    try {
      await onSelectContactMode(mode);
      setContactModeSuccess(true);
      setTimeout(() => setContactModeSuccess(false), 3000);
    } catch {
      // Handled by mutation
    }
  };

  // Location display labels
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

  return (
    <Card className="rounded-3xl border border-border/80 bg-surface shadow-xs overflow-hidden">
      <CardHeader className="p-5 sm:p-6 border-b border-border/70 bg-surface">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Heart className="size-5 fill-current" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-foreground">
                {locale === "en" ? "Blood Donor Profile" : "রক্তদাতা প্রোফাইল"}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {locale === "en"
                  ? "Manage voluntary donation status and contact privacy"
                  : "স্বেচ্ছাসেবী রক্তদান স্ট্যাটাস ও যোগাযোগের গোপনীয়তা পরিচালনা করুন"}
              </CardDescription>
            </div>
          </div>

          {donorProfile && (
            <Badge
              variant={isAvailable ? "default" : "secondary"}
              className={`self-start sm:self-auto text-xs py-1 px-3 rounded-full font-bold shadow-2xs ${
                isAvailable ? "bg-emerald-600 hover:bg-emerald-600 text-white" : ""
              }`}
            >
              <span className="relative flex size-2 mr-1.5">
                {isAvailable && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                )}
                <span
                  className={`relative inline-flex rounded-full size-2 ${
                    isAvailable ? "bg-white" : "bg-muted-foreground"
                  }`}
                />
              </span>
              <span>
                {isAvailable
                  ? locale === "en"
                    ? "Available to Donate"
                    : "রক্তদানে প্রস্তুত (সক্রিয়)"
                  : locale === "en"
                  ? "Currently Unavailable"
                  : "এখন প্রস্তুত নন (নিষ্ক্রিয়)"}
              </span>
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-6 animate-spin text-primary" />
            <span>{locale === "en" ? "Loading donor profile..." : "রক্তদাতা প্রোফাইল লোড হচ্ছে..."}</span>
          </div>
        ) : donorProfile ? (
          <div className="space-y-6">
            {/* Availability Quick Action Switcher */}
            <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-muted/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <strong className="text-sm font-bold text-foreground block">
                  {locale === "en" ? "Donation Readiness Toggle" : "রক্তদানের প্রাপ্যতা পরিবর্তন"}
                </strong>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                  {isAvailable
                    ? locale === "en"
                      ? "You are currently visible to patients and coordinators seeking urgent blood donors."
                      : "আপনার প্রোফাইল বর্তমানে সক্রিয় রক্তদাতা হিসেবে প্রদর্শিত হচ্ছে এবং জরুরি প্রয়োজনে রোগীরা যোগাযোগ করতে পারবে।"
                    : locale === "en"
                    ? "You are currently marked as unavailable. You will not receive urgent donor requests."
                    : "আপনি বর্তমানে রক্তদানে অপারগ হিসেবে চিহ্নিত আছেন। এ অবস্থায় আপনার কাছে অনুরোধ আসবে না।"}
                </p>
              </div>

              <Button
                size="sm"
                variant={isAvailable ? "outline" : "default"}
                onClick={onToggleAvailability}
                disabled={isUpdatingAvailability || isSuspended}
                className="shrink-0 gap-2 min-h-[42px] rounded-xl px-4 font-bold shadow-xs cursor-pointer"
              >
                {isUpdatingAvailability ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Power className="size-4" />
                )}
                <span>
                  {isAvailable
                    ? locale === "en"
                      ? "Set to Unavailable"
                      : "অপ্রস্তুত হিসেবে চিহ্নিত করুন"
                    : locale === "en"
                    ? "Set to Available"
                    : "প্রস্তুত হিসেবে চিহ্নিত করুন"}
                </span>
              </Button>
            </div>

            {/* Donor Profile Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs sm:text-sm">
              <div className="p-4 rounded-2xl border border-border/80 bg-surface flex items-center justify-between">
                <div>
                  <span className="text-muted-foreground text-xs block mb-0.5">
                    {locale === "en" ? "Blood Group" : "রক্তের গ্রুপ"}
                  </span>
                  <strong className="text-primary font-black text-2xl leading-none">
                    {donorProfile.bloodGroup}
                  </strong>
                </div>
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Droplet className="size-5 fill-current" />
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-border/80 bg-surface">
                <span className="text-muted-foreground text-xs block mb-0.5">
                  {locale === "en" ? "Donor Full Name" : "রক্তদাতার নাম"}
                </span>
                <strong className="text-foreground text-sm block truncate">
                  {donorProfile.displayName}
                </strong>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {donorProfile.phoneNumber}
                </span>
              </div>

              <div className="p-4 rounded-2xl border border-border/80 bg-surface">
                <span className="text-muted-foreground text-xs block mb-0.5 flex items-center gap-1">
                  <MapPin className="size-3 text-primary" />
                  <span>{locale === "en" ? "Location / District" : "বর্তমান অবস্থান ও এলাকা"}</span>
                </span>
                <span className="text-foreground font-semibold block truncate">
                  {locationText || "—"}
                </span>
                {donorProfile.area && (
                  <span className="text-[11px] text-muted-foreground block truncate mt-0.5">
                    {donorProfile.area}
                  </span>
                )}
              </div>

              <div className="p-4 rounded-2xl border border-border/80 bg-surface">
                <span className="text-muted-foreground text-xs block mb-0.5 flex items-center gap-1">
                  <Calendar className="size-3 text-primary" />
                  <span>{locale === "en" ? "Last Blood Donation Date" : "সর্বশেষ রক্তদানের তারিখ"}</span>
                </span>
                <span className="text-foreground font-semibold block">
                  {donorProfile.lastDonationDate || (locale === "en" ? "Never donated yet" : "এখনো রক্ত দেননি")}
                </span>
              </div>
            </div>

            {/* Donor Contact Privacy Mode Switcher */}
            <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-muted/20 space-y-3.5">
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
                <Badge
                  variant={donorProfile.contactMode === "PUBLIC" ? "default" : "secondary"}
                  className="self-start sm:self-auto font-bold text-[11px]"
                >
                  {donorProfile.contactMode === "PUBLIC" ? "PUBLIC (প্রকাশ্য)" : "PRIVATE (সুরক্ষিত)"}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {t.contactModeSettings.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleContactModeClick("PUBLIC")}
                  disabled={isUpdatingContactMode}
                  className={`text-left p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                    donorProfile.contactMode === "PUBLIC"
                      ? "border-emerald-500 bg-emerald-500/10 text-foreground ring-2 ring-emerald-500/20 shadow-xs"
                      : "border-border/80 bg-surface hover:border-primary/40 text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs mb-1">
                    <PhoneCall className="size-3.5 text-emerald-600 shrink-0" />
                    <span>{t.contactModeSettings.publicMode}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {t.contactModeSettings.publicDesc}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleContactModeClick("PRIVATE")}
                  disabled={isUpdatingContactMode}
                  className={`text-left p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                    (donorProfile.contactMode || "PRIVATE") === "PRIVATE"
                      ? "border-primary bg-primary/10 text-foreground ring-2 ring-primary/20 shadow-xs"
                      : "border-border/80 bg-surface hover:border-primary/40 text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs mb-1">
                    <Lock className="size-3.5 text-primary shrink-0" />
                    <span>{t.contactModeSettings.privateMode}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {t.contactModeSettings.privateDesc}
                  </p>
                </button>
              </div>

              {donorProfile.contactMode === "PUBLIC" && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200">
                  <AlertCircle className="size-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                  <span className="leading-relaxed">{t.contactModeSettings.publicPrivacyWarning}</span>
                </div>
              )}

              {contactModeSuccess && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="size-4 shrink-0" />
                  <span>{t.contactModeSettings.switchSuccess}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
              <Button asChild variant="default" size="default" className="w-full sm:w-auto gap-2 min-h-[44px] rounded-xl font-bold shadow-xs cursor-pointer">
                <Link href={donorRegisterHref}>
                  <Edit3 className="size-4" />
                  <span>{locale === "en" ? "Edit Full Donor Profile" : "সম্পূর্ণ রক্তদাতা তথ্য সম্পাদনা"}</span>
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          /* Empty State: Not yet registered as donor */
          <div className="text-center py-10 px-4 sm:px-6 rounded-2xl border-2 border-dashed border-border/80 bg-muted/10 space-y-4">
            <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-primary/10 text-primary shadow-xs">
              <Droplet className="size-7 fill-current" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-base sm:text-lg font-bold text-foreground">
                {locale === "en" ? "You are not registered as a blood donor yet" : "আপনি এখনও রক্তদাতা হিসেবে নিবন্ধিত নন"}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {locale === "en"
                  ? "Voluntary donation saves lives in critical moments. Register your blood group and location to join our verified voluntary donor network."
                  : "আপনার এক ব্যাগ রক্ত বাঁচাতে পারে একটি মুমূর্ষু জীবন। রক্তবন্ধু ভেরিফায়েড স্বেচ্ছাসেবী নেটওয়ার্কে যুক্ত হতে আপনার রক্তদাতা প্রোফাইল নিবন্ধন করুন।"}
              </p>
            </div>
            <Button asChild size="default" className="min-h-[46px] rounded-xl px-6 font-bold shadow-xs gap-2 cursor-pointer">
              <Link href={donorRegisterHref}>
                <Heart className="size-4 fill-current" />
                <span>{locale === "en" ? "Register as Voluntary Donor" : "স্বেচ্ছাসেবী রক্তদাতা হিসেবে নিবন্ধন করুন"}</span>
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

