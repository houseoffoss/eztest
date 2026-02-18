import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/seo.config";

/**
 * Dynamic robots.txt generation for EZTest.
 * Allows crawling of public pages while blocking authenticated / API routes.
 * Includes llms.txt reference for GEO (Generative Engine Optimization).
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/houseoffoss",
          "/privacy",
          "/auth/login",
          "/auth/register",
          "/llms.txt",
          "/llms-full.txt",
        ],
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
    // NOTE: robots() MetadataRoute doesn't support arbitrary fields,
    // so the llms.txt reference is added via the route handler at /api/robots-geo
    // and through the <link> tag in the root layout.
  };
}

