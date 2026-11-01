"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Database,
  Smartphone,
  UserX,
  Calendar,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  BellRing,
} from "lucide-react";

import { InnerPageHero } from "@/components/shared/inner-page-hero";
import { Card } from "@/components/ui/card";
import type { Locale } from "@/i18n/config";

interface PrivacyPolicyViewProps {
  locale: Locale;
}

export function PrivacyPolicyView({ locale }: PrivacyPolicyViewProps) {
  const isEn = locale === "en";
  const termsHref = isEn ? "/en/terms" : "/terms";

  const sections = isEn
    ? [
        { id: "intro", label: "1. Privacy Commitment" },
        { id: "data-collected", label: "2. Information We Collect" },
        { id: "data-not-collected", label: "3. What We Never Collect" },
        { id: "data-usage", label: "4. How We Use Information" },
        { id: "donor-privacy", label: "5. Donor Phone Privacy System" },
        { id: "request-visibility", label: "6. Blood Request Public Details" },
        { id: "third-parties", label: "7. Third-Party Services" },
        { id: "security", label: "8. Data Security Measures" },
        { id: "retention-deletion", label: "9. Retention & Account Deletion" },
        { id: "user-rights", label: "10. User Rights & Choices" },
        { id: "children", label: "11. Children's Privacy" },
        { id: "policy-changes", label: "12. Changes to This Policy" },
        { id: "contact", label: "13. Contact & Inquiries" },
      ]
    : [
        { id: "intro", label: "১. গোপনীয়তা সংক্রান্ত অঙ্গীকার" },
        { id: "data-collected", label: "২. সংগৃহীত তথ্যাবলী" },
        { id: "data-not-collected", label: "৩. যা আমরা কখনই সংগ্রহ করি না" },
        { id: "data-usage", label: "৪. তথ্যের ব্যবহার ও উদ্দেশ্য" },
        { id: "donor-privacy", label: "৫. রক্তদাতার ফোন নম্বর সুরক্ষা পদ্ধতি" },
        {
          id: "request-visibility",
          label: "৬. রক্তের অনুরোধে তথ্যের উন্মুক্ততা",
        },
        { id: "third-parties", label: "৭. তৃতীয় পক্ষের সেবা ও প্রযুক্তি" },
        { id: "security", label: "৮. নিরাপত্তা ও ডেটা সংরক্ষণ" },
        {
          id: "retention-deletion",
          label: "৯. ডেটা সংরক্ষণ ও মুছে ফেলার নিয়ম",
        },
        { id: "user-rights", label: "১০. ব্যবহারকারীর অধিকার ও নিয়ন্ত্রণ" },
        { id: "children", label: "১১. অপ্রাপ্তবয়স্কদের তথ্যের সুরক্ষা" },
        { id: "policy-changes", label: "১২. গোপনীয়তা নীতির পরিমার্জন" },
        { id: "contact", label: "১৩. যোগাযোগ ও তথ্যের অনুসন্ধান" },
      ];

  return (
    <div className="flex-1 bg-background text-foreground">
      {/* Hero Header */}
      <InnerPageHero
        badge={isEn ? "Data Protection & Privacy" : "তথ্য সুরক্ষা ও গোপনীয়তা"}
        badgeIcon={ShieldCheck}
        title={isEn ? "Privacy Policy" : "গোপনীয়তা নীতি"}
        description={
          isEn
            ? "Your privacy and trust are our highest priorities. Learn transparently how RoktoBondhu collects, safeguards, and handles your information."
            : "আপনার তথ্যের গোপনীয়তা ও আস্থা রক্ষা আমাদের সর্বোচ্চ অগ্রাধিকার। রক্তবন্ধু প্ল্যাটফর্মে আপনার তথ্য কীভাবে সংরক্ষিত, ব্যবহৃত ও সুরক্ষিত থাকে তা স্বচ্ছভাবে জানুন।"
        }
      >
        <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-muted-foreground">
          <div className="inline-flex items-center gap-2 bg-surface px-3 py-1.5 rounded-xl border border-border/80">
            <Calendar className="size-3.5 text-primary" aria-hidden="true" />
            <span>
              {isEn
                ? "Effective & Last Updated: November 1, 2026"
                : "সর্বশেষ পরিমার্জন ও কার্যকারিতা: ১ নভেম্বর ২০২৬"}
            </span>
          </div>

          <div className="inline-flex items-center gap-2 bg-surface px-3 py-1.5 rounded-xl border border-border/80">
            <Lock
              className="size-3.5 text-emerald-600 dark:text-emerald-400"
              aria-hidden="true"
            />
            <span>
              {isEn
                ? "Zero Ad Trackers • No Data Selling"
                : "কোনো ট্র্যাকিং বিজ্ঞাপন নেই • বাণিজ্যিক তথ্য বিক্রি নিষিদ্ধ"}
            </span>
          </div>
        </div>
      </InnerPageHero>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Sticky Table of Contents (Desktop Sidebar) */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-24 space-y-4">
            <Card className="rounded-3xl border border-border/80 bg-surface/90 backdrop-blur-xs p-5 shadow-xs">
              <h2 className="text-sm font-black uppercase tracking-wider text-foreground mb-3 flex items-center gap-2">
                <ShieldCheck
                  className="size-4 text-primary"
                  aria-hidden="true"
                />
                <span>{isEn ? "Policy Navigation" : "সূচিপত্র"}</span>
              </h2>
              <nav
                aria-label={
                  isEn
                    ? "Privacy Policy Table of Contents"
                    : "গোপনীয়তা নীতি সূচিপত্র"
                }
              >
                <ul className="space-y-1 text-xs">
                  {sections.map((sec) => (
                    <li key={sec.id}>
                      <a
                        href={`#${sec.id}`}
                        className="flex items-center gap-2 text-muted-foreground hover:text-primary hover:bg-primary/5 py-1.5 px-2.5 rounded-lg transition-colors font-medium"
                      >
                        <ChevronRight
                          className="size-3 text-muted-foreground/60 shrink-0"
                          aria-hidden="true"
                        />
                        <span className="truncate">{sec.label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="border-t border-border/70 pt-4 mt-4 space-y-2">
                <Link
                  href={termsHref}
                  className="flex items-center justify-between text-xs font-bold text-primary hover:underline underline-offset-4"
                >
                  <span>
                    {isEn
                      ? "Read Terms of Service"
                      : "ব্যবহারের শর্তাবলী পড়ুন"}
                  </span>
                  <ExternalLink className="size-3" aria-hidden="true" />
                </Link>
              </div>
            </Card>
          </aside>

          {/* Legal Document Content (8 cols) */}
          <main className="lg:col-span-8 space-y-10 leading-relaxed text-sm sm:text-base text-foreground/90">
            {/* Core Trust Reassurance Card */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 sm:p-5 flex items-start gap-3.5">
              <Lock
                className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div className="space-y-1 text-xs sm:text-sm">
                <strong className="font-bold text-foreground block">
                  {isEn
                    ? "Our Privacy Guarantee:"
                    : "আমাদের গোপনীয়তার নিশ্চয়তা:"}
                </strong>
                <p className="text-muted-foreground">
                  {isEn
                    ? "RoktoBondhu exists purely to connect blood donors and patients. We will never sell, rent, monetize, or trade your personal data. We do not run third-party advertising or commercial tracking cookies."
                    : "রক্তবন্ধু শুধুমাত্র জরুরি রক্তের প্রয়োজনে নিঃস্বার্থ রক্তদাতা ও গ্রহীতাদের সংযোগের উদ্দেশ্যে তৈরি। আমরা আপনার কোনো ব্যক্তিগত তথ্য তৃতীয় কোনো বাণিজ্যিক প্রতিষ্ঠানের কাছে বিক্রি, ভাড়া বা বিপণনের উদ্দেশ্যে প্রদান করি না। প্ল্যাটফর্মে কোনো বাণিজ্যিক ট্র্যাকিং কুকি ব্যবহার করা হয় না।"}
                </p>
              </div>
            </div>

            {/* Section 1: Intro */}
            <section id="intro" className="space-y-3.5 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight border-b border-border/60 pb-2">
                {isEn
                  ? "1. Privacy Commitment & Scope"
                  : "১. গোপনীয়তা সংক্রান্ত অঙ্গীকার ও পরিধি"}
              </h2>
              <p>
                {isEn
                  ? "This Privacy Policy describes how RoktoBondhu ('রক্তবন্ধু', 'we', 'our') collects, protects, uses, and shares information when you access or use our web platform. We treat all personal information with strict confidentiality and provide granular privacy controls to voluntary donors."
                  : "এই গোপনীয়তা নীতিমালায় ব্যাখ্যা করা হয়েছে যে আপনি যখন রক্তবন্ধু প্ল্যাটফর্ম ব্যবহার করেন, তখন আপনার কোন তথ্যগুলো সংগ্রহ করা হয়, কীভাবে সংরক্ষণ ও সুরক্ষিত রাখা হয় এবং কীভাবে আপনি নিজের তথ্যের ওপর পূর্ণ নিয়ন্ত্রণ বজায় রাখতে পারেন।"}
              </p>
            </section>

            {/* Section 2: Data Collected */}
            <section id="data-collected" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight border-b border-border/60 pb-2">
                {isEn
                  ? "2. Information We Collect"
                  : "২. যেসকল তথ্য আমরা সংগ্রহ করি"}
              </h2>
              <p>
                {isEn
                  ? "RoktoBondhu only collects information that is strictly necessary to deliver emergency blood matching and coordination services:"
                  : "জরুরি রক্ত সমন্বয় ও যোগাযোগের স্বার্থে প্ল্যাটফর্মে শুধুমাত্র প্রয়োজনীয় তথ্য সংগ্রহ করা হয়:"}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <Card className="rounded-2xl border border-border/80 bg-surface/80 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                    <UserX className="size-4" aria-hidden="true" />
                    <span>
                      {isEn
                        ? "Account Registration"
                        : "অ্যাকাউন্ট নিবন্ধন তথ্য"}
                    </span>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                    <li>
                      {isEn
                        ? "Full Name (Display Name)"
                        : "পূর্ণ নাম (ডিসপ্লে নাম)"}
                    </li>
                    <li>{isEn ? "Email Address" : "ইমেইল ঠিকানা"}</li>
                    <li>
                      {isEn
                        ? "Bangladeshi Mobile Number"
                        : "সক্রিয় মোবাইল ফোন নম্বর"}
                    </li>
                    <li>
                      {isEn
                        ? "Password (encrypted by Firebase Auth)"
                        : "পাসওয়ার্ড (ফায়ারবেস দ্বারা এনক্রিপ্টেড)"}
                    </li>
                  </ul>
                </Card>

                <Card className="rounded-2xl border border-border/80 bg-surface/80 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                    <Database className="size-4" aria-hidden="true" />
                    <span>
                      {isEn
                        ? "Donor Profile Details"
                        : "রক্তদাতা প্রোফাইলের তথ্য"}
                    </span>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                    <li>
                      {isEn
                        ? "Blood Group (e.g. A+, O+, etc.)"
                        : "রক্তের গ্রুপ (যেমন: A+, O+ ইত্যাদি)"}
                    </li>
                    <li>
                      {isEn
                        ? "Division, District & Upazila"
                        : "বিভাগ, জেলা ও উপজেলা"}
                    </li>
                    <li>
                      {isEn
                        ? "Optional Local Area string"
                        : "ঐচ্ছিক এলাকা বা মহল্লার নাম"}
                    </li>
                    <li>
                      {isEn
                        ? "Last Donation Date (YYYY-MM-DD)"
                        : "সর্বশেষ রক্তদানের তারিখ"}
                    </li>
                    <li>
                      {isEn
                        ? "Availability Status & Privacy Mode"
                        : "প্রাপ্যতা স্ট্যাটাস ও ফোন নম্বর সুরক্ষার মোড"}
                    </li>
                  </ul>
                </Card>

                <Card className="rounded-2xl border border-border/80 bg-surface/80 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                    <Smartphone className="size-4" aria-hidden="true" />
                    <span>
                      {isEn ? "Blood Requisition Data" : "রক্তের অনুরোধের তথ্য"}
                    </span>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                    <li>
                      {isEn
                        ? "Requester / Contact Person Name"
                        : "অনুরোধকারী বা যোগাযোগের ব্যক্তির নাম"}
                    </li>
                    <li>
                      {isEn
                        ? "Emergency Contact Mobile Number"
                        : "জরুরি যোগাযোগের সচল মোবাইল নম্বর"}
                    </li>
                    <li>
                      {isEn
                        ? "Hospital Name & Location"
                        : "হাসপাতালের নাম ও ঠিকানা"}
                    </li>
                    <li>
                      {isEn
                        ? "Bags Required, Date Needed & Urgency"
                        : "প্রয়োজনীয় রক্তের পরিমাণ, তারিখ ও জরুরি মাত্রা"}
                    </li>
                  </ul>
                </Card>

                <Card className="rounded-2xl border border-border/80 bg-surface/80 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                    <BellRing className="size-4" aria-hidden="true" />
                    <span>
                      {isEn
                        ? "Notifications & Device Tokens"
                        : "নোটিফিকেশন ও ডিভাইস টোকেন"}
                    </span>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                    <li>
                      {isEn
                        ? "FCM Web Push Device Token (for alerts)"
                        : "ব্রাউজার ওয়েব পুশ টোকেন (FCM)"}
                    </li>
                    <li>
                      {isEn
                        ? "In-App Notification Logs"
                        : "ইন-অ্যাপ নোটিফিকেশন রেকর্ড"}
                    </li>
                    <li>
                      {isEn
                        ? "Email preference toggles"
                        : "ইমেইল নোটিফিকেশন গ্রহণের সেটিংস"}
                    </li>
                  </ul>
                </Card>
              </div>
            </section>

            {/* Section 3: What We Never Collect */}
            <section
              id="data-not-collected"
              className="space-y-3.5 scroll-mt-24"
            >
              <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight border-b border-border/60 pb-2">
                {isEn
                  ? "3. What We NEVER Collect"
                  : "৩. যা আমরা কখনই সংগ্রহ করি না"}
              </h2>
              <p>
                {isEn
                  ? "To preserve your utmost privacy, RoktoBondhu intentionally avoids collecting unnecessary personal data:"
                  : "ব্যবহারকারীদের তথ্য নিরাপদ রাখতে রক্তবন্ধু অপ্রয়োজনীয় কোনো ব্যক্তিগত ডেটা সংগ্রহ থেকে সম্পূর্ণ বিরত থাকে:"}
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground text-xs sm:text-sm marker:text-emerald-600">
                <li>
                  {isEn
                    ? "National ID (NID), Passport, or Birth Certificate numbers"
                    : "জাতীয় পরিচয়পত্র (NID), পাসপোর্ট বা জন্মনিবন্ধন নম্বর"}
                </li>
                <li>
                  {isEn
                    ? "Financial information, credit/debit card numbers, or mobile banking PINs"
                    : "ব্যাংক অ্যাকাউন্ট, ক্রেডিট বা ডেবিট কার্ড, অথবা বিকাশ/নগদ পিন নম্বর"}
                </li>
                <li>
                  {isEn
                    ? "Detailed medical histories, prescription copies, or diagnostic reports"
                    : "ব্যক্তিগত গোপন প্রেসক্রিপশন বা পূর্ণাঙ্গ ডায়াগনস্টিক রিপোর্ট"}
                </li>
                <li>
                  {isEn
                    ? "Third-party advertising cookies or cross-site tracking fingerprints"
                    : "তৃতীয় পক্ষের বিজ্ঞাপনী ট্র্যাকিং কুকি বা ব্যবহারকারী ট্র্যাকিং প্রযুক্তি"}
                </li>
              </ul>
            </section>

            {/* Section 4: Data Usage */}
            <section id="data-usage" className="space-y-3.5 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight border-b border-border/60 pb-2">
                {isEn
                  ? "4. How We Use Collected Information"
                  : "৪. তথ্যের ব্যবহার ও উদ্দেশ্য"}
              </h2>
              <p>
                {isEn
                  ? "Your data is used solely for the following humanitarian and platform operational purposes:"
                  : "সংগৃহীত তথ্য শুধুমাত্র নিম্নলিখিত মানবিক ও প্ল্যাটফর্ম পরিচালন কাজের জন্য ব্যবহৃত হয়:"}
              </p>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground text-xs sm:text-sm marker:text-primary">
                <li>
                  <strong className="text-foreground">
                    {isEn
                      ? "Emergency Donor Matching: "
                      : "উপযুক্ত রক্তদাতা খুঁজে দেওয়া: "}
                  </strong>
                  {isEn
                    ? "Matching patient requisitions with registered donors based on blood group compatibility and administrative geographic proximity (Upazila, District, Division)."
                    : "রোগীর রক্তের গ্রুপ এবং প্রশাসনিক ভৌগোলিক দূরত্বের (উপজেলা, জেলা ও বিভাগ) ওপর ভিত্তি করে উপযুক্ত স্বেচ্ছাসেবী রক্তদাতাদের খুঁজে বের করা।"}
                </li>
                <li>
                  <strong className="text-foreground">
                    {isEn
                      ? "Transactional Notifications: "
                      : "জরুরি অ্যালার্ট ও নোটিফিকেশন প্রেরণ: "}
                  </strong>
                  {isEn
                    ? "Dispatching real-time notifications via in-app alerts, browser web push, and transactional emails when blood is urgently needed or when a contact request is made."
                    : "রক্তের জরুরি চাহিদা তৈরি হলে বা যোগাযোগের অনুরোধ এলে রক্তদাতা ও অনুরোধকারীকে ইন-অ্যাপ, ওয়েব পুশ ও ইমেইলের মাধ্যমে অবহিত করা।"}
                </li>
                <li>
                  <strong className="text-foreground">
                    {isEn
                      ? "Platform Integrity & Security: "
                      : "অ্যাকাউন্টের সত্যতা ও অপব্যবহার রোধ: "}
                  </strong>
                  {isEn
                    ? "Preventing duplicate registrations, mitigating spam, authenticating login sessions, and moderating reported fake or fraudulent requests."
                    : "ভুয়া অনুরোধ প্রতিরোধ, স্প্যাম দূরীকরণ, লগইন সেশন ব্যবস্থাপনা এবং রিপোর্টের ভিত্তিতে সন্দেহজনক অ্যাকাউন্ট অডিট করা।"}
                </li>
              </ul>
            </section>

            {/* Section 5: Donor Privacy System */}
            <section id="donor-privacy" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight border-b border-border/60 pb-2">
                {isEn
                  ? "5. Voluntary Donor Phone Privacy Architecture"
                  : "৫. রক্তদাতার ফোন নম্বর সুরক্ষা ও গোপনীয়তা পদ্ধতি"}
              </h2>
              <p>
                {isEn
                  ? "RoktoBondhu implements a multi-tier privacy architecture allowing donors to control exactly how and when their phone number is shared:"
                  : "রক্তবন্ধু রক্তদাতাদের ফোন নম্বরের সুরক্ষায় একটি দুই স্তরের আধুনিক ডেটা আর্কিটেকচার বাস্তবায়ন করেছে:"}
              </p>

              <div className="space-y-3">
                <Card className="rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <EyeOff
                      className="size-5 text-primary shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <div className="space-y-1.5 text-xs sm:text-sm">
                      <strong className="font-bold text-foreground block text-sm">
                        {isEn
                          ? "Private Mode (Default Protection - Highly Recommended)"
                          : "প্রাইভেট মোড (সংরক্ষিত গোপনীয়তা — সর্বাধিক নিরাপদ)"}
                      </strong>
                      <p className="text-muted-foreground leading-relaxed">
                        {isEn
                          ? "In Private Mode, your phone number is NEVER published to the open search database. In public search results, only your name, blood group, area, and availability status appear. Your phone number is strictly deleted from the public document."
                          : "প্রাইভেট মোডে আপনার মোবাইল নম্বর কোনো উন্মুক্ত সার্চ তালিকায় প্রকাশিত হয় না। সার্চ ফলাফলে শুধুমাত্র আপনার নাম, রক্তের গ্রুপ, এলাকা ও প্রাপ্যতা স্ট্যাটাস প্রদর্শিত হয়। পাবলিক ডেটাবেজ থেকে নম্বরটি সম্পূর্ণভাবে বাদ রাখা হয়।"}
                      </p>
                      <div className="pt-2 border-t border-primary/10 space-y-1 text-muted-foreground">
                        <strong className="text-foreground block font-semibold">
                          {isEn
                            ? "Two-Step Explicit Consent Workflow:"
                            : "দ্বি-স্তরীয় সুস্পষ্ট সম্মতি পদ্ধতি:"}
                        </strong>
                        <ol className="list-decimal pl-4 space-y-1 text-xs">
                          <li>
                            {isEn
                              ? "An authenticated requester must submit a formal 1-to-1 Contact Request with hospital and patient details."
                              : "অনুরোধকারীকে অবশ্যই প্ল্যাটফর্মে লগইন করে হাসপাতালের বিবরণ দিয়ে 'যোগাযোগ অনুরোধ' পাঠাতে হয়।"}
                          </li>
                          <li>
                            {isEn
                              ? "You receive a notification and can review the request on your dashboard."
                              : "রক্তদাতা তার ড্যাশবোর্ডে অনুরোধটি পর্যালোচনা করে গ্রহণ (Accept) করতে পারেন।"}
                          </li>
                          <li>
                            {isEn
                              ? "Accepting the request DOES NOT reveal your phone number. You must perform a separate second step ('Share Phone Number') confirming a dedicated consent modal."
                              : "অনুরোধ গ্রহণ করলেও নম্বর স্বয়ংক্রিয়ভাবে প্রকাশ পায় না। রক্তদাতাকে দ্বিতীয় ধাপে আলাদাভাবে 'ফোন নম্বর শেয়ার করুন' বাটনে ক্লিক করে ডায়ালগ কনফার্ম করতে হয়।"}
                          </li>
                          <li>
                            {isEn
                              ? "Only after your explicit second confirmation is your phone revealed exclusively to that specific verified requester."
                              : "এই সুস্পষ্ট সম্মতির পরই শুধুমাত্র সেই নির্দিষ্ট অনুরোধকারীর ড্যাশবোর্ডে রক্তদাতার মোবাইল নম্বর দৃশ্যমান হয়।"}
                          </li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="rounded-2xl border border-border/80 bg-surface/80 p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <Eye
                      className="size-5 text-muted-foreground shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <div className="space-y-1.5 text-xs sm:text-sm">
                      <strong className="font-bold text-foreground block text-sm">
                        {isEn
                          ? "Public Mode (Direct Calling)"
                          : "পাবলিক মোড (সরাসরি কল)"}
                      </strong>
                      <p className="text-muted-foreground leading-relaxed">
                        {isEn
                          ? "If you explicitly choose Public Mode, your phone number is synced to the public directory with a direct 'Call Now' (tel:) button so families facing critical emergencies can reach you without delay. You can switch back to Private Mode at any time from your account settings."
                          : "যদি রক্তদাতা নিজেই পাবলিক মোড নির্বাচন করেন, তবে অতি জরুরি রোগীদের দ্রুত সহায়তার স্বার্থে তার কার্ডে 'সরাসরি কল' বাটন থাকে। রক্তদাতা যেকোনো সময় অ্যাকাউন্ট প্রোফাইল থেকে পুনরায় প্রাইভেট মোডে ফিরে যেতে পারেন।"}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </section>

            {/* Section 6: Request Public Details */}
            <section
              id="request-visibility"
              className="space-y-3.5 scroll-mt-24"
            >
              <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight border-b border-border/60 pb-2">
                {isEn
                  ? "6. Public Visibility of Emergency Blood Requests"
                  : "৬. রক্তের অনুরোধে তথ্যের উন্মুক্ততা"}
              </h2>
              <p>
                {isEn
                  ? "Because emergency blood requisitions represent urgent humanitarian calls for help, the following details posted by a requester are publicly accessible:"
                  : "জরুরি রক্তের আবেদনগুলো জীবন বাঁচানোর জরুরি ডাক হওয়ায়, অনুরোধকারীর দাখিল করা নিচের তথ্যগুলো উন্মুক্ত থাকে:"}
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground text-xs sm:text-sm marker:text-primary">
                <li>
                  {isEn
                    ? "Required Blood Group and number of units needed"
                    : "প্রয়োজনীয় রক্তের গ্রুপ এবং ব্যাগের পরিমাণ"}
                </li>
                <li>
                  {isEn
                    ? "Hospital or clinic name, district, and upazila"
                    : "হাসপাতাল বা ক্লিনিকের নাম এবং জেলা/উপজেলা"}
                </li>
                <li>
                  {isEn
                    ? "Date and time by which the blood is required"
                    : "যে তারিখ ও সময়ের মধ্যে রক্ত প্রয়োজন"}
                </li>
                <li>
                  {isEn
                    ? "Contact person name and phone number (so volunteer donors can call immediately)"
                    : "অনুরোধকারীর নাম এবং যোগাযোগের মোবাইল নম্বর (যাতে ইচ্ছুক রক্তদাতারা সরাসরি কল করতে পারেন)"}
                </li>
              </ul>
              <p className="text-xs text-muted-foreground">
                {isEn
                  ? "Requesters should only provide contact numbers that they are authorized and willing to answer for blood coordination."
                  : "অনুরোধকারীকে শুধুমাত্র এমন নম্বর দিতে অনুরোধ করা হয় যা রক্ত সমন্বয়ের জন্য প্রকাশ্যে রিসিভ করতে তিনি সম্মত আছেন।"}
              </p>
            </section>

            {/* Section 7: Third-Party Services */}
            <section id="third-parties" className="space-y-3.5 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight border-b border-border/60 pb-2">
                {isEn
                  ? "7. Third-Party Infrastructure & Service Providers"
                  : "৭. তৃতীয় পক্ষের সেবা ও প্রযুক্তি অবকাঠামো"}
              </h2>
              <p>
                {isEn
                  ? "RoktoBondhu operates using secure, industry-standard cloud infrastructure partners:"
                  : "রক্তবন্ধু বিশ্বস্ত ও মানসম্পন্ন ক্লাউড অবকাঠামো ব্যবহার করে পরিচালিত হয়:"}
              </p>

              <div className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
                <div className="p-3.5 rounded-xl border border-border/80 bg-surface/70">
                  <strong className="text-foreground font-bold">
                    {isEn
                      ? "Google Firebase (Authentication & Cloud Firestore): "
                      : "গুগল ফায়ারবেস (অথেনটিকেশন ও ক্লাউড ফায়ারস্টোর): "}
                  </strong>
                  {isEn
                    ? "Manages secure user login, password hashing, and encrypted database storage adhering to Google Cloud's enterprise security protocols."
                    : "ব্যবহারকারীর নিরাপদ অ্যাকাউন্ট অথেনটিকেশন, পাসওয়ার্ড হ্যাশিং এবং এনক্রিপ্টেড ডাটাবেজ সংরক্ষণের দায়িত্ব পালন করে।"}
                </div>

                <div className="p-3.5 rounded-xl border border-border/80 bg-surface/70">
                  <strong className="text-foreground font-bold">
                    {isEn
                      ? "Firebase Cloud Messaging (FCM Web Push): "
                      : "ফায়ারবেস ক্লাউড মেসেজিং (FCM ওয়েব পুশ): "}
                  </strong>
                  {isEn
                    ? "Delivers instant browser push notifications for emergency blood alerts to opted-in users."
                    : "সম্মতি প্রদানকারী ব্যবহারকারীদের ব্রাউজারে জরুরি রক্তের অ্যালার্ট পৌঁছে দিতে ওয়েব পুশ টোকেন ব্যবহার করে।"}
                </div>

                <div className="p-3.5 rounded-xl border border-border/80 bg-surface/70">
                  <strong className="text-foreground font-bold">
                    {isEn
                      ? "Resend (Transactional Emails): "
                      : "রিসেন্ড (ট্রানজ্যাকশনাল ইমেইল): "}
                  </strong>
                  {isEn
                    ? "Delivers account verification emails, password resets, and critical blood match alerts securely over REST API."
                    : "ইমেইল ভেরিফিকেশন, পাসওয়ার্ড রিসেট এবং জরুরি যোগাযোগের ইমেইল বিজ্ঞপ্তি সফলভাবে বিতরণের জন্য ব্যবহৃত হয়।"}
                </div>

                <div className="p-3.5 rounded-xl border border-border/80 bg-surface/70">
                  <strong className="text-foreground font-bold">
                    {isEn
                      ? "Vercel Analytics & Speed Insights: "
                      : "ভার্সেল অ্যানালিটিক্স ও স্পিড ইনসাইটস: "}
                  </strong>
                  {isEn
                    ? "Provides privacy-preserving, cookieless aggregate metrics on page loading speed and Core Web Vitals performance without tracking individual users."
                    : "কোনো ব্যক্তিগত ট্র্যাকিং ছাড়াই প্ল্যাটফর্মের লোডিং স্পিড ও প্রযুক্তিগত পারফরম্যান্স পরিমাপের জন্য কুকিমুক্ত অ্যানালিটিক্স ব্যবহার করে।"}
                </div>
              </div>
            </section>

            {/* Section 8: Security */}
            <section id="security" className="space-y-3.5 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight border-b border-border/60 pb-2">
                {isEn
                  ? "8. Data Security & Storage Standards"
                  : "৮. নিরাপত্তা ও ডেটা সংরক্ষণ ব্যবস্থা"}
              </h2>
              <p>
                {isEn
                  ? "We implement robust security controls to protect your data against unauthorized access, loss, or disclosure:"
                  : "আপনার তথ্যের অননুমোদিত অ্যাক্সেস, পরিবর্তন বা বিনষ্ট রোধে আমরা সুনির্দিষ্ট নিরাপত্তা ব্যবস্থা গ্রহণ করেছি:"}
              </p>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground text-xs sm:text-sm marker:text-primary">
                <li>
                  <strong className="text-foreground">
                    {isEn
                      ? "Server-Side Firestore Rules: "
                      : "সার্ভার-সাইড ফায়ারস্টোর রুলস: "}
                  </strong>
                  {isEn
                    ? "Access to private documents (user accounts, private donor records, and 1-to-1 contact requests) is enforced strictly on the database level via rule checks verifying user authentication and ownership."
                    : "ব্যক্তিগত প্রোফাইল ও যোগাযোগের অনুরোধ শুধুমাত্র সংশ্লিষ্ট ব্যবহারকারী বা অনুমোদিত অ্যাডমিনের জন্য সুরক্ষিত রাখতে ক্লাউড ডাটাবেজ স্তরে কঠোর ফায়ারস্টোর সিকিউরিটি রুলস বলবৎ রয়েছে।"}
                </li>
                <li>
                  <strong className="text-foreground">
                    {isEn
                      ? "HTTPS Encryption in Transit: "
                      : "ট্রানজিটে পূর্ণ এনক্রিপশন (HTTPS): "}
                  </strong>
                  {isEn
                    ? "All network traffic between your web browser and the platform is encrypted using modern TLS/HTTPS."
                    : "আপনার ব্রাউজার এবং রক্তবন্ধুর সার্ভারের মধ্যকার সকল তথ্য আদান-প্রদান আধুনিক TLS/HTTPS এনক্রিপশনের মাধ্যমে সম্পাদিত হয়।"}
                </li>
              </ul>
              <Card className="rounded-2xl border border-border/80 bg-surface/80 p-4 text-xs text-muted-foreground">
                <p>
                  <strong className="text-foreground font-semibold">
                    {isEn
                      ? "Realistic Technical Disclosure: "
                      : "বাস্তবসম্মত প্রযুক্তিগত ঘোষণা: "}
                  </strong>
                  {isEn
                    ? "While we employ stringent technical safeguards and best engineering practices, no method of transmission or digital storage over the internet can be guaranteed as 100% impenetrable. Users should practice good account hygiene by using strong, unique passwords."
                    : "ইন্টারনেটের মাধ্যমে তথ্য প্রেরণে কঠোর প্রযুক্তিগত সতর্কতা সত্ত্বেও শতভাগ শতভাগ ঝুঁকিহীনতার পরম গ্যারান্টি কোনো প্রযুক্তি সিস্টেম দিতে পারে না। ব্যবহারকারীকেও শক্তিশালী ও ইউনিক পাসওয়ার্ড ব্যবহারের মাধ্যমে অ্যাকাউন্টের নিরাপত্তা নিশ্চিতের অনুরোধ করা হয়।"}
                </p>
              </Card>
            </section>

            {/* Section 9: Retention & Deletion */}
            <section
              id="retention-deletion"
              className="space-y-3.5 scroll-mt-24"
            >
              <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight border-b border-border/60 pb-2">
                {isEn
                  ? "9. Data Retention & Account Deletion"
                  : "৯. ডেটা সংরক্ষণ ও মুছে ফেলার নিয়ম"}
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground text-xs sm:text-sm marker:text-primary">
                <li>
                  <strong className="text-foreground">
                    {isEn
                      ? "Profile Management: "
                      : "প্রোফাইল পরিচালনা ও সংশোধন: "}
                  </strong>
                  {isEn
                    ? "You can view and modify your display name, mobile phone number, location, blood group, last donation date, and notification preferences at any time from your account settings (/account)."
                    : "ব্যবহারকারী যেকোনো সময় নিজের অ্যাকাউন্ট ড্যাশবোর্ড (/account) থেকে নাম, ফোন নম্বর, এলাকা, রক্তের গ্রুপ ও নোটিফিকেশন সেটিংস আপডেট বা পরিবর্তন করতে পারেন।"}
                </li>
                <li>
                  <strong className="text-foreground">
                    {isEn
                      ? "Deactivating Donor Availability: "
                      : "রক্তদানে সাময়িক বিরতি: "}
                  </strong>
                  {isEn
                    ? "If you do not wish to receive donation calls, simply change your status to 'Unavailable' or switch your phone mode to 'Private'."
                    : "রক্তদানে সাময়িক বিরতি নিতে চাইলে প্রোফাইলের স্ট্যাটাস 'বর্তমানে অনুপলব্ধ' করতে পারেন বা ফোন নম্বর 'প্রাইভেট' করে রাখতে পারেন।"}
                </li>
                <li>
                  <strong className="text-foreground">
                    {isEn
                      ? "Permanent Account Deletion: "
                      : "অ্যাকাউন্ট স্থায়ীভাবে মুছে ফেলা: "}
                  </strong>
                  {isEn
                    ? "If you wish to completely remove your account, profile, and donor data from RoktoBondhu, email us at taj.unicart@gmail.com from your registered email. Administrators will permanently delete your user and donor documents upon verification."
                    : "আপনি যদি রক্তবন্ধু থেকে আপনার অ্যাকাউন্ট ও যাবতীয় ব্যক্তিগত তথ্য স্থায়ীভাবে মুছে ফেলতে চান, তবে আপনার নিবন্ধিত ইমেইল থেকে taj.unicart@gmail.com-এ অনুরোধ পাঠাতে পারেন। যাচাই সাপেক্ষে অ্যাডমিন দল আপনার অ্যাকাউন্ট সম্পূর্ণ মুছে ফেলবে।"}
                </li>
              </ul>
            </section>

            {/* Section 10: User Rights */}
            <section id="user-rights" className="space-y-3.5 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight border-b border-border/60 pb-2">
                {isEn
                  ? "10. User Rights & Privacy Controls"
                  : "১০. ব্যবহারকারীর অধিকার ও নিয়ন্ত্রণ"}
              </h2>
              <p>
                {isEn
                  ? "As a user of RoktoBondhu, you have the right to:"
                  : "রক্তবন্ধু প্ল্যাটফর্মের ব্যবহারকারী হিসেবে আপনার নিম্নলিখিত অধিকারগুলো রয়েছে:"}
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground text-xs sm:text-sm marker:text-primary">
                <li>
                  {isEn
                    ? "Access your personal and donor profile information at any time"
                    : "যেকোনো সময় নিজের ব্যক্তিগত ও রক্তদাতা তথ্য দেখার অধিকার"}
                </li>
                <li>
                  {isEn
                    ? "Correct inaccuracies in your contact numbers, location, or donation records"
                    : "ফোন নম্বর, অবস্থান বা রক্তদানের তথ্যের যেকোনো ভুল সংশোধন করার অধিকার"}
                </li>
                <li>
                  {isEn
                    ? "Keep your phone number private and protected behind two-step consent"
                    : "দ্বি-স্তরীয় সম্মতির আড়ালে নিজের ফোন নম্বর সম্পূর্ণ গোপন রাখার অধিকার"}
                </li>
                <li>
                  {isEn
                    ? "Toggle email alerts on or off in your profile settings"
                    : "ইমেইল নোটিফিকেশন চালু বা বন্ধ রাখার স্বাধীনতা"}
                </li>
              </ul>
            </section>

            {/* Section 11: Children */}
            <section id="children" className="space-y-3.5 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight border-b border-border/60 pb-2">
                {isEn
                  ? "11. Children's Privacy Considerations"
                  : "১১. অপ্রাপ্তবয়স্কদের তথ্যের সুরক্ষা"}
              </h2>
              <p>
                {isEn
                  ? "RoktoBondhu is designed for adult volunteers and families managing patient care. We do not knowingly collect personal information from children under 13. Minors requiring blood must have their emergency requisitions submitted and coordinated by a parent or legal adult guardian."
                  : "রক্তবন্ধু প্রাপ্তবয়স্ক স্বেচ্ছাসেবী এবং রোগীদের পরিবারবর্গের ব্যবহারের জন্য তৈরি। আমরা জেনেশুনে ১৩ বছরের কম বয়সী শিশুদের ব্যক্তিগত তথ্য সংগ্রহ করি না। কোনো অপ্রাপ্তবয়স্ক রোগীর রক্তের প্রয়োজনে তার পিতা-মাতা বা প্রাপ্তবয়স্ক বৈধ অভিভাবকের মাধ্যমে রক্তের অনুরোধ দাখিল করতে হবে।"}
              </p>
            </section>

            {/* Section 12: Changes */}
            <section id="policy-changes" className="space-y-3.5 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight border-b border-border/60 pb-2">
                {isEn
                  ? "12. Updates to This Privacy Policy"
                  : "১২. গোপনীয়তা নীতির পরিমার্জন"}
              </h2>
              <p>
                {isEn
                  ? "We may update this Privacy Policy from time to time to adapt to new regulatory guidance or platform improvements. When changes occur, the updated policy will be published on this page with a revised 'Last Updated' date. We encourage users to periodically check this page."
                  : "প্রযুক্তিগত উন্নয়ন বা আইনি নীতিমালার পরিবর্তনের সাথে সামঞ্জস্য রেখে এই গোপনীয়তা নীতি সময়ে সময়ে পরিমার্জিত হতে পারে। যেকোনো পরিবর্তনের ক্ষেত্রে এই পাতায় 'সর্বশেষ হালনাগাদ' তারিখসহ তা প্রকাশিত হবে।"}
              </p>
            </section>

            {/* Section 13: Contact */}
            <section id="contact" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight border-b border-border/60 pb-2">
                {isEn
                  ? "13. Contact Information & Privacy Inquiries"
                  : "১৩. যোগাযোগ ও তথ্যের অনুসন্ধান"}
              </h2>
              <p>
                {isEn
                  ? "If you have any questions, concerns, or requests regarding this Privacy Policy or your personal information, please reach out to us:"
                  : "এই গোপনীয়তা নীতি বা আপনার ব্যক্তিগত তথ্যের ব্যবস্থাপনা সংক্রান্ত যেকোনো প্রশ্ন, মতামত বা অনুরোধের জন্য আমাদের সাথে যোগাযোগ করতে পারেন:"}
              </p>

              <Card className="rounded-2xl border border-border/80 bg-surface/90 p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <HelpCircle className="size-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">
                      {isEn
                        ? "RoktoBondhu Privacy & Data Desk"
                        : "রক্তবন্ধু ডেটা ও গোপনীয়তা বিভাগ"}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {isEn
                        ? "Email: taj.unicart@gmail.com"
                        : "ইমেইল: taj.unicart@gmail.com"}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed pt-1 border-t border-border/60">
                  {isEn
                    ? "In-App Reports: Users can also use the 'Report' button on any profile or request card to alert the moderation team about privacy or misuse concerns."
                    : "ইন-অ্যাপ অপশন: কোনো ব্যবহারকারীর তথ্যের অসঙ্গতি বা অপব্যবহারের বিষয়ে তাৎক্ষণিকভাবে অ্যাডমিনদের সতর্ক করতে প্রতিটি কার্ডে থাকা 'রিপোর্ট' অপশন ব্যবহার করতে পারেন।"}
                </p>
              </Card>
            </section>

            {/* Footer Navigation within Document */}
            <div className="border-t border-border/80 pt-6 mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link
                href={termsHref}
                className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline underline-offset-4"
              >
                <span>
                  {isEn ? "View Terms of Service" : "ব্যবহারের শর্তাবলী দেখুন"}
                </span>
                <ChevronRight className="size-3.5" aria-hidden="true" />
              </Link>

              <div className="text-xs text-muted-foreground text-center sm:text-right">
                <span>
                  {isEn
                    ? "RoktoBondhu Humanitarian Network"
                    : "রক্তবন্ধু মানবিক প্ল্যাটফর্ম"}
                </span>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
