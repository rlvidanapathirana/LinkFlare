import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getCurrentUser } from "@/lib/auth";
import { getUserById, updateUser } from "@/lib/redis";

function generateRecoveryCode(): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const segment = (len: number) => {
    let s = "";
    for (let i = 0; i < len; i++) {
      s += chars[Math.floor(Math.random() * chars.length)];
    }
    return s;
  };
  return `LF-${segment(4)}-${segment(4)}-${segment(4)}-${segment(4)}`;
}

// GET: Fetch current user's security question
export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserById(currentUser.userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    email: user.email,
    name: user.name,
    securityQuestion: user.securityQuestion || null,
    hasRecoveryCode: Boolean(user.recoveryCodeHash),
  });
}

// POST: Regenerate recovery key & update security question
export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { securityQuestion, securityAnswer } = await request.json();
    const user = await getUserById(currentUser.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate new recovery code
    const newRecoveryCode = generateRecoveryCode();
    const recoveryCodeHash = await bcrypt.hash(newRecoveryCode.replace(/-/g, "").toUpperCase(), 10);

    if (securityQuestion) user.securityQuestion = securityQuestion;
    if (securityAnswer && securityAnswer.trim()) {
      user.securityAnswerHash = await bcrypt.hash(securityAnswer.trim().toLowerCase(), 10);
    }

    user.recoveryCodeHash = recoveryCodeHash;
    await updateUser(user);

    return NextResponse.json({
      success: true,
      recoveryCode: newRecoveryCode,
      securityQuestion: user.securityQuestion,
      message: "New Recovery Key generated successfully!",
    });
  } catch (error) {
    console.error("Recovery kit update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
