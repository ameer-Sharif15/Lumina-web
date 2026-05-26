import { headers } from "next/headers";

function trimTrailingSlash(u: string) {
  return u.endsWith("/") ? u.slice(0, -1) : u;
}

/**
 * Canonical site origin for sitemap, robots, and metadata.
 * Prefer NEXT_PUBLIC_SITE_URL in production so it matches Google Search Console (www vs apex).
 */
export async function getSiteOrigin(): Promise<string> {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    return trimTrailingSlash(
      explicit.startsWith("http") ? explicit : `https://${explicit}`,
    );
  }

  const h = await headers();
  const hostRaw = h.get("x-forwarded-host") ?? h.get("host");
  if (hostRaw) {
    const host = hostRaw.split(",")[0].trim();
    const proto = (h.get("x-forwarded-proto") ?? "https")
      .split(",")[0]
      .trim();
    if (host) {
      return trimTrailingSlash(`${proto}://${host}`);
    }
  }

  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (production) {
    return trimTrailingSlash(
      production.startsWith("http") ? production : `https://${production}`,
    );
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }

  return "http://localhost:3000";
}
