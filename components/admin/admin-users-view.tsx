"use client";

import * as React from "react";
import {
  Users,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Filter,
  Loader2,
  RefreshCw,
  UserX,
  UserCheck,
  User,
  Droplets,
} from "lucide-react";

import { useAdminUsers } from "@/hooks/queries/use-admin-data";
import { useAdminMutations } from "@/hooks/mutations/use-admin-mutations";
import { ModerationActionDialog } from "@/components/admin/moderation-action-dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import type { UserProfile } from "@/types/user";
import type { Locale } from "@/i18n/config";

interface AdminUsersViewProps {
  locale: Locale;
}

export function AdminUsersView({ locale }: AdminUsersViewProps) {
  const [statusFilter, setStatusFilter] = React.useState<
    "ALL" | "ACTIVE" | "SUSPENDED"
  >("ALL");

  const [dialogState, setDialogState] = React.useState<{
    isOpen: boolean;
    action: "SUSPEND" | "RESTORE";
    targetUser: UserProfile | null;
  }>({
    isOpen: false,
    action: "SUSPEND",
    targetUser: null,
  });

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useAdminUsers({
    isSuspended:
      statusFilter === "SUSPENDED"
        ? true
        : statusFilter === "ACTIVE"
          ? false
          : undefined,
  });

  const { suspendUser, restoreUser } = useAdminMutations();

  const users = data?.pages.flatMap((page) => page.items) || [];

  const handleConfirmAction = async (reason: string) => {
    if (!dialogState.targetUser) return;

    const { uid, email } = dialogState.targetUser;

    try {
      if (dialogState.action === "SUSPEND") {
        await suspendUser.mutateAsync({
          userId: uid,
          userEmail: email,
          reason,
        });
      } else {
        await restoreUser.mutateAsync({
          userId: uid,
          userEmail: email,
          reason,
        });
      }
      setDialogState({ isOpen: false, action: "SUSPEND", targetUser: null });
    } catch (err) {
      console.error("User moderation failed:", err);
    }
  };

  const isActionLoading = suspendUser.isPending || restoreUser.isPending;

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {locale === "en"
              ? "User Account Moderation"
              : "ব্যবহারকারী অ্যাকাউন্ট মডারেশন"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {locale === "en"
              ? "Inspect registered users, manage platform trust, and suspend abusive accounts."
              : "নিবন্ধিত অ্যাকাউন্ট পর্যবেক্ষণ, নীতি লঙ্ঘনকারী অ্যাকাউন্ট স্থগিত ও পুনর্বহাল করুন।"}
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
            onChange={(e) =>
              setStatusFilter(e.target.value as "ALL" | "ACTIVE" | "SUSPENDED")
            }
            className="text-xs h-9 w-full sm:w-52"
          >
            <option value="ALL">
              {locale === "en" ? "All Accounts" : "সকল অ্যাকাউন্ট"}
            </option>
            <option value="ACTIVE">
              {locale === "en" ? "Active Accounts" : "সক্রিয় অ্যাকাউন্ট"}
            </option>
            <option value="SUSPENDED">
              {locale === "en" ? "Suspended Accounts" : "স্থগিত অ্যাকাউন্ট"}
            </option>
          </Select>
        </div>
      </Card>

      {/* Users Content: Desktop Table + Mobile Cards */}
      {isLoading ? (
        <div className="p-12 text-center text-muted-foreground rounded-3xl border border-border bg-surface/50">
          <Loader2 className="size-6 animate-spin mx-auto mb-2 text-primary" />
          <span className="text-xs font-medium">
            {locale === "en"
              ? "Loading user accounts..."
              : "ব্যবহারকারী তালিকা লোড হচ্ছে..."}
          </span>
        </div>
      ) : isError ? (
        <Card className="p-8 text-center border-destructive/20 bg-destructive/5 rounded-3xl">
          <ShieldAlert className="size-8 text-destructive mx-auto mb-2" />
          <p className="text-sm font-semibold text-destructive">
            {locale === "en"
              ? "Unable to load users list."
              : "ব্যবহারকারী তালিকা লোড করা যায়নি।"}
          </p>
        </Card>
      ) : users.length === 0 ? (
        <Card className="p-12 text-center border-dashed rounded-3xl">
          <Users className="size-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-sm font-semibold text-foreground">
            {locale === "en"
              ? "No users found"
              : "কোনো ব্যবহারকারী পাওয়া যায়নি"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {locale === "en"
              ? "Try adjusting the status filter."
              : "স্ট্যাটাস ফিল্টার পরিবর্তন করে চেষ্টা করুন।"}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Mobile Card Grid View (< md) */}
          <div className="grid grid-cols-1 gap-3.5 md:hidden">
            {users.map((user) => {
              const isSuspended = user.isSuspended;

              return (
                <div
                  key={user.uid}
                  className={`relative overflow-hidden rounded-2xl border p-4 shadow-2xs space-y-3 ${
                    isSuspended
                      ? "border-destructive/30 bg-destructive/5"
                      : "border-border/80 bg-surface/95"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-foreground font-bold shrink-0">
                        <User className="size-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-foreground">
                          {user.displayName || (locale === "en" ? "Anonymous User" : "বেনামী ব্যবহারকারী")}
                        </h4>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          UID: {user.uid.slice(0, 10)}...
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {user.role?.toLowerCase() === "admin" && (
                        <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20 font-bold">
                          Admin
                        </Badge>
                      )}

                      {isSuspended ? (
                        <Badge variant="destructive" className="text-[10px] font-bold">
                          {locale === "en" ? "Suspended" : "স্থগিত"}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-500/10 border-emerald-500/20 font-bold">
                          {locale === "en" ? "Active" : "সক্রিয়"}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-1 border-t border-border/60">
                    <div>
                      <span className="text-[10px] font-medium block text-muted-foreground">
                        {locale === "en" ? "Email Address:" : "ইমেইল:"}
                      </span>
                      <div className="flex items-center gap-1 font-mono text-foreground font-medium truncate">
                        <span className="truncate">{user.email}</span>
                        {user.emailVerified ? (
                          <CheckCircle2 className="size-3 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="size-3 text-amber-500 shrink-0" />
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-medium block text-muted-foreground">
                        {locale === "en" ? "Donor Role:" : "রক্তদাতা প্রোফাইল:"}
                      </span>
                      {user.hasDonorProfile ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary">
                          <Droplets className="size-3" />
                          <span>{locale === "en" ? "Registered Donor" : "নিবন্ধিত রক্তদাতা"}</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">
                          {locale === "en" ? "Regular User" : "সাধারণ সদস্য"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Mobile Actions */}
                  <div className="flex items-center justify-between pt-1 border-t border-border/60 text-xs">
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                    </span>

                    <div>
                      {isSuspended ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-8 px-2.5 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 rounded-xl font-bold"
                          onClick={() =>
                            setDialogState({
                              isOpen: true,
                              action: "RESTORE",
                              targetUser: user,
                            })
                          }
                        >
                          <UserCheck className="size-3 mr-1" />
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
                              action: "SUSPEND",
                              targetUser: user,
                            })
                          }
                        >
                          <UserX className="size-3 mr-1" />
                          <span>{locale === "en" ? "Suspend" : "স্থগিত"}</span>
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
                    {locale === "en" ? "User" : "ব্যবহারকারী"}
                  </th>
                  <th className="px-5 py-3.5">
                    {locale === "en" ? "Email" : "ইমেইল"}
                  </th>
                  <th className="px-5 py-3.5">
                    {locale === "en" ? "Donor Profile" : "রক্তদাতা প্রোফাইল"}
                  </th>
                  <th className="px-5 py-3.5">
                    {locale === "en" ? "Role" : "ভূমিকা"}
                  </th>
                  <th className="px-5 py-3.5">
                    {locale === "en" ? "Status" : "স্ট্যাটাস"}
                  </th>
                  <th className="px-5 py-3.5">
                    {locale === "en" ? "Joined" : "যোগদানের তারিখ"}
                  </th>
                  <th className="px-5 py-3.5 text-right">
                    {locale === "en" ? "Actions" : "পদক্ষেপ"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {users.map((user) => {
                  const isSuspended = user.isSuspended;

                  return (
                    <tr
                      key={user.uid}
                      className={`hover:bg-muted/40 transition-colors ${
                        isSuspended ? "bg-destructive/5" : ""
                      }`}
                    >
                      <td className="px-5 py-4 font-semibold">
                        <div className="font-bold text-foreground">
                          {user.displayName || (locale === "en" ? "Anonymous User" : "বেনামী ব্যবহারকারী")}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          UID: {user.uid.slice(0, 10)}...
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 font-mono">
                          <span>{user.email}</span>
                          {user.emailVerified ? (
                            <span
                              title={locale === "en" ? "Email verified" : "ইমেইল ভেরিফাইড"}
                              className="text-emerald-600"
                            >
                              <CheckCircle2 className="size-3.5" />
                            </span>
                          ) : (
                            <span
                              title={locale === "en" ? "Email unverified" : "ইমেইল ভেরিফাই করা হয়নি"}
                              className="text-amber-500"
                            >
                              <XCircle className="size-3.5" />
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {user.hasDonorProfile ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-primary/10 text-primary border-primary/20 font-bold rounded-lg"
                          >
                            <Droplets className="size-2.5 mr-1" />
                            {locale === "en" ? "Donor" : "রক্তদাতা"}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">
                            {locale === "en" ? "Regular" : "সাধারণ"}
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {user.role?.toLowerCase() === "admin" ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-primary/10 text-primary border-primary/20 flex items-center gap-1 w-fit rounded-lg font-bold"
                          >
                            <ShieldCheck className="size-3" />
                            Admin
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground font-medium">User</span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {isSuspended ? (
                          <div>
                            <Badge
                              variant="destructive"
                              className="text-[10px] font-bold rounded-lg"
                            >
                              {locale === "en" ? "Suspended" : "স্থগিত"}
                            </Badge>
                            {user.suspendedReason && (
                              <div
                                className="text-[10px] text-muted-foreground truncate max-w-[140px] mt-0.5"
                                title={user.suspendedReason}
                              >
                                {user.suspendedReason}
                              </div>
                            )}
                          </div>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 rounded-lg font-bold"
                          >
                            {locale === "en" ? "Active" : "সক্রিয়"}
                          </Badge>
                        )}
                      </td>

                      <td className="px-5 py-4 text-muted-foreground whitespace-nowrap font-mono text-[11px]">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "—"}
                      </td>

                      <td className="px-5 py-4 text-right">
                        {isSuspended ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-[11px] h-7 px-2.5 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 rounded-lg font-bold"
                            onClick={() =>
                              setDialogState({
                                isOpen: true,
                                action: "RESTORE",
                                targetUser: user,
                              })
                            }
                          >
                            <UserCheck className="size-3 mr-1" />
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
                                targetUser: user,
                              })
                            }
                          >
                            <UserX className="size-3 mr-1" />
                            {locale === "en" ? "Suspend" : "স্থগিত"}
                          </Button>
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
                {locale === "en"
                  ? "Load More Users"
                  : "আরো ব্যবহারকারী লোড করুন"}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Moderation Dialog */}
      <ModerationActionDialog
        isOpen={dialogState.isOpen}
        title={
          dialogState.action === "SUSPEND"
            ? locale === "en"
              ? "Suspend User Account"
              : "ব্যবহারকারী অ্যাকাউন্ট স্থগিত করুন"
            : locale === "en"
              ? "Restore User Account"
              : "ব্যবহারকারী অ্যাকাউন্ট পুনর্বহাল করুন"
        }
        description={
          dialogState.action === "SUSPEND"
            ? locale === "en"
              ? "Suspending this user account revokes their ability to post requests or contact donors."
              : "স্থগিত করলে ব্যবহারকারী কোনো নতুন অনুরোধ বা যোগাযোগ করতে পারবেন না।"
            : locale === "en"
              ? "Restoring will reinstate full access to platform features."
              : "পুনর্বহাল করলে ব্যবহারকারী পুনরায় সকল সুবিধা ব্যবহার করতে পারবেন।"
        }
        targetTitle={
          dialogState.targetUser?.email || dialogState.targetUser?.uid
        }
        confirmLabel={
          dialogState.action === "SUSPEND"
            ? locale === "en"
              ? "Confirm Account Suspension"
              : "স্থগিতাদেশ নিশ্চিত করুন"
            : locale === "en"
              ? "Confirm Account Restoration"
              : "পুনর্বহাল নিশ্চিত করুন"
        }
        isDestructive={dialogState.action === "SUSPEND"}
        isLoading={isActionLoading}
        locale={locale}
        onConfirm={handleConfirmAction}
        onCancel={() =>
          setDialogState({ isOpen: false, action: "SUSPEND", targetUser: null })
        }
      />
    </div>
  );
}
