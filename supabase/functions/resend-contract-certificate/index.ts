// BeyondPath v1.0 . Edge Function . resend-contract-certificate
// C-1 Phase 2 . 2026-05-28 calcifer
//
// Spec: admin only . re-send completion email (with both signatures + hash) to both parties
//   . useful if recipients lost original email or want a fresh signed-URL refresh
//   . POST { contract_id }
//   . requires admin JWT (edwardt0303@gmail.com)
//   . only works when contract.status = "complete"

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("NEXT_PUBLIC_SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const RESEND_FROM = Deno.env.get("RESEND_FROM") ?? "BeyondPath <hello@beyondpath.tw>";
const PUBLIC_SITE_BASE = Deno.env.get("PUBLIC_SITE_BASE") ?? "https://beyondpath.tw";

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

function buildCompletionHtml(name: string, c: any): string {
  const pdfU = c.pdf_url || "";
  const clientSigU = c.client_signature_url || "";
  const workerSigU = c.worker_signature_url || "";
  const clientTs = c.client_signed_at || "-";
  const workerTs = c.worker_signed_at || "-";
  const sigHash = c.signature_hash || "-";
  const pdfHash = c.pdf_hash || "-";
  return (
    "<!doctype html><html><body style=\"font-family:system-ui,sans-serif;line-height:1.7;color:#222;max-width:600px;margin:24px auto;padding:0 16px\">" +
    "<h2 style=\"border-bottom:2px solid #4ade80;padding-bottom:8px\">BeyondPath . 存證副本重寄</h2>" +
    "<p>" + name + "，</p>" +
    "<p>應 BeyondPath 管理員請求、重新寄發合約 <code>" + c.id + "</code> 完整存證副本：</p>" +
    "<ul>" +
    "<li><strong>合約 PDF</strong>：<a href=\"" + pdfU + "\">下載</a></li>" +
    "<li><strong>發案方簽署</strong>：<a href=\"" + clientSigU + "\">查看簽署照</a> . " + clientTs + "</li>" +
    "<li><strong>接案者簽署</strong>：<a href=\"" + workerSigU + "\">查看簽署照</a> . " + workerTs + "</li>" +
    "<li><strong>SHA-256 完整 hash</strong>：<code style=\"font-size:11px;word-break:break-all\">" + sigHash + "</code></li>" +
    "<li><strong>PDF hash</strong>：<code style=\"font-size:11px;word-break:break-all\">" + pdfHash + "</code></li>" +
    "</ul>" +
    "<p>查驗：<a href=\"" + PUBLIC_SITE_BASE + "/contract-verify.html\">contract-verify.html</a></p>" +
    "<hr><p style=\"font-size:11px;color:#999\">BeyondPath v1.0 . Contract Phase 2</p>" +
    "</body></html>"
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST") return jsonRes({ ok: false, error: "method not allowed" }, 405);

  const auth = req.headers.get("Authorization") || "";
  if (!auth.startsWith("Bearer ")) return jsonRes({ ok: false, error: "missing auth" }, 401);
  const userJwt = auth.slice(7);
  const userRes = await fetch(SUPABASE_URL + "/auth/v1/user", {
    headers: { "apikey": SUPABASE_SERVICE_ROLE_KEY, "Authorization": "Bearer " + userJwt },
  });
  if (!userRes.ok) return jsonRes({ ok: false, error: "invalid auth" }, 401);
  const user = await userRes.json();
  if (user.email !== "edwardt0303@gmail.com") return jsonRes({ ok: false, error: "admin only" }, 403);

  if (!RESEND_API_KEY) return jsonRes({ ok: false, error: "RESEND_API_KEY not configured" }, 500);

  let body: { contract_id?: string };
  try { body = await req.json(); } catch { return jsonRes({ ok: false, error: "bad body" }, 400); }
  if (!body.contract_id) return jsonRes({ ok: false, error: "contract_id required" }, 400);

  const cRes = await fetch(
    SUPABASE_URL + "/rest/v1/contracts?id=eq." + body.contract_id + "&select=*",
    { headers: authHeaders() }
  );
  const cRows = await cRes.json();
  if (!Array.isArray(cRows) || cRows.length === 0) return jsonRes({ ok: false, error: "contract not found" }, 404);
  const c = cRows[0];
  if (c.status !== "complete") return jsonRes({ ok: false, error: "contract not complete - both must sign first", status: c.status }, 409);

  const snap = c.contract_snapshot || {};
  const recipients: Array<{ email: string; name: string; role: string }> = [];
  if (snap.client_email) recipients.push({ email: snap.client_email, name: snap.client_name || "Client", role: "client" });
  if (snap.worker_email) recipients.push({ email: snap.worker_email, name: snap.worker_name || "Worker", role: "worker" });

  const sent: Record<string, boolean> = {};
  for (const r of recipients) {
    const subject = "BeyondPath . 合約存證副本重寄 . Contract " + c.id.slice(0, 8);
    const html = buildCompletionHtml(r.name, c);
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + RESEND_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from: RESEND_FROM, to: [r.email], subject, html }),
      });
      sent[r.role] = res.ok;
    } catch (e) {
      console.warn("resend failed for " + r.email + ":", e);
      sent[r.role] = false;
    }
  }

  return jsonRes({ ok: true, contract_id: body.contract_id, sent });
});
