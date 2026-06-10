// BeyondPath POC . Shared . Contract Sign JWT (HS256) for contract.html upload links
// 2026-05-28 . C-1 Phase 2 . calcifer
//
// Reuses existing JWT_SECRET (sulima blocked rotation . do not change)
// Same crypto pattern as jwt-light.ts but different payload schema (contract sign vs decision).
//
// Payload: { contract_id, role: 'client'|'worker', exp (14d), iat, kind: 'contract_sign' }
// Why 14d: clients/workers may sign on different days, need slack vs the 7d PDF signed-URL TTL.

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

interface KeyMap { [kid: string]: string; }

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

export interface ContractTokenPayload {
  contract_id: string;
  role: "client" | "worker";
  kind: "contract_sign";
  iat: number;
  exp: number;
}

interface JwtHeader { alg: string; typ: string; kid?: string; }

const CLOCK_SKEW_SECONDS = 60;
const DEFAULT_TTL_SECONDS = 14 * 24 * 3600;

export async function signContractToken(
  payload: Omit<ContractTokenPayload, "iat" | "exp" | "kind">,
  secret: string,
  ttlSeconds: number = DEFAULT_TTL_SECONDS,
): Promise<string> {
  if (!secret) throw new Error("JWT_SECRET-missing");
  const keys = parseSecret(secret);
  const kid = pickCurrentKid(keys);
  const keyMaterial = keys[kid];
  if (!keyMaterial) throw new Error("JWT_SECRET-no-current-kid:" + kid);

  const header: JwtHeader = { alg: "HS256", typ: "JWT", kid: kid };
  const now = Math.floor(Date.now() / 1000);
  const full: ContractTokenPayload = {
    contract_id: payload.contract_id,
    role: payload.role,
    kind: "contract_sign",
    iat: now,
    exp: now + ttlSeconds,
  };
  const headerB64 = b64UrlEncodeString(JSON.stringify(header));
  const payloadB64 = b64UrlEncodeString(JSON.stringify(full));
  const signingInput = headerB64 + "." + payloadB64;
  const key = await importKey(keyMaterial);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(signingInput)));
  return signingInput + "." + b64UrlEncode(sig);
}

export async function verifyContractToken(token: string, secret: string): Promise<ContractTokenPayload | null> {
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
    const payload = JSON.parse(b64UrlDecodeToString(payloadB64)) as ContractTokenPayload;
    const now = Math.floor(Date.now() / 1000);
    if (payload.kind !== "contract_sign") return null;
    if (payload.role !== "client" && payload.role !== "worker") return null;
    if (typeof payload.contract_id !== "string" || !payload.contract_id) return null;
    if (typeof payload.exp !== "number" || (payload.exp + CLOCK_SKEW_SECONDS) < now) return null;
    if (typeof payload.iat === "number" && (payload.iat - CLOCK_SKEW_SECONDS) > now) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function sha256Hex(input: string | Uint8Array): Promise<string> {
  const bytes = typeof input === "string" ? enc.encode(input) : input;
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes as BufferSource));
  let out = "";
  for (let i = 0; i < digest.length; i++) {
    const h = digest[i].toString(16);
    out += h.length === 1 ? "0" + h : h;
  }
  return out;
}
