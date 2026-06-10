// BeyondPath v1.0 . Edge Function . update-milestone-status
// Phase 3 履約看板 . 2026-05-28 calcifer
// Spec: admin only POST { milestone_id, new_status, deliverable_text?, dispute_reason? }
//       new_status in [in_progress, delivered, approved, disputed]
//       dispute_count >= 3 . auto arbitration

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

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!RESEND_API_KEY || !to) return false;
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": "Bearer " + RESEND_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ from: RESEND_FROM, to: [to], subject, html }),
    });
    return r.ok;
  } catch (e) {
    console.warn("[update-milestone-status] email failed " + to + ":", e);
    return false;
  }
}

function approvedHtml(workerName: string, milestoneTitle: string, amountPct: number, contractId: string): string {
  const css = "font-family:system-ui,sans-serif;line-height:1.7;color:#222;max-width:600px;margin:24px auto;padding:0 16px";
  const h2css = "border-bottom:2px solid #4ade80;padding-bottom:8px";
  const idShort = contractId.slice(0, 8);
  return (
    "<!doctype html><html><body style=\"" + css + "\">" +
    "<h2 style=\"" + h2css + "\">BeyondPath . 里程碑驗收通過</h2>" +
    "<p>" + workerName + ",</p>" +
    "<p>客戶已驗收通過以下里程碑:</p>" +
    "<ul>" +
    "<li>里程碑: " + milestoneTitle + "</li>" +
    "<li>釋款比例: " + amountPct + "%</li>" +
    "<li>合約: <code>" + idShort + "</code></li>" +
    "</ul>" +
    "<p>BeyondPath 後台已記錄 . 釋款流程進行中。</p>" +
    "<hr><p style=\"font-size:11px;color:#999\">BeyondPath v1.0 . Phase 3 履約看板</p>" +
    "</body></html>"
  );
}

function disputedHtml(workerName: string, milestoneTitle: string, reason: string, disputeCount: number): string {
  const css = "font-family:system-ui,sans-serif;line-height:1.7;color:#222;max-width:600px;margin:24px auto;padding:0 16px";
  const h2css = "border-bottom:2px solid #f5a623;padding-bottom:8px";
  const warn = disputeCount >= 3
    ? "<p style=\"background:#fee;padding:10px;border-left:3px solid #d94a4a\">注意: 此里程碑已退件 " + disputeCount + " 次 . 已進入仲裁流程。</p>"
    : "<p style=\"color:#888\">此為第 " + disputeCount + " 次退件 . 累計 >= 3 次將進入仲裁。</p>";
  return (
    "<!doctype html><html><body style=\"" + css + "\">" +
    "<h2 style=\"" + h2css + "\">BeyondPath . 里程碑退件通知</h2>" +
    "<p>" + workerName + ",</p>" +
    "<p>客戶對以下里程碑有疑慮:</p>" +
    "<ul>" +
    "<li>里程碑: " + milestoneTitle + "</li>" +
    "<li>退件原因: " + reason + "</li>" +
    "</ul>" +
    warn +
    "<p>請與 BeyondPath 聯繫修正後重新交付。</p>" +
    "<hr><p style=\"font-size:11px;color:#999\">BeyondPath v1.0 . Phase 3</p>" +
    "</body></html>"
  );
}

