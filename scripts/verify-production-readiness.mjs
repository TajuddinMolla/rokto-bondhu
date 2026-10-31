import assert from "node:assert/strict";
import fs from "node:fs";

console.log("=================================================");
console.log("🚀 RoktoBondhu Production Readiness Verification");
console.log("=================================================\n");

let passedTests = 0;
let totalTests = 0;

function test(description, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ ${description}`);
    passedTests++;
  } catch (error) {
    console.error(`  ✗ ${description}`);
    console.error(`    ${error.message}`);
  }
}

// -----------------------------------------------------------------
// Test Suite 1: Configuration & Manifest Files
// -----------------------------------------------------------------
console.log("1. Infrastructure & Index Manifests");

test("firestore.indexes.json exists and is valid JSON", () => {
  const content = fs.readFileSync("firestore.indexes.json", "utf-8");
  const parsed = JSON.parse(content);
  assert.ok(Array.isArray(parsed.indexes), "indexes must be an array");
  assert.ok(parsed.indexes.length >= 6, "Must define at least 6 composite indexes");
  
  // Verify bloodRequests composite index exists
  const hasBloodRequestIndex = parsed.indexes.some(
    (idx) => idx.collectionGroup === "bloodRequests"
  );
  assert.ok(hasBloodRequestIndex, "Must index bloodRequests");

  // Verify notifications composite index exists
  const hasNotificationIndex = parsed.indexes.some(
    (idx) => idx.collectionGroup === "notifications"
  );
  assert.ok(hasNotificationIndex, "Must index notifications");
});

test("firebase.json references firestore.indexes.json and rules", () => {
  const content = fs.readFileSync("firebase.json", "utf-8");
  const parsed = JSON.parse(content);
  assert.equal(parsed.firestore.rules, "firestore.rules");
  assert.equal(parsed.firestore.indexes, "firestore.indexes.json");
});

test("vercel.json configures automated cron job", () => {
  const content = fs.readFileSync("vercel.json", "utf-8");
  const parsed = JSON.parse(content);
  assert.ok(Array.isArray(parsed.crons), "crons must be an array");
  assert.equal(parsed.crons[0].path, "/api/cron/expire-requests");
  assert.equal(parsed.crons[0].schedule, "0 0 * * *", "Cron schedule must be daily for Vercel Hobby");
});

// -----------------------------------------------------------------
// Test Suite 2: Firestore Security Rules Syntax & Permissions
// -----------------------------------------------------------------
console.log("\n2. Firestore Security Rules Coverage");

test("firestore.rules permits 'expired' status on bloodRequests", () => {
  const rules = fs.readFileSync("firestore.rules", "utf-8");
  assert.ok(
    rules.includes("request.resource.data.status in ['open', 'fulfilled', 'cancelled', 'expired']"),
    "Rules must allow transition to 'expired'"
  );
});

test("firestore.rules allows admin update on donorContactRequests", () => {
  const rules = fs.readFileSync("firestore.rules", "utf-8");
  assert.ok(
    rules.includes("isAdmin();") && rules.includes("match /donorContactRequests/{requestId}"),
    "donorContactRequests must permit admin operations"
  );
});

// -----------------------------------------------------------------
// Test Suite 3: Environment Configuration Template
// -----------------------------------------------------------------
console.log("\n3. Environment Variables & Secret Separation");

test(".env.example documents all production secrets without leaks", () => {
  const envExample = fs.readFileSync(".env.example", "utf-8");
  assert.ok(envExample.includes("CRON_SECRET="), "Must document CRON_SECRET");
  assert.ok(envExample.includes("RESEND_API_KEY="), "Must document RESEND_API_KEY");
  assert.ok(envExample.includes("NEXT_PUBLIC_FIREBASE_VAPID_KEY="), "Must document VAPID key");
  assert.ok(envExample.includes("FIREBASE_SERVICE_ACCOUNT_KEY="), "Must document FIREBASE_SERVICE_ACCOUNT_KEY");
  
  // Ensure private keys are never prefixed with NEXT_PUBLIC_
  assert.ok(!envExample.includes("NEXT_PUBLIC_RESEND_API_KEY"), "RESEND_API_KEY must not be public");
  assert.ok(!envExample.includes("NEXT_PUBLIC_CRON_SECRET"), "CRON_SECRET must not be public");
  assert.ok(!envExample.includes("NEXT_PUBLIC_FIREBASE_SERVICE_ACCOUNT"), "Service account must not be public");
});

// -----------------------------------------------------------------
// Test Suite 4: Route Handlers and Endpoints
// -----------------------------------------------------------------
console.log("\n4. Route Handlers & Security Enforcement");

test("/api/notifications/dispatch enforces Bearer authorization and rate limiting", () => {
  const routeCode = fs.readFileSync("app/api/notifications/dispatch/route.ts", "utf-8");
  assert.ok(routeCode.includes("authHeader.startsWith(\"Bearer \")"), "Must verify Bearer header");
  assert.ok(routeCode.includes("verifyIdToken"), "Must verify ID token via Admin Auth");
  assert.ok(routeCode.includes("checkRateLimit"), "Must enforce rate limiting");
  assert.ok(routeCode.includes("status: 401"), "Must return 401 on missing auth");
  assert.ok(routeCode.includes("status: 403"), "Must return 403 on ownership mismatch");
});

test("/api/cron/expire-requests enforces CRON_SECRET and handles idempotent updates", () => {
  const routeCode = fs.readFileSync("app/api/cron/expire-requests/route.ts", "utf-8");
  assert.ok(routeCode.includes("CRON_SECRET"), "Must check CRON_SECRET");
  assert.ok(routeCode.includes("sevenDaysAgoIso"), "Must calculate 7-day cutoff for blood requests");
  assert.ok(routeCode.includes("fortyEightHoursAgoIso"), "Must calculate 48-hour cutoff for contact requests");
  assert.ok(routeCode.includes("data.expiresAt"), "Must evaluate reliable expiresAt");
  assert.ok(routeCode.includes("commitBatchIfFull"), "Must support safe chunked batch commits");
  assert.ok(routeCode.includes("status: \"expired\""), "Must transition blood requests to expired");
  assert.ok(routeCode.includes("status: \"EXPIRED\""), "Must transition contact requests to EXPIRED");
});

// -----------------------------------------------------------------
// Test Suite 5: Bilingual Message Parity
// -----------------------------------------------------------------
console.log("\n5. Bilingual Localization Parity");

test("messages/bn.json and messages/en.json have matching critical keys", () => {
  const bn = JSON.parse(fs.readFileSync("messages/bn.json", "utf-8"));
  const en = JSON.parse(fs.readFileSync("messages/en.json", "utf-8"));

  // Check resetPassword keys
  assert.ok(bn.auth.resetPassword.successTitle, "bn must have successTitle");
  assert.ok(en.auth.resetPassword.successTitle, "en must have successTitle");
  assert.ok(bn.auth.resetPassword.invalidCodeTitle, "bn must have invalidCodeTitle");
  assert.ok(en.auth.resetPassword.invalidCodeTitle, "en must have invalidCodeTitle");

  // Check contactRequests keys
  assert.ok(bn.contactRequests.statusExpired, "bn must have statusExpired");
  assert.equal(bn.contactRequests.statusExpired, "মেয়াদোত্তীর্ণ");
  assert.ok(en.contactRequests.statusExpired, "en must have statusExpired");
  assert.equal(en.contactRequests.statusExpired, "Expired");

  // Check clinical disclaimer keys
  assert.ok(bn.home.bloodGroups.clinicalDisclaimerTitle, "bn must have clinicalDisclaimerTitle");
  assert.ok(en.home.bloodGroups.clinicalDisclaimerTitle, "en must have clinicalDisclaimerTitle");
});

// -----------------------------------------------------------------
// Test Suite 6: Brand Favicon & App Icons
// -----------------------------------------------------------------
console.log("\n6. Brand Favicon & App Icons Assets");

test("favicon.ico, icon.svg, apple-icon.png, and manifest exist with valid headers", () => {
  // Check app/favicon.ico and public/favicon.ico
  const appIco = fs.readFileSync("app/favicon.ico");
  const pubIco = fs.readFileSync("public/favicon.ico");
  assert.ok(appIco.length > 2000, "app/favicon.ico must contain multi-res icons");
  assert.equal(appIco.readUInt16LE(2), 1, "app/favicon.ico must be valid ICO format");
  assert.equal(pubIco.readUInt16LE(2), 1, "public/favicon.ico must be valid ICO format");

  // Check SVG icons
  const appSvg = fs.readFileSync("app/icon.svg", "utf-8");
  assert.ok(appSvg.includes("<svg") && appSvg.includes("M12 22a7"), "app/icon.svg must contain droplet vector");

  // Check Apple touch icon
  const appleIcon = fs.readFileSync("app/apple-icon.png");
  assert.ok(appleIcon.slice(0, 8).toString("hex") === "89504e470d0a1a0a", "apple-icon.png must be valid PNG");

  // Check manifest
  assert.ok(fs.existsSync("app/manifest.ts"), "app/manifest.ts must exist");
});

test("public/og-image.png exists and meets 1200x630 dimensions", () => {
  assert.ok(fs.existsSync("public/og-image.png"), "public/og-image.png must exist");
  const ogBuf = fs.readFileSync("public/og-image.png");
  assert.equal(ogBuf.slice(0, 8).toString("hex"), "89504e470d0a1a0a", "Must be valid PNG format");
  const width = ogBuf.readUInt32BE(16);
  const height = ogBuf.readUInt32BE(20);
  assert.equal(width, 1200, "OG image width must be 1200px");
  assert.equal(height, 630, "OG image height must be 630px");
  assert.ok(ogBuf.length < 300 * 1024, "OG image size should be under 300KB for social platform scrapers");
});

console.log("\n=================================================");
console.log(`Results: ${passedTests}/${totalTests} tests passed`);
console.log("=================================================");

if (passedTests !== totalTests) {
  process.exit(1);
}
