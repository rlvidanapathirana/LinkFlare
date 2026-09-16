import { Redis } from "@upstash/redis";

// Singleton Redis client — works in both Edge and Node.js runtimes
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// ─── Type Definitions ──────────────────────────────────────────────────────

export interface LinkData {
  slug: string;
  longUrl: string;
  userId: string | null;
  createdAt: string;           // ISO string
  expiresAt: string | null;    // ISO string or null
  clickLimit: number | null;   // null = unlimited
  password: string | null;     // bcrypt hash or null
  clicks: number;
  title: string | null;        // page title of destination
}

export interface UserData {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
}

export interface ClickEvent {
  timestamp: string;
  country: string;
  city: string;
  referrer: string;
  device: string;    // mobile | desktop | tablet
  browser: string;
  os: string;
  ip: string;
}

// ─── Key Helpers ───────────────────────────────────────────────────────────

export const keys = {
  link: (slug: string) => `link:${slug}`,
  user: (userId: string) => `user:${userId}`,
  userEmail: (email: string) => `user_email:${email}`,
  userLinks: (userId: string) => `user_links:${userId}`,
  clicks: (slug: string) => `clicks:${slug}`,
};

// ─── Link Helpers ──────────────────────────────────────────────────────────

export async function getLink(slug: string): Promise<LinkData | null> {
  const data = await redis.get<LinkData>(keys.link(slug));
  return data;
}

export async function setLink(slug: string, data: LinkData): Promise<void> {
  await redis.set(keys.link(slug), JSON.stringify(data));
  if (data.userId) {
    await redis.sadd(keys.userLinks(data.userId), slug);
  }
}

export async function deleteLink(slug: string, userId: string): Promise<void> {
  await redis.del(keys.link(slug));
  await redis.del(keys.clicks(slug));
  await redis.srem(keys.userLinks(userId), slug);
}

export async function incrementClicks(slug: string): Promise<void> {
  const link = await getLink(slug);
  if (!link) return;
  link.clicks = (link.clicks || 0) + 1;
  await redis.set(keys.link(slug), JSON.stringify(link));
}

export async function trackClick(slug: string, event: ClickEvent): Promise<void> {
  // Push to Redis list, keep last 10,000 events
  await redis.lpush(keys.clicks(slug), JSON.stringify(event));
  await redis.ltrim(keys.clicks(slug), 0, 9999);
  await incrementClicks(slug);
}

export async function getClickEvents(slug: string, limit = 1000): Promise<ClickEvent[]> {
  const raw = await redis.lrange<string>(keys.clicks(slug), 0, limit - 1);
  return raw.map((item) => {
    if (typeof item === "string") return JSON.parse(item) as ClickEvent;
    return item as unknown as ClickEvent;
  });
}

export async function getUserLinks(userId: string): Promise<LinkData[]> {
  const slugs = await redis.smembers<string[]>(keys.userLinks(userId));
  if (!slugs || slugs.length === 0) return [];

  const links = await Promise.all(
    slugs.map((slug) => getLink(slug as string))
  );
  return links.filter(Boolean) as LinkData[];
}

// ─── User Helpers ──────────────────────────────────────────────────────────

export async function getUserById(userId: string): Promise<UserData | null> {
  return redis.get<UserData>(keys.user(userId));
}

export async function getUserByEmail(email: string): Promise<UserData | null> {
  const userId = await redis.get<string>(keys.userEmail(email));
  if (!userId) return null;
  return getUserById(userId);
}

export async function createUser(user: UserData): Promise<void> {
  await redis.set(keys.user(user.id), JSON.stringify(user));
  await redis.set(keys.userEmail(user.email), user.id);
}
