import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { getUserByEmail, createUser } from "@/lib/redis";
import { signJWT, createSessionCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // Validate
    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    // Check if email already exists
    const existing = await getUserByEmail(email.toLowerCase());
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    // Hash password and create user
    const passwordHash = await bcrypt.hash(password, 12);
    const userId = uuidv4();
    const user = {
      id: userId,
      email: email.toLowerCase(),
      name: name.trim(),
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    await createUser(user);

    // Sign JWT and set cookie
    const token = await signJWT({ userId, email: user.email, name: user.name });
    const cookie = createSessionCookie(token);

    const response = NextResponse.json({
      success: true,
      user: { id: userId, email: user.email, name: user.name },
    });
    response.cookies.set(cookie);
    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
