# Audit Flags Spec · Phase 0 #3 警示燈

**日期**：2026-05-21
**對應**：霍爾 5/20 CPO 規劃 Phase 0「先補產品信任地基」第 3 件「AI paste-back 後加 server-side audit、不只 JSON parse」
**Owner**：蘇菲（spec）+ 卡西法（背景上線）
**Status**：spec ready · 待派卡西法 background

---

## 0. 為什麼要警示燈

worker 答完訪談、AI 整理出 `ai_proof`（L_score 自評 / skill_matrix 6 維 / case_count / strengths / growth）—— 全是 worker 自己說的、AI 只負責「結構化」、不負責「驗真」。

實務上會出現的 3 類「自吹自擂」：

1. **自信高、證據低**：L_score 9 但 case_count 0-2 + portfolio 空
2. **全滿分可疑**：skill_matrix 6 維全 9-10
3. **泛詞無例**：strengths 寫「會用 Claude」「擅長 AI workflow」這種沒具體案件 / 數字 / 工具的泛詞

警示燈作用：**訪談完成那一刻、伺服端自動跑一輪偵測、把可疑點標進 ai_proof.audit_flags、admin 在 WorkerCard 看到旗標、approve 前多看一眼**。

不是自動 reject、是「給 admin 一個 second pair of eyes」。

---

## 1. 偵測規則 v1 · 6 條

| Flag ID | 觸發條件 | 嚴重度 | 解讀 |
|---|---|---|---|
| `low_evidence_high_score` | `L_score >= 8` AND `case_count` ∈ {`0`, `1-2`} | high | 自信高、實際案件數低、可能高估 |
| `all_perfect_matrix` | `skill_matrix` 所有 6 維 >= 9 | high | 全部 9 分以上、缺乏自我批判 |
| `bipolar_matrix` | max(skill_matrix) - min(skill_matrix) >= 7 | medium | 6 維極化（一邊 10、一邊 3）、可能 cherry-pick |
| `vague_strengths` | `strengths` 內任一句 < 8 字 OR 含泛詞（「會用 X」「擅長 AI」「熟悉 workflow」）AND 不含具體名詞 | medium | 強項泛泛、無 client 名 / 數字 / 工具串接細節 |
| `no_growth_self_aware` | `growth` 空 OR 長度 1 OR 含「沒有」「目前無」「都還可以」 | low | 沒列成長方向 = 缺乏自省 |
| `vertical_overclaim` | `verticals.length >= 5` | low | 自稱跨 5+ 領域、可能稀釋 |

---

## 2. 泛詞偵測 · keyword list

`vague_strengths` 規則用的「泛詞」清單（包含則 flag）：

```
熟悉 AI / 會用 AI / 擅長 AI workflow / 會用 Claude / 會 ChatGPT / 會 prompt /
熟悉工具 / 工具齊全 / 多元 / 有經驗 / 都會 / 沒問題 / 沒在怕 / 很熟
```

含「具體名詞」 = 至少 1 個（豁免泛詞 flag）：

```
- 具體 client 名（任何長度 ≥ 2 的中文 / 英文 brand 名）
- 數字 + 單位（如「ROAS 3.2」「轉換率 +18%」「2 週」「NT$50k」）
- 工具串接（如「Claude → n8n → Slack」「Make + Airtable」「v0 → Cursor → Vercel」）
- 案例規模（如「30 萬粉專」「日活 5k」）
```

---

## 3. 嚴重度顯示規則（admin.jsx WorkerCard）

| 嚴重度 | 視覺 | 解讀文字 |
|---|---|---|
| high | 紅色 (oklch warm-red) ● 邊框 | ⚠ 高警示 · 建議再追問 |
| medium | 橘色 (oklch warn) ● 邊框 | △ 中警示 · approve 前看一眼 |
| low | 灰色 ● | ◯ 低警示 · 參考 |

admin 看到 `audit_flags` 陣列時、按嚴重度排序顯示在 WorkerCard 內、Skill Matrix block 下方一段：

```
◆ AUDIT FLAGS · 訪談證據偵測
⚠ low_evidence_high_score · L_score 9 但 case_count 1-2
△ vague_strengths · 強項「熟悉 AI workflow」缺具體案例
◯ no_growth_self_aware · 沒列成長方向
```

無 flag 時不顯示這段。

---

## 4. 寫入位置

`ai_proof.audit_flags` JSON 陣列：

```json
{
  "ai_proof": {
    "name": "...",
    "L_score": 9,
    "skill_matrix": { ... },
    "audit_flags": [
      { "id": "low_evidence_high_score", "severity": "high", "detail": "L_score=9 case_count=1-2" },
      { "id": "vague_strengths", "severity": "medium", "detail": "strengths[0]=\"熟悉 AI workflow\"" }
    ]
  }
}
```

**位置選擇理由**：寫在 `ai_proof` 內、而不是獨立欄位 → 跟 ai_proof 一起進 worker_applications.ai_proof jsonb、不需 migration、不破壞既有 schema、worker_unified_v view 自動帶到（jsonb 整包 select）。

---

## 5. 觸發時機

worker-ai-interview Edge Function 算 `unified_card` 之後（line 251-271 那段）、return response 之前、加一層 `computeAuditFlags(ai_proof)`：

