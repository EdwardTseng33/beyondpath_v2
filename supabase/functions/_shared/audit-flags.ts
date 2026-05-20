// BeyondPath POC . audit-flags.ts
// Server-side audit on ai_proof . Phase 0 #3 (Trust foundation)
// 2026-05-21 . spec: docs/launch/12-audit-flags-spec.md . owner: calcifer (bg)
//
// Purpose
//   worker-ai-interview Edge Function 訪談完成後跑一輪 server-side audit、
//   把 6 條可疑 pattern 標進 ai_proof.audit_flags、admin approve 前多看一眼。
//   不是自動 reject、是 second pair of eyes。
//
// Detection rules v1 (spec §1)
//   R1 low_evidence_high_score (high)  L_score >= 8 AND case_count in {0, 1-2}
//   R2 all_perfect_matrix      (high)  skill_matrix 6 dims all >= 9
//   R3 bipolar_matrix          (medium) max - min >= 7
//   R4 vague_strengths         (medium) strengths short OR vague kw AND no concrete noun
//   R5 no_growth_self_aware    (low)   growth empty OR length 1 vague phrase
//   R6 vertical_overclaim      (low)   verticals.length >= 5
//
// Pure function . No side effect . No external dep

import type { AiProof } from "./worker-schema.ts";

export interface AuditFlag {
  id: string;
  severity: "high" | "medium" | "low";
  detail: string;
}

const VAGUE_KEYWORDS: string[] = [
  "熟悉 AI",
  "會用 AI",
  "擅長 AI workflow",
  "會用 Claude",
  "會 ChatGPT",
  "會 prompt",
  "熟悉工具",
  "工具齊全",
  "多元",
  "有經驗",
  "都會",
  "沒問題",
  "沒在怕",
  "很熟",
];

// Concrete noun heuristic (spec §2):
//   - digit + unit (%, k, K, 萬, 週, 天, 月)
//   - 2+ digit number (e.g. 30, 18)
//   - workflow arrow →
//   - metric keywords (ROAS, NPS, IC50 not in scope)
//   - tool names (n8n, Zapier, Make, Cursor, v0.dev, Midjourney, Vercel, Airtable, Notion, Slack)
//   - explicit ROI marker $
const CONCRETE_REGEX =
  /(\d+\s*[%kK萬週天月元]|\d{2,}|→|\bROAS\b|\bNPS\b|n8n|Zapier|Make|Cursor|v0\.dev|Midjourney|Vercel|Airtable|Notion|Slack|NT\$|US\$)/i;

const NO_GROWTH_VAGUE_REGEX = /沒有|目前無|都還可以|還好/;

/**
 * computeAuditFlags
 * @param proof  ai_proof JSON from worker-ai-interview
 * @returns      AuditFlag[] (empty array if clean)
 *
 * Resilient:
 *   - skill_matrix missing / partial → R2/R3 skip silently
 *   - strengths / growth / verticals null or non-array → treat as empty
 *   - non-number values in matrix filtered out
 *   - vague_strengths only flags once (first violation), avoid noise
 */
export function computeAuditFlags(proof: AiProof): AuditFlag[] {
  const flags: AuditFlag[] = [];

  // R1 · low_evidence_high_score
  const lScore = typeof proof.L_score === "number" ? proof.L_score : -1;
  const caseCount = typeof proof.case_count === "string" ? proof.case_count : "";
  if (lScore >= 8 && (caseCount === "0" || caseCount === "1-2")) {
    flags.push({
      id: "low_evidence_high_score",
      severity: "high",
      detail: `L_score=${lScore} case_count=${caseCount}`,
    });
  }

  // R2 + R3 · skill_matrix shape based
  const sm = proof.skill_matrix && typeof proof.skill_matrix === "object" ? proof.skill_matrix : null;
  const vals: number[] = sm
    ? (Object.values(sm) as unknown[]).filter((v): v is number => typeof v === "number" && Number.isFinite(v))
    : [];

  if (vals.length === 6 && vals.every((v) => v >= 9)) {
    flags.push({
      id: "all_perfect_matrix",
      severity: "high",
      detail: `min=${Math.min(...vals)} max=${Math.max(...vals)}`,
    });
  }

  if (vals.length === 6) {
    const range = Math.max(...vals) - Math.min(...vals);
    if (range >= 7) {
      flags.push({
        id: "bipolar_matrix",
        severity: "medium",
        detail: `range=${Math.min(...vals)}-${Math.max(...vals)}`,
      });
    }
  }

  // R4 · vague_strengths (flag once on first violation)
  const strengths: string[] = Array.isArray(proof.strengths) ? proof.strengths : [];
  for (const raw of strengths) {
    const s = typeof raw === "string" ? raw : "";
    if (!s) continue;
    const hasVague = VAGUE_KEYWORDS.some((kw) => s.includes(kw));
    const tooShort = s.length < 8;
    const hasConcrete = CONCRETE_REGEX.test(s);
    if ((hasVague || tooShort) && !hasConcrete) {
      flags.push({
        id: "vague_strengths",
        severity: "medium",
        detail: `strengths="${s.slice(0, 30)}"`,
      });
      break;
    }
  }

  // R5 · no_growth_self_aware
  const growth: string[] = Array.isArray(proof.growth) ? proof.growth : [];
  if (growth.length === 0) {
    flags.push({
      id: "no_growth_self_aware",
      severity: "low",
      detail: `growth.length=0`,
    });
  } else if (growth.length === 1 && typeof growth[0] === "string" && NO_GROWTH_VAGUE_REGEX.test(growth[0])) {
    flags.push({
      id: "no_growth_self_aware",
      severity: "low",
      detail: `growth="${growth[0].slice(0, 30)}"`,
    });
  }

  // R6 · vertical_overclaim
  const verticals: string[] = Array.isArray(proof.verticals) ? proof.verticals : [];
  if (verticals.length >= 5) {
    flags.push({
      id: "vertical_overclaim",
      severity: "low",
      detail: `verticals.length=${verticals.length}`,
    });
  }

  return flags;
}
