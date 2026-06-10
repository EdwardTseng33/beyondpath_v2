// BeyondPath v1.0 . Edge Function . decide-arbitration
// Phase 3+ . 2026-05-28 calcifer . 件 B 仲裁判定 (admin only)
//
// Spec:
//   POST { case_id, verdict_decision, verdict_text, verdict_percent?, verdict_breach_multiplier?, final_payment_amount_ntd?, final_breach_amount_ntd? }
//   admin auth required
//   write verdict + status='resolved' + 寄存證副本給雙方 + handle milestone follow-up
//   verdict_decision:
//     - worker_redo: milestone status='in_progress' . attempts continue
//     - partial_pay: milestone status='approved' (但 amount_pct adjusted) + contract status logic
//     - contract_terminate: contract status='cancelled' . 違約金記錄

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("NEXT_PUBLIC_SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
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

async function sendVerdictCertificate(contract: any, milestone: any, arb: any): Promise<void> {
  if (!RESEND_API_KEY) return;
  const snap = contract.contract_snapshot || {};
  const sides: Array<{ email?: string; name?: string; role: "client" | "worker" }> = [
    { email: snap.client_email, name: snap.client_name, role: "client" },
    { email: snap.worker_email, name: snap.worker_name, role: "worker" },
  ];

  const decisionLabel = {
    worker_redo: "Worker re-does this milestone (attempts not incremented)",
    partial_pay: "Partial payment + contract terminate",
    contract_terminate: "Contract terminate + full refund + breach penalty",
  }[arb.verdict_decision] || arb.verdict_decision;

  const css = "font-family:system-ui,sans-serif;line-height:1.7;color:#222;max-width:600px;margin:24px auto;padding:0 16px";
  for (const s of sides) {
    if (!s.email) continue;
    const subject = "BeyondPath . Arbitration Verdict . " + arb.id.slice(0, 8);
    const html =
      "<!doctype html><html><body style=\"" + css + "\">" +
      "<h2 style=\"border-bottom:2px solid #4ade80;padding-bottom:8px\">BeyondPath . Arbitration Verdict . Evidence Copy</h2>" +
      "<p>" + (s.name || "Party") + ",</p>" +
      "<p>The arbitration case for contract <code>" + contract.id.slice(0, 8) + "</code> has been resolved.</p>" +
      "<h3>Verdict</h3>" +
      "<ul>" +
      "<li><strong>Decision:</strong> " + decisionLabel + "</li>" +
      (arb.verdict_percent != null ? "<li><strong>Payment percent:</strong> " + arb.verdict_percent + "%</li>" : "") +
      (arb.verdict_breach_multiplier != null ? "<li><strong>Breach multiplier:</strong> " + arb.verdict_breach_multiplier + "x</li>" : "") +
      (arb.final_payment_amount_ntd != null ? "<li><strong>Final payment:</strong> NT$" + arb.final_payment_amount_ntd + "</li>" : "") +
      (arb.final_breach_amount_ntd != null ? "<li><strong>Breach amount:</strong> NT$" + arb.final_breach_amount_ntd + "</li>" : "") +
      "</ul>" +
      "<h3>Reasoning</h3>" +
      "<p style=\"background:#f5f5f0;padding:12px 16px;border-left:3px solid #4ade80\">" + (arb.verdict_text || "(no reasoning provided)") + "</p>" +
      "<h3>Position History</h3>" +
      "<p><strong>Client position:</strong></p>" +
      "<p style=\"background:#fafafa;padding:8px 12px;border-left:2px solid #ccc;font-size:13px\">" + (arb.client_position_text || "(not submitted)") + "</p>" +
      "<p><strong>Worker position:</strong></p>" +
      "<p style=\"background:#fafafa;padding:8px 12px;border-left:2px solid #ccc;font-size:13px\">" + (arb.worker_position_text || "(not submitted)") + "</p>" +
      "<hr><p style=\"font-size:11px;color:#999\">BeyondPath v1.0 . Phase 3+ Arbitration . " + new Date().toISOString() + "</p>" +
      "</body></html>";
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": "Bearer " + RESEND_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ from: RESEND_FROM, to: [s.email], subject, html }),
      });
    } catch (e) { console.warn("verdict cert email failed", s.email, e); }
  }
}

interface ReqBody {
  case_id: string;
  verdict_decision: "worker_redo" | "partial_pay" | "contract_terminate";
  verdict_text: string;
  verdict_percent?: number;
  verdict_breach_multiplier?: number;
  final_payment_amount_ntd?: number;
  final_breach_amount_ntd?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST") return jsonRes({ ok: false, error: "method not allowed" }, 405);

