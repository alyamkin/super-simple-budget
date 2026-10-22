const FALLBACK_SITE_URL = "http://localhost:3000";

/** The public origin for absolute URLs (`NEXT_PUBLIC_SITE_URL`, else localhost). */
export function siteUrl(): URL {
  return new URL(process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_SITE_URL);
}
