"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserProfile } from "@/services/user.service";
import { queryKeys } from "@/constants/query-keys";
import type { UpdateUserProfileInput } from "@/types/user";

interface UpdateUserProfileVariables {
  uid: string;
  data: UpdateUserProfileInput;
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, UpdateUserProfileVariables>({
    mutationFn: ({ uid, data }) => updateUserProfile(uid, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.user.profile(variables.uid),
      });
    },
  });
}
