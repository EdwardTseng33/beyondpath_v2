# BeyondPath 配對 Pipeline · 真實演算法 implementation spec

**作者**：🔥 卡西法 CTO audit + 🌸 蘇菲整合 spec
**日期**：2026-05-18
**Trigger**：Edward 5/18「全修、要真實推薦演算法 + AI 確實運作」拍板

---

## 背景：當前 vs 目標

### 當前 status (P1 ship)

```
USER 看到的 (Step 4)             實際後台
────────────────                ────────────────
"AI 配對 92 分"                   data.standalone.jsx hardcoded
"ranked by ADR-006"              純前端 .sort(b.score - a.score)
"100 分加權排序"                  字面數字、沒計算
"已套用權重 algorithm"             沒任何 production code 實作 ADR-006

Worker AI 對談 (真跑 Claude)     ai_proof JSON 寫進 DB
  → 萃取 L_score / skill_matrix    → 沒人讀
  → tier_suggestion / verticals    → 跟前端 Step 4 schema 完全脫鉤

Client brief 解析 (真跑 Claude)  state.parsed 純展示
  → 萃取 industry / tasks         → Step 4 沒讀任一欄位影響排序

EDWARD_ADVISOR_PROMPT (真跑)    給 Edward「接 / 不接 / Tier / 報價」
                                  → 不接觸 worker pool、不推薦「派誰」
```

### Target status (P2 + Q3 Sprint v2 ship)

```
USER 看到的 (Step 4)             實際後台
────────────────                ────────────────
"過往案例參考"（不再 ranked claim） 真實 worker pool from Supabase
"實際配對 24h email"             Edge Function 跑真演算法
                                  3 維加權：tier match + capacity + domain
                                  輸出 Top 3 + 每位 score 真實計算

Worker AI 對談 (真跑 Claude)     ai_proof JSON 寫進 DB
  → 萃取 L_score / skill_matrix    → 透過 mapping function 轉成
  → tier_suggestion / verticals      Step 4 contract schema
                                  → 被 Admin UI + matching algorithm 消費

Client brief 解析 (真跑 Claude)  state.parsed feed 進 matching
  → 萃取 industry / tasks         → matching algorithm 用 parsed.vertical
                                    + parsed.tasks + parsed.budget 算 domain match

EDWARD_ADVISOR_PROMPT (真跑)    額外 query worker pool
  + worker pool context           → 推薦「建議派 @X / @Y / @Z + why」
                                  → 你 Slack 通知含 AI 推薦 worker 清單
```

---

## 5 件 implementation task

### Task P2-5 · UI 文案誠實化（hot-fix · 已 ship 2026-05-18）

✅ **Done**：
- `app2.jsx:780` `Top matches, ranked by ADR-006.` → `Top examples in your vertical.`
- `app2.jsx:783` `AI 已套用權重 algorithm` → `下方為「{vertical}」過往合作案例參考、實際配對 24h 內 email`
- `app.jsx:670` 同步改動

待 deploy 後生效。

---

### Task P0-1 · Worker schema unification

**Goal**：把 worker AI 對談萃取的 `ai_proof` JSON + 前端 Step 4 worker shape 合併成單一 contract。

**現況**（2026-05-18 T1.1 align：以 `worker-ai-interview/index.ts:90-97` production schema 為準 · spec 早先草稿假設已 deprecate）：
- `ai_proof` 來自 worker-ai-interview Edge Function、Claude 萃取
  ```json
  {
    "name": "Edward Tseng",
    "L_score": 7.8,                                // 0-10
    "L_confidence": "高",                           // "高" | "中" | "低"
    "tier_suggestion": "B+",                        // 真實 enum: "B" | "B+" only（A / A+ / S 暫不存在 · 累積 case 後升級）
    "evidence_quality": "高",                       // "高" | "中" | "低"
    "verticals": ["software", "agent"],
    "case_count": "5+",                             // 字串 bucket: "0" | "1-2" | "3-5" | "5+" | "10+"
    "skill_matrix": {                               // 真實 6 維（跟 spec 早期假設不同）
      "workflow_design": 8,
      "tool_orchestration": 9,
      "judgment": 7,
      "domain_depth": 8,
      "client_communication": 7,
      "delivery_reliability": 8
    },
    "strengths": ["...", "..."],
    "growth": ["...", "..."]
  }
  ```
  > **真實 ai_proof 不含 `capacity` / `rate_range`**（spec 早期假設、Edge Function 沒問、worker 沒填）。T1.3 DB schema 階段需決策：(a) 加 Step 3 input field 讓 worker 自填、或 (b) 用 default + 未來 Admin UI 設定。
