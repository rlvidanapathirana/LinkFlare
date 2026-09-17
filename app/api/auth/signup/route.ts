import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { getUserByEmail, createUser } from "@/lib/redis";
import { signJWT, createSessionCookie } from "@/lib/auth";

function generateRecoveryCode(): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // No confusing chars (0, O, 1, I)
  const segment = (len: number) => {
    let s = "";
    for (let i = 0; i < len; i++) {
      s += chars[Math.floor(Math.random() * chars.length)];
    }
    return s;
  };
  return `LF-${segment(4)}-${segment(4)}-${segment(4)}-${segment(4)}`;
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, securityQuestion, securityAnswer } = await request.json();

    // Validate
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }
    if (!securityQuestion || !securityAnswer || !securityAnswer.trim()) {
      return NextResponse.json({ error: "Security question and answer are required for account recovery" }, { status: 400 });
    }

    // Check if email already exists
    const existing = await getUserByEmail(email.toLowerCase());
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    // Hash password and security details
    const passwordHash = await bcrypt.hash(password, 12);
    const securityAnswerHash = await bcrypt.hash(securityAnswer.trim().toLowerCase(), 10);
    
    // Generate unique recovery code & hash it
    const recoveryCode = generateRecoveryCode();
    const recoveryCodeHash = await bcrypt.hash(recoveryCode.replace(/-/g, "").toUpperCase(), 10);

    const userId = uuidv4();
    const user = {
      id: userId,
      email: email.toLowerCase(),
      name: name.trim(),
      passwordHash,
      createdAt: new Date().toISOString(),
      securityQuestion,
      securityAnswerHash,
      recoveryCodeHash,
    };

    await createUser(user);

    // Sign JWT and set cookie
    const token = await signJWT({ userId, email: user.email, name: user.name });
    const cookie = createSessionCookie(token);

    const response = NextResponse.json({
      success: true,
      user: { id: userId, email: user.email, name: user.name },
      recoveryCode,
      securityQuestion,
    });
    response.cookies.set(cookie);
    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
