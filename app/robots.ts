import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/seo.config";

/**
 * Dynamic robots.txt generation for EZTest.
 * Allows crawling of public pages while blocking authenticated / API routes.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/houseoffoss", "/privacy", "/auth/login", "/auth/register"],
        disallow: [
          "/api/",
          "/dashboard/",
          "/projects/",
          "/admin/",
          "/settings/",
          "/profile/",
          "/auth/error",
          "/auth/forgot-password",
          "/auth/reset-password",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

