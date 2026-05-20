# Q3 2026 Sprint Plan v2 · 接案閉環

**日期**：2026-05-21
**作者**：🌸 蘇菲
**對應**：5/19 handoff §5 動作 E + 霍爾 5/20 CPO Phase 1-3 規劃
**Status**：v2 草稿 · 取代 [07-q3-2026-sprint-plan-sophie.md] v1

---

## 0. v1 → v2 差別

| 維度 | v1（5/17）| v2（5/21）|
|---|---|---|
| 框架 | 6 件 Q3 Task（self-contained）| 對齊霍爾 Phase 1-3 · 從 supply / demand / delivery 三軸接 |
| 北極星 | 6 件 task ship + 首案啟動 | **3 個真實交付閉環**（brief → scope → shortlist → SOW → delivery → acceptance → NPS）|
| 範圍 | 偏 admin / worker UI 強化 | 接案閉環全鏈架構 + 雙邊 NPS / Tier 升降 |
| 時程 | 6 週 | 12 週（霍爾 Phase 1-3 對齊）|

---

## 1. 已上線（v1 → v2 之間 5/17-5/21 ship 紀錄）

### Trust / 信任地基（霍爾 Phase 0 對齊）

- ✅ 5/18 vertical-aware demo（15 vertical full coverage · `21076db`）
- ✅ 5/19 配對閉環整套上線（client brief → AI 拆解 → 5 維演算法 → AI 顧問推薦 → 後台寄信 → worker accept → banner）
- ✅ 5/19 Admin Console v0.1（`a002ec6`）
- ✅ 5/19 Client Vetting Step 01（`1118d45`）
- ✅ 5/19 Worker Decision Banner（`2804600`）
- ✅ 5/20 audit-wave1 文案 + 視覺修補 4 件（`78845f5`）
- ✅ 5/20 audit-wave2 後端 7 件（worker-ack-email / column REVOKE / GDPR purge / `f372b7c`）
- ✅ 5/20 email-template fix（`f023725`）
- ✅ 5/20 mobile audit Wave A（8 處 a11y · `13fb40f`）
- ✅ 5/21 Phase 0 信任地基 4 件（unified_card handle bug / approve guard / 認證文案統一 / 能力矩陣斷裂修補 · `ea5b53f`）

### 留下輪（已 spec / 未 ship）

- ⏳ 5/21 Phase 0 #3 警示燈（`docs/launch/12-audit-flags-spec.md` ready · 派卡西法 background）
- ⏳ 5/19 動作 B · 工作者後台 + 作品集上傳介面 v0.1（依賴接案閉環 SOW · v2 後段）
- ⏳ 5/19 動作 D · 5 維權重編輯介面（本 v2 ship 同期）

---

## 2. v2 核心：接案閉環架構

接案閉環 = 從 admin 通過 worker 開始、到第一個案結案 + NPS + Tier 升降為止的全鏈。

### 2.1 7 階段 state machine

```
[STATE]              [WHO 動]         [產出]
1. matched           admin            worker_decisions: matched=true · matched_at
2. worker_accepted   worker (email)   worker_decisions: decision=accept · decided_at
3. sow_signed        Edward (人工)    project: sow_url · started_at
4. milestone_active  worker           project_milestones: status=in_progress
5. milestone_done    worker → client  project_milestones: status=delivered · client_ack
6. accepted          client           project: status=accepted · accepted_at
7. nps_collected     雙邊             project_nps: client_nps + worker_nps + comments
```

### 2.2 新增 DB 結構

3 個新 table + 1 個 worker_unified_v 增欄位：

#### `projects`（接案閉環主檔）

```sql
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_intake_id uuid REFERENCES client_intakes(id),
  worker_application_id uuid REFERENCES worker_applications(id),
  worker_decision_id uuid REFERENCES worker_decisions(id),  -- 從哪個 decision 起源
  status text NOT NULL DEFAULT 'matched',                   -- matched / sow_signed / in_progress / accepted / disputed / cancelled
  sow_url text,                                              -- 合約文件連結（人工上傳）
  budget_nt integer,                                         -- 案款 NT$
  matched_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  accepted_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX projects_status_idx ON projects(status);
CREATE INDEX projects_worker_idx ON projects(worker_application_id);
```

#### `project_milestones`

```sql
CREATE TABLE project_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  seq integer NOT NULL,                          -- 1, 2, 3...
  title text NOT NULL,
  scope text,
  acceptance_criteria text,
  budget_nt integer,                              -- 此 milestone 押金 / 分潤
  status text NOT NULL DEFAULT 'pending',         -- pending / in_progress / delivered / accepted / disputed
  delivered_at timestamptz,
  delivered_url text,                             -- worker 交付物連結
  client_ack_at timestamptz,                      -- client 驗收時間
  client_ack_note text,                           -- client 驗收備註
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX milestones_project_idx ON project_milestones(project_id);
CREATE INDEX milestones_status_idx ON project_milestones(status);
```

#### `project_nps`

