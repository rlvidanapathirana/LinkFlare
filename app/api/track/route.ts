import { NextRequest, NextResponse } from "next/server";
import { trackClick } from "@/lib/redis";
import { parseClickEvent } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const { slug } = await request.json();
    if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

    const event = parseClickEvent(request);
    await trackClick(slug, event);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Track error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
