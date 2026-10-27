"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBloodRequest } from "@/services/blood-request.service";
import { queryKeys } from "@/constants/query-keys";
import type { BloodRequest, CreateBloodRequestInput } from "@/types/request";

interface CreateBloodRequestVariables {
  userId: string;
  input: CreateBloodRequestInput;
}

export function useCreateBloodRequest() {
  const queryClient = useQueryClient();

  return useMutation<BloodRequest, Error, CreateBloodRequestVariables>({
    mutationFn: ({ userId, input }) => createBloodRequest(userId, input),
    onSuccess: (data, variables) => {
      // Invalidate the user's blood requests list cache
      queryClient.invalidateQueries({
        queryKey: queryKeys.bloodRequests.my(variables.userId),
      });
      // Invalidate general blood requests queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.bloodRequests.all,
      });
    },
  });
}
