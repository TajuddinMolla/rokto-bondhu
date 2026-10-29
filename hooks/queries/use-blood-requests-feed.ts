"use client";

import * as React from "react";
import {
  useInfiniteQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import {
  collection,
  query,
  where,
  limit,
  onSnapshot,
  type QueryConstraint,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";

import { queryKeys } from "@/constants/query-keys";
import { getFirebaseDb } from "@/lib/firebase/config";
import {
  getBloodRequestsFeed,
  type BloodRequestsFeedFilters,
  type PaginatedBloodRequestsFeedResult,
} from "@/services/blood-request.service";

interface UseBloodRequestsFeedOptions {
  filters: BloodRequestsFeedFilters;
  pageSize?: number;
  enabled?: boolean;
}

export function useBloodRequestsFeed({
  filters,
  pageSize = 20,
  enabled = true,
}: UseBloodRequestsFeedOptions) {
  const queryClient = useQueryClient();
  const [isLiveConnected, setIsLiveConnected] = React.useState(false);

  // Filter snapshot key for caching and listener coordination
  const serializedFilters = React.useMemo(
    () => ({
      bloodGroup: filters.bloodGroup || null,
      divisionId: filters.divisionId || null,
      districtId: filters.districtId || null,
      upazilaId: filters.upazilaId || null,
      urgency: filters.urgency || null,
    }),
    [
      filters.bloodGroup,
      filters.divisionId,
      filters.districtId,
      filters.upazilaId,
      filters.urgency,
    ]
  );

  // Set up real-time listener for instant feed updates
  React.useEffect(() => {
    if (!enabled) return;
    const db = getFirebaseDb();
    if (!db) return;

    const colRef = collection(db, "bloodRequests");
    const constraints: QueryConstraint[] = [where("status", "==", "open")];

    if (filters.bloodGroup) {
      constraints.push(where("bloodGroup", "==", filters.bloodGroup));
    }
    if (filters.districtId) {
      constraints.push(where("districtId", "==", filters.districtId));
    } else if (filters.divisionId) {
      constraints.push(where("divisionId", "==", filters.divisionId));
    }

    // Limit realtime subscription to latest 20 documents to conserve reads
    constraints.push(limit(20));

    let isFirstEmission = true;
    const q = query(colRef, ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setIsLiveConnected(true);

        // Ignore the very first emission as it's already fulfilled by the queryFn
        if (isFirstEmission) {
          isFirstEmission = false;
          return;
        }

        // Only invalidate if there were actual changes in the snapshot
        if (snapshot.docChanges().length > 0) {
          queryClient.invalidateQueries({
            queryKey: queryKeys.bloodRequests.feed(serializedFilters),
          });
        }
      },
      (err) => {
        console.warn("[Blood Requests Feed Listener]:", err);
        setIsLiveConnected(false);
      }
    );

    return () => {
      unsubscribe();
      setIsLiveConnected(false);
    };
  }, [
    enabled,
    filters.bloodGroup,
    filters.divisionId,
    filters.districtId,
    serializedFilters,
    queryClient,
  ]);

  const queryResult = useInfiniteQuery<
    PaginatedBloodRequestsFeedResult,
    Error,
    InfiniteData<
      PaginatedBloodRequestsFeedResult,
      QueryDocumentSnapshot<DocumentData> | null
    >,
    ReturnType<typeof queryKeys.bloodRequests.feed>,
    QueryDocumentSnapshot<DocumentData> | null
  >({
    queryKey: queryKeys.bloodRequests.feed(serializedFilters),
    queryFn: ({ pageParam }) =>
      getBloodRequestsFeed(filters, {
        pageSize,
        cursor: pageParam,
      }),
    initialPageParam: null,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    enabled,
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    ...queryResult,
    isLiveConnected,
  };
}

