// BeyondPath POC . Edge Function . recalc-worker-tier
// Phase 3 Tier 升降演算法 . 2026-05-28 calcifer
// Spec: admin or internal-secret POST { worker_application_id }
//       1. 取此 worker 所有 contracts (status='complete' + milestones all approved)
//       2. 取此 worker 收到的所有 NPS (role='worker' . i.e. client 給 worker 的分數)
//       3. 計算：
//          - 累積完成案件數 ≥ 5 + 平均 NPS ≥ 9.0 → 升 Tier B+
//          - 累積完成案件數 ≥ 10 + 平均 NPS ≥ 9.5 + 同 vertical ≥ 3 案 → 預留 Tier A (POC 階段不開)
//          - 連續 2 案 NPS < 6 → 降 Tier B (從 B+) + 標記 review
//       4. 寫進 worker_applications: nps_avg, nps_count, completed_case_count, tier_suggestion, tier_history (append entry)

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("NEXT_PUBLIC_SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

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

interface TierDecision {
  new_tier: string;
  reasoning: string;
  avg_nps: number;
  case_count: number;
  last_two_low: boolean;
}

function decideTier(currentTier: string, avgNps: number, caseCount: number, recentScores: number[]): TierDecision {
  // 連續 2 案 NPS < 6 → 降 Tier
  const lastTwo = recentScores.slice(-2);
  const lastTwoLow = lastTwo.length >= 2 && lastTwo.every((s) => s < 6);
  if (lastTwoLow && currentTier === "tier_b_plus") {
    return {
      new_tier: "tier_b",
      reasoning: "連續 2 案 NPS < 6 . 自動降回 Tier B . 標記人工 review",
      avg_nps: avgNps,
      case_count: caseCount,
      last_two_low: true,
    };
  }

  // 升 Tier B+
  if (caseCount >= 5 && avgNps >= 9.0 && currentTier === "tier_b") {
    return {
      new_tier: "tier_b_plus",
      reasoning: "案件數 ≥ 5 + 平均 NPS ≥ 9.0 . 升 Tier B+",
      avg_nps: avgNps,
      case_count: caseCount,
      last_two_low: false,
    };
  }

  // 不變
  return {
    new_tier: currentTier,
    reasoning: "未達升降條件 . 保持原 Tier",
    avg_nps: avgNps,
    case_count: caseCount,
    last_two_low: false,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST") return jsonRes({ ok: false, error: "method not allowed" }, 405);

  // auth: either admin user JWT OR internal-secret (service_role passthrough)
  const auth = req.headers.get("Authorization") || "";
  const internalSecret = req.headers.get("x-internal-secret") || "";
  let isAdmin = false;
  if (internalSecret === SUPABASE_SERVICE_ROLE_KEY && SUPABASE_SERVICE_ROLE_KEY) {
    isAdmin = true;
  } else if (auth.startsWith("Bearer ")) {
    const userJwt = auth.slice(7);
    const userRes = await fetch(SUPABASE_URL + "/auth/v1/user", {
      headers: { "apikey": SUPABASE_SERVICE_ROLE_KEY, "Authorization": "Bearer " + userJwt },
    });
    if (userRes.ok) {
      const user = await userRes.json();
      if (user.email === "edwardt0303@gmail.com") isAdmin = true;
    }
  }
  if (!isAdmin) return jsonRes({ ok: false, error: "admin or internal-secret required" }, 403);

  let body: { worker_application_id?: string; internal?: boolean };
  try { body = await req.json(); } catch { return jsonRes({ ok: false, error: "bad body" }, 400); }
  if (!body.worker_application_id) return jsonRes({ ok: false, error: "worker_application_id required" }, 400);
  const workerAppId = body.worker_application_id;

  // 取 worker_application
  const waRes = await fetch(
    SUPABASE_URL + "/rest/v1/worker_applications?id=eq." + workerAppId + "&select=*",
    { headers: authHeaders() }
  );
  const waRows = await waRes.json();
  if (!Array.isArray(waRows) || waRows.length === 0) return jsonRes({ ok: false, error: "worker_application not found" }, 404);
  const wa = waRows[0];
  const currentTier = wa.tier_suggestion || wa.status || "tier_b";

  // 取此 worker 所有 contracts (status='complete') + 其 milestone all approved
  const cRes = await fetch(
    SUPABASE_URL + "/rest/v1/contracts?worker_application_id=eq." + workerAppId + "&status=eq.complete&select=id,milestones_total,contract_snapshot,nps_invited_at,created_at",
    { headers: authHeaders() }
  );
  const contracts = await cRes.json();
  if (!Array.isArray(contracts)) return jsonRes({ ok: false, error: "contracts query failed" }, 500);

  // case 算只算「milestone all approved 完成」的（簡化：milestones_total >= 100，因 30+30+40=100）
  const completedContracts = contracts.filter((c: { milestones_total?: number }) =>
    typeof c.milestones_total === "number" && c.milestones_total >= 100
  );
  const completedCaseCount = completedContracts.length;

  // 取此 worker 收到的所有 NPS (role='worker' 表示 client 給 worker 的評分)
  // 注意：role 是「誰評」, 所以 client 評 worker → role='client', worker 評 client → role='worker'
  // 此處要的是 client 對 worker 的評價 → role='client'
  const completedContractIds = completedContracts.map((c: { id: string }) => c.id);
  let npsScores: number[] = [];
  let npsCount = 0;
  let avgNps = 0;
  if (completedContractIds.length > 0) {
    const inClause = completedContractIds.map((id) => "\"" + id + "\"").join(",");
    const nRes = await fetch(
      SUPABASE_URL + "/rest/v1/nps_responses?contract_id=in.(" + inClause + ")&role=eq.client&select=score,created_at&order=created_at.asc",
      { headers: authHeaders() }
    );
    const npsRows = await nRes.json();
    if (Array.isArray(npsRows)) {
      npsScores = npsRows.map((n: { score: number }) => n.score);
      npsCount = npsScores.length;
      avgNps = npsCount > 0 ? npsScores.reduce((a, b) => a + b, 0) / npsCount : 0;
    }
  }

  // 判決
  const decision = decideTier(currentTier, avgNps, completedCaseCount, npsScores);

  // 寫入 worker_applications
  const tierHistory = Array.isArray(wa.tier_history) ? wa.tier_history : [];
  const tierChanged = decision.new_tier !== currentTier;
  if (tierChanged) {
    tierHistory.push({
      ts: new Date().toISOString(),
      from_tier: currentTier,
      to_tier: decision.new_tier,
      reasoning: decision.reasoning,
      avg_nps: Math.round(decision.avg_nps * 100) / 100,
      case_count: decision.case_count,
    });
  }

  const patch: Record<string, unknown> = {
    nps_avg: npsCount > 0 ? Math.round(avgNps * 100) / 100 : null,
    nps_count: npsCount,
    completed_case_count: completedCaseCount,
    tier_suggestion: decision.new_tier,
    tier_history: tierHistory,
  };

  const upRes = await fetch(
    SUPABASE_URL + "/rest/v1/worker_applications?id=eq." + workerAppId,
    {
      method: "PATCH",
      headers: { ...authHeaders(), "Prefer": "return=representation" },
      body: JSON.stringify(patch),
    }
  );
  if (!upRes.ok) {
    const txt = await upRes.text();
    return jsonRes({ ok: false, error: "worker_application update failed", detail: txt }, 500);
  }

  return jsonRes({
    ok: true,
    worker_application_id: workerAppId,
    previous_tier: currentTier,
    new_tier: decision.new_tier,
    tier_changed: tierChanged,
    reasoning: decision.reasoning,
    metrics: {
      avg_nps: Math.round(avgNps * 100) / 100,
      nps_count: npsCount,
      completed_case_count: completedCaseCount,
      last_two_low: decision.last_two_low,
    },
  });
});
