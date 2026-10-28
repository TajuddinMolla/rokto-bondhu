import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

import { getServerFirestore } from "@/lib/firebase/server";
import {
  sendTransactionalEmail,
  buildContactRequestReceivedEmail,
  buildContactRequestAcceptedEmail,
  buildContactInfoSharedEmail,
} from "@/services/email.service";
import type { NotificationType, EmailDeliveryStatus } from "@/types/notification";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.event) {
      return NextResponse.json(
        { error: "Invalid payload: 'event' is required" },
        { status: 400 }
      );
    }

    const event = body.event as NotificationType;
    const contactRequestId = body.contactRequestId as string | undefined;
    const bloodRequestId = body.bloodRequestId as string | undefined;

    const db = getServerFirestore();
    if (!db) {
      console.warn("Server Firestore not configured, skipping notification dispatch");
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
      const contactDocRef = doc(db, "donorContactRequests", contactRequestId);
      const contactSnap = await getDoc(contactDocRef);

      if (!contactSnap.exists()) {
        return NextResponse.json(
          { error: "Referenced contact request not found" },
          { status: 404 }
        );
      }

      const contactData = contactSnap.data();
      const donorId = String(contactData.donorId || "");
      const requesterId = String(contactData.requesterId || "");
      const donorName = String(contactData.donorName || "Donor");
      const requesterName = String(contactData.requesterName || "Requester");
      const donorBloodGroup = String(contactData.donorBloodGroup || "O+");
      const urgency = String(contactData.urgency || "normal");
      const hospitalName = contactData.hospitalName ? String(contactData.hospitalName) : undefined;

      let recipientId = "";
      let senderId: string | undefined = undefined;
      let titleBn = "";
      let titleEn = "";
      let messageBn = "";
      let messageEn = "";
      let actionUrl = "/account/contact-requests";
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
          actionUrl = "/account/contact-requests";
          shouldSendEmail = true;

          const emailTemplate = buildContactRequestReceivedEmail({
            donorName,
            requesterName,
            donorBloodGroup,
            urgency,
            hospitalName,
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
          actionUrl = "/account/contact-requests";
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
          messageBn = `রক্তদাতা ${donorName} সরাসরি কথা বলার সম্মতি দিয়েছেন। ড্যাশবোর্ডে ফোন নম্বর দেখতে পাবেন।`;
          messageEn = `Donor ${donorName} consented to direct calling. The phone number is now visible in your dashboard.`;
          actionUrl = "/account/contact-requests";
          shouldSendEmail = true;

          const emailTemplate = buildContactInfoSharedEmail({
            requesterName,
            donorName,
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
          actionUrl = "/account/contact-requests";
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
          actionUrl = "/account/contact-requests";
          shouldSendEmail = false;
          break;
        }

        default:
          return NextResponse.json({ skipped: true, message: "Unhandled event" });
      }

      // Check recipient's email & notification preferences
      let emailStatus: EmailDeliveryStatus = shouldSendEmail ? "PENDING" : "NOT_APPLICABLE";
      let emailError: string | null = null;
      let emailSentAt: string | null = null;

      if (shouldSendEmail && recipientId) {
        const recipientUserDoc = await getDoc(doc(db, "users", recipientId));
        if (recipientUserDoc.exists()) {
          const udata = recipientUserDoc.data();
          const recipientEmail = udata.email as string | undefined;
          const emailNotificationsEnabled = udata.emailNotificationsEnabled !== false;

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
                emailStatus = "SENT";
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
      }

      // Create / upsert in-app notification doc with deterministic ID
      const notifId = `notif_${event.toLowerCase().replace(/_/g, "-")}_${contactRequestId}`;
      const notifDocRef = doc(db, "notifications", notifId);

      await setDoc(
        notifDocRef,
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
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
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
    // Case 2: Blood Request Notifications
    // -------------------------------------------------------------
    if (bloodRequestId) {
      const bloodDocRef = doc(db, "bloodRequests", bloodRequestId);
      const bloodSnap = await getDoc(bloodDocRef);

      if (!bloodSnap.exists()) {
        return NextResponse.json(
          { error: "Referenced blood request not found" },
          { status: 404 }
        );
      }

      const bloodData = bloodSnap.data();
      const requesterId = String(bloodData.requesterId || "");
      const bloodGroup = String(bloodData.bloodGroup || "");

      let titleBn = "";
      let titleEn = "";
      let messageBn = "";
      let messageEn = "";

      switch (event) {
        case "BLOOD_REQUEST_CREATED":
          titleBn = "রক্তের অনুরোধ সফলভাবে প্রচারিত হয়েছে";
          titleEn = "Blood Request Broadcasted Successfully";
          messageBn = `${bloodGroup} গ্রুপের রক্তের অনুরোধ সফলভাবে তৈরি হয়েছে এবং রক্তদাতাদের জন্য দৃশ্যমান।`;
          messageEn = `Your blood request for group ${bloodGroup} is now live and searchable by voluntary donors.`;
          break;
        case "BLOOD_REQUEST_FULFILLED":
          titleBn = "রক্তের অনুরোধ সম্পন্ন হয়েছে";
          titleEn = "Blood Request Marked as Fulfilled";
          messageBn = `${bloodGroup} গ্রুপের রক্তের অনুরোধটি সম্পন্ন হিসেবে চিহ্নিত করা হয়েছে।`;
          messageEn = `Your blood request for group ${bloodGroup} has been fulfilled.`;
          break;
        case "BLOOD_REQUEST_CANCELLED":
          titleBn = "রক্তের অনুরোধ বাতিল করা হয়েছে";
          titleEn = "Blood Request Cancelled";
          messageBn = `${bloodGroup} গ্রুপের রক্তের অনুরোধটি বাতিল করা হয়েছে।`;
          messageEn = `Your blood request for group ${bloodGroup} has been cancelled.`;
          break;
        default:
          return NextResponse.json({ skipped: true });
      }

      const notifId = `notif_${event.toLowerCase().replace(/_/g, "-")}_${bloodRequestId}`;
      const notifDocRef = doc(db, "notifications", notifId);

      await setDoc(
        notifDocRef,
        {
          recipientId: requesterId,
          type: event,
          title: { bn: titleBn, en: titleEn },
          message: { bn: messageBn, en: messageEn },
          relatedRequestId: bloodRequestId,
          actionUrl: `/blood-request/${bloodRequestId}`,
          read: false,
          readAt: null,
          emailStatus: "NOT_APPLICABLE",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      return NextResponse.json({
        success: true,
        notificationId: notifId,
        emailStatus: "NOT_APPLICABLE",
      });
    }

    return NextResponse.json(
      { error: "Either contactRequestId or bloodRequestId is required" },
      { status: 400 }
    );
  } catch (error: unknown) {
    console.error("Error in /api/notifications/dispatch:", error);
    // Never fail the caller catastrophically
    return NextResponse.json(
      { success: false, error: (error as Error)?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

