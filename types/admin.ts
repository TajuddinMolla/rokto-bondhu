/**
 * Domain definitions for RoktoBondhu Admin, Moderation, Audit Logging, and Reporting.
 */

export interface AdminDashboardStats {
  totalUsers: number;
  activeDonors: number;
  publicDonors: number;
  privateDonors: number;
  openRequests: number;
  pendingReports: number;
  recentAuditCount: number;
}

export type AuditActionType =
  | "DONOR_SUSPEND"
  | "DONOR_RESTORE"
  | "DONOR_PHONE_PRIVATIZE"
  | "REQUEST_HIDE"
  | "REQUEST_RESTORE"
  | "USER_SUSPEND"
  | "USER_RESTORE"
  | "REPORT_RESOLVE"
  | "REPORT_DISMISS";

export type AuditTargetType = "DONOR" | "BLOOD_REQUEST" | "USER" | "REPORT";

export interface AuditLogEntry {
  id: string;
  adminId: string;
  adminEmail: string;
  action: AuditActionType;
  targetType: AuditTargetType;
  targetId: string;
  targetTitle?: string;
  reason: string;
  metadata?: Record<string, unknown>;
  createdAt: string; // ISO 8601 UTC string
}

export type ReportTargetType = "DONOR" | "BLOOD_REQUEST" | "USER";

export type ReportReason =
  | "INAPPROPRIATE_CONTENT"
  | "SPAM"
  | "FAKE_INFORMATION"
  | "HARASSMENT"
  | "OTHER";

export type ReportStatus =
  | "PENDING"
  | "INVESTIGATING"
  | "RESOLVED"
  | "DISMISSED";

export interface UserReport {
  id: string;
  reporterId: string;
  reporterEmail?: string;
  targetType: ReportTargetType;
  targetId: string;
  targetTitle?: string;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  resolutionNotes?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string; // ISO 8601 UTC string
  updatedAt: string; // ISO 8601 UTC string
}

export interface PaginatedAdminResult<T> {
  items: T[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nextCursorDoc: any | null;
  hasMore: boolean;
  totalCount?: number;
}

export interface ModerationActionInput {
  targetId: string;
  targetTitle?: string;
  reason: string;
  action: AuditActionType;
  metadata?: Record<string, unknown>;
}

export interface CreateReportInput {
  targetType: ReportTargetType;
  targetId: string;
  targetTitle?: string;
  reason: ReportReason;
  description?: string;
}

export interface ResolveReportInput {
  reportId: string;
  status: "RESOLVED" | "DISMISSED";
  resolutionNotes: string;
}
