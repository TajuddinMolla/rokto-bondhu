/**
 * Domain types and interfaces for the RoktoBondhu notification system.
 */

export type NotificationType =
  | "CONTACT_REQUEST_RECEIVED"
  | "CONTACT_REQUEST_ACCEPTED"
  | "CONTACT_REQUEST_DECLINED"
  | "CONTACT_REQUEST_CANCELLED"
  | "CONTACT_INFO_SHARED"
  | "CONTACT_REQUEST_SUBMITTED"
  | "BLOOD_REQUEST_CREATED"
  | "BLOOD_REQUEST_MATCH"
  | "BLOOD_REQUEST_FULFILLED"
  | "BLOOD_REQUEST_CANCELLED"
  | "MODERATION_NOTICE";

export type EmailDeliveryStatus =
  | "NOT_APPLICABLE"
  | "PENDING"
  | "SENT"
  | "ACCEPTED_BY_PROVIDER"
  | "FAILED"
  | "SKIPPED_PREFERENCE"
  | "SKIPPED_QUOTA";

export interface LocalizedContent {
  bn: string;
  en: string;
}

export interface AppNotification {
  id: string;
  recipientId: string;
  senderId?: string;
  type: NotificationType;
  title: LocalizedContent;
  message: LocalizedContent;
  relatedRequestId?: string;
  relatedContactRequestId?: string;
  actionUrl: string;
  read: boolean;
  readAt?: string | null;
  emailStatus: EmailDeliveryStatus;
  emailSentAt?: string | null;
  emailError?: string | null;
  createdAt: string; // ISO 8601 UTC timestamp
  updatedAt: string; // ISO 8601 UTC timestamp
}

export interface NotificationFilterParams {
  unreadOnly?: boolean;
  type?: NotificationType;
}

export interface PaginatedNotificationsResult {
  notifications: AppNotification[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nextCursorDoc: any | null;
  hasMore: boolean;
  totalUnreadCount?: number;
}

export interface NotificationPreferences {
  emailNotificationsEnabled: boolean;
}

export interface DispatchNotificationInput {
  event: NotificationType;
  contactRequestId?: string;
  bloodRequestId?: string;
  customData?: Record<string, unknown>;
}
