"use client";

import * as React from "react";
import {
  Heart,
  Droplet,
  Search,
  PlusCircle,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  UserPlus,
  AlertCircle,
  FileText,
  Lock,
  ChevronRight,
  Check,
  Sparkles,
  Compass,
  MapPin,
  ListOrdered,
  Bell,
  Activity,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DONOR_RECOVERY_PERIOD_DAYS } from "@/lib/utils/donor-eligibility";
import type { Locale } from "@/i18n/config";

export type OnboardingStepId =
  | "welcome"
  | "what_can_you_do"
  | "create_account"
  | "become_donor"
  | "donor_availability"
  | "find_donor"
  | "create_blood_request"
  | "after_request"
  | "donation_complete"
  | "choose_journey";

interface OnboardingStepContentProps {
  stepId: OnboardingStepId;
  locale: Locale;
  isAuthenticated: boolean;
  isDonor: boolean;
  onNavigateAction: (url: string, ctaId: string) => void;
  onComplete: () => void;
}

export function OnboardingStepContent({
  stepId,
  locale,
  isAuthenticated,
  isDonor,
  onNavigateAction,
  onComplete,
}: OnboardingStepContentProps) {
  const prefix = locale === "en" ? "/en" : "";

  // -------------------------------------------------------------
  // STEP 1: WELCOME
  // -------------------------------------------------------------
  if (stepId === "welcome") {
    return (
      <div className="space-y-4 sm:space-y-5 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="mx-auto flex size-14 sm:size-16 items-center justify-center rounded-2xl sm:rounded-3xl bg-primary/10 text-primary ring-8 ring-primary/5 shadow-xs">
          <Heart className="size-7 sm:size-8 fill-primary animate-pulse" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <Badge variant="subtle" className="text-primary font-bold px-3 py-0.5 text-xs">
            {locale === "en" ? "Welcome to RoktoBondhu" : "রক্তবন্ধু প্ল্যাটফর্মে স্বাগতম"}
          </Badge>
          <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight leading-snug">
            {locale === "en"
              ? "Standing By You in Every Blood Need ❤️"
              : "রক্তের প্রয়োজনে, আমরা পাশে আছি ❤️"}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
            {locale === "en"
              ? "RoktoBondhu helps you find blood donors, become a voluntary donor, and request blood quickly whenever emergencies arise."
              : "RoktoBondhu আপনাকে রক্তদাতা খুঁজতে, রক্তদাতা হতে এবং প্রয়োজনের সময় রক্তের অনুরোধ করতে সাহায্য করে।"}
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-3 gap-2.5 pt-2 text-left">
          <div className="p-3 rounded-2xl bg-surface-raised border border-border/70 flex flex-col items-center text-center space-y-1">
            <Search className="size-5 text-primary" aria-hidden="true" />
            <span className="text-xs font-bold text-foreground">
              {locale === "en" ? "Find Donors" : "রক্তদাতা খুঁজুন"}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-surface-raised border border-border/70 flex flex-col items-center text-center space-y-1">
            <Heart className="size-5 text-rose-600" aria-hidden="true" />
            <span className="text-xs font-bold text-foreground">
              {locale === "en" ? "Be a Donor" : "রক্তদাতা হন"}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-surface-raised border border-border/70 flex flex-col items-center text-center space-y-1">
            <PlusCircle className="size-5 text-destructive" aria-hidden="true" />
            <span className="text-xs font-bold text-foreground">
              {locale === "en" ? "Blood Request" : "রক্তের অনুরোধ"}
            </span>
          </div>
        </div>

        {/* Quick Orientation Note */}
        <div className="p-3 rounded-xl bg-primary/[0.04] border border-primary/20 text-xs text-muted-foreground text-left flex items-start gap-2.5">
          <Compass className="size-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            {locale === "en"
              ? "This short guide will walk you through registration, becoming a donor, searching for blood, and managing requests step by step."
              : "এই সংক্ষিপ্ত নির্দেশিকা আপনাকে একাউন্ট তৈরি, রক্তদাতা হওয়া, রক্ত অনুসন্ধান এবং জরুরি রক্তের আবেদন পরিচালনার প্রতিটি ধাপ সহজভাবে বুঝিয়ে দেবে।"}
          </span>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STEP 2: WHAT CAN YOU DO?
  // -------------------------------------------------------------
  if (stepId === "what_can_you_do") {
    return (
      <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
        <div className="space-y-1 text-center sm:text-left">
          <Badge variant="subtle" className="text-primary font-bold text-xs">
            {locale === "en" ? "Core Capabilities" : "মূল সুবিধাসমূহ"}
          </Badge>
          <h2 className="text-lg sm:text-xl font-black text-foreground">
            {locale === "en"
              ? "What Can You Do on RoktoBondhu?"
              : "রক্তবন্ধু প্ল্যাটফর্মে আপনি কী কী করতে পারেন?"}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {locale === "en"
              ? "Your emergency blood bridge in Bangladesh — ready for three primary situations:"
              : "আপনার যেকোনো জরুরি প্রয়োজনে ৩টি মূল মাধ্যমে প্ল্যাটফর্মটি ব্যবহার করতে পারেন:"}
          </p>
        </div>

        <div className="space-y-2.5">
          {/* Card 1: Find Donor */}
          <div className="p-3.5 rounded-2xl border border-primary/20 bg-primary/[0.03] flex items-start gap-3">
            <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
              <Droplet className="size-5 fill-primary" aria-hidden="true" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="text-sm font-bold text-foreground">
                {locale === "en" ? "🩸 Find Blood Donors" : "🩸 রক্তদাতা খুঁজুন"}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {locale === "en"
                  ? "Search available donors according to required blood group and district/upazila location."
                  : "আপনার প্রয়োজনীয় blood group এবং location অনুযায়ী available donor খুঁজুন।"}
              </p>
            </div>
          </div>

          {/* Card 2: Become a Donor */}
          <div className="p-3.5 rounded-2xl border border-rose-500/20 bg-rose-500/[0.03] flex items-start gap-3">
            <div className="size-9 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
              <Heart className="size-5 fill-rose-600" aria-hidden="true" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="text-sm font-bold text-foreground">
                {locale === "en" ? "❤️ Become a Voluntary Donor" : "❤️ রক্তদাতা হন"}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {locale === "en"
                  ? "Join RoktoBondhu as a voluntary donor to save lives in critical emergencies."
                  : "আপনি রক্ত দিতে পারলে donor হিসেবে RoktoBondhu-তে যুক্ত হন।"}
              </p>
            </div>
          </div>

          {/* Card 3: Blood Request */}
          <div className="p-3.5 rounded-2xl border border-destructive/20 bg-destructive/[0.03] flex items-start gap-3">
            <div className="size-9 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0 mt-0.5">
              <PlusCircle className="size-5" aria-hidden="true" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="text-sm font-bold text-foreground">
                {locale === "en" ? "🚨 Request Blood Urgently" : "🚨 রক্তের অনুরোধ করুন"}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {locale === "en"
                  ? "Create and publish a blood request when an urgent patient need arises."
                  : "রক্তের প্রয়োজন হলে একটি blood request তৈরি করুন।"}
              </p>
            </div>
          </div>
        </div>

        {/* Operating Instruction */}
        <div className="p-3 rounded-xl bg-surface-raised border border-border/80 text-xs space-y-1">
          <div className="font-bold text-foreground flex items-center gap-1.5">
            <ListOrdered className="size-3.5 text-primary" aria-hidden="true" />
            <span>{locale === "en" ? "How to Navigate:" : "কোথা থেকে ব্যবহার করবেন:"}</span>
          </div>
          <p className="text-muted-foreground text-[11px] leading-relaxed">
            {locale === "en"
              ? "Desktop users can use the top navigation bar anytime. Mobile users have a persistent bottom navigation dock (Home, Donors, Requests, Alerts, Account)."
              : "কম্পিউটার ব্যবহারকারীরা উপরের হেডার মেনু থেকে এবং মোবাইল ব্যবহারকারীরা নিচের ফ্লোটিং ডক (হোম, রক্তদাতা, অনুরোধ, অ্যালার্ট, একাউন্ট) থেকে যেকোনো ফিচার পরিচালনা করতে পারবেন।"}
          </p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STEP 3: CREATE AN ACCOUNT (Unauthenticated users only)
  // -------------------------------------------------------------
  if (stepId === "create_account") {
    const registerHref = `${prefix}/register`;

    return (
      <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
        <div className="space-y-1 text-center sm:text-left">
          <Badge variant="subtle" className="text-primary font-bold text-xs">
            {locale === "en" ? "Account Registration" : "একাউন্ট প্রস্তুতি"}
          </Badge>
          <h2 className="text-lg sm:text-xl font-black text-foreground">
            {locale === "en" ? "First, Create Your Account" : "প্রথমে আপনার Account তৈরি করুন"}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {locale === "en"
              ? "A verified account ensures safe, authentic, and confidential interactions on the platform."
              : "নিরাপদ ও নির্ভরযোগ্য সেবার জন্য RoktoBondhu-তে একটি ভেরিফায়েড একাউন্ট তৈরি করা আবশ্যক।"}
          </p>
        </div>

        {/* Real Required Registration Fields (including Phone Number) */}
        <div className="space-y-2">
          {[
            {
              num: 1,
              title: locale === "en" ? "Full Name" : "পূর্ণ নাম",
              desc: locale === "en" ? "Your verified public identity" : "আপনার নাম ও পরিচয়",
            },
            {
              num: 2,
              title: locale === "en" ? "Email Address" : "ইমেইল ঠিকানা",
              desc: locale === "en" ? "Active email for login & alerts" : "সক্রিয় ইমেইল (লগইন ও অ্যালার্টের জন্য)",
            },
            {
              num: 3,
              title: locale === "en" ? "Mobile Phone Number" : "মোবাইল নম্বর",
              desc: locale === "en" ? "Valid 11-digit BD mobile (01XXXXXXXXX)" : "১১ ডিজিটের বাংলাদেশি নম্বর (০১XXXXXXXXX)",
              highlight: true,
            },
            {
              num: 4,
              title: locale === "en" ? "Secure Password" : "নিরাপদ পাসওয়ার্ড",
              desc: locale === "en" ? "Min 8 characters (letters & numbers)" : "কমপক্ষে ৮ অক্ষর, বর্ণ ও সংখ্যার মিশ্রণ",
            },
            {
              num: 5,
              title: locale === "en" ? "Confirm & Consent" : "পাসওয়ার্ড নিশ্চিত ও সম্মতি",
              desc: locale === "en" ? "Password match & agree to terms" : "একই পাসওয়ার্ড পুনঃপ্রদান ও শর্তে সম্মতি",
            },
            {
              num: 6,
              title: locale === "en" ? "Email Verification" : "ইমেইল ভেরিফিকেশন",
              desc: locale === "en" ? "Click link sent to email to activate" : "ইনবক্সে পাঠানো লিংকে ক্লিক করে সক্রিয় করুন",
            },
          ].map((item) => (
            <div
              key={item.num}
              className={`flex items-center gap-3 p-2.5 rounded-xl border text-xs transition-colors ${
                item.highlight
                  ? "bg-primary/[0.04] border-primary/30"
                  : "bg-surface-raised border-border/70"
              }`}
            >
              <div
                className={`size-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                  item.highlight
                    ? "bg-primary text-white"
                    : "bg-primary/10 text-primary"
                }`}
              >
                {item.num}
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-bold text-foreground mr-1.5">{item.title}:</span>
                <span className="text-muted-foreground">{item.desc}</span>
              </div>
            </div>
          ))}
        </div>

        {/* How to Operate Box */}
        <div className="p-3.5 rounded-2xl bg-amber-500/[0.06] border border-amber-500/25 space-y-1.5 text-xs">
          <div className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-amber-600 shrink-0" aria-hidden="true" />
            <span>{locale === "en" ? "💡 How to operate Registration:" : "💡 কীভাবে একাউন্ট খুলবেন:"}</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-[11px] leading-relaxed">
            <li>
              <strong>{locale === "en" ? "Location:" : "কোথায় পাবেন:"}</strong>{" "}
              {locale === "en"
                ? "Click 'Create Account' in the top header or use the button below."
                : "হেডারের 'একাউন্ট নিবন্ধন' বাটনে ক্লিক করুন অথবা নিচের বোতাম চাপুন।"}
            </li>
            <li>
              {locale === "en"
                ? "Fill in Name, Email, BD Mobile Number, Password, and submit."
                : "নাম, ইমেইল, মোবাইল নম্বর ও পাসওয়ার্ড দিয়ে 'নিবন্ধন সম্পন্ন করুন'-এ চাপুন।"}
            </li>
            <li>
              {locale === "en"
                ? "Open your email inbox and click the verification link to activate your profile."
                : "ইমেইল চেক করে ভেরিফিকেশন লিংকে ক্লিক করলেই একাউন্ট সক্রিয় হয়ে যাবে।"}
            </li>
          </ol>
        </div>

        <div className="pt-1">
          <Button
            type="button"
            className="w-full font-bold shadow-xs"
            onClick={() => onNavigateAction(registerHref, "register_flow")}
          >
            <UserPlus className="size-4 mr-1.5" aria-hidden="true" />
            {locale === "en" ? "Create Account Now" : "Account তৈরি করুন"}
          </Button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STEP 4: BECOME A DONOR
  // -------------------------------------------------------------
  if (stepId === "become_donor") {
    const donorHref = `${prefix}/donors/register#registration-form`;

    return (
      <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
        <div className="space-y-1 text-center sm:text-left">
          <Badge variant="subtle" className="text-primary font-bold text-xs">
            {locale === "en" ? "Donor Registration" : "রক্তদাতা হিসেবে যোগদান"}
          </Badge>
          <h2 className="text-lg sm:text-xl font-black text-foreground">
            {isDonor
              ? locale === "en"
                ? "Your Donor Profile is Active ❤️"
                : "আপনার রক্তদাতা প্রোফাইল প্রস্তুত আছে ❤️"
              : locale === "en"
              ? "You Can Be a Blood Donor ❤️"
              : "আপনিও হতে পারেন একজন রক্তদাতা ❤️"}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {isDonor
              ? locale === "en"
                ? "You are registered as a voluntary donor. Keep your availability, district, and last donation date up-to-date."
                : "আপনি ইতোমধ্যে একজন নিবন্ধিত রক্তদাতা। আপনার জেলা, উপজেলা, প্রাপ্যতা ও শেষ রক্তদানের তথ্য যেকোনো সময় হালনাগাদ রাখতে পারবেন।"
              : locale === "en"
              ? "Configure your donor profile with blood group, location, and privacy settings:"
              : "আপনার রক্তদাতা প্রোফাইল তৈরি করার সময় এই তথ্যগুলো প্রদান করতে হবে:"}
          </p>
        </div>

        {/* Profile Attributes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="p-3 rounded-2xl bg-surface-raised border border-border/70 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <Droplet className="size-4 text-primary shrink-0" aria-hidden="true" />
              <span>{locale === "en" ? "Blood Group" : "রক্তের গ্রুপ"}</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {locale === "en" ? "A+, A-, B+, B-, O+, O-, AB+, AB-" : "৮টি রক্তের গ্রুপের যেকোনো একটি"}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-surface-raised border border-border/70 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <MapPin className="size-4 text-emerald-600 shrink-0" aria-hidden="true" />
              <span>{locale === "en" ? "Location (64 Districts)" : "জেলা ও উপজেলা"}</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {locale === "en" ? "Nearest matching in your upazila" : "আপনার স্থানীয় উপজেলায় দ্রুত সংযোগ"}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-surface-raised border border-border/70 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <Calendar className="size-4 text-primary shrink-0" aria-hidden="true" />
              <span>{locale === "en" ? "Last Donation Date" : "সর্বশেষ রক্তদানের তারিখ"}</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {locale === "en" ? "Maintains 120-day recovery logic" : "১২০ দিনের মেডিকেল রিকভারি হিসাব"}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-surface-raised border border-border/70 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <Lock className="size-4 text-amber-600 shrink-0" aria-hidden="true" />
              <span>{locale === "en" ? "Privacy Preference" : "যোগাযোগের গোপনীয়তা"}</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {locale === "en" ? "Private request or public contact" : "প্রাইভেট রিকোয়েস্ট বা পাবলিক নম্বর"}
            </p>
          </div>
        </div>

        {/* How to Operate Box */}
        <div className="p-3.5 rounded-2xl bg-rose-500/[0.05] border border-rose-500/25 space-y-1.5 text-xs">
          <div className="font-bold text-rose-900 dark:text-rose-300 flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-rose-600 shrink-0" aria-hidden="true" />
            <span>
              {isDonor
                ? locale === "en"
                  ? "💡 How to manage your Donor Profile:"
                  : "💡 কীভাবে প্রোফাইল পরিচালনা করবেন:"
                : locale === "en"
                ? "💡 How to operate Donor Registration:"
                : "💡 কীভাবে রক্তদাতা হিসেবে নিবন্ধন করবেন:"}
            </span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-[11px] leading-relaxed">
            <li>
              <strong>{locale === "en" ? "Location:" : "কোথায় পাবেন:"}</strong>{" "}
              {locale === "en"
                ? "Navigate to 'Become a Donor' (/donors/register) from header or below."
                : "হেডার থেকে 'রক্তদাতা হিসেবে নিবন্ধন' বা নিচের বাটনে ক্লিক করুন।"}
            </li>
            <li>
              {locale === "en"
                ? "Select your Blood Group and Division > District > Upazila."
                : "আপনার রক্তের গ্রুপ এবং বিভাগ > জেলা > উপজেলা নির্বাচন করুন।"}
            </li>
            <li>
              {locale === "en"
                ? "Choose Privacy: 'Private Request' keeps your phone hidden; seekers send secure requests."
                : "গোপনীয়তা নির্ধারণ করুন: 'Private Request' রাখলে নম্বর গোপন থাকবে, কেবল ইন-অ্যাপ রিকোয়েস্ট আসবে।"}
            </li>
            <li>
              {locale === "en"
                ? "Enter your last donation date (if any) and submit to become active."
                : "শেষ রক্তদানের তারিখ দিয়ে সাবমিট করলেই আপনি রক্তদাতা তালিকায় যুক্ত হবেন।"}
            </li>
          </ol>
        </div>

        <div className="pt-1">
          <Button
            type="button"
            className="w-full font-bold shadow-xs"
            onClick={() => onNavigateAction(donorHref, "donor_flow")}
          >
            <Heart className="size-4 mr-1.5 fill-current" aria-hidden="true" />
            {isDonor
              ? locale === "en"
                ? "View / Manage Donor Profile"
                : "রক্তদাতা প্রোফাইল দেখুন ও আপডেট করুন"
              : locale === "en"
              ? "Become a Donor"
              : "Donor হতে চাই"}
          </Button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STEP 5: DONOR AVAILABILITY & 120-DAY RECOVERY
  // -------------------------------------------------------------
  if (stepId === "donor_availability") {
    return (
      <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
        <div className="space-y-1 text-center sm:text-left">
          <Badge variant="subtle" className="text-primary font-bold text-xs">
            {locale === "en" ? "Medical Recovery & Eligibility" : "মেডিকেল রিকভারি ও প্রাপ্যতা"}
          </Badge>
          <h2 className="text-lg sm:text-xl font-black text-foreground">
            {locale === "en" ? "Your Availability Matters" : "আপনার Availability গুরুত্বপূর্ণ"}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {locale === "en"
              ? "Medical safety comes first. RoktoBondhu strictly upholds blood donation health guidelines."
              : "আপনি সর্বশেষ কবে রক্ত দিয়েছেন তার ভিত্তিতে আপনার donor availability নির্ধারিত হতে পারে। প্রয়োজনীয় recovery period শেষ হলে আপনি আবার eligible হতে পারবেন।"}
          </p>
        </div>

        {/* 120-Day Recovery Rule Card */}
        <div className="p-4 rounded-2xl border border-primary/25 bg-primary/[0.04] space-y-3">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-primary text-white flex items-center justify-center font-black text-xs shrink-0">
              {DONOR_RECOVERY_PERIOD_DAYS}
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-foreground">
                {locale === "en"
                  ? `${DONOR_RECOVERY_PERIOD_DAYS} Days (4 Months) Medical Recovery`
                  : `${DONOR_RECOVERY_PERIOD_DAYS} দিন (৪ মাস) পূর্ণ বিশ্রাম পর্ব`}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {locale === "en"
                  ? "Standard clinical cooldown between whole blood donations"
                  : "নিরাপদ রক্তদানের জন্য বিশ্ব স্বাস্থ্য মানদণ্ড অনুযায়ী বিরতি"}
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-1 border-t border-border/60 text-xs">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                <strong>{locale === "en" ? "Automatic Cooldown:" : "স্বয়ংক্রিয় রিকভারি:"}</strong>{" "}
                {locale === "en"
                  ? "When you record a donation, your profile safely pauses until the 120-day period ends."
                  : "রক্তদানের তারিখ প্রদান করলে প্রোফাইল সাময়িকভাবে বিশ্রামে থাকে এবং ১২০ দিন পর পুনরায় প্রস্তুত হয়।"}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                <strong>{locale === "en" ? "Manual Control:" : "ম্যানুয়াল বিরতি:"}</strong>{" "}
                {locale === "en"
                  ? "You can also manually switch between Available and Unavailable anytime if traveling or unwell."
                  : "অসুস্থতা বা ব্যক্তিগত প্রয়োজনে ড্যাশবোর্ড থেকে প্রাপ্যতা নিজেই Unavailable রাখতে পারবেন।"}
              </span>
            </div>
          </div>
        </div>

        {/* How to Operate Box */}
        <div className="p-3.5 rounded-2xl bg-surface-raised border border-border/80 space-y-1.5 text-xs">
          <div className="font-bold text-foreground flex items-center gap-1.5">
            <Activity className="size-3.5 text-primary shrink-0" aria-hidden="true" />
            <span>{locale === "en" ? "💡 How to operate Availability:" : "💡 কীভাবে প্রাপ্যতা নিয়ন্ত্রণ করবেন:"}</span>
          </div>
          <ul className="space-y-1 text-muted-foreground text-[11px] leading-relaxed">
            <li>
              • <strong>{locale === "en" ? "Check Status:" : "স্ট্যাটাস দেখুন:"}</strong>{" "}
              {locale === "en"
                ? "Visit Account Dashboard (/account) to view your real-time recovery countdown."
                : "অ্যাকাউন্ট ড্যাশবোর্ডে (/account) আপনার রিকভারি কাউন্টডাউন দেখতে পাবেন।"}
            </li>
            <li>
              • <strong>{locale === "en" ? "Toggle Readiness:" : "টগল করুন:"}</strong>{" "}
              {locale === "en"
                ? "Switch the availability toggle button whenever you are ready or temporarily busy."
                : "প্রস্তুত থাকলে 'Available' এবং ব্যস্ত থাকলে 'Unavailable' সুইচে এক ক্লিকে টগল করুন।"}
            </li>
          </ul>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STEP 6: FIND A DONOR
  // -------------------------------------------------------------
  if (stepId === "find_donor") {
    const searchHref = `${prefix}/donors`;

    return (
      <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
        <div className="space-y-1 text-center sm:text-left">
          <Badge variant="subtle" className="text-primary font-bold text-xs">
            {locale === "en" ? "Search Directory" : "রক্তদাতা অনুসন্ধান"}
          </Badge>
          <h2 className="text-lg sm:text-xl font-black text-foreground">
            {locale === "en" ? "Find Verified Donors Anytime" : "প্রয়োজনে রক্তদাতা খুঁজুন"}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {locale === "en"
              ? "Blood Group এবং location নির্বাচন করে available donor খুঁজে নিতে পারবেন।"
              : "Blood Group এবং location নির্বাচন করে available donor খুঁজে নিতে পারবেন।"}
          </p>
        </div>

        {/* Search Journey Visual */}
        <div className="space-y-2">
          {[
            {
              step: "১",
              enStep: "1",
              title: locale === "en" ? "Select Blood Group" : "রক্তের গ্রুপ নির্বাচন",
              desc: locale === "en" ? "Compatible ABO & Rh types" : "A+, B+, O+, AB+ ইত্যাদি",
            },
            {
              step: "২",
              enStep: "2",
              title: locale === "en" ? "Filter by District & Upazila" : "জেলা ও উপজেলা ফিল্টার",
              desc: locale === "en" ? "Locate the nearest willing donors" : "রোগীর নিকটতম এলাকার রক্তদাতা",
            },
            {
              step: "৩",
              enStep: "3",
              title: locale === "en" ? "View Ready Donors" : "প্রস্তুত দাতাদের প্রোফাইল",
              desc: locale === "en" ? "Eligibility verified & cooldown active" : "যাচাইকৃত সক্রিয় রক্তদাতা",
            },
            {
              step: "৪",
              enStep: "4",
              title: locale === "en" ? "Send Contact Request" : "যোগাযোগের অনুরোধ পাঠান",
              desc: locale === "en" ? "Donor privacy strictly protected" : "মোবাইল নম্বরের সর্বোচ্চ নিরাপত্তা",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-2 rounded-xl bg-surface-raised border border-border/70 text-xs"
            >
              <div className="size-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                {locale === "en" ? item.enStep : item.step}
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-bold text-foreground mr-1.5">{item.title}:</span>
                <span className="text-muted-foreground">{item.desc}</span>
              </div>
            </div>
          ))}
        </div>

        {/* How to Operate Box */}
        <div className="p-3.5 rounded-2xl bg-primary/[0.04] border border-primary/25 space-y-1.5 text-xs">
          <div className="font-bold text-primary flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-primary shrink-0" aria-hidden="true" />
            <span>{locale === "en" ? "💡 How to operate Donor Search:" : "💡 রক্তদাতা কীভাবে খুঁজবেন:"}</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-[11px] leading-relaxed">
            <li>
              <strong>{locale === "en" ? "Location:" : "কোথায় পাবেন:"}</strong>{" "}
              {locale === "en"
                ? "Click 'Find Donors' (/donors) in top bar or bottom dock."
                : "হেডার মেনুর 'রক্তদাতা খুঁজুন' বা মোবাইল ডকের 'রক্তদাতা'-তে যান।"}
            </li>
            <li>
              {locale === "en"
                ? "Choose blood group & location, then click 'Search Donors'."
                : "গ্রুপ ও জেলা/উপজেলা সিলেক্ট করে 'অনুসন্ধান করুন' বাটনে চাপুন।"}
            </li>
            <li>
              {locale === "en"
                ? "Click 'Contact Request' on any available donor card to initiate a private request."
                : "প্রস্তুত দাতার কার্ডে 'যোগাযোগের অনুরোধ' বাটনে ক্লিক করে রিকোয়েস্ট পাঠান।"}
            </li>
          </ol>
        </div>

        <div className="pt-1">
          <Button
            type="button"
            className="w-full font-bold shadow-xs"
            onClick={() => onNavigateAction(searchHref, "find_donor_cta")}
          >
            <Search className="size-4 mr-1.5" aria-hidden="true" />
            {locale === "en" ? "Search Donors" : "Donor খুঁজুন"}
          </Button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STEP 7: CREATE A BLOOD REQUEST
  // -------------------------------------------------------------
  if (stepId === "create_blood_request") {
    const requestHref = `${prefix}/blood-request/create#request-form`;

    return (
      <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
        <div className="space-y-1 text-center sm:text-left">
          <Badge variant="subtle" className="text-destructive font-bold text-xs">
            {locale === "en" ? "Emergency Requisition" : "জরুরি আবেদন"}
          </Badge>
          <h2 className="text-lg sm:text-xl font-black text-foreground">
            {locale === "en" ? "Request Blood When Needed 🚨" : "রক্তের প্রয়োজন হলে Request করুন 🚨"}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {locale === "en"
              ? "If you or your hospital patient urgently requires blood units, submit a verified requisition."
              : "হাসপাতালে চিকিৎসাধীন রোগীর রক্তের প্রয়োজন হলে দ্রুত একটি blood request তৈরি করুন।"}
          </p>
        </div>

        {/* Request Data Elements */}
        <div className="p-3.5 rounded-2xl bg-surface-raised border border-border/70 space-y-2 text-xs">
          <div className="font-bold text-foreground">
            {locale === "en" ? "Essential information required:" : "প্রয়োজনীয় তথ্যাবলী:"}
          </div>
          <div className="grid grid-cols-2 gap-2 text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Droplet className="size-3.5 text-primary" aria-hidden="true" />
              <span>{locale === "en" ? "Blood Group & Units" : "রক্তের গ্রুপ ও ব্যাগ"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-primary" aria-hidden="true" />
              <span>{locale === "en" ? "Hospital & Location" : "হাসপাতাল ও ঠিকানা"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="size-3.5 text-primary" aria-hidden="true" />
              <span>{locale === "en" ? "Needed Date & Time" : "প্রয়োজনীয় সময় ও তারিখ"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <AlertCircle className="size-3.5 text-destructive" aria-hidden="true" />
              <span>{locale === "en" ? "Urgency Level" : "সাধারণ / জরুরি / অতি জরুরি"}</span>
            </div>
          </div>
        </div>

        {/* How to Operate Box */}
        <div className="p-3.5 rounded-2xl bg-destructive/[0.05] border border-destructive/25 space-y-1.5 text-xs">
          <div className="font-bold text-destructive flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-destructive shrink-0" aria-hidden="true" />
            <span>{locale === "en" ? "💡 How to post a Blood Request:" : "💡 কীভাবে রক্তের আবেদন পোস্ট করবেন:"}</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-[11px] leading-relaxed">
            <li>
              <strong>{locale === "en" ? "Location:" : "কোথায় পাবেন:"}</strong>{" "}
              {locale === "en"
                ? "Click 'Post Request' in header or mobile dock (/blood-request/create)."
                : "হেডারের 'রক্তের আবেদন' বা মোবাইল বারের 'অনুরোধ'-এ যান।"}
            </li>
            <li>
              {locale === "en"
                ? "Fill in blood group, bags, hospital location, and emergency contact number."
                : "গ্রুপ, রক্তের ব্যাগের সংখ্যা, হাসপাতালের ঠিকানা ও যোগাযোগের নম্বর দিন।"}
            </li>
            <li>
              {locale === "en"
                ? "Set urgency & required date/time, then click 'Submit Blood Request'."
                : "জরুরি মাত্রা ও তারিখ দিয়ে 'রক্তের আবেদন পোস্ট করুন' বাটনে চাপুন।"}
            </li>
            <li>
              {locale === "en"
                ? "Nearest matching compatible donors are automatically alerted!"
                : "নিকটস্থ রক্তদাতাদের নিকট স্বয়ংক্রিয়ভাবে অ্যালার্ট পৌঁছে যাবে! &nbsp;"}
            </li>
          </ol>
        </div>

        <div className="pt-1">
          <Button
            type="button"
            className="w-full font-bold bg-destructive hover:bg-destructive/90 text-white shadow-xs"
            onClick={() => onNavigateAction(requestHref, "blood_request_cta")}
          >
            <PlusCircle className="size-4 mr-1.5" aria-hidden="true" />
            {locale === "en" ? "Post Blood Request" : "Blood Request করুন"}
          </Button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STEP 8: AFTER SUBMITTING A REQUEST
  // -------------------------------------------------------------
  if (stepId === "after_request") {
    const myRequestsHref = `${prefix}/account/requests`;

    return (
      <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
        <div className="space-y-1 text-center sm:text-left">
          <Badge variant="subtle" className="text-primary font-bold text-xs">
            {locale === "en" ? "Real-time Tracking" : "স্ট্যাটাস পর্যবেক্ষণ"}
          </Badge>
          <h2 className="text-lg sm:text-xl font-black text-foreground">
            {locale === "en" ? "Track Your Request Status" : "আপনার Request-এর অবস্থা দেখুন"}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {locale === "en"
              ? "Request তৈরি করার পর আপনি আপনার request-এর status দেখতে পারবেন এবং matching donor/contact activity সম্পর্কে জানতে পারবেন।"
              : "Request তৈরি করার পর আপনি আপনার request-এর status দেখতে পারবেন এবং matching donor/contact activity সম্পর্কে জানতে পারবেন।"}
          </p>
        </div>

        {/* Real Codebase Lifecycle Statuses */}
        <div className="space-y-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="size-4 text-emerald-600" aria-hidden="true" />
              <span>{locale === "en" ? "Open (Active)" : "Open (সক্রিয়)"}</span>
            </div>
            <span className="text-[11px] text-muted-foreground">
              {locale === "en" ? "Seeking donors" : "রক্তদাতা খোঁজা চলছে"}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-bold text-primary">
              <Check className="size-4 text-primary" aria-hidden="true" />
              <span>{locale === "en" ? "Fulfilled" : "Fulfilled (সম্পন্ন)"}</span>
            </div>
            <span className="text-[11px] text-muted-foreground">
              {locale === "en" ? "Blood successfully arranged" : "রক্ত সংগ্রহ সম্পন্ন"}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-500/10 border border-slate-500/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <Clock className="size-4 text-muted-foreground" aria-hidden="true" />
              <span>{locale === "en" ? "Expired / Cancelled" : "Expired / Cancelled"}</span>
            </div>
            <span className="text-[11px] text-muted-foreground">
              {locale === "en" ? "Time elapsed or cancelled" : "সময় অতিক্রান্ত বা বাতিল"}
            </span>
          </div>
        </div>

        {/* How to Operate Box */}
        <div className="p-3.5 rounded-2xl bg-surface-raised border border-border/80 space-y-1.5 text-xs">
          <div className="font-bold text-foreground flex items-center gap-1.5">
            <Bell className="size-3.5 text-primary shrink-0" aria-hidden="true" />
            <span>{locale === "en" ? "💡 How to manage submitted requests:" : "💡 কীভাবে রিকোয়েস্ট ম্যানেজ করবেন:"}</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-[11px] leading-relaxed">
            <li>
              <strong>{locale === "en" ? "Location:" : "কোথায় পাবেন:"}</strong>{" "}
              {locale === "en"
                ? "Go to 'My Blood Requests' (/account/requests) from your account menu."
                : "অ্যাকাউন্ট মেনু থেকে 'আমার রক্তের অনুরোধ' (/account/requests)-এ যান।"}
            </li>
            <li>
              {locale === "en"
                ? "View matching donors and responses under your active requisition."
                : "আপনার সক্রিয় আবেদনের অধীনে ম্যাচিং দাতাদের তালিকা ও প্রতিক্রিয়া দেখুন।"}
            </li>
            <li>
              {locale === "en"
                ? "When blood is managed, click 'Fulfilled' to mark it complete and stop further calls."
                : "রক্ত পাওয়া সম্পন্ন হলে 'Fulfilled' বাটনে চাপুন যাতে অপ্রয়োজনীয় কল বন্ধ হয়।"}
            </li>
          </ol>
        </div>

        {isAuthenticated && (
          <div className="pt-1">
            <Button
              type="button"
              variant="outline"
              className="w-full font-bold text-xs"
              onClick={() => onNavigateAction(myRequestsHref, "my_requests_cta")}
            >
              <FileText className="size-3.5 mr-1.5 text-primary" aria-hidden="true" />
              {locale === "en" ? "View My Requests" : "আমার রক্তের অনুরোধ দেখুন"}
            </Button>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // STEP 9: DONATION COMPLETE & PROFILE UPDATE
  // -------------------------------------------------------------
  if (stepId === "donation_complete") {
    const updateHref = `${prefix}/donors/register#registration-form`;

    return (
      <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
        <div className="space-y-1 text-center sm:text-left">
          <Badge variant="subtle" className="text-primary font-bold text-xs">
            {locale === "en" ? "Post-Donation Care" : "রক্তদানের পর করণীয়"}
          </Badge>
          <h2 className="text-lg sm:text-xl font-black text-foreground">
            {locale === "en"
              ? "Update Profile After Donation ❤️"
              : "রক্তদান সম্পন্ন হলে তথ্য আপডেট করুন ❤️"}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {locale === "en"
              ? "রক্তদান করার পর আপনার Last Donation Date update করুন, যাতে আপনার donor availability সঠিক থাকে।"
              : "রক্তদান করার পর আপনার Last Donation Date update করুন, যাতে আপনার donor availability সঠিক থাকে।"}
          </p>
        </div>

        {/* Benefits Card */}
        <div className="p-3.5 rounded-2xl bg-surface-raised border border-border/70 space-y-2 text-xs">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <span className="font-bold text-foreground">
                {locale === "en" ? "Protects Your Health:" : "আপনার স্বাস্থ্য সুরক্ষা:"}
              </span>{" "}
              <span className="text-muted-foreground">
                {locale === "en"
                  ? "Starts the 120-day recovery counter so you don't receive calls while physically recovering."
                  : "১২০ দিনের রিকভারি সময় সক্রিয় হয়ে যায়, যা আপনাকে অপ্রয়োজনীয় কল থেকে মুক্ত রাখে।"}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <span className="font-bold text-foreground">
                {locale === "en" ? "Keeps Search Accurate:" : "নির্ভুল অনুসন্ধান:"}
              </span>{" "}
              <span className="text-muted-foreground">
                {locale === "en"
                  ? "Seekers only contact donors who are clinically ready to donate right now."
                  : "অন্যান্য রোগীরা কেবল প্রকৃত প্রস্তুত দাতাদের কাছেই অনুরোধ পাঠাতে পারেন।"}
              </span>
            </div>
          </div>
        </div>

        {/* How to Operate Box */}
        <div className="p-3.5 rounded-2xl bg-primary/[0.04] border border-primary/25 space-y-1.5 text-xs">
          <div className="font-bold text-primary flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-primary shrink-0" aria-hidden="true" />
            <span>{locale === "en" ? "💡 How to update Last Donation Date:" : "💡 কীভাবে তারিখ আপডেট করবেন:"}</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-[11px] leading-relaxed">
            <li>
              <strong>{locale === "en" ? "Location:" : "কোথায় পাবেন:"}</strong>{" "}
              {locale === "en"
                ? "Open your profile under Account (/account) or Donor Profile (/donors/register)."
                : "অ্যাকাউন্ট পেজ (/account) অথবা রক্তদাতা প্রোফাইল পেজে যান।"}
            </li>
            <li>
              {locale === "en"
                ? "Select 'Last Donation Date' calendar field and pick today's donation date."
                : "'সর্বশেষ রক্তদানের তারিখ' ফিল্ডে রক্তদানের তারিখটি নির্বাচন করুন।"}
            </li>
            <li>
              {locale === "en"
                ? "Save changes to automatically activate your 120-day medical resting cycle."
                : "পরিবর্তন সেভ করলেই স্বয়ংক্রিয়ভাবে ১২০ দিনের স্বাস্থ্য সুরক্ষা কাউন্টার শুরু হবে।"}
            </li>
          </ol>
        </div>

        <div className="pt-1">
          <Button
            type="button"
            variant="outline"
            className="w-full font-bold shadow-2xs"
            onClick={() => onNavigateAction(updateHref, "update_donation_date_cta")}
          >
            <Calendar className="size-4 mr-1.5 text-primary" aria-hidden="true" />
            {locale === "en" ? "Update Last Donation Date" : "সর্বশেষ রক্তদানের তারিখ আপডেট করুন"}
          </Button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // FINAL STEP: CHOOSE YOUR JOURNEY
  // -------------------------------------------------------------
  if (stepId === "choose_journey") {
    const donorsSearchHref = `${prefix}/donors`;
    const becomeDonorHref = `${prefix}/donors/register#registration-form`;
    const createRequestHref = `${prefix}/blood-request/create#request-form`;

    return (
      <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
        <div className="space-y-1 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="size-6 text-primary" aria-hidden="true" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground">
            {locale === "en" ? "What Would You Like to Do Today?" : "আপনি আজ কী করতে চান?"}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
            {locale === "en"
              ? "Select an action below to get started immediately, or close this guide to explore freely."
              : "আপনার প্রয়োজনীয় যাত্রা শুরু করতে নিচের যেকোনো একটি অপশন বেছে নিন:"}
          </p>
        </div>

        {/* 3 Large Action Cards */}
        <div className="space-y-2.5">
          {/* Action 1: Search Donors */}
          <button
            type="button"
            onClick={() => onNavigateAction(donorsSearchHref, "journey_search_donor")}
            className="w-full text-left p-3.5 sm:p-4 rounded-2xl border border-primary/20 bg-primary/[0.03] hover:bg-primary/[0.08] hover:border-primary/40 transition-all flex items-center justify-between gap-3 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <Droplet className="size-5 fill-current" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-foreground">
                  {locale === "en" ? "🩸 Looking for Blood" : "🩸 রক্ত খুঁজছি"}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {locale === "en"
                    ? "Search available donors in your area"
                    : "প্রয়োজনীয় গ্রুপের উপলব্ধ রক্তদাতা খুঁজুন"}
                </div>
              </div>
            </div>
            <ChevronRight className="size-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
          </button>

          {/* Action 2: Become a Donor */}
          <button
            type="button"
            onClick={() => onNavigateAction(becomeDonorHref, "journey_become_donor")}
            className="w-full text-left p-3.5 sm:p-4 rounded-2xl border border-rose-500/20 bg-rose-500/[0.03] hover:bg-rose-500/[0.08] hover:border-rose-500/40 transition-all flex items-center justify-between gap-3 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <Heart className="size-5 fill-current" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-foreground">
                  {isDonor
                    ? locale === "en"
                      ? "❤️ Update Donor Profile"
                      : "❤️ রক্তদাতা প্রোফাইল হালনাগাদ"
                    : locale === "en"
                    ? "❤️ Want to Become a Donor"
                    : "❤️ রক্তদাতা হতে চাই"}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {isDonor
                    ? locale === "en"
                      ? "Manage availability and last donation date"
                      : "প্রাপ্যতা ও শেষ রক্তদানের তথ্য নিয়ন্ত্রণ করুন"
                    : locale === "en"
                    ? "Join voluntary lifesavers across Bangladesh"
                    : "স্বেচ্ছাসেবী হিসেবে নিবন্ধন করে জীবন বাঁচান"}
                </div>
              </div>
            </div>
            <ChevronRight className="size-5 text-muted-foreground group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all shrink-0" />
          </button>

          {/* Action 3: Request Blood */}
          <button
            type="button"
            onClick={() => onNavigateAction(createRequestHref, "journey_request_blood")}
            className="w-full text-left p-3.5 sm:p-4 rounded-2xl border border-destructive/20 bg-destructive/[0.03] hover:bg-destructive/[0.08] hover:border-destructive/40 transition-all flex items-center justify-between gap-3 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-10 rounded-xl bg-destructive text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <PlusCircle className="size-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-foreground">
                  {locale === "en" ? "🚨 Request Blood Urgently" : "🚨 রক্তের অনুরোধ করতে চাই"}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {locale === "en"
                    ? "Publish an emergency patient requisition"
                    : "জরুরি প্রয়োজনে রক্ত চেয়ে রিকোয়েস্ট তৈরি করুন"}
                </div>
              </div>
            </div>
            <ChevronRight className="size-5 text-muted-foreground group-hover:text-destructive group-hover:translate-x-0.5 transition-all shrink-0" />
          </button>
        </div>

        {/* Secondary Dismiss */}
        <div className="pt-2 text-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onComplete}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {locale === "en" ? "Maybe Later (Close)" : "পরে করব (বন্ধ করুন)"}
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
