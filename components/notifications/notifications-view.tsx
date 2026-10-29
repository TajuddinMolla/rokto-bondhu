"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  Loader2,
  Inbox,
  AlertCircle,
  Filter,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import {
  useNotificationsInfinite,
  useUnreadNotificationsCount,
} from "@/hooks/queries/use-notifications";
import { useMarkAllNotificationsAsRead } from "@/hooks/mutations/use-notification-mutations";
import { NotificationItem } from "@/components/notifications/notification-item";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Locale } from "@/i18n/config";

interface NotificationsViewProps {
  locale: Locale;
}

export function NotificationsView({ locale }: NotificationsViewProps) {
  const router = useRouter();
  const { user, status } = useAuth();
  const [unreadOnly, setUnreadOnly] = React.useState(false);

  const prefix = locale === "en" ? "/en" : "";
  const loginHref = `${prefix}/login`;

  // Redirect if unauthenticated
  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push(loginHref);
    }
  }, [status, router, loginHref]);

  const { data: unreadCount = 0 } = useUnreadNotificationsCount(user?.uid);
  const pushState = usePushNotifications();
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useNotificationsInfinite({
    recipientId: user?.uid,
    pageSize: 20,
    unreadOnly,
  });

  React.useEffect(() => {
    if (error) {
      console.error("[RoktoBondhu] Notifications view error:", error);
    }
  }, [error]);

  const markAllMutation = useMarkAllNotificationsAsRead();

  const notifications = React.useMemo(() => {
    return data?.pages.flatMap((page) => page.notifications) || [];
  }, [data]);

  const handleMarkAllAsRead = () => {
    if (!user?.uid) return;
    markAllMutation.mutate({ recipientId: user.uid });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Sidebar: Filters, Quick Actions & Web Push Controls (Desktop 4 cols / Mobile 1 col) */}
      <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
        {/* Filter & Controls Card */}
        <Card className="border border-border/80 bg-surface shadow-xs transition-shadow hover:shadow-sm">
          <CardHeader className="pb-4 border-b border-border/70">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Filter className="size-4 text-primary" aria-hidden="true" />
                <CardTitle className="text-base font-bold text-foreground">
                  {locale === "en" ? "Filter Notifications" : "ফিল্টার ও নিয়ন্ত্রণ"}
                </CardTitle>
              </div>
              {unreadCount > 0 && (
                <Badge variant="default" className="text-xs font-bold px-2 py-0.5">
                  {unreadCount} {locale === "en" ? "unread" : "না পড়া"}
                </Badge>
              )}
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              {locale === "en"
                ? "Organize your alerts and mark messages as read"
                : "আপনার বিজ্ঞপ্তিগুলো বাছাই করুন এবং এক ক্লিকে পড়া হিসেবে চিহ্নিত করুন"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 space-y-4">
            {/* Filter Toggle Buttons */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setUnreadOnly(false)}
                className={`flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                  !unreadOnly
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-muted/40 text-muted-foreground border-border/60 hover:text-foreground hover:bg-muted"
                }`}
              >
                <span>{locale === "en" ? "All Notifications" : "সকল বিজ্ঞপ্তি"}</span>
                <span className="text-[11px] opacity-80">
                  {notifications.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setUnreadOnly(true)}
                className={`flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                  unreadOnly
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-muted/40 text-muted-foreground border-border/60 hover:text-foreground hover:bg-muted"
                }`}
              >
                <span>{locale === "en" ? "Unread Only" : "অপঠিত বিজ্ঞপ্তি"}</span>
                <span
                  className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                    unreadCount > 0
                      ? unreadOnly
                        ? "bg-primary-foreground text-primary"
                        : "bg-primary/20 text-primary"
                      : "opacity-70"
                  }`}
                >
                  {unreadCount}
                </span>
              </button>
            </div>

            {/* Mark All As Read Button */}
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={markAllMutation.isPending}
                className="w-full gap-2 text-xs shadow-xs font-semibold h-9"
              >
                {markAllMutation.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <CheckCheck className="size-3.5 text-primary" />
                )}
                <span>
                  {locale === "en" ? "Mark All as Read" : "সবগুলো পড়া হয়েছে চিহ্নিত করুন"}
                </span>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Browser Web Push Control Card */}
        <Card className="border border-border/80 bg-surface shadow-xs transition-shadow hover:shadow-sm">
          <CardHeader className="pb-3 border-b border-border/70">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Bell className="size-4 text-primary" aria-hidden="true" />
                <CardTitle className="text-sm font-bold text-foreground">
                  {locale === "en" ? "Browser Push Alerts" : "ব্রাউজার পুশ নোটিফিকেশন"}
                </CardTitle>
              </div>
              <Badge
                variant={
                  pushState.isSubscribed
                    ? "default"
                    : pushState.status === "denied"
                    ? "destructive"
                    : "outline"
                }
                className="text-[10px] font-semibold"
              >
                {pushState.isSubscribed
                  ? locale === "en"
                    ? "Active"
                    : "সক্রিয়"
                  : pushState.status === "denied"
                  ? locale === "en"
                    ? "Blocked"
                    : "ব্লকড"
                  : pushState.status === "unsupported"
                  ? locale === "en"
                    ? "Unsupported"
                    : "সমর্থিত নয়"
                  : locale === "en"
                  ? "Inactive"
                  : "নিষ্ক্রিয়"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 space-y-3">
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {locale === "en"
                ? "Receive immediate desktop and mobile alerts whenever a blood donor responds or a patient reaches out."
                : "রক্তদাতা সাড়া দিলে কিংবা রোগী সরাসরি যোগাযোগের অনুরোধ পাঠালে সাথে সাথে আপনার ডিভাইসে অ্যালার্ট পান।"}
            </p>

            <div>
              {pushState.isSubscribed ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={pushState.isLoading}
                  onClick={() => pushState.disablePush()}
                  className="w-full h-8 text-xs text-destructive hover:bg-destructive/10"
                >
                  {pushState.isLoading ? (
                    <Loader2 className="size-3 animate-spin mr-1.5" />
                  ) : null}
                  <span>{locale === "en" ? "Disable Push Alerts" : "পুশ নোটিফিকেশন বন্ধ করুন"}</span>
                </Button>
              ) : pushState.status === "denied" ? (
                <span className="text-[11px] text-destructive flex items-center gap-1.5">
                  <ShieldAlert className="size-3.5 shrink-0" />
                  {locale === "en"
                    ? "Unblock in browser site settings to enable"
                    : "চালু করতে ব্রাউজার সাইট সেটিংসে অনুমতি দিন"}
                </span>
              ) : pushState.status === "unsupported" ? (
                <span className="text-[11px] text-muted-foreground">
                  {locale === "en" ? "Not supported on this device" : "এই ডিভাইসে সমর্থিত নয়"}
                </span>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  disabled={pushState.isLoading}
                  onClick={() => pushState.enablePush()}
                  className="w-full h-8 text-xs font-semibold gap-1.5 shadow-xs"
                >
                  {pushState.isLoading ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <Sparkles className="size-3 text-primary-foreground" />
                  )}
                  <span>{locale === "en" ? "Enable Push Alerts" : "পুশ নোটিফিকেশন চালু করুন"}</span>
                </Button>
              )}
            </div>

            {pushState.error && (
              <p className="text-[11px] text-destructive font-medium">
                {pushState.error}
              </p>
            )}
          </CardContent>
        </Card>
      </aside>

      {/* Main Stream: Notifications List (Desktop 8 cols / Mobile 1 col) */}
      <section className="lg:col-span-8">
        <Card className="border border-border/80 bg-surface shadow-xs overflow-hidden">
          <CardHeader className="border-b border-border/70 py-4 px-5 sm:px-6 bg-muted/10 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="size-4.5 text-primary" aria-hidden="true" />
              <CardTitle className="text-base font-bold text-foreground">
                {unreadOnly
                  ? locale === "en"
                    ? "Unread Notifications"
                    : "অপঠিত বিজ্ঞপ্তিসমূহ"
                  : locale === "en"
                  ? "Recent Notifications"
                  : "সাম্প্রতিক বিজ্ঞপ্তিসমূহ"}
              </CardTitle>
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              {notifications.length} {locale === "en" ? "items" : "টি আইটেম"}
            </span>
          </CardHeader>

          <CardContent className="p-4 sm:p-6">
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <Loader2 className="size-7 animate-spin text-primary" />
                <p className="text-sm font-medium animate-pulse">
                  {locale === "en" ? "Loading your notifications..." : "বিজ্ঞপ্তি লোড হচ্ছে..."}
                </p>
              </div>
            ) : isError ? (
              <div className="py-16 text-center space-y-3">
                <AlertCircle className="size-8 text-destructive mx-auto" />
                <h3 className="text-base font-bold text-foreground">
                  {locale === "en" ? "Failed to Load Notifications" : "বিজ্ঞপ্তি লোড করা সম্ভব হয়নি"}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
                  {locale === "en"
                    ? "A temporary error occurred while retrieving your notification history."
                    : "আপনার বিজ্ঞপ্তির ইতিহাস আনার সময় একটি সাময়িক ত্রুটি ঘটেছে।"}
                </p>
                <Button size="sm" variant="outline" onClick={() => refetch()} className="gap-1.5 shadow-xs">
                  <span>{locale === "en" ? "Try Again" : "পুনরায় চেষ্টা করুন"}</span>
                </Button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-16 text-center space-y-3 text-muted-foreground">
                <div className="flex items-center justify-center size-14 rounded-2xl bg-muted/60 border border-border/60 mx-auto text-muted-foreground">
                  <Inbox className="size-7" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-foreground">
                  {unreadOnly
                    ? locale === "en"
                      ? "No Unread Notifications"
                      : "কোনো অপঠিত বিজ্ঞপ্তি নেই"
                    : locale === "en"
                    ? "No Notifications Yet"
                    : "এখনও কোনো বিজ্ঞপ্তি নেই"}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  {unreadOnly
                    ? locale === "en"
                      ? "You are all caught up! Switch to 'All Notifications' to review past alerts."
                      : "আপনার সব বিজ্ঞপ্তি পড়া সম্পন্ন হয়েছে! পূর্বের বিজ্ঞপ্তি দেখতে 'সকল বিজ্ঞপ্তি' নির্বাচন করুন।"
                    : locale === "en"
                    ? "When you send or receive contact requests or create blood requests, updates will appear here."
                    : "আপনি যোগাযোগের অনুরোধ পাঠালে, গ্রহণ করলে অথবা রক্তের অনুরোধ তৈরি করলে এখানে তার আপডেট দেখতে পাবেন।"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="divide-y divide-border/60">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      locale={locale}
                    />
                  ))}
                </div>

                {/* Cursor-based Pagination / Load More */}
                {hasNextPage && (
                  <div className="pt-6 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className="gap-2 px-6 shadow-xs font-semibold"
                    >
                      {isFetchingNextPage ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Bell className="size-3.5" />
                      )}
                      <span>
                        {isFetchingNextPage
                          ? locale === "en"
                            ? "Loading more..."
                            : "আরও লোড হচ্ছে..."
                          : locale === "en"
                          ? "Load More Notifications"
                          : "পূর্বের আরও বিজ্ঞপ্তি দেখুন"}
                      </span>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
