import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getLink } from "@/lib/redis";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string | string[] }> }
) {
  try {
    const rawSlug = (await params).slug;
    const slug = Array.isArray(rawSlug) ? rawSlug.join("/") : rawSlug;
    const { password } = await request.json();

    if (!slug) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    const link = await getLink(slug);
    if (!link || !link.password) {
      return NextResponse.json({ error: "Link not found or not password protected" }, { status: 404 });
    }

    const valid = await bcrypt.compare(password || "", link.password);
    if (!valid) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }

    const cookieKey = `pw_${slug.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
    const response = NextResponse.json({ success: true, longUrl: link.longUrl });
    response.cookies.set({
      name: cookieKey,
      value: "verified",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error("Verify password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
