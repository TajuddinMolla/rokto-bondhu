"use client";

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import type { DocumentSnapshot } from "firebase/firestore";

import { queryKeys } from "@/constants/query-keys";
import {
  getAdminDashboardStats,
  getAdminDonors,
  getAdminRequests,
  getAdminUsers,
  getAdminReports,
  getAdminAuditLogs,
} from "@/services/admin.service";
import type { BloodGroup, RequestStatus } from "@/types/blood";

/**
 * Retrieves aggregate statistics for the Admin Dashboard.
 */
export function useAdminStats(enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.admin.stats(),
    queryFn: () => getAdminDashboardStats(),
    enabled,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Retrieves paginated donors list for administrative review.
 */
export function useAdminDonors(filters: {
  bloodGroup?: BloodGroup | string;
  statusFilter?: "ALL" | "ACTIVE" | "SUSPENDED";
  enabled?: boolean;
}) {
  const { bloodGroup, statusFilter, enabled = true } = filters;

  return useInfiniteQuery({
    queryKey: queryKeys.admin.donors({ bloodGroup, statusFilter }),
    queryFn: ({ pageParam }) =>
      getAdminDonors({
        bloodGroup,
        statusFilter,
        cursorDoc: pageParam as DocumentSnapshot | null,
      }),
    initialPageParam: null as DocumentSnapshot | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursorDoc : undefined,
    enabled,
    staleTime: 30 * 1000,
  });
}

/**
 * Retrieves paginated blood requests list for moderation.
 */
export function useAdminRequests(filters: {
  status?: RequestStatus | string;
  enabled?: boolean;
}) {
  const { status, enabled = true } = filters;

  return useInfiniteQuery({
    queryKey: queryKeys.admin.requests({ status }),
    queryFn: ({ pageParam }) =>
      getAdminRequests({
        status,
        cursorDoc: pageParam as DocumentSnapshot | null,
      }),
    initialPageParam: null as DocumentSnapshot | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursorDoc : undefined,
    enabled,
    staleTime: 30 * 1000,
  });
}

/**
 * Retrieves paginated user profiles for account moderation.
 */
export function useAdminUsers(filters: {
  isSuspended?: boolean;
  enabled?: boolean;
}) {
  const { isSuspended, enabled = true } = filters;

  return useInfiniteQuery({
    queryKey: queryKeys.admin.users({ isSuspended }),
    queryFn: ({ pageParam }) =>
      getAdminUsers({
        isSuspended,
        cursorDoc: pageParam as DocumentSnapshot | null,
      }),
    initialPageParam: null as DocumentSnapshot | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursorDoc : undefined,
    enabled,
    staleTime: 30 * 1000,
  });
}

/**
 * Retrieves paginated report queue for review.
 */
export function useAdminReports(filters: {
  status?: string;
  enabled?: boolean;
}) {
  const { status, enabled = true } = filters;

  return useInfiniteQuery({
    queryKey: queryKeys.admin.reports({ status }),
    queryFn: ({ pageParam }) =>
      getAdminReports({
        status,
        cursorDoc: pageParam as DocumentSnapshot | null,
      }),
    initialPageParam: null as DocumentSnapshot | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursorDoc : undefined,
    enabled,
    staleTime: 15 * 1000,
  });
}

/**
 * Retrieves paginated audit logs.
 */
export function useAdminAuditLogs(filters: {
  targetType?: string;
  enabled?: boolean;
}) {
  const { targetType, enabled = true } = filters;

  return useInfiniteQuery({
    queryKey: queryKeys.admin.auditLogs({ targetType }),
    queryFn: ({ pageParam }) =>
      getAdminAuditLogs({
        targetType,
        cursorDoc: pageParam as DocumentSnapshot | null,
      }),
    initialPageParam: null as DocumentSnapshot | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursorDoc : undefined,
    enabled,
    staleTime: 30 * 1000,
  });
}
