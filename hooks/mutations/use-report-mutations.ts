"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { useAuth } from "@/hooks/use-auth";
import { submitUserReport } from "@/services/report.service";
import type { CreateReportInput } from "@/types/admin";

export function useSubmitReport() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (input: CreateReportInput) => {
      if (!user?.uid) {
        throw new Error("Must be logged in to submit a report");
      }
      return submitUserReport(user.uid, user.email || undefined, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
    },
  });
}
