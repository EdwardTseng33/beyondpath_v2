// BeyondPath POC . audit-flags.test.ts
// Deno test suite for computeAuditFlags pure function
// 2026-05-21 . Phase 0 #3 . calcifer
// Run: deno test --allow-all supabase/functions/_shared/audit-flags.test.ts

import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { computeAuditFlags, type AuditFlag } from "./audit-flags.ts";
import type { AiProof, SkillMatrix } from "./worker-schema.ts";

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

function makeProof(overrides: Partial<AiProof> = {}): AiProof {
  return {
    name: "Test Worker",
    L_score: 6,
    L_confidence: "中",
    tier_suggestion: "B",
    evidence_quality: "中",
    verticals: ["design"],
    case_count: "3-5",
    skill_matrix: fullSkill(6),
    strengths: ["三家 DTC 客戶 ROAS 從 1.8 拉到 3.2", "建 Claude + n8n + Airtable 自動化 client onboarding"],
    growth: ["想補 ad copy AB 測試方法論"],
    ...overrides,
  };
}

function hasFlag(flags: AuditFlag[], id: string): boolean {
  return flags.some((f) => f.id === id);
}

// ----- R1 low_evidence_high_score (high) -----

Deno.test("R1 · L_score 9 + case_count 0 → flag high", () => {
  const flags = computeAuditFlags(makeProof({ L_score: 9, case_count: "0" }));
  assert(hasFlag(flags, "low_evidence_high_score"));
  const f = flags.find((x) => x.id === "low_evidence_high_score")!;
  assertEquals(f.severity, "high");
});

Deno.test("R1 · L_score 8 + case_count 1-2 → flag", () => {
  const flags = computeAuditFlags(makeProof({ L_score: 8, case_count: "1-2" }));
  assert(hasFlag(flags, "low_evidence_high_score"));
});

Deno.test("R1 · L_score 8 + case_count 5+ → no flag", () => {
  const flags = computeAuditFlags(makeProof({ L_score: 8, case_count: "5+" }));
  assert(!hasFlag(flags, "low_evidence_high_score"));
});

Deno.test("R1 · L_score 7 + case_count 0 → no flag (under threshold)", () => {
  const flags = computeAuditFlags(makeProof({ L_score: 7, case_count: "0" }));
  assert(!hasFlag(flags, "low_evidence_high_score"));
});

// ----- R2 all_perfect_matrix (high) -----

Deno.test("R2 · all 6 dims >= 9 → flag high", () => {
  const flags = computeAuditFlags(makeProof({ skill_matrix: fullSkill(9) }));
  assert(hasFlag(flags, "all_perfect_matrix"));
  const f = flags.find((x) => x.id === "all_perfect_matrix")!;
  assertEquals(f.severity, "high");
});

Deno.test("R2 · mixed 8-10 → no flag (one dim < 9)", () => {
  const sm = fullSkill(10);
  sm.delivery_reliability = 8;
  const flags = computeAuditFlags(makeProof({ skill_matrix: sm }));
  assert(!hasFlag(flags, "all_perfect_matrix"));
});

// ----- R3 bipolar_matrix (medium) -----

Deno.test("R3 · max - min >= 7 → flag medium", () => {
  const sm = fullSkill(3);
  sm.workflow_design = 10;
  const flags = computeAuditFlags(makeProof({ skill_matrix: sm }));
  assert(hasFlag(flags, "bipolar_matrix"));
  const f = flags.find((x) => x.id === "bipolar_matrix")!;
  assertEquals(f.severity, "medium");
});

Deno.test("R3 · range = 6 → no flag", () => {
  const sm = fullSkill(4);
  sm.workflow_design = 10;
  const flags = computeAuditFlags(makeProof({ skill_matrix: sm }));
  assert(!hasFlag(flags, "bipolar_matrix"));
});

// ----- R4 vague_strengths (medium) -----

Deno.test("R4 · '熟悉 AI workflow' without concrete → flag", () => {
  const flags = computeAuditFlags(makeProof({ strengths: ["熟悉 AI workflow"] }));
  assert(hasFlag(flags, "vague_strengths"));
  const f = flags.find((x) => x.id === "vague_strengths")!;
  assertEquals(f.severity, "medium");
});

Deno.test("R4 · 'AI 都會' with concrete tool → no flag", () => {
  const flags = computeAuditFlags(makeProof({
    strengths: ["熟悉 AI workflow + n8n + Claude 串接 3 家 DTC client"],
  }));
  assert(!hasFlag(flags, "vague_strengths"));
});

