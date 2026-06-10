// BeyondPath POC . Edge Function . worker-accept-decline
// Spec ref: docs/launch/08-matching-pipeline-spec-calcifer.md Q3 Task 4
// 2026-05-20 . Q3 Task 4 . calcifer
//
// Trigger: GET /functions/v1/worker-accept-decline?token=...&action=accept|decline
// Flow:
//   1. Verify JWT_SECRET present
//   2. Verify token signature + exp + payload
//   3. Find worker_decisions row by token_hash
//   4. If status already accepted/declined/expired: redirect to landing with state=already
//   5. Update status = accepted|declined + decided_at
//   6. Redirect to landing.html?worker_decision=success&action=accept|decline

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { verifyDecisionToken, sha256Hex } from "../_shared/jwt-light.ts";
import { checkRateLimit, getClientIp } from "../_shared/rate-limit.ts";  // 2026-05-29 calcifer doc28 C . 防洗限流
import { notifyEdward } from "../_shared/notify-edward.ts";  // 2026-06-01 calcifer doc42 M-1 . worker 接受/婉拒推 Edward

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("NEXT_PUBLIC_SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const JWT_SECRET = Deno.env.get("JWT_SECRET") ?? "";
const PUBLIC_LANDING = Deno.env.get("PUBLIC_LANDING") ?? "https://beyondpath.tw/landing.html";

function authHeaders(): Record<string, string> {
  return {
    "apikey": SUPABASE_SERVICE_ROLE_KEY,
    "Authorization": "Bearer " + SUPABASE_SERVICE_ROLE_KEY,
    "Content-Type": "application/json",
  };
}

function buildRedirectUrl(action: string, state: string): string {
  const sep = PUBLIC_LANDING.indexOf("?") === -1 ? "?" : "&";
  return PUBLIC_LANDING + sep + "worker_decision=" + encodeURIComponent(state) +
    "&action=" + encodeURIComponent(action);
}

function redirect(url: string): Response {
  return new Response(null, { status: 302, headers: { "Location": url } });
}

async function findDecisionByTokenHash(tokenHash: string, decisionId: string): Promise<{ id: string; decision: string } | null> {
  const url = SUPABASE_URL + "/rest/v1/worker_decisions?id=eq." + encodeURIComponent(decisionId) +
    "&token_hash=eq." + encodeURIComponent(tokenHash) + "&select=id,decision&limit=1";
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) return null;
  const rows = await res.json();
  return Array.isArray(rows) && rows.length > 0 ? rows[0] as { id: string; decision: string } : null;
}

async function updateDecisionStatus(decisionId: string, action: "accept" | "decline"): Promise<boolean> {
  const url = SUPABASE_URL + "/rest/v1/worker_decisions?id=eq." + encodeURIComponent(decisionId);
  const newStatus = action === "accept" ? "accepted" : "declined";
  const res = await fetch(url, {
    method: "PATCH",
    headers: { ...authHeaders(), "Prefer": "return=minimal" },
    body: JSON.stringify({ decision: newStatus, decided_at: new Date().toISOString() }),
  });
  return res.ok;
}

// 2026-06-01 calcifer doc42 M-1 . 取 worker 名 + client 公司 + 案名 . 通知 Edward 用
// PostgREST embedded resource . 一次 join worker_applications + client_intakes . 不多打 API
async function fetchDecisionContext(decisionId: string): Promise<{
  workerName: string; clientName: string; projectTitle: string; vertical: string;
} | null> {
  const sel = "select=id," +
    "worker_applications(display_name,email)," +
    "client_intakes(company_name,vertical,intake_data)";
  const url = SUPABASE_URL + "/rest/v1/worker_decisions?id=eq." + encodeURIComponent(decisionId) + "&" + sel + "&limit=1";
  try {
    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) return null;
    const rows = await res.json();
    const row = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
    if (!row) return null;
    const wa = row.worker_applications || {};
    const ci = row.client_intakes || {};
    const id = (ci.intake_data && typeof ci.intake_data === "object") ? ci.intake_data : {};
    // client_intakes 無專屬 title 欄 . 用 brief / description 前 60 字當案件描述 (與 send-decision-email 同源)
    const briefRaw = id.brief || id.description || id.project_brief || "";
    const brief = String(briefRaw).replace(/\s+/g, " ").trim();
    const projectTitle = brief ? (brief.length > 60 ? brief.slice(0, 60) + "…" : brief) : "(無 brief 摘要)";
    return {
      workerName: wa.display_name || wa.email || "(worker)",
      clientName: ci.company_name || "(client)",
      projectTitle: projectTitle,
      vertical: ci.vertical || id.vertical || "",
    };
  } catch (_e) {
    return null;
  }
}

serve(async function (req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") || "";
  const actionRaw = url.searchParams.get("action") || "";
  const action: "accept" | "decline" = actionRaw === "decline" ? "decline" : "accept";

  // 2026-05-29 calcifer . doc 28 Part C . IP 限流 (額外防洗層)
  // 註: 本函式是 worker 點 email 連結觸發的 GET + 已有 JWT token 簽章驗證 + 一次性 (accepted/declined
  //     後 redirect already) . 故「不套 admin check」(會打爆 worker 點信流程 . worker 沒 admin JWT) .
  //     真正 GET->POST 中間頁加固 = doc 14 P0-3 獨立議題 (不在 doc 28 範圍) . 此處只加寬鬆 IP 限流防狂打 .
  const rl = await checkRateLimit("worker-accept-decline", getClientIp(req), { limit: 30, windowSec: 60 });
  if (!rl.allowed) {
    return redirect(buildRedirectUrl(action, "rate-limited"));
  }

  if (!JWT_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return redirect(buildRedirectUrl(action, "error-config"));
  }
  if (!token) {
    return redirect(buildRedirectUrl(action, "missing-token"));
  }

  const payload = await verifyDecisionToken(token, JWT_SECRET);
  if (!payload) {
    return redirect(buildRedirectUrl(action, "invalid-or-expired"));
  }

  const tokenHash = await sha256Hex(token);
  const row = await findDecisionByTokenHash(tokenHash, payload.worker_decision_id);
  if (!row) {
    return redirect(buildRedirectUrl(action, "not-found"));
  }

  if (row.decision === "accepted" || row.decision === "declined" || row.decision === "expired") {
    return redirect(buildRedirectUrl(action, "already-" + row.decision));
  }

  const ok = await updateDecisionStatus(row.id, action);
  if (!ok) {
    return redirect(buildRedirectUrl(action, "update-failed"));
  }

  // 2026-06-01 calcifer doc42 M-1 . worker 決定後推 Edward (最關鍵缺口 . 原本 0 通知 Edward 空等)
  // fire-and-forget . 絕不阻斷 worker 的 redirect 體驗
  fetchDecisionContext(row.id).then(function (ctx) {
    const c = ctx || { workerName: "(worker)", clientName: "(client)", projectTitle: "", vertical: "" };
    const eventType = action === "accept" ? "worker_accepted" : "worker_declined";
    const title = c.workerName + (action === "accept" ? " 接受了邀請" : " 婉拒了邀請");
    return notifyEdward(eventType, {
      title: title,
      workerName: c.workerName,
      clientName: c.clientName,
      projectTitle: c.projectTitle,
      vertical: c.vertical,
    });
  }).catch(function () {});

  return redirect(buildRedirectUrl(action, "success"));
});
