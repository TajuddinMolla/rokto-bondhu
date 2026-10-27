import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { getMyBloodRequests } from "@/services/blood-request.service";
import type { BloodRequest } from "@/types/request";

/**
 * Hook to retrieve all blood requests created by the active user.
 */
export function useMyBloodRequests(userId: string | undefined) {
  return useQuery<BloodRequest[], Error>({
    queryKey: queryKeys.bloodRequests.my(userId),
    queryFn: () => {
      if (!userId) return Promise.resolve([]);
      return getMyBloodRequests(userId);
    },
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
