"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  Droplets,
  Lock,
  Globe,
  AlertTriangle,
  History,
  ArrowRight,
  Loader2,
  ShieldAlert,
  Clock,
  Sparkles,
  ShieldCheck,
  UserCheck,
  ArrowUpRight,
} from "lucide-react";

import {
  useAdminStats,
  useAdminAuditLogs,
} from "@/hooks/queries/use-admin-data";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";

interface AdminDashboardViewProps {
  locale: Locale;
}

export function AdminDashboardView({ locale }: AdminDashboardViewProps) {
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useAdminStats();
  const { data: auditData, isLoading: auditLoading } = useAdminAuditLogs({
    targetType: "ALL",
  });

  const prefix = locale === "en" ? "/en/admin" : "/admin";

  const recentLogs = auditData?.pages?.[0]?.items?.slice(0, 6) || [];

  return (
    <div className="space-y-8">
      {/* Pending Reports Callout Alert */}
      {stats && stats.pendingReports > 0 && (
        <div className="relative overflow-hidden rounded-3xl border border-destructive/30 bg-gradient-to-r from-destructive/[0.08] via-surface to-rose-500/[0.05] p-5 sm:p-6 shadow-sm transition-all animate-in fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-destructive text-destructive-foreground shadow-md shadow-destructive/25 shrink-0 mt-0.5">
                <AlertTriangle className="size-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-destructive text-destructive-foreground">
                    {locale === "en" ? "Action Required" : "পদক্ষেপ প্রয়োজন"}
                  </span>
                  <span className="text-xs font-bold text-destructive">
                    {locale === "en"
                      ? `${stats.pendingReports} Safety Flag${stats.pendingReports > 1 ? "s" : ""} Pending Review`
                      : `${stats.pendingReports}টি অভিযোগ পর্যালোচনার অপেক্ষায়`}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-foreground tracking-tight">
                  {locale === "en"
                    ? "Community Safety Reports Require Immediate Attention"
                    : "কমিউনিটি নিরাপত্তা সংক্রান্ত রিপোর্ট দ্রুত পর্যালোচনা করুন"}
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
                  {locale === "en"
                    ? "Users have flagged potential duplicate, abusive, or misclassified blood requests or donor accounts. Review the queue to maintain community trust."
                    : "রক্তদাতা বা রক্তের অনুরোধ সম্পর্কিত ব্যবহারকারীদের অভিযোগ দ্রুত সমাধান করে প্ল্যাটফর্মের শতভাগ নিরাপত্তা বজায় রাখুন।"}
                </p>
              </div>
            </div>

            <Button asChild size="default" variant="destructive" className="rounded-xl shadow-xs font-bold px-5 shrink-0 self-start sm:self-auto cursor-pointer">
              <Link href={`${prefix}/reports`}>
                <span>{locale === "en" ? "Review Queue Now" : "রিপোর্ট পর্যালোচনা করুন"}</span>
                <ArrowRight className="size-4 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* KPI Metrics Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-black text-foreground tracking-tight flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            <span>{locale === "en" ? "Real-Time System Metrics" : "রিয়েল-টাইম সিস্টেম মেট্রিক্স"}</span>
          </h2>
          <span className="text-xs text-muted-foreground">
            {locale === "en" ? "Auto-synced from Firestore" : "ক্লাউড ডাটাবেস থেকে স্বয়ংক্রিয় সিঙ্ক"}
          </span>
        </div>

        {statsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 rounded-3xl border border-border/80 bg-surface/50 animate-pulse" />
            ))}
          </div>
        ) : statsError ? (
          <Card className="border-destructive/30 bg-destructive/5 text-center p-6 rounded-3xl">
            <ShieldAlert className="size-8 text-destructive mx-auto mb-2" />
            <p className="text-sm font-semibold text-destructive">
              {locale === "en"
                ? "Failed to load dashboard metrics"
                : "ড্যাশবোর্ড তথ্য লোড করা যায়নি"}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Card: Total Registered Users */}
            <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-surface/95 backdrop-blur-xs p-5 sm:p-6 shadow-xs hover:shadow-lg hover:border-primary/40 transition-all group">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                    {locale === "en" ? "Registered Accounts" : "নিবন্ধিত অ্যাকাউন্ট"}
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                    {stats?.totalUsers.toLocaleString() ?? 0}
                  </div>
                  <p className="text-xs text-muted-foreground pt-1">
                    {locale === "en" ? "Verified user profiles" : "ভেরিফাইড ইউজার অ্যাকাউন্ট"}
                  </p>
                </div>
                <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0 ring-4 ring-blue-500/5 group-hover:scale-105 transition-transform">
                  <Users className="size-6" />
                </div>
              </div>
            </div>

            {/* Card: Active Volunteer Donors */}
            <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/[0.04] to-surface p-5 sm:p-6 shadow-xs hover:shadow-lg hover:border-primary/40 transition-all group">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-primary uppercase tracking-wider block">
                    {locale === "en" ? "Active Volunteer Donors" : "সক্রিয় রক্তদাতা"}
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-primary tracking-tight">
                    {stats?.activeDonors.toLocaleString() ?? 0}
                  </div>
                  <p className="text-xs text-muted-foreground pt-1">
                    {locale === "en" ? "Ready for emergency donation" : "জরুরি রক্তদানে প্রস্তুত"}
                  </p>
                </div>
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/25 shrink-0 ring-4 ring-primary/10 group-hover:scale-105 transition-transform">
                  <Droplets className="size-6" />
                </div>
              </div>
            </div>

            {/* Card: Open Blood Requests */}
            <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.04] to-surface p-5 sm:p-6 shadow-xs hover:shadow-lg hover:border-amber-500/40 transition-all group">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
                    {locale === "en" ? "Active Blood Requests" : "চলমান রক্তের আবেদন"}
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
                    {stats?.openRequests.toLocaleString() ?? 0}
                  </div>
                  <p className="text-xs text-muted-foreground pt-1">
                    {locale === "en" ? "Seeking blood donors right now" : "বর্তমানে রক্তদাতার সন্ধান করছে"}
                  </p>
                </div>
                <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0 ring-4 ring-amber-500/5 group-hover:scale-105 transition-transform">
                  <Clock className="size-6" />
                </div>
              </div>
            </div>

            {/* Card: Public Donors */}
            <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-surface/95 backdrop-blur-xs p-5 sm:p-6 shadow-xs hover:shadow-lg hover:border-emerald-500/40 transition-all group">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                    {locale === "en" ? "Public Calling Mode" : "পাবলিক রক্তদাতা"}
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                    {stats?.publicDonors.toLocaleString() ?? 0}
                  </div>
                  <p className="text-xs text-muted-foreground pt-1">
                    {locale === "en" ? "Direct phone dialing enabled" : "সরাসরি ফোন কল অনুমোদিত"}
                  </p>
                </div>
                <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0 ring-4 ring-emerald-500/5 group-hover:scale-105 transition-transform">
                  <Globe className="size-6" />
                </div>
              </div>
            </div>

            {/* Card: Private Protected Donors */}
            <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-surface/95 backdrop-blur-xs p-5 sm:p-6 shadow-xs hover:shadow-lg hover:border-primary/40 transition-all group">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                    {locale === "en" ? "Protected Mode Donors" : "প্রাইভেট সুরক্ষিত রক্তদাতা"}
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                    {stats?.privateDonors.toLocaleString() ?? 0}
                  </div>
                  <p className="text-xs text-muted-foreground pt-1">
                    {locale === "en" ? "Inquiry-based contact sharing" : "অনুরোধ-ভিত্তিক যোগাযোগ"}
                  </p>
                </div>
                <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground border border-border shrink-0 ring-4 ring-muted/20 group-hover:scale-105 transition-transform">
                  <Lock className="size-6" />
                </div>
              </div>
            </div>

            {/* Card: Pending Community Reports */}
            <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-surface/95 backdrop-blur-xs p-5 sm:p-6 shadow-xs hover:shadow-lg hover:border-destructive/40 transition-all group">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-destructive uppercase tracking-wider block">
                    {locale === "en" ? "Community Reports" : "অমীমাংসিত অভিযোগ"}
                  </span>
                  <div className={`text-3xl sm:text-4xl font-black tracking-tight ${
                    stats && stats.pendingReports > 0 ? "text-destructive" : "text-foreground"
                  }`}>
                    {stats?.pendingReports.toLocaleString() ?? 0}
                  </div>
                  <p className="text-xs text-muted-foreground pt-1">
                    {locale === "en" ? "Awaiting admin moderation" : "অ্যাডমিন পর্যালোচনার অপেক্ষায়"}
                  </p>
                </div>
                <div className={`flex size-12 items-center justify-center rounded-2xl shrink-0 ring-4 transition-transform group-hover:scale-105 ${
                  stats && stats.pendingReports > 0
                    ? "bg-destructive/15 text-destructive border border-destructive/30 ring-destructive/10 animate-pulse"
                    : "bg-muted text-muted-foreground border border-border ring-muted/20"
                }`}>
                  <AlertTriangle className="size-6" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Administrative Management Hub */}
      <div className="space-y-4">
        <h2 className="text-lg sm:text-xl font-black text-foreground tracking-tight flex items-center gap-2">
          <ShieldCheck className="size-5 text-primary" />
          <span>{locale === "en" ? "Administrative Workspaces" : "প্রশাসনিক কর্মক্ষেত্র"}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Workspace: Donors */}
          <Link
            href={`${prefix}/donors`}
            className="group relative overflow-hidden rounded-2xl border border-border/80 bg-surface/95 p-5 shadow-2xs hover:shadow-md hover:border-primary/50 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Users className="size-5" />
              </div>
              <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
            <h3 className="font-black text-sm text-foreground mt-3 group-hover:text-primary transition-colors">
              {locale === "en" ? "Donor Profiles" : "রক্তদাতা তালিকা"}
            </h3>
            <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
              {locale === "en"
                ? "Inspect volunteer donors, toggle phone privacy, and suspend abusive profiles."
                : "রক্তদাতাদের তালিকা, ফোন নম্বরের প্রাইভেসি নিয়ন্ত্রণ ও প্রোফাইল যাচাই করুন।"}
            </p>
          </Link>

          {/* Workspace: Blood Requests */}
          <Link
            href={`${prefix}/requests`}
            className="group relative overflow-hidden rounded-2xl border border-border/80 bg-surface/95 p-5 shadow-2xs hover:shadow-md hover:border-primary/50 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Droplets className="size-5" />
              </div>
              <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
            <h3 className="font-black text-sm text-foreground mt-3 group-hover:text-primary transition-colors">
              {locale === "en" ? "Emergency Requests" : "রক্তের অনুরোধসমূহ"}
            </h3>
            <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
              {locale === "en"
                ? "Verify hospital requisitions, hide duplicate/abusive posts, and restore requests."
                : "জরুরি রক্তের চাহিদা পর্যবেক্ষণ, অনাকাঙ্ক্ষিত আবেদন গোপন ও পুনর্বহাল করুন।"}
            </p>
          </Link>

          {/* Workspace: User Management */}
          <Link
            href={`${prefix}/users`}
            className="group relative overflow-hidden rounded-2xl border border-border/80 bg-surface/95 p-5 shadow-2xs hover:shadow-md hover:border-primary/50 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <UserCheck className="size-5" />
              </div>
              <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
            <h3 className="font-black text-sm text-foreground mt-3 group-hover:text-primary transition-colors">
              {locale === "en" ? "User Accounts" : "ব্যবহারকারী অ্যাকাউন্ট"}
            </h3>
            <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
              {locale === "en"
                ? "Inspect user trust levels, email verifications, and enforce account suspensions."
                : "ব্যবহারকারীদের অ্যাকাউন্ট, ইমেইল ভেরিফিকেশন স্ট্যাটাস ও একাউন্ট পরিচালনা করুন।"}
            </p>
          </Link>

          {/* Workspace: Safety Reports Queue */}
          <Link
            href={`${prefix}/reports`}
            className="group relative overflow-hidden rounded-2xl border border-border/80 bg-surface/95 p-5 shadow-2xs hover:shadow-md hover:border-destructive/50 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive group-hover:bg-destructive group-hover:text-destructive-foreground transition-colors">
                <AlertTriangle className="size-5" />
              </div>
              <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-destructive group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
            <h3 className="font-black text-sm text-foreground mt-3 group-hover:text-destructive transition-colors">
              {locale === "en" ? "Reports Queue" : "অভিযোগের কিউ"}
            </h3>
            <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
              {locale === "en"
                ? "Investigate user-submitted community flags and enforce safety resolutions."
                : "কমিউনিটি অভিযোগসমূহ পর্যালোচনা করে নিরাপত্তা পদক্ষেপ গ্রহণ করুন।"}
            </p>
          </Link>
        </div>
      </div>

      {/* Recent Audit Log Activity Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="size-5 text-primary" />
            <h2 className="text-base sm:text-lg font-black text-foreground tracking-tight">
              {locale === "en"
                ? "Recent Moderation Activity"
                : "সাম্প্রতিক মডারেশন কার্যক্রম"}
            </h2>
          </div>
          <Button asChild variant="ghost" size="sm" className="text-xs font-bold gap-1">
            <Link href={`${prefix}/audit-logs`}>
              <span>
                {locale === "en"
                  ? "View Full Audit Trail"
                  : "সম্পূর্ণ অডিট লগ দেখুন"}
              </span>
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>

        {auditLoading ? (
          <div className="p-12 text-center text-muted-foreground rounded-3xl border border-border bg-surface/50">
            <Loader2 className="size-6 animate-spin mx-auto mb-2 text-primary" />
            <span className="text-xs font-medium">
              {locale === "en"
                ? "Loading recent moderation logs..."
                : "অডিট লগ লোড হচ্ছে..."}
            </span>
          </div>
        ) : recentLogs.length === 0 ? (
          <Card className="rounded-3xl border-dashed p-8 text-center text-xs text-muted-foreground">
            {locale === "en"
              ? "No recent moderation actions recorded."
              : "কোনো সাম্প্রতিক মডারেশন কার্যক্রম পাওয়া যায়নি।"}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="relative overflow-hidden rounded-2xl border border-border/80 bg-surface/95 p-4 shadow-2xs hover:border-primary/40 transition-all flex flex-col justify-between gap-3 text-xs"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <Badge
                      variant="outline"
                      className="text-[10px] uppercase font-bold py-0.5 bg-primary/10 text-primary border-primary/20"
                    >
                      {log.action.replace(/_/g, " ")}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {new Date(log.createdAt).toLocaleDateString(locale === "en" ? "en-US" : "bn-BD", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="font-bold text-foreground text-xs sm:text-sm truncate">
                    {log.targetTitle || log.targetId}
                  </div>

                  <p className="text-muted-foreground line-clamp-1 text-[11px]">
                    <span className="font-medium text-foreground/80">
                      {locale === "en" ? "Reason: " : "কারণ: "}
                    </span>
                    {log.reason}
                  </p>
                </div>

                <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="font-mono truncate max-w-[200px]">
                    {log.adminEmail}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground/80">
                    {log.targetType}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
