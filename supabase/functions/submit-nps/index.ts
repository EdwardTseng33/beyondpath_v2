// BeyondPath v1.0 . Edge Function . submit-nps
// Phase 3 結案 NPS . 2026-05-28 calcifer
// Spec: anon path (JWT-token verified) POST { contract_id, role, score, comment, is_anonymous, token }
//       1. verify contract_jwt token (kind: contract_sign reused . role match)
//       2. insert into nps_responses (unique contract_id + role enforce)
//       3. update worker_applications cache (nps_avg, nps_count, completed_case_count)
//       4. call recalc-worker-tier internally
//       5. email both sides "感謝您的評分"

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("NEXT_PUBLIC_SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const JWT_SECRET = Deno.env.get("JWT_SECRET") ?? "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const RESEND_FROM = Deno.env.get("RESEND_FROM") ?? "BeyondPath <hello@beyondpath.tw>";

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

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!RESEND_API_KEY || !to) return false;
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": "Bearer " + RESEND_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ from: RESEND_FROM, to: [to], subject, html }),
    });
    return r.ok;
  } catch {
    return false;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST") return jsonRes({ ok: false, error: "method not allowed" }, 405);

  let body: { contract_id?: string; role?: string; score?: number; comment?: string; is_anonymous?: boolean; token?: string };
  try { body = await req.json(); } catch { return jsonRes({ ok: false, error: "bad body" }, 400); }

  if (!body.contract_id || !body.role || typeof body.score !== "number" || !body.token) {
    return jsonRes({ ok: false, error: "contract_id, role, score, token all required" }, 400);
  }
  if (body.role !== "client" && body.role !== "worker") {
    return jsonRes({ ok: false, error: "role must be client or worker" }, 400);
  }
  if (body.score < 0 || body.score > 10 || !Number.isInteger(body.score)) {
    return jsonRes({ ok: false, error: "score must be integer 0-10" }, 400);
  }
  // is_anonymous only allowed for worker role
  const isAnon = body.role === "worker" ? !!body.is_anonymous : false;

  // verify JWT token
  const mod = await import("../_shared/contract-jwt.ts");
  const verifyContractToken = mod.verifyContractToken;
  const payload = await verifyContractToken(body.token, JWT_SECRET);
  if (!payload) return jsonRes({ ok: false, error: "invalid or expired token" }, 401);
  if (payload.contract_id !== body.contract_id) return jsonRes({ ok: false, error: "token contract_id mismatch" }, 401);
  if (payload.role !== body.role) return jsonRes({ ok: false, error: "token role mismatch" }, 401);

  // get contract + snapshot
  const cRes = await fetch(
    SUPABASE_URL + "/rest/v1/contracts?id=eq." + body.contract_id + "&select=*",
    { headers: authHeaders() }
  );
  const cRows = await cRes.json();
  if (!Array.isArray(cRows) || cRows.length === 0) return jsonRes({ ok: false, error: "contract not found" }, 404);
  const c = cRows[0];
  const snap = c.contract_snapshot || {};

  // capture IP + UA for fraud detection
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "";
  const ua = req.headers.get("user-agent") || "";

  // insert nps_response (unique constraint will reject duplicates)
  const insRes = await fetch(
    SUPABASE_URL + "/rest/v1/nps_responses",
    {
      method: "POST",
      headers: { ...authHeaders(), "Prefer": "return=representation" },
      body: JSON.stringify({
        contract_id: body.contract_id,
        role: body.role,
        score: body.score,
        comment: body.comment || null,
        is_anonymous: isAnon,
        submitted_ip: ip.slice(0, 64),
        submitted_user_agent: ua.slice(0, 256),
      }),
    }
  );
  if (!insRes.ok) {
    const txt = await insRes.text();
    if (txt.indexOf("nps_responses_unique") >= 0 || txt.indexOf("duplicate") >= 0) {
      return jsonRes({ ok: false, error: "您已評過此案件 . duplicate submission rejected" }, 409);
    }
    return jsonRes({ ok: false, error: "nps insert failed", detail: txt }, 500);
  }

  // recalc worker tier (only when worker_application_id exists)
  const workerAppId = c.worker_application_id;
  let tierResult: unknown = null;
  if (workerAppId) {
    try {
      // direct internal fetch to recalc-worker-tier Edge Function
      const rtRes = await fetch(SUPABASE_URL + "/functions/v1/recalc-worker-tier", {
        method: "POST",
        headers: {
          "apikey": SUPABASE_SERVICE_ROLE_KEY,
          "Authorization": "Bearer " + SUPABASE_SERVICE_ROLE_KEY,
          "Content-Type": "application/json",
          "x-internal-secret": SUPABASE_SERVICE_ROLE_KEY,
        },
        body: JSON.stringify({ worker_application_id: workerAppId, internal: true }),
      });
      tierResult = await rtRes.json();
    } catch (e) {
      console.warn("[submit-nps] recalc-worker-tier failed:", e);
    }
  }

  // confirmation email to submitter
  const submitterEmail = body.role === "client" ? snap.client_email : snap.worker_email;
  const submitterName = body.role === "client" ? snap.client_name : snap.worker_name;
  if (submitterEmail) {
    const html =
      "<!doctype html><html><body style=\"font-family:system-ui,sans-serif;line-height:1.7;color:#222;max-width:600px;margin:24px auto;padding:0 16px\">" +
      "<h2 style=\"border-bottom:2px solid #4ade80;padding-bottom:8px\">BeyondPath . 感謝您的評分</h2>" +
      "<p>" + (submitterName || "您") + ",</p>" +
      "<p>已收到您對合約 <code>" + body.contract_id.slice(0, 8) + "</code> 的 " + body.score + " / 10 評分 . 感謝您的回饋。</p>" +
      (isAnon ? "<p style=\"color:#888;font-size:13px\">您選擇了匿名提交 . 平台不會關聯此評分至您的身份。</p>" : "") +
      "<hr><p style=\"font-size:11px;color:#999\">BeyondPath v1.0 . Phase 3 結案 NPS</p>" +
      "</body></html>";
    await sendEmail(submitterEmail, "BeyondPath . 評分已收到 . 感謝", html);
  }

  return jsonRes({
    ok: true,
    contract_id: body.contract_id,
    role: body.role,
    score: body.score,
    tier_recalc: tierResult,
  });
});
