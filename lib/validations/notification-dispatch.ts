import { z } from "zod";

export const NOTIFICATION_EVENTS = [
  "CONTACT_REQUEST_RECEIVED",
  "CONTACT_REQUEST_ACCEPTED",
  "CONTACT_REQUEST_DECLINED",
  "CONTACT_REQUEST_CANCELLED",
  "CONTACT_INFO_SHARED",
  "CONTACT_REQUEST_COMPLETED",
  "BLOOD_REQUEST_CREATED",
  "BLOOD_REQUEST_MATCH",
  "BLOOD_REQUEST_FULFILLED",
  "BLOOD_REQUEST_CANCELLED",
  "MODERATION_NOTICE",
] as const;

export const dispatchNotificationSchema = z
  .object({
    event: z.enum(NOTIFICATION_EVENTS, {
      message: "Invalid or unsupported notification event",
    }),
    contactRequestId: z.string().trim().min(1).optional(),
    bloodRequestId: z.string().trim().min(1).optional(),
  })
  .refine(
    (data) => Boolean(data.contactRequestId || data.bloodRequestId),
    {
      message: "Either contactRequestId or bloodRequestId is required",
      path: ["event"],
    }
  );

export type DispatchNotificationPayload = z.infer<typeof dispatchNotificationSchema>;