async function triggerNpsInvites(contract: { id: string; nps_invited_at?: string }, snap: Record<string, string>): Promise<void> {
  const mod = await import("../_shared/contract-jwt.ts");
  const signContractToken = mod.signContractToken;
  const JWT_SECRET = Deno.env.get("JWT_SECRET") ?? "";
  if (!JWT_SECRET) {
    console.warn("[update-milestone-status] JWT_SECRET missing . skip NPS invite");
    return;
  }

  const sides: Array<{ email?: string; name?: string; role: "client" | "worker" }> = [
    { email: snap.client_email, name: snap.client_name, role: "client" },
    { email: snap.worker_email, name: snap.worker_name, role: "worker" },
  ];

  for (const s of sides) {
    if (!s.email) continue;
    const tok = await signContractToken({ contract_id: contract.id, role: s.role }, JWT_SECRET, 14 * 24 * 3600);
    const npsUrl = PUBLIC_SITE_BASE + "/nps.html?id=" + contract.id + "&role=" + s.role + "&token=" + tok;
    const css = "font-family:system-ui,sans-serif;line-height:1.7;color:#222;max-width:600px;margin:24px auto;padding:0 16px";
    const btnCss = "display:inline-block;padding:12px 24px;background:#4ade80;color:#fff;text-decoration:none;border-radius:6px;font-weight:600";
    const note = s.role === "worker"
      ? "<p style=\"font-size:13px;color:#666\">您可選擇匿名提交 . 平台會收到匿名後的分數但不會關聯您的身份。</p>"
      : "<p style=\"font-size:13px;color:#666\">您的評分將協助 BeyondPath 提升媒合品質。</p>";
    const idShort = contract.id.slice(0, 8);
    const html =
      "<!doctype html><html><body style=\"" + css + "\">" +
      "<h2 style=\"border-bottom:2px solid #4ade80;padding-bottom:8px\">BeyondPath . 案件完成 . 邀請評分</h2>" +
      "<p>" + (s.name || "您") + ",</p>" +
      "<p>合約 <code>" + idShort + "</code> 已完成所有里程碑驗收 . BeyondPath 邀請您給此次合作一個評分(0-10):</p>" +
      "<p style=\"margin:20px 0\"><a href=\"" + npsUrl + "\" style=\"" + btnCss + "\">前往評分(14 天內有效)</a></p>" +
      note +
      "<hr><p style=\"font-size:11px;color:#999\">BeyondPath v1.0 . Phase 3 結案 NPS</p>" +
      "</body></html>";
    await sendEmail(s.email, "BeyondPath . 案件完成 . 邀請您評分", html);
  }

  await fetch(
    SUPABASE_URL + "/rest/v1/contracts?id=eq." + contract.id,
    {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ nps_invited_at: new Date().toISOString() }),
    }
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

  let body: { milestone_id?: string; new_status?: string; deliverable_text?: string; dispute_reason?: string };
  try { body = await req.json(); } catch { return jsonRes({ ok: false, error: "bad body" }, 400); }
  if (!body.milestone_id) return jsonRes({ ok: false, error: "milestone_id required" }, 400);
  if (!body.new_status) return jsonRes({ ok: false, error: "new_status required" }, 400);
  if (["in_progress", "delivered", "approved", "disputed"].indexOf(body.new_status) < 0) {
    return jsonRes({ ok: false, error: "invalid new_status" }, 400);
  }

  const mRes = await fetch(
    SUPABASE_URL + "/rest/v1/contract_milestones?id=eq." + body.milestone_id + "&select=*",
    { headers: authHeaders() }
  );
  const mRows = await mRes.json();
  if (!Array.isArray(mRows) || mRows.length === 0) return jsonRes({ ok: false, error: "milestone not found" }, 404);
  const m = mRows[0];

  const cRes = await fetch(
    SUPABASE_URL + "/rest/v1/contracts?id=eq." + m.contract_id + "&select=*",
    { headers: authHeaders() }
  );
  const cRows = await cRes.json();
  if (!Array.isArray(cRows) || cRows.length === 0) return jsonRes({ ok: false, error: "contract not found" }, 404);
  const c = cRows[0];
  const snap = c.contract_snapshot || {};

  const patch: Record<string, unknown> = { status: body.new_status };
  const now = new Date().toISOString();

  if (body.new_status === "delivered") {
    patch.delivered_at = now;
    if (body.deliverable_text) patch.deliverable_text = body.deliverable_text;
  } else if (body.new_status === "approved") {
    patch.approved_at = now;
  } else if (body.new_status === "disputed") {
    patch.disputed_at = now;
    patch.dispute_count = (m.dispute_count || 0) + 1;
    if (body.dispute_reason) patch.dispute_reason = body.dispute_reason;
    if ((patch.dispute_count as number) >= 3) {
      patch.status = "arbitration";
    }
    // Phase 3+ 2026-05-28 calcifer: 同步寫客戶自填退件原因
    if (body.dispute_reason) (patch as any).disputed_reason_client = body.dispute_reason;
  }

  const upRes = await fetch(
    SUPABASE_URL + "/rest/v1/contract_milestones?id=eq." + body.milestone_id,
    {
      method: "PATCH",
      headers: { ...authHeaders(), "Prefer": "return=representation" },
      body: JSON.stringify(patch),
    }
  );
  if (!upRes.ok) {
    const errTxt = await upRes.text();
    return jsonRes({ ok: false, error: "milestone update failed", detail: errTxt }, 500);
  }
  const upRows = await upRes.json();

  const emailSent: Record<string, boolean> = {};
  let npsTriggered = false;

  if (body.new_status === "approved" && snap.worker_email) {
    emailSent.worker = await sendEmail(
      snap.worker_email,
      "BeyondPath . 里程碑驗收通過 . " + (m.title || "Milestone " + m.milestone_number),
      approvedHtml(snap.worker_name || "Worker", m.title || "Milestone " + m.milestone_number, Number(m.amount_pct) || 0, m.contract_id)
    );

    const allMRes = await fetch(
      SUPABASE_URL + "/rest/v1/contract_milestones?contract_id=eq." + m.contract_id + "&select=status",
      { headers: authHeaders() }
    );
    const allM = await allMRes.json();
    if (Array.isArray(allM) && allM.length >= 3) {
      const allApproved = allM.every((x: { status: string }) => x.status === "approved");
      if (allApproved && !c.nps_invited_at) {
        await triggerNpsInvites(c, snap);
        npsTriggered = true;
      }
    }
  } else if (body.new_status === "disputed" && snap.worker_email) {
    emailSent.worker = await sendEmail(
      snap.worker_email,
      "BeyondPath . 里程碑退件通知",
      disputedHtml(snap.worker_name || "Worker", m.title || "Milestone " + m.milestone_number, body.dispute_reason || "(未填)", (patch.dispute_count as number) || 1)
    );
    // Phase 3+ 2026-05-28 calcifer: dispute_count >= 3 -> auto trigger-arbitration (internal call)
    if ((patch.dispute_count as number) >= 3) {
      try {
        const INTERNAL_FN_SECRET = Deno.env.get("INTERNAL_FN_SECRET") ?? "";
        await fetch(SUPABASE_URL + "/functions/v1/trigger-arbitration", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-internal-secret": INTERNAL_FN_SECRET,
          },
          body: JSON.stringify({ milestone_id: body.milestone_id, trigger_reason: "auto: 3rd reject by client" }),
        });
      } catch (e) {
        console.warn("trigger-arbitration internal call failed:", e);
      }
    }
  }

  return jsonRes({
    ok: true,
    milestone: upRows[0],
    email_sent: emailSent,
    nps_triggered: npsTriggered,
    arbitration: body.new_status === "disputed" && (patch.dispute_count as number) >= 3,
  });
});
