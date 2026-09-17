import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/redis";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email || !email.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await getUserByEmail(email.toLowerCase().trim());
    if (!user) {
      return NextResponse.json({ error: "No account found with this email address" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      securityQuestion: user.securityQuestion || null,
      hasRecoveryCode: Boolean(user.recoveryCodeHash),
    });
  } catch (error) {
    console.error("Get security question error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
