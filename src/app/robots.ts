import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/dashboard/",
        "/settings/",
        "/feedback/",
        "/qr-studio/",
        "/onboarding/",
        "/admin-vault/",
        "/admin/",
      ],
    },
    sitemap: "https://review.welurik.com/sitemap.xml",
  };
}
