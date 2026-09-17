import { UAParser } from "ua-parser-js";
import { ClickEvent } from "./redis";
import { NextRequest } from "next/server";

// Generate a random Base62 slug
const BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function generateSlug(length = 6): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += BASE62[Math.floor(Math.random() * 62)];
  }
  return result;
}

// Validate a URL
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

// Validate custom slug (alphanumeric + dash + underscore + allowed prefixes)
export function isValidSlug(slug: string): boolean {
  return /^(s\/|sh\/|link\/|LinkFlare\/|go\/|to\/|visit\/|get\/|click\/)?[a-zA-Z0-9_-]{3,32}$/.test(slug);
}

// Reserved slugs that cannot be used as custom back-halves
export const RESERVED_SLUGS = new Set([
  "api", "dashboard", "login", "signup", "logout",
  "protected", "expired", "not-found", "_next", "favicon.ico",
  "robots.txt", "sitemap.xml", "404", "500",
]);

// Parse click analytics from a request
export function parseClickEvent(request: NextRequest): ClickEvent {
  const ua = request.headers.get("user-agent") || "";
  const parser = new UAParser(ua);
  const result = parser.getResult();

  // Geo from Netlify edge headers (x-nf-geo-*) or Cloudflare (cf-ipcountry)
  const country = request.headers.get("x-nf-geo-country") ||
    request.headers.get("cf-ipcountry") ||
    "Unknown";
  const city = request.headers.get("x-nf-geo-city") ||
    request.headers.get("x-vercel-ip-city") ||
    "Unknown";

  // Referrer parsing
  const refHeader = request.headers.get("referer") || "";
  let referrer = "Direct";
  if (refHeader) {
    try {
      const refUrl = new URL(refHeader);
      const host = refUrl.hostname.replace("www.", "");
      if (host.includes("google")) referrer = "Google";
      else if (host.includes("facebook") || host.includes("fb.com")) referrer = "Facebook";
      else if (host.includes("twitter") || host.includes("x.com")) referrer = "Twitter/X";
      else if (host.includes("instagram")) referrer = "Instagram";
      else if (host.includes("linkedin")) referrer = "LinkedIn";
      else if (host.includes("youtube")) referrer = "YouTube";
      else if (host.includes("reddit")) referrer = "Reddit";
      else if (host.includes("tiktok")) referrer = "TikTok";
      else if (host.includes("whatsapp")) referrer = "WhatsApp";
      else referrer = host || "Other";
    } catch {
      referrer = "Other";
    }
  }

  // Device type
  const deviceType = result.device.type;
  let device = "Desktop";
  if (deviceType === "mobile") device = "Mobile";
  else if (deviceType === "tablet") device = "Tablet";

  const browser = result.browser.name || "Unknown";
  const os = result.os.name || "Unknown";
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "Unknown";

  return {
    timestamp: new Date().toISOString(),
    country: country as string,
    city: city as string,
    referrer,
    device,
    browser,
    os,
    ip: ip as string,
  };
}

// Format number with K/M suffix
export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

// Build the short URL from a slug
export function buildShortUrl(slug: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  return `${base}/${slug}`;
}
