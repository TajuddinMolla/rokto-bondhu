"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";

import { queryKeys } from "@/constants/query-keys";
import { getFirebaseDb } from "@/lib/firebase/config";
import { getMyBloodRequests } from "@/services/blood-request.service";
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
 * Hook to retrieve all blood requests created by the active user
 * with real-time onSnapshot updates for immediate UI synchronization.
 */
export function useMyBloodRequests(userId: string | undefined) {
  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (!userId) return;
    const db = getFirebaseDb();
    if (!db) return;

    const colRef = collection(db, "bloodRequests");
    const q = query(colRef, where("requesterId", "==", userId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const requests: BloodRequest[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          requests.push({
            id: d.id,
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
          });
        });

        // Sort descending by creation date
        requests.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        queryClient.setQueryData(queryKeys.bloodRequests.my(userId), requests);
      },
      (err) => {
        console.warn(`[Realtime My Blood Requests Sync Error for ${userId}]:`, err);
      }
    );

    return () => unsubscribe();
  }, [userId, queryClient]);

  return useQuery<BloodRequest[], Error>({
    queryKey: queryKeys.bloodRequests.my(userId),
    queryFn: () => {
      if (!userId) return Promise.resolve([]);
      return getMyBloodRequests(userId);
    },
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 2,
  });
}