- 前端 Step 4 worker shape（`data.standalone.jsx`）
  ```javascript
  {
    id: 'w-arc',
    handle: '@arc.lin',
    name: 'Tier A+ 視覺 + Brand 專家',
    role: 'Visual + Brand DNA',
    tier: 'A+',
    badges: ['DTC', 'Brand DNA × AI'],
    nps: 4.86,
    cases: 2,
    capacity: 4,
    voice: 18_400,
    voiceCh: 'IG',
    domainMatch: 0.92,
    score: 92,
    breakdown: { load, calendar, tier, nps, domain, voice, boost },
    blurb: '...',
    works: [...],
    portfolio: [...]
  }
  ```

**Mapping function spec**（已 ship 於 2026-05-18 T1.1 + T1.2 · 詳見 `supabase/functions/_shared/worker-schema.ts` 252 行 + `worker-schema.test.ts` 173 行 / 45 assertion PASS · 以下為早期 spec 草稿、實際 schema 以 worker-schema.ts 為 source of truth）：

```typescript
// Worker unified shape (single contract for ai_proof + Step 4 display)
interface UnifiedWorker {
  // ID + identity
  id: string;
  handle: string;
  name: string;          // 從 worker_applications.display_name
  role: string;          // derived from ai_proof.verticals[0] + skill_matrix top
  tier: 'B' | 'A' | 'A+' | 'S';

  // Capability (從 ai_proof)
  L_score: number;       // 0-10 · 從 ai_proof.L_score
  skill_matrix: {        // 6 維、從 ai_proof
    discover_problem: number;
    structure_brief: number;
    tools_proficiency: number;
    delivery_quality: number;
    review_iteration: number;
    knowledge_transfer: number;
  };
  verticals: string[];   // 從 ai_proof.verticals (vertical IDs)
  badges: string[];      // derived from skill_matrix top 2-3 + tier

  // Availability + pricing (從 ai_proof + worker_applications)
  capacity: number;      // 從 ai_proof.capacity
  rate_range: { lo: number; hi: number };  // 從 ai_proof.rate_range
  last_active: string;   // 從 worker_applications.updated_at

  // Trust signals (從 後續 cases 累積 · Phase 1 從 ai_proof seed)
  nps: number | null;    // 累積後填、初始 null
  cases_completed: number;  // 初始 0
  domain_match: number;  // 0-1 · runtime 計算（per matching call）

  // Matching score (runtime · 由 matching algorithm 算)
  score?: number;        // 0-100
  breakdown?: {          // 每維貢獻
    tier_match: number;
    capacity_match: number;
    domain_match: number;
    L_score_bonus: number;
    mercy_boost: number;
  };

  // Portfolio (從 worker_applications.portfolio · 初期 null)
  portfolio: PortfolioItem[] | null;
  blurb: string;         // 從 ai_proof 推 or worker 自填
  works: string[];       // 從 portfolio 推
}

interface PortfolioItem {
  client: string;
  desc: string;
  metric: string;  // ROAS / NPS / 量
  nps?: number;
}
```

**Tasks**：
- ✅ T1.1 寫 `supabase/functions/_shared/worker-schema.ts` 定義 UnifiedWorker（**2026-05-18 calcifer ship · 252 行**）
- ✅ T1.2 寫 mapping function `aiProofToUnifiedWorker(workerRow, aiProof)`（**同 ship · runtime test 45/45 PASS**）
- ⏳ T1.3 寫 DB view `worker_unified_v` SELECT 含轉換邏輯（PostgreSQL view）—— **blocker：先決策 capacity / rate_range / portfolio 是否加 Step 3 input field**
- ⏳ T1.4 改 `worker-ai-interview/index.ts` 結束時、加 mapping pre-compute 寫進 worker_applications.unified_card
- ⏳ T1.5 改 前端 Step 4 抓 `unified_card` 而不是 hardcoded demo（fallback: demo if no unified_card）—— **blocker：Tier B / B+ 視覺 hierarchy 需女巫 Gate 2 補設計**

**Files affected**：
- `supabase/functions/_shared/worker-schema.ts`（new）
- `supabase/functions/worker-ai-interview/index.ts`（minor update · 加 mapping）
- `supabase/migrations/<timestamp>_worker_unified.sql`（new · view + column）
- `components/app2.jsx` Step4（minor · 抓 unified_card）

**Effort**：**M** · 城堡實跑 6-10 hr · 實際時程 1 週

**DoD**：
- Worker AI 對談完成 → ai_proof + unified_card 都寫進 DB
- 前端 Step 4 抓 unified_card（fallback to demo if empty）
- mapping function 有 unit test

---

### Task P0-2 · Step 4 接 Supabase 真實 worker pool

