// BeyondPath v1.0 . Edge Function . submit-arbitration-position
// Phase 3+ . 2026-05-28 calcifer . 件 B 仲裁立場提交
//
// Spec:
//   POST { case_id, role, position_text, position_files?, token }
//   verify contract-jwt . role match
//   update arbitration_cases.${role}_position_text + _files + _submitted_at + _ip
//   若雙方都提 -> status='positions_complete' + 通知 admin

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { verifyContractToken } from "../_shared/contract-jwt.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("NEXT_PUBLIC_SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const JWT_SECRET = Deno.env.get("JWT_SECRET") ?? "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const RESEND_FROM = Deno.env.get("RESEND_FROM") ?? "BeyondPath <hello@beyondpath.tw>";
const ADMIN_EMAIL = "edwardt0303@gmail.com";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, apikey",
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
  case_id: string;
  role: "worker" | "client";
  position_text: string;
  position_files?: Array<{ file_url: string; file_name: string; size?: number; sha256?: string }>;
  token: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST") return jsonRes({ ok: false, error: "method not allowed" }, 405);

  const ip = getClientIp(req);

  if (!JWT_SECRET) return jsonRes({ ok: false, error: "JWT_SECRET not configured" }, 500);

  let body: ReqBody;
  try { body = await req.json(); } catch { return jsonRes({ ok: false, error: "bad body" }, 400); }
  if (!body.case_id || !body.role || !body.position_text || !body.token) {
    return jsonRes({ ok: false, error: "case_id + role + position_text + token required" }, 400);
  }
  if (body.role !== "worker" && body.role !== "client") return jsonRes({ ok: false, error: "bad role" }, 400);
  if (body.position_text.length > 5000) return jsonRes({ ok: false, error: "position_text too long (max 5000)" }, 400);

  const payload = await verifyContractToken(body.token, JWT_SECRET);
  if (!payload) return jsonRes({ ok: false, error: "invalid or expired token" }, 401);
  if (payload.role !== body.role) return jsonRes({ ok: false, error: "token role mismatch" }, 403);

  const aRes = await fetch(SUPABASE_URL + "/rest/v1/arbitration_cases?id=eq." + body.case_id + "&select=*", { headers: authHeaders() });
  const aRows = await aRes.json();
  if (!Array.isArray(aRows) || aRows.length === 0) return jsonRes({ ok: false, error: "arbitration case not found" }, 404);
  const arb = aRows[0];

  if (arb.contract_id !== payload.contract_id) return jsonRes({ ok: false, error: "case not in token contract" }, 403);

  if (arb.status === "resolved") return jsonRes({ ok: false, error: "case already resolved" }, 410);

  if (new Date(arb.position_deadline).getTime() < Date.now()) {
    // deadline expired . still accept but flag
    fetch(SUPABASE_URL + "/rest/v1/arbitration_cases?id=eq." + body.case_id, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ status: "deadline_expired" }),
    }).catch(() => {});
    return jsonRes({ ok: false, error: "position deadline has passed" }, 410);
  }

  // check if this role already submitted
  if (body.role === "worker" && arb.worker_position_submitted_at) {
    return jsonRes({ ok: false, error: "worker already submitted" }, 409);
  }
  if (body.role === "client" && arb.client_position_submitted_at) {
    return jsonRes({ ok: false, error: "client already submitted" }, 409);
  }

  const nowIso = new Date().toISOString();
  const patch: Record<string, unknown> = {};
  if (body.role === "worker") {
    patch.worker_position_text = body.position_text;
    patch.worker_position_files = body.position_files || [];
    patch.worker_position_submitted_at = nowIso;
    patch.worker_position_submitted_ip = ip;
  } else {
    patch.client_position_text = body.position_text;
    patch.client_position_files = body.position_files || [];
    patch.client_position_submitted_at = nowIso;
    patch.client_position_submitted_ip = ip;
  }

  // check if both will now be complete
  const willBeComplete = body.role === "worker"
    ? !!arb.client_position_submitted_at
    : !!arb.worker_position_submitted_at;
  if (willBeComplete) patch.status = "positions_complete";

  const upRes = await fetch(SUPABASE_URL + "/rest/v1/arbitration_cases?id=eq." + body.case_id, {
    method: "PATCH",
    headers: { ...authHeaders(), "Prefer": "return=representation" },
    body: JSON.stringify(patch),
  });
  if (!upRes.ok) {
    const errTxt = await upRes.text();
    return jsonRes({ ok: false, error: "update failed", detail: errTxt.slice(0, 200) }, 500);
  }
  const upRows = await upRes.json();
  const updated = Array.isArray(upRows) ? upRows[0] : null;

  // notify admin when positions complete
  if (willBeComplete && RESEND_API_KEY) {
    const css = "font-family:system-ui,sans-serif;line-height:1.7;color:#222;max-width:600px;margin:24px auto;padding:0 16px";
    const subj = "BeyondPath . Arbitration positions complete . Action required";
    const html =
      "<!doctype html><html><body style=\"" + css + "\">" +
      "<h2 style=\"border-bottom:2px solid #f5a623;padding-bottom:8px\">Arbitration Positions Complete</h2>" +
      "<p>Edward,</p>" +
      "<p>Both parties have submitted their positions for arbitration case <code>" + body.case_id.slice(0, 8) + "</code>.</p>" +
      "<p>Please review and submit the verdict at <code>/admin.html</code> -> Arbitration tab.</p>" +
      "<hr><p style=\"font-size:11px;color:#999\">BeyondPath v1.0</p>" +
      "</body></html>";
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": "Bearer " + RESEND_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ from: RESEND_FROM, to: [ADMIN_EMAIL], subject: subj, html }),
    }).catch((e) => console.warn("admin notify failed", e));
  }

  return jsonRes({ ok: true, case: updated, positions_complete: willBeComplete });
});
