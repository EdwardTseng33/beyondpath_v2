// BeyondPath POC . Shared types . UnifiedWorker contract
// Single contract bridging worker-ai-interview ai_proof + worker_applications row + Step 4 worker shape.
// 2026-05-18 T1.1 + T1.2 calcifer (P0-1 stage 1)
// Spec ref: docs/launch/08-matching-pipeline-spec-calcifer.md . Task P0-1
//
// Gap vs spec (real schema audit 2026-05-18):
//   1. ai_proof has NO capacity / rate_range (spec assumed). Use defaults.
//   2. skill_matrix keys differ from spec.
//   3. tier_suggestion real values: B and Bplus only.
//   4. portfolio item real shape uses roas not metric.

export type TierLevel = string;
export type Confidence = string;
export type CaseCountBucket = string;

export interface SkillMatrix {
  workflow_design: number;
  tool_orchestration: number;
  judgment: number;
  domain_depth: number;
  client_communication: number;
  delivery_reliability: number;
}

export interface AiProof {
  name: string;
  L_score: number;
  L_confidence: string;
  tier_suggestion: string;
  evidence_quality: string;
  verticals: string[];
  case_count: string;
  skill_matrix: SkillMatrix;
  strengths: string[];
  growth: string[];
}

export interface PortfolioItem {
  client: string;
  desc: string;
  roas?: string;
  metric?: string;
  nps?: number;
}

export interface WorkerApplicationRow {
  id?: string;
  user_id?: string | null;
  email: string;
  display_name?: string | null;
  ai_proof: AiProof;
  l_score?: number | null;
  verticals?: string[] | null;
  case_count?: string | null;
  tier_suggestion?: string | null;
  status?: string | null;
  portfolio?: PortfolioItem[] | null;
  created_at?: string;
  updated_at?: string;
}

export interface ScoreBreakdown {
  tier_match: number;
  capacity_match: number;
  domain_match: number;
  L_score_bonus: number;
  mercy_boost: number;
}

export interface UnifiedWorker {
  id: string;
  handle: string;
  name: string;
  role: string;
  tier: string;
  L_score: number;
  L_confidence: string;
  skill_matrix: SkillMatrix;
  verticals: string[];
  badges: string[];
  strengths: string[];
  growth: string[];
  capacity: number;
  rate_range: { lo: number; hi: number };
  last_active: string;
  nps: number | null;
  cases_completed: number;
  case_count_bucket: string;
  domain_match?: number;
  evidence_quality: string;
  score?: number;
  breakdown?: ScoreBreakdown;
  portfolio: PortfolioItem[] | null;
  blurb: string;
  works: string[];
}

const DEFAULT_CAPACITY = 3;
const DEFAULT_RATE_RANGE = { lo: 0, hi: 0 };

const VERTICAL_LABELS: Record<string, string> = {
  software: "Software",
  agent: "Agent",
  dtc: "DTC",
  design: "Design",
  copy: "Copy",
  dev: "Dev",
  ops: "Ops",
  strategy: "Strategy",
  brand: "Brand",
  reels: "Reels",
};

const SKILL_LABELS: Record<keyof SkillMatrix, string> = {
  workflow_design: "Workflow",
  tool_orchestration: "Tools",
  judgment: "Judgment",
  domain_depth: "Domain",
  client_communication: "Comm",
  delivery_reliability: "Delivery",
};

function rankSkills(matrix: SkillMatrix): Array<[keyof SkillMatrix, number]> {
  const entries = Object.entries(matrix) as Array<[keyof SkillMatrix, number]>;
  return entries.sort((a, b) => b[1] - a[1]);
}

function deriveRole(verticals: string[], matrix: SkillMatrix): string {
  const topVertical = verticals[0] ? (VERTICAL_LABELS[verticals[0]] || verticals[0]) : "Generalist";
  const topSkill = rankSkills(matrix)[0];
  if (!topSkill || topSkill[1] < 6) {
    return topVertical + " Worker";
  }
  return topVertical + " + " + SKILL_LABELS[topSkill[0]] + " Expert";
}

function deriveBadges(verticals: string[], matrix: SkillMatrix, tier: string): string[] {
  const badges: string[] = [];
  if (verticals[0]) {
    badges.push(VERTICAL_LABELS[verticals[0]] || verticals[0]);
  }
  const topSkills = rankSkills(matrix).filter((entry) => entry[1] >= 8).slice(0, 3);
  for (const entry of topSkills) {
    const label = SKILL_LABELS[entry[0]];
    if (label && badges.indexOf(label) === -1) {
      badges.push(label);
    }
  }
  const tierLabel = "Tier " + tier;
  if (tier !== "B" && badges.indexOf(tierLabel) === -1) {
    badges.push(tierLabel);
  }
  return badges;
}

