// HTTP client for the SUPER PDP API (Plateforme Agréée immatriculée DGFiP).
// Multi-tenant: OAuth 2.1 authorization_code — one single Devizly-wide OAuth
// application, with each Devizly user's own company connected to it via
// their own access_token/refresh_token (see src/lib/superpdp/connection.ts
// for per-user token storage/refresh).
//
// Spec confirmed directly from https://www.superpdp.tech/documentation/4
// (rendered via headless browser — the site is a JS-only SPA) and the
// official reference implementation https://github.com/superpdp/examples
// (erp.go), since the marketing site's /openapi/ page has no fetchable
// raw spec. No PKCE: not mentioned in the docs, not used in the official
// Go example (plain golang.org/x/oauth2 AuthCodeURL/Exchange, no challenge
// options) — reasonable given this is a confidential (server-side) client.

const BASE_URL = (process.env.SUPERPDP_ENDPOINT || "https://api.superpdp.tech").replace(/\/$/, "");

export class SuperPdpError extends Error {
  httpCode: number;
  responseBody: string;

  constructor(message: string, httpCode = 0, responseBody = "") {
    super(message);
    this.name = "SuperPdpError";
    this.httpCode = httpCode;
    this.responseBody = responseBody;
  }
}

interface SuperPdpTokenResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
}

async function requestToken(params: Record<string, string>): Promise<SuperPdpTokenResponse> {
  const res = await fetch(`${BASE_URL}/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams(params).toString(),
  });

  const bodyText = await res.text();

  if (!res.ok) {
    throw new SuperPdpError(`Échec OAuth SUPER PDP (HTTP ${res.status})`, res.status, bodyText);
  }

  let data: SuperPdpTokenResponse;
  try {
    data = JSON.parse(bodyText);
  } catch {
    throw new SuperPdpError("Réponse OAuth invalide (non-JSON)", res.status, bodyText);
  }

  if (!data.access_token) {
    throw new SuperPdpError("access_token manquant dans la réponse OAuth", res.status, bodyText);
  }

  return data;
}

export interface SuperPdpTokenSet {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // epoch ms
}

export interface AuthorizationUrlOptions {
  redirectUri: string;
  state: string;
  loginHint?: string;
  companyNumber?: string;
  companyNumberScheme?: "sandbox" | "fr_siren" | "be_numero_entreprise";
  /**
   * any = user free to opt into directory registration; send = hides
   * directory registration entirely (Devizly's v1 default — most users
   * already have a PA for reception via their accountant/bank, and forcing
   * registration risks the exact annuaire conflict NBHC hit with Tiime);
   * receive = forces registration.
   */
  sendAndReceive?: "any" | "send" | "receive";
}

/** Builds the /oauth2/authorize URL for the authorization_code flow. */
export function getAuthorizationUrl(opts: AuthorizationUrlOptions): string {
  const clientId = process.env.SUPERPDP_CLIENT_ID;
  if (!clientId) {
    throw new SuperPdpError("SUPERPDP_CLIENT_ID non configuré");
  }

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: opts.redirectUri,
    state: opts.state,
    scope: "", // SUPER PDP: "aucun, laisser vide"
  });

  if (opts.loginHint) params.set("login_hint", opts.loginHint);
  if (opts.companyNumber && opts.companyNumberScheme) {
    params.set("superpdp_company_number", opts.companyNumber);
    params.set("superpdp_company_number_scheme", opts.companyNumberScheme);
  }
  params.set("superpdp_send_and_receive", opts.sendAndReceive || "send");

  return `${BASE_URL}/oauth2/authorize?${params.toString()}`;
}

/** Exchanges an authorization code for an access_token + refresh_token. */
export async function exchangeCodeForToken(
  code: string,
  redirectUri: string
): Promise<SuperPdpTokenSet> {
  const clientId = process.env.SUPERPDP_CLIENT_ID;
  const clientSecret = process.env.SUPERPDP_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new SuperPdpError("Identifiants OAuth SUPER PDP non configurés");
  }

  const data = await requestToken({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
  });

  if (!data.refresh_token) {
    throw new SuperPdpError("Réponse OAuth sans refresh_token (attendu pour authorization_code)");
  }

  return {
    accessToken: data.access_token!,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + (data.expires_in ?? 1800) * 1000,
  };
}

/**
 * Refreshes an access_token. SUPER PDP rotates the refresh_token on every
 * use ("OAuth 2.1 impose la rotation du refresh token à chaque usage") —
 * the caller MUST persist the new refreshToken returned here; the old one
 * becomes invalid immediately.
 */
export async function refreshAccessToken(refreshToken: string): Promise<SuperPdpTokenSet> {
  const clientId = process.env.SUPERPDP_CLIENT_ID;
  const clientSecret = process.env.SUPERPDP_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new SuperPdpError("Identifiants OAuth SUPER PDP non configurés");
  }

  const data = await requestToken({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
  });

  if (!data.refresh_token) {
    throw new SuperPdpError("Réponse de rafraîchissement sans nouveau refresh_token");
  }

  return {
    accessToken: data.access_token!,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + (data.expires_in ?? 1800) * 1000,
  };
}

/**
 * Revokes a token (RFC 7009). Revoking a refresh_token cascades and
 * revokes every access_token derived from it — this is what we call on
 * disconnect.
 */
export async function revokeToken(
  token: string,
  tokenTypeHint: "access_token" | "refresh_token" = "refresh_token"
): Promise<void> {
  const clientId = process.env.SUPERPDP_CLIENT_ID;
  const clientSecret = process.env.SUPERPDP_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new SuperPdpError("Identifiants OAuth SUPER PDP non configurés");
  }

  const res = await fetch(`${BASE_URL}/oauth2/revoke`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      token,
      token_type_hint: tokenTypeHint,
      client_id: clientId,
      client_secret: clientSecret,
    }).toString(),
  });

  if (!res.ok) {
    const bodyText = await res.text();
    throw new SuperPdpError(`Échec de révocation SUPER PDP (HTTP ${res.status})`, res.status, bodyText);
  }
}

interface SuperPdpFetchOptions {
  method?: string;
  body?: BodyInit | null;
  contentType?: string; // set explicitly for raw-body POSTs (e.g. application/pdf)
}

/**
 * Generic authenticated call against the SUPER PDP API. Takes the caller's
 * access_token explicitly — token acquisition/refresh is the caller's
 * responsibility (see connection.ts), since refreshing requires reading
 * and persisting per-user DB state that doesn't belong in a stateless
 * HTTP client.
 */
export async function superpdpFetch<T = unknown>(
  token: string,
  path: string,
  options: SuperPdpFetchOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };
  if (options.contentType) headers["Content-Type"] = options.contentType;

  const res = await fetch(`${BASE_URL}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body ?? undefined,
  });

  const bodyText = await res.text();

  if (!res.ok) {
    let message = `Erreur API SUPER PDP (HTTP ${res.status})`;
    try {
      const decoded = JSON.parse(bodyText);
      if (decoded?.message) message += ` : ${decoded.message}`;
    } catch {
      // not JSON — keep the generic message, raw body still in responseBody
    }
    throw new SuperPdpError(message, res.status, bodyText);
  }

  if (!bodyText) return {} as T;
  try {
    return JSON.parse(bodyText) as T;
  } catch {
    throw new SuperPdpError("Réponse non-JSON reçue de SUPER PDP", res.status, bodyText);
  }
}

