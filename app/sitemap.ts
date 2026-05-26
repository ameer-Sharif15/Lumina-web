import type { MetadataRoute } from "next";
import { getSiteOrigin } from "@/lib/get-site-origin";

/**
 * Sitemap URLs must use the same host as your Google Search Console property.
 * Prefer NEXT_PUBLIC_SITE_URL so www vs non-www matches GSC exactly.
 */
export const dynamic = "force-dynamic";

const staticPaths = [
  "",
  "/features",
  "/how-it-works",
  "/pricing",
  "/faqs",
  "/contact",
  "/privacy-policy",
  "/terms-of-service",
  "/auth/login",
  "/auth/register",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = await getSiteOrigin();
  const lastModified = new Date();

  return staticPaths.map((path) => ({
    url: `${base}${path || "/"}`,
    lastModified,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.8,
  }));
}
