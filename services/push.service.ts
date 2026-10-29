import { getServerFirestore, getServerMessaging } from "@/lib/firebase/server";

export interface SendPushNotificationOptions {
  recipientUserIds: string[];
  title: string;
  body: string;
  url?: string;
  tag?: string;
  data?: Record<string, string>;
}

export interface PushDispatchResult {
  success: boolean;
  totalTokens: number;
  successCount: number;
  failureCount: number;
  skipped: boolean;
  error?: string;
}

interface StoredToken {
  token: string;
  docPath: string;
}

/**
 * Dispatches web push notifications to multiple recipients via Firebase Cloud Messaging.
 * Prunes expired or invalid registration tokens automatically.
 */
export async function sendPushNotification(
  options: SendPushNotificationOptions
): Promise<PushDispatchResult> {
  const { recipientUserIds, title, body, url = "/account/notifications", tag, data = {} } = options;

  if (!recipientUserIds || recipientUserIds.length === 0) {
    return {
      success: true,
      totalTokens: 0,
      successCount: 0,
      failureCount: 0,
      skipped: true,
    };
  }

  const messaging = getServerMessaging();
  const db = getServerFirestore();

  if (!messaging || !db) {
    console.info(
      `[RoktoBondhu Push Simulation] Push to ${recipientUserIds.length} user(s): "${title}" - "${body}" (url: ${url})`
    );
    return {
      success: true,
      totalTokens: 0,
      successCount: 0,
      failureCount: 0,
      skipped: true,
    };
  }

  try {
    // 1. Gather push tokens for all recipients
    const storedTokens: StoredToken[] = [];

    // Query tokens from users/{uid}/pushTokens subcollection in parallel chunks of 20
    const recipientChunks: string[][] = [];
    for (let i = 0; i < recipientUserIds.length; i += 20) {
      recipientChunks.push(recipientUserIds.slice(i, i + 20));
    }

    for (const chunk of recipientChunks) {
      await Promise.all(
        chunk.map(async (uid) => {
          if (!uid) return;
          try {
            const tokensSnap = await db.collection("users").doc(uid).collection("pushTokens").get();
            tokensSnap.forEach((docSnap) => {
              const t = docSnap.data().token;
              if (t && typeof t === "string") {
                storedTokens.push({
                  token: t,
                  docPath: docSnap.ref.path,
                });
              }
            });
          } catch (err) {
            console.warn(`[Push Service] Failed to retrieve tokens for user ${uid}:`, err);
          }
        })
      );
    }

    if (storedTokens.length === 0) {
      return {
        success: true,
        totalTokens: 0,
        successCount: 0,
        failureCount: 0,
        skipped: true,
      };
    }

    const uniqueTokensMap = new Map<string, string[]>(); // token -> array of docPaths
    for (const item of storedTokens) {
      const existing = uniqueTokensMap.get(item.token) || [];
      existing.push(item.docPath);
      uniqueTokensMap.set(item.token, existing);
    }

    const tokens = Array.from(uniqueTokensMap.keys());
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const absoluteUrl = url.startsWith("http") ? url : `${siteUrl}${url.startsWith("/") ? url : `/${url}`}`;

    // 2. Dispatch in batches of 500 (FCM limit)
    const batchSize = 500;
    let successCount = 0;
    let failureCount = 0;
    const tokensToDelete: string[] = [];

    for (let i = 0; i < tokens.length; i += batchSize) {
      const currentBatchTokens = tokens.slice(i, i + batchSize);

      const response = await messaging.sendEachForMulticast({
        tokens: currentBatchTokens,
        notification: {
          title,
          body,
        },
        data: {
          ...data,
          url: absoluteUrl,
          click_action: absoluteUrl,
        },
        webpush: {
          fcmOptions: {
            link: absoluteUrl,
          },
          notification: {
            icon: "/favicon.ico",
            badge: "/favicon.ico",
            tag: tag || "roktobondhu-alert",
          },
        },
      });

      successCount += response.successCount;
      failureCount += response.failureCount;

      // Identify dead / invalid tokens to prune
      response.responses.forEach((resp, index) => {
        if (!resp.success && resp.error) {
          const code = resp.error.code;
          if (
            code === "messaging/registration-token-not-registered" ||
            code === "messaging/invalid-registration-token"
          ) {
            tokensToDelete.push(currentBatchTokens[index]);
          }
        }
      });
    }

    // 3. Prune stale tokens in the background
    if (tokensToDelete.length > 0) {
      const batch = db.batch();
      for (const token of tokensToDelete) {
        const paths = uniqueTokensMap.get(token) || [];
        for (const p of paths) {
          batch.delete(db.doc(p));
        }
      }
      batch.commit().catch((err) => {
        console.warn("[Push Service] Error deleting stale tokens:", err);
      });
    }

    return {
      success: true,
      totalTokens: tokens.length,
      successCount,
      failureCount,
      skipped: false,
    };
  } catch (error: unknown) {
    console.error("[Push Service] Multicast dispatch error:", error);
    return {
      success: false,
      totalTokens: 0,
      successCount: 0,
      failureCount: 0,
      skipped: false,
      error: (error as Error)?.message || "Unknown push error",
    };
  }
}
