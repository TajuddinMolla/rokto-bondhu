"use client";

import React from "react";
import Link from "next/link";
import { Mail, Bell, ArrowRight, Loader2, ShieldAlert } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";
import type { usePushNotifications } from "@/hooks/use-push-notifications";

interface NotificationPreferencesCardProps {
  locale: Locale;
  emailNotificationsEnabled?: boolean;
  isPending: boolean;
  onToggle: () => void;
}

export function NotificationPreferencesCard({
  locale,
  emailNotificationsEnabled,
  isPending,
  onToggle,
}: NotificationPreferencesCardProps) {
  const isEnabled = emailNotificationsEnabled !== false;

  return (
    <Card className="border border-border/80 bg-surface shadow-xs transition-shadow hover:shadow-sm">
      <CardHeader className="pb-3 border-b border-border/70">
        <div className="flex items-center gap-2">
          <Mail className="size-4 text-primary" />
          <CardTitle className="text-sm font-bold text-foreground">
            {locale === "en" ? "Notification Preferences" : "বিজ্ঞপ্তি পছন্দসমূহ"}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-foreground block">
              {locale === "en" ? "Email Notifications" : "ইমেইল বিজ্ঞপ্তি"}
            </span>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {locale === "en"
                ? "Receive email alerts for incoming private donor contact requests when you are offline."
                : "জরুরি যোগাযোগের অনুরোধ আসলে অফলাইনে থাকা অবস্থায়ও আপনার ইমেইলে বার্তা পাঠানো হবে।"}
            </p>
          </div>

          <Button
            size="sm"
            variant={isEnabled ? "default" : "outline"}
            disabled={isPending}
            onClick={onToggle}
            className="shrink-0 h-7 text-xs px-2.5 font-medium"
          >
            {isPending ? (
              <Loader2 className="size-3 animate-spin" />
            ) : isEnabled ? (
              locale === "en" ? "Enabled" : "চালু"
            ) : (
              locale === "en" ? "Disabled" : "বন্ধ"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface NotificationCenterCardProps {
  locale: Locale;
  unreadCount: number;
  pushState: ReturnType<typeof usePushNotifications>;
}

export function NotificationCenterCard({
  locale,
  unreadCount,
  pushState,
}: NotificationCenterCardProps) {
  const notificationsHref = locale === "en" ? "/en/account/notifications" : "/account/notifications";

  return (
    <Card className="border border-border/80 bg-surface shadow-xs transition-shadow hover:shadow-sm">
      <CardHeader className="pb-4 border-b border-border/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
            <Bell className="size-5" aria-hidden="true" />
          </div>
          <div>
            <CardTitle className="text-base sm:text-lg font-bold text-foreground">
              {locale === "en" ? "Notification Center" : "বিজ্ঞপ্তি কেন্দ্র"}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {locale === "en"
                ? "Recent updates on your blood requests and direct donor contact"
                : "আপনার রক্তের অনুরোধ এবং সরাসরি যোগাযোগের সর্বশেষ আপডেট"}
            </CardDescription>
          </div>
        </div>
        <Button asChild size="sm" variant="outline" className="gap-1.5 self-start sm:self-auto h-8 text-xs font-medium">
          <Link href={notificationsHref}>
            <span>{locale === "en" ? "View All" : "সব দেখুন"}</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/70 bg-muted/20">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">
                {locale === "en" ? "Unread Notifications:" : "অপঠিত বিজ্ঞপ্তি:"}
              </span>
              <Badge variant={unreadCount > 0 ? "default" : "secondary"} className="text-xs font-bold">
                {unreadCount} {locale === "en" ? "unread" : "না পড়া"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {locale === "en"
                ? "Notifications alert you when donors respond or new private contact requests arrive."
                : "রক্তদাতা সাড়া দিলে কিংবা নতুন অনুরোধ আসলে বিজ্ঞপ্তি কেন্দ্রে সঙ্গে সঙ্গে দেখতে পাবেন।"}
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <Button asChild size="sm" className="w-full sm:w-auto gap-1.5 shadow-xs font-semibold">
              <Link href={notificationsHref}>
                <Bell className="size-3.5" />
                <span>{locale === "en" ? "Open Notifications" : "বিজ্ঞপ্তি খুলুন"}</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Browser Web Push Notifications Control */}
        <div className="p-4 rounded-xl border border-border/70 bg-muted/20 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground">
                {locale === "en" ? "Browser Push Notifications" : "ব্রাউজার পুশ নোটিফিকেশন"}
              </span>
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
                    ? "Blocked in Browser"
                    : "ব্রাউজারে ব্লকড"
                  : pushState.status === "unsupported"
                  ? locale === "en"
                    ? "Unsupported"
                    : "সমর্থিত নয়"
                  : locale === "en"
                  ? "Inactive"
                  : "নিষ্ক্রিয়"}
              </Badge>
            </div>

            <div>
              {pushState.isSubscribed ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={pushState.isLoading}
                  onClick={() => pushState.disablePush()}
                  className="h-8 text-xs text-destructive hover:bg-destructive/10"
                >
                  {pushState.isLoading ? (
                    <Loader2 className="size-3 animate-spin mr-1.5" />
                  ) : null}
                  <span>{locale === "en" ? "Disable Push" : "বন্ধ করুন"}</span>
                </Button>
              ) : pushState.status === "denied" ? (
                <span className="text-[11px] text-destructive flex items-center gap-1">
                  <ShieldAlert className="size-3 shrink-0" />
                  {locale === "en" ? "Please unblock in browser site settings" : "ব্রাউজার সাইট সেটিংসে অনুমতি দিন"}
                </span>
              ) : pushState.status === "unsupported" ? (
                <span className="text-[11px] text-muted-foreground">
                  {locale === "en" ? "Not available on this device" : "এই ডিভাইসে অনুপলব্ধ"}
                </span>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  disabled={pushState.isLoading}
                  onClick={() => pushState.enablePush()}
                  className="h-8 text-xs font-semibold gap-1.5 shadow-xs"
                >
                  {pushState.isLoading ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <Bell className="size-3" />
                  )}
                  <span>{locale === "en" ? "Enable Push Alerts" : "পুশ নোটিফিকেশন চালু করুন"}</span>
                </Button>
              )}
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {locale === "en"
              ? "Receive instant desktop and mobile notifications when urgent blood requests matching your group are created or when patients contact you."
              : "আপনার গ্রুপের রক্তের জরুরি অনুরোধ আসলে কিংবা রোগীরা যোগাযোগের অনুরোধ পাঠালে সাথে সাথে ব্রাউজারে নোটিফিকেশন পান।"}
          </p>

          {pushState.error && (
            <p className="text-[11px] text-destructive font-medium">
              {pushState.error}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
