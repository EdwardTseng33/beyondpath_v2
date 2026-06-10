// BeyondPath POC . Edge Function . worker-ack-email
// 2026-05-20 . brief #2 . calcifer
//
// Trigger: client-side bpWorkerApply.submit success -> POST { worker_application_id }
// Why a dedicated Edge Function (not notify-lead-slack webhook):
//   - bpWorkerApply.submit happens AFTER worker-ai-interview returns status=complete
//   - notify-lead-slack already has buildWorkerConfirmEmail (legacy template)
//   - Brief #2 wants refined template aligned with decision-email style + Stage 1 ~28% framing
//   - Decoupling lets us route from worker.jsx submit success (more reliable than DB Webhook)
//
// Failure semantics: returns 200 ok:false on best-effort fail . worker already INSERTed OK
//
// Secrets required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, SLACK_BOT_TOKEN (optional)

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { checkRateLimit, getClientIp, rateLimitResponse } from "../_shared/rate-limit.ts";  // 2026-05-29 calcifer doc28 C . 防洗信限流
import { isAdminRequest } from "../_shared/admin.ts";  // admin JWT bypass
import { buildWorkerAckEmail } from "../_shared/confirmation-email-template.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("NEXT_PUBLIC_SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const RESEND_FROM = Deno.env.get("RESEND_FROM") ?? "BeyondPath <hello@beyondpath.tw>";
const SLACK_BOT_TOKEN = Deno.env.get("SLACK_BOT_TOKEN") ?? "";
const SLACK_ALERT_CHANNEL = Deno.env.get("SLACK_ALERT_CHANNEL") ?? "C0B3RRKGQCD";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
};

async function slackAlert(context: string, errorMsg: string): Promise<void> {
  if (!SLACK_BOT_TOKEN) return;
  try {
    await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + SLACK_BOT_TOKEN },
      body: JSON.stringify({
        channel: SLACK_ALERT_CHANNEL,
        text: "worker-ack-email ALERT " + context + " | err: " + String(errorMsg).slice(0, 280),
        unfurl_links: false,
      }),
    });
  } catch {
    // silent
  }
}

interface WorkerApplicationRow {
  id: string;
  email: string;
  display_name: string | null;
  l_score: number | null;
  tier_suggestion: string | null;
  verticals: string[] | null;
  case_count: string | null;
}

function authHeaders(): Record<string, string> {
  return {
    "apikey": SUPABASE_SERVICE_ROLE_KEY,
    "Authorization": "Bearer " + SUPABASE_SERVICE_ROLE_KEY,
    "Content-Type": "application/json",
  };
}

async function loadWorkerApp(id: string): Promise<WorkerApplicationRow | null> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !id) return null;
  const url = SUPABASE_URL + "/rest/v1/worker_applications?id=eq." + encodeURIComponent(id) +
    "&select=id,email,display_name,l_score,tier_suggestion,verticals,case_count";
  try {
    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) return null;
    const rows = await res.json();
    return Array.isArray(rows) && rows.length > 0 ? rows[0] as WorkerApplicationRow : null;
  } catch {
    return null;
  }
}

async function sendResendEmail(toEmail: string, subject: string, html: string, text: string): Promise<{ ok: boolean; error?: string }> {
  if (!RESEND_API_KEY) return { ok: false, error: "no-resend-key" };
  const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  if (!toEmail || !emailRe.test(toEmail)) return { ok: false, error: "invalid-email" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": "Bearer " + RESEND_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ from: RESEND_FROM, to: [toEmail], subject, html, text }),
    });
    if (!res.ok) {
      const detail = await res.text();
      return { ok: false, error: "resend-" + res.status + ":" + detail.slice(0, 200) };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

interface AckRequestBody {
  worker_application_id: string;
  email?: string;
  display_name?: string;
}

serve(async function (req: Request) {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: CORS_HEADERS });
  }

  // 2026-05-29 calcifer . doc 28 Part C Group B . IP 限流 (防洗信)
  // worker 申請後送一封 ack . 正常一人一次 . 限流 10/min 防有人狂觸發發信
  if (!(await isAdminRequest(req))) {
    const rl = await checkRateLimit("worker-ack-email", getClientIp(req), { limit: 10, windowSec: 60 });
    if (!rl.allowed) return rateLimitResponse(rl, CORS_HEADERS);
  }

  let body: AckRequestBody;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "invalid-json" }), {
      status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  if (!body.worker_application_id) {
    return new Response(JSON.stringify({ ok: false, error: "missing-worker_application_id" }), {
      status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const row = await loadWorkerApp(body.worker_application_id);
  if (!row) {
    return new Response(JSON.stringify({ ok: false, error: "worker-app-not-found" }), {
      status: 404, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const toEmail = body.email || row.email || "";
  const displayName = body.display_name || row.display_name || "";

  if (!toEmail) {
    return new Response(JSON.stringify({ ok: false, error: "no-recipient-email" }), {
      status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const email = buildWorkerAckEmail({
    display_name: displayName,
    l_score: row.l_score,
    tier_suggestion: row.tier_suggestion,
    verticals: Array.isArray(row.verticals) ? row.verticals : [],
    case_count: row.case_count,
  });

  const send = await sendResendEmail(toEmail, email.subject, email.html, email.text);
  if (!send.ok) {
    await slackAlert("send-fail id=" + row.id, send.error || "unknown");
  }

  return new Response(JSON.stringify({
    ok: send.ok,
    worker_application_id: row.id,
    email_to: toEmail,
    error: send.ok ? undefined : send.error,
  }), {
    status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
});
