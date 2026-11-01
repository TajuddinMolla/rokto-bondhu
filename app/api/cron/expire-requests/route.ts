import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getServerFirestore } from "@/lib/firebase/server";
import { calculateDonorEligibility } from "@/lib/utils/donor-eligibility";

/**
 * Validates authorization for scheduled background cron execution.
 * Checks CRON_SECRET against Bearer token or x-cron-secret header.
 */
function isAuthorizedCron(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    // In local development, permit if no secret configured
    return process.env.NODE_ENV !== "production";
  }

  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    if (token === secret) return true;
  }

  const customHeader = req.headers.get("x-cron-secret");
  if (customHeader === secret) return true;

  return false;
}

async function handleExpireRequests(req: NextRequest) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid or missing cron secret" },
      { status: 401 }
    );
  }

  const db = getServerFirestore();
  if (!db) {
    return NextResponse.json(
      { error: "Server Firestore not configured" },
      { status: 503 }
    );
  }

  try {
    const nowMs = Date.now();
    const sevenDaysAgoIso = new Date(nowMs - 7 * 24 * 60 * 60 * 1000).toISOString();
    const fortyEightHoursAgoIso = new Date(nowMs - 48 * 60 * 60 * 1000).toISOString();
    const fortyEightHoursAgoMs = nowMs - 48 * 60 * 60 * 1000;

    let currentBatch = db.batch();
    let currentBatchOps = 0;
    const MAX_OPS_PER_BATCH = 200;

    const commitBatchIfFull = async () => {
      if (currentBatchOps >= MAX_OPS_PER_BATCH) {
        await currentBatch.commit();
        currentBatch = db.batch();
        currentBatchOps = 0;
      }
    };

    let expiredBloodCount = 0;
    let expiredContactCount = 0;

    // -------------------------------------------------------------
    // 1. Expire Open Blood Requests where expiresAt <= now
    // (with 7-day fallback for legacy records)
    // -------------------------------------------------------------
    const openBloodSnap = await db
      .collection("bloodRequests")
      .where("status", "==", "open")
      .limit(200)
      .get();

    for (const docSnap of openBloodSnap.docs) {
      const data = docSnap.data();
      const requestId = docSnap.id;
      const requesterId = String(data.requesterId || "");
      const bloodGroup = String(data.bloodGroup || "");

      // Evaluate expiration reliably: check expiresAt first, then fallback to 7 days from createdAt
      let isExpired = false;
      if (data.expiresAt) {
        const expMs =
          typeof data.expiresAt.toMillis === "function"
            ? data.expiresAt.toMillis()
            : new Date(data.expiresAt).getTime();
        if (!isNaN(expMs) && expMs <= nowMs) {
          isExpired = true;
        }
      } else if (data.createdAt) {
        const createdMs =
          typeof data.createdAt.toMillis === "function"
            ? data.createdAt.toMillis()
            : new Date(data.createdAt).getTime();
        if (!isNaN(createdMs) && createdMs + 7 * 24 * 60 * 60 * 1000 <= nowMs) {
          isExpired = true;
        }
      }

      if (!isExpired) {
        continue;
      }

      currentBatch.update(docSnap.ref, {
        status: "expired",
        expiredAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      currentBatchOps++;
      expiredBloodCount++;

      // Create notification for requester if valid ID exists
      if (requesterId) {
        const notifId = `notif_blood_req_expired_${requestId}`;
        const notifRef = db.collection("notifications").doc(notifId);
        currentBatch.set(
          notifRef,
          {
            recipientId: requesterId,
            type: "MODERATION_NOTICE",
            title: {
              bn: "রক্তের অনুরোধের মেয়াদ উত্তীর্ণ হয়েছে",
              en: "Blood Request Expired",
            },
            message: {
              bn: `${bloodGroup} গ্রুপের রক্তের অনুরোধটির সক্রিয় সময়সীমা (৭ দিন) অতিক্রান্ত হওয়ায় এটি মেয়াদোত্তীর্ণ হয়েছে। প্রয়োজন থাকলে নতুন অনুরোধ প্রচার করুন।`,
              en: `Your blood request for group ${bloodGroup} has expired after 7 days. If you still need blood, please broadcast an updated request.`,
            },
            relatedRequestId: requestId,
            actionUrl: `/blood-request/${requestId}`,
            read: false,
            readAt: null,
            emailStatus: "NOT_APPLICABLE",
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
        currentBatchOps++;
      }

      await commitBatchIfFull();
    }

    // -------------------------------------------------------------
    // 2. Expire Pending Contact Requests older than 48 hours
    // -------------------------------------------------------------
    const pendingContactSnap = await db
      .collection("donorContactRequests")
      .where("status", "==", "PENDING")
      .limit(200)
      .get();

    for (const docSnap of pendingContactSnap.docs) {
      const data = docSnap.data();
      const contactRequestId = docSnap.id;
      const requesterId = String(data.requesterId || "");
      const donorName = String(data.donorName || "রক্তদাতা");

      let isExpired = false;
      if (data.createdAt) {
        const createdMs =
          typeof data.createdAt.toMillis === "function"
            ? data.createdAt.toMillis()
            : new Date(data.createdAt).getTime();
        if (!isNaN(createdMs) && createdMs <= fortyEightHoursAgoMs) {
          isExpired = true;
        }
      }

      if (!isExpired) {
        continue;
      }

      currentBatch.update(docSnap.ref, {
        status: "EXPIRED",
        expiredAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      currentBatchOps++;
      expiredContactCount++;

      // Create notification for requester to alert them to find other donors
      if (requesterId) {
        const notifId = `notif_contact_req_expired_${contactRequestId}`;
        const notifRef = db.collection("notifications").doc(notifId);
        currentBatch.set(
          notifRef,
          {
            recipientId: requesterId,
            type: "CONTACT_REQUEST_DECLINED",
            title: {
              bn: "যোগাযোগের অনুরোধের সময়সীমা শেষ হয়েছে",
              en: "Contact Request Expired",
            },
            message: {
              bn: `রক্তদাতা ${donorName}-এর সাথে যোগাযোগের অনুরোধটি ৪৮ ঘণ্টায় সাড়া না পাওয়ায় মেয়াদোত্তীর্ণ হয়েছে। অনুগ্রহ করে অন্যান্য সক্রিয় রক্তদাতাদের অনুসন্ধান করুন।`,
              en: `Your contact request to donor ${donorName} expired after 48 hours without a response. Please explore other active donors.`,
            },
            relatedContactRequestId: contactRequestId,
            actionUrl: "/account/contact-requests",
            read: false,
            readAt: null,
            emailStatus: "NOT_APPLICABLE",
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
        currentBatchOps++;
      }

      await commitBatchIfFull();
    }

    // -------------------------------------------------------------
    // 3. Reset Donors whose 120-day recovery period has elapsed
    // -------------------------------------------------------------
    let recoveredDonorCount = 0;

    const recoveringDonorsSnap = await db
      .collection("donorProfiles")
      .where("availabilityStatus", "==", "unavailable")
      .limit(200)
      .get();

    for (const docSnap of recoveringDonorsSnap.docs) {
      const data = docSnap.data();
      const donorId = docSnap.id;
      const lastDonation = data.lastDonationDate;
      const reason = data.unavailableReason;

      // Strict Rule: Cron must automatically reactivate a donor ONLY when:
      // unavailableReason === "MEDICAL_RECOVERY"
      // Never reactivate MANUAL_PAUSE, legacy undefined/missing reason, or nextEligibleDate alone.
      if (reason !== "MEDICAL_RECOVERY") {
        continue;
      }

      // If they had no lastDonationDate, preserve existing status
      if (!lastDonation) {
        continue;
      }

      const eligibility = calculateDonorEligibility(lastDonation);
      // Strictly verify 120-day recovery has elapsed
      if (!eligibility.isEligible) {
        continue;
      }

      const donorRef = docSnap.ref;
      const publicRef = db.collection("publicDonorProfiles").doc(donorId);

      const updateData = {
        availabilityStatus: "available",
        unavailableReason: FieldValue.delete(),
        nextEligibleDate: FieldValue.delete(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      currentBatch.update(donorRef, updateData);
      currentBatch.set(publicRef, updateData, { merge: true });
      currentBatchOps += 2;
      recoveredDonorCount++;

      // Create in-app notification to the donor using a deterministic ID based on donorId + lastDonationDate
      // Prevents duplicate notifications on repeated or concurrent cron executions
      const notifId = `notif_donor_recovery_reset_${donorId}_${lastDonation}`;
      const notifRef = db.collection("notifications").doc(notifId);
      currentBatch.set(
        notifRef,
        {
          recipientId: donorId,
          type: "MODERATION_NOTICE",
          title: {
            bn: "রক্তদানের জন্য আপনি পুনরায় প্রস্তুত",
            en: "You are now eligible to donate blood again!",
          },
          message: {
            bn: "সর্বশেষ রক্তদানের ১২০ দিনের বিরতি সফলভাবে সম্পন্ন হয়েছে। আপনার প্রোফাইল স্বয়ংক্রিয়ভাবে 'রক্তদানে প্রস্তুত' হিসেবে সক্রিয় করা হয়েছে।",
            en: "Your 120-day recovery period since your last donation has ended. Your profile has been automatically restored to 'Available to Donate'.",
          },
          actionUrl: "/account/profile",
          read: false,
          readAt: null,
          emailStatus: "NOT_APPLICABLE",
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      currentBatchOps++;

      await commitBatchIfFull();
    }

    if (currentBatchOps > 0) {
      await currentBatch.commit();
    }

    console.info(
      `[Cron Expire & Recover] Cutoffs: 7d=${sevenDaysAgoIso}, 48h=${fortyEightHoursAgoIso}. Processed: ${expiredBloodCount} blood requests expired, ${expiredContactCount} contact requests expired, ${recoveredDonorCount} donors recovered.`
    );

    return NextResponse.json({
      success: true,
      expiredBloodRequests: expiredBloodCount,
      expiredContactRequests: expiredContactCount,
      recoveredDonors: recoveredDonorCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error("[Cron Expire Error]:", error);
    return NextResponse.json(
      { success: false, error: (error as Error)?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return handleExpireRequests(req);
}

export async function POST(req: NextRequest) {
  return handleExpireRequests(req);
}

