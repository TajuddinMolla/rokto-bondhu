"use client";

import { useInfiniteQuery, useQuery, type InfiniteData } from "@tanstack/react-query";
import type { DocumentSnapshot } from "firebase/firestore";

import { queryKeys } from "@/constants/query-keys";
import {
  getNotifications,
  getUnreadNotificationsCount,
} from "@/services/notification.service";
import { getUserProfile } from "@/services/user.service";
import type {
  PaginatedNotificationsResult,
  NotificationPreferences,
} from "@/types/notification";

interface UseNotificationsInfiniteOptions {
  recipientId?: string;
  pageSize?: number;
  unreadOnly?: boolean;
}

/**
 * Paginated infinite query for notifications using Firestore cursor pagination.
 */
export function useNotificationsInfinite({
  recipientId,
  pageSize = 20,
  unreadOnly = false,
}: UseNotificationsInfiniteOptions) {
  return useInfiniteQuery<
    PaginatedNotificationsResult,
    Error,
    InfiniteData<PaginatedNotificationsResult, DocumentSnapshot | null>,
    ReturnType<typeof queryKeys.notifications.infinite>,
    DocumentSnapshot | null
  >({
    queryKey: queryKeys.notifications.infinite(recipientId, unreadOnly),
    queryFn: async ({ pageParam }) => {
      if (!recipientId) {
        return {
          notifications: [],
          nextCursorDoc: null,
          hasMore: false,
        };
      }
      return getNotifications({
        recipientId,
        pageSize,
        cursorDoc: pageParam,
        unreadOnly,
      });
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? (lastPage.nextCursorDoc as DocumentSnapshot) : undefined,
    enabled: Boolean(recipientId),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Fast, bounded query for counting unread notifications.
 */
export function useUnreadNotificationsCount(recipientId?: string) {
  return useQuery<number, Error>({
    queryKey: queryKeys.notifications.unreadCount(recipientId),
    queryFn: async () => {
      if (!recipientId) return 0;
      return getUnreadNotificationsCount(recipientId);
    },
    enabled: Boolean(recipientId),
    refetchInterval: 60 * 1000, // Periodically poll every 60s
    staleTime: 15 * 1000,
  });
}

/**
 * Query for user notification preferences.
 */
export function useNotificationPreferences(recipientId?: string) {
  return useQuery<NotificationPreferences, Error>({
    queryKey: queryKeys.notifications.preferences(recipientId),
    queryFn: async () => {
      if (!recipientId) return { emailNotificationsEnabled: true };
      const profile = await getUserProfile(recipientId);
      return {
        emailNotificationsEnabled: profile?.emailNotificationsEnabled !== false,
      };
    },
    enabled: Boolean(recipientId),
  });
}
