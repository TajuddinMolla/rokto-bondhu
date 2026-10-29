"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { doc, onSnapshot, Timestamp } from "firebase/firestore";

import { getDonorProfile, DONOR_PROFILES_COLLECTION } from "@/services/donor.service";
import { queryKeys } from "@/constants/query-keys";
import { getFirebaseDb } from "@/lib/firebase/config";
import type { DonorProfile, DonorContactMode } from "@/types/donor";
import type { DonorAvailabilityStatus } from "@/types/blood";

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
 * Hook to retrieve an authenticated user's private donor profile
 * with real-time onSnapshot updates for availability and contactMode.
 */
export function useDonorProfile(userId?: string | null) {
  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (!userId) return;
    const db = getFirebaseDb();
    if (!db) return;

    const docRef = doc(db, DONOR_PROFILES_COLLECTION, userId);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          queryClient.setQueryData(queryKeys.donors.profile(userId), null);
          return;
        }

        const data = snapshot.data();
        const contactMode: DonorContactMode =
          data.contactMode || (data.isPhonePublic ? "PUBLIC" : "PRIVATE");

        const profile: DonorProfile = {
          id: snapshot.id,
          userId: snapshot.id,
          displayName: data.displayName || "",
          bloodGroup: data.bloodGroup,
          divisionId: data.divisionId,
          districtId: data.districtId,
          upazilaId: data.upazilaId,
          area: data.area || undefined,
          phoneNumber: data.phoneNumber,
          isPhonePublic: contactMode === "PUBLIC",
          contactMode,
          phoneVisibility: contactMode,
          lastDonationDate: data.lastDonationDate || undefined,
          availabilityStatus: data.availabilityStatus as DonorAvailabilityStatus,
          createdAt: timestampToIso(data.createdAt),
          updatedAt: timestampToIso(data.updatedAt),
        };

        queryClient.setQueryData(queryKeys.donors.profile(userId), profile);
      },
      (err) => {
        console.warn(`[Realtime Donor Profile Sync Error for ${userId}]:`, err);
      }
    );

    return () => unsubscribe();
  }, [userId, queryClient]);

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
