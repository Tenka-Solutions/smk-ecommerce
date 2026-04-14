import { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin", "/mi-cuenta"],
      },
    ],
    sitemap: `${env.siteUrl}/sitemap.xml`,
  };
}
