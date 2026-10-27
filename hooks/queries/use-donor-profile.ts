"use client";

import { useQuery } from "@tanstack/react-query";
import { getDonorProfile } from "@/services/donor.service";
import { queryKeys } from "@/constants/query-keys";
import type { DonorProfile } from "@/types/donor";

export function useDonorProfile(userId?: string | null) {
  return useQuery<DonorProfile | null, Error>({
    queryKey: queryKeys.donors.profile(userId || undefined),
    queryFn: () => {
      if (!userId) return null;
      return getDonorProfile(userId);
    },
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
  });
}
