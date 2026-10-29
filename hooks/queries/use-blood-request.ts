"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { doc, onSnapshot, Timestamp } from "firebase/firestore";

import { queryKeys } from "@/constants/query-keys";
import { getFirebaseDb } from "@/lib/firebase/config";
import { getBloodRequestById } from "@/services/blood-request.service";
import type { BloodRequest } from "@/types/request";

function timestampToIso(value: unknown): string {
  if (!value) return new Date().toISOString();
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  if (typeof value === "string") {
    return value;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  return new Date().toISOString();
}

/**
 * Hook to retrieve an individual blood request with real-time status updates via onSnapshot.
 */
export function useBloodRequest(requestId: string | undefined) {
  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (!requestId) return;
    const db = getFirebaseDb();
    if (!db) return;

    const docRef = doc(db, "bloodRequests", requestId);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          queryClient.setQueryData(queryKeys.bloodRequests.detail(requestId), null);
          return;
        }

        const data = snapshot.data();
        const request: BloodRequest = {
          id: snapshot.id,
          requesterId: data.requesterId,
          requesterName: data.requesterName || "",
          contactNumber: data.contactNumber || "",
          bloodGroup: data.bloodGroup,
          unitsNeeded: data.unitsNeeded || 1,
          divisionId: data.divisionId,
          districtId: data.districtId,
          upazilaId: data.upazilaId,
          hospitalName: data.hospitalName || undefined,
          locationAddress: data.locationAddress || undefined,
          neededAt: data.neededAt || "",
          urgency: data.urgency || "urgent",
          status: data.status || "open",
          scope: data.scope || "LOCAL",
          additionalNotes: data.additionalNotes || undefined,
          createdAt: timestampToIso(data.createdAt),
          updatedAt: timestampToIso(data.updatedAt),
        };

        queryClient.setQueryData(queryKeys.bloodRequests.detail(requestId), request);
      },
      (err) => {
        console.warn(`[Realtime Blood Request Sync Error for ${requestId}]:`, err);
      }
    );

    return () => unsubscribe();
  }, [requestId, queryClient]);

  return useQuery<BloodRequest | null, Error>({
    queryKey: queryKeys.bloodRequests.detail(requestId || ""),
    queryFn: () => {
      if (!requestId) return Promise.resolve(null);
      return getBloodRequestById(requestId);
    },
    enabled: Boolean(requestId),
    staleTime: 1000 * 60 * 5,
  });
}
