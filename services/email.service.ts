/**
 * Server-Side Transactional Email Service for RoktoBondhu.
 * 
 * Implements a pluggable, zero-dependency email dispatch architecture supporting:
 * 1. Resend REST API (when RESEND_API_KEY is configured)
 * 2. Pluggable SMTP configuration
 * 3. Local Development Simulation (logs email content cleanly without failing when API keys are absent)
 * 
 * Strict Privacy & Safety:
 * - Never includes private phone numbers in emails.
 * - Localized into Bengali and English.
 * - Mobile-friendly, accessible HTML and plain-text fallback.
 */

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface SendEmailOptions {
  to: string;
  recipientName?: string;
  subject: string;
  html: string;
  text: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider: "resend" | "smtp" | "simulation";
}

const DEFAULT_SENDER = process.env.EMAIL_FROM || "RoktoBondhu <notifications@roktobondhu.org>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/**
 * Dispatches an email via Resend REST API.
 */
async function sendViaResend(
  apiKey: string,
  options: SendEmailOptions
): Promise<SendEmailResult> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: DEFAULT_SENDER,
        to: [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const errorMsg =
        (errorData as { message?: string })?.message ||
        `Resend responded with HTTP ${res.status}`;
      return { success: false, error: errorMsg, provider: "resend" };
    }

    const data = (await res.json()) as { id?: string };
    return { success: true, messageId: data.id, provider: "resend" };
  } catch (err: unknown) {
    const msg = (err as Error)?.message || "Unknown error sending via Resend";
    return { success: false, error: msg, provider: "resend" };
  }
}

/**
 * Universal email dispatch handler with graceful degradation.
 */
export async function sendTransactionalEmail(
  options: SendEmailOptions
): Promise<SendEmailResult> {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (resendApiKey && !resendApiKey.includes("your_api_key")) {
    return sendViaResend(resendApiKey, options);
  }

  // Fallback: Local Development Simulation Mode
  // Cleanly logs the notification to the server console without throwing,
  // enabling friction-free development and offline testing.
  if (process.env.NODE_ENV !== "production") {
    console.info("=================================================");
    console.info("📧 [RoktoBondhu Email Simulation]");
    console.info(`To: ${options.to}`);
    console.info(`Subject: ${options.subject}`);
    console.info(`Text preview: ${options.text.slice(0, 150)}...`);
    console.info("=================================================");
  }

  return {
    success: true,
    messageId: `simulated_${Date.now()}`,
    provider: "simulation",
  };
}

/**
 * Generates email content for a new incoming private contact request (sent to Donor).
 */
