#!/usr/bin/env node
/**
 * LinkedIn OAuth 2.0 Setup — Obtenir un access token en 2 minutes
 *
 * Lance un serveur local, ouvre le navigateur sur LinkedIn,
 * capture le code d'autorisation et échange contre un token 60 jours.
 *
 * Prérequis :
 *   1. Créer une app sur https://www.linkedin.com/developers/apps
 *   2. Ajouter les produits :
 *      - "Share on LinkedIn" (scope w_member_social)
 *      - "Sign In with LinkedIn using OpenID Connect" (scope openid profile)
 *   3. Ajouter http://localhost:3456/callback dans Redirect URLs
 *   4. Remplir LINKEDIN_CLIENT_ID et LINKEDIN_CLIENT_SECRET dans .env.linkedin
 *
 * Usage :
 *   node scripts/linkedin/linkedin-oauth-setup.mjs
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { exec } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createRequire } from "module";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const express = require("express");

/**
 * Open URL in browser — cross-platform with fallbacks
 */
async function openBrowser(url) {
  // Try ESM `open` package first
  try {
    const mod = await import("open");
    const openFn = mod.default || mod;
    await openFn(url);
    return;
  } catch {
    // fallback
  }

  // Windows fallback via start command
  if (process.platform === "win32") {
    exec(`start "" "${url}"`);
    return;
  }
  // macOS
  if (process.platform === "darwin") {
    exec(`open "${url}"`);
    return;
  }
  // Linux
  exec(`xdg-open "${url}"`);
}

// ═══════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════

const ENV_PATH = join(__dirname, ".env.linkedin");
const PORT = 3456;
const REDIRECT_URI = `http://localhost:${PORT}/callback`;

// openid + profile → gives id_token JWT with "sub" (person ID)
// w_member_social → allows posting as yourself
// w_organization_social → allows posting as company page
const SCOPES = ["openid", "profile", "w_member_social", "w_organization_social"];

// ═══════════════════════════════════════════════════
// LOAD ENV
// ═══════════════════════════════════════════════════

function loadEnv() {
  const env = {};
  try {
    const content = readFileSync(ENV_PATH, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim();
      env[key] = value;
    }
  } catch {
    // file not found
  }
  return env;
}

function updateEnvVar(content, key, value) {
  const regex = new RegExp(`^${key}=.*`, "m");
  if (regex.test(content)) {
    return content.replace(regex, `${key}=${value}`);
  }
  // Remove commented version if exists
  const commentRegex = new RegExp(`^#\\s*${key}=.*`, "m");
  if (commentRegex.test(content)) {
    return content.replace(commentRegex, `${key}=${value}`);
  }
  return content + `\n${key}=${value}`;
}

