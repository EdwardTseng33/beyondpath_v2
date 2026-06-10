// BeyondPath v1.0 . Edge Function . client-acceptance
// Phase 3+ . 2026-05-28 calcifer . client 自助 approve/dispute (走 contract-jwt verify)

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { verifyContractToken, signContractToken } from "../_shared/contract-jwt.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("NEXT_PUBLIC_SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const JWT_SECRET = Deno.env.get("JWT_SECRET") ?? "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const RESEND_FROM = Deno.env.get("RESEND_FROM") ?? "BeyondPath <hello@beyondpath.tw>";
const PUBLIC_SITE_BASE = Deno.env.get("PUBLIC_SITE_BASE") ?? "https://beyondpath.tw";
const INTERNAL_FN_SECRET = Deno.env.get("INTERNAL_FN_SECRET") ?? "";

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

async function notifyWorker(contract: any, milestone: any, action: string, reason: string | null, disputeCount: number, arbitrationOpened: boolean): Promise<void> {
  if (!RESEND_API_KEY) return;
  const snap = contract.contract_snapshot || {};
  if (!snap.worker_email) return;
  const tok = await signContractToken({ contract_id: contract.id, role: "worker" }, JWT_SECRET, 14 * 24 * 3600);
  const url = PUBLIC_SITE_BASE + "/milestone-detail.html?contract_id=" + contract.id + "&milestone_id=" + milestone.id + "&token=" + tok;
  const css = "font-family:system-ui,sans-serif;line-height:1.7;color:#222;max-width:600px;margin:24px auto;padding:0 16px";
  const btnCss = "display:inline-block;padding:12px 24px;background:#4ade80;color:#fff;text-decoration:none;border-radius:6px;font-weight:600";
  let subject: string;
  let html: string;
  if (action === "approve") {
    subject = "BeyondPath . Milestone approved . " + (milestone.title || "Milestone " + milestone.milestone_number);
    html = "<!doctype html><html><body style=\"" + css + "\"><h2 style=\"border-bottom:2px solid #4ade80;padding-bottom:8px\">Milestone Approved</h2><p>" + (snap.worker_name || "Worker") + ",</p><p>Client has approved milestone <strong>" + (milestone.title || "Milestone " + milestone.milestone_number) + "</strong>. Payment of <strong>" + (milestone.amount_pct || 30) + "%</strong> is now releasable.</p><hr><p style=\"font-size:11px;color:#999\">BeyondPath v1.0</p></body></html>";
  } else {
    const arbNote = arbitrationOpened
      ? "<p style=\"background:#fee;padding:10px;border-left:3px solid #d94a4a\"><strong>Note:</strong> dispute count reached 3 . arbitration case has been opened . check email for next steps.</p>"
      : "<p style=\"color:#888\">Dispute " + disputeCount + " / 3 . 3 disputes triggers arbitration.</p>";
    subject = "BeyondPath . Revision requested . " + (milestone.title || "Milestone " + milestone.milestone_number);
    html = "<!doctype html><html><body style=\"" + css + "\"><h2 style=\"border-bottom:2px solid #f5a623;padding-bottom:8px\">Revision Requested</h2><p>" + (snap.worker_name || "Worker") + ",</p><p>Client requested a revision for milestone <strong>" + (milestone.title || "Milestone " + milestone.milestone_number) + "</strong>.</p><p><strong>Reason:</strong></p><p style=\"background:#fafafa;padding:10px;border-left:3px solid #ccc\">" + (reason || "(none)") + "</p>" + arbNote + "<p style=\"margin:20px 0\"><a href=\"" + url + "\" style=\"" + btnCss + "\">View milestone + upload v2</a></p><hr><p style=\"font-size:11px;color:#999\">BeyondPath v1.0</p></body></html>";
  }
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": "Bearer " + RESEND_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ from: RESEND_FROM, to: [snap.worker_email], subject, html }),
    });
  } catch (e) { console.warn("worker notify failed", e); }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST") return jsonRes({ ok: false, error: "method not allowed" }, 405);

  const ip = getClientIp(req);

  if (!JWT_SECRET) return jsonRes({ ok: false, error: "JWT_SECRET not configured" }, 500);

  let body: { milestone_id?: string; action?: string; dispute_reason?: string; token?: string };
  try { body = await req.json(); } catch { return jsonRes({ ok: false, error: "bad body" }, 400); }
  if (!body.milestone_id || !body.action || !body.token) return jsonRes({ ok: false, error: "milestone_id + action + token required" }, 400);
  if (body.action !== "approve" && body.action !== "dispute") return jsonRes({ ok: false, error: "action must be approve or dispute" }, 400);
  if (body.action === "dispute" && !body.dispute_reason) return jsonRes({ ok: false, error: "dispute_reason required for dispute" }, 400);

  const payload = await verifyContractToken(body.token, JWT_SECRET);
  if (!payload) return jsonRes({ ok: false, error: "invalid or expired token" }, 401);
  if (payload.role !== "client") return jsonRes({ ok: false, error: "only client can approve/dispute" }, 403);

  const mRes = await fetch(SUPABASE_URL + "/rest/v1/contract_milestones?id=eq." + body.milestone_id + "&select=*", { headers: authHeaders() });
  const mRows = await mRes.json();
  if (!Array.isArray(mRows) || mRows.length === 0) return jsonRes({ ok: false, error: "milestone not found" }, 404);
  const milestone = mRows[0];
  if (milestone.contract_id !== payload.contract_id) return jsonRes({ ok: false, error: "milestone not in token contract" }, 403);
  if (milestone.status !== "delivered") return jsonRes({ ok: false, error: "milestone not in delivered state" }, 409);

  const cRes = await fetch(SUPABASE_URL + "/rest/v1/contracts?id=eq." + payload.contract_id + "&select=*", { headers: authHeaders() });
  const cRows = await cRes.json();
  if (!Array.isArray(cRows) || cRows.length === 0) return jsonRes({ ok: false, error: "contract not found" }, 404);
  const contract = cRows[0];

  const nowIso = new Date().toISOString();
  let patch: Record<string, unknown> = {};
  let newDisputeCount = milestone.dispute_count || 0;
  let arbitrationOpened = false;

  if (body.action === "approve") {
    patch = { status: "approved", approved_at: nowIso };
  } else {
    newDisputeCount = newDisputeCount + 1;
    patch = {
      status: newDisputeCount >= 3 ? "arbitration" : "disputed",
      disputed_at: nowIso,
      dispute_count: newDisputeCount,
      dispute_reason: body.dispute_reason,
      disputed_reason_client: body.dispute_reason,
    };
  }

  const upRes = await fetch(SUPABASE_URL + "/rest/v1/contract_milestones?id=eq." + body.milestone_id, {
    method: "PATCH",
    headers: { ...authHeaders(), "Prefer": "return=representation" },
    body: JSON.stringify(patch),
  });
  if (!upRes.ok) {
    const errTxt = await upRes.text();
    return jsonRes({ ok: false, error: "milestone update failed", detail: errTxt.slice(0, 200) }, 500);
  }

  // history audit
  fetch(SUPABASE_URL + "/rest/v1/contract_milestones_history", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      milestone_id: body.milestone_id,
      action: body.action,
      action_by_role: "client",
      action_by_ip: ip,
      attempt_number: milestone.attempts || 1,
      notes: body.dispute_reason || null,
      metadata: { dispute_count: newDisputeCount },
    }),
  }).catch(() => {});

  // auto-trigger arbitration on 3rd dispute
  if (body.action === "dispute" && newDisputeCount >= 3) {
    try {
      const trigRes = await fetch(SUPABASE_URL + "/functions/v1/trigger-arbitration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-secret": INTERNAL_FN_SECRET,
        },
        body: JSON.stringify({ milestone_id: body.milestone_id, trigger_reason: "auto: 3rd client dispute" }),
      });
      if (trigRes.ok) arbitrationOpened = true;
    } catch (e) { console.warn("auto trigger-arbitration failed", e); }
  }

  // if approved & all milestones approved -> trigger NPS invites (re-use update-milestone-status logic via internal admin call)
  if (body.action === "approve") {
    const allMRes = await fetch(SUPABASE_URL + "/rest/v1/contract_milestones?contract_id=eq." + payload.contract_id + "&select=status", { headers: authHeaders() });
    const allM = await allMRes.json();
    if (Array.isArray(allM) && allM.length >= 3) {
      const allApproved = allM.every((x: { status: string }) => x.status === "approved");
      if (allApproved && !contract.nps_invited_at) {
        // inline NPS invite via direct insert + email (避免循環呼叫)
        const sides: Array<{ email?: string; name?: string; role: "client" | "worker" }> = [
          { email: (contract.contract_snapshot || {}).client_email, name: (contract.contract_snapshot || {}).client_name, role: "client" },
          { email: (contract.contract_snapshot || {}).worker_email, name: (contract.contract_snapshot || {}).worker_name, role: "worker" },
        ];
        for (const s of sides) {
          if (!s.email || !RESEND_API_KEY) continue;
          const tok = await signContractToken({ contract_id: contract.id, role: s.role }, JWT_SECRET, 14 * 24 * 3600);
          const npsUrl = PUBLIC_SITE_BASE + "/nps.html?id=" + contract.id + "&role=" + s.role + "&token=" + tok;
          const css = "font-family:system-ui,sans-serif;line-height:1.7;color:#222;max-width:600px;margin:24px auto;padding:0 16px";
          const btnCss = "display:inline-block;padding:12px 24px;background:#4ade80;color:#fff;text-decoration:none;border-radius:6px;font-weight:600";
          const html = "<!doctype html><html><body style=\"" + css + "\"><h2>BeyondPath . Case complete . Please rate</h2><p>" + (s.name || "You") + ",</p><p>All milestones approved . please give a rating (0-10):</p><p style=\"margin:20px 0\"><a href=\"" + npsUrl + "\" style=\"" + btnCss + "\">Rate now (14 days)</a></p><hr><p style=\"font-size:11px;color:#999\">BeyondPath v1.0</p></body></html>";
          fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { "Authorization": "Bearer " + RESEND_API_KEY, "Content-Type": "application/json" },
            body: JSON.stringify({ from: RESEND_FROM, to: [s.email], subject: "BeyondPath . Case complete . Please rate", html }),
          }).catch(() => {});
        }
        fetch(SUPABASE_URL + "/rest/v1/contracts?id=eq." + contract.id, {
          method: "PATCH", headers: authHeaders(), body: JSON.stringify({ nps_invited_at: nowIso }),
        }).catch(() => {});
      }
    }
  }

  notifyWorker(contract, milestone, body.action, body.dispute_reason || null, newDisputeCount, arbitrationOpened).catch((e) => console.warn("notify worker failed", e));

  return jsonRes({ ok: true, status: patch.status, dispute_count: newDisputeCount, arbitration: arbitrationOpened });
});
