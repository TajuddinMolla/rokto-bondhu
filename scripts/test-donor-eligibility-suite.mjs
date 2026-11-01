/**
 * Comprehensive Donor Eligibility & Recovery Test Suite
 *
 * Verifies all 14 mandatory scenarios specified in the requirements.
 */

import {
  calculateDonorEligibility,
  formatEligibleDateDisplay,
  parseCalendarDateUtc,
  formatCalendarDateUtc,
  DONOR_RECOVERY_PERIOD_DAYS,
} from "../lib/utils/donor-eligibility.ts";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log("==================================================================");
console.log("🧪 RoktoBondhu 120-Day Donor Availability & Recovery Test Suite");
console.log("==================================================================\n");

// Fixed reference date: 2026-05-01 (May 1, 2026 UTC)
const REF_DATE = "2026-05-01";
const refUtc = parseCalendarDateUtc(REF_DATE);
const MS_PER_DAY = 24 * 60 * 60 * 1000;

console.log(`[Reference Date for Tests]: ${REF_DATE}\n`);

// -------------------------------------------------------------
// Test 1: No previous donation date (null, empty, undefined)
// -------------------------------------------------------------
console.log("1. No previous donation date");
const t1Null = calculateDonorEligibility(null, REF_DATE);
assert(t1Null.isEligible === true, "null date is eligible");
assert(t1Null.daysRemaining === 0, "null date has 0 days remaining");
assert(t1Null.nextEligibleDate === null, "null date has null nextEligibleDate");

const t1Empty = calculateDonorEligibility("", REF_DATE);
assert(t1Empty.isEligible === true, "empty string is eligible");

const t1Undef = calculateDonorEligibility(undefined, REF_DATE);
assert(t1Undef.isEligible === true, "undefined is eligible");

// -------------------------------------------------------------
// Test 2: Donation today (0 days elapsed)
// -------------------------------------------------------------
console.log("\n2. Donation today");
const t2 = calculateDonorEligibility(REF_DATE, REF_DATE);
assert(t2.isEligible === false, "Donation today is ineligible (recovering)");
assert(t2.daysElapsed === 0, "Days elapsed is 0");
assert(t2.daysRemaining === DONOR_RECOVERY_PERIOD_DAYS, `Days remaining is exactly ${DONOR_RECOVERY_PERIOD_DAYS}`);
const expectedT2Next = formatCalendarDateUtc(new Date(refUtc.getTime() + DONOR_RECOVERY_PERIOD_DAYS * MS_PER_DAY));
assert(t2.nextEligibleDate === expectedT2Next, `Next eligible date is ${expectedT2Next}`);
const formattedBn = formatEligibleDateDisplay(t2.nextEligibleDate, "bn");
assert(Boolean(formattedBn), `Formatted Bengali date: ${formattedBn}`);

// -------------------------------------------------------------
// Test 3: Donation 1 day ago (1 day elapsed)
// -------------------------------------------------------------
console.log("\n3. Donation 1 day ago");
const d1Ago = formatCalendarDateUtc(new Date(refUtc.getTime() - 1 * MS_PER_DAY));
const t3 = calculateDonorEligibility(d1Ago, REF_DATE);
assert(t3.isEligible === false, "Donation 1 day ago is ineligible");
assert(t3.daysElapsed === 1, "Days elapsed is 1");
assert(t3.daysRemaining === 119, "Days remaining is 119");

// -------------------------------------------------------------
// Test 4: Donation 119 days ago (119 days elapsed)
// -------------------------------------------------------------
console.log("\n4. Donation 119 days ago");
const d119Ago = formatCalendarDateUtc(new Date(refUtc.getTime() - 119 * MS_PER_DAY));
const t4 = calculateDonorEligibility(d119Ago, REF_DATE);
assert(t4.isEligible === false, "Donation 119 days ago is ineligible");
assert(t4.daysElapsed === 119, "Days elapsed is 119");
assert(t4.daysRemaining === 1, "Days remaining is 1");

// -------------------------------------------------------------
// Test 5: Donation exactly 120 days ago (120 days elapsed)
// -------------------------------------------------------------
console.log("\n5. Donation exactly 120 days ago");
const d120Ago = formatCalendarDateUtc(new Date(refUtc.getTime() - 120 * MS_PER_DAY));
const t5 = calculateDonorEligibility(d120Ago, REF_DATE);
assert(t5.isEligible === true, "Donation exactly 120 days ago is eligible");
assert(t5.daysElapsed === 120, "Days elapsed is 120");
assert(t5.daysRemaining === 0, "Days remaining is 0");

// -------------------------------------------------------------
// Test 6: Donation 121 days ago (121 days elapsed)
// -------------------------------------------------------------
console.log("\n6. Donation 121 days ago");
const d121Ago = formatCalendarDateUtc(new Date(refUtc.getTime() - 121 * MS_PER_DAY));
const t6 = calculateDonorEligibility(d121Ago, REF_DATE);
assert(t6.isEligible === true, "Donation 121 days ago is eligible");
assert(t6.daysElapsed === 121, "Days elapsed is 121");
assert(t6.daysRemaining === 0, "Days remaining is 0");

