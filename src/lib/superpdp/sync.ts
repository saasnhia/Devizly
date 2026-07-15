import type { SupabaseClient } from "@supabase/supabase-js";
import { listInvoiceEvents, type SuperPdpInvoiceEvent } from "./client";
import { mapConnectionRow, getValidAccessToken } from "./connection";

// Safety cap so a single connection can't loop forever if the API misbehaves
// (e.g. has_after never turning false).
const MAX_PAGES_PER_CONNECTION = 20;

export interface SuperPdpSyncResult {
  connectionsSynced: number;
  eventsProcessed: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = SupabaseClient<any, any, any>;

/**
 * Polls GET /v1.beta/invoice_events from a connection's stored cursor
 * onward, persists new events, and advances that connection's cursor.
 * SUPER PDP has no webhook mechanism ("la doc ne prévoit pas de webhook")
 * — this is the only way to learn about lifecycle status changes
 * (fr:200..fr:213/fr:501).
 *
 * Multi-tenant: each Devizly user has their own SUPER PDP connection (own
 * access_token, own /invoice_events feed, own cursor) — there is no more
 * single shared feed to poll, so this syncs ONE connection's events and
 * returns the count. Callers loop over connections as needed.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function syncOneConnection(db: AnySupabaseClient, row: any): Promise<number> {
  const connection = mapConnectionRow(row);
  const token = await getValidAccessToken(db, connection);

  let cursor = row.last_event_id ?? 0;
  let eventsProcessed = 0;
  let hasAfter = true;
  let pages = 0;

  while (hasAfter && pages < MAX_PAGES_PER_CONNECTION) {
    pages++;
    const page = await listInvoiceEvents(token, cursor);
    const events = page.data || [];
    if (events.length === 0) break;

    for (const event of events) {
      await persistEvent(db, event);
      eventsProcessed++;
      if (event.id > cursor) cursor = event.id;
    }

    hasAfter = !!page.has_after;
  }

  await db
    .from("superpdp_connections")
    .update({ last_event_id: cursor, last_synced_at: new Date().toISOString() })
    .eq("id", row.id);

  return eventsProcessed;
}

async function persistEvent(db: AnySupabaseClient, event: SuperPdpInvoiceEvent) {
  const { data: transmission } = await db
    .from("superpdp_transmissions")
    .select("id, invoice_id")
    .eq("superpdp_invoice_id", String(event.invoice_id))
    .maybeSingle();

  if (!transmission) {
    // Event for an invoice we have no local transmission row for (e.g. sent
    // before this integration existed) — nothing local to attach it to.
    return;
  }

  await db.from("superpdp_events").upsert(
    {
      transmission_id: transmission.id,
      invoice_id: transmission.invoice_id,
      superpdp_event_id: event.id,
      status_code: event.status_code,
      reason_code: event.reason_code ?? null,
      message: event.message ?? null,
      direction: "in",
      event_date: event.event_date ?? null,
      payload_raw: event,
    },
    { onConflict: "superpdp_event_id" }
  );

  await db
    .from("superpdp_transmissions")
    .update({ last_synced_at: new Date().toISOString() })
    .eq("id", transmission.id);
}

/** Syncs every active SUPER PDP connection — used by the scheduled cron. */
export async function syncSuperpdpEvents(db: AnySupabaseClient): Promise<SuperPdpSyncResult> {
  const { data: connections } = await db.from("superpdp_connections").select("*");

  let connectionsSynced = 0;
  let eventsProcessed = 0;

  for (const row of connections || []) {
    try {
      eventsProcessed += await syncOneConnection(db, row);
      connectionsSynced++;
    } catch (err) {
      console.error(
        `[superpdp sync] Failed for connection ${row.id}:`,
        err instanceof Error ? err.message : err
      );
    }
  }

  return { connectionsSynced, eventsProcessed };
}

/** Syncs a single user's connection — used by the manual "Rafraîchir" button. */
export async function syncSuperpdpEventsForUser(
  db: AnySupabaseClient,
  userId: string
): Promise<SuperPdpSyncResult> {
  const { data: row } = await db
    .from("superpdp_connections")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (!row) return { connectionsSynced: 0, eventsProcessed: 0 };

  const eventsProcessed = await syncOneConnection(db, row);
  return { connectionsSynced: 1, eventsProcessed };
}
