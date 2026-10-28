#!/usr/bin/env node

/**
 * RoktoBondhu Admin Provisioning Script
 *
 * Usage:
 *   node scripts/set-admin.mjs <user-email-or-uid> [--revoke]
 *
 * Requirements:
 *   - GOOGLE_APPLICATION_CREDENTIALS environment variable pointing to service-account.json
 *     OR Firebase CLI login credentials.
 *   - Or install `firebase-admin`: `npm i -D firebase-admin`
 */

import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

const targetIdentifier = process.argv[2];
const isRevoke = process.argv.includes("--revoke");

if (!targetIdentifier || targetIdentifier.startsWith("--")) {
  console.error(
    "Usage: node scripts/set-admin.mjs <user-email-or-uid> [--revoke]",
  );
  process.exit(1);
}

async function main() {
  let admin;
  try {
    admin = await import("firebase-admin");
  } catch {
    console.error(
      "\n❌ 'firebase-admin' is required to run this script directly.",
    );
    console.error("Run: npm install --save-dev firebase-admin\n");
    console.log(
      "Alternatively, you can set custom claims via Firebase CLI or Cloud Functions console:",
    );
    console.log(
      `admin.auth().setCustomUserClaims("${targetIdentifier}", { admin: ${!isRevoke}, role: "${isRevoke ? "user" : "admin"}" });\n`,
    );
    process.exit(1);
  }

  // Initialize Firebase Admin if not already initialized
  if (!admin.default.apps.length) {
    const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (serviceAccountPath && existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(
        readFileSync(resolve(serviceAccountPath), "utf8"),
      );
      admin.default.initializeApp({
        credential: admin.default.credential.cert(serviceAccount),
      });
    } else {
      admin.default.initializeApp();
    }
  }

  const auth = admin.default.auth();
  let user;

  try {
    if (targetIdentifier.includes("@")) {
      user = await auth.getUserByEmail(targetIdentifier);
    } else {
      user = await auth.getUser(targetIdentifier);
    }
  } catch (err) {
    console.error(
      `❌ User not found with identifier "${targetIdentifier}":`,
      err.message,
    );
    process.exit(1);
  }

  const claims = isRevoke
    ? { admin: false, role: "user" }
    : { admin: true, role: "admin" };

  await auth.setCustomUserClaims(user.uid, claims);

  // Also update users/{uid} document if Firestore is available
  try {
    const db = admin.default.firestore();
    await db
      .collection("users")
      .doc(user.uid)
      .set(
        {
          role: isRevoke ? "user" : "admin",
          updatedAt: admin.default.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
  } catch {
    // Non-fatal if Firestore rules or connectivity differs
  }

  console.log(
    `✅ Successfully ${isRevoke ? "revoked admin access from" : "provisioned admin access for"} user:`,
  );
  console.log(`   UID:   ${user.uid}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Claims:`, claims);
  console.log(
    `\nNote: The user must log out and log in again (or refresh their ID token) for new claims to take effect.`,
  );
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
