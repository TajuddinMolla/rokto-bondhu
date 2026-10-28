"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { useAuth } from "@/hooks/use-auth";
import {
  suspendDonor,
  restoreDonor,
  privatizeDonorPhone,
  hideBloodRequest,
  restoreBloodRequest,
  suspendUserAccount,
  restoreUserAccount,
  resolveReport,
} from "@/services/admin.service";
import type { ResolveReportInput } from "@/types/admin";

export function useAdminMutations() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const adminOperator = {
    uid: user?.uid || "",
    email: user?.email || "",
  };

  const suspendDonorMutation = useMutation({
    mutationFn: (input: {
      donorId: string;
      donorName?: string;
      reason: string;
    }) => suspendDonor(adminOperator, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.donors.all });
    },
  });

  const restoreDonorMutation = useMutation({
    mutationFn: (input: {
      donorId: string;
      donorName?: string;
      reason: string;
    }) => restoreDonor(adminOperator, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.donors.all });
    },
  });

  const privatizeDonorPhoneMutation = useMutation({
    mutationFn: (input: {
      donorId: string;
      donorName?: string;
      reason: string;
    }) => privatizeDonorPhone(adminOperator, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.donors.all });
    },
  });

  const hideBloodRequestMutation = useMutation({
    mutationFn: (input: {
      requestId: string;
      requesterId: string;
      requesterName?: string;
      reason: string;
    }) => hideBloodRequest(adminOperator, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.bloodRequests.all });
    },
  });

  const restoreBloodRequestMutation = useMutation({
    mutationFn: (input: {
      requestId: string;
      requesterId: string;
      requesterName?: string;
      reason: string;
    }) => restoreBloodRequest(adminOperator, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.bloodRequests.all });
    },
  });

  const suspendUserMutation = useMutation({
    mutationFn: (input: {
      userId: string;
      userEmail?: string;
      reason: string;
    }) => suspendUserAccount(adminOperator, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
    },
  });

  const restoreUserMutation = useMutation({
    mutationFn: (input: {
      userId: string;
      userEmail?: string;
      reason: string;
    }) => restoreUserAccount(adminOperator, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
    },
  });

  const resolveReportMutation = useMutation({
    mutationFn: (
      input: ResolveReportInput & { targetType?: string; targetId?: string },
    ) => resolveReport(adminOperator, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
    },
  });

  return {
    suspendDonor: suspendDonorMutation,
    restoreDonor: restoreDonorMutation,
    privatizeDonorPhone: privatizeDonorPhoneMutation,
    hideBloodRequest: hideBloodRequestMutation,
    restoreBloodRequest: restoreBloodRequestMutation,
    suspendUser: suspendUserMutation,
    restoreUser: restoreUserMutation,
    resolveReport: resolveReportMutation,
  };
}