function saveTokenToEnv(accessToken, expiresIn, personUrn, orgUrn) {
  let content = "";

  if (existsSync(ENV_PATH)) {
    content = readFileSync(ENV_PATH, "utf-8");
  }

  content = updateEnvVar(content, "LINKEDIN_ACCESS_TOKEN", accessToken);

  if (personUrn) {
    content = updateEnvVar(content, "LINKEDIN_PERSON_URN", personUrn);
  }

  if (orgUrn) {
    content = updateEnvVar(content, "LINKEDIN_ORG_URN", orgUrn);
  }

  // Add expiry comment
  const expiryDate = new Date(Date.now() + expiresIn * 1000);
  const expiryStr = expiryDate.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (content.includes("# Token expires:")) {
    content = content.replace(/# Token expires:.*/, `# Token expires: ${expiryStr}`);
  } else {
    content += `\n# Token expires: ${expiryStr}`;
  }

  writeFileSync(ENV_PATH, content.trim() + "\n", "utf-8");
}

// ═══════════════════════════════════════════════════
// DECODE id_token JWT (no verification needed — just extract sub)
// ═══════════════════════════════════════════════════

function decodeJwtPayload(jwt) {
  const parts = jwt.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = Buffer.from(parts[1], "base64url").toString("utf-8");
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════════════
// LINKEDIN OAUTH FLOW
// ═══════════════════════════════════════════════════

async function exchangeCodeForToken(code, clientId, clientSecret) {
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: REDIRECT_URI,
  });

  const res = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Token exchange failed (${res.status}): ${errText}`);
  }

  return res.json();
}

async function getProfileInfo(accessToken) {
  // Try /v2/userinfo (OpenID Connect — available with openid+profile scopes)
  const res = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (res.ok) {
    const data = await res.json();
    return {
      id: data.sub,
      name: data.name || "Inconnu",
    };
  }
  throw new Error(`Profile fetch failed: ${res.status} ${await res.text()}`);
}

async function getOrganizations(accessToken) {
  // Get organizations where user is admin
  const res = await fetch(
    "https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Restli-Protocol-Version": "2.0.0",
      },
    }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.elements || []).map((el) => el.organizationalTarget);
}

async function getOrgName(accessToken, orgUrn) {
  const orgId = orgUrn.replace("urn:li:organization:", "");
  const res = await fetch(
    `https://api.linkedin.com/v2/organizations/${orgId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Restli-Protocol-Version": "2.0.0",
      },
    }
  );
  if (!res.ok) return orgUrn;
  const data = await res.json();
  return data.localizedName || orgUrn;
}

// ═══════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════

