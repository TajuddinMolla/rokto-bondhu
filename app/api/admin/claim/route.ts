import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getServerAuth, getServerFirestore } from "@/lib/firebase/server";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized: Missing Authorization Bearer token" },
        { status: 401 }
      );
    }

    const idToken = authHeader.slice(7).trim();
    const adminAuth = getServerAuth();
    const adminDb = getServerFirestore();

    if (!adminAuth || !adminDb) {
      return NextResponse.json(
        { error: "Firebase Admin SDK is not configured on the server" },
        { status: 503 }
      );
    }

    // Verify token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const email = decodedToken.email;

    // Security Authorization Check:
    // Only permit if caller is an authorized administrator email, an existing verified admin,
    // or provides a valid server secret header. Regular users are strictly forbidden.
    const defaultAdmins = "taj.unicart@gmail.com,admin@roktobondhu.com";
    const allowedEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || defaultAdmins)
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const isWhitelistedEmail = Boolean(email && allowedEmails.includes(email.toLowerCase()));
    const isExistingClaimAdmin = decodedToken.role === "ADMIN" || decodedToken.admin === true;

    const userDocSnap = await adminDb.collection("users").doc(uid).get();
    const isFirestoreAdmin = Boolean(
      userDocSnap.exists &&
        (userDocSnap.data()?.role === "ADMIN" ||
          userDocSnap.data()?.role === "admin" ||
          userDocSnap.data()?.isAdmin === true)
    );

    const adminSecret = process.env.ADMIN_INVITE_SECRET;
    const providedSecret = req.headers.get("x-admin-secret");
    const hasValidSecret = Boolean(adminSecret && providedSecret && providedSecret === adminSecret);

    if (!isWhitelistedEmail && !isExistingClaimAdmin && !isFirestoreAdmin && !hasValidSecret) {
      return NextResponse.json(
        { error: "Forbidden: You are not authorized to claim administrative privileges." },
        { status: 403 }
      );
    }

    // Grant ADMIN custom claim
    await adminAuth.setCustomUserClaims(uid, {
      role: "ADMIN",
      admin: true,
    });

    // Also mark email as verified in Firebase Auth
    await adminAuth.updateUser(uid, {
      emailVerified: true,
    });

    // Update Firestore User Document
    const userDocRef = adminDb.collection("users").doc(uid);
    await userDocRef.set(
      {
        role: "ADMIN",
        isAdmin: true,
        emailVerified: true,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    // Record in audit log
    try {
      await adminDb.collection("auditLogs").add({
        adminId: uid,
        adminEmail: email || "unknown",
        action: "CLAIM_ADMIN_PERMISSIONS",
        targetType: "USER",
        targetId: uid,
        details: "User self-provisioned full administrative permissions",
        createdAt: FieldValue.serverTimestamp(),
      });
    } catch {
      // Audit log non-fatal
    }

    return NextResponse.json({
      success: true,
      message: "Full admin permissions and verified status granted successfully.",
      uid,
      role: "ADMIN",
    });
  } catch (error) {
    console.error("[Claim Admin Error]:", error);
    return NextResponse.json(
      {
        error: "Failed to grant admin permissions",
        details: (error as Error)?.message,
      },
      { status: 500 }
    );
  }
}
