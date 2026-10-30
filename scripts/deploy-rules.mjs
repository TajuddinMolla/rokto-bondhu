import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { GoogleAuth } from "google-auth-library";

async function deployRules() {
  const serviceAccountPath = resolve(process.cwd(), "service-account.json");
  const rulesPath = resolve(process.cwd(), "firestore.rules");

  const rulesContent = readFileSync(rulesPath, "utf-8");

  let sa;
  if (existsSync(serviceAccountPath)) {
    sa = JSON.parse(readFileSync(serviceAccountPath, "utf-8"));
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS && existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
    sa = JSON.parse(readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, "utf-8"));
  } else {
    throw new Error(
      "Service account key not found. Place service-account.json in the project root or set FIREBASE_SERVICE_ACCOUNT_KEY."
    );
  }

  const projectId = sa.project_id;
  console.log(`[Deploy Rules] Target Project: ${projectId}`);

  const auth = new GoogleAuth({
    credentials: sa,
    scopes: ["https://www.googleapis.com/auth/cloud-platform", "https://www.googleapis.com/auth/firebase"],
  });

  const client = await auth.getClient();
  const token = await client.getAccessToken();

  if (!token.token) {
    throw new Error("Failed to get OAuth access token from service account");
  }

  console.log(`[Deploy Rules] Acquired OAuth token, creating ruleset...`);

  // 1. Create Ruleset
  const createRulesetUrl = `https://firebaserules.googleapis.com/v1/projects/${projectId}/rulesets`;
  const createRes = await fetch(createRulesetUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      source: {
        files: [
          {
            name: "firestore.rules",
            content: rulesContent,
          },
        ],
      },
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Failed to create ruleset: ${createRes.status} ${errText}`);
  }

  const rulesetData = await createRes.json();
  const rulesetName = rulesetData.name;
  console.log(`[Deploy Rules] Created ruleset: ${rulesetName}`);

  // 2. Release Ruleset to Firestore
  const releaseName = `projects/${projectId}/releases/cloud.firestore`;
  const releaseUrl = `https://firebaserules.googleapis.com/v1/${releaseName}`;

  console.log(`[Deploy Rules] Releasing ruleset to cloud.firestore...`);
  const releaseRes = await fetch(releaseUrl, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      release: {
        name: releaseName,
        rulesetName: rulesetName,
      },
    }),
  });

  if (!releaseRes.ok) {
    // If release does not exist yet, try creating it with POST
    console.log(`[Deploy Rules] PATCH returned ${releaseRes.status}, attempting POST to create release...`);
    const postReleaseUrl = `https://firebaserules.googleapis.com/v1/projects/${projectId}/releases`;
    const postReleaseRes = await fetch(postReleaseUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: releaseName,
        rulesetName: rulesetName,
      }),
    });

    if (!postReleaseRes.ok) {
      const errText = await postReleaseRes.text();
      throw new Error(`Failed to release ruleset: ${postReleaseRes.status} ${errText}`);
    }
  }

  console.log(`🎉 [Deploy Rules] Successfully deployed firestore.rules to ${projectId}!`);
}

deployRules().catch((err) => {
  console.error("❌ [Deploy Rules Error]:", err);
  process.exit(1);
});
