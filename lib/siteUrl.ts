const FALLBACK_SITE_URL = "http://localhost:3000";

/**
 * The public origin for absolute URLs: `NEXT_PUBLIC_SITE_URL`, else the
 * Vercel production domain (`VERCEL_PROJECT_PRODUCTION_URL`, set on every
 * Vercel build, previews included), else localhost.
 */
export function siteUrl(): URL {
  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
      (vercelHost ? `https://${vercelHost}` : FALLBACK_SITE_URL),
  );
}
