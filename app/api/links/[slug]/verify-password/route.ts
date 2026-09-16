import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getLink } from "@/lib/redis";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { password } = await request.json();

  const link = await getLink(slug);
  if (!link || !link.password) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const valid = await bcrypt.compare(password, link.password);
  if (!valid) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true, longUrl: link.longUrl });
  response.cookies.set({
    name: `pw_${slug}`,
    value: "verified",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });
  return response;
}