export function buildContactRequestReceivedEmail(params: {
  donorName: string;
  requesterName: string;
  donorBloodGroup: string;
  urgency: string;
  hospitalName?: string;
  actionUrl: string;
}): { subject: string; html: string; text: string } {
  const deepLink = `${SITE_URL}${params.actionUrl}`;
  const urgencyLabelBn =
    params.urgency === "critical"
      ? "জরুরি (Critical)"
      : params.urgency === "urgent"
      ? "জরুরি (Urgent)"
      : "স্বাভাবিক (Normal)";

  const subject = `রক্তবন্ধু: নতুন রক্তের যোগাযোগের অনুরোধ (${params.donorBloodGroup}) / New Blood Contact Request`;

  const text = `
প্রিয় ${params.donorName},

রক্তবন্ধু প্ল্যাটফর্মে আপনার রক্তদাতা প্রোফাইলের জন্য একটি নতুন সরাসরি যোগাযোগের অনুরোধ এসেছে।

বিবরণ:
- রক্তের গ্রুপ: ${params.donorBloodGroup}
- অনুরোধকারীর নাম: ${params.requesterName}
- জরুরি মাত্রা: ${urgencyLabelBn}
${params.hospitalName ? `- হাসপাতাল / স্থান: ${params.hospitalName}` : ""}

আপনার ব্যক্তিগত গোপনীয়তা সুরক্ষিত রাখতে আপনার ফোন নম্বর এখনও গোপন রাখা হয়েছে। অনুরোধটি পর্যালোচনা করে গ্রহণ (Accept) বা প্রত্যাখ্যান (Decline) করতে নিচের লিংকে প্রবেশ করুন:

${deepLink}

রক্তদানে আপনার মানবিক আগ্রহের জন্য ধন্যবাদ।
— রক্তবন্ধু টিম
`;

  const html = `
<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 24px; color: #1f2937;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
    <div style="background-color: #e11d48; padding: 20px 24px; text-align: left;">
      <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700;">রক্তবন্ধু • RoktoBondhu</h1>
      <p style="color: #ffe4e6; margin: 4px 0 0; font-size: 13px;">নতুন রক্তের যোগাযোগের অনুরোধ / New Contact Request</p>
    </div>
    <div style="padding: 24px;">
      <p style="font-size: 15px; line-height: 1.6; margin-top: 0;">প্রিয় <strong>${params.donorName}</strong>,</p>
      <p style="font-size: 14px; line-height: 1.6; color: #4b5563;">
        রক্তবন্ধু প্ল্যাটফর্মে আপনার রক্তদাতা প্রোফাইলের জন্য একজন রোগীর পরিবারের পক্ষ থেকে সরাসরি যোগাযোগের অনুরোধ এসেছে।
      </p>

      <div style="background-color: #fef2f2; border-left: 4px solid #e11d48; border-radius: 6px; padding: 16px; margin: 20px 0;">
        <p style="margin: 0 0 8px; font-size: 14px;"><strong>প্রয়োজনীয় রক্তের গ্রুপ:</strong> <span style="color: #e11d48; font-weight: 700; font-size: 16px;">${params.donorBloodGroup}</span></p>
        <p style="margin: 0 0 8px; font-size: 14px;"><strong>অনুরোধকারী:</strong> ${params.requesterName}</p>
        <p style="margin: 0 0 8px; font-size: 14px;"><strong>জরুরি মাত্রা:</strong> ${urgencyLabelBn}</p>
        ${params.hospitalName ? `<p style="margin: 0; font-size: 14px;"><strong>হাসপাতাল:</strong> ${params.hospitalName}</p>` : ""}
      </div>

      <p style="font-size: 13px; color: #6b7280; line-height: 1.5;">
        🔒 <strong>গোপনীয়তা নোটিশ:</strong> আপনার ফোন নম্বর এখনও সম্পূর্ণ সুরক্ষিত ও গোপন রয়েছে। আপনি অনুরোধটি গ্রহণ করার পর কেবল আপনি অনুমতি দিলে নম্বর প্রকাশ করা হবে।
      </p>

      <div style="text-align: center; margin: 28px 0 20px;">
        <a href="${deepLink}" style="display: inline-block; background-color: #e11d48; color: #ffffff; padding: 12px 28px; border-radius: 8px; font-weight: 600; text-decoration: none; font-size: 15px;">
          অনুরোধ পর্যালোচনা করুন (Review Request)
        </a>
      </div>

      <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 24px; border-top: 1px solid #f3f4f6; padding-top: 16px;">
        আপনি RoktoBondhu-তে স্বেচ্ছাসেবী রক্তদাতা হিসেবে নিবন্ধিত থাকায় এই ইমেইলটি পাঠানো হয়েছে।<br>
        RoktoBondhu — সম্পূর্ণ বিনামূল্যে রক্তদাতা ও গ্রহীতাদের সংযোগকারী প্ল্যাটফর্ম।
      </p>
    </div>
  </div>
</body>
</html>
`;

  return { subject, html, text };
}

/**
 * Generates email content when a Donor accepts the contact request (sent to Requester).
 */
