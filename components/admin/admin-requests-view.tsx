"use client";

import * as React from "react";
import Link from "next/link";
import {
  Droplets,
  ShieldAlert,
  Clock,
  Building2,
  Filter,
  Loader2,
  RefreshCw,
  EyeOff,
  Eye,
  ExternalLink,
  MapPin,
} from "lucide-react";

import { useAdminRequests } from "@/hooks/queries/use-admin-data";
import { useAdminMutations } from "@/hooks/mutations/use-admin-mutations";
import { ModerationActionDialog } from "@/components/admin/moderation-action-dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { formatLocation } from "@/constants/locations";
import type { BloodRequest } from "@/types/request";
import type { Locale } from "@/i18n/config";

interface AdminRequestsViewProps {
  locale: Locale;
}

export function AdminRequestsView({ locale }: AdminRequestsViewProps) {
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");

  const [dialogState, setDialogState] = React.useState<{
    isOpen: boolean;
    action: "HIDE" | "RESTORE";
    targetRequest: BloodRequest | null;
  }>({
    isOpen: false,
    action: "HIDE",
    targetRequest: null,
  });

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useAdminRequests({
    status: statusFilter,
  });

  const { hideBloodRequest, restoreBloodRequest } = useAdminMutations();

  const requests = data?.pages.flatMap((page) => page.items) || [];

  const handleConfirmAction = async (reason: string) => {
    if (!dialogState.targetRequest) return;

    const { id, requesterId, requesterName } = dialogState.targetRequest;

    try {
      if (dialogState.action === "HIDE") {
        await hideBloodRequest.mutateAsync({
          requestId: id,
          requesterId,
          requesterName,
          reason,
        });
      } else {
        await restoreBloodRequest.mutateAsync({
          requestId: id,
          requesterId,
          requesterName,
          reason,
        });
      }
      setDialogState({ isOpen: false, action: "HIDE", targetRequest: null });
    } catch (err) {
      console.error("Request moderation failed:", err);
    }
  };

  const isActionLoading =
    hideBloodRequest.isPending || restoreBloodRequest.isPending;

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {locale === "en"
              ? "Blood Request Moderation"
              : "রক্তের অনুরোধ মডারেশন"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {locale === "en"
              ? "Review emergency blood requisitions, handle abusive posts, and manage visibility."
              : "জরুরি রক্তের প্রয়োজনীয়তা পর্যবেক্ষণ, ক্ষতিকর পোস্ট অপসারণ ও প্রদর্শন নিয়ন্ত্রণ করুন।"}
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
                : "স্ট্যাটাস অনুসারে ফিল্টার:"}
            </span>
          </div>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs h-9 w-full sm:w-52"
          >
            <option value="ALL">
              {locale === "en" ? "All Statuses" : "সকল স্ট্যাটাস"}
            </option>
            <option value="open">
              {locale === "en" ? "Open (Active)" : "চলমান (সক্রিয়)"}
            </option>
            <option value="fulfilled">
              {locale === "en" ? "Fulfilled" : "সম্পন্ন"}
            </option>
            <option value="cancelled">
              {locale === "en" ? "Cancelled by User" : "বাতিলকৃত"}
            </option>
            <option value="hidden">
              {locale === "en" ? "Hidden by Admin" : "প্রশাসনিকভাবে লুকানো"}
            </option>
          </Select>
        </div>
      </Card>

      {/* Requests Content: Desktop Table + Mobile Cards */}
      {isLoading ? (
        <div className="p-12 text-center text-muted-foreground rounded-3xl border border-border bg-surface/50">
          <Loader2 className="size-6 animate-spin mx-auto mb-2 text-primary" />
          <span className="text-xs font-medium">
            {locale === "en"
              ? "Loading blood requests..."
              : "রক্তের অনুরোধ লোড হচ্ছে..."}
          </span>
        </div>
      ) : isError ? (
        <Card className="p-8 text-center border-destructive/20 bg-destructive/5 rounded-3xl">
          <ShieldAlert className="size-8 text-destructive mx-auto mb-2" />
          <p className="text-sm font-semibold text-destructive">
            {locale === "en"
              ? "Unable to load blood requests list."
              : "রক্তের অনুরোধ তালিকা লোড করা যায়নি।"}
          </p>
        </Card>
      ) : requests.length === 0 ? (
        <Card className="p-12 text-center border-dashed rounded-3xl">
          <Droplets className="size-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-sm font-semibold text-foreground">
            {locale === "en"
              ? "No blood requests found"
              : "কোনো রক্তের অনুরোধ পাওয়া যায়নি"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {locale === "en"
              ? "Try selecting a different status filter."
              : "অন্য একটি স্ট্যাটাস ফিল্টার নির্বাচন করে চেষ্টা করুন।"}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Mobile Card Grid View (< md) */}
          <div className="grid grid-cols-1 gap-3.5 md:hidden">
            {requests.map((req) => {
              const locationText = formatLocation(
                {
                  divisionId: req.divisionId,
                  districtId: req.districtId,
                  upazilaId: req.upazilaId,
                },
                locale,
              );
              const isHidden = req.status === "hidden";
              const requestHref = `${locale === "en" ? "/en" : ""}/blood-request/${req.id}`;

              return (
                <div
                  key={req.id}
                  className={`relative overflow-hidden rounded-2xl border p-4 shadow-2xs space-y-3 ${
                    isHidden
                      ? "border-destructive/30 bg-destructive/5"
                      : "border-border/80 bg-surface/95"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-rose-600 to-primary text-white font-black text-sm shrink-0 shadow-xs">
                        {req.bloodGroup}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-foreground">{req.requesterName}</h4>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {req.unitsNeeded} {locale === "en" ? "bags" : "ব্যাগ"} • ID: {req.id.slice(0, 8)}...
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className={`text-[10px] uppercase font-bold ${
                          req.urgency === "critical"
                            ? "bg-destructive/10 text-destructive border-destructive/20"
                            : req.urgency === "urgent"
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {req.urgency}
                      </Badge>

                      {isHidden ? (
                        <Badge variant="destructive" className="text-[10px] font-bold">
                          {locale === "en" ? "Hidden" : "লুকানো"}
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold ${
                            req.status === "open"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {req.status}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-1 border-t border-border/60">
                    <div>
                      <span className="text-[10px] font-medium block text-muted-foreground">
                        {locale === "en" ? "Hospital:" : "হাসপাতাল:"}
                      </span>
                      <span className="font-medium text-foreground truncate block">
                        {req.hospitalName ? `${req.hospitalName} • ${locationText}` : locationText}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-medium block text-muted-foreground">
                        {locale === "en" ? "Needed By:" : "প্রয়োজনের সময়:"}
                      </span>
                      <span className="font-mono text-foreground font-medium block">
                        {req.neededAt}
                      </span>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-between pt-1 border-t border-border/60">
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="text-xs h-8 px-2 text-primary font-bold gap-1"
                    >
                      <Link href={requestHref} target="_blank">
                        <span>{locale === "en" ? "Public Post" : "পোস্ট দেখুন"}</span>
                        <ExternalLink className="size-3" />
                      </Link>
                    </Button>

                    <div className="flex items-center gap-1.5">
                      {isHidden ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-8 px-2.5 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 rounded-xl font-bold"
                          onClick={() =>
                            setDialogState({
                              isOpen: true,
                              action: "RESTORE",
                              targetRequest: req,
                            })
                          }
                        >
                          <Eye className="size-3 mr-1" />
                          <span>{locale === "en" ? "Restore" : "পুনর্বহাল"}</span>
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-8 px-2.5 text-destructive hover:bg-destructive/10 rounded-xl font-medium"
                          onClick={() =>
                            setDialogState({
                              isOpen: true,
                              action: "HIDE",
                              targetRequest: req,
                            })
                          }
                        >
                          <EyeOff className="size-3 mr-1" />
                          <span>{locale === "en" ? "Hide" : "লুকান"}</span>
                        </Button>
                      )}
                    </div>
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
                    {locale === "en" ? "Requester" : "আবেদনকারী"}
                  </th>
                  <th className="px-5 py-3.5">
                    {locale === "en" ? "Group" : "গ্রুপ"}
                  </th>
                  <th className="px-5 py-3.5">
                    {locale === "en" ? "Units" : "পরিমাণ"}
                  </th>
                  <th className="px-5 py-3.5">
                    {locale === "en"
                      ? "Hospital & Location"
                      : "হাসপাতাল ও এলাকা"}
                  </th>
                  <th className="px-5 py-3.5">
                    {locale === "en" ? "Urgency" : "জরুরিতা"}
                  </th>
                  <th className="px-5 py-3.5">
                    {locale === "en" ? "Status" : "স্ট্যাটাস"}
                  </th>
                  <th className="px-5 py-3.5">
                    {locale === "en" ? "Needed At" : "প্রয়োজনের সময়"}
                  </th>
                  <th className="px-5 py-3.5 text-right">
                    {locale === "en" ? "Actions" : "পদক্ষেপ"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {requests.map((req) => {
                  const locationText = formatLocation(
                    {
                      divisionId: req.divisionId,
                      districtId: req.districtId,
                      upazilaId: req.upazilaId,
                    },
                    locale,
                  );

                  const isHidden = req.status === "hidden";
                  const requestHref = `${locale === "en" ? "/en" : ""}/blood-request/${req.id}`;

                  return (
                    <tr
                      key={req.id}
                      className={`hover:bg-muted/40 transition-colors ${
                        isHidden ? "bg-destructive/5" : ""
                      }`}
                    >
                      <td className="px-5 py-4 font-semibold">
                        <div className="font-bold text-foreground">{req.requesterName}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          ID: {req.id.slice(0, 10)}...
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <Badge
                          variant="outline"
                          className="font-black text-xs bg-primary/5 text-primary border-primary/20 px-2.5 py-0.5 rounded-lg"
                        >
                          {req.bloodGroup}
                        </Badge>
                      </td>

                      <td className="px-5 py-4 font-bold text-foreground">
                        {req.unitsNeeded} {locale === "en" ? "bags" : "ব্যাগ"}
                      </td>

                      <td className="px-5 py-4 text-muted-foreground max-w-[200px]">
                        {req.hospitalName ? (
                          <div className="font-bold text-foreground truncate flex items-center gap-1.5">
                            <Building2 className="size-3.5 text-primary shrink-0" />
                            <span className="truncate">{req.hospitalName}</span>
                          </div>
                        ) : null}
                        <div className="text-[11px] truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="size-3 text-muted-foreground shrink-0" />
                          <span>{locationText}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <Badge
                          variant="outline"
                          className={`text-[10px] uppercase font-bold rounded-lg ${
                            req.urgency === "critical"
                              ? "bg-destructive/10 text-destructive border-destructive/20"
                              : req.urgency === "urgent"
                                ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {req.urgency}
                        </Badge>
                      </td>

                      <td className="px-5 py-4">
                        {isHidden ? (
                          <div>
                            <Badge
                              variant="destructive"
                              className="text-[10px] font-bold rounded-lg"
                            >
                              {locale === "en" ? "Hidden" : "লুকানো"}
                            </Badge>
                            {req.hiddenReason && (
                              <div
                                className="text-[10px] text-muted-foreground truncate max-w-[120px] mt-0.5"
                                title={req.hiddenReason}
                              >
                                {req.hiddenReason}
                              </div>
                            )}
                          </div>
                        ) : (
                          <Badge
                            variant="outline"
                            className={`text-[10px] rounded-lg font-bold ${
                              req.status === "open"
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {req.status}
                          </Badge>
                        )}
                      </td>

                      <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center gap-1 font-mono text-[11px]">
                          <Clock className="size-3 text-muted-foreground shrink-0" />
                          <span>{req.neededAt}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="text-[11px] h-7 px-2 text-primary font-bold"
                          >
                            <Link href={requestHref} target="_blank">
                              <ExternalLink className="size-3" />
                            </Link>
                          </Button>

                          {isHidden ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-[11px] h-7 px-2.5 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 rounded-lg font-bold"
                              onClick={() =>
                                setDialogState({
                                  isOpen: true,
                                  action: "RESTORE",
                                  targetRequest: req,
                                })
                              }
                            >
                              <Eye className="size-3 mr-1" />
                              {locale === "en" ? "Restore" : "পুনর্বহাল"}
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-[11px] h-7 px-2 rounded-lg text-destructive hover:bg-destructive/10 font-medium"
                              onClick={() =>
                                setDialogState({
                                  isOpen: true,
                                  action: "HIDE",
                                  targetRequest: req,
                                })
                              }
                            >
                              <EyeOff className="size-3 mr-1" />
                              {locale === "en" ? "Hide" : "লুকান"}
                            </Button>
                          )}
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
                {locale === "en"
                  ? "Load More Requests"
                  : "আরো রক্তের অনুরোধ লোড করুন"}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Moderation Dialog */}
      <ModerationActionDialog
        isOpen={dialogState.isOpen}
        title={
          dialogState.action === "HIDE"
            ? locale === "en"
              ? "Hide Blood Request"
              : "রক্তের অনুরোধ লুকান"
            : locale === "en"
              ? "Restore Blood Request"
              : "রক্তের অনুরোধ পুনর্বহাল করুন"
        }
        description={
          dialogState.action === "HIDE"
            ? locale === "en"
              ? "Hiding this blood request removes it from all public lists and notifications."
              : "লুকিয়ে ফেললে এই অনুরোধটি সকল পাবলিক তালিকা ও বিজ্ঞপ্তি থেকে সরানো হবে।"
            : locale === "en"
              ? "Restoring will reactivate the blood request back to open status."
              : "পুনর্বহাল করলে এই অনুরোধটি পুনরায় 'চলমান' অবস্থায় ফিরে আসবে।"
        }
        targetTitle={
          dialogState.targetRequest
            ? `${dialogState.targetRequest.bloodGroup} by ${dialogState.targetRequest.requesterName}`
            : undefined
        }
        confirmLabel={
          dialogState.action === "HIDE"
            ? locale === "en"
              ? "Confirm Hide"
              : "লুকানো নিশ্চিত করুন"
            : locale === "en"
              ? "Confirm Restore"
              : "পুনর্বহাল নিশ্চিত করুন"
        }
        isDestructive={dialogState.action === "HIDE"}
        isLoading={isActionLoading}
        locale={locale}
        onConfirm={handleConfirmAction}
        onCancel={() =>
          setDialogState({ isOpen: false, action: "HIDE", targetRequest: null })
        }
      />
    </div>
  );
}
