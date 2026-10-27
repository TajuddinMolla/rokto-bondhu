"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { upsertDonorProfile } from "@/services/donor.service";
import { queryKeys } from "@/constants/query-keys";
import type { DonorInput } from "@/lib/validations/donor";
import type { DonorProfile } from "@/types/donor";

interface SaveDonorProfileVariables {
  uid: string;
  input: DonorInput;
}

export function useSaveDonorProfile() {
  const queryClient = useQueryClient();

  return useMutation<DonorProfile, Error, SaveDonorProfileVariables>({
    mutationFn: ({ uid, input }) => upsertDonorProfile(uid, input),
    onSuccess: (data, variables) => {
      // Update cache directly with returned donor profile
      queryClient.setQueryData(queryKeys.donors.profile(variables.uid), data);
      // Invalidate user profile to reflect hasDonorProfile: true
      queryClient.invalidateQueries({
        queryKey: queryKeys.user.profile(variables.uid),
      });
    },
  });
}
