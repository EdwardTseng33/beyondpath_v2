// BeyondPath POC . Edge Function . send-decision-email
// Spec ref: docs/launch/08-matching-pipeline-spec-calcifer.md Q3 Task 4
// 2026-05-20 . Q3 Task 4 . calcifer

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { calculateMatchScore, explainMatch, type ClientIntakeForMatch } from "../_shared/match-algorithm.ts";
import type { UnifiedWorker } from "../_shared/worker-schema.ts";
import { signDecisionToken, sha256Hex } from "../_shared/jwt-light.ts";
import { buildDecisionEmail } from "../_shared/decision-email-template.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("NEXT_PUBLIC_SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const RESEND_FROM = Deno.env.get("RESEND_FROM") ?? "BeyondPath <hello@beyondpath.tw>";
const JWT_SECRET = Deno.env.get("JWT_SECRET") ?? "";
const PUBLIC_FUNCTIONS_BASE_ENV = Deno.env.get("PUBLIC_FUNCTIONS_BASE") ?? "";
// brief #4 (2026-05-21 calcifer): TTL 7 days -> 24 hours (sulima H1)
//   . tighter accept-window . worker must accept within 1 day or token expires
//   . old links sent before this change still work until their own 7d window ends (kid v1 compat)
const TOKEN_TTL_HOURS = 24;
const TOKEN_TTL_DAYS = TOKEN_TTL_HOURS / 24;

function trimTrailingSlash(s: string): string {
  if (!s) return s;
  return s.charAt(s.length - 1) === "/" ? s.slice(0, -1) : s;
}

const PUBLIC_FUNCTIONS_BASE = PUBLIC_FUNCTIONS_BASE_ENV || (trimTrailingSlash(SUPABASE_URL) + "/functions/v1");

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

interface ClientIntakeRow {
  id: string;
  company_name: string | null;
  email: string | null;
  vertical: string | null;
  budget_range: string | null;
  timeline: string | null;
  intake_data: Record<string, unknown> | null;
}

interface WorkerRow {
  id: string;
  email: string;
  display_name: string | null;
  unified_card: UnifiedWorker | null;
  verticals: string[] | null;
  updated_at: string | null;
}

async function loadClientIntake(id: string): Promise<ClientIntakeRow | null> {
  const url = SUPABASE_URL + "/rest/v1/client_intakes?id=eq." + encodeURIComponent(id) +
    "&select=id,company_name,email,vertical,budget_range,timeline,intake_data";
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) return null;
  const rows = await res.json();
  return Array.isArray(rows) && rows.length > 0 ? rows[0] as ClientIntakeRow : null;
}

async function loadWorker(workerApplicationId: string): Promise<WorkerRow | null> {
  const url = SUPABASE_URL + "/rest/v1/worker_unified_v?id=eq." + encodeURIComponent(workerApplicationId) +
    "&select=id,email,display_name,unified_card,verticals,updated_at";
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) return null;
  const rows = await res.json();
  return Array.isArray(rows) && rows.length > 0 ? rows[0] as WorkerRow : null;
}

async function createDecisionRow(input: {
  client_intake_id: string;
  worker_application_id: string;
}): Promise<{ id: string } | null> {
  const url = SUPABASE_URL + "/rest/v1/worker_decisions";
  const body = JSON.stringify({
    client_intake_id: input.client_intake_id,
    worker_application_id: input.worker_application_id,
    decision: "invited",
  });
  const res = await fetch(url, {
    method: "POST",
    headers: { ...authHeaders(), "Prefer": "return=representation" },
    body,
  });
  if (!res.ok) return null;
  const rows = await res.json();
  return Array.isArray(rows) && rows.length > 0 ? { id: rows[0].id as string } : null;
}

async function updateDecisionTokenHash(decisionId: string, tokenHash: string): Promise<boolean> {
  const url = SUPABASE_URL + "/rest/v1/worker_decisions?id=eq." + encodeURIComponent(decisionId);
  const res = await fetch(url, {
    method: "PATCH",
    headers: { ...authHeaders(), "Prefer": "return=minimal" },
    body: JSON.stringify({ token_hash: tokenHash }),
  });
  return res.ok;
}

