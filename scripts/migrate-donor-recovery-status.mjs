#!/usr/bin/env node
/**
 * Safe Migration Script: Donor Recovery & Availability Cooldown
 *
 * Scans both /donorProfiles and /publicDonorProfiles.
 *
 * Rules:
 * 1. Missing lastDonationDate -> Preserves existing behavior (no modification).
 * 2. Recent lastDonationDate (< 120 days) with availabilityStatus === "available" ->
 *    Updates to availabilityStatus = "unavailable", unavailableReason = "MEDICAL_RECOVERY",
 *    and sets nextEligibleDate.
 * 3. Eligible lastDonationDate (>= 120 days) with unavailableReason === "MEDICAL_RECOVERY" ->
 *    Restores to availabilityStatus = "available", clears unavailableReason and nextEligibleDate.
 * 4. Manual Pause (unavailableReason === "MANUAL_PAUSE") ->
 *    Strictly preserved! NEVER auto-enabled.
 *
 * Usage:
 *   node scripts/migrate-donor-recovery-status.mjs           # Dry-run report (no database writes)
 *   node scripts/migrate-donor-recovery-status.mjs --commit  # Executes migration with batch writes
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// 120-Day Recovery Calculator
const DONOR_RECOVERY_PERIOD_DAYS = 120;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function parseCalendarDateUtc(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return null;
  const trimmed = dateStr.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
  const [y, m, d] = trimmed.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
  if (
    date.getUTCFullYear() !== y ||
    date.getUTCMonth() !== m - 1 ||
    date.getUTCDate() !== d
  ) {
    return null;
  }
  return date;
}

function formatCalendarDateUtc(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function calculateEligibility(dateStr, now) {
  const parsed = parseCalendarDateUtc(dateStr);
  if (!parsed) {
    return { isEligible: true, daysRemaining: 0, nextEligibleDate: null };
  }
  const diffDays = Math.floor((now.getTime() - parsed.getTime()) / MS_PER_DAY);
  if (diffDays < 0) {
    return { isEligible: false, daysRemaining: DONOR_RECOVERY_PERIOD_DAYS, nextEligibleDate: null };
  }
  const isEligible = diffDays >= DONOR_RECOVERY_PERIOD_DAYS;
  const nextDateUtc = new Date(parsed.getTime() + DONOR_RECOVERY_PERIOD_DAYS * MS_PER_DAY);
  return {
    isEligible,
    daysRemaining: isEligible ? 0 : DONOR_RECOVERY_PERIOD_DAYS - diffDays,
    nextEligibleDate: formatCalendarDateUtc(nextDateUtc),
  };
}

async function runMigration() {
  const isCommit = process.argv.includes("--commit");
  console.log("==================================================================");
  console.log(`🚀 RoktoBondhu Donor Recovery Status Migration [${isCommit ? "COMMIT MODE" : "DRY RUN MODE"}]`);
  console.log("==================================================================");

  let serviceAccount = null;
  const saPath = resolve(process.cwd(), "service-account.json");
  if (existsSync(saPath)) {
    serviceAccount = JSON.parse(readFileSync(saPath, "utf-8"));
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const decoded = raw.startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf-8");
    serviceAccount = JSON.parse(decoded);
  }

  if (!serviceAccount) {
    console.error("❌ No Firebase service account credentials found. Aborting.");
    process.exit(1);
  }

  const app = getApps().length > 0 ? getApps()[0] : initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });

  const db = getFirestore(app);
  const now = new Date();
  const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));

  console.log(`Current calendar date (UTC): ${formatCalendarDateUtc(todayUtc)}`);

  const donorsSnap = await db.collection("donorProfiles").get();
  console.log(`Scanned ${donorsSnap.size} donor profile(s)...`);

  const stats = {
    total: donorsSnap.size,
    missingDate: 0,
    alreadyCompliant: 0,
    needsRecoveryLock: 0,
    needsRecoveryUnlock: 0,
    manuallyPausedPreserved: 0,
  };

  const actions = [];

  for (const doc of donorsSnap.docs) {
    const data = doc.data();
    const donorId = doc.id;
    const lastDate = data.lastDonationDate;
    const currentStatus = data.availabilityStatus || "available";
    const currentReason = data.unavailableReason;

    if (!lastDate) {
      stats.missingDate++;
      continue;
    }

    const { isEligible, daysRemaining, nextEligibleDate } = calculateEligibility(lastDate, todayUtc);

    // Case 1: In 120-day recovery window, but currently marked available
    if (!isEligible && currentStatus === "available") {
      stats.needsRecoveryLock++;
      actions.push({
        donorId,
        type: "LOCK_TO_RECOVERY",
        lastDonationDate: lastDate,
        daysRemaining,
        nextEligibleDate,
        changes: {
          availabilityStatus: "unavailable",
          unavailableReason: "MEDICAL_RECOVERY",
          nextEligibleDate,
        },
      });
      continue;
    }

    // Case 2: Past 120-day recovery, was in MEDICAL_RECOVERY, still unavailable
    if (isEligible && currentStatus === "unavailable" && currentReason === "MEDICAL_RECOVERY") {
      stats.needsRecoveryUnlock++;
      actions.push({
        donorId,
        type: "UNLOCK_TO_AVAILABLE",
        lastDonationDate: lastDate,
        changes: {
          availabilityStatus: "available",
          unavailableReason: null,
          nextEligibleDate: null,
        },
      });
      continue;
    }

    // Case 3: Medically eligible, but manually paused
    if (currentReason === "MANUAL_PAUSE") {
      stats.manuallyPausedPreserved++;
      continue;
    }

    stats.alreadyCompliant++;
  }

  console.log("\n📊 Migration Audit Summary:");
  console.log(`   - Total donors examined:           ${stats.total}`);
  console.log(`   - Without lastDonationDate (saved): ${stats.missingDate}`);
  console.log(`   - Already compliant:               ${stats.alreadyCompliant}`);
  console.log(`   - Manually paused (preserved):     ${stats.manuallyPausedPreserved}`);
  console.log(`   - In recovery, need locking:       ${stats.needsRecoveryLock}`);
  console.log(`   - Cooldown ended, need unlocking:  ${stats.needsRecoveryUnlock}`);

  if (actions.length > 0) {
    console.log(`\nFound ${actions.length} donor document(s) requiring synchronization:`);
    actions.forEach((a, i) => {
      console.log(`   ${i + 1}. Donor ${a.donorId}: [${a.type}] lastDonation=${a.lastDonationDate}`);
    });

    if (isCommit) {
      console.log("\nWriting updates to Firestore in atomic batches...");
      let batch = db.batch();
      let ops = 0;
      for (const a of actions) {
        const donorRef = db.collection("donorProfiles").doc(a.donorId);
        const publicRef = db.collection("publicDonorProfiles").doc(a.donorId);

        const updatePayload = {
          ...a.changes,
          updatedAt: FieldValue.serverTimestamp(),
        };

        if (updatePayload.unavailableReason === null) {
          updatePayload.unavailableReason = FieldValue.delete();
        }
        if (updatePayload.nextEligibleDate === null) {
          updatePayload.nextEligibleDate = FieldValue.delete();
        }

        batch.update(donorRef, updatePayload);
        batch.set(publicRef, updatePayload, { merge: true });
        ops += 2;

        if (ops >= 200) {
          await batch.commit();
          batch = db.batch();
          ops = 0;
        }
      }

      if (ops > 0) {
        await batch.commit();
      }
      console.log("✅ Successfully committed all migration updates.");
    } else {
      console.log("\n💡 Dry run complete. To execute changes on the database, run with `--commit`.");
    }
  } else {
    console.log("\n✅ All donor records are currently compliant. No action required.");
  }
}

runMigration().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});

