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

      {/* Users Table */}
      {isLoading ? (
        <div className="p-12 text-center text-muted-foreground">
          <Loader2 className="size-6 animate-spin mx-auto mb-2 text-primary" />
          <span className="text-xs">
            {locale === "en"
              ? "Loading user accounts..."
              : "ব্যবহারকারী তালিকা লোড হচ্ছে..."}
          </span>
        </div>
      ) : isError ? (
        <Card className="p-8 text-center border-destructive/20 bg-destructive/5">
          <ShieldAlert className="size-8 text-destructive mx-auto mb-2" />
          <p className="text-sm font-semibold text-destructive">
            {locale === "en"
              ? "Unable to load users list."
              : "ব্যবহারকারী তালিকা লোড করা যায়নি।"}
          </p>
        </Card>
      ) : users.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
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
          <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
            <table className="w-full text-left text-xs text-foreground">
              <thead className="bg-muted/50 border-b border-border font-semibold text-muted-foreground uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">
                    {locale === "en" ? "User" : "ব্যবহারকারী"}
                  </th>
                  <th className="px-4 py-3">
                    {locale === "en" ? "Email" : "ইমেইল"}
                  </th>
                  <th className="px-4 py-3">
                    {locale === "en" ? "Donor Profile" : "রক্তদাতা প্রোফাইল"}
                  </th>
                  <th className="px-4 py-3">
                    {locale === "en" ? "Role" : "ভূমিকা"}
                  </th>
                  <th className="px-4 py-3">
                    {locale === "en" ? "Status" : "স্ট্যাটাস"}
                  </th>
                  <th className="px-4 py-3">
                    {locale === "en" ? "Joined" : "যোগদানের তারিখ"}
                  </th>
                  <th className="px-4 py-3 text-right">
                    {locale === "en" ? "Actions" : "পদক্ষেপ"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => {
                  const isSuspended = user.isSuspended;

                  return (
                    <tr
                      key={user.uid}
                      className={`hover:bg-muted/30 transition-colors ${
                        isSuspended ? "bg-destructive/5" : ""
                      }`}
                    >
                      <td className="px-4 py-3 font-semibold">
                        <div>{user.displayName || "Anonymous User"}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          UID: {user.uid.slice(0, 8)}...
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span>{user.email}</span>
                          {user.emailVerified ? (
                            <span
                              title="Email verified"
                              className="text-emerald-600"
                            >
                              <CheckCircle2 className="size-3" />
                            </span>
                          ) : (
                            <span
                              title="Email unverified"
                              className="text-amber-500"
                            >
                              <XCircle className="size-3" />
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        {user.hasDonorProfile ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-primary/10 text-primary border-primary/20"
                          >
                            {locale === "en" ? "Donor" : "রক্তদাতা"}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">
                            {locale === "en" ? "Regular" : "সাধারণ"}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {user.role === "admin" ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-primary/10 text-primary border-primary/20 flex items-center gap-1 w-fit"
                          >
                            <ShieldCheck className="size-3" />
                            Admin
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">User</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {isSuspended ? (
                          <div>
                            <Badge
                              variant="destructive"
                              className="text-[10px] font-bold"
                            >
                              {locale === "en" ? "Suspended" : "স্থগিত"}
                            </Badge>
                            {user.suspendedReason && (
                              <div
                                className="text-[10px] text-muted-foreground truncate max-w-[120px] mt-0.5"
                                title={user.suspendedReason}
                              >
                                {user.suspendedReason}
                              </div>
                            )}
                          </div>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          >
                            {locale === "en" ? "Active" : "সক্রিয়"}
                          </Badge>
                        )}
                      </td>

                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "—"}
                      </td>

                      <td className="px-4 py-3 text-right">
                        {isSuspended ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-[11px] h-7 px-2 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
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
                            className="text-[11px] h-7 px-2 text-destructive hover:bg-destructive/10"
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
