// BeyondPath POC . Shared . Minimal JWT (HS256) for accept/decline links
// 2026-05-20 . Q3 Task 4 . calcifer (v1)
// 2026-05-21 . brief #4 . calcifer (v2)
//   - TTL: 7 days -> 24 hours (sulima H1)
//   - Clock skew leeway: +/-60s (calcifer G5)
//   - kid (key version) support . JWT_SECRET can be JSON map of {v1: secret, v2: secret}
//   - Rotation SOP: docs/launch/10-jwt-rotation-sop.md
//
// Why custom: Edge runtime is Deno . zero external dep . WebCrypto provides HMAC-SHA256.

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

// ============================================================
// Key management (kid rotation . brief #4)
// ============================================================
// JWT_SECRET can be either:
//   (a) plain string . assumed kid = v1
//   (b) JSON map . current kid via JWT_CURRENT_KID env (default highest v* number)
//
// Rotation workflow:
//   - Add v2 to map, set JWT_CURRENT_KID=v2
//   - New tokens signed with v2 . old v1 tokens still verify
//   - After TTL window (24h) passes, remove v1 from map

interface KeyMap {
  [kid: string]: string;
}

function parseSecret(secret: string): KeyMap {
  if (!secret) return {};
  const trimmed = secret.trim();
  if (trimmed.charAt(0) === "{") {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === "object") {
        const out: KeyMap = {};
        for (const k in parsed) {
          if (Object.prototype.hasOwnProperty.call(parsed, k) && typeof parsed[k] === "string") {
            out[k] = parsed[k];
          }
        }
        return out;
      }
    } catch {
      // fall through
    }
  }
  return { v1: trimmed };
}

function pickCurrentKid(map: KeyMap): string {
  let preferredKid = "";
  try {
    const envVal = (typeof Deno !== "undefined" && Deno.env) ? Deno.env.get("JWT_CURRENT_KID") : "";
    preferredKid = envVal || "";
  } catch {
    preferredKid = "";
  }
  if (preferredKid && map[preferredKid]) return preferredKid;
  const keys = Object.keys(map).filter(function (k) { return k.charAt(0) === "v" && /^v\d+$/.test(k); });
  if (keys.length > 0) {
    keys.sort(function (a, b) { return parseInt(b.slice(1), 10) - parseInt(a.slice(1), 10); });
    return keys[0];
  }
  const allKeys = Object.keys(map);
  return allKeys.length > 0 ? allKeys[0] : "v1";
}

export interface DecisionTokenPayload {
  worker_application_id: string;
  client_intake_id: string;
  worker_decision_id: string;
  action_default?: "accept" | "decline";
  iat: number;
  exp: number;
  sub?: string;
}

interface JwtHeader {
  alg: string;
  typ: string;
  kid?: string;
}

// ============================================================
// Sign
// ============================================================
// Default TTL: 24 hours (brief #4 . sulima H1 . tighter accept-window)

export async function signDecisionToken(
  payload: Omit<DecisionTokenPayload, "iat" | "exp">,
  secret: string,
  ttlSeconds: number = 24 * 3600,
): Promise<string> {
  if (!secret) throw new Error("JWT_SECRET-missing");
  const keys = parseSecret(secret);
  const kid = pickCurrentKid(keys);
  const keyMaterial = keys[kid];
  if (!keyMaterial) throw new Error("JWT_SECRET-no-current-kid:" + kid);

  const header: JwtHeader = { alg: "HS256", typ: "JWT", kid: kid };
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
  const key = await importKey(keyMaterial);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(signingInput)));
  return signingInput + "." + b64UrlEncode(sig);
}

// ============================================================
// Verify
// ============================================================
// - kid lookup (header.kid -> keymap)
// - clock-skew leeway: +/- 60s (brief #4 . calcifer G5)
// - backward compat: if header.kid missing, fall back to single-key map

const CLOCK_SKEW_SECONDS = 60;

export async function verifyDecisionToken(token: string, secret: string): Promise<DecisionTokenPayload | null> {
  if (!token || !secret) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [headerB64, payloadB64, sigB64] = parts;

  let header: JwtHeader;
  try {
    header = JSON.parse(b64UrlDecodeToString(headerB64));
  } catch {
    return null;
  }
  if (!header || header.alg !== "HS256") return null;

  const keys = parseSecret(secret);
  const kid = header.kid || pickCurrentKid(keys);
  const keyMaterial = keys[kid];
  if (!keyMaterial) return null;

  try {
    const key = await importKey(keyMaterial);
    const ok = await crypto.subtle.verify(
      "HMAC",
      key,
      b64UrlDecodeToBytes(sigB64) as BufferSource,
      enc.encode(headerB64 + "." + payloadB64),
    );
    if (!ok) return null;
    const payload = JSON.parse(b64UrlDecodeToString(payloadB64)) as DecisionTokenPayload;
    const now = Math.floor(Date.now() / 1000);
    // Clock-skew leeway: exp + 60s OK . iat - 60s OK
    if (typeof payload.exp !== "number" || (payload.exp + CLOCK_SKEW_SECONDS) < now) return null;
    if (typeof payload.iat === "number" && (payload.iat - CLOCK_SKEW_SECONDS) > now) return null;
    return payload;
  } catch {
    return null;
  }
}

// ============================================================
// SHA-256 of full token (for token_hash audit only)
// ============================================================
export async function sha256Hex(input: string): Promise<string> {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(input)));
  let out = "";
  for (let i = 0; i < digest.length; i++) {
    const h = digest[i].toString(16);
    out += h.length === 1 ? "0" + h : h;
  }
  return out;
}
