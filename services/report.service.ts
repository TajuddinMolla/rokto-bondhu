import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  limit,
  serverTimestamp,
} from "firebase/firestore";

import { getFirebaseDb } from "@/lib/firebase/config";
import type { CreateReportInput, UserReport } from "@/types/admin";

export const REPORTS_COLLECTION = "reports";

/**
 * Submits a new user report / flag against a donor, blood request, or user.
 * Deduplicates to prevent the same user from submitting multiple pending reports on the same target.
 */
export async function submitUserReport(
  reporterId: string,
  reporterEmail: string | undefined,
  input: CreateReportInput,
): Promise<UserReport> {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error("Firestore is not configured");
  }

  if (!reporterId) {
    throw new Error("User must be authenticated to submit a report");
  }

  const colRef = collection(db, REPORTS_COLLECTION);

  // Deduplication check: check for existing PENDING report by this user on this target
  try {
    const dupQuery = query(
      colRef,
      where("reporterId", "==", reporterId),
      where("targetId", "==", input.targetId),
      where("status", "==", "PENDING"),
      limit(1),
    );
    const existingSnap = await getDocs(dupQuery);
    if (!existingSnap.empty) {
      throw new Error(
        "A pending report for this item has already been submitted",
      );
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("pending report")) {
      throw err;
    }
    // Non-fatal if index not yet created
  }

  const payload: Record<string, unknown> = {
    reporterId,
    reporterEmail: reporterEmail || null,
    targetType: input.targetType,
    targetId: input.targetId,
    targetTitle: input.targetTitle || null,
    reason: input.reason,
    description: input.description?.trim() || null,
    status: "PENDING",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(colRef, payload);
  const now = new Date().toISOString();

  return {
    id: docRef.id,
    reporterId,
    reporterEmail,
    targetType: input.targetType,
    targetId: input.targetId,
    targetTitle: input.targetTitle,
    reason: input.reason,
    description: input.description?.trim(),
    status: "PENDING",
    createdAt: now,
    updatedAt: now,
  };
}
