import { NextRequest, NextResponse } from "next/server";
import { getLink } from "@/lib/redis";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

  const link = await getLink(slug);
  if (link) {
    return NextResponse.json({ available: false });
  }
  return NextResponse.json({ available: true });
}
