"use client";

import { useAuth } from "@/hooks/use-auth";
import { useUserProfile } from "@/hooks/queries/use-user-profile";
import { useDonorProfile } from "@/hooks/queries/use-donor-profile";

export interface UseIsDonorResult {
  isDonor: boolean;
  isLoading: boolean;
  user: ReturnType<typeof useAuth>["user"];
  isAuthenticated: boolean;
}

/**
 * Reusable client hook to determine if the currently logged-in user
 * has an active blood donor profile.
 */
export function useIsDonor(): UseIsDonorResult {
  const { user, status, loading: isAuthLoading } = useAuth();
  const userId = user?.uid;

  const { data: userProfile, isLoading: isUserLoading } = useUserProfile(userId);
  const { data: donorProfile, isLoading: isDonorLoading } = useDonorProfile(userId);

  const isDonor = Boolean(userProfile?.hasDonorProfile || donorProfile);
  const isLoading =
    isAuthLoading || (Boolean(userId) && (isUserLoading || isDonorLoading));

  return {
    isDonor,
    isLoading,
    user,
    isAuthenticated: status === "authenticated",
  };
}
