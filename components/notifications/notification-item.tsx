"use client";

import * as React from "react";
import Link from "next/link";
import {
  Bell,
  MessageSquare,
  CheckCircle2,
  XCircle,
  PhoneCall,
  Droplet,
  Send,
  Clock,
  Mail,
} from "lucide-react";

import { useMarkNotificationAsRead } from "@/hooks/mutations/use-notification-mutations";
import type { AppNotification, NotificationType } from "@/types/notification";
import type { Locale } from "@/i18n/config";

interface NotificationItemProps {
  notification: AppNotification;
  locale: Locale;
  onItemClick?: () => void;
}

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "CONTACT_REQUEST_RECEIVED":
      return <MessageSquare className="size-4 text-primary" aria-hidden="true" />;
    case "CONTACT_REQUEST_ACCEPTED":
      return <CheckCircle2 className="size-4 text-emerald-600" aria-hidden="true" />;
    case "CONTACT_REQUEST_DECLINED":
      return <XCircle className="size-4 text-rose-500" aria-hidden="true" />;
    case "CONTACT_REQUEST_CANCELLED":
      return <Clock className="size-4 text-amber-500" aria-hidden="true" />;
    case "CONTACT_INFO_SHARED":
      return <PhoneCall className="size-4 text-blue-600" aria-hidden="true" />;
    case "CONTACT_REQUEST_SUBMITTED":
      return <Send className="size-4 text-primary" aria-hidden="true" />;
    case "BLOOD_REQUEST_CREATED":
    case "BLOOD_REQUEST_MATCH":
      return <Droplet className="size-4 text-primary" aria-hidden="true" />;
    case "BLOOD_REQUEST_FULFILLED":
      return <CheckCircle2 className="size-4 text-emerald-600" aria-hidden="true" />;
    case "BLOOD_REQUEST_CANCELLED":
      return <XCircle className="size-4 text-muted-foreground" aria-hidden="true" />;
    default:
      return <Bell className="size-4 text-primary" aria-hidden="true" />;
  }
}

function formatRelativeTime(dateString: string, locale: Locale): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return locale === "en" ? "Just now" : "এইমাত্র";
    }
    const minutes = Math.floor(diffInSeconds / 60);
    if (minutes < 60) {
      return locale === "en"
        ? `${minutes}m ago`
        : `${minutes.toLocaleString("bn-BD")} মিনিট আগে`;
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return locale === "en"
        ? `${hours}h ago`
        : `${hours.toLocaleString("bn-BD")} ঘণ্টা আগে`;
    }
    const days = Math.floor(hours / 24);
    if (days < 7) {
      return locale === "en"
        ? `${days}d ago`
        : `${days.toLocaleString("bn-BD")} দিন আগে`;
    }
    return date.toLocaleDateString(locale === "en" ? "en-US" : "bn-BD", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export function NotificationItem({
  notification,
  locale,
  onItemClick,
}: NotificationItemProps) {
  const markAsReadMutation = useMarkNotificationAsRead();

  const title =
    locale === "en"
      ? notification.title.en || notification.title.bn
      : notification.title.bn || notification.title.en;

  const message =
    locale === "en"
      ? notification.message.en || notification.message.bn
      : notification.message.bn || notification.message.en;

  const prefix = locale === "en" ? "/en" : "";
  // Ensure the link adheres to current locale
  const targetHref = notification.actionUrl.startsWith("/en")
    ? notification.actionUrl
    : `${prefix}${notification.actionUrl}`;

  const handleClick = () => {
    if (!notification.read) {
      markAsReadMutation.mutate({
        notificationId: notification.id,
        recipientId: notification.recipientId,
      });
    }
    onItemClick?.();
  };

  return (
    <Link
      href={targetHref}
      onClick={handleClick}
      className={`group relative flex items-start gap-3 p-3.5 sm:p-4 rounded-xl transition-all border ${
        notification.read
          ? "border-transparent bg-transparent hover:bg-muted/40"
          : "border-primary/20 bg-primary/5 hover:bg-primary/10 shadow-xs"
      }`}
    >
      {/* Icon Badge */}
      <div
        className={`shrink-0 flex items-center justify-center size-9 rounded-lg border transition-colors ${
          notification.read
            ? "border-border bg-background group-hover:bg-muted"
            : "border-primary/30 bg-primary/10"
        }`}
      >
        {getNotificationIcon(notification.type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <p
            className={`text-xs sm:text-sm font-semibold truncate ${
              notification.read ? "text-foreground" : "text-foreground font-bold"
            }`}
          >
            {title}
          </p>

          <span className="shrink-0 text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
            {formatRelativeTime(notification.createdAt, locale)}
          </span>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {message}
        </p>

        {/* Email delivery indicator if sent */}
        {notification.emailStatus === "SENT" && (
          <div className="pt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground/80">
            <Mail className="size-3 text-emerald-600" aria-hidden="true" />
            <span>{locale === "en" ? "Sent to email" : "ইমেইলে পাঠানো হয়েছে"}</span>
          </div>
        )}
      </div>

      {/* Unread Indicator Dot */}
      {!notification.read && (
        <span
          className="size-2 rounded-full bg-primary shrink-0 self-center"
          title={locale === "en" ? "Unread" : "নতুন বিজ্ঞপ্তি"}
          aria-label={locale === "en" ? "Unread" : "নতুন বিজ্ঞপ্তি"}
        />
      )}
    </Link>
  );
}

