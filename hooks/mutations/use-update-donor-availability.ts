"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateDonorAvailability } from "@/services/donor.service";
import { queryKeys } from "@/constants/query-keys";
import type { DonorAvailabilityStatus } from "@/types/blood";
import type { DonorProfile } from "@/types/donor";

interface UpdateAvailabilityVariables {
  uid: string;
  status: DonorAvailabilityStatus;
}

export function useUpdateDonorAvailability() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, UpdateAvailabilityVariables>({
    mutationFn: ({ uid, status }) => updateDonorAvailability(uid, status),
    onMutate: async ({ uid, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.donors.profile(uid) });
      const previous = queryClient.getQueryData<DonorProfile | null>(queryKeys.donors.profile(uid));

      // Optimistically update cache
      if (previous) {
        queryClient.setQueryData(
          queryKeys.donors.profile(uid),
          (prev: DonorProfile | null | undefined): DonorProfile | null | undefined => {
            if (!prev) return prev;
            return {
              ...prev,
              availabilityStatus: status,
            };
          }
        );
      }

      return { previous };
    },
    onError: (_err, { uid }, context) => {
      const typedContext = context as { previous?: DonorProfile | null } | undefined;
      if (typedContext?.previous !== undefined) {
        queryClient.setQueryData(queryKeys.donors.profile(uid), typedContext.previous);
      }
    },
    onSettled: (_data, _err, { uid }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.donors.profile(uid) });
    },
  });
}
