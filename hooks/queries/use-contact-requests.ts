"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { collection, query, where, onSnapshot } from "firebase/firestore";

import { queryKeys } from "@/constants/query-keys";
import { getFirebaseDb } from "@/lib/firebase/config";
import {
  getIncomingContactRequests,
  getOutgoingContactRequests,
  hasActiveContactRequest,
  DONOR_CONTACT_REQUESTS_COLLECTION,
} from "@/services/contact-request.service";
import type { DonorContactRequest } from "@/types/contact-request";

/**
 * Hook to retrieve incoming contact requests sent to the active donor
 * with real-time onSnapshot updates for instant status synchronization.
 */
export function useIncomingContactRequests(donorId?: string | null) {
  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (!donorId) return;
    const db = getFirebaseDb();
    if (!db) return;

    const colRef = collection(db, DONOR_CONTACT_REQUESTS_COLLECTION);
    const q = query(colRef, where("donorId", "==", donorId));

    let isFirstEmission = true;
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (isFirstEmission) {
          isFirstEmission = false;
          return;
        }
        if (snapshot.docChanges().length > 0) {
          queryClient.invalidateQueries({
            queryKey: queryKeys.contactRequests.incoming(donorId),
          });
        }
      },
      (err) => {
        console.warn("[Realtime Incoming Contact Requests Sync Error]:", err);
      }
    );

    return () => unsubscribe();
  }, [donorId, queryClient]);

  return useQuery<DonorContactRequest[], Error>({
    queryKey: queryKeys.contactRequests.incoming(donorId || undefined),
    queryFn: () => {
      if (!donorId) return Promise.resolve([]);
      return getIncomingContactRequests(donorId);
    },
    enabled: Boolean(donorId),
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Hook to retrieve outgoing contact requests initiated by the active requester
 * with real-time onSnapshot updates for instant status synchronization.
 */
export function useOutgoingContactRequests(requesterId?: string | null) {
  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (!requesterId) return;
    const db = getFirebaseDb();
    if (!db) return;

    const colRef = collection(db, DONOR_CONTACT_REQUESTS_COLLECTION);
    const q = query(colRef, where("requesterId", "==", requesterId));

    let isFirstEmission = true;
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (isFirstEmission) {
          isFirstEmission = false;
          return;
        }
        if (snapshot.docChanges().length > 0) {
          queryClient.invalidateQueries({
            queryKey: queryKeys.contactRequests.outgoing(requesterId),
          });
        }
      },
      (err) => {
        console.warn("[Realtime Outgoing Contact Requests Sync Error]:", err);
      }
    );

    return () => unsubscribe();
  }, [requesterId, queryClient]);

  return useQuery<DonorContactRequest[], Error>({
    queryKey: queryKeys.contactRequests.outgoing(requesterId || undefined),
    queryFn: () => {
      if (!requesterId) return Promise.resolve([]);
      return getOutgoingContactRequests(requesterId);
    },
    enabled: Boolean(requesterId),
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Hook to check if there is already an active contact request between a requester and donor.
 */
export function useActiveContactRequest(
  requesterId?: string | null,
  donorId?: string | null
) {
  return useQuery<{ hasActive: boolean; existingRequestId?: string }, Error>({
    queryKey: queryKeys.contactRequests.active(requesterId || "", donorId || ""),
    queryFn: () => {
      if (!requesterId || !donorId) {
        return Promise.resolve({ hasActive: false });
      }
      return hasActiveContactRequest(requesterId, donorId);
    },
    enabled: Boolean(requesterId && donorId),
    staleTime: 1000 * 60, // 1 minute
  });
}