**Goal**：Step 4 顯示的 worker 從 hardcoded demo 換成 Supabase 真實已通過的 worker。

**前置依賴**：Task P0-1（unified_card column 已建）。

**Tasks**：
- T2.1 加 `worker_applications.status` enum：'pending' / 'approved' / 'rejected' / 'archived'
- T2.2 加 `worker_applications.admin_notes` text
- T2.3 RLS policy：anon role 可 SELECT `status = 'approved'` 且 `unified_card IS NOT NULL` 的 worker（only 公開欄位）
- T2.4 前端 Step 4：
  - useEffect 監聽 state.vertical
  - Supabase query：SELECT unified_card FROM worker_applications WHERE status='approved' AND verticals @> ARRAY[state.vertical]
  - 結果 < 3 → fallback to `getDemoForVertical(state.vertical).workers`
  - 結果 ≥ 3 → 用 real worker pool
  - UI 加標籤「real pool」vs「sample」
- T2.5 Admin 端最少 spec（暫定 Edward 用 Supabase Studio 手動 set status = 'approved'）

**Files affected**：
- `supabase/migrations/<timestamp>_worker_status.sql`（new）
- `components/app2.jsx` Step4（major update · supabase query + loading state）
- `components/supabase.js`（加 `bpWorkers.queryByVertical(verticalId)` helper）

**Effort**：**M-L** · 城堡實跑 10-16 hr · 實際時程 1-2 週

**DoD**：
- Step 4 抓 Supabase approved worker
- Fallback 機制 OK（worker < 3 時用 demo）
- Edward 在 Supabase Studio 可手動 approve worker（暫過渡 · Q3 Sprint Task 5 做 Admin UI 後升級）

---

### Task P1-3 · 真實 scoring 演算法 v0.1

**Goal**：寫第一版真實配對演算法、跑出 worker score + breakdown。

**演算法 spec（v0.1 簡化版）**：

```typescript
function calculateMatchScore(client: ClientIntake, worker: UnifiedWorker): MatchResult {
  // 5 維加權（共 100 分）
  const tier_match = scoreTierMatch(client.requiredTier, worker.tier);  // 0-25
  const capacity_match = scoreCapacity(worker.capacity, client.timeline);  // 0-20
  const domain_match = scoreDomainMatch(client.vertical, worker.verticals, client.tasks);  // 0-30
  const L_score_bonus = (worker.L_score / 10) * 15;  // 0-15
  const mercy_boost = (worker.last_active_days > 90) ? 10 : 0;  // 0-10 · 反馬太

  const total = tier_match + capacity_match + domain_match + L_score_bonus + mercy_boost;

  return {
    score: Math.round(total),
    breakdown: { tier_match, capacity_match, domain_match, L_score_bonus, mercy_boost },
  };
}

function scoreTierMatch(required: Tier, actual: Tier): number {
  // exact: 25 · adjacent: 18 · 2-step: 10 · over-qualified bonus: +3
  const tierLevel = { B: 1, A: 2, 'A+': 3, S: 4 };
  const diff = tierLevel[actual] - tierLevel[required];
  if (diff === 0) return 25;
  if (diff === 1) return 25;  // over-qualified、無折扣
  if (diff === -1) return 18; // 低一階、稍微折扣
  if (diff === 2) return 22;  // 高 2 階、可能 overkill
  return 10;
}

function scoreCapacity(capacity: number, timeline: 'rush' | 'normal' | 'flexible'): number {
  // capacity = 同時可接案數（>0）
  if (capacity === 0) return 0;
  if (timeline === 'rush') return capacity >= 2 ? 20 : 10;  // 急件需 capacity ≥ 2
  if (timeline === 'flexible') return capacity >= 1 ? 20 : 0;
  return capacity >= 1 ? 18 : 8;  // normal
}

function scoreDomainMatch(vertical: string, workerVerticals: string[], tasks: Task[]): number {
  // primary vertical match: 20 分
  const primary = workerVerticals.includes(vertical) ? 20 : 0;

  // adjacent vertical match: +5 分（依 VERTICAL_ADJACENCY map · 如 dtc ↔ design ↔ video）
  const adjacent = workerVerticals.some(v => isAdjacent(v, vertical)) ? 5 : 0;

  // task-level skill match: 0-5 分（依 worker.skill_matrix 對應 task 類型）
  const taskMatch = calculateTaskMatch(tasks, worker.skill_matrix);

  return primary + adjacent + taskMatch;  // max 30
}
```

