"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

import { queryKeys } from "@/constants/query-keys";
import { searchMatchingDonors } from "@/services/donor-search.service";
import type {
  MatchingDonorsParams,
  SearchMatchingDonorsResult,
} from "@/types/donor";

interface UseMatchingDonorsOptions {
  requestId: string;
  enabled?: boolean;
  pageSize?: number;
}

/**
 * React Query hook retrieving matching voluntary donors for an emergency blood request.
 * Supports cursor pagination, scoped proximity filtering, and automated cache key invalidation.
 */
export function useMatchingDonors(
  params: MatchingDonorsParams,
  options: UseMatchingDonorsOptions
) {
  const { requestId, enabled = true, pageSize = 20 } = options;

  return useInfiniteQuery<
    SearchMatchingDonorsResult,
    Error,
    {
      pages: SearchMatchingDonorsResult[];
      pageParams: (QueryDocumentSnapshot<DocumentData> | null)[];
    },
    readonly [string, string, string, string, Record<string, unknown>],
    QueryDocumentSnapshot<DocumentData> | null
  >({
    queryKey: queryKeys.donors.matching(requestId, params.scope, {
      bloodGroup: params.bloodGroup,
      divisionId: params.divisionId,
      districtId: params.districtId,
      upazilaId: params.upazilaId,
      availabilityOnly: params.availabilityOnly,
    }),
    queryFn: ({ pageParam }) =>
      searchMatchingDonors(params, {
        pageSize,
        cursor: pageParam,
      }),
    initialPageParam: null,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    enabled: enabled && Boolean(params.bloodGroup && requestId),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000,
  });
}