async function main() {
  console.log("");
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║  LinkedIn OAuth 2.0 Setup — Devizly         ║");
  console.log("╚══════════════════════════════════════════════╝");
  console.log("");

  const env = loadEnv();
  const clientId = env.LINKEDIN_CLIENT_ID || process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = env.LINKEDIN_CLIENT_SECRET || process.env.LINKEDIN_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("❌ LINKEDIN_CLIENT_ID et LINKEDIN_CLIENT_SECRET requis.\n");
    console.log("Étapes :");
    console.log("  1. Allez sur https://www.linkedin.com/developers/apps");
    console.log("  2. Créez une app (ou sélectionnez l'existante)");
    console.log("  3. Onglet 'Auth' → copiez Client ID et Client Secret");
    console.log(`  4. Onglet 'Auth' → ajoutez ${REDIRECT_URI} aux Redirect URLs`);
    console.log("  5. Onglet 'Products' → activez :");
    console.log("     • 'Share on LinkedIn'");
    console.log("     • 'Sign In with LinkedIn using OpenID Connect'");
    console.log("  6. Ajoutez dans .env.linkedin :");
    console.log("");
    console.log("     LINKEDIN_CLIENT_ID=votre_client_id");
    console.log("     LINKEDIN_CLIENT_SECRET=votre_client_secret");
    console.log("");
    process.exit(1);
  }

  // Build authorization URL
  const state = Math.random().toString(36).substring(2, 15);
  const authUrl = new URL("https://www.linkedin.com/oauth/v2/authorization");
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
  authUrl.searchParams.set("scope", SCOPES.join(" "));
  authUrl.searchParams.set("state", state);

  // Start local server to capture callback
  return new Promise((resolve, reject) => {
    const app = express();
    let server;

    app.get("/callback", async (req, res) => {
      const { code, state: returnedState, error, error_description } = req.query;

      if (error) {
        res.send(`
          <html><body style="font-family:system-ui;text-align:center;padding:60px;background:#0F172A;color:white">
            <h1 style="color:#ef4444">❌ Autorisation refusée</h1>
            <p>${error_description || error}</p>
            <p style="color:#94A3B8">Vous pouvez fermer cette fenêtre.</p>
          </body></html>
        `);
        console.error(`\n❌ LinkedIn a refusé : ${error_description || error}`);
        console.error(`\n❌ ${error}`);

        if (error === "unauthorized_scope_error") {
          console.log("");
          console.log("💡 Solution :");
          console.log("   1. Allez sur https://www.linkedin.com/developers/apps");
          console.log("   2. Sélectionnez votre app");
          console.log("   3. Onglet 'Products'");
          console.log("   4. Activez 'Sign In with LinkedIn using OpenID Connect'");
          console.log("   5. Attendez l'approbation (instant) puis relancez ce script");
        }

        server.close();
        reject(new Error(error));
        return;
      }

      if (returnedState !== state) {
        res.send(`
          <html><body style="font-family:system-ui;text-align:center;padding:60px;background:#0F172A;color:white">
            <h1 style="color:#ef4444">❌ Erreur de sécurité</h1>
            <p>Le paramètre state ne correspond pas. Tentative CSRF possible.</p>
          </body></html>
        `);
        console.error("\n❌ State mismatch — possible CSRF");
        server.close();
        reject(new Error("State mismatch"));
        return;
      }

      console.log("\n✅ Code d'autorisation reçu !");
      console.log("🔄 Échange du code contre un access token...");

      try {
        // Exchange code for token
        const tokenData = await exchangeCodeForToken(code, clientId, clientSecret);
        const accessToken = tokenData.access_token;
        const expiresIn = tokenData.expires_in; // seconds (typically 5184000 = 60 days)
        const idToken = tokenData.id_token; // JWT with "sub" claim = person ID

        console.log(`✅ Access token obtenu ! (expire dans ${Math.round(expiresIn / 86400)} jours)`);

        // Extract person URN from id_token JWT or /v2/userinfo
        let personUrn = null;
        let profileName = "Inconnu";

        // Method 1: Decode id_token JWT (no network call needed)
        if (idToken) {
          const payload = decodeJwtPayload(idToken);
          if (payload && payload.sub) {
            personUrn = `urn:li:person:${payload.sub}`;
            profileName = payload.name || payload.given_name || "Inconnu";
            console.log(`👤 Profil (id_token) : ${profileName} (${personUrn})`);
          }
        }

        // Method 2: Try /v2/userinfo as fallback
        if (!personUrn) {
          try {
            const profile = await getProfileInfo(accessToken);
            personUrn = `urn:li:person:${profile.id}`;
            profileName = profile.name;
            console.log(`👤 Profil (userinfo) : ${profileName} (${personUrn})`);
          } catch (profileErr) {
            console.warn(`⚠️  Profil non récupérable : ${profileErr.message}`);
            console.log("   Ajoutez LINKEDIN_PERSON_URN manuellement dans .env.linkedin");
          }
        }

        // Detect organization pages where user is admin
        let orgUrn = null;
        let orgName = null;
        try {
          const orgs = await getOrganizations(accessToken);
          if (orgs.length > 0) {
            orgUrn = orgs[0]; // First org where user is admin
            orgName = await getOrgName(accessToken, orgUrn);
            console.log(`🏢 Page entreprise : ${orgName} (${orgUrn})`);
            if (orgs.length > 1) {
              console.log(`   (${orgs.length} pages trouvées, utilisation de la première)`);
              for (const org of orgs) {
                const name = await getOrgName(accessToken, org);
                console.log(`   - ${name} (${org})`);
              }
            }
          } else {
            console.log("ℹ️  Aucune page entreprise trouvée (vous posterez en tant que personne)");
          }
        } catch (orgErr) {
          console.warn(`⚠️  Détection page entreprise échouée : ${orgErr.message}`);
          console.log("   Ajoutez LINKEDIN_ORG_URN manuellement ou activez 'Community Management API'");
        }

        // Save to .env.linkedin
        saveTokenToEnv(accessToken, expiresIn, personUrn, orgUrn);
        console.log(`\n💾 Token sauvegardé dans ${ENV_PATH}`);

        const expiryDate = new Date(Date.now() + expiresIn * 1000);

        // Success page
        res.send(`
          <html><body style="font-family:system-ui;text-align:center;padding:60px;background:#0F172A;color:white">
            <div style="max-width:500px;margin:0 auto">
              <h1 style="color:#22D3A5;font-size:48px;margin-bottom:8px">✅</h1>
              <h2 style="color:#22D3A5">Token LinkedIn obtenu !</h2>
              <div style="background:#1E293B;border-radius:12px;padding:24px;text-align:left;margin:24px 0">
                <p style="margin:8px 0"><strong style="color:#94A3B8">Profil :</strong> ${profileName}</p>
                <p style="margin:8px 0"><strong style="color:#94A3B8">Person URN :</strong> <code style="color:#22D3A5">${personUrn || "N/A"}</code></p>
                ${orgUrn ? `<p style="margin:8px 0"><strong style="color:#94A3B8">Page :</strong> ${orgName} <code style="color:#22D3A5">${orgUrn}</code></p>` : ""}
                <p style="margin:8px 0"><strong style="color:#94A3B8">Expire :</strong> ${expiryDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
              </div>
              <p style="color:#64748B">Token sauvegardé dans <code>.env.linkedin</code></p>
              <p style="color:#64748B;font-size:14px;margin-top:32px">Vous pouvez fermer cette fenêtre.</p>
              <div style="margin-top:24px">
                <p style="color:#94A3B8">Testez maintenant :</p>
                <code style="color:#22D3A5;background:#1E293B;padding:8px 16px;border-radius:6px;display:inline-block">
                  node auto-poster.mjs --dry-run --day 1
                </code>
              </div>
            </div>
          </body></html>
        `);

        // Summary
        console.log("");
        console.log("═".repeat(50));
        console.log("");
        console.log("🎉 Setup terminé ! Prochaines étapes :");
        console.log("");
        console.log("   # Test dry-run");
        console.log("   node scripts/linkedin/auto-poster.mjs --dry-run --day 1");
        console.log("");
        console.log("   # Poster le jour 1");
        console.log("   node scripts/linkedin/auto-poster.mjs --day 1");
        console.log("");
        console.log(`⚠️  Token expire le ${expiryDate.toLocaleDateString("fr-FR")} — relancez ce script pour renouveler.`);

        server.close();
        resolve();
      } catch (tokenErr) {
        res.send(`
          <html><body style="font-family:system-ui;text-align:center;padding:60px;background:#0F172A;color:white">
            <h1 style="color:#ef4444">❌ Erreur</h1>
            <p>${tokenErr.message}</p>
            <p style="color:#94A3B8">Vérifiez vos Client ID / Client Secret.</p>
          </body></html>
        `);
        console.error(`\n❌ ${tokenErr.message}`);
        server.close();
        reject(tokenErr);
      }
    });

    // Health check
    app.get("/", (_req, res) => {
      res.send("LinkedIn OAuth callback server running. Waiting for authorization...");
    });

    server = app.listen(PORT, async () => {
      const url = authUrl.toString();

      console.log(`🌐 Serveur callback démarré sur http://localhost:${PORT}`);
      console.log("");
      console.log("🔗 URL d'autorisation LinkedIn :");
      console.log("");
      console.log(`   ${url}`);
      console.log("");
      console.log("📱 Ouverture du navigateur...");

      try {
        await openBrowser(url);
        console.log("   ✅ Navigateur ouvert !");
      } catch {
        console.log("   ⚠️  Impossible d'ouvrir le navigateur automatiquement.");
        console.log("   Copiez l'URL ci-dessus dans votre navigateur.");
      }

      console.log("");
      console.log("⏳ En attente de l'autorisation LinkedIn...");
    });

    // Timeout after 5 minutes
    setTimeout(() => {
      console.error("\n⏰ Timeout — aucune réponse après 5 minutes.");
      server.close();
      reject(new Error("Timeout"));
    }, 5 * 60 * 1000);
  });
}

main().catch((err) => {
  console.error(`\n❌ ${err.message}`);
  process.exit(1);
});
