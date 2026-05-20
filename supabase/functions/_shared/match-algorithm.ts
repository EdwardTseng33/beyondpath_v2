// BeyondPath POC . Shared . Match algorithm (pure functions)
// Spec ref: docs/launch/08-matching-pipeline-spec-calcifer.md Task P1-3
// 2026-05-20 P1-3 calcifer
//
// Pure functions only - no fetch, no DB, no Deno globals - easy to unit test.

import type { UnifiedWorker, ScoreBreakdown } from "./worker-schema.ts";
import { isAdjacent, hasAnyAdjacent } from "./vertical-adjacency.ts";

export type Timeline = "rush" | "normal" | "flexible";

export interface ClientIntakeForMatch {
  id?: string;
  vertical: string;
  tasks: string[];
  budget_range?: string;
  timeline?: Timeline | string;
  required_tier?: string;
}

export interface MatchResult {
  worker_id: string;
  handle: string;
  name: string;
  tier: string;
  L_score: number;
  verticals: string[];
  score: number;
  breakdown: ScoreBreakdown;
  why: string;
}

const TIER_LEVEL: Record<string, number> = {
  B: 1,
  "B+": 2,
  Bplus: 2,
  A: 3,
  "A+": 4,
  Aplus: 4,
  S: 5,
};

function tierLevel(t: string | undefined | null): number {
  if (!t) return 1;
  const norm = String(t).trim();
  return TIER_LEVEL[norm] !== undefined ? TIER_LEVEL[norm] : 1;
}

export function scoreTierMatch(requiredTier: string | undefined, workerTier: string): number {
  if (!requiredTier) return 22;
  const diff = tierLevel(workerTier) - tierLevel(requiredTier);
  if (diff === 0) return 25;
  if (diff === 1) return 25;
  if (diff === 2) return 22;
  if (diff === -1) return 18;
  return 10;
}

export function scoreCapacity(capacity: number, timeline?: string): number {
  const cap = typeof capacity === "number" && capacity > 0 ? capacity : 0;
  if (cap === 0) return 0;
  const t = (timeline || "normal").toLowerCase();
  if (t === "rush") return cap >= 2 ? 20 : 10;
  if (t === "flexible") return cap >= 1 ? 20 : 0;
  return cap >= 1 ? 18 : 8;
}

const TASK_SKILL_MAP: Record<string, string[]> = {
  workflow: ["workflow_design", "tool_orchestration"],
  automation: ["workflow_design", "tool_orchestration"],
  brief: ["client_communication", "workflow_design"],
  copy: ["client_communication", "judgment"],
  design: ["domain_depth", "delivery_reliability"],
  delivery: ["delivery_reliability"],
  strategy: ["judgment", "domain_depth"],
  research: ["judgment", "domain_depth"],
};

function calculateTaskMatch(tasks: string[], skillMatrix: UnifiedWorker["skill_matrix"]): number {
  if (!Array.isArray(tasks) || tasks.length === 0) return 0;
  if (!skillMatrix) return 0;
  let bestScore = 0;
  for (const taskRaw of tasks) {
    const task = String(taskRaw || "").toLowerCase();
    if (!task) continue;
    for (const keyword in TASK_SKILL_MAP) {
      if (task.indexOf(keyword) === -1) continue;
      const skillKeys = TASK_SKILL_MAP[keyword];
      let sum = 0;
      let count = 0;
      for (const k of skillKeys) {
        const v = (skillMatrix as Record<string, number>)[k];
        if (typeof v === "number") {
          sum += v;
          count++;
        }
      }
      if (count > 0) {
        const avg = sum / count;
        const taskScore = Math.min(5, Math.round((avg / 10) * 5));
        if (taskScore > bestScore) bestScore = taskScore;
      }
    }
  }
  return bestScore;
}

export function scoreDomainMatch(
  clientVertical: string,
  workerVerticals: string[],
  tasks: string[],
  skillMatrix: UnifiedWorker["skill_matrix"],
): number {
  const wv = Array.isArray(workerVerticals) ? workerVerticals : [];
  const primary = wv.indexOf(clientVertical) !== -1 ? 20 : 0;
  const adjacent = primary === 0 && hasAnyAdjacent(clientVertical, wv) ? 5 : 0;
  const adjacentBonus = primary > 0 && wv.some(function (v) { return v !== clientVertical && isAdjacent(clientVertical, v); }) ? 5 : adjacent;
  const taskMatch = calculateTaskMatch(tasks || [], skillMatrix);
  return Math.min(30, primary + adjacentBonus + taskMatch);
}

export function scoreLBonus(L_score: number): number {
  const L = typeof L_score === "number" ? L_score : 0;
  const clamped = Math.max(0, Math.min(10, L));
  return Math.round((clamped / 10) * 15);
}

function daysSince(iso: string | undefined | null): number {
  if (!iso) return 0;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return 0;
  const diffMs = Date.now() - t;
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export function scoreMercyBoost(lastActive: string | undefined): number {
  return daysSince(lastActive) > 90 ? 10 : 0;
}

export function calculateMatchScore(
  client: ClientIntakeForMatch,
  worker: UnifiedWorker,
): { score: number; breakdown: ScoreBreakdown } {
  const tier_match = scoreTierMatch(client.required_tier, worker.tier);
  const capacity_match = scoreCapacity(worker.capacity, client.timeline);
  const domain_match = scoreDomainMatch(
    client.vertical,
    worker.verticals,
    client.tasks,
    worker.skill_matrix,
  );
  const L_score_bonus = scoreLBonus(worker.L_score);
  const mercy_boost = scoreMercyBoost(worker.last_active);
  const total = tier_match + capacity_match + domain_match + L_score_bonus + mercy_boost;
  return {
    score: Math.round(Math.min(100, total)),
    breakdown: { tier_match, capacity_match, domain_match, L_score_bonus, mercy_boost },
  };
}

export function explainMatch(client: ClientIntakeForMatch, worker: UnifiedWorker, breakdown: ScoreBreakdown): string {
  const parts: string[] = [];
  if (breakdown.domain_match >= 25) parts.push(client.vertical + " 領域吻合");
  else if (breakdown.domain_match >= 20) parts.push(client.vertical + " 主領域");
  else if (breakdown.domain_match >= 5) parts.push("鄰近領域可承接");
  if (breakdown.tier_match >= 22) parts.push("Tier " + worker.tier + " 對位");
  else if (breakdown.tier_match >= 18) parts.push("Tier " + worker.tier + " 偏稍低");
  if (breakdown.L_score_bonus >= 12) parts.push("L-score " + worker.L_score + " 高");
  if (breakdown.mercy_boost > 0) parts.push("久未派案 · 反馬太優先");
  if (parts.length === 0) parts.push("綜合分 " + worker.tier + " · L-score " + worker.L_score);
  return parts.join(" · ");
}

export function rankWorkers(
  client: ClientIntakeForMatch,
  workers: UnifiedWorker[],
  topN: number,
): MatchResult[] {
  const limit = typeof topN === "number" && topN > 0 ? topN : 5;
  const results: MatchResult[] = [];
  for (const worker of workers) {
    const { score, breakdown } = calculateMatchScore(client, worker);
    results.push({
      worker_id: worker.id,
      handle: worker.handle,
      name: worker.name,
      tier: worker.tier,
      L_score: worker.L_score,
      verticals: worker.verticals,
      score,
      breakdown,
      why: explainMatch(client, worker, breakdown),
    });
  }
  results.sort(function (a, b) { return b.score - a.score; });
  return results.slice(0, limit);
}
