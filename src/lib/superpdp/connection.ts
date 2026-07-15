// Per-user SUPER PDP connection storage + token refresh. Separate from
// client.ts (pure HTTP) because refreshing requires reading/writing the
// user's encrypted tokens in Supabase — a DB-shaped concern, not an HTTP one.

import type { SupabaseClient } from "@supabase/supabase-js";
import { encrypt, decrypt } from "@/lib/crypto";
import { refreshAccessToken } from "./client";

export interface SuperPdpConnection {
  id: string;
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // epoch ms
  companySiren: string | null;
  companyNumberScheme: string | null;
  companyName: string | null;
  companyEnv: string | null;
  lastEventId: number;
}

interface SuperPdpConnectionRow {
  id: string;
  user_id: string;
  access_token_encrypted: string;
  refresh_token_encrypted: string;
  expires_at: string;
  company_siren: string | null;
  company_number_scheme: string | null;
  company_name: string | null;
  company_env: string | null;
  last_event_id: number;
}

export function mapConnectionRow(row: SuperPdpConnectionRow): SuperPdpConnection {
  return {
    id: row.id,
    userId: row.user_id,
    accessToken: decrypt(row.access_token_encrypted),
    refreshToken: decrypt(row.refresh_token_encrypted),
    expiresAt: new Date(row.expires_at).getTime(),
    companySiren: row.company_siren,
    companyNumberScheme: row.company_number_scheme,
    companyName: row.company_name,
    companyEnv: row.company_env,
    lastEventId: row.last_event_id,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = SupabaseClient<any, any, any>;

export async function loadConnection(
  db: AnySupabaseClient,
  userId: string
): Promise<SuperPdpConnection | null> {
  const { data } = await db
    .from("superpdp_connections")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) return null;
  return mapConnectionRow(data as SuperPdpConnectionRow);
}

/**
 * Returns a valid access_token for this connection, refreshing (and
 * immediately persisting the rotated refresh_token) if the current one is
 * expired or near-expiry.
 */
export async function getValidAccessToken(
  db: AnySupabaseClient,
  connection: SuperPdpConnection
): Promise<string> {
  if (connection.expiresAt > Date.now() + 30_000) {
    return connection.accessToken;
  }

  const refreshed = await refreshAccessToken(connection.refreshToken);

  await db
    .from("superpdp_connections")
    .update({
      access_token_encrypted: encrypt(refreshed.accessToken),
      refresh_token_encrypted: encrypt(refreshed.refreshToken),
      expires_at: new Date(refreshed.expiresAt).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", connection.id);

  // Keep the in-memory copy consistent in case the caller reuses `connection`.
  connection.accessToken = refreshed.accessToken;
  connection.refreshToken = refreshed.refreshToken;
  connection.expiresAt = refreshed.expiresAt;

  return refreshed.accessToken;
}
