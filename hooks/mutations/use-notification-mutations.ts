"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/services/notification.service";
import { updateUserProfile } from "@/services/user.service";

/**
 * Mutation to mark a single notification as read.
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { notificationId: string; recipientId?: string }>({
    mutationFn: ({ notificationId }) => markNotificationAsRead(notificationId),
    onSuccess: (_, { recipientId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all,
      });
      if (recipientId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.notifications.unreadCount(recipientId),
        });
      }
    },
  });
}

/**
 * Mutation to mark all notifications for a recipient as read.
 */
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { recipientId: string }>({
    mutationFn: ({ recipientId }) => markAllNotificationsAsRead(recipientId),
    onSuccess: (_, { recipientId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.unreadCount(recipientId),
      });
    },
  });
}

/**
 * Mutation to update user email notification preferences.
 */
export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { userId: string; emailNotificationsEnabled: boolean }
  >({
    mutationFn: ({ userId, emailNotificationsEnabled }) =>
      updateUserProfile(userId, { emailNotificationsEnabled }),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.preferences(userId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.user.profile(userId),
      });
    },
  });
}

