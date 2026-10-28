"use client";

import * as React from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  ArrowRight,
  Loader2,
  Inbox,
  AlertCircle,
} from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import {
  useNotificationsInfinite,
  useUnreadNotificationsCount,
} from "@/hooks/queries/use-notifications";
import { useMarkAllNotificationsAsRead } from "@/hooks/mutations/use-notification-mutations";
import { NotificationItem } from "@/components/notifications/notification-item";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Locale } from "@/i18n/config";

interface NotificationBellProps {
  locale: Locale;
}

export function NotificationBell({ locale }: NotificationBellProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const { data: unreadCount = 0 } = useUnreadNotificationsCount(user?.uid);
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useNotificationsInfinite({
    recipientId: user?.uid,
    pageSize: 5,
  });

  React.useEffect(() => {
    if (error) {
      console.error("[RoktoBondhu] Notification bell error:", error);
    }
  }, [error]);

  const markAllMutation = useMarkAllNotificationsAsRead();

  // Close dropdown on outside click or escape
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const prefix = locale === "en" ? "/en" : "";
  const allNotificationsHref = `${prefix}/account/notifications`;

  const notifications = React.useMemo(() => {
    return data?.pages.flatMap((page) => page.notifications) || [];
  }, [data]);

  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.uid) return;
    markAllMutation.mutate({ recipientId: user.uid });
  };

  const badgeText = unreadCount > 9 ? "9+" : unreadCount > 0 ? String(unreadCount) : null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={
          locale === "en"
            ? `Notifications (${unreadCount} unread)`
            : `বিজ্ঞপ্তি (${unreadCount}টি নতুন)`
        }
        className="relative size-9 p-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
      >
        <Bell className="size-4.5" aria-hidden="true" />
        {badgeText && (
          <span
            className="absolute -top-1 -right-1 flex items-center justify-center min-w-4.5 h-4.5 px-1 rounded-full bg-primary text-primary-foreground font-bold text-[10px] shadow-xs animate-in zoom-in-50"
            aria-hidden="true"
          >
            {badgeText}
          </span>
        )}
      </Button>

      {/* Dropdown Panel */}
      {isOpen && (
        <Card
          className="absolute right-0 mt-2 w-80 sm:w-96 border border-border bg-surface shadow-2xl rounded-2xl overflow-hidden z-50 animate-in fade-in-50 slide-in-from-top-2 duration-150"
          role="dialog"
          aria-label={locale === "en" ? "Notifications dropdown" : "বিজ্ঞপ্তি ড্রপডাউন"}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-border bg-muted/20">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base text-foreground">
                {locale === "en" ? "Notifications" : "বিজ্ঞপ্তি"}
              </span>
              {unreadCount > 0 && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {unreadCount} {locale === "en" ? "new" : "নতুন"}
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={markAllMutation.isPending}
                className="h-7 text-xs text-muted-foreground hover:text-foreground px-2 gap-1"
                title={locale === "en" ? "Mark all as read" : "সব পড়া হয়েছে"}
              >
                {markAllMutation.isPending ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <CheckCheck className="size-3.5" />
                )}
                <span>{locale === "en" ? "Mark all read" : "সব চিহ্নিত করুন"}</span>
              </Button>
            )}
          </div>

          {/* Body */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-border/50 p-1.5 sm:p-2">
            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="size-5 animate-spin text-primary" />
                <span className="text-xs">
                  {locale === "en" ? "Loading notifications..." : "বিজ্ঞপ্তি লোড হচ্ছে..."}
                </span>
              </div>
            ) : isError ? (
              <div className="py-8 px-4 text-center space-y-2">
                <AlertCircle className="size-6 text-destructive mx-auto" />
                <p className="text-xs font-semibold text-foreground">
                  {locale === "en" ? "Failed to load notifications." : "বিজ্ঞপ্তি লোড করা সম্ভব হয়নি।"}
                </p>
                {error?.message?.toLowerCase().includes("permission") && (
                  <p className="text-[11px] text-amber-600 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                    {locale === "en"
                      ? "Firestore permission denied. Please run 'npm run deploy:rules' to deploy security rules."
                      : "ফায়ারস্টোর পারমিশন অনুমোদিত নয়। অনুগ্রহ করে সিকিউরিটি রুলস ডিপ্লয় করুন।"}
                  </p>
                )}
                <Button size="sm" variant="outline" onClick={() => refetch()} className="text-xs h-7">
                  {locale === "en" ? "Retry" : "পুনরায় চেষ্টা করুন"}
                </Button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 px-4 text-center space-y-2 text-muted-foreground">
                <div className="flex items-center justify-center size-10 rounded-full bg-muted mx-auto">
                  <Inbox className="size-5" />
                </div>
                <p className="text-xs font-medium">
                  {locale === "en" ? "No notifications yet" : "এখনও কোনো বিজ্ঞপ্তি নেই"}
                </p>
                <p className="text-[11px] text-muted-foreground/80 max-w-[200px] mx-auto">
                  {locale === "en"
                    ? "Important blood and contact updates will appear here."
                    : "গুরুত্বপূর্ণ রক্তের অনুরোধ ও যোগাযোগের বার্তা এখানে প্রদর্শিত হবে।"}
                </p>
              </div>
            ) : (
              notifications.slice(0, 5).map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  locale={locale}
                  onItemClick={() => setIsOpen(false)}
                />
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 border-t border-border bg-muted/20 text-center">
            <Link
              href={allNotificationsHref}
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors py-1 w-full"
            >
              <span>{locale === "en" ? "View all notifications" : "সব বিজ্ঞপ্তি দেখুন"}</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}

