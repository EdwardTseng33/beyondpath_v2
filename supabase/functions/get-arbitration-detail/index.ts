// BeyondPath v1.0 . Edge Function . get-arbitration-detail
// Phase 3+ . 2026-05-28 calcifer . arbitration.html load data

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { verifyContractToken } from "../_shared/contract-jwt.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("NEXT_PUBLIC_SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const JWT_SECRET = Deno.env.get("JWT_SECRET") ?? "";

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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST") return jsonRes({ ok: false, error: "method not allowed" }, 405);

  let body: { case_id?: string; role?: string; token?: string };
  try { body = await req.json(); } catch { return jsonRes({ ok: false, error: "bad body" }, 400); }
  if (!body.case_id || !body.role || !body.token) return jsonRes({ ok: false, error: "case_id + role + token required" }, 400);
  if (body.role !== "worker" && body.role !== "client") return jsonRes({ ok: false, error: "bad role" }, 400);

  const payload = await verifyContractToken(body.token, JWT_SECRET);
  if (!payload) return jsonRes({ ok: false, error: "invalid or expired token" }, 401);
  if (payload.role !== body.role) return jsonRes({ ok: false, error: "token role mismatch" }, 403);

  const aRes = await fetch(SUPABASE_URL + "/rest/v1/arbitration_cases?id=eq." + body.case_id + "&select=*", { headers: authHeaders() });
  const aRows = await aRes.json();
  if (!Array.isArray(aRows) || aRows.length === 0) return jsonRes({ ok: false, error: "case not found" }, 404);
  const arb = aRows[0];
  if (arb.contract_id !== payload.contract_id) return jsonRes({ ok: false, error: "case not in token contract" }, 403);

  const mRes = await fetch(SUPABASE_URL + "/rest/v1/contract_milestones?id=eq." + arb.milestone_id + "&select=*", { headers: authHeaders() });
  const mRows = await mRes.json();
  const milestone = Array.isArray(mRows) && mRows.length > 0 ? mRows[0] : null;

  const cRes = await fetch(SUPABASE_URL + "/rest/v1/contracts?id=eq." + arb.contract_id + "&select=id,contract_snapshot,status", { headers: authHeaders() });
  const cRows = await cRes.json();
  const contract = Array.isArray(cRows) && cRows.length > 0 ? cRows[0] : null;

  // Hide other side's position until this role has submitted (避免抄答案 + arbitration fairness)
  const mySubmitted = body.role === "worker" ? !!arb.worker_position_submitted_at : !!arb.client_position_submitted_at;
  const sanitized: any = { ...arb };
  if (!mySubmitted) {
    if (body.role === "worker") {
      sanitized.client_position_text = null;
      sanitized.client_position_files = null;
    } else {
      sanitized.worker_position_text = null;
      sanitized.worker_position_files = null;
    }
  }

  return jsonRes({ ok: true, arbitration_case: sanitized, milestone, contract, my_submitted: mySubmitted });
});
