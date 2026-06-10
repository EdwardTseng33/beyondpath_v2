// BeyondPath POC . Edge Function . download-deliverable
// Phase 3+ . 2026-05-28 calcifer
//
// Spec:
//   POST { deliverable_id, role, token }
//   verify contract-jwt . role match
//   生 7 天 signed URL . 寫 audit log . return signed_url
//   admin 也可走此 (auth: Bearer admin JWT) . 不需要 contract token

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { verifyContractToken } from "../_shared/contract-jwt.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("NEXT_PUBLIC_SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const JWT_SECRET = Deno.env.get("JWT_SECRET") ?? "";
const STORAGE_BUCKET = "deliverables";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
};

function authHeaders(): Record<string, string> {
  return {
    "apikey": SUPABASE_SERVICE_ROLE_KEY,
    "Authorization": "Bearer " + SUPABASE_SERVICE_ROLE_KEY,
    "Content-Type": "application/json",
  };
}

function jsonRes(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

function getClientIp(req: Request): string {
  const cf = req.headers.get("cf-connecting-ip");
  if (cf) return cf;
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

interface ReqBody {
  deliverable_id: string;
  role?: "worker" | "client" | "admin";
  token?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST") return jsonRes({ ok: false, error: "method not allowed" }, 405);

  const ip = getClientIp(req);
  const ua = req.headers.get("user-agent") || "";

  let body: ReqBody;
  try { body = await req.json(); } catch { return jsonRes({ ok: false, error: "bad body" }, 400); }
  if (!body.deliverable_id) return jsonRes({ ok: false, error: "deliverable_id required" }, 400);

  let actorRole: "worker" | "client" | "admin" = "admin";

  // admin path: Bearer admin JWT
  const auth = req.headers.get("Authorization") || "";
  let isAdmin = false;
  if (auth.startsWith("Bearer ") && auth.length > 20) {
    const userJwt = auth.slice(7);
    try {
      const userRes = await fetch(SUPABASE_URL + "/auth/v1/user", {
        headers: { "apikey": SUPABASE_SERVICE_ROLE_KEY, "Authorization": "Bearer " + userJwt },
      });
      if (userRes.ok) {
        const user = await userRes.json();
        if (user.email === "edwardt0303@gmail.com") {
          isAdmin = true;
          actorRole = "admin";
        }
      }
    } catch {}
  }

  // worker/client path: contract token
  if (!isAdmin) {
    if (!body.token || !body.role) return jsonRes({ ok: false, error: "token + role required for non-admin" }, 401);
    if (body.role !== "worker" && body.role !== "client") return jsonRes({ ok: false, error: "bad role" }, 400);
    const payload = await verifyContractToken(body.token, JWT_SECRET);
    if (!payload) return jsonRes({ ok: false, error: "invalid or expired token" }, 401);
    if (payload.role !== body.role) return jsonRes({ ok: false, error: "token role mismatch" }, 403);
    actorRole = body.role;

    // verify deliverable belongs to a milestone in token contract
    const dRes = await fetch(SUPABASE_URL + "/rest/v1/milestone_deliverables?id=eq." + body.deliverable_id + "&select=id,milestone_id", { headers: authHeaders() });
    const dRows = await dRes.json();
    if (!Array.isArray(dRows) || dRows.length === 0) return jsonRes({ ok: false, error: "deliverable not found" }, 404);
    const mRes = await fetch(SUPABASE_URL + "/rest/v1/contract_milestones?id=eq." + dRows[0].milestone_id + "&select=contract_id,archived_at", { headers: authHeaders() });
    const mRows = await mRes.json();
    if (!Array.isArray(mRows) || mRows.length === 0) return jsonRes({ ok: false, error: "milestone not found" }, 404);
    if (mRows[0].contract_id !== payload.contract_id) return jsonRes({ ok: false, error: "deliverable not in token contract" }, 403);
    if (mRows[0].archived_at) return jsonRes({ ok: false, error: "deliverable archived" }, 410);
  }

  const dRes = await fetch(SUPABASE_URL + "/rest/v1/milestone_deliverables?id=eq." + body.deliverable_id + "&select=*", { headers: authHeaders() });
  const dRows = await dRes.json();
  if (!Array.isArray(dRows) || dRows.length === 0) return jsonRes({ ok: false, error: "deliverable not found" }, 404);
  const d = dRows[0];

  // extract storage path from file_url (format: <SUPABASE_URL>/storage/v1/object/sign/<bucket>/<path>?token=...)
  // Better: re-sign from the row's stored path (we stored only signed URL . need to re-derive path)
  // Path convention: <contract_id>/<milestone_id>/v<version>/<file_name>
  // We didn't store path separately . so parse it from file_url
  let storagePath: string | null = null;
  const m1 = d.file_url.match(new RegExp("/object/sign/" + STORAGE_BUCKET + "/([^?]+)"));
  if (m1) storagePath = decodeURIComponent(m1[1]);
  if (!storagePath) {
    // Fallback: reconstruct from contract+milestone+version+filename
    const mRes2 = await fetch(SUPABASE_URL + "/rest/v1/contract_milestones?id=eq." + d.milestone_id + "&select=contract_id", { headers: authHeaders() });
    const mRows2 = await mRes2.json();
    if (Array.isArray(mRows2) && mRows2.length > 0) {
      storagePath = mRows2[0].contract_id + "/" + d.milestone_id + "/v" + d.version_number + "/" + d.file_name;
    }
  }
  if (!storagePath) return jsonRes({ ok: false, error: "cannot resolve storage path" }, 500);

  const signRes = await fetch(SUPABASE_URL + "/storage/v1/object/sign/" + STORAGE_BUCKET + "/" + storagePath, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ expiresIn: 7 * 24 * 3600 }),
  });
  if (!signRes.ok) {
    const errTxt = await signRes.text();
    return jsonRes({ ok: false, error: "sign url failed", detail: errTxt.slice(0, 200) }, 500);
  }
  const signed = await signRes.json();
  const signedPath = signed.signedURL || signed.signedUrl;
  const signedUrl = SUPABASE_URL + "/storage/v1" + signedPath;

  const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();

  // audit log
  fetch(SUPABASE_URL + "/rest/v1/deliverable_download_log", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      deliverable_id: body.deliverable_id,
      downloaded_by_role: actorRole,
      downloaded_by_ip: ip,
      user_agent: ua.slice(0, 200),
      signed_url_expires_at: expiresAt,
    }),
  }).catch((e) => console.warn("download log failed", e));

  return jsonRes({
    ok: true,
    signed_url: signedUrl,
    expires_at: expiresAt,
    file_name: d.file_name,
    file_size: d.file_size,
    sha256: d.sha256,
  });
});
