"use client";

import * as React from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  isPushSupported,
  getPushPermissionStatus,
  registerPushNotificationToken,
  unregisterPushNotificationToken,
  type PushPermissionStatus,
} from "@/lib/firebase/messaging";

const emptySubscribe = () => () => {};

export function usePushNotifications() {
  const { user } = useAuth();
  const userId = user?.uid;

  const supported = React.useSyncExternalStore(
    emptySubscribe,
    () => isPushSupported(),
    () => false
  );

  const [overrideStatus, setOverrideStatus] = React.useState<PushPermissionStatus | null>(null);
  const [overrideSubscribed, setOverrideSubscribed] = React.useState<boolean | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const rawStatus = React.useSyncExternalStore(
    emptySubscribe,
    () => getPushPermissionStatus(),
    () => "unsupported" as PushPermissionStatus
  );

  const rawSubscribed = React.useSyncExternalStore(
    emptySubscribe,
    () => {
      if (!isPushSupported() || !userId) return false;
      if (getPushPermissionStatus() !== "granted") return false;
      try {
        return Boolean(localStorage.getItem(`roktobondhu_fcm_token_${userId}`));
      } catch {
        return true;
      }
    },
    () => false
  );

  const status = overrideStatus !== null ? overrideStatus : rawStatus;
  const isSubscribed = overrideSubscribed !== null ? overrideSubscribed : rawSubscribed;

  const enablePush = async (): Promise<boolean> => {
    if (!userId) {
      setError("Please sign in to enable push notifications.");
      return false;
    }

    setIsLoading(true);
    setError(null);

    const res = await registerPushNotificationToken(userId);
    setIsLoading(false);

    setOverrideStatus(res.status);
    if (res.success) {
      setOverrideSubscribed(true);
      return true;
    } else {
      setError(res.error || "Failed to enable notifications.");
      setOverrideSubscribed(false);
      return false;
    }
  };

  const disablePush = async (): Promise<boolean> => {
    if (!userId) return false;

    setIsLoading(true);
    setError(null);

    const res = await unregisterPushNotificationToken(userId);
    setIsLoading(false);

    if (res.success) {
      setOverrideSubscribed(false);
      return true;
    } else {
      setError(res.error || "Failed to disable notifications.");
      return false;
    }
  };

  return {
    supported,
    status,
    isSubscribed,
    isLoading,
    error,
    enablePush,
    disablePush,
  };
}