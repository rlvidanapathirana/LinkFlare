import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getLink, trackClick } from "@/lib/redis";
import { RESERVED_SLUGS } from "@/lib/utils";

interface Props {
  params: Promise<{ slug: string[] }>;
}

export default async function ShortLinkPage({ params }: Props) {
  const { slug: slugSegments } = await params;
  if (!slugSegments || slugSegments.length === 0) {
    notFound();
  }

  const slug = slugSegments.join("/");

  if (RESERVED_SLUGS.has(slug)) {
    notFound();
  }

  const link = await getLink(slug);
  if (!link) {
    notFound();
  }

  // Check expiry by date
  if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
    redirect(`/expired?slug=${encodeURIComponent(slug)}&reason=date`);
  }

  // Check expiry by clicks
  if (link.clickLimit !== null && link.clicks >= link.clickLimit) {
    redirect(`/expired?slug=${encodeURIComponent(slug)}&reason=clicks`);
  }

  // Check password protection
  if (link.password) {
    const cookieStore = await cookies();
    const cookieKey = `pw_${slug.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
    const pwCookie = cookieStore.get(cookieKey)?.value;
    if (!pwCookie || pwCookie !== "verified") {
      redirect(`/protected/${slug}`);
    }
  }

  // Track click
  try {
    await trackClick(slug, {
      timestamp: new Date().toISOString(),
      country: "Unknown",
      city: "Unknown",
      referrer: "Direct",
      device: "Desktop",
      browser: "Unknown",
      os: "Unknown",
      ip: "Unknown",
    });
  } catch {
    // ignore
  }

  redirect(link.longUrl);
}
