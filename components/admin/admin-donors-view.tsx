"use client";

import * as React from "react";
import {
  Users,
  ShieldAlert,
  Lock,
  Globe,
  Eye,
  EyeOff,
  Filter,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { useAdminDonors } from "@/hooks/queries/use-admin-data";
import { useAdminMutations } from "@/hooks/mutations/use-admin-mutations";
import { ModerationActionDialog } from "@/components/admin/moderation-action-dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { BLOOD_GROUPS, type BloodGroup } from "@/constants/blood-groups";
import { formatLocation } from "@/constants/locations";
import type { DonorProfile } from "@/types/donor";
import type { Locale } from "@/i18n/config";

interface AdminDonorsViewProps {
  locale: Locale;
}

export function AdminDonorsView({ locale }: AdminDonorsViewProps) {
  const [bloodGroup, setBloodGroup] = React.useState<string>("ALL");
  const [statusFilter, setStatusFilter] = React.useState<
    "ALL" | "ACTIVE" | "SUSPENDED"
  >("ALL");
  const [revealedPhones, setRevealedPhones] = React.useState<
    Record<string, boolean>
  >({});

  // Active modal state
  const [dialogState, setDialogState] = React.useState<{
    isOpen: boolean;
    action: "SUSPEND" | "RESTORE" | "PRIVATIZE";
    targetDonor: DonorProfile | null;
  }>({
    isOpen: false,
    action: "SUSPEND",
    targetDonor: null,
  });

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useAdminDonors({
    bloodGroup: bloodGroup !== "ALL" ? (bloodGroup as BloodGroup) : undefined,
    statusFilter,
  });

  const { suspendDonor, restoreDonor, privatizeDonorPhone } =
    useAdminMutations();

  const donors = data?.pages.flatMap((page) => page.items) || [];

  const togglePhoneReveal = (donorId: string) => {
    setRevealedPhones((prev) => ({
      ...prev,
      [donorId]: !prev[donorId],
    }));
  };

  const maskPhone = (phone: string) => {
    if (!phone || phone.length < 8) return phone;
    const start = phone.slice(0, 3);
    const end = phone.slice(-3);
    return `${start}•••••${end}`;
  };

  const handleConfirmAction = async (reason: string) => {
    if (!dialogState.targetDonor) return;

    const donorId = dialogState.targetDonor.id;
    const donorName = dialogState.targetDonor.displayName;

    try {
      if (dialogState.action === "SUSPEND") {
        await suspendDonor.mutateAsync({ donorId, donorName, reason });
      } else if (dialogState.action === "RESTORE") {
        await restoreDonor.mutateAsync({ donorId, donorName, reason });
      } else if (dialogState.action === "PRIVATIZE") {
        await privatizeDonorPhone.mutateAsync({ donorId, donorName, reason });
      }
      setDialogState({ isOpen: false, action: "SUSPEND", targetDonor: null });
    } catch (err) {
      console.error("Moderation action failed:", err);
    }
  };

  const isActionLoading =
    suspendDonor.isPending ||
    restoreDonor.isPending ||
    privatizeDonorPhone.isPending;

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {locale === "en" ? "Donor Moderation" : "রক্তদাতা প্রোফাইল মডারেশন"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {locale === "en"
              ? "Review registered donors, protect privacy, and manage profile status."
              : "নিবন্ধিত রক্তদাতাদের প্রোফাইল পর্যালোচনা, গোপনীয়তা রক্ষা ও স্ট্যাটাস পরিচালনা করুন।"}
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
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground shrink-0">
            <Filter className="size-3.5" />
            <span>{locale === "en" ? "Filters:" : "ফিল্টারসমূহ:"}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full sm:w-auto">
            {/* Blood Group Filter */}
            <Select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              className="text-xs h-9 w-full sm:w-44"
            >
              <option value="ALL">
                {locale === "en" ? "All Blood Groups" : "সকল রক্তের গ্রুপ"}
              </option>
              {BLOOD_GROUPS.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </Select>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as "ALL" | "ACTIVE" | "SUSPENDED",
                )
              }
              className="text-xs h-9 w-full sm:w-44"
            >
              <option value="ALL">
                {locale === "en" ? "All Statuses" : "সকল স্ট্যাটাস"}
              </option>
              <option value="ACTIVE">
                {locale === "en" ? "Active Only" : "কেবলমাত্র সক্রিয়"}
              </option>
              <option value="SUSPENDED">
                {locale === "en" ? "Suspended Only" : "কেবলমাত্র স্থগিত"}
              </option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Donors Content: Desktop Table + Mobile Cards */}
      {isLoading ? (
        <div className="p-12 text-center text-muted-foreground rounded-3xl border border-border bg-surface/50">
          <Loader2 className="size-6 animate-spin mx-auto mb-2 text-primary" />
          <span className="text-xs font-medium">
            {locale === "en"
              ? "Loading donor profiles..."
              : "রক্তদাতা তালিকা লোড হচ্ছে..."}
          </span>
        </div>
      ) : isError ? (
        <Card className="p-8 text-center border-destructive/20 bg-destructive/5 rounded-3xl">
          <ShieldAlert className="size-8 text-destructive mx-auto mb-2" />
          <p className="text-sm font-semibold text-destructive">
            {locale === "en"
              ? "Unable to load donors list."
              : "রক্তদাতাদের তালিকা লোড করা যায়নি।"}
          </p>
        </Card>
      ) : donors.length === 0 ? (
        <Card className="p-12 text-center border-dashed rounded-3xl">
          <Users className="size-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-sm font-semibold text-foreground">
            {locale === "en"
              ? "No donors found"
              : "কোনো রক্তদাতা পাওয়া যায়নি"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {locale === "en"
              ? "Try adjusting the blood group or status filters."
              : "রক্তের গ্রুপ বা স্ট্যাটাস ফিল্টার পরিবর্তন করে চেষ্টা করুন।"}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Mobile Card Grid View (< md) */}
          <div className="grid grid-cols-1 gap-3.5 md:hidden">
            {donors.map((donor) => {
              const isRevealed = revealedPhones[donor.id];
              const locationText = formatLocation(
                {
                  divisionId: donor.divisionId,
                  districtId: donor.districtId,
                  upazilaId: donor.upazilaId,
                },
                locale,
              );

              return (
                <div
                  key={donor.id}
                  className={`relative overflow-hidden rounded-2xl border p-4 shadow-2xs space-y-3 ${
                    donor.isSuspended
                      ? "border-destructive/30 bg-destructive/5"
                      : "border-border/80 bg-surface/95"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-rose-600 to-primary text-white font-black text-sm shrink-0 shadow-xs">
                        {donor.bloodGroup}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-foreground">{donor.displayName}</h4>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          ID: {donor.id.slice(0, 10)}...
                        </span>
                      </div>
                    </div>

                    {donor.isSuspended ? (
                      <Badge variant="destructive" className="text-[10px] font-bold">
                        {locale === "en" ? "Suspended" : "স্থগিত"}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-500/10 border-emerald-500/20">
                        {locale === "en" ? "Active" : "সক্রিয়"}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-1 border-t border-border/60">
                    <div>
                      <span className="text-[10px] font-medium block text-muted-foreground">
                        {locale === "en" ? "Location:" : "ঠিকানা:"}
                      </span>
                      <span className="font-medium text-foreground truncate block">{locationText || "—"}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-medium block text-muted-foreground">
                        {locale === "en" ? "Contact Privacy:" : "গোপনীয়তা:"}
                      </span>
                      {donor.contactMode === "PUBLIC" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                          <Globe className="size-3" />
                          <span>{locale === "en" ? "Public Call" : "পাবলিক কল"}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                          <Lock className="size-3" />
                          <span>{locale === "en" ? "Protected Mode" : "প্রাইভেট মোড"}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Phone reveal row */}
                  <div className="flex items-center justify-between text-xs bg-muted/40 p-2.5 rounded-xl border border-border/60">
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="text-foreground font-bold">
                        {isRevealed ? donor.phoneNumber : maskPhone(donor.phoneNumber)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => togglePhoneReveal(donor.id)}
                      className="text-xs text-primary font-semibold flex items-center gap-1 px-2 py-0.5 rounded-lg hover:bg-primary/10 transition-colors"
                    >
                      {isRevealed ? (
                        <>
                          <EyeOff className="size-3.5" />
                          <span>{locale === "en" ? "Hide" : "লুকান"}</span>
                        </>
                      ) : (
                        <>
                          <Eye className="size-3.5" />
                          <span>{locale === "en" ? "Reveal" : "দেখুন"}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Mobile Actions */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    {donor.contactMode === "PUBLIC" && !donor.isSuspended && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-8 rounded-xl"
                        onClick={() =>
                          setDialogState({
                            isOpen: true,
                            action: "PRIVATIZE",
                            targetDonor: donor,
                          })
                        }
                      >
                        {locale === "en" ? "Make Private" : "প্রাইভেট করুন"}
                      </Button>
                    )}

                    {donor.isSuspended ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-8 rounded-xl text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 font-bold"
                        onClick={() =>
                          setDialogState({
                            isOpen: true,
                            action: "RESTORE",
                            targetDonor: donor,
                          })
                        }
                      >
                        {locale === "en" ? "Restore Profile" : "পুনর্বহাল"}
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-8 rounded-xl text-destructive hover:bg-destructive/10 font-medium"
                        onClick={() =>
                          setDialogState({
                            isOpen: true,
                            action: "SUSPEND",
                            targetDonor: donor,
                          })
                        }
                      >
                        {locale === "en" ? "Suspend" : "স্থগিত"}
                      </Button>
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
                    {locale === "en" ? "Donor" : "রক্তদাতা"}
                  </th>
                  <th className="px-5 py-3.5">
                    {locale === "en" ? "Group" : "গ্রুপ"}
                  </th>
                  <th className="px-5 py-3.5">
                    {locale === "en" ? "Location" : "ঠিকানা"}
                  </th>
                  <th className="px-5 py-3.5">
                    {locale === "en" ? "Contact Mode" : "যোগাযোগের ধরন"}
                  </th>
                  <th className="px-5 py-3.5">
                    {locale === "en" ? "Phone (Privacy)" : "ফোন নম্বর"}
                  </th>
                  <th className="px-5 py-3.5">
                    {locale === "en" ? "Status" : "স্ট্যাটাস"}
                  </th>
                  <th className="px-5 py-3.5 text-right">
                    {locale === "en" ? "Actions" : "পদক্ষেপ"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {donors.map((donor) => {
                  const isRevealed = revealedPhones[donor.id];
                  const locationText = formatLocation(
                    {
                      divisionId: donor.divisionId,
                      districtId: donor.districtId,
                      upazilaId: donor.upazilaId,
                    },
                    locale,
                  );

                  return (
                    <tr
                      key={donor.id}
                      className={`hover:bg-muted/40 transition-colors ${
                        donor.isSuspended ? "bg-destructive/5" : ""
                      }`}
                    >
                      <td className="px-5 py-4 font-semibold">
                        <div className="font-bold text-foreground">{donor.displayName}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          ID: {donor.id.slice(0, 10)}...
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <Badge
                          variant="outline"
                          className="font-black text-xs bg-primary/5 text-primary border-primary/20 px-2.5 py-0.5 rounded-lg"
                        >
                          {donor.bloodGroup}
                        </Badge>
                      </td>

                      <td
                        className="px-5 py-4 text-muted-foreground max-w-[200px] truncate"
                        title={locationText}
                      >
                        {locationText}
                      </td>

                      <td className="px-5 py-4">
                        {donor.contactMode === "PUBLIC" ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 flex items-center gap-1 w-fit rounded-lg font-bold"
                          >
                            <Globe className="size-2.5" />
                            {locale === "en" ? "Public" : "পাবলিক"}
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-muted text-muted-foreground flex items-center gap-1 w-fit rounded-lg"
                          >
                            <Lock className="size-2.5" />
                            {locale === "en" ? "Private" : "প্রাইভেট"}
                          </Badge>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="font-semibold">
                            {isRevealed
                              ? donor.phoneNumber
                              : maskPhone(donor.phoneNumber)}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePhoneReveal(donor.id)}
                            className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors cursor-pointer"
                            title={
                              isRevealed
                                ? "Hide number"
                                : "Reveal number (admin)"
                            }
                            aria-label={
                              isRevealed
                                ? "Hide phone number"
                                : "Reveal phone number"
                            }
                          >
                            {isRevealed ? (
                              <EyeOff className="size-3.5 text-primary" />
                            ) : (
                              <Eye className="size-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {donor.isSuspended ? (
                          <Badge
                            variant="destructive"
                            className="text-[10px] font-bold rounded-lg"
                          >
                            {locale === "en" ? "Suspended" : "স্থগিত"}
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[10px] text-emerald-600 bg-emerald-500/10 border-emerald-500/20 rounded-lg font-bold"
                          >
                            {locale === "en" ? "Active" : "সক্রিয়"}
                          </Badge>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {donor.contactMode === "PUBLIC" &&
                            !donor.isSuspended && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-[11px] h-7 px-2 rounded-lg font-medium"
                                onClick={() =>
                                  setDialogState({
                                    isOpen: true,
                                    action: "PRIVATIZE",
                                    targetDonor: donor,
                                  })
                                }
                              >
                                {locale === "en"
                                  ? "Make Private"
                                  : "প্রাইভেট করুন"}
                              </Button>
                            )}

                          {donor.isSuspended ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-[11px] h-7 px-2.5 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 rounded-lg font-bold"
                              onClick={() =>
                                setDialogState({
                                  isOpen: true,
                                  action: "RESTORE",
                                  targetDonor: donor,
                                })
                              }
                            >
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
                                  action: "SUSPEND",
                                  targetDonor: donor,
                                })
                              }
                            >
                              {locale === "en" ? "Suspend" : "স্থগিত"}
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
                {locale === "en" ? "Load More Donors" : "আরো রক্তদাতা লোড করুন"}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Moderation Action Dialog */}
      <ModerationActionDialog
        isOpen={dialogState.isOpen}
        title={
          dialogState.action === "SUSPEND"
            ? locale === "en"
              ? "Suspend Donor Profile"
              : "রক্তদাতা প্রোফাইল স্থগিত করুন"
            : dialogState.action === "RESTORE"
              ? locale === "en"
                ? "Restore Donor Profile"
                : "রক্তদাতা প্রোফাইল পুনর্বহাল করুন"
              : locale === "en"
                ? "Switch Donor to Private Contact"
                : "রক্তদাতার যোগাযোগ প্রাইভেট করুন"
        }
        description={
          dialogState.action === "SUSPEND"
            ? locale === "en"
              ? "Suspending this donor profile removes them from public search and flags their account."
              : "স্থগিত করলে রক্তদাতা পাবলিক অনুসন্ধান থেকে বাদ পড়বেন এবং তার প্রোফাইল স্থগিত হিসেবে চিহ্নিত হবে।"
            : dialogState.action === "RESTORE"
              ? locale === "en"
                ? "Restoring will reactivate the donor profile for blood requests and donor discovery."
                : "পুনর্বহাল করলে রক্তদাতার প্রোফাইলটি অনুসন্ধানের জন্য পুনরায় সক্রিয় করা হবে।"
              : locale === "en"
                ? "Removes the donor's phone number from public discovery, requiring explicit contact requests."
                : "পাবলিক অনুসন্ধান থেকে ফোন নম্বরটি মুছে ফেলা হবে এবং যোগাযোগে অনুমতি নিতে হবে।"
        }
        targetTitle={dialogState.targetDonor?.displayName}
        confirmLabel={
          dialogState.action === "SUSPEND"
            ? locale === "en"
              ? "Confirm Suspension"
              : "স্থগিতাদেশ নিশ্চিত করুন"
            : dialogState.action === "RESTORE"
              ? locale === "en"
                ? "Confirm Restoration"
                : "পুনর্বহাল নিশ্চিত করুন"
              : locale === "en"
                ? "Confirm Private Mode"
                : "প্রাইভেট নিশ্চিত করুন"
        }
        isDestructive={dialogState.action === "SUSPEND"}
        isLoading={isActionLoading}
        locale={locale}
        onConfirm={handleConfirmAction}
        onCancel={() =>
          setDialogState({
            isOpen: false,
            action: "SUSPEND",
            targetDonor: null,
          })
        }
      />
    </div>
  );
}