export interface SuperPdpCompany {
  number: string | null; // SIREN, when number_scheme === "fr_siren" (or the sandbox id when scheme === "sandbox")
  number_scheme?: string;
  env: "production" | "sandbox" | string;
  formal_name?: string;
  [key: string]: unknown;
}

/** GET /v1.beta/companies/me — confirms token validity + connected company identity. */
export async function getCompanyInfo(token: string): Promise<SuperPdpCompany> {
  return superpdpFetch<SuperPdpCompany>(token, "/v1.beta/companies/me");
}

export interface SuperPdpInvoiceSubmitResponse {
  id: number | string;
  [key: string]: unknown;
}

/**
 * POST /v1.beta/invoices — submits an e-invoice document. The body is the
 * raw file content (NOT multipart/form-data), with Content-Type indicating
 * the format: application/pdf for Factur-X, application/xml for UBL/CII.
 */
export async function submitInvoice(
  token: string,
  content: ArrayBuffer,
  format: "facturx" | "ubl" | "cii" = "facturx"
): Promise<SuperPdpInvoiceSubmitResponse> {
  const contentType = format === "facturx" ? "application/pdf" : "application/xml";
  return superpdpFetch<SuperPdpInvoiceSubmitResponse>(token, "/v1.beta/invoices", {
    method: "POST",
    body: content,
    contentType,
  });
}

/**
 * GET /v1.beta/french_directory/entries?number=SIREN — pre-check: is this
 * SIREN reachable on the Plateformes Agréées network? Avoids a cryptic
 * rejection from the send call itself.
 */
export async function checkDirectoryEntry(token: string, siren: string): Promise<{ data: unknown[] }> {
  return superpdpFetch<{ data: unknown[] }>(
    token,
    `/v1.beta/french_directory/entries?number=${encodeURIComponent(siren)}`
  );
}

export interface SuperPdpInvoiceEvent {
  id: number;
  invoice_id: number;
  status_code: string; // fr:200..fr:213, fr:501
  reason_code?: string | null;
  message?: string | null;
  event_date?: string;
  [key: string]: unknown;
}

/**
 * GET /v1.beta/invoice_events?starting_after_id=X — lifecycle event
 * polling. SUPER PDP's docs do not provide a webhook mechanism; this
 * cursor-based endpoint is the only way to learn about status changes.
 */
export async function listInvoiceEvents(
  token: string,
  startingAfterId = 0
): Promise<{ data: SuperPdpInvoiceEvent[]; has_after?: boolean }> {
  return superpdpFetch<{ data: SuperPdpInvoiceEvent[]; has_after?: boolean }>(
    token,
    `/v1.beta/invoice_events?starting_after_id=${startingAfterId}`
  );
}
