import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getServerFirestore } from "@/lib/firebase/server";

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

    const batch = db.batch();
    let expiredBloodCount = 0;
    let expiredContactCount = 0;

    // -------------------------------------------------------------
    // 1. Expire Open Blood Requests older than 7 days
    // -------------------------------------------------------------
    const openBloodSnap = await db
      .collection("bloodRequests")
      .where("status", "==", "open")
      .where("createdAt", "<=", sevenDaysAgoIso)
      .limit(100)
      .get();

    for (const docSnap of openBloodSnap.docs) {
      const data = docSnap.data();
      const requestId = docSnap.id;
      const requesterId = String(data.requesterId || "");
      const bloodGroup = String(data.bloodGroup || "");

      batch.update(docSnap.ref, {
        status: "expired",
        expiredAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      expiredBloodCount++;

      // Create notification for requester if valid ID exists
      if (requesterId) {
        const notifId = `notif_blood_req_expired_${requestId}`;
        const notifRef = db.collection("notifications").doc(notifId);
        batch.set(
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
      }
    }

    // -------------------------------------------------------------
    // 2. Expire Pending Contact Requests older than 48 hours
    // -------------------------------------------------------------
    const pendingContactSnap = await db
      .collection("donorContactRequests")
      .where("status", "==", "PENDING")
      .where("createdAt", "<=", fortyEightHoursAgoIso)
      .limit(100)
      .get();

    for (const docSnap of pendingContactSnap.docs) {
      const data = docSnap.data();
      const contactRequestId = docSnap.id;
      const requesterId = String(data.requesterId || "");
      const donorName = String(data.donorName || "রক্তদাতা");

      batch.update(docSnap.ref, {
        status: "EXPIRED",
        expiredAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      expiredContactCount++;

      // Create notification for requester to alert them to find other donors
      if (requesterId) {
        const notifId = `notif_contact_req_expired_${contactRequestId}`;
        const notifRef = db.collection("notifications").doc(notifId);
        batch.set(
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
      }
    }

    if (expiredBloodCount > 0 || expiredContactCount > 0) {
      await batch.commit();
    }

    console.info(
      `[Cron Expire] Processed expiry: ${expiredBloodCount} blood requests, ${expiredContactCount} contact requests`
    );

    return NextResponse.json({
      success: true,
      expiredBloodRequests: expiredBloodCount,
      expiredContactRequests: expiredContactCount,
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