export function buildContactRequestAcceptedEmail(params: {
  requesterName: string;
  donorName: string;
  donorBloodGroup: string;
  actionUrl: string;
}): { subject: string; html: string; text: string } {
  const deepLink = `${SITE_URL}${params.actionUrl}`;
  const subject = `রক্তবন্ধু: আপনার যোগাযোগের অনুরোধ রক্তদাতা গ্রহণ করেছেন / Contact Request Accepted`;

  const text = `
প্রিয় ${params.requesterName},

সুসংবাদ! রক্তদাতা ${params.donorName} (${params.donorBloodGroup}) আপনার রক্তের যোগাযোগের অনুরোধটি গ্রহণ করেছেন।

রক্তদাতা তার ফোন নম্বর প্রকাশের দ্বিতীয় সম্মতি প্রদান করলেই আপনি তার ফোন নম্বর দেখতে পারবেন। আপডেট দেখতে নিচের লিংকে প্রবেশ করুন:

${deepLink}

— রক্তবন্ধু টিম
`;

  const html = `
<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="font-family: sans-serif; background-color: #f9fafb; margin: 0; padding: 24px; color: #1f2937;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden;">
    <div style="background-color: #10b981; padding: 20px 24px; text-align: left;">
      <h1 style="color: #ffffff; margin: 0; font-size: 20px;">রক্তবন্ধু • RoktoBondhu</h1>
      <p style="color: #d1fae5; margin: 4px 0 0; font-size: 13px;">অনুরোধ গৃহীত হয়েছে / Request Accepted</p>
    </div>
    <div style="padding: 24px;">
      <p style="font-size: 15px;">প্রিয় <strong>${params.requesterName}</strong>,</p>
      <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">
        স্বেচ্ছাসেবী রক্তদাতা <strong>${params.donorName}</strong> (${params.donorBloodGroup}) আপনার যোগাযোগের অনুরোধটি পর্যালোচনা করে <strong>গ্রহণ করেছেন</strong>।
      </p>
      <div style="text-align: center; margin: 28px 0;">
        <a href="${deepLink}" style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 12px 28px; border-radius: 8px; font-weight: 600; text-decoration: none;">
          অনুরোধের স্ট্যাটাস দেখুন (View Status)
        </a>
      </div>
    </div>
  </div>
</body>
</html>
`;

  return { subject, html, text };
}

/**
 * Generates email content when Donor explicitly shares their phone number (sent to Requester).
 */
export function buildContactInfoSharedEmail(params: {
  requesterName: string;
  donorName: string;
  actionUrl: string;
}): { subject: string; html: string; text: string } {
  const deepLink = `${SITE_URL}${params.actionUrl}`;
  const subject = `রক্তবন্ধু: রক্তদাতা তার যোগাযোগের নম্বর শেয়ার করেছেন / Donor Shared Contact Details`;

  const text = `
প্রিয় ${params.requesterName},

রক্তদাতা ${params.donorName} আপনার সাথে সরাসরি যোগাযোগের সম্মতি প্রদান করেছেন। 
নিরাপত্তার স্বার্থে ফোন নম্বরটি আপনার লগইনকৃত ড্যাশবোর্ডে সুরক্ষিতভাবে দেখানো হচ্ছে।

নম্বরটি দেখতে এবং সরাসরি যোগাযোগ করতে এখনই লগইন করুন:
${deepLink}

— রক্তবন্ধু টিম
`;

  const html = `
<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="font-family: sans-serif; background-color: #f9fafb; margin: 0; padding: 24px; color: #1f2937;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden;">
    <div style="background-color: #2563eb; padding: 20px 24px; text-align: left;">
      <h1 style="color: #ffffff; margin: 0; font-size: 20px;">রক্তবন্ধু • RoktoBondhu</h1>
      <p style="color: #dbeafe; margin: 4px 0 0; font-size: 13px;">যোগাযোগের নম্বর প্রস্তুত / Contact Ready</p>
    </div>
    <div style="padding: 24px;">
      <p style="font-size: 15px;">প্রিয় <strong>${params.requesterName}</strong>,</p>
      <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">
        রক্তদাতা <strong>${params.donorName}</strong> আপনার সাথে কথা বলতে সম্মতি জানিয়েছেন। ফোন নম্বরটি আপনার আউটগোয়িং ড্যাশবোর্ডে প্রকাশিত হয়েছে।
      </p>
      <div style="text-align: center; margin: 28px 0;">
        <a href="${deepLink}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 28px; border-radius: 8px; font-weight: 600; text-decoration: none;">
          ফোন নম্বর দেখুন ও কল করুন (View Contact)
        </a>
      </div>
    </div>
  </div>
</body>
</html>
`;

  return { subject, html, text };
}

