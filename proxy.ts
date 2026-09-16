import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { getLink } from "@/lib/redis";
import { RESERVED_SLUGS } from "@/lib/utils";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── 1. Protect Dashboard routes ─────────────────────────────────────────
  if (pathname.startsWith("/dashboard")) {
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // ─── 2. Skip non-slug paths ───────────────────────────────────────────────
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/protected") ||
    pathname.startsWith("/expired") ||
    pathname === "/" ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // ─── 3. Handle Short URL redirection ─────────────────────────────────────
  const slug = pathname.slice(1);
  if (!slug || slug.includes("/") || RESERVED_SLUGS.has(slug)) {
    return NextResponse.next();
  }

  const link = await getLink(slug);
  if (!link) {
    return NextResponse.next(); // Falls through to Next.js 404
  }

  // Check expiry by date
  if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
    return NextResponse.redirect(new URL(`/expired?slug=${slug}`, request.url));
  }

  // Check expiry by click limit
  if (link.clickLimit !== null && link.clicks >= link.clickLimit) {
    return NextResponse.redirect(new URL(`/expired?slug=${slug}&reason=clicks`, request.url));
  }

  // Check password protection
  if (link.password) {
    const pwCookie = request.cookies.get(`pw_${slug}`)?.value;
    if (!pwCookie || pwCookie !== "verified") {
      return NextResponse.redirect(new URL(`/protected/${slug}`, request.url));
    }
  }

  // Track click asynchronously (fire-and-forget via API)
  const trackUrl = new URL("/api/track", request.url);
  fetch(trackUrl.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": request.headers.get("x-forwarded-for") || "",
      "user-agent": request.headers.get("user-agent") || "",
      "referer": request.headers.get("referer") || "",
      "x-nf-geo-country": request.headers.get("x-nf-geo-country") || "",
      "x-nf-geo-city": request.headers.get("x-nf-geo-city") || "",
    },
    body: JSON.stringify({ slug }),
  }).catch(() => {/* silent fail */});

  // Redirect!
  return NextResponse.redirect(new URL(link.longUrl), {
    status: 307,
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
