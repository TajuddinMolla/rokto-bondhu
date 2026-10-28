"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  Loader2,
  Inbox,
  AlertCircle,
  ArrowLeft,
  Filter,
} from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import {
  useNotificationsInfinite,
  useUnreadNotificationsCount,
} from "@/hooks/queries/use-notifications";
import { useMarkAllNotificationsAsRead } from "@/hooks/mutations/use-notification-mutations";
import { NotificationItem } from "@/components/notifications/notification-item";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const accountHref = `${prefix}/account`;

  // Redirect if unauthenticated
  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push(loginHref);
    }
  }, [status, router, loginHref]);

  const { data: unreadCount = 0 } = useUnreadNotificationsCount(user?.uid);
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
    <div className="space-y-6">
      {/* Top Header & Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <Link href={accountHref} className="flex items-center gap-1.5">
                <ArrowLeft className="size-3.5" />
                <span>{locale === "en" ? "Back to Account" : "অ্যাকাউন্টে ফিরে যান"}</span>
              </Link>
            </Button>
          </div>

          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {locale === "en" ? "Notification Center" : "বিজ্ঞপ্তি কেন্দ্র"}
            </h1>
            {unreadCount > 0 && (
              <Badge variant="default" className="text-xs font-bold px-2 py-0.5">
                {unreadCount} {locale === "en" ? "unread" : "না পড়া"}
              </Badge>
            )}
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground">
            {locale === "en"
              ? "Stay updated on your blood requests, private donor inquiries, and responses."
              : "আপনার রক্তের অনুরোধ, রক্তদাতা অনুসন্ধান এবং সরাসরি যোগাযোগের সর্বশেষ আপডেট জানুন।"}
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={markAllMutation.isPending}
            className="self-start sm:self-auto gap-1.5 text-xs shadow-xs"
          >
            {markAllMutation.isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <CheckCheck className="size-3.5" />
            )}
            <span>{locale === "en" ? "Mark all as read" : "সবগুলো পড়া হয়েছে চিহ্নিত করুন"}</span>
          </Button>
        )}
      </div>

      {/* Main Content Card */}
      <Card className="border border-border bg-surface shadow-xs overflow-hidden">
        <CardHeader className="border-b border-border pb-3 flex flex-row items-center justify-between gap-4 bg-muted/10">
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-muted-foreground" aria-hidden="true" />
            <CardTitle className="text-sm font-semibold text-foreground">
              {locale === "en" ? "Filter View" : "ফিল্টার"}
            </CardTitle>
          </div>

          <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-lg border border-border/60">
            <button
              type="button"
              onClick={() => setUnreadOnly(false)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                !unreadOnly
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {locale === "en" ? "All" : "সকল বিজ্ঞপ্তি"}
            </button>
            <button
              type="button"
              onClick={() => setUnreadOnly(true)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                unreadOnly
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {locale === "en" ? "Unread Only" : "না পড়া বিজ্ঞপ্তি"}
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="size-6 animate-spin text-primary" />
              <p className="text-sm font-medium">
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
                  : "আপনার বিজ্ঞপ্তির ইতিহাস আনার সময় একটি ত্রুটি ঘটেছে।"}
              </p>
              {error?.message?.toLowerCase().includes("permission") && (
                <p className="text-xs text-amber-600 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20 max-w-md mx-auto">
                  {locale === "en"
                    ? "Firestore permission denied. Please run 'npm run deploy:rules' in your terminal to deploy the new security rules."
                    : "ফায়ারস্টোর পারমিশন অনুমোদিত নয়। অনুগ্রহ করে টার্মিনালে 'npm run deploy:rules' চালিয়ে সিকিউরিটি রুলস ডিপ্লয় করুন।"}
                </p>
              )}
              <Button size="sm" variant="outline" onClick={() => refetch()} className="gap-1.5">
                <span>{locale === "en" ? "Try Again" : "পুনরায় চেষ্টা করুন"}</span>
              </Button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-16 text-center space-y-3 text-muted-foreground">
              <div className="flex items-center justify-center size-12 rounded-full bg-muted mx-auto">
                <Inbox className="size-6 text-muted-foreground/70" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                {unreadOnly
                  ? (locale === "en" ? "No Unread Notifications" : "কোনো অপঠিত বিজ্ঞপ্তি নেই")
                  : (locale === "en" ? "No Notifications Yet" : "এখনও কোনো বিজ্ঞপ্তি নেই")}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                {unreadOnly
                  ? (locale === "en"
                      ? "You are all caught up! Switch to 'All' to review past notifications."
                      : "আপনার সব বিজ্ঞপ্তি পড়া সম্পন্ন হয়েছে! পূর্বের বিজ্ঞপ্তি দেখতে 'সকল বিজ্ঞপ্তি' নির্বাচন করুন।")
                  : (locale === "en"
                      ? "When you send or receive contact requests or create blood requests, updates will appear here."
                      : "আপনি যোগাযোগের অনুরোধ পাঠালে, গ্রহণ করলে অথবা রক্তের অনুরোধ তৈরি করলে এখানে তার আপডেট দেখতে পাবেন।")}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
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
                    className="gap-2 px-6 shadow-xs"
                  >
                    {isFetchingNextPage ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Bell className="size-3.5" />
                    )}
                    <span>
                      {isFetchingNextPage
                        ? (locale === "en" ? "Loading more..." : "আরও লোড হচ্ছে...")
                        : (locale === "en" ? "Load More Notifications" : "পূর্বের আরও বিজ্ঞপ্তি দেখুন")}
                    </span>
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