async function sendResendEmail(toEmail: string, subject: string, html: string, text: string): Promise<{ ok: boolean; error?: string }> {
  if (!RESEND_API_KEY) return { ok: false, error: "no-resend-key" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + RESEND_API_KEY,
        "Content-Type": "application/json",
      },
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

function deriveClientForMatch(intake: ClientIntakeRow): ClientIntakeForMatch {
  const data = (intake.intake_data && typeof intake.intake_data === "object") ? intake.intake_data : {};
  const rawTasks = (data as Record<string, unknown>).tasks;
  const tasks: string[] = Array.isArray(rawTasks) ? (rawTasks as unknown[]).map(function (t) { return String(t); }) : [];
  return {
    id: intake.id,
    vertical: intake.vertical || "",
    tasks,
    budget_range: intake.budget_range || undefined,
    timeline: intake.timeline || undefined,
    required_tier: (data as Record<string, unknown>).required_tier as string | undefined,
  };
}

interface SendRequestBody {
  client_intake_id: string;
  worker_application_ids: string[];
  decision?: "invite" | "decline";
  message?: string;
}

interface PerWorkerResult {
  worker_application_id: string;
  ok: boolean;
  decision_id?: string;
  email?: string;
  error?: string;
}

serve(async function (req: Request) {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: CORS_HEADERS });
  }

  const missing: string[] = [];
  if (!SUPABASE_URL) missing.push("SUPABASE_URL");
  if (!SUPABASE_SERVICE_ROLE_KEY) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!RESEND_API_KEY) missing.push("RESEND_API_KEY");
  if (!JWT_SECRET) missing.push("JWT_SECRET");
  if (missing.length > 0) {
    return new Response(JSON.stringify({ ok: false, error: "missing-env", missing }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  let body: SendRequestBody;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "invalid-json" }), {
      status: 400,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  if (!body.client_intake_id || !Array.isArray(body.worker_application_ids) || body.worker_application_ids.length === 0) {
    return new Response(JSON.stringify({ ok: false, error: "missing-fields" }), {
      status: 400,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const intake = await loadClientIntake(body.client_intake_id);
  if (!intake) {
    return new Response(JSON.stringify({ ok: false, error: "client-intake-not-found" }), {
      status: 404,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const clientForMatch = deriveClientForMatch(intake);
  const briefText = (function () {
    const d = (intake.intake_data && typeof intake.intake_data === "object") ? intake.intake_data : {};
    const dr = d as Record<string, unknown>;
    return (dr.brief as string) || (dr.description as string) || (dr.project_brief as string) || "";
  })();

  const results: PerWorkerResult[] = [];

  for (const workerId of body.worker_application_ids) {
    try {
      const worker = await loadWorker(workerId);
      if (!worker || !worker.unified_card || !worker.email) {
        results.push({ worker_application_id: workerId, ok: false, error: "worker-not-found-or-no-card" });
        continue;
      }
      const card = worker.unified_card;
      if (!card.last_active && worker.updated_at) card.last_active = worker.updated_at;
      if (!card.id && worker.id) card.id = worker.id;

      const matchOut = calculateMatchScore(clientForMatch, card);
      const score = matchOut.score;
      const breakdown = matchOut.breakdown;
      const why = explainMatch(clientForMatch, card, breakdown);

      const decision = await createDecisionRow({
        client_intake_id: intake.id,
        worker_application_id: workerId,
      });
      if (!decision) {
        results.push({ worker_application_id: workerId, ok: false, error: "decision-row-insert-failed" });
        continue;
      }

      const token = await signDecisionToken({
        worker_application_id: workerId,
        client_intake_id: intake.id,
        worker_decision_id: decision.id,
      }, JWT_SECRET, TOKEN_TTL_HOURS * 3600);

      const tokenHash = await sha256Hex(token);
      await updateDecisionTokenHash(decision.id, tokenHash);

      const acceptUrl = PUBLIC_FUNCTIONS_BASE + "/worker-accept-decline?token=" + encodeURIComponent(token) + "&action=accept";
      const declineUrl = PUBLIC_FUNCTIONS_BASE + "/worker-accept-decline?token=" + encodeURIComponent(token) + "&action=decline";

      const email = buildDecisionEmail({
        worker_name: card.name || worker.display_name || (worker.email.split("@")[0] || ""),
        worker_handle: card.handle || "@anon",
        client_company: intake.company_name || "",
        client_vertical: intake.vertical || "",
        client_brief: briefText,
        budget_range: intake.budget_range || "",
        timeline: intake.timeline || "",
        why_recommend: why,
        match_score: score,
        accept_url: acceptUrl,
        decline_url: declineUrl,
        expires_in_days: TOKEN_TTL_DAYS,
        custom_message: body.message,
      });

      const send = await sendResendEmail(worker.email, email.subject, email.html, email.text);
      results.push({
        worker_application_id: workerId,
        ok: send.ok,
        decision_id: decision.id,
        email: worker.email,
        error: send.ok ? undefined : send.error,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({ worker_application_id: workerId, ok: false, error: msg });
    }
  }

  const okCount = results.filter(function (r) { return r.ok; }).length;
  return new Response(JSON.stringify({
    ok: okCount > 0,
    client_intake_id: intake.id,
    total: results.length,
    sent: okCount,
    results,
  }), {
    status: 200,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
});