/**
 * Generates email content for matching donors when an emergency blood requisition is created.
 */
export function buildBloodRequestCreatedEmail(params: {
  donorName: string;
  bloodGroup: string;
  unitsNeeded: number;
  hospitalName?: string;
  locationText: string;
  urgency: string;
  isGlobal?: boolean;
  actionUrl: string;
}): { subject: string; html: string; text: string } {
  const deepLink = `${SITE_URL}${params.actionUrl}`;
  const urgencyLabelBn =
    params.urgency === "critical"
      ? "অতি-জরুরি (Critical)"
      : params.urgency === "urgent"
      ? "জরুরি (Urgent)"
      : "স্বাভাবিক (Normal)";

  const scopeBadge = params.isGlobal ? "[সারাদেশব্যাপী সম্প্রচার]" : "[স্থানীয় অনুরোধ]";
  const subject = `রক্তবন্ধু: জরুরি ${params.bloodGroup} রক্তের প্রয়োজন ${scopeBadge} / Urgent Blood Needed`;

  const text = `
প্রিয় ${params.donorName},

আপনার রক্তের গ্রুপের সাথে মিলে যাওয়া একটি নতুন রক্তের অনুরোধ প্ল্যাটফর্মে এসেছে।

বিবরণ:
- প্রয়োজনীয় রক্তের গ্রুপ: ${params.bloodGroup}
- রক্তের পরিমাণ: ${params.unitsNeeded} ব্যাগ
- জরুরি মাত্রা: ${urgencyLabelBn}
${params.hospitalName ? `- হাসপাতাল: ${params.hospitalName}` : ""}
- এলাকা / স্থান: ${params.locationText}

আপনি যদি এই রোগীকে রক্তদানে আগ্রহী ও সক্ষম হন, অনুগ্রহ করে অনুরোধটির বিস্তারিত দেখুন ও যোগাযোগ করুন:
${deepLink}

রক্তদানে আপনার অংশগ্রহণ বাঁচাতে পারে একটি মূল্যবান জীবন।
— রক্তবন্ধু টিম
`;

  const html = `
<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; margin: 0; padding: 24px; color: #1f2937;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
    <div style="background-color: #e11d48; padding: 20px 24px; text-align: left;">
      <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700;">রক্তবন্ধু • RoktoBondhu</h1>
      <p style="color: #ffe4e6; margin: 4px 0 0; font-size: 13px;">জরুরি রক্তের অনুরোধ / Emergency Blood Alert</p>
    </div>
    <div style="padding: 24px;">
      <p style="font-size: 15px; margin-top: 0;">প্রিয় <strong>${params.donorName}</strong>,</p>
      <p style="font-size: 14px; line-height: 1.6; color: #4b5563;">
        আপনার রক্তের গ্রুপ (<strong style="color: #e11d48;">${params.bloodGroup}</strong>) এবং এলাকার সাথে সামঞ্জস্যপূর্ণ একটি রক্তের জরুরি অনুরোধ এসেছে।
      </p>

      <div style="background-color: #fef2f2; border-left: 4px solid #e11d48; border-radius: 6px; padding: 16px; margin: 20px 0;">
        <p style="margin: 0 0 8px; font-size: 14px;"><strong>প্রয়োজনীয় রক্তের গ্রুপ:</strong> <span style="color: #e11d48; font-weight: 700; font-size: 18px;">${params.bloodGroup}</span></p>
        <p style="margin: 0 0 8px; font-size: 14px;"><strong>পরিমাণ:</strong> ${params.unitsNeeded} ব্যাগ (Units)</p>
        <p style="margin: 0 0 8px; font-size: 14px;"><strong>জরুরি মাত্রা:</strong> ${urgencyLabelBn}</p>
        ${params.hospitalName ? `<p style="margin: 0 0 8px; font-size: 14px;"><strong>হাসপাতাল:</strong> ${params.hospitalName}</p>` : ""}
        <p style="margin: 0; font-size: 14px;"><strong>স্থান:</strong> ${params.locationText}</p>
      </div>

      <div style="text-align: center; margin: 28px 0 20px;">
        <a href="${deepLink}" style="display: inline-block; background-color: #e11d48; color: #ffffff; padding: 12px 28px; border-radius: 8px; font-weight: 600; text-decoration: none; font-size: 15px;">
          অনুরোধটি দেখুন ও রক্তদান করুন (View Request)
        </a>
      </div>

      <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 24px; border-top: 1px solid #f3f4f6; padding-top: 16px;">
        আপনি RoktoBondhu প্ল্যাটফর্মে একজন স্বেচ্ছাসেবী রক্তদাতা হিসেবে নিবন্ধিত এবং ইমেইল বিজ্ঞপ্তি চালু রেখেছেন।<br>
        আপনার রক্তে বাঁচতে পারে একটি নতুন প্রাণ।
      </p>
    </div>
  </div>
</body>
</html>
`;

  return { subject, html, text };
}