**Tasks**：
- T3.1 寫 `supabase/functions/match-workers/index.ts` Edge Function
- T3.2 寫 unit test 覆蓋 5 維 score function
- T3.3 加 `VERTICAL_ADJACENCY` map（哪些 vertical 相鄰、可加 5 分）
- T3.4 client intake submit 後、自動觸發 match-workers Edge Function、把 Top 5 結果寫進 `client_intakes.match_result` column
- T3.5 前端 Step 4 抓 match_result（如有）取代 demo data

**Files affected**：
- `supabase/functions/match-workers/index.ts`（new · ~200 行）
- `supabase/functions/_shared/match-algorithm.ts`（new · 純函式邏輯）
- `supabase/functions/_shared/vertical-adjacency.ts`（new · adjacency map）
- `supabase/migrations/<timestamp>_match_result.sql`（加 match_result column）
- 改 `notify-lead-slack/index.ts` 觸發 match-workers

**Effort**：**L** · 城堡實跑 16-24 hr · 實際時程 2-3 週

**DoD**：
- 真實 score / breakdown 計算
- Edge Function 有 logging + error handling
- 5 個 unit test 覆蓋核心 score function
- Client submit 後、Slack 通知含 Top 5 worker + 真實 score

---

### Task P1-4 · EDWARD_ADVISOR_PROMPT 升級含 worker 推薦

**Goal**：你後台收 Slack 通知時、AI 顧問順便給你「建議派 @X / @Y / @Z + 一句 why」。

**Tasks**：
- T4.1 改 `notify-lead-slack/index.ts` 收 client_intakes 後、額外 query `worker_applications WHERE status='approved'`
- T4.2 把 Top 5 worker（用 P1-3 match-workers 結果 · 或暫過渡用簡單 vertical match）塞進 EDWARD_ADVISOR_PROMPT context
- T4.3 升級 prompt：加新指令「同時推薦 3 位最匹配 worker、附 1 句 why each」
- T4.4 Slack message render 含 worker 候選 list

**Files affected**：
- `supabase/functions/notify-lead-slack/index.ts`（major · line 814-869 prompt 擴充）

**Effort**：**S** · 城堡實跑 4-8 hr · 實際時程 1 週

**DoD**：
- 你收 Slack 通知含 AI 推薦 3 位 worker
- 每位 worker 一句 why
- 可順手點 worker handle 看 profile（待 Task 5 Admin UI ship 才完整）

---

## Dependency Map

```
P2-5 hot-fix (✅ done)
        │
        ▼
P0-1 Worker schema  ──────────┐
        │                       │
        ▼                       ▼
P0-2 Real worker pool      P1-4 EDWARD_ADVISOR_PROMPT 升級
        │                       │
        ▼                       ▼
P1-3 真實 scoring 演算法 ─────┘
        │
        ▼
Q3 Sprint Task 5 · Admin Matching UI（一起 ship 完整體驗）
```

---

## Total Timeline 估計

| Phase | Task | 工時（城堡實跑）| 實際時程 |
|---|---|---|---|
| Week 1 (5/19-5/25) | P0-1 worker schema | 6-10 hr | - |
| Week 2 (5/26-6/1) | P0-2 real worker pool | 10-16 hr | - |
| Week 3 (6/2-6/8) | P1-4 EDWARD_ADVISOR_PROMPT 升級 | 4-8 hr | - |
| Week 4-5 (6/9-6/22) | P1-3 真實 scoring 演算法 v0.1 | 16-24 hr | - |
| Week 6 (6/23-6/29) | Q3 Sprint Task 5 Admin UI（整合）| 10-15 hr | - |

**Total**：~46-73 hr 城堡實跑（資深 PM + 工程師 5-10 day）

---

## Out of Scope（不在 v0.1 內）

- Worker side rating（讓 worker 評 client、Q4 做）
- Multi-language matching（英文 brief、Q4 做）
- ML-based matching（用歷史成案數據訓練模型、需累積 50+ case 後 · Q1 2027 評估）
- 自動 escrow（Q3 Sprint Task 3 平行做）
- 真實 worker portfolio 上傳介面（Q3 Sprint Task 1 做）

---

## Edward 拍板項

當前 spec 預設：
- 演算法 5 維 weight（25 / 20 / 30 / 15 / 10）= 卡西法初稿、可調
- Tier 升降規則（exact / adjacent / 2-step）= 卡西法初稿、可改
- 反馬太 boost 觸發（90 天無接案 = +10）= 沿用 PRD ADR-006 偽碼

如要調 weight、改 `match-algorithm.ts` 常數 + redeploy 即可（無 schema 改動）。

---

*🔥 卡西法 audit + 🌸 蘇菲 spec · 2026-05-18 · Edward「全修、要真實演算法」拍板後立。給下個 session / 卡西法 subagent implementation 接力用。*