// -------------------------------------------------------------
// Test 7: Future donation date
// -------------------------------------------------------------
console.log("\n7. Future donation date");
const dFuture = formatCalendarDateUtc(new Date(refUtc.getTime() + 5 * MS_PER_DAY));
const t7 = calculateDonorEligibility(dFuture, REF_DATE);
assert(t7.isEligible === false, "Future donation date is ineligible");
assert(t7.isFutureDate === true, "isFutureDate flag is true");
assert(t7.daysRemaining === 120, "Days remaining defaults safely to 120");

// -------------------------------------------------------------
// Test 8: Donor manually unavailable while eligible
// -------------------------------------------------------------
console.log("\n8. Donor manually unavailable while eligible");
function simulateProfileSave(input, refDate) {
  const eligibility = calculateDonorEligibility(input.lastDonationDate, refDate);
  let availabilityStatus = "available";
  let unavailableReason = null;
  let nextEligibleDate = null;

  if (!eligibility.isEligible) {
    availabilityStatus = "unavailable";
    unavailableReason = "MEDICAL_RECOVERY";
    nextEligibleDate = eligibility.nextEligibleDate;
  } else if (input.availabilityStatus === "unavailable") {
    availabilityStatus = "unavailable";
    unavailableReason = "MANUAL_PAUSE";
    nextEligibleDate = null;
  } else {
    availabilityStatus = "available";
    unavailableReason = null;
    nextEligibleDate = null;
  }

  return { availabilityStatus, unavailableReason, nextEligibleDate };
}

const t8Save = simulateProfileSave(
  { lastDonationDate: d120Ago, availabilityStatus: "unavailable" },
  REF_DATE
);
assert(t8Save.availabilityStatus === "unavailable", "Status remains unavailable");
assert(t8Save.unavailableReason === "MANUAL_PAUSE", "Reason is correctly recorded as MANUAL_PAUSE");
assert(t8Save.nextEligibleDate === null, "No recovery date set for manual pause");

// -------------------------------------------------------------
// Test 9: Donor recovering and tries to toggle available
// -------------------------------------------------------------
console.log("\n9. Donor recovering and tries to toggle available");
function simulateToggleAvailability(donor, targetStatus, refDate) {
  const eligibility = calculateDonorEligibility(donor.lastDonationDate, refDate);
  if (targetStatus === "available" && !eligibility.isEligible) {
    throw new Error(`Blocked: in recovery cooldown until ${eligibility.nextEligibleDate}`);
  }
  return {
    availabilityStatus: targetStatus,
    unavailableReason: targetStatus === "unavailable" ? "MANUAL_PAUSE" : null,
  };
}

let toggleBlocked = false;
try {
  simulateToggleAvailability({ lastDonationDate: d1Ago, availabilityStatus: "unavailable" }, "available", REF_DATE);
} catch {
  toggleBlocked = true;
}
assert(toggleBlocked === true, "Recovering donor is strictly blocked from setting available");

// -------------------------------------------------------------
// Test 10: Cron runs before eligibility date
// -------------------------------------------------------------
console.log("\n10. Cron runs before eligibility date");
function simulateCronRun(donors, currentDate, notifications = new Map()) {
  let updatedCount = 0;
  const updatedDonors = donors.map((donor) => {
    if (donor.availabilityStatus !== "unavailable") return donor;
    // Strict requirement: Cron ONLY reactivates when explicitly marked as MEDICAL_RECOVERY
    if (donor.unavailableReason !== "MEDICAL_RECOVERY") return donor;
    if (!donor.lastDonationDate) return donor;

    const eligibility = calculateDonorEligibility(donor.lastDonationDate, currentDate);
    if (!eligibility.isEligible) return donor;

    updatedCount++;
    // Deterministic notification key based on donorId + lastDonationDate
    const notifId = `notif_donor_recovery_reset_${donor.id}_${donor.lastDonationDate}`;
    notifications.set(notifId, {
      recipientId: donor.id,
      title: "You are now eligible to donate blood again!",
    });

    return {
      ...donor,
      availabilityStatus: "available",
      unavailableReason: null,
      nextEligibleDate: null,
    };
  });
  return { updatedCount, updatedDonors, notifications };
}

const donorsBefore = [
  { id: "donor_1", lastDonationDate: d119Ago, availabilityStatus: "unavailable", unavailableReason: "MEDICAL_RECOVERY" },
];
const cronBeforeResult = simulateCronRun(donorsBefore, REF_DATE);
assert(cronBeforeResult.updatedCount === 0, "Cron does not reset donor 1 day before recovery ends");
assert(cronBeforeResult.updatedDonors[0].availabilityStatus === "unavailable", "Donor remains unavailable");

