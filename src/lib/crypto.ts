// AES-256-GCM encryption for secrets at rest (OAuth tokens, etc).
// GCM gives authenticated encryption — tampering with ciphertext is
// detected at decrypt time, not just confidentiality.
//
// Key: process.env.ENCRYPTION_KEY, base64-encoded, must decode to exactly
// 32 bytes. Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

import { randomBytes, createCipheriv, createDecipheriv } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96-bit IV, recommended size for GCM

function getKey(): Buffer {
  const keyB64 = process.env.ENCRYPTION_KEY;
  if (!keyB64) {
    throw new Error("ENCRYPTION_KEY non configurée");
  }
  const key = Buffer.from(keyB64, "base64");
  if (key.length !== 32) {
    throw new Error(
      `ENCRYPTION_KEY doit décoder vers 32 octets (AES-256) — actuellement ${key.length}`
    );
  }
  return key;
}

/** Encrypts a UTF-8 string. Returns "iv:authTag:ciphertext" (all base64). */
export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("base64")}:${authTag.toString("base64")}:${ciphertext.toString("base64")}`;
}

/** Decrypts a payload produced by encrypt(). Throws if malformed or tampered with. */
export function decrypt(payload: string): string {
  const key = getKey();
  const parts = payload.split(":");
  if (parts.length !== 3) {
    throw new Error("Format de payload chiffré invalide");
  }
  const [ivB64, authTagB64, ciphertextB64] = parts;
  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(authTagB64, "base64");
  const ciphertext = Buffer.from(ciphertextB64, "base64");

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plaintext.toString("utf8");
}
