import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { getBloodRequestById } from "@/services/blood-request.service";
import type { BloodRequest } from "@/types/request";

/**
 * Hook to retrieve an individual blood request by its document ID.
 */
export function useBloodRequest(requestId: string | undefined) {
  return useQuery<BloodRequest | null, Error>({
    queryKey: queryKeys.bloodRequests.detail(requestId || ""),
    queryFn: () => {
      if (!requestId) return Promise.resolve(null);
      return getBloodRequestById(requestId);
    },
    enabled: Boolean(requestId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
