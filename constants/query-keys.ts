/**
 * Centralized, type-safe query keys for TanStack React Query.
 * Organizes caches and enables targeted invalidations without hardcoded string arrays.
 */

export const queryKeys = {
  donors: {
    all: ["donors"] as const,
    lists: () => [...queryKeys.donors.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.donors.lists(), filters ?? {}] as const,
    details: () => [...queryKeys.donors.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.donors.details(), id] as const,
    profile: (userId?: string) => [...queryKeys.donors.all, "profile", userId ?? "me"] as const,
  },

  bloodRequests: {
    all: ["blood-requests"] as const,
    lists: () => [...queryKeys.bloodRequests.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.bloodRequests.lists(), filters ?? {}] as const,
    details: () => [...queryKeys.bloodRequests.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.bloodRequests.details(), id] as const,
    my: (userId?: string) => [...queryKeys.bloodRequests.all, "my", userId ?? "me"] as const,
  },

  user: {
    all: ["user"] as const,
    profile: (userId?: string) => [...queryKeys.user.all, "profile", userId ?? "me"] as const,
    activity: (userId?: string) => [...queryKeys.user.all, "activity", userId ?? "me"] as const,
  },

  contactRequests: {
    all: ["contact-requests"] as const,
    incoming: (donorId?: string) =>
      [...queryKeys.contactRequests.all, "incoming", donorId ?? "me"] as const,
    outgoing: (requesterId?: string) =>
      [...queryKeys.contactRequests.all, "outgoing", requesterId ?? "me"] as const,
    active: (requesterId: string, donorId: string) =>
      [...queryKeys.contactRequests.all, "active", requesterId, donorId] as const,
  },
} as const;