```typescript
// supabase/functions/_shared/audit-flags.ts (新檔)
export interface AuditFlag {
  id: string;
  severity: 'high' | 'medium' | 'low';
  detail: string;
}

export function computeAuditFlags(proof: AiProof): AuditFlag[] {
  const flags: AuditFlag[] = [];
  // R1 · low_evidence_high_score
  if (proof.L_score >= 8 && ['0', '1-2'].includes(proof.case_count)) {
    flags.push({ id: 'low_evidence_high_score', severity: 'high', detail: `L_score=${proof.L_score} case_count=${proof.case_count}` });
  }
  // R2 · all_perfect_matrix
  const sm = proof.skill_matrix || {};
  const vals = Object.values(sm).filter((v): v is number => typeof v === 'number');
  if (vals.length === 6 && vals.every(v => v >= 9)) {
    flags.push({ id: 'all_perfect_matrix', severity: 'high', detail: `min=${Math.min(...vals)} max=${Math.max(...vals)}` });
  }
  // R3 · bipolar_matrix
  if (vals.length === 6 && (Math.max(...vals) - Math.min(...vals)) >= 7) {
    flags.push({ id: 'bipolar_matrix', severity: 'medium', detail: `range=${Math.min(...vals)}-${Math.max(...vals)}` });
  }
  // R4 · vague_strengths
  const VAGUE_KW = ['熟悉 AI', '會用 AI', '擅長 AI workflow', '會用 Claude', '會 ChatGPT', '會 prompt', '熟悉工具', '工具齊全', '多元', '有經驗', '都會', '沒問題', '沒在怕', '很熟'];
  const CONCRETE_RE = /(\d+\s*[%kK萬週天月]|\d{2,}|→|\bROAS\b|\bNPS\b|n8n|Zapier|Make|Cursor|v0\.dev|Midjourney|Vercel|Airtable|Notion|Slack)/i;
  for (const s of (proof.strengths || [])) {
    const hasVague = VAGUE_KW.some(kw => s.includes(kw));
    const hasConcrete = CONCRETE_RE.test(s);
    if ((hasVague || s.length < 8) && !hasConcrete) {
      flags.push({ id: 'vague_strengths', severity: 'medium', detail: `strengths="${s.slice(0, 30)}"` });
      break;  // 只 flag 一次、不重複
    }
  }
  // R5 · no_growth_self_aware
  const growth = proof.growth || [];
  if (growth.length === 0 ||
      (growth.length === 1 && /沒有|目前無|都還可以|還好/.test(growth[0]))) {
    flags.push({ id: 'no_growth_self_aware', severity: 'low', detail: `growth.length=${growth.length}` });
  }
  // R6 · vertical_overclaim
  if ((proof.verticals || []).length >= 5) {
    flags.push({ id: 'vertical_overclaim', severity: 'low', detail: `verticals.length=${(proof.verticals || []).length}` });
  }
  return flags;
}
```

---

## 6. 卡西法 Background Brief（self-contained · cold start）

派工 prompt：

```
你是卡西法、CTO subagent、cold start。

## 任務
為 BeyondPath worker-ai-interview Edge Function 加 audit_flags 警示燈、依
docs/launch/12-audit-flags-spec.md 偵測規則 v1 6 條 ship 上線。

## 改動範圍
1. 新檔：supabase/functions/_shared/audit-flags.ts
   - computeAuditFlags(proof) 函式（spec §5 程式碼草稿）
   - AuditFlag interface

2. 改檔：supabase/functions/worker-ai-interview/index.ts
   - import computeAuditFlags from ../_shared/audit-flags.ts
   - 在 line 271 後（unifiedCard 算完後）、加一行 audit_flags = computeAuditFlags(proof)
   - 寫進 response 的 ai_proof（merge / 不覆蓋既有欄位）

3. 新檔：supabase/functions/_shared/audit-flags.test.ts
   - 6 條 rule 各寫 1-2 個 Deno test case
   - run: deno test --allow-all audit-flags.test.ts

4. 改檔：components/admin.jsx WorkerCard
   - Skill Matrix block 下加 Audit Flags block
   - 顯示規則參考 spec §3
   - 嚴重度色彩：high=oklch warm-red / medium=oklch warn / low=muted

## 不動
- worker.jsx 端不必動（audit_flags 只給 admin 看、不顯示給 worker 自己）
- match-workers Edge Function 不必動（audit_flags 是 admin 決策資訊、不影響演算法）
- 不動既有 ai_proof.skill_matrix / L_score 等欄位

## 驗收
- deno test PASS
- worker 完成訪談後、Edge Function response.ai_proof.audit_flags 有陣列
- admin.jsx WorkerCard 看到 flags 含正確嚴重度色彩
- 6 條規則 manual 驗一輪（fake input 跑、看 flag 對不對）

## 工時估
1.5-2 hr
```

---

## 7. 未來迭代（v2 不在此 sprint）

- audit_flags 寫進 admin_notes 系統、Edward override「我看過、可 ignore」
- 訪談中即時 hint（worker 看到自己被 flag、可補充）—— 但這會破壞自然訪談、不建議
- 機器學習版：用通過 / 拒絕的歷史 worker 資料訓練 audit_flags 規則 → Q4 後
- 跨領域 vertical 一致性檢查（如「自稱會 dtc + ops + dev + design + brand」實際 portfolio 只有 design）

---

*🌸 蘇菲 · 2026-05-21 · 收尾霍爾 Phase 0 信任地基 · spec ready 派卡西法 background*
