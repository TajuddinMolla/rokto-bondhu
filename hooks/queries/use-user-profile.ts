"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "@/services/user.service";
import { queryKeys } from "@/constants/query-keys";
import type { UserProfile } from "@/types/user";

export function useUserProfile(userId?: string | null) {
  return useQuery<UserProfile | null, Error>({
    queryKey: queryKeys.user.profile(userId || undefined),
    queryFn: () => {
      if (!userId) return null;
      return getUserProfile(userId);
    },
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
  });
}
