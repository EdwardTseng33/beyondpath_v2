// BeyondPath POC . Shared . Vertical adjacency map
// Used by match-algorithm.ts scoreDomainMatch · adjacent vertical = +5 points
// 2026-05-20 P1-3 calcifer
//
// Adjacency = "worker in vertical A can plausibly serve client in vertical B"
// Symmetric (A adjacent B implies B adjacent A) · we encode both sides explicitly for O(1) lookup.
// Source: BeyondPath PRD §6 verticals + worker-ai-interview SYSTEM_PROMPT verticals enum.

export const VERTICAL_ADJACENCY: Record<string, string[]> = {
  // Core verticals from worker-ai-interview enum (design / copy / dev / ops / strategy)
  design: ["copy", "brand", "dtc", "reels"],
  copy: ["design", "brand", "strategy"],
  dev: ["software", "agent", "ops"],
  ops: ["dev", "strategy", "agent"],
  strategy: ["copy", "ops", "brand", "dtc"],

  // Step 4 verticals (from data.standalone.jsx · UI-side)
  software: ["dev", "agent"],
  agent: ["software", "dev", "ops"],
  dtc: ["design", "brand", "strategy", "reels"],
  brand: ["design", "copy", "dtc", "strategy"],
  reels: ["design", "dtc", "copy"],
};

/**
 * isAdjacent · returns true if a and b are adjacent verticals (excluding identity)
 * Symmetric: isAdjacent(a, b) === isAdjacent(b, a)
 */
export function isAdjacent(a: string, b: string): boolean {
  if (!a || !b || a === b) return false;
  const neighborsA = VERTICAL_ADJACENCY[a] || [];
  if (neighborsA.indexOf(b) !== -1) return true;
  const neighborsB = VERTICAL_ADJACENCY[b] || [];
  return neighborsB.indexOf(a) !== -1;
}

/**
 * hasAnyAdjacent · returns true if any vertical in `workerVerticals` is adjacent to `clientVertical`
 */
export function hasAnyAdjacent(clientVertical: string, workerVerticals: string[]): boolean {
  if (!clientVertical || !Array.isArray(workerVerticals)) return false;
  for (const v of workerVerticals) {
    if (isAdjacent(clientVertical, v)) return true;
  }
  return false;
}
