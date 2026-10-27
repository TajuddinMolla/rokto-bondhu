"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import {
  getIncomingContactRequests,
  getOutgoingContactRequests,
  hasActiveContactRequest,
} from "@/services/contact-request.service";
import type { DonorContactRequest } from "@/types/contact-request";

/**
 * Hook to retrieve incoming contact requests sent to the active donor.
 */
export function useIncomingContactRequests(donorId?: string | null) {
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
 * Hook to retrieve outgoing contact requests initiated by the active requester.
 */
export function useOutgoingContactRequests(requesterId?: string | null) {
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