function deriveHandle(email: string, displayName?: string | null): string {
  if (displayName) {
    return "@" + displayName.replace(/\s+/g, "").toLowerCase();
  }
  const localPart = email.split("@")[0];
  return "@" + (localPart || "anon");
}

function deriveBlurb(proof: AiProof): string {
  if (proof.strengths && proof.strengths.length > 0) {
    return proof.strengths.slice(0, 2).join(" / ") + ".";
  }
  const topVertical = proof.verticals[0]
    ? (VERTICAL_LABELS[proof.verticals[0]] || proof.verticals[0])
    : "Generalist";
  return "BeyondPath Tier " + proof.tier_suggestion + " certified worker in " + topVertical + ".";
}

function deriveWorks(portfolio: PortfolioItem[] | null): string[] {
  if (!portfolio || portfolio.length === 0) return [];
  return portfolio.slice(0, 3).map((p) => p.client);
}

/**
 * aiProofToUnifiedWorker
 * @param row    worker_applications DB row
 * @param proof  ai_proof JSON from worker-ai-interview Edge Function
 * @returns      UnifiedWorker shape shared by Step 4 UI and matching algorithm
 *
 * Edge cases:
 *   - skill_matrix missing field -> 0 (displays as untested)
 *   - verticals empty -> role shows Generalist Worker
 *   - portfolio null -> works[] empty
 *   - ai_proof has no capacity / rate_range -> defaults used
 *   - tier_suggestion B / Bplus -> used directly; row override takes precedence
 *
 * Does NOT compute score / breakdown / domain_match (matching algorithm fills at runtime).
 * Does NOT write to DB (pure function, no side effect).
 */
export function aiProofToUnifiedWorker(
  row: WorkerApplicationRow,
  proof: AiProof,
): UnifiedWorker {
  const id = row.id || "anon-" + (row.email || "").split("@")[0];
  const name = row.display_name || proof.name || (row.email ? row.email.split("@")[0] : "anonymous");
  const handle = deriveHandle(row.email || "", row.display_name);

  const tier: string = row.tier_suggestion || proof.tier_suggestion || "B";

  const sm = proof.skill_matrix || ({} as SkillMatrix);
  const skillMatrix: SkillMatrix = {
    workflow_design: typeof sm.workflow_design === "number" ? sm.workflow_design : 0,
    tool_orchestration: typeof sm.tool_orchestration === "number" ? sm.tool_orchestration : 0,
    judgment: typeof sm.judgment === "number" ? sm.judgment : 0,
    domain_depth: typeof sm.domain_depth === "number" ? sm.domain_depth : 0,
    client_communication: typeof sm.client_communication === "number" ? sm.client_communication : 0,
    delivery_reliability: typeof sm.delivery_reliability === "number" ? sm.delivery_reliability : 0,
  };

  const verticals: string[] = Array.isArray(proof.verticals) ? proof.verticals : [];
  const role = deriveRole(verticals, skillMatrix);
  const badges = deriveBadges(verticals, skillMatrix, tier);

  const portfolio: PortfolioItem[] | null = Array.isArray(row.portfolio) && row.portfolio.length > 0
    ? row.portfolio
    : null;

  const blurb = deriveBlurb(proof);
  const works = deriveWorks(portfolio);
  const lastActive = row.updated_at || row.created_at || "unknown";

  return {
    id,
    handle,
    name,
    role,
    tier,
    L_score: typeof proof.L_score === "number" ? proof.L_score : 0,
    L_confidence: proof.L_confidence || "low",
    skill_matrix: skillMatrix,
    verticals,
    badges,
    strengths: Array.isArray(proof.strengths) ? proof.strengths : [],
    growth: Array.isArray(proof.growth) ? proof.growth : [],
    capacity: DEFAULT_CAPACITY,
    rate_range: { lo: DEFAULT_RATE_RANGE.lo, hi: DEFAULT_RATE_RANGE.hi },
    last_active: lastActive,
    nps: null,
    cases_completed: 0,
    case_count_bucket: proof.case_count || "0",
    evidence_quality: proof.evidence_quality || "low",
    portfolio,
    blurb,
    works,
  };
}