Deno.test("R4 · 短句 < 8 字 沒具體 → flag", () => {
  const flags = computeAuditFlags(makeProof({ strengths: ["很厲害"] }));
  assert(hasFlag(flags, "vague_strengths"));
});

Deno.test("R4 · 有具體案件 → no flag", () => {
  const flags = computeAuditFlags(makeProof({
    strengths: ["DTC 客戶 ROAS 1.8 → 3.2 用 Claude + Airtable"],
  }));
  assert(!hasFlag(flags, "vague_strengths"));
});

// ----- R5 no_growth_self_aware (low) -----

Deno.test("R5 · growth empty → flag low", () => {
  const flags = computeAuditFlags(makeProof({ growth: [] }));
  assert(hasFlag(flags, "no_growth_self_aware"));
  const f = flags.find((x) => x.id === "no_growth_self_aware")!;
  assertEquals(f.severity, "low");
});

Deno.test("R5 · growth = ['沒有'] → flag", () => {
  const flags = computeAuditFlags(makeProof({ growth: ["沒有"] }));
  assert(hasFlag(flags, "no_growth_self_aware"));
});

Deno.test("R5 · growth = ['想補 AB 測試方法論'] → no flag", () => {
  const flags = computeAuditFlags(makeProof({ growth: ["想補 AB 測試方法論"] }));
  assert(!hasFlag(flags, "no_growth_self_aware"));
});

// ----- R6 vertical_overclaim (low) -----

Deno.test("R6 · verticals.length 5 → flag low", () => {
  const flags = computeAuditFlags(makeProof({ verticals: ["design", "copy", "dev", "ops", "strategy"] }));
  assert(hasFlag(flags, "vertical_overclaim"));
  const f = flags.find((x) => x.id === "vertical_overclaim")!;
  assertEquals(f.severity, "low");
});

Deno.test("R6 · verticals.length 4 → no flag", () => {
  const flags = computeAuditFlags(makeProof({ verticals: ["design", "copy", "dev", "ops"] }));
  assert(!hasFlag(flags, "vertical_overclaim"));
});

// ----- Composite + edge cases -----

Deno.test("Composite · clean proof → no flags", () => {
  const flags = computeAuditFlags(makeProof());
  assertEquals(flags.length, 0);
});

Deno.test("Composite · worst case → 5 flags", () => {
  // L 9 case 0 + all 9 + vague + no growth + 5 verticals
  const sm = fullSkill(9);
  const flags = computeAuditFlags(makeProof({
    L_score: 9,
    case_count: "0",
    skill_matrix: sm,
    strengths: ["會用 Claude"],
    growth: [],
    verticals: ["design", "copy", "dev", "ops", "strategy"],
  }));
  assert(hasFlag(flags, "low_evidence_high_score"));
  assert(hasFlag(flags, "all_perfect_matrix"));
  assert(hasFlag(flags, "vague_strengths"));
  assert(hasFlag(flags, "no_growth_self_aware"));
  assert(hasFlag(flags, "vertical_overclaim"));
});

Deno.test("Edge · missing skill_matrix → R2/R3 skip silently", () => {
  // deliberately break shape (cast to any) to simulate broken AI output
  const proof = makeProof();
  // deno-lint-ignore no-explicit-any
  (proof as any).skill_matrix = undefined;
  const flags = computeAuditFlags(proof);
  assert(!hasFlag(flags, "all_perfect_matrix"));
  assert(!hasFlag(flags, "bipolar_matrix"));
});

Deno.test("Edge · partial skill_matrix (5 dims only) → R2/R3 skip", () => {
  const proof = makeProof();
  // deno-lint-ignore no-explicit-any
  (proof as any).skill_matrix = { workflow_design: 10, tool_orchestration: 10, judgment: 10, domain_depth: 10, client_communication: 10 };
  const flags = computeAuditFlags(proof);
  assert(!hasFlag(flags, "all_perfect_matrix"));
  assert(!hasFlag(flags, "bipolar_matrix"));
});

Deno.test("Edge · strengths null → R4 skip", () => {
  const proof = makeProof();
  // deno-lint-ignore no-explicit-any
  (proof as any).strengths = null;
  const flags = computeAuditFlags(proof);
  assert(!hasFlag(flags, "vague_strengths"));
});

Deno.test("Edge · vague_strengths flags only once even with multiple violations", () => {
  const flags = computeAuditFlags(makeProof({
    strengths: ["熟悉 AI", "工具齊全", "都會"],
  }));
  const count = flags.filter((f) => f.id === "vague_strengths").length;
  assertEquals(count, 1);
});
