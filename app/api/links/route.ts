import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getLink, setLink, getUserLinks } from "@/lib/redis";
import { getCurrentUser } from "@/lib/auth";
import {
  generateSlug,
  isValidUrl,
  isValidSlug,
  RESERVED_SLUGS,
  buildShortUrl,
} from "@/lib/utils";

// GET: List all links for the authenticated user
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const links = await getUserLinks(user.userId);
  const sorted = links.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return NextResponse.json({ links: sorted });
}

// POST: Create a new short link
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  // We allow anonymous link creation, so we don't return 401 here anymore.

  try {
    const body = await request.json();
    const { longUrl, customSlug, prefix = "", expiresAt, clickLimit, password } = body;

    // Validate long URL
    if (!longUrl || !isValidUrl(longUrl)) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // Validate prefix
    const allowedPrefixes = ["", "s/", "sh/", "link/", "LinkFlare/", "go/", "to/", "visit/", "get/", "click/"];
    if (!allowedPrefixes.includes(prefix)) {
      return NextResponse.json({ error: "Invalid prefix" }, { status: 400 });
    }

    // Determine slug
    let slug = customSlug?.trim();
    if (slug) {
      slug = `${prefix}${slug}`;
      if (!isValidSlug(slug)) {
        return NextResponse.json(
          { error: "Slug must be 3-32 chars: letters, numbers, dash, underscore only" },
          { status: 400 }
        );
      }
      if (RESERVED_SLUGS.has(slug)) {
        return NextResponse.json({ error: "This alias is reserved" }, { status: 400 });
      }
      const existing = await getLink(slug);
      if (existing) {
        return NextResponse.json({ error: "This alias is already taken" }, { status: 409 });
      }
    } else {
      // Auto-generate unique slug
      let attempts = 0;
      do {
        slug = `${prefix}${generateSlug(6)}`;
        attempts++;
      } while ((await getLink(slug)) && attempts < 10);
    }

    // Hash password if provided
    let passwordHash: string | null = null;
    if (password && password.trim()) {
      passwordHash = await bcrypt.hash(password.trim(), 10);
    }

    // Parse expiry
    const expiryDate: string | null = expiresAt ? new Date(expiresAt).toISOString() : null;
    const limit: number | null = clickLimit ? parseInt(clickLimit, 10) : null;

    const linkData = {
      slug,
      longUrl,
      userId: user ? user.userId : null,
      createdAt: new Date().toISOString(),
      expiresAt: expiryDate,
      clickLimit: limit,
      password: passwordHash,
      clicks: 0,
      title: null,
    };

    await setLink(slug, linkData);

    const shortUrl = buildShortUrl(slug, request);
    return NextResponse.json({ success: true, slug, shortUrl, link: linkData }, { status: 201 });
  } catch (error) {
    console.error("Create link error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
