import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "LinkFlare — Free URL Shortener with Analytics & QR Codes",
  description:
    "The world's most advanced free URL shortener. Get custom aliases, QR codes, link expiry, password protection, and real-time analytics. No credit card, forever free.",
};

export default function HomePage() {
  return <HomeClient />;
}
