// BeyondPath POC . Edge Function . get-milestone-detail
// Phase 3+ . 2026-05-28 calcifer
// Read-only endpoint . load milestone + contract + deliverables + links for milestone-detail.html

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

  let body: { contract_id?: string; milestone_id?: string; role?: string; token?: string };
  try { body = await req.json(); } catch { return jsonRes({ ok: false, error: "bad body" }, 400); }
  if (!body.contract_id || !body.milestone_id || !body.role || !body.token) {
    return jsonRes({ ok: false, error: "contract_id + milestone_id + role + token required" }, 400);
  }
  if (body.role !== "worker" && body.role !== "client") return jsonRes({ ok: false, error: "bad role" }, 400);

  const payload = await verifyContractToken(body.token, JWT_SECRET);
  if (!payload) return jsonRes({ ok: false, error: "invalid or expired token" }, 401);
  if (payload.role !== body.role) return jsonRes({ ok: false, error: "token role mismatch" }, 403);
  if (payload.contract_id !== body.contract_id) return jsonRes({ ok: false, error: "token contract mismatch" }, 403);

  const cRes = await fetch(SUPABASE_URL + "/rest/v1/contracts?id=eq." + body.contract_id + "&select=id,contract_snapshot,status", { headers: authHeaders() });
  const cRows = await cRes.json();
  if (!Array.isArray(cRows) || cRows.length === 0) return jsonRes({ ok: false, error: "contract not found" }, 404);
  const contract = cRows[0];

  const mRes = await fetch(SUPABASE_URL + "/rest/v1/contract_milestones?id=eq." + body.milestone_id + "&select=*", { headers: authHeaders() });
  const mRows = await mRes.json();
  if (!Array.isArray(mRows) || mRows.length === 0) return jsonRes({ ok: false, error: "milestone not found" }, 404);
  const milestone = mRows[0];
  if (milestone.contract_id !== body.contract_id) return jsonRes({ ok: false, error: "milestone not in contract" }, 403);

  const dRes = await fetch(SUPABASE_URL + "/rest/v1/milestone_deliverables?milestone_id=eq." + body.milestone_id + "&select=*&order=version_number.desc,uploaded_at.desc", { headers: authHeaders() });
  const dRows = await dRes.json();
  const deliverables = Array.isArray(dRows) ? dRows : [];

  const lRes = await fetch(SUPABASE_URL + "/rest/v1/deliverable_external_links?milestone_id=eq." + body.milestone_id + "&select=*&order=uploaded_at.desc", { headers: authHeaders() });
  const lRows = await lRes.json();
  const links = Array.isArray(lRows) ? lRows : [];

  return jsonRes({ ok: true, contract, milestone, deliverables, links });
});
