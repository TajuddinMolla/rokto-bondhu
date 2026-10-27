"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBloodRequest } from "@/services/blood-request.service";
import { queryKeys } from "@/constants/query-keys";
import type { UpdateBloodRequestInput } from "@/types/request";

interface UpdateBloodRequestVariables {
  requestId: string;
  userId: string;
  updates: UpdateBloodRequestInput;
}

export function useUpdateBloodRequest() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, UpdateBloodRequestVariables>({
    mutationFn: ({ requestId, userId, updates }) =>
      updateBloodRequest(requestId, userId, updates),
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
