import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://linkflare.netlify.app";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/signup"],
        disallow: ["/dashboard", "/api/", "/protected/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
