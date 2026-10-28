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
} from "lucide-react";

import {
  useAdminStats,
  useAdminAuditLogs,
} from "@/hooks/queries/use-admin-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  const recentLogs = auditData?.pages?.[0]?.items?.slice(0, 5) || [];

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          {locale === "en" ? "Moderation Overview" : "মডারেশন ওভারভিউ"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {locale === "en"
            ? "Real-time platform statistics, safety reports, and system audit trail."
            : "রিয়েল-টাইম প্ল্যাটফর্ম পরিসংখ্যান, নিরাপত্তা অভিযোগ ও সিস্টেম অডিট ট্রেইল।"}
        </p>
      </div>

      {/* Pending Reports Callout Alert */}
      {stats && stats.pendingReports > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-foreground animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive shrink-0">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-destructive">
                {locale === "en"
                  ? `${stats.pendingReports} Pending Flag${stats.pendingReports > 1 ? "s" : ""} Require Review`
                  : `${stats.pendingReports}টি অভিযোগ পর্যালোচনার অপেক্ষায় রয়েছে`}
              </h2>
              <p className="text-xs text-muted-foreground">
                {locale === "en"
                  ? "User-submitted safety reports on donors or blood requests need resolution."
                  : "রক্তদাতা বা রক্তের অনুরোধ সম্পর্কিত ব্যবহারকারীর অভিযোগ সমাধান করা প্রয়োজন।"}
              </p>
            </div>
          </div>
          <Button asChild size="sm" variant="destructive" className="shrink-0">
            <Link href={`${prefix}/reports`}>
              <span>
                {locale === "en" ? "Review Queue" : "অভিযোগ পর্যালোচনা"}
              </span>
              <ArrowRight className="size-3.5 ml-1.5" />
            </Link>
          </Button>
        </div>
      )}

      {/* Metrics Cards Grid */}
      {statsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-24 bg-muted/40" />
            </Card>
          ))}
        </div>
      ) : statsError ? (
        <Card className="border-destructive/30 bg-destructive/5 text-center p-6">
          <ShieldAlert className="size-8 text-destructive mx-auto mb-2" />
          <p className="text-sm font-semibold text-destructive">
            {locale === "en"
              ? "Failed to load dashboard metrics"
              : "ড্যাশবোর্ড তথ্য লোড করা যায়নি"}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Card: Total Users */}
          <Card className="border-border hover:border-primary/30 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {locale === "en" ? "Total Users" : "মোট ব্যবহারকারী"}
              </CardTitle>
              <Users className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground">
                {stats?.totalUsers.toLocaleString() ?? 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {locale === "en"
                  ? "Registered accounts"
                  : "নিবন্ধিত অ্যাকাউন্ট"}
              </p>
            </CardContent>
          </Card>

          {/* Card: Active Donors */}
          <Card className="border-border hover:border-primary/30 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {locale === "en" ? "Active Donors" : "সক্রিয় রক্তদাতা"}
              </CardTitle>
              <Droplets className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-extrabold text-primary">
                {stats?.activeDonors.toLocaleString() ?? 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {locale === "en"
                  ? "Created donor profiles"
                  : "তৈরি করা রক্তদাতা প্রোফাইল"}
              </p>
            </CardContent>
          </Card>

          {/* Card: Open Blood Requests */}
          <Card className="border-border hover:border-primary/30 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {locale === "en"
                  ? "Open Blood Requests"
                  : "চলমান রক্তের অনুরোধ"}
              </CardTitle>
              <Clock className="size-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                {stats?.openRequests.toLocaleString() ?? 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {locale === "en"
                  ? "Active requisitions"
                  : "সক্রিয় প্রয়োজনীয়তা"}
              </p>
            </CardContent>
          </Card>

          {/* Card: Public Donors */}
          <Card className="border-border hover:border-primary/30 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {locale === "en" ? "Public Donors" : "পাবলিক রক্তদাতা"}
              </CardTitle>
              <Globe className="size-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground">
                {stats?.publicDonors.toLocaleString() ?? 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {locale === "en"
                  ? "Direct call permitted"
                  : "সরাসরি ফোন কল অনুমোদিত"}
              </p>
            </CardContent>
          </Card>

          {/* Card: Private Donors */}
          <Card className="border-border hover:border-primary/30 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {locale === "en" ? "Private Donors" : "প্রাইভেট রক্তদাতা"}
              </CardTitle>
              <Lock className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground">
                {stats?.privateDonors.toLocaleString() ?? 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {locale === "en"
                  ? "Consent-protected contact"
                  : "অনুরোধ-ভিত্তিক যোগাযোগ"}
              </p>
            </CardContent>
          </Card>

          {/* Card: Pending Reports */}
          <Card className="border-border hover:border-primary/30 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {locale === "en" ? "Pending Reports" : "অমীমাংসিত অভিযোগ"}
              </CardTitle>
              <AlertTriangle className="size-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-extrabold text-destructive">
                {stats?.pendingReports.toLocaleString() ?? 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {locale === "en" ? "Awaiting review" : "পর্যালোচনা প্রয়োজন"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Audit Log Activity Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="size-4 text-primary" />
            <h2 className="text-base sm:text-lg font-bold text-foreground">
              {locale === "en"
                ? "Recent Moderation Activity"
                : "সাম্প্রতিক মডারেশন কার্যক্রম"}
            </h2>
          </div>
          <Button asChild variant="ghost" size="sm" className="text-xs">
            <Link href={`${prefix}/audit-logs`}>
              <span>
                {locale === "en"
                  ? "View Full Audit Trail"
                  : "সম্পূর্ণ অডিট লগ দেখুন"}
              </span>
              <ArrowRight className="size-3.5 ml-1" />
            </Link>
          </Button>
        </div>

        {auditLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            <Loader2 className="size-5 animate-spin mx-auto mb-2" />
            <span className="text-xs">
              {locale === "en"
                ? "Loading recent logs..."
                : "অডিট লগ লোড হচ্ছে..."}
            </span>
          </div>
        ) : recentLogs.length === 0 ? (
          <Card className="border-dashed p-6 text-center text-xs text-muted-foreground">
            {locale === "en"
              ? "No recent moderation actions recorded."
              : "কোনো সাম্প্রতিক মডারেশন কার্যক্রম পাওয়া যায়নি।"}
          </Card>
        ) : (
          <div className="space-y-2">
            {recentLogs.map((log) => (
              <Card
                key={log.id}
                className="p-3.5 border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="text-[10px] uppercase font-bold py-0.5"
                    >
                      {log.action.replace(/_/g, " ")}
                    </Badge>
                    <span className="font-semibold text-foreground">
                      {log.targetTitle || log.targetId}
                    </span>
                  </div>
                  <p className="text-muted-foreground line-clamp-1">
                    <span className="font-medium text-foreground/80">
                      {locale === "en" ? "Reason: " : "কারণ: "}
                    </span>
                    {log.reason}
                  </p>
                </div>
                <div className="text-muted-foreground sm:text-right shrink-0 text-[11px]">
                  <div>{log.adminEmail}</div>
                  <div>{new Date(log.createdAt).toLocaleDateString()}</div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
