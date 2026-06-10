// BeyondPath POC . Shared . Commission calculation helper
// 2026-05-28 . calcifer . 抽佣計算系統
//
// Rules (Edward 拍板):
//   one_off:  B 20% / B+ 19% / A 18% / A+ 17% / S 17%
//   retainer: 各 Tier +3% (B 23% / B+ 22% / A 21% / A+ 20% / S 20%)
//
// Tier 命名 fallback (legacy + new 都吃):
//   legacy: 'tier_b' / 'tier_b_plus'   (from worker_applications.status)
//   new:    'B' / 'B+' / 'A' / 'A+' / 'S'   (from worker_applications.tier_suggestion)
//
// Output: integer NT$ (rounded) . platform 不收小數點

export type WorkerTier = "B" | "B+" | "A" | "A+" | "S";
export type ContractType = "one_off" | "retainer";

export interface CommissionInput {
  worker_tier: string;          // raw value (any case / legacy / null)
  contract_type: ContractType;
  project_budget_ntd: number;   // integer NT$
}

export interface CommissionOutput {
  worker_tier_normalized: WorkerTier;
  contract_type: ContractType;
  project_budget_ntd: number;
  commission_rate: number;          // 0-100 (e.g. 18.00 for 18%)
  commission_amount_ntd: number;    // integer NT$
  worker_net_amount_ntd: number;    // integer NT$
}

/**
 * Normalize tier string to canonical 'B' / 'B+' / 'A' / 'A+' / 'S'.
 * Handles legacy 'tier_b' / 'tier_b_plus' from worker_applications.status.
 * Unknown tier -> default to 'B' (safest = highest commission for platform).
 */
export function normalizeTier(tier: string | null | undefined): WorkerTier {
  if (!tier) return "B";
  const t = String(tier).trim().toLowerCase();
  if (t === "tier_b" || t === "b") return "B";
  if (t === "tier_b_plus" || t === "b+" || t === "bplus" || t === "b_plus") return "B+";
  if (t === "a") return "A";
  if (t === "a+" || t === "aplus" || t === "a_plus") return "A+";
  if (t === "s") return "S";
  return "B";
}

/**
 * Lookup table: tier x contract_type -> commission rate (%)
 * Numbers are percentages (18 means 18%, not 0.18).
 */
const RATE_TABLE: Record<WorkerTier, Record<ContractType, number>> = {
  "B":  { one_off: 20, retainer: 23 },
  "B+": { one_off: 19, retainer: 22 },
  "A":  { one_off: 18, retainer: 21 },
  "A+": { one_off: 17, retainer: 20 },
  "S":  { one_off: 17, retainer: 20 },
};

export function calcCommission(input: CommissionInput): CommissionOutput {
  const tier = normalizeTier(input.worker_tier);
  const ct: ContractType = input.contract_type === "retainer" ? "retainer" : "one_off";
  const budget = Math.max(0, Math.floor(Number(input.project_budget_ntd) || 0));
  const rate = RATE_TABLE[tier][ct];
  const commission = Math.round(budget * rate / 100);
  const net = budget - commission;
  return {
    worker_tier_normalized: tier,
    contract_type: ct,
    project_budget_ntd: budget,
    commission_rate: rate,
    commission_amount_ntd: commission,
    worker_net_amount_ntd: net,
  };
}

/**
 * Format helper . 「服務費明細」section text for contract PDF.
 */
export function formatCommissionBlock(o: CommissionOutput): string[] {
  const lines: string[] = [];
  lines.push("Client total payment (客戶付): NT$ " + o.project_budget_ntd.toLocaleString());
  lines.push("Worker net receipt (接案者實收): NT$ " + o.worker_net_amount_ntd.toLocaleString());
  lines.push("Platform service fee (平台抽佣): NT$ " + o.commission_amount_ntd.toLocaleString()
    + "  (Tier " + o.worker_tier_normalized + " . " + o.contract_type + " . " + o.commission_rate + "%)");
  return lines;
}
