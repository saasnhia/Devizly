import crypto from "crypto";

/**
 * HMAC-signed tokens for marketing email unsubscribe links.
 * Uses EMAIL_UNSUBSCRIBE_SECRET (or falls back to CRON_SECRET to avoid
 * adding a new required env var on existing deployments).
 *
 * Format: base64url(`${userId}.${hmacShort}`)
 *   - hmacShort = first 16 bytes (32 hex chars) of HMAC-SHA256(userId, secret)
 *   - constant-time compare on verify to prevent timing attacks
 */

function getSecret(): string {
  const s =
    process.env.EMAIL_UNSUBSCRIBE_SECRET || process.env.CRON_SECRET;
  if (!s) {
    throw new Error(
      "EMAIL_UNSUBSCRIBE_SECRET (or CRON_SECRET fallback) is not set"
    );
  }
  return s;
}

export function signUnsubscribeToken(userId: string): string {
  const sig = crypto
    .createHmac("sha256", getSecret())
    .update(userId)
    .digest("hex")
    .slice(0, 32);
  return Buffer.from(`${userId}.${sig}`, "utf8").toString("base64url");
}

export function verifyUnsubscribeToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const dotIdx = decoded.lastIndexOf(".");
    if (dotIdx <= 0) return null;
    const userId = decoded.slice(0, dotIdx);
    const sig = decoded.slice(dotIdx + 1);
    const expected = crypto
      .createHmac("sha256", getSecret())
      .update(userId)
      .digest("hex")
      .slice(0, 32);
    if (sig.length !== expected.length) return null;
    if (
      !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
    ) {
      return null;
    }
    return userId;
  } catch {
    return null;
  }
}
