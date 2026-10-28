#!/usr/bin/env node

/**
 * RoktoBondhu Admin Provisioning & Verification Script
 *
 * This script runs strictly in a trusted server/operator environment.
 * It uses the Firebase Admin SDK to look up an existing user, cryptographically
 * assign the ADMIN custom claim, verify the assignment, and synchronize the
 * Firestore profile document.
 *
 * Security Guarantees:
 * - Never prints private keys or service account credentials.
 * - Never stores credentials, tokens, or passwords in Firestore.
 * - Only sets trusted custom claims on existing Firebase Auth users.
 *
 * Usage:
 *   node scripts/set-admin.mjs <user-email-or-uid> [--check] [--revoke]
 *
 * Examples:
 *   GOOGLE_APPLICATION_CREDENTIALS="./service-account.json" node scripts/set-admin.mjs admin@example.com
 *   GOOGLE_APPLICATION_CREDENTIALS="./service-account.json" node scripts/set-admin.mjs admin@example.com --check
 *   GOOGLE_APPLICATION_CREDENTIALS="./service-account.json" node scripts/set-admin.mjs admin@example.com --revoke
 */

import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const args = process.argv.slice(2);
const isCheckOnly = args.includes("--check");
const isRevoke = args.includes("--revoke");
const targetIdentifier = args.find((arg) => !arg.startsWith("--"));

if (!targetIdentifier) {
  console.log(`
========================================================================
RoktoBondhu Admin Provisioning Script
========================================================================

Usage:
  node scripts/set-admin.mjs <user-email-or-uid> [flags]

Flags:
  --check    Inspect the user's existing claims without modifying them
  --revoke   Revoke ADMIN claims and demote to regular user

Requirements:
  1. Download your Firebase Service Account key JSON from:
     Firebase Console -> Project Settings -> Service Accounts -> Generate New Private Key
  2. Save it locally (e.g. ./service-account.json)
  3. Run:
     GOOGLE_APPLICATION_CREDENTIALS="./service-account.json" node scripts/set-admin.mjs <email-or-uid>
========================================================================
`);
  process.exit(1);
}

function initializeFirebaseAdmin() {
  if (getApps().length > 0) {
    return;
  }

  const envPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const defaultLocalPath = resolve(process.cwd(), "service-account.json");

  let credentialPath = null;
  if (envPath && existsSync(resolve(envPath))) {
    credentialPath = resolve(envPath);
  } else if (existsSync(defaultLocalPath)) {
    credentialPath = defaultLocalPath;
  }

  if (credentialPath) {
    try {
      const fileContent = readFileSync(credentialPath, "utf8");
      const serviceAccount = JSON.parse(fileContent);
      initializeApp({
        credential: cert(serviceAccount),
      });
      return;
    } catch (err) {
      console.error("❌ Failed to parse service account credential JSON:", err.message);
      process.exit(1);
    }
  }

  // If no explicit credential path was found, notify operator with clear setup instructions
  console.error(`
❌ No Firebase Service Account credentials found.

To run this script:
  1. Download your service account key from the Firebase Console:
     Project Settings -> Service Accounts -> "Generate New Private Key"
  2. Save it locally as "service-account.json" (already protected in .gitignore)
     or provide its path via GOOGLE_APPLICATION_CREDENTIALS.
  3. Run:
     GOOGLE_APPLICATION_CREDENTIALS="./service-account.json" node scripts/set-admin.mjs <user-email-or-uid>
`);
  process.exit(1);
}

async function main() {
  initializeFirebaseAdmin();

  const auth = getAuth();
  let user;

  // 1. Find existing user
  try {
    if (targetIdentifier.includes("@")) {
      user = await auth.getUserByEmail(targetIdentifier.trim());
    } else {
      user = await auth.getUser(targetIdentifier.trim());
    }
  } catch (err) {
    console.error(`❌ User not found in Firebase Authentication with identifier "${targetIdentifier}":`);
    console.error(`   Error: ${err.message}`);
    process.exit(1);
  }

  console.log("\n🔍 Found Firebase User:");
  console.log(`   UID:            ${user.uid}`);
  console.log(`   Email:          ${user.email || "N/A"}`);
  console.log(`   Email Verified: ${user.emailVerified}`);
  console.log(`   Current Claims: ${JSON.stringify(user.customClaims || {})}`);
  console.log(`   Created At:     ${user.metadata.creationTime}`);

  if (isCheckOnly) {
    const isAdmin = Boolean(
      user.customClaims?.admin === true ||
      user.customClaims?.role === "ADMIN" ||
      user.customClaims?.role === "admin"
    );
    console.log(`\n📊 Status: User ${isAdmin ? "HAS" : "DOES NOT HAVE"} Admin authorization.`);
    return;
  }

  // 2. Prepare and set claims
  const newClaims = isRevoke
    ? { role: "user", admin: false }
    : { role: "ADMIN", admin: true };

  console.log(`\n⏳ Setting custom claims to:`, JSON.stringify(newClaims));
  await auth.setCustomUserClaims(user.uid, newClaims);

  // 3. Verify assigned claims directly from Firebase Auth
  const verifiedUser = await auth.getUser(user.uid);
  console.log(`✅ Claims successfully written to Firebase Auth!`);
  console.log(`   Verified Claims on User Record:`, JSON.stringify(verifiedUser.customClaims));

  // 4. Synchronize Firestore profile metadata (if /users/{uid} exists or needed)
  try {
    const db = getFirestore();
    const userDocRef = db.collection("users").doc(user.uid);
    const userDoc = await userDocRef.get();

    if (userDoc.exists) {
      await userDocRef.update({
        role: isRevoke ? "user" : "admin",
        updatedAt: FieldValue.serverTimestamp(),
      });
      console.log(`✅ Synchronized Firestore document: users/${user.uid} (role: "${isRevoke ? "user" : "admin"}")`);
    } else {
      await userDocRef.set(
        {
          uid: user.uid,
          email: user.email || "",
          displayName: user.displayName || "",
          role: isRevoke ? "user" : "admin",
          emailVerified: user.emailVerified,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      console.log(`✅ Created Firestore document: users/${user.uid} (role: "${isRevoke ? "user" : "admin"}")`);
    }
  } catch (firestoreErr) {
    console.warn(`⚠️ Warning: Could not synchronize Firestore users/${user.uid}:`, firestoreErr.message);
    console.warn(`   Note: Custom claims in Firebase Auth are already active.`);
  }

  console.log(`
========================================================================
🎉 SUCCESS: Admin privileges ${isRevoke ? "revoked from" : "assigned to"} ${user.email || user.uid}!
========================================================================
IMPORTANT NEXT STEPS:
1. The user must sign out and sign in again (or wait for client ID token refresh)
   to load the new cryptographically-signed custom claims.
2. Once re-authenticated, the user will be recognized by:
   - AdminGuard & /admin routes
   - Firestore Security Rules (isAdmin() validation)
   - Admin users management & audit log operations
========================================================================
`);
}

main().catch((err) => {
  console.error("❌ Fatal execution error:", err);
  process.exit(1);
});