```sql
CREATE TABLE project_nps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  client_nps integer CHECK (client_nps BETWEEN -100 AND 100),
  client_comment text,
  client_submitted_at timestamptz,
  worker_nps integer CHECK (worker_nps BETWEEN -100 AND 100),
  worker_comment text,
  worker_submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX nps_project_uniq ON project_nps(project_id);
```

#### `worker_applications` 增欄位

```sql
ALTER TABLE worker_applications
  ADD COLUMN tier_current text,           -- 當前 Tier（首案後可升降、初值 = tier_suggestion）
  ADD COLUMN nps_avg numeric(5,2),         -- 平均 client NPS（含計算 trigger）
  ADD COLUMN cases_completed integer DEFAULT 0,  -- 已完成案件數
  ADD COLUMN cases_disputed integer DEFAULT 0;   -- 有糾紛案件數
```

---

## 3. Tier 升降規則 v1

首案後啟動、由 cron / trigger 算：

| Tier | 條件 |
|---|---|
| B（起步）| 預設 · 首次通過 |
| B+（進階）| cases_completed ≥ 2 AND nps_avg ≥ 30 AND 0 dispute |
| A（資深）| cases_completed ≥ 5 AND nps_avg ≥ 50 AND ≤ 1 dispute |
| A+（大師）| cases_completed ≥ 10 AND nps_avg ≥ 70 AND 0 dispute（近 5 案）|
| 降級 | nps_avg < 0 持續 2 案 OR 1 案 dispute = 降一級 |

Edge Function `recompute-worker-tier`（cron 每天跑、or worker_applications.cases_completed 變動時 trigger）：

```typescript
async function recomputeTier(workerId) {
  const completed = await db.count('projects', { worker_application_id: workerId, status: 'accepted' });
  const npsAvg = await db.avg('project_nps.client_nps', { worker_application_id: workerId });
  const disputed = await db.count('projects', { worker_application_id: workerId, status: 'disputed' });
  // 規則 ...
  await db.update('worker_applications', { id: workerId }, { tier_current: newTier, nps_avg: npsAvg, cases_completed: completed, cases_disputed: disputed });
}
```

---

## 4. v2 Sprint 6 件 Task

對齊霍爾 Phase 1-3 + 5/19 動作 B / D / E：

### Task 7（v2 新）· 5 維權重編輯介面（5/19 動作 D）

**Owner**: 蘇菲 · **工時**: 2-3 hr · **依賴**: 無
- admin.jsx 加 SettingsTab · 5 維 slider（tier 25 / capacity 20 / domain 30 / L_score 15 / mercy 10）
- localStorage 存 weights · runMatch 時當 query param 傳
- match-workers Edge Function 接 `weights` override（沒給用 default）
- 立刻可動

### Task 8 · 接案閉環 DB schema + state machine

**Owner**: 卡西法 · **工時**: 3-4 hr · **依賴**: Task 7
- 寫 migration（4 個 table 增改）
- supabase.js 加 `bpProjects` namespace（createFromDecision / updateStatus / addMilestone / submitNps）
- 不寫 UI · 為 Task 9-12 鋪地基

### Task 9 · Admin Console projects tab（5/19 動作 B 一部分）

**Owner**: 蘇菲 · **工時**: 3-4 hr · **依賴**: Task 8
- admin.jsx 加 ProjectsTab
- worker accept 後自動 create project · admin 看到 pending sow_signed 狀態
- 手動上傳 sow_url + budget · 切 in_progress
- Milestones grid · admin 看 worker 交付 + client ack 狀態

### Task 10 · Worker 後台 v1（Worker Dashboard · 取代 demo console · Q3 Task 1 + 5/19 動作 B）

**Owner**: 蘇菲 + 卡西法 · **工時**: 4-6 hr · **依賴**: Task 8 + 9
- worker.jsx Console 改成讀真實 projects（自己被 match 到的案）
- 看 active milestones · 交付 deliverable_url + note
- 作品集 / Case Study 自動產（accepted milestone → Case Study draft）
- 公開 profile page（worker_unified_v + completed cases）

### Task 11 · Client 後台 v1（驗收 + NPS）

**Owner**: 蘇菲 · **工時**: 3-4 hr · **依賴**: Task 8 + 9
- 新檔 `client.html` · client 登入後看自己 active projects
- 看 worker 交付 deliverable · 點 ✓ 驗收 / ✗ 退回
- accepted 後跳 NPS（0-10 score + 一句 comment）
- 60 day fallback：項目逾期未驗收、平台主動提醒（per landing Step 09 條款）

### Task 12 · Tier 升降演算法（霍爾 Phase 3）

**Owner**: 卡西法 · **工時**: 2-3 hr · **依賴**: Task 8 + 10 + 11
- Edge Function `recompute-worker-tier`
- pg_cron 每天 03:00 跑
- worker_applications.tier_current 更新
- Slack 通知 Edward「W01 升 B → B+ · 2 案 NPS 65」

