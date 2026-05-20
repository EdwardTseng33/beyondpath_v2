// BeyondPath POC . Shared . Minimal JWT (HS256) for accept/decline links
// 2026-05-20 . Q3 Task 4 . calcifer
//
// Why custom (not a npm dep): Edge runtime is Deno · we want zero external dep · WebCrypto already provides HMAC-SHA256.
// Scope: only sign + verify HS256 with our own JWT_SECRET · 7-day exp · NOT a general-purpose JWT library.
// Spec ref: docs/launch/08-matching-pipeline-spec-calcifer.md Q3 Task 4.

const enc = new TextEncoder();
const dec = new TextDecoder();

function b64UrlEncode(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/=+$/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function b64UrlEncodeString(str: string): string {
  return b64UrlEncode(enc.encode(str));
}

function b64UrlDecodeToBytes(b64url: string): Uint8Array {
  const pad = "=".repeat((4 - (b64url.length % 4)) % 4);
  const b64 = (b64url + pad).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

function b64UrlDecodeToString(b64url: string): string {
  return dec.decode(b64UrlDecodeToBytes(b64url));
}

async function importKey(secret: string): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export interface DecisionTokenPayload {
  worker_application_id: string;
  client_intake_id: string;
  worker_decision_id: string;
  action_default?: "accept" | "decline";
  iat: number;
  exp: number;
  // sub = decision id · stable identifier for dedup
  sub?: string;
}

export async function signDecisionToken(
  payload: Omit<DecisionTokenPayload, "iat" | "exp">,
  secret: string,
  ttlSeconds: number = 7 * 86400,
): Promise<string> {
  if (!secret) throw new Error("JWT_SECRET-missing");
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const full: DecisionTokenPayload = {
    ...payload,
    iat: now,
    exp: now + ttlSeconds,
    sub: payload.worker_decision_id,
  };
  const headerB64 = b64UrlEncodeString(JSON.stringify(header));
  const payloadB64 = b64UrlEncodeString(JSON.stringify(full));
  const signingInput = headerB64 + "." + payloadB64;
  const key = await importKey(secret);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(signingInput)));
  return signingInput + "." + b64UrlEncode(sig);
}

export async function verifyDecisionToken(token: string, secret: string): Promise<DecisionTokenPayload | null> {
  if (!token || !secret) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [headerB64, payloadB64, sigB64] = parts;
  try {
    const key = await importKey(secret);
    const ok = await crypto.subtle.verify(
      "HMAC",
      key,
      b64UrlDecodeToBytes(sigB64) as BufferSource,
      enc.encode(headerB64 + "." + payloadB64),
    );
    if (!ok) return null;
    const payload = JSON.parse(b64UrlDecodeToString(payloadB64)) as DecisionTokenPayload;
    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.exp !== "number" || payload.exp < now) return null;
    return payload;
  } catch {
    return null;
  }
}

// SHA-256 of the JWT (for token_hash audit column) · not the JWT itself in DB
export async function sha256Hex(input: string): Promise<string> {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(input)));
  let out = "";
  for (let i = 0; i < digest.length; i++) {
    const h = digest[i].toString(16);
    out += h.length === 1 ? "0" + h : h;
  }
  return out;
}
