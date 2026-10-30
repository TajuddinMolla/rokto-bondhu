"use client";

import React from "react";
import Link from "next/link";
import {
  ClipboardList,
  MessageSquare,
  ArrowRight,
  PlusCircle,
  Clock,
  CheckCircle2,
  Inbox,
  Send,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";
import type { BloodRequest } from "@/types/request";
import type { DonorContactRequest } from "@/types/contact-request";
import { getTranslations } from "@/i18n/translations";

interface DashboardRequestsSummaryProps {
  locale: Locale;
  myRequests: BloodRequest[];
  incomingContactRequests: DonorContactRequest[];
  outgoingContactRequests: DonorContactRequest[];
}

export function DashboardRequestsSummary({
  locale,
  myRequests,
  incomingContactRequests,
  outgoingContactRequests,
}: DashboardRequestsSummaryProps) {
  const t = getTranslations(locale);

  const myRequestsHref = locale === "en" ? "/en/account/requests" : "/account/requests";
  const createRequestHref =
    locale === "en"
      ? "/en/blood-request/create#request-form"
      : "/blood-request/create#request-form";
  const contactRequestsHref = locale === "en" ? "/en/account/contact-requests" : "/account/contact-requests";

  const openRequestsCount = myRequests.filter((r) => r.status === "open").length;
  const pendingIncomingCount = incomingContactRequests.filter((r) => r.status === "PENDING").length;
  const acceptedOutgoingCount = outgoingContactRequests.filter((r) => r.status === "ACCEPTED").length;

  return (
    <div className="space-y-6">
      {/* Blood Requests Management Card */}
      <Card className="border border-border/80 bg-surface shadow-xs transition-shadow hover:shadow-sm">
        <CardHeader className="pb-4 border-b border-border/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
              <ClipboardList className="size-5" aria-hidden="true" />
            </div>
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
          <Button asChild size="sm" variant="outline" className="gap-1.5 self-start sm:self-auto h-8 text-xs font-medium">
            <Link href={myRequestsHref}>
              <span>{locale === "en" ? "View All" : "সব দেখুন"}</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/70 bg-muted/20">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">
                  {locale === "en" ? "Active Broadcasts:" : "সক্রিয় অনুরোধ:"}
                </span>
                <Badge variant={openRequestsCount > 0 ? "default" : "secondary"} className="text-xs font-bold gap-1">
                  <Clock className="size-3" />
                  {openRequestsCount}
                </Badge>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground font-medium">
                  {locale === "en" ? "Total Submitted:" : "মোট অনুরোধ:"}
                </span>
                <span className="text-xs font-semibold text-foreground">
                  {myRequests.length}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {locale === "en"
                  ? "You can update request details, mark requests as fulfilled, or cancel requests anytime."
                  : "যেকোনো সময় অনুরোধের বিবরণ পরিবর্তন, সম্পন্ন অথবা বাতিল করতে পারবেন।"}
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <Button asChild size="sm" className="w-full sm:w-auto gap-1.5 shadow-xs font-semibold">
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
      <Card className="border border-border/80 bg-surface shadow-xs transition-shadow hover:shadow-sm">
        <CardHeader className="pb-4 border-b border-border/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
              <MessageSquare className="size-5" aria-hidden="true" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-foreground">
                {t.contactModeSettings.contactRequestsSummary}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                {t.contactModeSettings.contactRequestsDesc}
              </CardDescription>
            </div>
          </div>
          <Button asChild size="sm" variant="outline" className="gap-1.5 self-start sm:self-auto h-8 text-xs font-medium">
            <Link href={contactRequestsHref}>
              <span>{t.contactModeSettings.manageRequestsAction}</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-5 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Incoming Requests Box */}
            <div className="p-4 rounded-xl border border-border/70 bg-muted/20 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Inbox className="size-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-medium">
                    {locale === "en" ? "Incoming (For Donor)" : "ইনকামিং (রক্তদাতা হিসেবে)"}
                  </span>
                </div>
                <Badge
                  variant={pendingIncomingCount > 0 ? "default" : "secondary"}
                  className="text-xs font-bold"
                >
                  {pendingIncomingCount} {locale === "en" ? "Pending" : "অপেক্ষমান"}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {locale === "en"
                  ? `${incomingContactRequests.length} total direct requests received from patients.`
                  : `রোগীদের থেকে মোট ${incomingContactRequests.length} টি অনুরোধ এসেছে।`}
              </p>
            </div>

            {/* Outgoing Requests Box */}
            <div className="p-4 rounded-xl border border-border/70 bg-muted/20 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Send className="size-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-medium">
                    {locale === "en" ? "Outgoing (For Patient)" : "আউটগোয়িং (গ্রহীতা হিসেবে)"}
                  </span>
                </div>
                <Badge
                  variant={acceptedOutgoingCount > 0 ? "default" : "outline"}
                  className="text-xs font-bold gap-1"
                >
                  <CheckCircle2 className="size-3" />
                  {acceptedOutgoingCount} {locale === "en" ? "Accepted" : "গৃহীত"}
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
    </div>
  );
}
