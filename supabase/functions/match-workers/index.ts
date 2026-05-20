// BeyondPath POC . Edge Function . match-workers
// Spec ref: docs/launch/08-matching-pipeline-spec-calcifer.md Task P1-3
// 2026-05-20 P1-3 calcifer

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { rankWorkers, type ClientIntakeForMatch, type MatchResult, type MatchWeights } from "../_shared/match-algorithm.ts";
import type { UnifiedWorker } from "../_shared/worker-schema.ts";
import { VERTICAL_ADJACENCY } from "../_shared/vertical-adjacency.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("NEXT_PUBLIC_SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
};

interface ClientIntakeRow {
  id: string;
  vertical: string | null;
  budget_range: string | null;
  timeline: string | null;
  intake_data: Record<string, unknown> | null;
}

function pickKey(): string {
  return SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
}

function authHeaders(): Record<string, string> {
  const key = pickKey();
  return {
    "apikey": key,
    "Authorization": "Bearer " + key,
    "Content-Type": "application/json",
  };
}

async function loadClientIntake(id: string): Promise<ClientIntakeRow | null> {
  if (!SUPABASE_URL || !id) return null;
  const url = SUPABASE_URL + "/rest/v1/client_intakes?id=eq." + encodeURIComponent(id) +
    "&select=id,vertical,budget_range,timeline,intake_data";
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) return null;
  const rows = await res.json();
  return Array.isArray(rows) && rows.length > 0 ? rows[0] as ClientIntakeRow : null;
}

function buildVerticalList(primary: string): string[] {
  const list: string[] = [primary];
  const neighbors = VERTICAL_ADJACENCY[primary] || [];
  for (const n of neighbors) if (list.indexOf(n) === -1) list.push(n);
  return list;
}

async function loadWorkerPool(primaryVertical: string): Promise<UnifiedWorker[]> {
  if (!SUPABASE_URL || !primaryVertical) return [];
  const verticals = buildVerticalList(primaryVertical);
  const quoted = verticals.map(function (v) { return JSON.stringify(v); }).join(",");
  const verticalParam = "{" + quoted + "}";
  const url = SUPABASE_URL + "/rest/v1/worker_unified_v?select=id,email,display_name,unified_card,verticals,tier_suggestion,updated_at" +
    "&verticals=ov." + encodeURIComponent(verticalParam) +
    "&unified_card=not.is.null&limit=100";
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) return [];
  const rows = await res.json() as Array<Record<string, unknown>>;
  if (!Array.isArray(rows)) return [];
  const workers: UnifiedWorker[] = [];
  for (const row of rows) {
    const card = row.unified_card as UnifiedWorker | null;
    if (!card || typeof card !== "object") continue;
    if (!card.last_active && row.updated_at) card.last_active = row.updated_at as string;
    if (!card.id && row.id) card.id = row.id as string;
    workers.push(card);
  }
  return workers;
}

async function persistMatchResult(clientIntakeId: string, results: MatchResult[]): Promise<boolean> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !clientIntakeId) return false;
  const url = SUPABASE_URL + "/rest/v1/client_intakes?id=eq." + encodeURIComponent(clientIntakeId);
  const body = JSON.stringify({
    match_result: { results, generated_at: new Date().toISOString(), version: "v0.1" },
    matched_at: new Date().toISOString(),
  });
  try {
    const res = await fetch(url, {
      method: "PATCH",
      headers: { ...authHeaders(), "Prefer": "return=minimal" },
      body,
    });
    return res.ok;
  } catch {
    return false;
  }
}

function deriveClientForMatch(row: ClientIntakeRow): ClientIntakeForMatch {
  const intake = (row.intake_data && typeof row.intake_data === "object") ? row.intake_data : {};
  const rawTasks = (intake as Record<string, unknown>).tasks;
  const tasks: string[] = Array.isArray(rawTasks) ? (rawTasks as unknown[]).map(function (t) { return String(t); }) : [];
  const requiredTier = (intake as Record<string, unknown>).required_tier as string | undefined;
  return {
    id: row.id,
    vertical: row.vertical || "",
    tasks,
    budget_range: row.budget_range || undefined,
    timeline: row.timeline || undefined,
    required_tier: requiredTier,
  };
}

interface MatchRequestBody {
  client_intake_id?: string;
  client?: ClientIntakeForMatch;
  top_n?: number;
  persist?: boolean;
  weights?: Partial<MatchWeights>;  // 2026-05-21 A3 · admin Settings tab override · 沒給用 default
}

serve(async function (req: Request) {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: CORS_HEADERS });
  }
  let body: MatchRequestBody;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "invalid-json" }), {
      status: 400,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
  let client: ClientIntakeForMatch | null = null;
  let clientIntakeId = body.client_intake_id || "";
  try {
    if (body.client) {
      client = body.client;
      if (!clientIntakeId && client.id) clientIntakeId = client.id;
    } else if (clientIntakeId) {
      const row = await loadClientIntake(clientIntakeId);
      if (!row) {
        return new Response(JSON.stringify({ ok: false, error: "client-intake-not-found" }), {
          status: 404,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
      }
      client = deriveClientForMatch(row);
    } else {
      return new Response(JSON.stringify({ ok: false, error: "missing-client-intake-id-or-client" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }
    if (!client.vertical) {
      return new Response(JSON.stringify({ ok: true, results: [], persisted: false, reason: "no-vertical" }), {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }
    const workers = await loadWorkerPool(client.vertical);
    const topN = typeof body.top_n === "number" && body.top_n > 0 ? body.top_n : 5;
    const results = rankWorkers(client, workers, topN, body.weights);
    let persisted = false;
    if (clientIntakeId && body.persist !== false) {
      persisted = await persistMatchResult(clientIntakeId, results);
    }
    return new Response(JSON.stringify({
      ok: true,
      client_intake_id: clientIntakeId || null,
      pool_size: workers.length,
      results,
      persisted,
    }), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ ok: false, error: "match-failed", detail: msg }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
