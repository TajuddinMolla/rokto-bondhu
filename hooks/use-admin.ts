"use client";

import { useAuth } from "@/hooks/use-auth";

/**
 * Convenience hook for administrative access validation.
 * Checks whether the active authenticated user has admin privileges.
 */
export function useAdmin() {
  const { user, loading, status, isAdmin } = useAuth();

  return {
    isAdmin: Boolean(isAdmin),
    loading: loading || status === "loading",
    user,
    isAuthenticated: status === "authenticated",
  };
}
