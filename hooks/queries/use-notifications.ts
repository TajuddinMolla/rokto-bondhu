"use client";

import * as React from "react";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import {
  collection,
  query,
  where,
  onSnapshot,
  type DocumentSnapshot,
} from "firebase/firestore";

import { queryKeys } from "@/constants/query-keys";
import { getFirebaseDb } from "@/lib/firebase/config";
import {
  getNotifications,
  getUnreadNotificationsCount,
  NOTIFICATIONS_COLLECTION,
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
 * Paginated infinite query for notifications using Firestore cursor pagination
 * paired with real-time Firestore listeners for instant inbox updates.
 */
export function useNotificationsInfinite({
  recipientId,
  pageSize = 20,
  unreadOnly = false,
}: UseNotificationsInfiniteOptions) {
  const queryClient = useQueryClient();

  // Real-time listener for incoming notification events
  React.useEffect(() => {
    if (!recipientId) return;
    const db = getFirebaseDb();
    if (!db) return;

    const colRef = collection(db, NOTIFICATIONS_COLLECTION);
    const constraints = [where("recipientId", "==", recipientId)];
    if (unreadOnly) {
      constraints.push(where("read", "==", false));
    }

    const q = query(colRef, ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        // Only invalidate if there are actual doc changes to prevent excessive renders
        if (!snapshot.empty) {
          queryClient.invalidateQueries({
            queryKey: queryKeys.notifications.infinite(recipientId, unreadOnly),
          });
        }
      },
      (err) => {
        console.warn("[Realtime Notifications Sync Error]:", err);
      }
    );

    return () => unsubscribe();
  }, [recipientId, unreadOnly, queryClient]);

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
    staleTime: 30 * 1000,
  });
}

/**
 * Real-time query for counting unread notifications using onSnapshot.
 * Eliminates polling while keeping counts updated instantaneously.
 */
export function useUnreadNotificationsCount(recipientId?: string) {
  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (!recipientId) return;
    const db = getFirebaseDb();
    if (!db) return;

    const colRef = collection(db, NOTIFICATIONS_COLLECTION);
    const q = query(
      colRef,
      where("recipientId", "==", recipientId),
      where("read", "==", false)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        queryClient.setQueryData(
          queryKeys.notifications.unreadCount(recipientId),
          snapshot.size
        );
      },
      (err) => {
        console.warn("[Realtime Unread Count Error]:", err);
      }
    );

    return () => unsubscribe();
  }, [recipientId, queryClient]);

  return useQuery<number, Error>({
    queryKey: queryKeys.notifications.unreadCount(recipientId),
    queryFn: async () => {
      if (!recipientId) return 0;
      return getUnreadNotificationsCount(recipientId);
    },
    enabled: Boolean(recipientId),
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