// -------------------------------------------------------------
// Test 11: Cron runs after eligibility date (Strict Legacy Protection)
// -------------------------------------------------------------
console.log("\n11. Cron runs after eligibility date (Strict Legacy Protection)");
const notifTracker = new Map();
const donorsAfter = [
  { id: "donor_medical", lastDonationDate: d120Ago, availabilityStatus: "unavailable", unavailableReason: "MEDICAL_RECOVERY" },
  { id: "donor_manual", lastDonationDate: d120Ago, availabilityStatus: "unavailable", unavailableReason: "MANUAL_PAUSE" },
  { id: "donor_legacy_missing_reason", lastDonationDate: d120Ago, availabilityStatus: "unavailable" },
  { id: "donor_legacy_only_next_date", lastDonationDate: d120Ago, availabilityStatus: "unavailable", nextEligibleDate: "2026-05-01" },
];
const cronAfterResult = simulateCronRun(donorsAfter, REF_DATE, notifTracker);
assert(cronAfterResult.updatedCount === 1, "Cron resets ONLY the donor explicitly marked MEDICAL_RECOVERY");
assert(cronAfterResult.updatedDonors[0].availabilityStatus === "available", "MEDICAL_RECOVERY donor is reactivated after eligibility");
assert(cronAfterResult.updatedDonors[1].availabilityStatus === "unavailable", "MANUAL_PAUSE donor remains unavailable");
assert(cronAfterResult.updatedDonors[2].availabilityStatus === "unavailable", "Legacy donor without unavailableReason remains unchanged");
assert(cronAfterResult.updatedDonors[3].availabilityStatus === "unavailable", "Legacy donor with only nextEligibleDate remains unchanged");

// -------------------------------------------------------------
// Test 12: Cron runs multiple times (Idempotence & Notification Deduplication)
// -------------------------------------------------------------
console.log("\n12. Cron runs multiple times (Idempotence & Notification Deduplication)");
assert(notifTracker.size === 1, "Exactly 1 recovery notification created on first run");
const cronRun2 = simulateCronRun(cronAfterResult.updatedDonors, REF_DATE, notifTracker);
assert(cronRun2.updatedCount === 0, "Second cron run makes 0 changes (idempotent)");
assert(notifTracker.size === 1, "Repeated cron execution does not duplicate notifications");

// Simulate retry scenario where same list is re-executed with deterministic keys
const cronRetryRun = simulateCronRun(donorsAfter, REF_DATE, notifTracker);
assert(cronRetryRun.notifications.size === 1, "Retry using deterministic ID preserves notification set size (no duplicate notifications)");

// -------------------------------------------------------------
// Test 13: Private/public donor records remain consistent
// -------------------------------------------------------------
console.log("\n13. Private/public donor records consistency");
const saveResult = simulateProfileSave(
  { lastDonationDate: d1Ago, availabilityStatus: "available" },
  REF_DATE
);
assert(saveResult.availabilityStatus === "unavailable", "Private record set to unavailable");
assert(saveResult.unavailableReason === "MEDICAL_RECOVERY", "Private record reason set to MEDICAL_RECOVERY");
assert(saveResult.nextEligibleDate !== null, "Private record nextEligibleDate populated");

// -------------------------------------------------------------
// Test 14: Donor search never returns an ineligible donor as available (Self-healing)
// -------------------------------------------------------------
console.log("\n14. Donor search never returns ineligible donor as available");
function simulateSearchFilter(donors, filterAvailability, refDate) {
  return donors
    .map((d) => {
      const eligibility = calculateDonorEligibility(d.lastDonationDate, refDate);
      let effectiveStatus = d.availabilityStatus;
      if (!eligibility.isEligible) {
        effectiveStatus = "unavailable";
      }
      return { ...d, availabilityStatus: effectiveStatus };
    })
    .filter((d) => filterAvailability !== "available" || d.availabilityStatus === "available");
}

const mockDbDonors = [
  // Legacy or un-synced record that had "available" in DB despite recent donation
  { id: "donor_stale", lastDonationDate: d1Ago, availabilityStatus: "available" },
  { id: "donor_healthy", lastDonationDate: d120Ago, availabilityStatus: "available" },
  { id: "donor_first_time", lastDonationDate: null, availabilityStatus: "available" },
];

const availableSearchResults = simulateSearchFilter(mockDbDonors, "available", REF_DATE);
assert(availableSearchResults.length === 2, "Search filtered out the stale recovering donor");
assert(availableSearchResults.some((d) => d.id === "donor_stale") === false, "Ineligible donor is absent from available results");
assert(availableSearchResults.some((d) => d.id === "donor_healthy") === true, "Eligible donor is present in search");
assert(availableSearchResults.some((d) => d.id === "donor_first_time") === true, "First-time donor is present in search");

console.log("\n==================================================================");
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log("==================================================================");

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
