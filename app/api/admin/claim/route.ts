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
