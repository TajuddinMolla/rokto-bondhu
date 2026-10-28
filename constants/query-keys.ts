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
    matching: (requestId: string, scope?: string, filters?: Record<string, unknown>) =>
      [...queryKeys.donors.all, "matching", requestId, scope ?? "default", filters ?? {}] as const,
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

  notifications: {
    all: ["notifications"] as const,
    list: (recipientId?: string, unreadOnly?: boolean) =>
      [...queryKeys.notifications.all, "list", recipientId ?? "me", { unreadOnly: Boolean(unreadOnly) }] as const,
    infinite: (recipientId?: string, unreadOnly?: boolean) =>
      [...queryKeys.notifications.all, "infinite", recipientId ?? "me", { unreadOnly: Boolean(unreadOnly) }] as const,
    unreadCount: (recipientId?: string) =>
      [...queryKeys.notifications.all, "unread-count", recipientId ?? "me"] as const,
    preferences: (recipientId?: string) =>
      [...queryKeys.notifications.all, "preferences", recipientId ?? "me"] as const,
  },

  admin: {
    all: ["admin"] as const,
    stats: () => [...queryKeys.admin.all, "stats"] as const,
    donors: (filters?: Record<string, unknown>) =>
      [...queryKeys.admin.all, "donors", filters ?? {}] as const,
    requests: (filters?: Record<string, unknown>) =>
      [...queryKeys.admin.all, "requests", filters ?? {}] as const,
    users: (filters?: Record<string, unknown>) =>
      [...queryKeys.admin.all, "users", filters ?? {}] as const,
    reports: (filters?: Record<string, unknown>) =>
      [...queryKeys.admin.all, "reports", filters ?? {}] as const,
    auditLogs: (filters?: Record<string, unknown>) =>
      [...queryKeys.admin.all, "audit-logs", filters ?? {}] as const,
  },

  reports: {
    all: ["reports"] as const,
    myReports: (userId?: string) =>
      [...queryKeys.reports.all, "my", userId ?? "me"] as const,
  },
} as const;
