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

serve(async function (req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") || "";
  const actionRaw = url.searchParams.get("action") || "";
  const action: "accept" | "decline" = actionRaw === "decline" ? "decline" : "accept";

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

  return redirect(buildRedirectUrl(action, "success"));
});
