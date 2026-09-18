import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getLink } from "@/lib/redis";
import AnalyticsClient from "./AnalyticsClient";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: slugSegments } = await params;
  const slug = slugSegments ? slugSegments.join("/") : "";
  return {
    title: `Analytics: ${slug} — LinkFlare`,
    description: `View click analytics for your link /${slug}`,
  };
}

export default async function AnalyticsPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { slug: slugSegments } = await params;
  if (!slugSegments || slugSegments.length === 0) notFound();

  const slug = slugSegments.join("/");
  const link = await getLink(slug);
  if (!link) notFound();
  if (link.userId && link.userId !== user.userId) redirect("/dashboard");

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  return <AnalyticsClient slug={slug} baseUrl={baseUrl} />;
}
