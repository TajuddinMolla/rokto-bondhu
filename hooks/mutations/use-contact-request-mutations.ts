"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import {
  createContactRequest,
  acceptContactRequest,
  declineContactRequest,
  cancelContactRequest,
  shareContactConsent,
  completeContactRequest,
} from "@/services/contact-request.service";
import { updateDonorContactMode } from "@/services/donor.service";
import type {
  CreateContactRequestInput,
  DonorContactRequest,
} from "@/types/contact-request";
import type { DonorContactMode, DonorProfile } from "@/types/donor";

/**
 * Mutation to submit a direct 1-to-1 contact request to a private donor.
 */
export function useCreateContactRequest() {
  const queryClient = useQueryClient();

  return useMutation<
    DonorContactRequest,
    Error,
    { requesterId: string; input: CreateContactRequestInput }
  >({
    mutationFn: ({ requesterId, input }) =>
      createContactRequest(requesterId, input),
    onSuccess: (data, { requesterId, input }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.contactRequests.outgoing(requesterId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.contactRequests.active(requesterId, input.donorId),
      });
    },
  });
}

/**
 * Mutation for a donor to accept a pending contact request.
 */
export function useAcceptContactRequest() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { requestId: string; donorId: string }>({
    mutationFn: ({ requestId, donorId }) =>
      acceptContactRequest(requestId, donorId),
    onSuccess: (_, { donorId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.contactRequests.incoming(donorId),
      });
    },
  });
}

/**
 * Mutation for a donor to decline a pending contact request.
 */
export function useDeclineContactRequest() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { requestId: string; donorId: string }>({
    mutationFn: ({ requestId, donorId }) =>
      declineContactRequest(requestId, donorId),
    onSuccess: (_, { donorId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.contactRequests.incoming(donorId),
      });
    },
  });
}

/**
 * Mutation for a requester to cancel their own pending contact request.
 */
export function useCancelContactRequest() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { requestId: string; requesterId: string }>({
    mutationFn: ({ requestId, requesterId }) =>
      cancelContactRequest(requestId, requesterId),
    onSuccess: (_, { requesterId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.contactRequests.outgoing(requesterId),
      });
    },
  });
}

/**
 * Mutation for the donor's explicit second-step consent to share their private phone number.
 */
export function useShareContactConsent() {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { requestId: string; donorId: string; donorPhoneNumber: string }
  >({
    mutationFn: ({ requestId, donorId, donorPhoneNumber }) =>
      shareContactConsent(requestId, donorId, donorPhoneNumber),
    onSuccess: (_, { donorId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.contactRequests.incoming(donorId),
      });
    },
  });
}

/**
 * Mutation to mark an accepted contact request as COMPLETED.
 */
export function useCompleteContactRequest() {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { requestId: string; actorId: string }
  >({
    mutationFn: ({ requestId, actorId }) =>
      completeContactRequest(requestId, actorId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.contactRequests.all,
      });
    },
  });
}

/**
 * Mutation to toggle donor contact mode (PUBLIC vs PRIVATE).
 */
export function useUpdateDonorContactMode() {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { uid: string; mode: DonorContactMode },
    { previousProfile?: DonorProfile | null }
  >({
    mutationFn: ({ uid, mode }) => updateDonorContactMode(uid, mode),
    onMutate: async ({ uid, mode }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.donors.profile(uid),
      });

      const previousProfile = queryClient.getQueryData<DonorProfile | null>(
        queryKeys.donors.profile(uid)
      );

      if (previousProfile) {
        queryClient.setQueryData<DonorProfile>(queryKeys.donors.profile(uid), {
          ...previousProfile,
          contactMode: mode,
          phoneVisibility: mode,
          isPhonePublic: mode === "PUBLIC",
        });
      }

      return { previousProfile };
    },
    onError: (_err, { uid }, context) => {
      if (context?.previousProfile !== undefined) {
        queryClient.setQueryData(
          queryKeys.donors.profile(uid),
          context.previousProfile
        );
      }
    },
    onSettled: (_, __, { uid }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.donors.profile(uid),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.donors.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.user.profile(uid),
      });
    },
  });
}