### v2 Total 工時估

`Task 7 + 8 + 9 + 10 + 11 + 12 = 17-24 hr 城堡實跑`
（並行：Task 7 蘇菲 / Task 8 卡西法 / Task 9 + 11 蘇菲 / Task 10 + 12 卡西法）
真實 wall-clock：3-5 個 session marathon

---

## 5. Sprint Timeline · 12 週

對齊霍爾 Phase 1-3：

```
Week 0-2 · Trust Fix Sprint（已完成 5/17-5/21）
  ✅ Phase 0 信任地基 + Wave A mobile a11y + 配對閉環

Week 2-5 · Supply Sprint（霍爾 Phase 1 · v2 Task 7-8 開動）
  - Task 7 ship · Edward 可改配對權重
  - Task 8 接案閉環 DB schema ready
  - BD：邀 10 位 worker、5 位通過 Tier B / B+
  - 至少 3 個 vertical 有可展示 portfolio

Week 4-8 · Demand Sprint（霍爾 Phase 2 · v2 Task 9-11）
  - Task 9 Admin projects tab ship
  - Task 10 Worker Dashboard v1 ship
  - Task 11 Client 後台 v1 ship
  - 客戶 pilot：10 brief · 5 qualified · 3 媒合 · 1-2 paid pilot

Week 8-12 · Delivery Sprint（霍爾 Phase 3 · v2 Task 12）
  - Task 12 Tier 升降演算法上線
  - 3 個真實交付閉環跑完（北極星！）
  - 雙邊 NPS 收集 · 2 個 case study 公開
  - Q4 plan kickoff
```

---

## 6. 跟 v1 對照

v1 6 件 Task ship 狀況：

| v1 Task | v2 對應 | 狀態 |
|---|---|---|
| Task 1 Worker Dashboard + Case Study | v2 Task 10 | 重新 scope · 從 demo console → 真實 projects 接 |
| Task 2 Client Side Vetting | 5/19 已 ship `1118d45` | ✅ done |
| Task 3 手動 Escrow | 後續 sprint（霍爾規劃也建議 dispute 證明前不做）| 延 |
| Task 4 Send-Decision-Email | 5/19 已 ship `141907f` | ✅ done |
| Task 5 後台配對介面 | 5/19 已 ship `a002ec6`（Admin Console v0.1）| ✅ done |
| Task 6 AI 對談 → Brief Card | 5/19 已 ship `bb8437f` + Phase 0 #2 修補 | ✅ done |

v2 新加 Task 7-12 = 把缺的接案閉環跑通。

---

## 7. Definition of v2 Sprint Done

- ✅ 6 件 Task（7-12）全 ship + e2e PASS
- ✅ 3 個真實交付閉環跑完（北極星！）
- ✅ 至少 5 位 worker 通過 + 3 個 vertical portfolio
- ✅ 至少 1-2 個 paid pilot（NT$50K-150K）
- ✅ 雙邊 NPS 平均 ≥ 50
- ✅ 0 個 dispute（或 1 個並安全處理）
- ✅ 2 個 Case Study 公開

---

## 8. Risk + Mitigation

| Risk | Mitigation |
|---|---|
| BD 招募 10 位 worker 慢 | Founder network + 朋友圈 + 不用平台流量、霍爾規劃明確 |
| Client brief 太模糊跑不下去 | Scope Review 作為 paid diagnostic · 不符不進媒合（霍爾 §5.4）|
| 接案閉環 DB 改動大、break 既有 | Task 8 卡西法 background + Migration test + 不 break worker_unified_v view |
| 12 週北極星 3 閉環太樂觀 | Founder-led 手動湊、Edward 介入頻率高 OK · 不追自動化 |
| Tier 升降規則跑出來不對 | Edge Function 跑 dry-run（不寫 DB · 只 log）跑 1 週、Edward 看了再 enable 寫入 |

---

## 9. 後續 sprint（Q4 起 · 不在 v2 範圍）

- 押金 + 金流串接（Q3 Task 3 escrow 延後）
- 訪談中 audit_flags hint（worker 即時看到自己被 flag）
- 機器學習版 audit_flags（用通過 / 拒絕歷史 train）
- 跨 vertical 一致性 audit（自稱 5+ vertical 的細審）
- 全 Open Marketplace（霍爾規劃明確：不在 12 週內做）

---

## 10. Sources

- 霍爾 5/20 CPO 規劃 `C:/Users/Administrator/Documents/Codex/2026-05-20/.../beyondpath-cpo-product-strategy-2026-05-20.md`
- 5/19 handoff `docs/handoff-2026-05-19.md` §5 動作 B / D / E
- Q3 Sprint v1 `docs/launch/07-q3-2026-sprint-plan-sophie.md`
- Phase 0 spec `docs/launch/12-audit-flags-spec.md`

---

*🌸 蘇菲 · 2026-05-21 · v2 取代 v1 · 接案閉環架構就位 · 等霍爾 Phase 1 Worker Supply 招募同步開動*