  // admin auth
  const auth = req.headers.get("Authorization") || "";
  if (!auth.startsWith("Bearer ")) return jsonRes({ ok: false, error: "missing auth" }, 401);
  const userJwt = auth.slice(7);
  const userRes = await fetch(SUPABASE_URL + "/auth/v1/user", {
    headers: { "apikey": SUPABASE_SERVICE_ROLE_KEY, "Authorization": "Bearer " + userJwt },
  });
  if (!userRes.ok) return jsonRes({ ok: false, error: "invalid auth" }, 401);
  const user = await userRes.json();
  if (user.email !== "edwardt0303@gmail.com") return jsonRes({ ok: false, error: "admin only" }, 403);

  let body: ReqBody;
  try { body = await req.json(); } catch { return jsonRes({ ok: false, error: "bad body" }, 400); }
  if (!body.case_id || !body.verdict_decision || !body.verdict_text) {
    return jsonRes({ ok: false, error: "case_id + verdict_decision + verdict_text required" }, 400);
  }
  const validDecisions = ["worker_redo", "partial_pay", "contract_terminate"];
  if (validDecisions.indexOf(body.verdict_decision) < 0) return jsonRes({ ok: false, error: "bad verdict_decision" }, 400);

  const aRes = await fetch(SUPABASE_URL + "/rest/v1/arbitration_cases?id=eq." + body.case_id + "&select=*", { headers: authHeaders() });
  const aRows = await aRes.json();
  if (!Array.isArray(aRows) || aRows.length === 0) return jsonRes({ ok: false, error: "case not found" }, 404);
  const arb = aRows[0];

  if (arb.status === "resolved") return jsonRes({ ok: false, error: "case already resolved" }, 409);

  const nowIso = new Date().toISOString();
  const patch: Record<string, unknown> = {
    verdict_decision: body.verdict_decision,
    verdict_text: body.verdict_text,
    verdict_percent: body.verdict_percent ?? null,
    verdict_breach_multiplier: body.verdict_breach_multiplier ?? null,
    final_payment_amount_ntd: body.final_payment_amount_ntd ?? null,
    final_breach_amount_ntd: body.final_breach_amount_ntd ?? null,
    verdict_by: user.id,
    verdict_at: nowIso,
    status: "resolved",
    certificate_sent_at: nowIso,
  };

  const upRes = await fetch(SUPABASE_URL + "/rest/v1/arbitration_cases?id=eq." + body.case_id, {
    method: "PATCH",
    headers: { ...authHeaders(), "Prefer": "return=representation" },
    body: JSON.stringify(patch),
  });
  if (!upRes.ok) {
    const errTxt = await upRes.text();
    return jsonRes({ ok: false, error: "verdict update failed", detail: errTxt.slice(0, 200) }, 500);
  }
  const upRows = await upRes.json();
  const updatedArb = Array.isArray(upRows) ? upRows[0] : null;

  // load milestone + contract for downstream
  const mRes = await fetch(SUPABASE_URL + "/rest/v1/contract_milestones?id=eq." + arb.milestone_id + "&select=*", { headers: authHeaders() });
  const mRows = await mRes.json();
  const milestone = Array.isArray(mRows) && mRows.length > 0 ? mRows[0] : null;
  const cRes = await fetch(SUPABASE_URL + "/rest/v1/contracts?id=eq." + arb.contract_id + "&select=*", { headers: authHeaders() });
  const cRows = await cRes.json();
  const contract = Array.isArray(cRows) && cRows.length > 0 ? cRows[0] : null;

  // milestone follow-up
  if (milestone) {
    if (body.verdict_decision === "worker_redo") {
      await fetch(SUPABASE_URL + "/rest/v1/contract_milestones?id=eq." + arb.milestone_id, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ status: "in_progress", dispute_count: 0 }),
      });
    } else if (body.verdict_decision === "partial_pay") {
      await fetch(SUPABASE_URL + "/rest/v1/contract_milestones?id=eq." + arb.milestone_id, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ status: "approved", approved_at: nowIso }),
      });
    } else if (body.verdict_decision === "contract_terminate" && contract) {
      await fetch(SUPABASE_URL + "/rest/v1/contracts?id=eq." + contract.id, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ status: "cancelled" }),
      });
    }

    fetch(SUPABASE_URL + "/rest/v1/contract_milestones_history", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        milestone_id: arb.milestone_id,
        action: "arbitration_resolve",
        action_by_role: "admin",
        notes: "verdict: " + body.verdict_decision,
        metadata: {
          case_id: arb.id,
          decision: body.verdict_decision,
          verdict_percent: body.verdict_percent,
          breach_multiplier: body.verdict_breach_multiplier,
        },
      }),
    }).catch(() => {});
  }

  // send verdict certificate to both sides
  if (contract && milestone && updatedArb) {
    sendVerdictCertificate(contract, milestone, updatedArb).catch((e) => console.warn("cert email failed", e));
  }

  return jsonRes({
    ok: true,
    case: updatedArb,
    milestone_followup: body.verdict_decision,
  });
});
