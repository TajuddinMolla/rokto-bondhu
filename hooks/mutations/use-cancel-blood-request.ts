"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelBloodRequest, fulfillBloodRequest } from "@/services/blood-request.service";
import { queryKeys } from "@/constants/query-keys";

interface RequestActionVariables {
  requestId: string;
  userId: string;
}

export function useCancelBloodRequest() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, RequestActionVariables>({
    mutationFn: ({ requestId, userId }) => cancelBloodRequest(requestId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.bloodRequests.detail(variables.requestId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.bloodRequests.my(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.bloodRequests.all,
      });
    },
  });
}

export function useFulfillBloodRequest() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, RequestActionVariables>({
    mutationFn: ({ requestId, userId }) => fulfillBloodRequest(requestId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.bloodRequests.detail(variables.requestId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.bloodRequests.my(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.bloodRequests.all,
      });
    },
  });
}
