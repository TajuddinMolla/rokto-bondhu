import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

import { getServerFirestore, getServerAuth } from "@/lib/firebase/server";
import {
  sendTransactionalEmail,
  buildContactRequestReceivedEmail,
  buildContactRequestAcceptedEmail,
  buildContactInfoSharedEmail,
  buildBloodRequestCreatedEmail,
  buildBloodRequestRequesterConfirmationEmail,
  buildBloodRequestStatusEmail,
} from "@/services/email.service";
import { sendPushNotification } from "@/services/push.service";
import { getDistrictById, getDivisionById } from "@/constants/locations";
import { normalizeBloodGroup } from "@/constants/blood-groups";
import { dispatchNotificationSchema } from "@/lib/validations/notification-dispatch";
import type { EmailDeliveryStatus } from "@/types/notification";

// In-memory sliding window rate limiter: max 20 dispatch calls per user per minute
const rateLimitMap = new Map<string, number[]>();
function checkRateLimit(uid: string, limit = 20, windowMs = 60_000): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(uid) || [];
  const recent = timestamps.filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    return false;
  }
  recent.push(now);
  rateLimitMap.set(uid, recent);
  return true;
}

export async function POST(req: NextRequest) {
  try {
    // -------------------------------------------------------------
    // 1. Authenticate the caller via Firebase Admin ID Token
    // -------------------------------------------------------------
    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized: Missing or invalid Authorization header" },
        { status: 401 }
      );
    }

    const idToken = authHeader.slice(7).trim();
    const adminAuth = getServerAuth();
    if (!adminAuth) {
      console.warn("[Dispatch] Server Firebase Auth not configured");
      return NextResponse.json(
        { error: "Server authentication service unavailable" },
        { status: 503 }
      );
    }

    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (tokenErr) {
      console.warn("[Dispatch] ID Token verification failed:", (tokenErr as Error)?.message);
      return NextResponse.json(
        { error: "Unauthorized: Invalid or expired token" },
        { status: 401 }
      );
    }

    const callerUid = decodedToken.uid;
    const isAdmin = Boolean(
      decodedToken.admin === true ||
      decodedToken.role === "ADMIN" ||
      decodedToken.role === "admin"
    );

    // Rate Limiting Check
    if (!checkRateLimit(callerUid)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait a moment before sending more notifications." },
        { status: 429 }
      );
    }

    // -------------------------------------------------------------
    // 2. Validate Request Payload Schema with Zod
    // -------------------------------------------------------------
    const body = await req.json().catch(() => null);
    const parsed = dispatchNotificationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { event, contactRequestId, bloodRequestId } = parsed.data;

    const db = getServerFirestore();
    if (!db) {
      console.warn("[Dispatch] Server Firestore not configured");
      return NextResponse.json({
        success: true,
        skipped: true,
        message: "Firestore not configured on server",
      });
    }

    // -------------------------------------------------------------
    // Case 1: Contact Request Notifications
    // -------------------------------------------------------------
    if (contactRequestId) {
      const contactSnap = await db.collection("donorContactRequests").doc(contactRequestId).get();

      if (!contactSnap.exists) {
        return NextResponse.json(
          { error: "Referenced contact request not found" },
          { status: 404 }
        );
      }

      const contactData = contactSnap.data() || {};
      const donorId = String(contactData.donorId || "");
      const requesterId = String(contactData.requesterId || "");
      const donorName = String(contactData.donorName || "Donor");
      const requesterName = String(contactData.requesterName || "Requester");
      const requesterPhone = String(
        contactData.requesterPhone ||
        contactData.contactNumber ||
        contactData.phone ||
        ""
      ).trim();
      const donorBloodGroup = String(contactData.donorBloodGroup || "O+");
      const urgency = String(contactData.urgency || "normal");
      const hospitalName = contactData.hospitalName ? String(contactData.hospitalName) : undefined;

      // Ownership authorization check: Caller must be a participant or an admin
      const isParticipant = callerUid === requesterId || callerUid === donorId;
      if (!isParticipant && !isAdmin) {
        return NextResponse.json(
          { error: "Forbidden: You are not authorized to trigger notifications for this contact request" },
          { status: 403 }
        );
      }

      // Role-to-event alignment
      if (
        (event === "CONTACT_REQUEST_RECEIVED" || event === "CONTACT_REQUEST_CANCELLED") &&
        callerUid !== requesterId &&
        !isAdmin
      ) {
        return NextResponse.json(
          { error: "Forbidden: Only the requester can dispatch this contact event" },
          { status: 403 }
        );
      }

      if (
        (event === "CONTACT_REQUEST_ACCEPTED" ||
          event === "CONTACT_REQUEST_DECLINED" ||
          event === "CONTACT_INFO_SHARED" ||
          event === "CONTACT_REQUEST_COMPLETED") &&
        callerUid !== donorId &&
        !isAdmin
      ) {
        return NextResponse.json(
          { error: "Forbidden: Only the donor can dispatch this response event" },
          { status: 403 }
        );
      }

      let recipientId = "";
      let senderId: string | undefined = undefined;
      let titleBn = "";
      let titleEn = "";
      let messageBn = "";
      let messageEn = "";
      const actionUrl = "/account/contact-requests";
      let shouldSendEmail = false;
      let emailSubject = "";
      let emailHtml = "";
      let emailText = "";

      switch (event) {
        case "CONTACT_REQUEST_RECEIVED": {
          recipientId = donorId;
          senderId = requesterId;
          titleBn = "নতুন সরাসরি যোগাযোগের অনুরোধ";
          titleEn = "New Private Contact Request";
          messageBn = `${requesterName} জরুরি রক্তদানের উদ্দেশ্যে আপনার সাথে যোগাযোগের অনুরোধ জানিয়েছেন (${donorBloodGroup})।`;
          messageEn = `${requesterName} requested to contact you for ${donorBloodGroup} blood donation.`;
          shouldSendEmail = true;

          const emailTemplate = buildContactRequestReceivedEmail({
            donorName,
            requesterName,
            donorBloodGroup,
            urgency,
            hospitalName,
            requesterPhone,
            actionUrl,
          });
          emailSubject = emailTemplate.subject;
          emailHtml = emailTemplate.html;
          emailText = emailTemplate.text;
          break;
        }

        case "CONTACT_REQUEST_ACCEPTED": {
          recipientId = requesterId;
          senderId = donorId;
          titleBn = "যোগাযোগের অনুরোধ গৃহীত হয়েছে";
          titleEn = "Contact Request Accepted";
          messageBn = `রক্তদাতা ${donorName} (${donorBloodGroup}) আপনার যোগাযোগের অনুরোধ গ্রহণ করেছেন।`;
          messageEn = `Donor ${donorName} (${donorBloodGroup}) has accepted your contact request.`;
          shouldSendEmail = true;

          const emailTemplate = buildContactRequestAcceptedEmail({
            requesterName,
            donorName,
            donorBloodGroup,
            actionUrl,
          });
          emailSubject = emailTemplate.subject;
          emailHtml = emailTemplate.html;
          emailText = emailTemplate.text;
          break;
        }

        case "CONTACT_INFO_SHARED": {
          recipientId = requesterId;
          senderId = donorId;
          titleBn = "রক্তদাতার যোগাযোগের নম্বর প্রকাশিত হয়েছে";
          titleEn = "Donor Shared Contact Details";
          messageBn = `রক্তদাতা ${donorName} সরাসরি কথা বলার সম্মতি দিয়েছেন। ড্যাশবোর্ডে যোগাযোগের বিবরণ দেখতে পাবেন।`;
          messageEn = `Donor ${donorName} consented to direct calling. The phone number is now visible in your dashboard.`;
          shouldSendEmail = true;

          const sharedDetails = (contactData.sharedContactDetails || {}) as { phoneNumber?: string };
          const donorPhone = sharedDetails.phoneNumber ? String(sharedDetails.phoneNumber).trim() : undefined;

          const emailTemplate = buildContactInfoSharedEmail({
            requesterName,
            donorName,
            donorPhone,
            actionUrl,
          });
          emailSubject = emailTemplate.subject;
          emailHtml = emailTemplate.html;
          emailText = emailTemplate.text;
          break;
        }

        case "CONTACT_REQUEST_DECLINED": {
          recipientId = requesterId;
          senderId = donorId;
          titleBn = "যোগাযোগের অনুরোধ গৃহীত হয়নি";
          titleEn = "Contact Request Declined";
          messageBn = `রক্তদাতা ${donorName} বর্তমানে এই অনুরোধটি গ্রহণ করতে অপারগ। অন্য রক্তদাতাদের সন্ধান করুন।`;
          messageEn = `Donor ${donorName} is currently unable to accept this request. Please search for other matching donors.`;
          shouldSendEmail = false;
          break;
        }

        case "CONTACT_REQUEST_CANCELLED": {
          recipientId = donorId;
          senderId = requesterId;
          titleBn = "যোগাযোগের অনুরোধ প্রত্যাহার করা হয়েছে";
          titleEn = "Contact Request Cancelled";
          messageBn = `${requesterName} তাদের যোগাযোগের অনুরোধ প্রত্যাহার করেছেন।`;
          messageEn = `${requesterName} cancelled their pending contact request.`;
          shouldSendEmail = false;
          break;
        }

        default:
          return NextResponse.json({ skipped: true, message: "Unhandled contact event" });
      }

      // Check recipient's email & notification preferences
      let emailStatus: EmailDeliveryStatus = shouldSendEmail ? "PENDING" : "NOT_APPLICABLE";
      let emailError: string | null = null;
      let emailSentAt: string | null = null;

      if (shouldSendEmail && recipientId) {
        let recipientEmail: string | undefined = undefined;
        let emailNotificationsEnabled = true;

        const recipientUserDoc = await db.collection("users").doc(recipientId).get();
        if (recipientUserDoc.exists) {
          const udata = recipientUserDoc.data() || {};
          recipientEmail = udata.email as string | undefined;
          emailNotificationsEnabled = udata.emailNotificationsEnabled !== false;
        }

        // Check Firebase Auth as fallback if not in users document
        if (!recipientEmail || !recipientEmail.includes("@")) {
          try {
            const authRecord = await adminAuth.getUser(recipientId);
            if (authRecord && authRecord.email) {
              recipientEmail = authRecord.email;
            }
          } catch (authErr) {
            console.warn(`[Dispatch] Auth fetch error for user ${recipientId}:`, authErr);
          }
        }

        if (!emailNotificationsEnabled) {
          emailStatus = "SKIPPED_PREFERENCE";
        } else if (recipientEmail && recipientEmail.includes("@")) {
          try {
            const emailResult = await sendTransactionalEmail({
              to: recipientEmail,
              subject: emailSubject,
              html: emailHtml,
              text: emailText,
            });

            if (emailResult.success) {
              emailStatus = "ACCEPTED_BY_PROVIDER";
              emailSentAt = new Date().toISOString();
            } else {
              emailStatus = "FAILED";
              emailError = emailResult.error || "Email delivery failed";
            }
          } catch (err: unknown) {
            emailStatus = "FAILED";
            emailError = (err as Error)?.message || "Email dispatch exception";
          }
        } else {
          emailStatus = "FAILED";
          emailError = "Recipient has no valid email address";
        }
      }

      // Dispatch Web Push Notification safely
      if (recipientId) {
        sendPushNotification({
          recipientUserIds: [recipientId],
          title: titleBn,
          body: messageBn,
          url: actionUrl,
          tag: `contact-${contactRequestId}`,
        }).catch((err) => {
          console.warn("[Dispatch] Push notification error:", err);
        });
      }

      // Create / upsert in-app notification doc with deterministic ID
      const notifId = `notif_${event.toLowerCase().replace(/_/g, "-")}_${contactRequestId}`;
      const notifDocRef = db.collection("notifications").doc(notifId);

      await notifDocRef.set(
        {
          recipientId,
          senderId: senderId || null,
          type: event,
          title: { bn: titleBn, en: titleEn },
          message: { bn: messageBn, en: messageEn },
          relatedContactRequestId: contactRequestId,
          actionUrl,
          read: false,
          readAt: null,
          emailStatus,
          emailSentAt,
          emailError,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      return NextResponse.json({
        success: true,
        notificationId: notifId,
        emailStatus,
      });
    }

    // -------------------------------------------------------------
    // Case 2: Blood Request Notifications & Matching Donor Broadcast
    // -------------------------------------------------------------
    if (bloodRequestId) {
      const bloodSnap = await db.collection("bloodRequests").doc(bloodRequestId).get();

      if (!bloodSnap.exists) {
        return NextResponse.json(
          { error: "Referenced blood request not found" },
          { status: 404 }
        );
      }

      const bloodData = bloodSnap.data() || {};
      const requesterId = String(bloodData.requesterId || "");
      const bloodGroup = String(bloodData.bloodGroup || "");
      const unitsNeeded = Number(bloodData.unitsNeeded || 1);
      const districtId = String(bloodData.districtId || "");
      const divisionId = String(bloodData.divisionId || "");
      const hospitalName = bloodData.hospitalName ? String(bloodData.hospitalName) : undefined;
      const urgency = String(bloodData.urgency || "urgent");
      const scope = String(bloodData.scope || "LOCAL");
      const isGlobal = scope === "GLOBAL";
      const requesterName = String(bloodData.requesterName || "Requester").trim();
      const contactPhone = String(
        bloodData.contactNumber ||
        bloodData.contactPhone ||
        bloodData.requesterPhone ||
        bloodData.phone ||
        ""
      ).trim();

      // Ownership authorization check: Caller must be the requester or an admin
      if (callerUid !== requesterId && !isAdmin) {
        return NextResponse.json(
          { error: "Forbidden: Only the blood request creator or admin can dispatch notifications" },
          { status: 403 }
        );
      }

      const districtObj = districtId ? getDistrictById(districtId) : undefined;
      const divisionObj = divisionId ? getDivisionById(divisionId) : undefined;
      const locationText = districtObj
        ? `${districtObj.nameBn}, ${divisionObj?.nameBn || ""}`
        : "বাংলাদেশ";

      // Self-notification for requester on status events (fulfilled / cancelled)
      if (event === "BLOOD_REQUEST_FULFILLED" || event === "BLOOD_REQUEST_CANCELLED") {
        const isFulfilled = event === "BLOOD_REQUEST_FULFILLED";
        const titleBn = isFulfilled ? "রক্তের অনুরোধ সম্পন্ন হয়েছে" : "রক্তের অনুরোধ বাতিল করা হয়েছে";
        const titleEn = isFulfilled ? "Blood Request Marked as Fulfilled" : "Blood Request Cancelled";
        const messageBn = isFulfilled
          ? `${bloodGroup} গ্রুপের রক্তের অনুরোধটি সম্পন্ন হিসেবে চিহ্নিত করা হয়েছে।`
          : `${bloodGroup} গ্রুপের রক্তের অনুরোধটি বাতিল করা হয়েছে।`;
        const messageEn = isFulfilled
          ? `Your blood request for group ${bloodGroup} has been fulfilled.`
          : `Your blood request for group ${bloodGroup} has been cancelled.`;

        const notifId = `notif_${event.toLowerCase().replace(/_/g, "-")}_${bloodRequestId}`;
        const actionUrl = `/blood-request/${bloodRequestId}`;

        await db.collection("notifications").doc(notifId).set(
          {
            recipientId: requesterId,
            type: event,
            title: { bn: titleBn, en: titleEn },
            message: { bn: messageBn, en: messageEn },
            relatedRequestId: bloodRequestId,
            actionUrl,
            read: false,
            readAt: null,
            emailStatus: "NOT_APPLICABLE",
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

        // Transactional email to requester:
        // Only send email when fulfilled. If the user cancels their request, do not send email.
        if (isFulfilled) {
          const requesterUserSnap = await db.collection("users").doc(requesterId).get();
          if (requesterUserSnap.exists) {
            const reqEmail = requesterUserSnap.data()?.email as string | undefined;
            if (reqEmail && reqEmail.includes("@")) {
              const emailTpl = buildBloodRequestStatusEmail({
                requesterName: String(bloodData.requesterName || "Requester"),
                bloodGroup,
                status: "fulfilled",
                actionUrl,
              });
              sendTransactionalEmail({
                to: reqEmail,
                subject: emailTpl.subject,
                html: emailTpl.html,
                text: emailTpl.text,
              }).catch(() => {});
            }
          }
        }

        // Push notification to requester
        sendPushNotification({
          recipientUserIds: [requesterId],
          title: titleBn,
          body: messageBn,
          url: actionUrl,
          tag: `request-status-${bloodRequestId}`,
        }).catch(() => {});

        return NextResponse.json({
          success: true,
          notificationId: notifId,
        });
      }

      // Event: BLOOD_REQUEST_CREATED
      if (event === "BLOOD_REQUEST_CREATED") {
        // 1. Create confirmation notification for requester
        const requesterNotifId = `notif_blood_request_created_${bloodRequestId}`;
        await db.collection("notifications").doc(requesterNotifId).set(
          {
            recipientId: requesterId,
            type: "BLOOD_REQUEST_CREATED",
            title: {
              bn: "রক্তের অনুরোধ সফলভাবে প্রচারিত হয়েছে",
              en: "Blood Request Broadcasted Successfully",
            },
            message: {
              bn: `${bloodGroup} গ্রুপের রক্তের অনুরোধ সফলভাবে তৈরি হয়েছে এবং রক্তদাতাদের জন্য দৃশ্যমান।`,
              en: `Your blood request for group ${bloodGroup} is now live and searchable by voluntary donors.`,
            },
            relatedRequestId: bloodRequestId,
            actionUrl: `/blood-request/${bloodRequestId}`,
            read: false,
            readAt: null,
            emailStatus: "NOT_APPLICABLE",
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

        // Send confirmation email to the blood requester
        const actionUrl = `/blood-request/${bloodRequestId}`;
        try {
          const requesterSnap = await db.collection("users").doc(requesterId).get();
          let requesterEmail = requesterSnap.exists
            ? (requesterSnap.data()?.email as string | undefined)
            : undefined;
          if (!requesterEmail || !requesterEmail.includes("@")) {
            const authRecord = await adminAuth.getUser(requesterId).catch(() => null);
            if (authRecord?.email) requesterEmail = authRecord.email;
          }

          if (requesterEmail && requesterEmail.includes("@")) {
            const reqTpl = buildBloodRequestRequesterConfirmationEmail({
              requesterName,
              bloodGroup,
              unitsNeeded,
              hospitalName,
              locationText,
              urgency,
              contactPhone,
              actionUrl,
            });
            sendTransactionalEmail({
              to: requesterEmail,
              subject: reqTpl.subject,
              html: reqTpl.html,
              text: reqTpl.text,
            }).catch((err) =>
              console.warn("[Dispatch] Requester confirmation email error:", err)
            );
          }
        } catch (reqEmailErr) {
          console.warn("[Dispatch] Error preparing requester confirmation email:", reqEmailErr);
        }

        // 2. Identify eligible matching voluntary donors
        // Match Criteria: exact bloodGroup AND matching zila (districtId).
        // Regardless of broadcast scope (GLOBAL or LOCAL), donor alert emails are dispatched
        // to voluntary donors when both their blood group and zila (district) match the patient requisition.
        const reqBloodGroup =
          normalizeBloodGroup(bloodGroup) || String(bloodGroup || "").trim().toUpperCase();
        const reqDistrictId = String(districtId || "").trim().toLowerCase();

        const matchingDonorsSnap = await db
          .collection("publicDonorProfiles")
          .where("bloodGroup", "==", reqBloodGroup)
          .limit(100)
          .get();

        const matchingDonorIds: string[] = [];
        const matchingDonorsData: Array<{ id: string; displayName: string }> = [];

        matchingDonorsSnap.forEach((docSnap) => {
          const donorId = docSnap.id;
          const dData = docSnap.data();

          const donorBloodGroup =
            normalizeBloodGroup(dData.bloodGroup) ||
            String(dData.bloodGroup || "").trim().toUpperCase();
          const donorDistrictId = String(dData.districtId || "").trim().toLowerCase();

          const isAvailable = dData.availabilityStatus !== "unavailable";
          const notSuspended = dData.isSuspended !== true;

          // 1. Blood group match
          const matchesBlood = donorBloodGroup === reqBloodGroup;

          // 2. Zila (district) match: Donor's zila MUST strictly match the request's zila
          const matchesDistrict = Boolean(reqDistrictId && donorDistrictId === reqDistrictId);

          // Exclude requester in production; allow self in development/testing for single-account tests
          const isSelf = donorId === requesterId;
          const skipSelf = isSelf && process.env.NODE_ENV === "production";

          if (notSuspended && isAvailable && matchesBlood && matchesDistrict && !skipSelf) {
            matchingDonorIds.push(donorId);
            matchingDonorsData.push({
              id: donorId,
              displayName: String(dData.displayName || "স্বেচ্ছাসেবী রক্তদাতা"),
            });
          }
        });

        console.info(
          `[Dispatch:BloodRequest] Request ${bloodRequestId} (Blood: ${reqBloodGroup}, Zila: ${reqDistrictId}, Scope: ${scope}): found ${matchingDonorsData.length} eligible matching donor(s).`
        );

        // 3. Batch write in-app notifications to matching donors
        const batch = db.batch();
        const titleBn = isGlobal
          ? `জরুরি ${bloodGroup} রক্ত প্রয়োজন [সারাদেশব্যাপী]`
          : `জরুরি ${bloodGroup} রক্ত প্রয়োজন`;
        const titleEn = isGlobal
          ? `Urgent ${bloodGroup} Blood Needed [Nationwide]`
          : `Urgent ${bloodGroup} Blood Needed`;
        const messageBn = `${hospitalName ? `${hospitalName}, ` : ""}${locationText}-এ ${unitsNeeded} ব্যাগ ${bloodGroup} রক্ত প্রয়োজন।`;
        const messageEn = `${unitsNeeded} unit(s) of ${bloodGroup} needed at ${hospitalName || locationText}.`;

        for (const donor of matchingDonorsData) {
          const notifId = `notif_blood_req_${bloodRequestId}_${donor.id}`;
          const ref = db.collection("notifications").doc(notifId);
          batch.set(
            ref,
            {
              recipientId: donor.id,
              senderId: requesterId,
              type: "BLOOD_REQUEST_MATCH",
              title: { bn: titleBn, en: titleEn },
              message: { bn: messageBn, en: messageEn },
              relatedRequestId: bloodRequestId,
              actionUrl,
              read: false,
              readAt: null,
              emailStatus: "PENDING",
              createdAt: FieldValue.serverTimestamp(),
              updatedAt: FieldValue.serverTimestamp(),
            },
            { merge: true }
          );
        }

        await batch.commit();

        // 4. Send Transactional Emails with Dedup & Status Verification
        // Send to at most 30 donors to protect provider quotas and prevent timeouts
        const emailDonors = matchingDonorsData.slice(0, 30);
        for (const donor of emailDonors) {
          try {
            const notifId = `notif_blood_req_${bloodRequestId}_${donor.id}`;
            const existingNotifSnap = await db.collection("notifications").doc(notifId).get();
            const existingStatus = existingNotifSnap.data()?.emailStatus;

            // Idempotency: skip if already successfully sent or accepted
            if (existingStatus === "ACCEPTED_BY_PROVIDER" || existingStatus === "SENT") {
              continue;
            }

            let email: string | undefined = undefined;
            let emailEnabled = true;

            const userSnap = await db.collection("users").doc(donor.id).get();
            if (userSnap.exists) {
              const uData = userSnap.data() || {};
              email = uData.email as string | undefined;
              emailEnabled = uData.emailNotificationsEnabled !== false;
            }

            if (!email || !email.includes("@")) {
              const authRecord = await adminAuth.getUser(donor.id).catch(() => null);
              if (authRecord?.email) {
                email = authRecord.email;
              }
            }

            if (!emailEnabled) {
              await db.collection("notifications").doc(notifId).update({
                emailStatus: "SKIPPED_PREFERENCE",
                updatedAt: FieldValue.serverTimestamp(),
              }).catch(() => {});
              continue;
            }

            if (email && email.includes("@")) {
              const emailTpl = buildBloodRequestCreatedEmail({
                donorName: donor.displayName,
                bloodGroup,
                unitsNeeded,
                hospitalName,
                locationText,
                urgency,
                isGlobal,
                requesterName,
                contactPhone,
                actionUrl,
              });

              const emailResult = await sendTransactionalEmail({
                to: email,
                subject: emailTpl.subject,
                html: emailTpl.html,
                text: emailTpl.text,
              });

                if (emailResult.success) {
                  console.info(
                    `[Dispatch:BloodRequest] Successfully sent email to donor ${donor.id} (${email}): id=${emailResult.messageId}`
                  );
                  await db.collection("notifications").doc(notifId).update({
                    emailStatus: "ACCEPTED_BY_PROVIDER",
                    emailSentAt: new Date().toISOString(),
                    emailError: null,
                    updatedAt: FieldValue.serverTimestamp(),
                  }).catch(() => {});
                } else {
                  console.warn(
                    `[Dispatch:BloodRequest] Email sending failed for donor ${donor.id} (${email}):`,
                    emailResult.error
                  );
                  await db.collection("notifications").doc(notifId).update({
                    emailStatus: "FAILED",
                    emailError: emailResult.error || "Email delivery failed",
                    updatedAt: FieldValue.serverTimestamp(),
                  }).catch(() => {});
                }
              }
            } catch (emailErr) {
            console.warn(`[Dispatch] Email delivery error for donor ${donor.id}:`, emailErr);
          }
        }

        // 5. Send FCM Web Push Notifications
        if (matchingDonorIds.length > 0) {
          sendPushNotification({
            recipientUserIds: matchingDonorIds,
            title: titleBn,
            body: messageBn,
            url: actionUrl,
            tag: `blood-request-${bloodRequestId}`,
            data: {
              bloodRequestId,
              bloodGroup,
              urgency,
            },
          }).catch((pushErr) => {
            console.warn("[Dispatch] Push error for matching donors:", pushErr);
          });
        }

        // 6. Record Audit State in broadcastJobs
        await db.collection("broadcastJobs").doc(bloodRequestId).set(
          {
            bloodRequestId,
            requesterId,
            bloodGroup,
            isGlobal,
            matchedDonorsCount: matchingDonorIds.length,
            status: "COMPLETED",
            executedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        ).catch(() => {});

        return NextResponse.json({
          success: true,
          requesterNotificationId: requesterNotifId,
          matchedDonorsNotified: matchingDonorIds.length,
          isGlobal,
        });
      }

      return NextResponse.json({ skipped: true, message: `Unhandled event: ${event}` });
    }

    return NextResponse.json(
      { error: "Either contactRequestId or bloodRequestId is required" },
      { status: 400 }
    );
  } catch (error: unknown) {
    console.error("Error in /api/notifications/dispatch:", error);
    return NextResponse.json(
      { success: false, error: (error as Error)?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
