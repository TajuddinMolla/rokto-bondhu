"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/validations/zod-resolver";
import {
  ShieldAlert,
  CheckCircle2,
  Filter,
  Loader2,
  RefreshCw,
  Clock,
  FileText,
} from "lucide-react";

import { useAdminReports } from "@/hooks/queries/use-admin-data";
import { useAdminMutations } from "@/hooks/mutations/use-admin-mutations";
import {
  createResolveReportSchema,
  type ResolveReportFormData,
} from "@/lib/validations/admin";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/forms/form-field";
import type { UserReport } from "@/types/admin";
import type { Locale } from "@/i18n/config";

interface AdminReportsViewProps {
  locale: Locale;
}

export function AdminReportsView({ locale }: AdminReportsViewProps) {
  const [statusFilter, setStatusFilter] = React.useState<string>("PENDING");

  const [activeReport, setActiveReport] = React.useState<UserReport | null>(
    null,
  );

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useAdminReports({
    status: statusFilter,
  });

  const { resolveReport } = useAdminMutations();

  const reports = data?.pages.flatMap((page) => page.items) || [];

  const resolveSchema = React.useMemo(
    () => createResolveReportSchema(locale),
    [locale],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResolveReportFormData>({
    resolver: zodResolver(resolveSchema),
    defaultValues: {
      status: "RESOLVED",
      resolutionNotes: "",
    },
  });

  const handleOpenResolve = (report: UserReport) => {
    setActiveReport(report);
    reset({
      status: "RESOLVED",
      resolutionNotes: "",
    });
  };

  const onSubmitResolve = async (formData: ResolveReportFormData) => {
    if (!activeReport) return;

    try {
      await resolveReport.mutateAsync({
        reportId: activeReport.id,
        status: formData.status,
        resolutionNotes: formData.resolutionNotes,
        targetType: activeReport.targetType,
        targetId: activeReport.targetId,
      });
      setActiveReport(null);
    } catch (err) {
      console.error("Failed to resolve report:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {locale === "en"
              ? "Reports & Flagging Queue"
              : "অভিযোগ ও নিরাপত্তা ফ্ল্যাগ"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {locale === "en"
              ? "Review user-submitted safety reports against donors or blood requisitions."
              : "রক্তদাতা বা রক্তের অনুরোধ সম্পর্কিত ব্যবহারকারীদের অভিযোগ যাচাই ও নিষ্পত্তি করুন।"}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
          className="self-start sm:self-auto text-xs"
        >
          <RefreshCw
            className={`size-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`}
          />
          {locale === "en" ? "Refresh" : "রিফ্রেশ"}
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground shrink-0">
            <Filter className="size-3.5" />
            <span>
              {locale === "en"
                ? "Filter by Status:"
                : "অবস্থা অনুসারে ফিল্টার:"}
            </span>
          </div>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs h-9 w-full sm:w-52"
          >
            <option value="ALL">
              {locale === "en" ? "All Reports" : "সকল অভিযোগ"}
            </option>
            <option value="PENDING">
              {locale === "en" ? "Pending Resolution" : "অমীমাংসিত"}
            </option>
            <option value="RESOLVED">
              {locale === "en" ? "Resolved" : "মীমাংসিত"}
            </option>
            <option value="DISMISSED">
              {locale === "en" ? "Dismissed" : "বাতিলকৃত"}
            </option>
          </Select>
        </div>
      </Card>

      {/* Reports Content: Desktop Table + Mobile Cards */}
      {isLoading ? (
        <div className="p-12 text-center text-muted-foreground rounded-3xl border border-border bg-surface/50">
          <Loader2 className="size-6 animate-spin mx-auto mb-2 text-primary" />
          <span className="text-xs font-medium">
            {locale === "en"
              ? "Loading reports queue..."
              : "অভিযোগের তালিকা লোড হচ্ছে..."}
          </span>
        </div>
      ) : isError ? (
        <Card className="p-8 text-center border-destructive/20 bg-destructive/5 rounded-3xl">
          <ShieldAlert className="size-8 text-destructive mx-auto mb-2" />
          <p className="text-sm font-semibold text-destructive">
            {locale === "en"
              ? "Unable to load reports queue."
              : "অভিযোগের তালিকা লোড করা যায়নি।"}
          </p>
        </Card>
      ) : reports.length === 0 ? (
        <Card className="p-12 text-center border-dashed rounded-3xl">
          <CheckCircle2 className="size-8 text-emerald-500 mx-auto mb-2 opacity-60" />
          <p className="text-sm font-semibold text-foreground">
            {locale === "en"
              ? "No reports in this queue"
              : "এই তালিকায় কোনো অভিযোগ নেই"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {locale === "en"
              ? "All submitted reports have been addressed or no reports match the filter."
              : "সকল অভিযোগ নিষ্পত্তি করা হয়েছে অথবা ফিল্টারের সাথে মিলছে না।"}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Mobile Card Grid View (< md) */}
          <div className="grid grid-cols-1 gap-3.5 md:hidden">
            {reports.map((report) => {
              const isPending = report.status === "PENDING";

              return (
                <div
                  key={report.id}
                  className={`relative overflow-hidden rounded-2xl border p-4 shadow-2xs space-y-3 ${
                    isPending
                      ? "border-destructive/30 bg-destructive/5"
                      : "border-border/80 bg-surface/95"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant="outline" className="text-[10px] uppercase font-bold py-0.5 bg-muted">
                          {report.targetType.replace(/_/g, " ")}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive border-destructive/20 font-bold">
                          {report.reason.replace(/_/g, " ")}
                        </Badge>
                      </div>

                      <h4 className="font-bold text-sm text-foreground">
                        {report.targetTitle || report.targetId}
                      </h4>
                    </div>

                    <div>
                      {report.status === "PENDING" ? (
                        <Badge variant="destructive" className="text-[10px] font-bold">
                          {locale === "en" ? "Pending" : "অমীমাংসিত"}
                        </Badge>
                      ) : report.status === "RESOLVED" ? (
                        <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold">
                          {locale === "en" ? "Resolved" : "মীমাংসিত"}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] bg-muted text-muted-foreground font-medium">
                          {locale === "en" ? "Dismissed" : "বাতিলকৃত"}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {report.description && (
                    <div className="text-xs text-foreground/90 bg-muted/40 p-2.5 rounded-xl border border-border/60 leading-relaxed italic">
                      &ldquo;{report.description}&rdquo;
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-border/60 text-xs text-muted-foreground">
                    <span className="font-mono text-[11px] truncate max-w-[160px]">
                      {report.reporterEmail || report.reporterId.slice(0, 8)}
                    </span>

                    {isPending ? (
                      <Button
                        variant="default"
                        size="sm"
                        className="text-xs h-8 px-3 rounded-xl font-bold"
                        onClick={() => handleOpenResolve(report)}
                      >
                        {locale === "en" ? "Resolve Report" : "নিষ্পত্তি করুন"}
                      </Button>
                    ) : (
                      <span className="text-[11px] text-muted-foreground italic">
                        {locale === "en" ? "Closed" : "সম্পন্ন"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View (>= md) */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-border/80 bg-surface/95 shadow-xs">
            <table className="w-full text-left text-xs text-foreground">
              <thead className="bg-muted/60 border-b border-border/80 font-bold text-muted-foreground uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">
                    {locale === "en" ? "Target" : "অভিযোগের বিষয়"}
                  </th>
                  <th className="px-5 py-3.5">
                    {locale === "en" ? "Reason" : "কারণ"}
                  </th>
                  <th className="px-5 py-3.5">
                    {locale === "en" ? "Description" : "বিবরণ"}
                  </th>
                  <th className="px-5 py-3.5">
                    {locale === "en" ? "Reporter" : "অভিযোগকারী"}
                  </th>
                  <th className="px-5 py-3.5">
                    {locale === "en" ? "Status" : "অবস্থা"}
                  </th>
                  <th className="px-5 py-3.5">
                    {locale === "en" ? "Date" : "তারিখ"}
                  </th>
                  <th className="px-5 py-3.5 text-right">
                    {locale === "en" ? "Actions" : "পদক্ষেপ"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {reports.map((report) => {
                  const isPending = report.status === "PENDING";

                  return (
                    <tr
                      key={report.id}
                      className={`hover:bg-muted/40 transition-colors ${
                        isPending ? "bg-amber-500/5" : ""
                      }`}
                    >
                      <td className="px-5 py-4 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <Badge
                            variant="outline"
                            className="text-[10px] uppercase font-bold py-0.5 rounded-lg bg-muted"
                          >
                            {report.targetType.replace(/_/g, " ")}
                          </Badge>
                          <span className="font-bold text-foreground">
                            {report.targetTitle || report.targetId.slice(0, 10)}
                          </span>
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                          ID: {report.targetId}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-destructive/10 text-destructive border-destructive/20 font-bold rounded-lg"
                        >
                          {report.reason.replace(/_/g, " ")}
                        </Badge>
                      </td>

                      <td className="px-5 py-4 text-muted-foreground max-w-[240px]">
                        <p
                          className="line-clamp-2 leading-relaxed"
                          title={report.description || ""}
                        >
                          {report.description || (
                            <span className="italic opacity-60">
                              {locale === "en"
                                ? "No text provided"
                                : "কোনো বিবরণ নেই"}
                            </span>
                          )}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-muted-foreground font-mono text-[11px]">
                        {report.reporterEmail || report.reporterId.slice(0, 8)}
                      </td>

                      <td className="px-5 py-4">
                        {report.status === "PENDING" ? (
                          <Badge
                            variant="destructive"
                            className="text-[10px] font-bold rounded-lg animate-pulse"
                          >
                            {locale === "en" ? "Pending" : "অমীমাংসিত"}
                          </Badge>
                        ) : report.status === "RESOLVED" ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold rounded-lg"
                          >
                            {locale === "en" ? "Resolved" : "মীমাংসিত"}
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-muted text-muted-foreground rounded-lg"
                          >
                            {locale === "en" ? "Dismissed" : "বাতিলকৃত"}
                          </Badge>
                        )}
                      </td>

                      <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center gap-1 font-mono text-[11px]">
                          <Clock className="size-3 text-muted-foreground shrink-0" />
                          <span>
                            {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-right">
                        {isPending ? (
                          <Button
                            variant="default"
                            size="sm"
                            className="text-[11px] h-7 px-3 rounded-lg font-bold shadow-xs"
                            onClick={() => handleOpenResolve(report)}
                          >
                            {locale === "en" ? "Resolve" : "নিষ্পত্তি"}
                          </Button>
                        ) : (
                          <span className="text-[11px] text-muted-foreground italic font-medium">
                            {locale === "en" ? "Closed" : "সম্পন্ন"}
                          </span>
                        )}
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
                {locale === "en" ? "Load More Reports" : "আরো অভিযোগ লোড করুন"}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Resolution Dialog */}
      <Dialog
        open={Boolean(activeReport)}
        onOpenChange={(open) => !open && setActiveReport(null)}
      >
        <DialogContent className="max-w-lg">
          {activeReport && (
            <form onSubmit={handleSubmit(onSubmitResolve)}>
              <DialogHeader>
                <div className="flex items-center gap-2.5 text-foreground">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                    <FileText className="size-5" />
                  </div>
                  <DialogTitle>
                    {locale === "en"
                      ? "Resolve Safety Report"
                      : "অভিযোগ নিষ্পত্তি করুন"}
                  </DialogTitle>
                </div>
                <DialogDescription>
                  {locale === "en"
                    ? "Record the administrative resolution and rationale. An audit entry will be generated automatically."
                    : "প্রশাসনিক সিদ্ধান্ত ও কারণ লিপিবদ্ধ করুন। একটি অডিট রেকর্ড স্বয়ংক্রিয়ভাবে তৈরি হবে।"}
                </DialogDescription>

                <div className="mt-2 p-2.5 rounded-xl bg-muted/60 text-xs font-medium text-foreground space-y-1">
                  <div>
                    <span className="text-muted-foreground">
                      {locale === "en" ? "Target: " : "বিষয়: "}
                    </span>
                    <span className="font-semibold">
                      {activeReport.targetTitle || activeReport.targetId} (
                      {activeReport.targetType})
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {locale === "en" ? "Flag: " : "কারণ: "}
                    </span>
                    <span className="font-semibold text-destructive">
                      {activeReport.reason}
                    </span>
                  </div>
                  {activeReport.description && (
                    <div className="text-muted-foreground pt-1 border-t border-border">
                      &quot;{activeReport.description}&quot;
                    </div>
                  )}
                </div>
              </DialogHeader>

              <DialogBody>
                {/* Status Selection */}
                <FormField
                  id="resolve-status"
                  label={
                    locale === "en"
                      ? "Resolution Status"
                      : "সমাধানের সিদ্ধান্ত"
                  }
                  error={errors.status?.message}
                  required
                >
                  <Select
                    id="resolve-status"
                    {...register("status")}
                    className="text-xs"
                  >
                    <option value="RESOLVED">
                      {locale === "en"
                        ? "Mark as Resolved (Action Taken / Handled)"
                        : "মীমাংসিত হিসেবে চিহ্নিত করুন (পদক্ষেপ গৃহীত)"}
                    </option>
                    <option value="DISMISSED">
                      {locale === "en"
                        ? "Dismiss Report (Invalid / False Positive)"
                        : "অভিযোগ বাতিল করুন (ভিত্তিহীন / অনিচ্ছাকৃত ভুল)"}
                    </option>
                  </Select>
                </FormField>

                {/* Resolution Notes */}
                <FormField
                  id="resolution-notes"
                  label={
                    locale === "en"
                      ? "Resolution Notes"
                      : "নিষ্পত্তির বিবরণ (বাধ্যতামূলক)"
                  }
                  error={errors.resolutionNotes?.message}
                  required
                  helperText={
                    locale === "en"
                      ? "Detail what action was taken or why this report was dismissed."
                      : "কী পদক্ষেপ নেওয়া হয়েছে বা কেন বাতিল করা হলো তা বিস্তারিত লিখুন।"
                  }
                >
                  <Textarea
                    id="resolution-notes"
                    placeholder={
                      locale === "en"
                        ? "Explain resolution details..."
                        : "নিষ্পত্তির বিস্তারিত তথ্য লিখুন..."
                    }
                    rows={3}
                    className="resize-none"
                    {...register("resolutionNotes")}
                  />
                </FormField>
              </DialogBody>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  onClick={() => setActiveReport(null)}
                  disabled={resolveReport.isPending}
                  className="min-h-[44px] rounded-xl px-5"
                >
                  {locale === "en" ? "Cancel" : "বাতিল"}
                </Button>

                <Button
                  type="submit"
                  variant="default"
                  size="default"
                  disabled={resolveReport.isPending}
                  className="min-h-[44px] rounded-xl px-5 gap-2"
                >
                  {resolveReport.isPending && (
                    <Loader2 className="size-4 animate-spin" />
                  )}
                  <span>
                    {locale === "en"
                      ? "Confirm Resolution"
                      : "নিষ্পত্তি সম্পন্ন করুন"}
                  </span>
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
