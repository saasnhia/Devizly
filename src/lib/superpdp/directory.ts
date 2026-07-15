import type { SupabaseClient } from "@supabase/supabase-js";
import { checkDirectoryEntry } from "./client";

// 14 days: real annuaire registrations trickle in slowly ahead of the
// Sept 2026 mandate — no need to hit the API on every check, but frequent
// enough to catch a client connecting mid-transition.
const TTL_MS = 14 * 24 * 60 * 60 * 1000;

export interface DirectoryStatus {
  registered: boolean | null; // null = unknown (never checked, check failed, or no usable SIREN)
  checkedAt: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = SupabaseClient<any, any, any>;

interface DirectoryEntry {
  is_active?: boolean;
  [key: string]: unknown;
}

/**
 * Returns a client's e-invoicing directory status, using the cached
 * clients.directory_registered/directory_checked_at columns when fresh.
 * Refreshes (and persists) when stale or never checked. Shared by
 * send-superpdp (checks before sending) and the on-demand
 * /api/clients/[id]/directory-check route (manual "Revérifier" + lazy
 * refresh) — never called per-row on the invoices list, to avoid N+1
 * calls to the SUPER PDP API on every page render.
 */
export async function getClientDirectoryStatus(
  db: AnySupabaseClient,
  token: string,
  clientId: string
): Promise<DirectoryStatus> {
  const { data: client } = await db
    .from("clients")
    .select("siret, directory_registered, directory_checked_at")
    .eq("id", clientId)
    .single();

  if (!client) return { registered: null, checkedAt: null };

  const checkedAtMs = client.directory_checked_at
    ? new Date(client.directory_checked_at).getTime()
    : 0;
  const isFresh = checkedAtMs > 0 && Date.now() - checkedAtMs < TTL_MS;

  if (isFresh) {
    return { registered: client.directory_registered, checkedAt: client.directory_checked_at };
  }

  const siren = (client.siret || "").replace(/\s/g, "").slice(0, 9);
  if (siren.length !== 9) {
    // No usable SIREN to check — leave unknown rather than caching a
    // misleading "not registered".
    return { registered: null, checkedAt: null };
  }

  let registered: boolean;
  try {
    const directory = await checkDirectoryEntry(token, siren);
    const entries = (directory.data || []) as DirectoryEntry[];
    // A present-but-inactive line (NBHC's own real entry, blocked by the
    // Tiime conflict, is exactly this) doesn't count as routable.
    registered = entries.some((entry) => entry.is_active !== false);
  } catch (err) {
    console.warn(
      `[directory] Check failed for client ${clientId}:`,
      err instanceof Error ? err.message : err
    );
    // Don't cache a transient failure as a definitive "not registered" —
    // leave unknown so the next attempt retries instead of getting stuck.
    return { registered: null, checkedAt: null };
  }

  const now = new Date().toISOString();
  await db
    .from("clients")
    .update({ directory_registered: registered, directory_checked_at: now })
    .eq("id", clientId);

  return { registered, checkedAt: now };
}
