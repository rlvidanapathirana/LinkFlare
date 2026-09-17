import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUserByEmail, updateUser } from "@/lib/redis";

export async function POST(request: NextRequest) {
  try {
    const { email, method, recoveryCode, securityAnswer, newPassword } = await request.json();

    if (!email || !newPassword) {
      return NextResponse.json({ error: "Email and new password are required" }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
    }

    const user = await getUserByEmail(email.toLowerCase().trim());
    if (!user) {
      return NextResponse.json({ error: "No account found with this email" }, { status: 404 });
    }

    let isAuthorized = false;

    // Method 1: Recovery Code
    if (method === "code" || (!method && recoveryCode)) {
      if (!recoveryCode || !user.recoveryCodeHash) {
        return NextResponse.json({ error: "Recovery code is required" }, { status: 400 });
      }
      const cleanInputCode = recoveryCode.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      isAuthorized = await bcrypt.compare(cleanInputCode, user.recoveryCodeHash);
      if (!isAuthorized) {
        return NextResponse.json({ error: "Invalid Recovery Key. Please double-check your code." }, { status: 400 });
      }
    }
    // Method 2: Security Question
    else if (method === "question" || (!method && securityAnswer)) {
      if (!securityAnswer || !user.securityAnswerHash) {
        return NextResponse.json({ error: "Security answer is required" }, { status: 400 });
      }
      const cleanAnswer = securityAnswer.trim().toLowerCase();
      isAuthorized = await bcrypt.compare(cleanAnswer, user.securityAnswerHash);
      if (!isAuthorized) {
        return NextResponse.json({ error: "Incorrect answer to the security question." }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: "Please provide your Recovery Key or Security Answer." }, { status: 400 });
    }

    // Reset password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);
    user.passwordHash = newPasswordHash;
    await updateUser(user);

    return NextResponse.json({
      success: true,
      message: "Password has been successfully reset! You can now log in.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
