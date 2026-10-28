"use client";

import * as React from "react";
import {
  History,
  ShieldAlert,
  Lock,
  Filter,
  Loader2,
  RefreshCw,
  Clock,
} from "lucide-react";

import { useAdminAuditLogs } from "@/hooks/queries/use-admin-data";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import type { Locale } from "@/i18n/config";

interface AdminAuditLogsViewProps {
  locale: Locale;
}

export function AdminAuditLogsView({ locale }: AdminAuditLogsViewProps) {
  const [targetTypeFilter, setTargetTypeFilter] = React.useState<string>("ALL");

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useAdminAuditLogs({
    targetType: targetTypeFilter,
  });

  const logs = data?.pages.flatMap((page) => page.items) || [];

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {locale === "en" ? "System Audit Logs" : "সিস্টেম অডিট লগ"}
            </h1>
            <Badge
              variant="outline"
              className="text-[10px] bg-muted/60 text-muted-foreground flex items-center gap-1 py-0.5"
            >
              <Lock className="size-2.5" />
              {locale === "en" ? "Immutable" : "অপরিবর্তনীয়"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {locale === "en"
              ? "Permanent, append-only record of all administrative and moderation actions."
              : "প্রশাসনিক ও মডারেশন সংক্রান্ত সকল কার্যক্রমের স্থায়ী ও অপরিবর্তনীয় অডিট ট্রেইল।"}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
          className="self-start sm:self-auto text-xs"
        >
          <RefreshCw className={`size-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
          {locale === "en" ? "Refresh" : "রিফ্রেশ"}
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground shrink-0">
            <Filter className="size-3.5" />
            <span>{locale === "en" ? "Filter by Target:" : "বিষয় অনুসারে ফিল্টার:"}</span>
          </div>

          <Select
            value={targetTypeFilter}
            onChange={(e) => setTargetTypeFilter(e.target.value)}
            className="text-xs h-9 w-full sm:w-52"
          >
            <option value="ALL">
              {locale === "en" ? "All Targets" : "সকল বিষয়"}
            </option>
            <option value="DONOR">
              {locale === "en" ? "Donors" : "রক্তদাতা"}
            </option>
            <option value="BLOOD_REQUEST">
              {locale === "en" ? "Blood Requests" : "রক্তের অনুরোধ"}
            </option>
            <option value="USER">
              {locale === "en" ? "User Accounts" : "ব্যবহারকারী অ্যাকাউন্ট"}
            </option>
            <option value="REPORT">
              {locale === "en" ? "Reports" : "অভিযোগ"}
            </option>
          </Select>
        </div>
      </Card>

      {/* Audit Logs Table */}
      {isLoading ? (
        <div className="p-12 text-center text-muted-foreground">
          <Loader2 className="size-6 animate-spin mx-auto mb-2 text-primary" />
          <span className="text-xs">
            {locale === "en" ? "Loading audit logs..." : "অডিট লগ লোড হচ্ছে..."}
          </span>
        </div>
      ) : isError ? (
        <Card className="p-8 text-center border-destructive/20 bg-destructive/5">
          <ShieldAlert className="size-8 text-destructive mx-auto mb-2" />
          <p className="text-sm font-semibold text-destructive">
            {locale === "en"
              ? "Unable to load audit logs."
              : "অডিট লগ লোড করা যায়নি।"}
          </p>
        </Card>
      ) : logs.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <History className="size-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-sm font-semibold text-foreground">
            {locale === "en" ? "No audit logs found" : "কোনো অডিট লগ পাওয়া যায়নি"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {locale === "en"
              ? "All future administrative actions will automatically be recorded here."
              : "ভবিষ্যতের সকল প্রশাসনিক কার্যক্রম স্বয়ংক্রিয়ভাবে এখানে সংরক্ষিত হবে।"}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
            <table className="w-full text-left text-xs text-foreground">
              <thead className="bg-muted/50 border-b border-border font-semibold text-muted-foreground uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">{locale === "en" ? "Action" : "পদক্ষেপ"}</th>
                  <th className="px-4 py-3">{locale === "en" ? "Target" : "বিষয়"}</th>
                  <th className="px-4 py-3">{locale === "en" ? "Reason / Rationale" : "কারণ ও বিবরণ"}</th>
                  <th className="px-4 py-3">{locale === "en" ? "Administrator" : "প্রশাসক"}</th>
                  <th className="px-4 py-3">{locale === "en" ? "Timestamp" : "তারিখ ও সময়"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((log) => {
                  const isDestructive =
                    log.action.includes("SUSPEND") || log.action.includes("HIDE");

                  return (
                    <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-semibold">
                        <Badge
                          variant="outline"
                          className={`text-[10px] uppercase font-bold ${
                            isDestructive
                              ? "bg-destructive/10 text-destructive border-destructive/20"
                              : "bg-primary/10 text-primary border-primary/20"
                          }`}
                        >
                          {log.action.replace(/_/g, " ")}
                        </Badge>
                      </td>

                      <td className="px-4 py-3 font-medium">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-foreground">
                            {log.targetTitle || log.targetId}
                          </span>
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                          {log.targetType} • ID: {log.targetId.slice(0, 10)}...
                        </div>
                      </td>

                      <td className="px-4 py-3 text-muted-foreground max-w-[280px]">
                        <p className="line-clamp-2" title={log.reason}>
                          {log.reason}
                        </p>
                      </td>

                      <td className="px-4 py-3 text-foreground font-mono text-[11px]">
                        <div>{log.adminEmail || log.adminId}</div>
                        <div className="text-[10px] text-muted-foreground">
                          UID: {log.adminId.slice(0, 8)}...
                        </div>
                      </td>

                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Clock className="size-3" />
                          <span>{new Date(log.createdAt).toLocaleString()}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {hasNextPage && (
            <div className="pt-2 text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="text-xs"
              >
                {isFetchingNextPage ? (
                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                ) : null}
                {locale === "en" ? "Load More Audit Logs" : "আরো অডিট লগ লোড করুন"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
