import { NextRequest, NextResponse } from "next/server";
import { getLink, setLink, deleteLink } from "@/lib/redis";
import { getCurrentUser } from "@/lib/auth";
import { isValidUrl } from "@/lib/utils";

// PUT: Edit a link
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  const link = await getLink(slug);

  if (!link) return NextResponse.json({ error: "Link not found" }, { status: 404 });
  if (link.userId !== user.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { longUrl, expiresAt, clickLimit } = await request.json();

  if (longUrl && !isValidUrl(longUrl)) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const updated = {
    ...link,
    longUrl: longUrl || link.longUrl,
    expiresAt: expiresAt !== undefined ? (expiresAt ? new Date(expiresAt).toISOString() : null) : link.expiresAt,
    clickLimit: clickLimit !== undefined ? (clickLimit ? parseInt(clickLimit, 10) : null) : link.clickLimit,
  };

  await setLink(slug, updated);
  return NextResponse.json({ success: true, link: updated });
}

// DELETE: Remove a link
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  const link = await getLink(slug);

  if (!link) return NextResponse.json({ error: "Link not found" }, { status: 404 });
  if (link.userId !== user.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await deleteLink(slug, user.userId);
  return NextResponse.json({ success: true });
}
