"use client";

import * as React from "react";
import Link from "next/link";
import {
  FileText,
  ShieldAlert,
  CheckCircle2,
  Stethoscope,
  Scale,
  ChevronRight,
  ExternalLink,
  Ban,
  HelpCircle,
  Calendar,
} from "lucide-react";

import { InnerPageHero } from "@/components/shared/inner-page-hero";
import { Card } from "@/components/ui/card";
import type { Locale } from "@/i18n/config";

interface TermsViewProps {
  locale: Locale;
}

export function TermsView({ locale }: TermsViewProps) {
  const isEn = locale === "en";
  const privacyHref = isEn ? "/en/privacy-policy" : "/privacy-policy";

  const sections = isEn
    ? [
        { id: "overview", label: "1. Service Overview" },
        { id: "eligibility", label: "2. Eligibility & Account Security" },
        { id: "donor-rules", label: "3. Donor Responsibilities" },
        { id: "request-rules", label: "4. Blood Request Responsibilities" },
        { id: "communication", label: "5. Communication & Conduct" },
        { id: "medical-disclaimer", label: "6. Critical Medical Disclaimer" },
        { id: "no-commercial", label: "7. Zero Commercialization" },
        { id: "prohibited", label: "8. Prohibited Activities" },
        { id: "moderation", label: "9. Content & Moderation" },
        { id: "availability", label: "10. Service Availability" },
        { id: "liability", label: "11. Limitation of Liability" },
        { id: "termination", label: "12. Account Suspension" },
        { id: "changes", label: "13. Changes to Terms" },
        { id: "contact", label: "14. Contact & Support" },
      ]
    : [
        { id: "overview", label: "১. প্ল্যাটফর্মের রূপরেখা ও ভূমিকা" },
        {
          id: "eligibility",
          label: "২. ব্যবহারকারীর যোগ্যতা ও অ্যাকাউন্ট সুরক্ষা",
        },
        { id: "donor-rules", label: "৩. স্বেচ্ছাসেবী রক্তদাতার দায়িত্ব" },
        { id: "request-rules", label: "৪. রক্তের অনুরোধকারীর দায়িত্ব" },
        { id: "communication", label: "৫. যোগাযোগ ও শালীন আচরণবিধি" },
        {
          id: "medical-disclaimer",
          label: "৬. চিকিৎসা সংক্রান্ত সতর্কতা ও দায়মুক্তি",
        },
        {
          id: "no-commercial",
          label: "৭. অবাণিজ্যিক নীতি ও অর্থ লেনদেন নিষেধ",
        },
        { id: "prohibited", label: "৮. নিষিদ্ধ কার্যক্রম ও অপব্যবহার রোধ" },
        { id: "moderation", label: "৯. তথ্যের দায় ও মডারেশন" },
        { id: "availability", label: "১০. সেবার প্রাপ্যতা ও সীমাবদ্ধতা" },
        { id: "liability", label: "১১. দায়বদ্ধতার সীমাবদ্ধতা" },
        { id: "termination", label: "১২. অ্যাকাউন্ট স্থগিতকরণ ও বাতিল" },
        { id: "changes", label: "১৩. শর্তাবলীর পরিবর্তন" },
        { id: "contact", label: "১৪. যোগাযোগ ও অভিযোগ" },
      ];

  return (
    <div className="flex-1 bg-background text-foreground">
      {/* Hero Header */}
      <InnerPageHero
        badge={isEn ? "Legal Agreement" : "ব্যবহারের আইনি নীতিমালা"}
        badgeIcon={Scale}
        title={isEn ? "Terms of Service" : "ব্যবহারের শর্তাবলী"}
        description={
          isEn
            ? "Please review these Terms carefully before using the RoktoBondhu platform. By registering or using the platform, you acknowledge and agree to these guidelines."
            : "রক্তবন্ধু প্ল্যাটফর্ম ব্যবহার বা নিবন্ধনের পূর্বে ব্যবহারের শর্তাবলী মনোযোগ দিয়ে পড়ুন। প্ল্যাটফর্মটি ব্যবহারের মাধ্যমে আপনি এই সকল নিয়মাবলী ও নীতিমালার প্রতি সম্মতি জ্ঞাপন করছেন।"
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
            <ShieldAlert
              className="size-3.5 text-emerald-600 dark:text-emerald-400"
              aria-hidden="true"
            />
            <span>
              {isEn
                ? "100% Free & Humanitarian • Zero Brokerage"
                : "১০০% অবাণিজ্যিক ও মানবিক সমন্বয় • কোনো মধ্যস্থতা ফি নেই"}
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
                <FileText className="size-4 text-primary" aria-hidden="true" />
                <span>{isEn ? "Table of Contents" : "সূচিপত্র"}</span>
              </h2>
              <nav
                aria-label={
                  isEn ? "Terms Table of Contents" : "শর্তাবলী সূচিপত্র"
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
                  href={privacyHref}
                  className="flex items-center justify-between text-xs font-bold text-primary hover:underline underline-offset-4"
                >
                  <span>
                    {isEn ? "Read Privacy Policy" : "গোপনীয়তা নীতি পড়ুন"}
                  </span>
                  <ExternalLink className="size-3" aria-hidden="true" />
                </Link>
              </div>
            </Card>
          </aside>

          {/* Legal Document Content (8 cols) */}
          <main className="lg:col-span-8 space-y-10 leading-relaxed text-sm sm:text-base text-foreground/90">
            {/* Quick Summary Alert */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 sm:p-5 flex items-start gap-3.5">
              <CheckCircle2
                className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div className="space-y-1 text-xs sm:text-sm">
                <strong className="font-bold text-foreground block">
                  {isEn
                    ? "Core Humanitarian Principle:"
                    : "রক্তবন্ধুর মূলনীতি:"}
                </strong>
                <p className="text-muted-foreground">
                  {isEn
                    ? "RoktoBondhu is a completely free, voluntary network connecting blood donors with patients in Bangladesh. Blood donation is a gift of life; no commercial transaction or monetary compensation is ever permitted."
                    : "রক্তবন্ধু সম্পূর্ণ বিনামূল্যে পরিচালিত একটি স্বেচ্ছাসেবী ডিজিটাল মাধ্যম, যা বাংলাদেশের ৬৪ জেলায় রক্তপ্রার্থী ও রক্তদাতাদের মধ্যে সংযোগ স্থাপন করে। রক্তদান একটি মানবিক দান; রক্তের বিনিময়ে যেকোনো ধরনের আর্থিক লেনদেন বা দালালি সম্পূর্ণ নিষিদ্ধ।"}
                </p>
              </div>
            </div>

            {/* Section 1: Overview */}
            <section id="overview" className="space-y-3.5 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight border-b border-border/60 pb-2">
                {isEn
                  ? "1. Platform Overview & Scope"
                  : "১. প্ল্যাটফর্মের রূপরেখা ও ভূমিকা"}
              </h2>
              <p>
                {isEn
                  ? "RoktoBondhu ('রক্তবন্ধু') operates as an open humanitarian communication bridge. The platform enables voluntary donors to register their willingness to donate and allows patients, relatives, or community volunteers to publish emergency blood requisitions across Bangladesh."
                  : "রক্তবন্ধু একটি উন্মুক্ত ও অবাণিজ্যিক মানবিক প্রযুক্তি উদ্যোগ। এই প্ল্যাটফর্মের মূল লক্ষ্য হলো বাংলাদেশের যেকোনো প্রান্তে জরুরি রক্তের প্রয়োজনে রোগীর পরিবার এবং স্বেচ্ছাসেবী রক্তদাতাদের মধ্যে দ্রুত যোগাযোগ স্থাপন করা।"}
              </p>
              <p>
                {isEn
                  ? "RoktoBondhu is not an intermediary broker, blood bank, or hospital. The platform does not store, transport, or sell blood, nor does it employ blood donors."
                  : "রক্তবন্ধু কোনো মধ্যস্থতাকারী প্রতিষ্ঠান বা রক্তের বাণিজ্যিক এজেন্সি নয়। প্ল্যাটফর্মটি রক্ত সংগ্রহ, সংরক্ষণ, পরিবহন বা রক্তের কোনো প্রকার ক্রয়-বিক্রয়ের সাথে জড়িত নয়।"}
              </p>
            </section>

            {/* Section 2: Eligibility */}
            <section id="eligibility" className="space-y-3.5 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight border-b border-border/60 pb-2">
                {isEn
                  ? "2. User Eligibility & Account Responsibilities"
                  : "২. ব্যবহারকারীর যোগ্যতা ও অ্যাকাউন্ট সুরক্ষা"}
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground marker:text-primary">
                <li>
                  <strong className="text-foreground">
                    {isEn
                      ? "Minimum Age Requirement: "
                      : "বয়স সংক্রান্ত নিয়ম: "}
                  </strong>
                  {isEn
                    ? "Users registering as blood donors or submitting emergency requisitions must be at least 18 years of age. Minors requiring blood must have a parent, guardian, or adult relative manage the requisition."
                    : "রক্তদাতা হিসেবে নিবন্ধন বা রক্তের অনুরোধ দাখিল করতে ব্যবহারকারীকে অবশ্যই ন্যূনতম ১৮ বছর বয়সী হতে হবে। অপ্রাপ্তবয়স্ক কোনো রোগীর ক্ষেত্রে তার অভিভাবক বা প্রাপ্তবয়স্ক আত্মীয়ের তত্ত্বাবধানে আবেদন করতে হবে।"}
                </li>
                <li>
                  <strong className="text-foreground">
                    {isEn ? "Account Security: " : "অ্যাকাউন্টের নিরাপত্তা: "}
                  </strong>
                  {isEn
                    ? "Users are responsible for safeguarding their login credentials and phone number. Any activity carried out under your account is your sole legal responsibility."
                    : "ব্যবহারকারী তার লগইন তথ্য (ইমেইল ও পাসওয়ার্ড) গোপন ও সুরক্ষিত রাখার জন্য সম্পূর্ণরূপে দায়ী। আপনার অ্যাকাউন্টের মাধ্যমে সম্পাদিত সকল কার্যক্রমের দায়ভার আপনার ওপর বর্তাবে।"}
                </li>
                <li>
                  <strong className="text-foreground">
                    {isEn ? "Accurate Information: " : "সঠিক তথ্য প্রদান: "}
                  </strong>
                  {isEn
                    ? "All information provided during registration, including full name, mobile number, and location, must be authentic and verifiable."
                    : "নিবন্ধনের সময় নাম, সচল মোবাইল নম্বর এবং বর্তমান বসবাসের এলাকা সংক্রান্ত সঠিক তথ্য প্রদান করা বাধ্যতামূলক।"}
                </li>
              </ul>
            </section>

            {/* Section 3: Donor Responsibilities */}
            <section id="donor-rules" className="space-y-3.5 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight border-b border-border/60 pb-2">
                {isEn
                  ? "3. Voluntary Donor Responsibilities"
                  : "৩. স্বেচ্ছাসেবী রক্তদাতার দায়িত্ব ও তথ্যের যথার্থতা"}
              </h2>
              <p>
                {isEn
                  ? "When you register as a donor on RoktoBondhu, you agree to the following responsibilities:"
                  : "রক্তবন্ধু প্ল্যাটফর্মে রক্তদাতা হিসেবে অন্তর্ভুক্ত হয়ে আপনি নিম্নলিখিত দায়িত্বসমূহ পালনে সম্মত হচ্ছেন:"}
              </p>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground marker:text-primary">
                <li>
                  <strong className="text-foreground">
                    {isEn
                      ? "Accuracy of Details: "
                      : "রক্তের গ্রুপ ও তথ্যের সঠিকতা: "}
                  </strong>
                  {isEn
                    ? "You must accurately state your blood group (A+, A-, B+, B-, AB+, AB-, O+, O-), district, upazila, and availability status."
                    : "আপনার রক্তের গ্রুপ, বর্তমান জেলা ও উপজেলা এবং রক্তদানের প্রাপ্যতা স্ট্যাটাস সততার সাথে উল্লেখ করতে হবে। কোনো বিভ্রান্তিকর বা ভুল তথ্য প্রদান করা যাবে না।"}
                </li>
                <li>
                  <strong className="text-foreground">
                    {isEn ? "Voluntary Principle: " : "স্বেচ্ছাসেবী মনোভাব: "}
                  </strong>
                  {isEn
                    ? "Your registration confirms your voluntary willingness to donate blood without expecting any monetary payment, gift, or commercial reward."
                    : "আপনার অন্তর্ভুক্তি সম্পূর্ণ স্বেচ্ছাসেবী। রক্তদানের বিনিময়ে কোনো প্রকার আর্থিক সুবিধা, পারিতোষিক বা উপঢৌকন দাবি করা কঠোরভাবে নিষিদ্ধ।"}
                </li>
                <li>
                  <strong className="text-foreground">
                    {isEn ? "Updating Status: " : "স্ট্যাটাস নিয়মিত আপডেট: "}
                  </strong>
                  {isEn
                    ? "If you recently donated blood or are temporarily unable to donate, you must update your availability status to 'Unavailable' or update your last donation date in your account dashboard."
                    : "সর্বশেষ রক্তদানের তারিখ এবং শারীরিক সক্ষমতা অনুযায়ী প্রোফাইল থেকে প্রাপ্যতা স্ট্যাটাস (রক্তদানে প্রস্তুত / অনুপলব্ধ) নিয়মিত হালনাগাদ রাখা আপনার নৈতিক দায়িত্ব।"}
                </li>
              </ul>
            </section>

            {/* Section 4: Blood Requests */}
            <section id="request-rules" className="space-y-3.5 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight border-b border-border/60 pb-2">
                {isEn
                  ? "4. Emergency Blood Requisition Guidelines"
                  : "৪. জরুরি রক্তের অনুরোধ ও অনুরোধকারীর বাধ্যবাধকতা"}
              </h2>
              <p>
                {isEn
                  ? "Requesters posting blood needs must adhere to high standards of truthfulness:"
                  : "প্ল্যাটফর্মে রক্তের আবেদন পোস্ট করার সময় অনুরোধকারীকে নিচের নিয়মসমূহ মেনে চলতে হবে:"}
              </p>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground marker:text-primary">
                <li>
                  <strong className="text-foreground">
                    {isEn
                      ? "Genuine Medical Need: "
                      : "বাস্তব চিকিৎসা প্রয়োজন: "}
                  </strong>
                  {isEn
                    ? "Every blood request must represent a real, verified clinical necessity for an actual patient under medical treatment."
                    : "প্রতিটি রক্তের অনুরোধ অবশ্যই একজন বাস্তব রোগীর প্রকৃত চিকিৎসার প্রয়োজনে হতে হবে। কোনো কাল্পনিক, পরীক্ষামূলক বা অসত্য তথ্যের আবেদন করা যাবে না।"}
                </li>
                <li>
                  <strong className="text-foreground">
                    {isEn
                      ? "Hospital & Contact Verification: "
                      : "হাসপাতাল ও যোগাযোগের সঠিক নম্বর: "}
                  </strong>
                  {isEn
                    ? "You must provide the actual hospital/clinic name, location, required units, and a functioning phone number where responding donors can reach you directly."
                    : "রোগীর বর্তমান হাসপাতাল, অবস্থান, রক্তের ব্যাগের পরিমাণ এবং একটি সক্রিয় মোবাইল নম্বর প্রদান করতে হবে যাতে ইচ্ছুক রক্তদাতারা সরাসরি যোগাযোগ করতে পারেন।"}
                </li>
                <li>
                  <strong className="text-foreground">
                    {isEn
                      ? "Closing Completed Requests: "
                      : "অনুরোধ সম্পন্ন হলে আপডেট করা: "}
                  </strong>
                  {isEn
                    ? "Once blood has been arranged or the need has been met, the requester is obligated to mark the request as 'Fulfilled' (সম্পন্ন) or 'Cancelled' (বাতিল) from their dashboard to respect voluntary donors' time."
                    : "রক্ত সংগ্রহ সম্পন্ন হওয়া মাত্রই বা প্রয়োজন শেষ হলে অনুরোধটি প্ল্যাটফর্মে 'সম্পন্ন' (Fulfilled) অথবা 'বাতিল' (Cancelled) হিসেবে মার্ক করতে হবে, যাতে রক্তদাতাদের অপ্রয়োজনীয় ফোন কলের মুখোমুখি হতে না হয়।"}
                </li>
              </ul>
            </section>

            {/* Section 5: Communication */}
            <section id="communication" className="space-y-3.5 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight border-b border-border/60 pb-2">
                {isEn
                  ? "5. Communication & Respectful Conduct"
                  : "৫. যোগাযোগ ও শালীন আচরণবিধি"}
              </h2>
              <p>
                {isEn
                  ? "RoktoBondhu is built on mutual respect and humanitarian empathy. All users agree to:"
                  : "রক্তবন্ধু পারস্পরিক শ্রদ্ধা ও মানবিক সহমর্মিতার ভিত্তিতে পরিচালিত। প্ল্যাটফর্মের সকল ব্যবহারকারী নিম্নলিখিত আচরণবিধি মেনে চলতে বাধ্য:"}
              </p>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground marker:text-primary">
                <li>
                  {isEn
                    ? "Treat voluntary donors with courtesy, dignity, and gratitude. Remember that donors volunteer their time and blood without any obligation."
                    : "স্বেচ্ছাসেবী রক্তদাতাদের সাথে সর্বদা বিনম্র, মার্জিত ও শ্রদ্ধাশীল ভাষায় কথা বলুন। মনে রাখবেন, রক্তদাতা কোনো বেতনভুক্ত কর্মচারী বা বাধ্য ব্যক্তি নন; তিনি একজন নিঃস্বার্থ জীবনরক্ষাকারী।"}
                </li>
                <li>
                  {isEn
                    ? "Do not make excessive or unseasonable calls. If a donor does not answer or declines, respect their decision and do not harass them."
                    : "অযৌক্তিক বা গভীর রাতে অপ্রয়োজনীয় একাধিক কল দেওয়া থেকে বিরত থাকুন। কোনো রক্তদাতা অপারগতা প্রকাশ করলে বা সাড়া না দিলে তার সিদ্ধান্তকে সম্মান জানান।"}
                </li>
                <li>
                  {isEn
                    ? "Any form of verbal abuse, intimidation, harassment, or coercive language will result in an immediate permanent ban."
                    : "কোনো প্রকার কটূক্তি, দুর্ব্যবহার, ভয়ভীতি প্রদর্শন বা হয়রানি ঘটলে সংশ্লিষ্ট ব্যক্তির অ্যাকাউন্ট তাৎক্ষণিকভাবে আজীবনের জন্য নিষিদ্ধ (Permanent Ban) করা হবে।"}
                </li>
              </ul>
            </section>

            {/* Section 6: Medical Disclaimer */}
            <section id="medical-disclaimer" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight border-b border-border/60 pb-2">
                {isEn
                  ? "6. Critical Medical Disclaimer & Health Screenings"
                  : "৬. চিকিৎসা সংক্রান্ত সতর্কতা ও রক্তদানের উপযোগিতা"}
              </h2>

              <Card className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <Stethoscope
                    className="size-5 text-destructive shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div className="space-y-1.5 text-xs sm:text-sm">
                    <strong className="font-black text-foreground block text-sm sm:text-base">
                      {isEn
                        ? "RoktoBondhu is NOT a Medical Authority, Doctor, or Blood Bank"
                        : "রক্তবন্ধু কোনো চিকিৎসা প্রতিষ্ঠান, ডাক্তার বা ব্লাড ব্যাংক নয়"}
                    </strong>
                    <p className="text-muted-foreground leading-relaxed">
                      {isEn
                        ? "RoktoBondhu is solely a software matching tool. We do NOT test, screen, collect, store, cross-match, or transfuse blood. We cannot medically guarantee a donor's physical fitness, hemoglobin count, or blood safety."
                        : "রক্তবন্ধু শুধুমাত্র তথ্য আদান-প্রদানের একটি প্রযুক্তিগত মাধ্যম। প্ল্যাটফর্ম কর্তৃপক্ষ রক্ত পরীক্ষা, রক্ত সংগ্রহ বা সংরক্ষণের সাথে কোনোভাবেই যুক্ত নয়। কোনো রক্তদাতার শারীরিক সুস্থতা, রক্তের বিশুদ্ধতা বা রোগের অনুপস্থিতি নিশ্চিত করার ক্ষমতা রক্তবন্ধুর নেই।"}
                    </p>
                  </div>
                </div>
              </Card>

              <div className="space-y-2.5 text-muted-foreground text-xs sm:text-sm">
                <p>
                  <strong className="text-foreground">
                    {isEn
                      ? "Hospital Screening Mandatory: "
                      : "হাসপাতালে স্বাস্থ্য পরীক্ষা আবশ্যক: "}
                  </strong>
                  {isEn
                    ? "Every blood donation must undergo mandatory clinical pre-screening, hemoglobin evaluation, vital checks, and standard transfusion-transmissible infection (TTI) laboratory tests (including HIV, Hepatitis B, Hepatitis C, Syphilis, Malaria) conducted by qualified physicians at a recognized hospital or transfusion center."
                    : "রক্তদানের পূর্বে চিকিৎসকের উপস্থিতিতে রক্তদাতার ওজন, রক্তচাপ, হিমোগ্লোবিনের মাত্রা এবং প্রয়োজনীয় প্যাথলজিক্যাল স্ক্রিনিং (হেপাটাইটিস বি ও সি, এইচআইভি, সিফিলিস, ম্যালেরিয়া ইত্যাদি) হাসপাতাল বা অনুমোদিত ট্রান্সফিউশন সেন্টারে সম্পন্ন করা বাধ্যতামূলক।"}
                </p>
                <p>
                  <strong className="text-foreground">
                    {isEn
                      ? "Donor Fitness Discretion: "
                      : "রক্তদানের উপযোগিতা যাচাই: "}
                  </strong>
                  {isEn
                    ? "A donor must not donate if they feel unwell, have recent tattoos/surgeries, are pregnant, or do not meet medical donation criteria. Qualified medical personnel at the hospital have the final authority to accept or defer a donation."
                    : "শারীরিক অসুস্থতা, সাম্প্রতিক কোনো জটিল রোগ বা অন্য কোনো স্বাস্থ্যগত জটিলতা থাকলে রক্তদান থেকে বিরত থাকুন। রক্তদাতা রক্তদানের উপযুক্ত কি না তা নির্ধারণ করার চূড়ান্ত অধিকার একমাত্র হাসপাতাল ও চিকিৎসা কর্তৃপক্ষের।"}
                </p>
              </div>
            </section>

            {/* Section 7: Zero Commercialization */}
            <section id="no-commercial" className="space-y-3.5 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight border-b border-border/60 pb-2">
                {isEn
                  ? "7. Zero Commercialization & Prohibition of Buying/Selling Blood"
                  : "৭. অবাণিজ্যিক নীতি ও অর্থ লেনদেন নিষেধ"}
              </h2>

              <Card className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <Ban
                    className="size-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div className="space-y-1.5 text-xs sm:text-sm">
                    <strong className="font-black text-foreground block">
                      {isEn
                        ? "Strict Prohibition on Financial Compensation"
                        : "রক্তের বিনিময়ে অর্থ দাবি বা লেনদেন সম্পূর্ণ নিষিদ্ধ"}
                    </strong>
                    <p className="text-muted-foreground leading-relaxed">
                      {isEn
                        ? "Demanding, offering, or accepting money, tips, gifts, or financial brokerage in connection with blood donation on RoktoBondhu is strictly prohibited. Commercial trading of human blood is illegal and a grave violation of our terms."
                        : "রক্তদান সম্পূর্ণ বিনামূল্যে এবং স্বেচ্ছায় হতে হবে। রক্তদানের বিনিময়ে অর্থ দাবি করা, দালালির চেষ্টা করা বা কোনো আর্থিক চুক্তি করা কঠোরভাবে নিষিদ্ধ। এ ধরনের অনৈতিক কার্যক্রমের বিরুদ্ধে আইনানুগ ব্যবস্থা গ্রহণ করা হতে পারে।"}
                    </p>
                  </div>
                </div>
              </Card>

              <p className="text-xs sm:text-sm text-muted-foreground">
                {isEn
                  ? "Requesters may voluntarily assist with the donor's actual local travel fare (e.g. rickshaw or bus fare) if mutually agreed upon in good faith, but this is never a fee for blood itself."
                  : "জরুরি প্রয়োজনে রক্তদাতার হাসপাতালে যাতায়াতের জন্য বাস্তব রিকশা বা বাস ভাড়া রক্তগ্রহীতার পক্ষ থেকে স্বেচ্ছায় বহন করা যেতে পারে, তবে এটি কোনোভাবেই রক্তের মূল্য বা বিনিময় ফি হিসেবে গণ্য হবে না।"}
              </p>
            </section>

            {/* Section 8: Prohibited Activities */}
            <section id="prohibited" className="space-y-3.5 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight border-b border-border/60 pb-2">
                {isEn
                  ? "8. Prohibited Activities & Abuse Prevention"
                  : "৮. নিষিদ্ধ কার্যক্রম ও প্ল্যাটফর্মের অপব্যবহার রোধ"}
              </h2>
              <p>
                {isEn
                  ? "You agree NOT to engage in any of the following activities on RoktoBondhu:"
                  : "রক্তবন্ধু প্ল্যাটফর্মে নিম্নলিখিত কর্মকাণ্ডসমূহ সম্পূর্ণরূপে নিষিদ্ধ:"}
              </p>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground marker:text-destructive text-xs sm:text-sm">
                <li>
                  {isEn
                    ? "Submitting fake, prank, test, or fraudulent blood requests."
                    : "মিথ্যা, বানোয়াট, পরীক্ষামূলক বা অসৎ উদ্দেশ্যে রক্তের আবেদন প্রকাশ করা।"}
                </li>
                <li>
                  {isEn
                    ? "Harvesting, scraping, collecting, or compiling donor phone numbers or data for marketing, advertising, sales, or commercial solicitation."
                    : "রক্তদাতাদের ফোন নম্বর বা তথ্য সংগ্রহ করে কোনো প্রকার বিপণন, বিজ্ঞাপন, বাণিজ্যিক প্রচারণা বা স্প্যাম পাঠানো।"}
                </li>
                <li>
                  {isEn
                    ? "Impersonating other individuals, doctors, hospital staff, or organizations."
                    : "অন্য কোনো ব্যক্তির পরিচয়, চিকিৎসক, হাসপাতালের স্টাফ বা কোনো সংস্থার নাম নকল করে তথ্য প্রদান করা।"}
                </li>
                <li>
                  {isEn
                    ? "Attempting to bypass security controls, reverse-engineer, or disrupt platform infrastructure."
                    : "প্ল্যাটফর্মের নিরাপত্তা বিঘ্নিত করার চেষ্টা, স্ক্রিপ্ট বা বটের মাধ্যমে অননুমোদিত অ্যাক্সেস নেওয়া।"}
                </li>
              </ul>
            </section>

            {/* Section 9: Content & Moderation */}
            <section id="moderation" className="space-y-3.5 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight border-b border-border/60 pb-2">
                {isEn
                  ? "9. User Content, Reports & Platform Moderation"
                  : "৯. ব্যবহারকারী কর্তৃক প্রদত্ত তথ্যের দায় ও মডারেশন"}
              </h2>
              <p>
                {isEn
                  ? "Users remain legally responsible for the accuracy and legality of all data they submit. RoktoBondhu provides moderation capabilities, including an in-app reporting system allowing any user to flag suspicious donors or fraudulent requisitions."
                  : "ব্যবহারকারী তার জমা দেওয়া তথ্যের সত্যতার জন্য ব্যক্তিগতভাবে দায়ী। রক্তবন্ধু প্ল্যাটফর্মে একটি মডারেশন ও ইন-অ্যাপ রিপোর্টিং ব্যবস্থা রয়েছে, যার মাধ্যমে ব্যবহারকারীরা যেকোনো সন্দেহজনক রক্তদাতা বা প্রতারণামূলক আবেদন সম্পর্কে রিপোর্ট করতে পারেন।"}
              </p>
              <p>
                {isEn
                  ? "Platform administrators reserve the right to review, edit, unpublish, or permanently delete any content or account that violates these terms or endangers community trust."
                  : "প্ল্যাটফর্ম কর্তৃপক্ষ যেকোনো সময় শর্তাবলী ভঙ্গকারী বা অনিয়মকারী ব্যবহারকারীর তথ্য সংশোধন, সাময়িক লুকানো বা স্থায়ীভাবে মুছে ফেলার পূর্ণ অধিকার সংরক্ষণ করে।"}
              </p>
            </section>

            {/* Section 10: Availability */}
            <section id="availability" className="space-y-3.5 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight border-b border-border/60 pb-2">
                {isEn
                  ? "10. Service Availability & Limitations"
                  : "১০. সেবার প্রাপ্যতা ও সীমাবদ্ধতা"}
              </h2>
              <p>
                {isEn
                  ? "RoktoBondhu is provided on an 'as is' and 'as available' basis. While we strive to maintain uninterrupted 24/7 service across all districts:"
                  : "রক্তবন্ধু সেবাটি 'যেমন আছে' (As-is) এবং 'যখন উপলব্ধ' (As-available) ভিত্তিতে প্রদান করা হয়। সার্বক্ষণিক নিরবচ্ছিন্ন সেবা প্রদানে আন্তরিক প্রচেষ্টা সত্ত্বেও:"}
              </p>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground marker:text-primary text-xs sm:text-sm">
                <li>
                  {isEn
                    ? "We cannot guarantee that a matching donor will always be available, willing, or able to respond in every medical emergency."
                    : "প্ল্যাটফর্মে অনুরোধ প্রকাশ করলেই রক্তদাতা পাওয়া যাবে বা নিশ্চিতভাবে রক্ত সংগ্রহ সম্ভব হবে—এর কোনো নিশ্চয়তা বা গ্যারান্টি দেওয়া সম্ভব নয়। জরুরি পরিস্থিতিতে পরিবারের সদস্যদের সমান্তরালভাবে অন্যান্য মাধ্যমেও রক্তদাতা খোঁজার পরামর্শ দেওয়া হয়।"}
                </li>
                <li>
                  {isEn
                    ? "Server maintenance, telecommunication issues, or internet interruptions may occasionally cause delays in notification delivery."
                    : "ইন্টারনেট সংযোগ বিভ্রাট, সার্ভার রক্ষণাবেক্ষণ বা টেলিযোগাযোগ নেটওয়ার্কের ত্রুটির কারণে নোটিফিকেশন পাঠাতে সাময়িক বিলম্ব ঘটতে পারে।"}
                </li>
              </ul>
            </section>

            {/* Section 11: Liability */}
            <section id="liability" className="space-y-3.5 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight border-b border-border/60 pb-2">
                {isEn
                  ? "11. Limitation of Liability"
                  : "১১. দায়বদ্ধতার সীমাবদ্ধতা"}
              </h2>
              <p>
                {isEn
                  ? "To the fullest extent permitted by applicable law, RoktoBondhu, its voluntary developers, and administrators shall not be liable for any direct, indirect, incidental, or consequential damages resulting from:"
                  : "প্রযোজ্য আইনের আওতায়, রক্তবন্ধু প্ল্যাটফর্ম বা এর স্বেচ্ছাসেবী পরিচালনাকারী দল নিম্নলিখিত বিষয়সমূহের জন্য কোনোভাবেই আইনত বা আর্থিকভাবে দায়ী থাকবে না:"}
              </p>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground marker:text-primary text-xs sm:text-sm">
                <li>
                  {isEn
                    ? "Delays in finding a blood donor, donor unavailability, or refusal to donate during medical emergencies."
                    : "জরুরি মুহূর্তে রক্তদাতা না পাওয়া, রক্তদাতার পৌঁছাতে দেরি হওয়া বা রক্তদানে অসম্মতিজনিত কোনো ক্ষয়ক্ষতি।"}
                </li>
                <li>
                  {isEn
                    ? "Medical complications, adverse transfusion reactions, or clinical decisions made by hospitals and medical staff."
                    : "হাসপাতাল বা চিকিৎসকদের চিকিৎসা সিদ্ধান্ত, রক্ত সঞ্চালনজনিত পার্শ্বপ্রতিক্রিয়া বা স্বাস্থ্যগত কোনো জটিলতা।"}
                </li>
                <li>
                  {isEn
                    ? "Direct interpersonal interactions or disputes arising between requesters and donors outside the platform."
                    : "প্ল্যাটফর্মের বাইরে রক্তগ্রহীতা ও রক্তদাতার মধ্যকার ব্যক্তিগত পারস্পরিক কথাবার্তা, বিরোধ বা আচরণগত সমস্যা।"}
                </li>
              </ul>
            </section>

            {/* Section 12: Termination */}
            <section id="termination" className="space-y-3.5 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight border-b border-border/60 pb-2">
                {isEn
                  ? "12. Account Suspension & Termination"
                  : "১২. অ্যাকাউন্ট স্থগিতকরণ ও বাতিল"}
              </h2>
              <p>
                {isEn
                  ? "RoktoBondhu reserves the right to immediately suspend or permanently terminate user accounts that violate our terms, harass donors, demand money, post false requisitions, or disrupt community trust. Suspended accounts are barred from further participation."
                  : "শর্তাবলী লঙ্ঘন, রক্তদাতাদের সাথে অসদাচরণ, অর্থের দাবি, মিথ্যা অনুরোধ তৈরি বা প্ল্যাটফর্মের সুনাম ক্ষুণ্ণ করার প্রমাণ পাওয়া গেলে সংশ্লিষ্ট অ্যাকাউন্ট কোনো পূর্ব নোটিশ ছাড়াই অবিলম্বে স্থগিত বা স্থায়ীভাবে বাতিল করার অধিকার কর্তৃপক্ষ সংরক্ষণ করে।"}
              </p>
            </section>

            {/* Section 13: Changes */}
            <section id="changes" className="space-y-3.5 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight border-b border-border/60 pb-2">
                {isEn
                  ? "13. Modifications to These Terms"
                  : "১৩. শর্তাবলীর পরিবর্তন"}
              </h2>
              <p>
                {isEn
                  ? "We may periodically revise these Terms of Service to reflect system enhancements, legal guidelines, or user feedback. Updated versions will always be published on this page with an updated effective date. Continued use of RoktoBondhu constitutes acceptance of the revised terms."
                  : "প্ল্যাটফর্মের সেবার মানোন্নয়ন বা প্রাসঙ্গিক আইনি নির্দেশনার আলোকে কর্তৃপক্ষ এই শর্তাবলী সময়ে সময়ে পরিমার্জন বা সংশোধন করতে পারে। সংশোধিত শর্তাবলী এই পাতায় প্রকাশের তারিখ থেকেই কার্যকর হবে। প্ল্যাটফর্মের নিয়মিত ব্যবহার সংশোধিত শর্তাবলীর প্রতি সম্মতি হিসেবে গণ্য হবে।"}
              </p>
            </section>

            {/* Section 14: Contact */}
            <section id="contact" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight border-b border-border/60 pb-2">
                {isEn
                  ? "14. Contact Information & Reporting"
                  : "১৪. যোগাযোগ ও অভিযোগ জানানোর মাধ্যম"}
              </h2>
              <p>
                {isEn
                  ? "If you encounter suspicious activities, fraudulent blood requests, harassment, or have questions regarding these terms, please contact us:"
                  : "যদি আপনি কোনো প্রতারণামূলক রক্তের আবেদন, অসঙ্গতিপূর্ণ রক্তদাতা বা হয়রানির শিকার হন, তবে প্ল্যাটফর্মের সংশ্লিষ্ট কার্ডে থাকা 'রিপোর্ট' অপশন ব্যবহার করুন অথবা আমাদের সাথে যোগাযোগ করুন:"}
              </p>

              <Card className="rounded-2xl border border-border/80 bg-surface/90 p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <HelpCircle className="size-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">
                      {isEn
                        ? "Support & Moderation Desk"
                        : "সহায়তা ও মডারেশন বিভাগ"}
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
                    ? "In-App Reports: Users can also use the 'Report' button on any donor card or blood requisition view to alert administrators instantly."
                    : "ইন-অ্যাপ রিপোর্ট: যেকোনো রক্তদাতা কার্ড বা রক্তের অনুরোধ পাতায় থাকা 'রিপোর্ট' বাটনে ক্লিক করে প্রশাসক দলকে তাৎক্ষণিকভাবে অবহিত করা যায়।"}
                </p>
              </Card>
            </section>

            {/* Footer Navigation within Document */}
            <div className="border-t border-border/80 pt-6 mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link
                href={privacyHref}
                className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline underline-offset-4"
              >
                <span>
                  {isEn ? "View Privacy Policy" : "গোপনীয়তা নীতি দেখুন"}
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
