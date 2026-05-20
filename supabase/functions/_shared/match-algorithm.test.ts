// BeyondPath POC . match-algorithm.test.ts
// Deno test suite for pure scoring functions.
// 2026-05-20 . P1-3 . calcifer
// Run: deno test supabase/functions/_shared/match-algorithm.test.ts

import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  scoreTierMatch,
  scoreCapacity,
  scoreDomainMatch,
  scoreLBonus,
  scoreMercyBoost,
  calculateMatchScore,
  rankWorkers,
  type ClientIntakeForMatch,
} from "./match-algorithm.ts";
import type { UnifiedWorker, SkillMatrix } from "./worker-schema.ts";

function fullSkill(v: number): SkillMatrix {
  return {
    workflow_design: v,
    tool_orchestration: v,
    judgment: v,
    domain_depth: v,
    client_communication: v,
    delivery_reliability: v,
  };
}

function makeWorker(overrides: Partial<UnifiedWorker> = {}): UnifiedWorker {
  return {
    id: "w1",
    handle: "@alice",
    name: "Alice",
    role: "Software + Workflow Expert",
    tier: "B+",
    L_score: 8,
    L_confidence: "high",
    skill_matrix: fullSkill(8),
    verticals: ["software", "agent"],
    badges: [],
    strengths: [],
    growth: [],
    capacity: 3,
    rate_range: { lo: 0, hi: 0 },
    last_active: new Date().toISOString(),
    nps: null,
    cases_completed: 0,
    case_count_bucket: "5+",
    evidence_quality: "high",
    portfolio: null,
    blurb: "",
    works: [],
    ...overrides,
  };
}

function makeClient(overrides: Partial<ClientIntakeForMatch> = {}): ClientIntakeForMatch {
  return {
    id: "c1",
    vertical: "software",
    tasks: ["workflow automation"],
    budget_range: "NT$50-150k",
    timeline: "normal",
    required_tier: "B+",
    ...overrides,
  };
}

Deno.test("scoreTierMatch exact / over / under", () => {
  assertEquals(scoreTierMatch("B+", "B+"), 25);
  assertEquals(scoreTierMatch("B", "B+"), 25);          // over 1
  assertEquals(scoreTierMatch("B", "A"), 22);           // over 2
  assertEquals(scoreTierMatch("A", "B+"), 18);          // under 1
  assertEquals(scoreTierMatch("S", "B"), 10);           // far under
  assertEquals(scoreTierMatch(undefined, "B"), 22);     // no requirement
});

Deno.test("scoreCapacity timeline aware", () => {
  assertEquals(scoreCapacity(0, "rush"), 0);
  assertEquals(scoreCapacity(1, "rush"), 10);
  assertEquals(scoreCapacity(3, "rush"), 20);
  assertEquals(scoreCapacity(1, "flexible"), 20);
  assertEquals(scoreCapacity(0, "flexible"), 0);
  assertEquals(scoreCapacity(1, "normal"), 18);
  assertEquals(scoreCapacity(1, undefined), 18);
});

Deno.test("scoreDomainMatch primary + adjacent + task", () => {
  const skill = fullSkill(8);
  // primary hit (software in [software, agent]) + adjacent (agent adjacent software) + task match
  const primary = scoreDomainMatch("software", ["software", "agent"], ["workflow design"], skill);
  assert(primary >= 25, "expected primary+task+adjacent >=25, got " + primary);
  assertEquals(scoreDomainMatch("software", ["software"], [], skill), 20);
  // adjacent only (no primary)
  assertEquals(scoreDomainMatch("software", ["dev"], [], skill), 5);
  // miss
  assertEquals(scoreDomainMatch("dtc", ["dev"], [], skill), 0);
});

Deno.test("scoreLBonus 0-15", () => {
  assertEquals(scoreLBonus(0), 0);
  assertEquals(scoreLBonus(5), 8);
  assertEquals(scoreLBonus(10), 15);
  assertEquals(scoreLBonus(-1), 0);
  assertEquals(scoreLBonus(99), 15);
});

Deno.test("scoreMercyBoost 90 day threshold", () => {
  const recent = new Date().toISOString();
  const old = new Date(Date.now() - 100 * 86400 * 1000).toISOString();
  assertEquals(scoreMercyBoost(recent), 0);
  assertEquals(scoreMercyBoost(old), 10);
  assertEquals(scoreMercyBoost(undefined), 0);
});

Deno.test("calculateMatchScore total in 0-100 range", () => {
  const client = makeClient();
  const worker = makeWorker();
  const { score, breakdown } = calculateMatchScore(client, worker);
  assert(score >= 0 && score <= 100, "score out of range: " + score);
  assert(breakdown.tier_match >= 0);
  assert(breakdown.capacity_match >= 0);
  assert(breakdown.domain_match >= 0);
  assert(breakdown.L_score_bonus >= 0);
  assert(breakdown.mercy_boost >= 0);
});

Deno.test("rankWorkers sorts desc and slices topN", () => {
  const client = makeClient();
  const w1 = makeWorker({ id: "high", tier: "B+", L_score: 9 });
  const w2 = makeWorker({ id: "mid", tier: "B", L_score: 6, verticals: ["software"] });
  const w3 = makeWorker({ id: "low", tier: "B", L_score: 3, verticals: ["dtc"] });
  const ranked = rankWorkers(client, [w3, w1, w2], 2);
  assertEquals(ranked.length, 2);
  assert(ranked[0].score >= ranked[1].score, "not sorted desc");
  assertEquals(ranked[0].worker_id, "high");
});

Deno.test("rankWorkers empty pool returns empty", () => {
  const client = makeClient();
  const ranked = rankWorkers(client, [], 5);
  assertEquals(ranked.length, 0);
});

Deno.test("MatchResult.why is non-empty string", () => {
  const ranked = rankWorkers(makeClient(), [makeWorker()], 5);
  assert(typeof ranked[0].why === "string" && ranked[0].why.length > 0);
});
