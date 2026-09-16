import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: {
    default: "LinkFlare — Free URL Shortener with Analytics",
    template: "%s | LinkFlare",
  },
  description:
    "LinkFlare is the world's most advanced free URL shortener. Get custom aliases, QR codes, expiry dates, password protection, and real-time analytics — all for free.",
  keywords: [
    "url shortener", "free link shortener", "custom alias", "qr code generator",
    "link analytics", "short url", "bitly alternative", "linkflare",
  ],
  authors: [{ name: "V.P.R. Lakshan Vidanapathirana", url: "https://lakshan.vercel.app/" }],
  openGraph: {
    type: "website",
    title: "LinkFlare — Free URL Shortener with Analytics",
    description: "Shorten, track, and manage your links. Free forever.",
    siteName: "LinkFlare",
  },
  twitter: {
    card: "summary_large_image",
    title: "LinkFlare — Free URL Shortener",
    description: "Shorten, track, and manage your links. Free forever.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="noise">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