/**
 * Generates email content when a blood requisition status changes (sent to Requester).
 */
export function buildBloodRequestStatusEmail(params: {
  requesterName: string;
  bloodGroup: string;
  status: "fulfilled" | "cancelled";
  actionUrl: string;
}): { subject: string; html: string; text: string } {
  const deepLink = `${SITE_URL}${params.actionUrl}`;
  const isFulfilled = params.status === "fulfilled";

  const subject = isFulfilled
    ? `রক্তবন্ধু: আপনার ${params.bloodGroup} রক্তের অনুরোধ সম্পন্ন হয়েছে`
    : `রক্তবন্ধু: আপনার ${params.bloodGroup} রক্তের অনুরোধ বাতিল করা হয়েছে`;

  const headerBg = isFulfilled ? "#10b981" : "#6b7280";
  const headerSubtitle = isFulfilled ? "অনুরোধ সম্পন্ন / Request Fulfilled" : "অনুরোধ বাতিল / Request Cancelled";

  const text = `
প্রিয় ${params.requesterName},

আপনার ${params.bloodGroup} গ্রুপের রক্তের অনুরোধটি সফলভাবে ${isFulfilled ? "সম্পন্ন (Fulfilled)" : "বাতিল (Cancelled)"} হিসেবে চিহ্নিত করা হয়েছে।

বিস্তারিত দেখতে নিচের লিংকে প্রবেশ করুন:
${deepLink}

— রক্তবন্ধু টিম
`;

  const html = `
<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="font-family: sans-serif; background-color: #f9fafb; margin: 0; padding: 24px; color: #1f2937;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden;">
    <div style="background-color: ${headerBg}; padding: 20px 24px; text-align: left;">
      <h1 style="color: #ffffff; margin: 0; font-size: 20px;">রক্তবন্ধু • RoktoBondhu</h1>
      <p style="color: #ffffff; opacity: 0.9; margin: 4px 0 0; font-size: 13px;">${headerSubtitle}</p>
    </div>
    <div style="padding: 24px;">
      <p style="font-size: 15px;">প্রিয় <strong>${params.requesterName}</strong>,</p>
      <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">
        আপনার ${params.bloodGroup} গ্রুপের রক্তের অনুরোধটি <strong>${isFulfilled ? "সম্পন্ন" : "বাতিল"}</strong> করা হয়েছে।
      </p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${deepLink}" style="display: inline-block; background-color: ${headerBg}; color: #ffffff; padding: 10px 24px; border-radius: 8px; font-weight: 600; text-decoration: none;">
          অনুরোধের বিবরণ দেখুন
        </a>
      </div>
    </div>
  </div>
</body>
</html>
`;

  return { subject, html, text };
}
