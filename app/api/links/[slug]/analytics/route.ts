import { NextRequest, NextResponse } from "next/server";
import { getClickEvents, getLink } from "@/lib/redis";
import { getCurrentUser } from "@/lib/auth";
import { ClickEvent } from "@/lib/redis";

function groupByDay(events: ClickEvent[]): { date: string; clicks: number }[] {
  const map = new Map<string, number>();
  events.forEach((e) => {
    const day = e.timestamp.slice(0, 10); // YYYY-MM-DD
    map.set(day, (map.get(day) || 0) + 1);
  });
  // Fill last 30 days
  const result: { date: string; clicks: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    result.push({ date: key, clicks: map.get(key) || 0 });
  }
  return result;
}

function topN<T extends string>(arr: T[], n = 8): { name: string; value: number }[] {
  const map = new Map<string, number>();
  arr.forEach((v) => map.set(v, (map.get(v) || 0) + 1));
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name, value]) => ({ name, value }));
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  const link = await getLink(slug);
  if (!link) return NextResponse.json({ error: "Link not found" }, { status: 404 });
  if (link.userId !== user.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const events = await getClickEvents(slug, 1000);

  const analytics = {
    totalClicks: link.clicks,
    clicksOverTime: groupByDay(events),
    topCountries: topN(events.map((e) => e.country)),
    topReferrers: topN(events.map((e) => e.referrer)),
    devices: topN(events.map((e) => e.device)),
    browsers: topN(events.map((e) => e.browser)),
    os: topN(events.map((e) => e.os)),
    recentClicks: events.slice(0, 20),
  };

  return NextResponse.json({ analytics, link });
}
