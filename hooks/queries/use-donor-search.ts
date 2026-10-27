"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

import { queryKeys } from "@/constants/query-keys";
import { searchPublicDonors, type SearchPublicDonorsResult } from "@/services/donor-search.service";
import type { DonorSearchFilterParams } from "@/types/donor";

interface UseDonorSearchOptions {
  enabled?: boolean;
  pageSize?: number;
}

export function useDonorSearch(
  filters: DonorSearchFilterParams,
  options: UseDonorSearchOptions = {}
) {
  const { enabled = true, pageSize = 20 } = options;

  return useInfiniteQuery<
    SearchPublicDonorsResult,
    Error,
    { pages: SearchPublicDonorsResult[]; pageParams: (QueryDocumentSnapshot<DocumentData> | null)[] },
    readonly [string, string, Record<string, unknown>],
    QueryDocumentSnapshot<DocumentData> | null
  >({
    queryKey: queryKeys.donors.list({
      bloodGroup: filters.bloodGroup || undefined,
      divisionId: filters.divisionId || undefined,
      districtId: filters.districtId || undefined,
      upazilaId: filters.upazilaId || undefined,
      availabilityStatus: filters.availabilityStatus || undefined,
    } as Record<string, unknown>),
    queryFn: ({ pageParam }) =>
      searchPublicDonors(filters, {
        pageSize,
        cursor: pageParam,
      }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    enabled,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}
