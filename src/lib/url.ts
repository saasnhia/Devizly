/**
 * Returns the canonical site URL.
 * - Server: reads NEXT_PUBLIC_SITE_URL or NEXT_PUBLIC_APP_URL
 * - Falls back to https://devizly.fr in production
 */
export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://devizly.fr"
  );
}
