// BeyondPath v1.0 . Edge Function . trigger-arbitration
// Phase 3+ . 2026-05-28 calcifer . 件 B 仲裁
// Spec: client 第 3 次 reject 時 auto-trigger . admin 也可手動

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { signContractToken } from "../_shared/contract-jwt.ts";
import { notifyEdward } from "../_shared/notify-edward.ts";  // 2026-06-01 calcifer doc42 . 仲裁發起推 Edward

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("NEXT_PUBLIC_SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const JWT_SECRET = Deno.env.get("JWT_SECRET") ?? "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const RESEND_FROM = Deno.env.get("RESEND_FROM") ?? "BeyondPath <hello@beyondpath.tw>";
const PUBLIC_SITE_BASE = Deno.env.get("PUBLIC_SITE_BASE") ?? "https://beyondpath.tw";
const INTERNAL_SHARED_SECRET = Deno.env.get("INTERNAL_FN_SECRET") ?? "";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-internal-secret",
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

function addBusinessDays(start: Date, days: number): Date {
  const d = new Date(start);
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    const wd = d.getDay();
    if (wd !== 0 && wd !== 6) added++;
  }
  return d;
}

async function sendArbitrationNotification(contract: any, milestone: any, arbitrationCase: any): Promise<void> {
  if (!RESEND_API_KEY) return;
  const snap = contract.contract_snapshot || {};
  const sides: Array<{ email?: string; name?: string; role: "client" | "worker" }> = [
    { email: snap.client_email, name: snap.client_name, role: "client" },
    { email: snap.worker_email, name: snap.worker_name, role: "worker" },
  ];
  for (const s of sides) {
    if (!s.email) continue;
    const tok = await signContractToken({ contract_id: contract.id, role: s.role }, JWT_SECRET, 14 * 24 * 3600);
    const url = PUBLIC_SITE_BASE + "/arbitration.html?case_id=" + arbitrationCase.id + "&role=" + s.role + "&token=" + tok;
    const css = "font-family:system-ui,sans-serif;line-height:1.7;color:#222;max-width:600px;margin:24px auto;padding:0 16px";
    const btnCss = "display:inline-block;padding:12px 24px;background:#d94a4a;color:#fff;text-decoration:none;border-radius:6px;font-weight:600";
    const deadlineStr = new Date(arbitrationCase.position_deadline).toLocaleString("zh-TW", { dateStyle: "long", timeStyle: "short" });
    const subject = "BeyondPath . Arbitration opened . Action required";
    const html =
      "<!doctype html><html><body style=\"" + css + "\">" +
      "<h2 style=\"border-bottom:2px solid #d94a4a;padding-bottom:8px\">BeyondPath . Arbitration Case Opened</h2>" +
      "<p>" + (s.name || "Party") + ",</p>" +
      "<p>This milestone has been rejected 3 times. An arbitration case has been opened.</p>" +
      "<ul>" +
      "<li>Contract: <code>" + contract.id.slice(0, 8) + "</code></li>" +
      "<li>Milestone: " + (milestone.title || "Milestone " + milestone.milestone_number) + "</li>" +
      "<li>Position deadline: <strong>" + deadlineStr + "</strong> (5 working days)</li>" +
      "</ul>" +
      "<p>Submit your position + supporting evidence before the deadline:</p>" +
      "<p style=\"margin:20px 0\"><a href=\"" + url + "\" style=\"" + btnCss + "\">Submit position (14 days)</a></p>" +
      "<p style=\"font-size:12px;color:#888\">If you do not submit by the deadline, the platform will arbitrate based on the other party position alone.</p>" +
      "<hr><p style=\"font-size:11px;color:#999\">BeyondPath v1.0 . Phase 3+ Arbitration</p>" +
      "</body></html>";
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": "Bearer " + RESEND_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ from: RESEND_FROM, to: [s.email], subject, html }),
      });
    } catch (e) { console.warn("arbitration notification failed", s.email, e); }
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST") return jsonRes({ ok: false, error: "method not allowed" }, 405);

  let allowed = false;
  const internalSecret = req.headers.get("x-internal-secret");
  if (INTERNAL_SHARED_SECRET && internalSecret === INTERNAL_SHARED_SECRET) allowed = true;
  if (!allowed) {
    const auth = req.headers.get("Authorization") || "";
    if (auth.startsWith("Bearer ") && auth.length > 20) {
      const userJwt = auth.slice(7);
      const userRes = await fetch(SUPABASE_URL + "/auth/v1/user", {
        headers: { "apikey": SUPABASE_SERVICE_ROLE_KEY, "Authorization": "Bearer " + userJwt },
      });
      if (userRes.ok) {
        const user = await userRes.json();
        if (user.email === "edwardt0303@gmail.com") allowed = true;
      }
    }
  }
  if (!allowed) return jsonRes({ ok: false, error: "admin or internal auth required" }, 401);

  let body: { milestone_id?: string; trigger_reason?: string };
  try { body = await req.json(); } catch { return jsonRes({ ok: false, error: "bad body" }, 400); }
  if (!body.milestone_id) return jsonRes({ ok: false, error: "milestone_id required" }, 400);

  const mRes = await fetch(SUPABASE_URL + "/rest/v1/contract_milestones?id=eq." + body.milestone_id + "&select=*", { headers: authHeaders() });
  const mRows = await mRes.json();
  if (!Array.isArray(mRows) || mRows.length === 0) return jsonRes({ ok: false, error: "milestone not found" }, 404);
  const milestone = mRows[0];

  if (milestone.arbitration_case_id) return jsonRes({ ok: false, error: "arbitration already opened for this milestone", case_id: milestone.arbitration_case_id }, 409);

  const cRes = await fetch(SUPABASE_URL + "/rest/v1/contracts?id=eq." + milestone.contract_id + "&select=*", { headers: authHeaders() });
  const cRows = await cRes.json();
  if (!Array.isArray(cRows) || cRows.length === 0) return jsonRes({ ok: false, error: "contract not found" }, 404);
  const contract = cRows[0];

  const triggeredAt = new Date();
  const deadline = addBusinessDays(triggeredAt, 5);

  const insertRes = await fetch(SUPABASE_URL + "/rest/v1/arbitration_cases", {
    method: "POST",
    headers: { ...authHeaders(), "Prefer": "return=representation" },
    body: JSON.stringify({
      contract_id: milestone.contract_id,
      milestone_id: body.milestone_id,
      triggered_at: triggeredAt.toISOString(),
      triggered_reason: body.trigger_reason || ("auto: dispute_count >= " + milestone.dispute_count),
      trigger_dispute_count: milestone.dispute_count || 0,
      position_deadline: deadline.toISOString(),
      verdict_decision: "pending",
      status: "pending",
    }),
  });
  if (!insertRes.ok) {
    const errTxt = await insertRes.text();
    return jsonRes({ ok: false, error: "arbitration case insert failed", detail: errTxt.slice(0, 200) }, 500);
  }
  const insertRows = await insertRes.json();
  const arbitrationCase = Array.isArray(insertRows) ? insertRows[0] : null;

  await fetch(SUPABASE_URL + "/rest/v1/contract_milestones?id=eq." + body.milestone_id, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({
      status: "arbitration",
      arbitration_case_id: arbitrationCase.id,
    }),
  });

  fetch(SUPABASE_URL + "/rest/v1/contract_milestones_history", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      milestone_id: body.milestone_id,
      action: "arbitration_open",
      action_by_role: "system",
      notes: body.trigger_reason || "auto-triggered after 3 rejects",
      metadata: { case_id: arbitrationCase.id, deadline: deadline.toISOString() },
    }),
  }).catch(() => {});

  sendArbitrationNotification(contract, milestone, arbitrationCase).catch((e) => console.warn("notify failed", e));

  // 2026-06-01 calcifer doc42 . 緊急即時通知 Edward (仲裁是高優先 . 不進每日簡報)
  // fire-and-forget . 絕不阻斷 API response
  (function () {
    const snap = (contract.contract_snapshot || {}) as Record<string, any>;
    let deadlineStr = "";
    try {
      deadlineStr = new Date(arbitrationCase.position_deadline)
        .toLocaleString("zh-TW", { timeZone: "Asia/Taipei", dateStyle: "long", timeStyle: "short" });
    } catch (_e) { deadlineStr = String(arbitrationCase.position_deadline || ""); }
    notifyEdward("arbitration_opened", {
      title: (milestone.title || ("Milestone " + milestone.milestone_number)) + " 進入仲裁",
      workerName: snap.worker_name || null,
      clientName: snap.client_name || null,
      milestoneTitle: milestone.title || ("Milestone " + milestone.milestone_number),
      deadlineStr: deadlineStr,
      caseId: arbitrationCase.id,
      contractId: contract.id,
    }).catch(function () {});
  })();

  return jsonRes({ ok: true, arbitration_case: arbitrationCase });
});
