// BeyondPath POC . worker-schema.test.ts
// Deno test suite for aiProofToUnifiedWorker mapping function.
// 2026-05-18 . T1.2 . calcifer (P0-1 stage 1)
//
// Run: deno test supabase/functions/_shared/worker-schema.test.ts

import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { aiProofToUnifiedWorker, AiProof, WorkerApplicationRow, SkillMatrix } from "./worker-schema.ts";

function makeProof(overrides: Partial<AiProof> = {}): AiProof {
  const baseMatrix: SkillMatrix = {
    workflow_design: 8,
    tool_orchestration: 9,
    judgment: 7,
    domain_depth: 8,
    client_communication: 6,
    delivery_reliability: 7,
  };
  return {
    name: "Alice Chen",
    L_score: 7.5,
    L_confidence: "high",
    tier_suggestion: "Bplus",
    evidence_quality: "high",
    verticals: ["software", "agent"],
    case_count: "5plus",
    skill_matrix: { ...baseMatrix, ...(overrides.skill_matrix || {}) },
    strengths: ["clear workflow design", "multi-tool fluency", "reliable delivery"],
    growth: ["deepen domain knowledge", "raise communication clarity"],
    ...overrides,
  } as AiProof;
}

function makeRow(overrides: Partial<WorkerApplicationRow> = {}): WorkerApplicationRow {
  return {
    id: "row-001",
    email: "alice@example.com",
    display_name: "Alice",
    ai_proof: overrides.ai_proof || makeProof(),
    tier_suggestion: "Bplus",
    status: "pending",
    updated_at: "2026-05-18T10:00:00Z",
    ...overrides,
  } as WorkerApplicationRow;
}

// ============ Case 1: Full ai_proof (happy path) ============
Deno.test("case 1: full ai_proof maps to UnifiedWorker correctly", () => {
  const proof = makeProof();
  const row = makeRow({ ai_proof: proof });
  const w = aiProofToUnifiedWorker(row, proof);

  assertEquals(w.id, "row-001");
  assertEquals(w.name, "Alice");
  assertEquals(w.handle, "@alice");
  assertEquals(w.tier, "Bplus");
  assertEquals(w.L_score, 7.5);
  assertEquals(w.verticals, ["software", "agent"]);
  assertEquals(w.role, "Software + Tools Expert");
  assert(w.badges.indexOf("Software") >= 0);
  assert(w.badges.indexOf("Tools") >= 0);
  assert(w.badges.indexOf("Workflow") >= 0);
  assert(w.badges.indexOf("Domain") >= 0);
  assert(w.badges.indexOf("Tier Bplus") >= 0);
  assertEquals(w.nps, null);
  assertEquals(w.cases_completed, 0);
  assertEquals(w.case_count_bucket, "5plus");
  assertEquals(w.capacity, 3);
  assertEquals(w.rate_range.lo, 0);
  assertEquals(w.rate_range.hi, 0);
  assertEquals(w.score, undefined);
  assertEquals(w.breakdown, undefined);
  assertEquals(w.domain_match, undefined);
  assertEquals(w.portfolio, null);
  assertEquals(w.works, []);
  assert(w.blurb.indexOf("clear workflow design") >= 0);
});

// ============ Case 2: Missing skill_matrix fields -> 0 ============
Deno.test("case 2: partial skill_matrix fills missing with 0", () => {
  const proof = makeProof({
    skill_matrix: {
      workflow_design: 7,
      tool_orchestration: 5,
    } as SkillMatrix,
  });
  const row = makeRow({ ai_proof: proof });
  const w = aiProofToUnifiedWorker(row, proof);

  assertEquals(w.skill_matrix.workflow_design, 7);
  assertEquals(w.skill_matrix.tool_orchestration, 5);
  assertEquals(w.skill_matrix.judgment, 0);
  assertEquals(w.skill_matrix.domain_depth, 0);
  assertEquals(w.skill_matrix.client_communication, 0);
  assertEquals(w.skill_matrix.delivery_reliability, 0);
  assertEquals(w.role, "Software + Workflow Expert");
  assert(w.badges.indexOf("Workflow") === -1);
  assert(w.badges.indexOf("Software") >= 0);
});

// ============ Case 3: Portfolio null vs populated ============
Deno.test("case 3: row.portfolio null produces empty works", () => {
  const proof = makeProof();
  const row = makeRow({ ai_proof: proof, portfolio: null });
  const w = aiProofToUnifiedWorker(row, proof);
  assertEquals(w.portfolio, null);
  assertEquals(w.works, []);
});

Deno.test("case 3b: row.portfolio with items derives works from client names", () => {
  const proof = makeProof();
  const row = makeRow({
    ai_proof: proof,
    portfolio: [
      { client: "Client A", desc: "Q1 launch", roas: "+30%", nps: 4.8 },
      { client: "Client B", desc: "retainer", roas: "+15%", nps: 4.6 },
    ],
  });
  const w = aiProofToUnifiedWorker(row, proof);
  assert(w.portfolio !== null);
  assertEquals(w.portfolio?.length, 2);
  assertEquals(w.works, ["Client A", "Client B"]);
});

// ============ Case 4: tier_suggestion S (row override) ============
Deno.test("case 4: tier S override via row produces Tier S badge", () => {
  const proof = makeProof({ tier_suggestion: "Bplus" });
  const row = makeRow({ ai_proof: proof, tier_suggestion: "S" });
  const w = aiProofToUnifiedWorker(row, proof);
  assertEquals(w.tier, "S");
  assert(w.badges.indexOf("Tier S") >= 0);
});

// ============ Case 5: empty verticals + minimal proof ============
Deno.test("case 5: empty verticals + minimal proof falls back to defaults", () => {
  const proof: AiProof = {
    name: "Anon",
    L_score: 4,
    L_confidence: "low",
    tier_suggestion: "B",
    evidence_quality: "low",
    verticals: [],
    case_count: "0",
    skill_matrix: {
      workflow_design: 3,
      tool_orchestration: 3,
      judgment: 3,
      domain_depth: 3,
      client_communication: 3,
      delivery_reliability: 3,
    },
    strengths: [],
    growth: [],
  };
  const row: WorkerApplicationRow = {
    id: "min-row",
    email: "newbie@example.com",
    display_name: null,
    ai_proof: proof,
    tier_suggestion: "B",
    status: "pending",
  };
  const w = aiProofToUnifiedWorker(row, proof);
  assertEquals(w.capacity, 3);
  assertEquals(w.role, "Generalist Worker");
  assert(w.badges.indexOf("Tier B") === -1);
  assertEquals(w.handle, "@newbie");
  assertEquals(w.name, "Anon");
  assertEquals(w.last_active, "unknown");
  assert(w.blurb.indexOf("BeyondPath Tier B") >= 0);
  assert(w.blurb.indexOf("Generalist") >= 0);
});

