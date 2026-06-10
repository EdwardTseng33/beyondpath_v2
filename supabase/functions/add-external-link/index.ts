// BeyondPath v1.0 . Edge Function . add-external-link
// Phase 3+ . 2026-05-28 calcifer . 外部連結 (Figma/GDrive/GitHub/Notion/Dropbox/other)

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { verifyContractToken, signContractToken } from "../_shared/contract-jwt.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("NEXT_PUBLIC_SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const JWT_SECRET = Deno.env.get("JWT_SECRET") ?? "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const RESEND_FROM = Deno.env.get("RESEND_FROM") ?? "BeyondPath <hello@beyondpath.tw>";
const PUBLIC_SITE_BASE = Deno.env.get("PUBLIC_SITE_BASE") ?? "https://beyondpath.tw";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, apikey",
};

const ALLOWED_TYPES = ["figma", "gdrive", "github", "notion", "dropbox", "other"];

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
  milestone_id: string;
  role: "worker" | "client";
  link_type: string;
  url: string;
  description?: string;
  token: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST") return jsonRes({ ok: false, error: "method not allowed" }, 405);

  const ip = getClientIp(req);

  if (!JWT_SECRET) return jsonRes({ ok: false, error: "JWT_SECRET not configured" }, 500);

  let body: ReqBody;
  try { body = await req.json(); } catch { return jsonRes({ ok: false, error: "bad body" }, 400); }
  if (!body.milestone_id || !body.role || !body.link_type || !body.url || !body.token) {
    return jsonRes({ ok: false, error: "milestone_id + role + link_type + url + token required" }, 400);
  }
  if (ALLOWED_TYPES.indexOf(body.link_type) < 0) return jsonRes({ ok: false, error: "bad link_type" }, 400);
  if (!body.url.match(/^https?:\/\//)) return jsonRes({ ok: false, error: "url must start with http(s)://" }, 400);
  if (body.url.length > 2000) return jsonRes({ ok: false, error: "url too long" }, 400);
  if (body.role !== "worker" && body.role !== "client") return jsonRes({ ok: false, error: "bad role" }, 400);

  const payload = await verifyContractToken(body.token, JWT_SECRET);
  if (!payload) return jsonRes({ ok: false, error: "invalid or expired token" }, 401);
  if (payload.role !== body.role) return jsonRes({ ok: false, error: "token role mismatch" }, 403);

  // verify milestone in token contract
  const mRes = await fetch(SUPABASE_URL + "/rest/v1/contract_milestones?id=eq." + body.milestone_id + "&select=*", { headers: authHeaders() });
  const mRows = await mRes.json();
  if (!Array.isArray(mRows) || mRows.length === 0) return jsonRes({ ok: false, error: "milestone not found" }, 404);
  const milestone = mRows[0];
  if (milestone.contract_id !== payload.contract_id) return jsonRes({ ok: false, error: "milestone not in token contract" }, 403);
  if (milestone.archived_at) return jsonRes({ ok: false, error: "milestone archived" }, 410);

  const insertRes = await fetch(SUPABASE_URL + "/rest/v1/deliverable_external_links", {
    method: "POST",
    headers: { ...authHeaders(), "Prefer": "return=representation" },
    body: JSON.stringify({
      milestone_id: body.milestone_id,
      link_type: body.link_type,
      url: body.url,
      description: body.description || null,
      uploaded_by_role: body.role,
      uploaded_by_ip: ip,
    }),
  });
  if (!insertRes.ok) {
    const errTxt = await insertRes.text();
    return jsonRes({ ok: false, error: "db insert failed", detail: errTxt.slice(0, 200) }, 500);
  }
  const insertRows = await insertRes.json();
  const link = Array.isArray(insertRows) ? insertRows[0] : null;

  // history audit
  fetch(SUPABASE_URL + "/rest/v1/contract_milestones_history", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      milestone_id: body.milestone_id,
      action: "deliver",
      action_by_role: body.role,
      action_by_ip: ip,
      notes: "external link: " + body.link_type,
      metadata: { url: body.url, description: body.description || null },
    }),
  }).catch((e) => console.warn("history insert failed", e));

  // notify other side
  (async function () {
    if (!RESEND_API_KEY) return;
    const cRes = await fetch(SUPABASE_URL + "/rest/v1/contracts?id=eq." + payload.contract_id + "&select=*", { headers: authHeaders() });
    const cRows = await cRes.json();
    if (!Array.isArray(cRows) || cRows.length === 0) return;
    const snap = cRows[0].contract_snapshot || {};
    const recipient = body.role === "worker"
      ? { email: snap.client_email, name: snap.client_name || "Client", role: "client" as const }
      : { email: snap.worker_email, name: snap.worker_name || "Worker", role: "worker" as const };
    if (!recipient.email) return;
    const tok = await signContractToken({ contract_id: payload.contract_id, role: recipient.role }, JWT_SECRET, 14 * 24 * 3600);
    const url = PUBLIC_SITE_BASE + "/milestone-detail.html?contract_id=" + payload.contract_id + "&milestone_id=" + body.milestone_id + "&token=" + tok;
    const css = "font-family:system-ui,sans-serif;line-height:1.7;color:#222;max-width:600px;margin:24px auto;padding:0 16px";
    const btnCss = "display:inline-block;padding:12px 24px;background:#4ade80;color:#fff;text-decoration:none;border-radius:6px;font-weight:600";
    const html =
      "<!doctype html><html><body style=\"" + css + "\">" +
      "<h2 style=\"border-bottom:2px solid #4ade80;padding-bottom:8px\">BeyondPath . External link shared</h2>" +
      "<p>" + recipient.name + ",</p>" +
      "<p>Other party shared a " + body.link_type + " link for milestone <strong>" + (milestone.title || "Milestone " + milestone.milestone_number) + "</strong>.</p>" +
      "<p style=\"margin:20px 0\"><a href=\"" + url + "\" style=\"" + btnCss + "\">View deliverable + link</a></p>" +
      "<hr><p style=\"font-size:11px;color:#999\">BeyondPath v1.0 . Phase 3+</p>" +
      "</body></html>";
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": "Bearer " + RESEND_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ from: RESEND_FROM, to: [recipient.email], subject: "BeyondPath . External link shared", html }),
    });
  })().catch((e) => console.warn("notify external link failed", e));

  return jsonRes({ ok: true, link_id: link?.id, link });
});
