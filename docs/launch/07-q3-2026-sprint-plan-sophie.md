# Q3 2026 Sprint Plan v1 · Trust Quick Win

**作者**：🌸 蘇菲（主對話）+ 🧙 霍爾（subagent CPO verdict 整合）
**日期**：2026-05-17
**Trigger**：Edward 5/17「開始規劃與執行吧」拍板 + 霍爾 5/17 競品調研 verdict
**Status**：v1 draft · 待 Edward 拍板 A/B 默認決策

---

## 一句話精神

> **Phase 1 完成「能跑」、Q3 要 ship 的是「值得信」。AI 對談是 UX、Trust 才是護城河、行業收斂是壓 GTM 焦點。**

---

## 預設拍板（Edward 默認接受、可隨時 reverse）

### A · 行業收斂方向

**默認**：⭐ 收斂「中小品牌主的 AI workflow 顧問交付」
- 對應 Edward 既有人脈
- 客單價中段 NT$ 5-15 萬
- 跟 Awesomic（只做設計）/ OpenAI Jobs Platform（做求職不做交付）都不衝
- 跟 Mercor / Toptal（程式 + 高單價）也不直接撞

**Reverse 條件**：若 Edward 認為應動 (B) 程式 / 工程類 AI agent build 或 (C) 維持 broad、Q3 第 1 週內可調整 landing 主敘事 + BD 對象。

### B · Q3 啟動順序

**默認**：⭐ Trust 三件先打包（Case Study + Client 把關 + 手動 Escrow）
- Phase 2a worker dashboard 寫了 Case Study 上傳介面 = 一石二鳥、不必拆兩波
- Trust 三件 Q3 全 ship = 跟 5/14 launch roadmap 第 W4 簽下首案剛好對齊
- 首案就有 escrow + case study 框架可用、不是事後補

**Reverse 條件**：若 Edward 要先動 send-decision-email（Slack 接 button trigger 7 套 email）、可平行（不互相 block）。

---

## 6 件 Q3 Task · 完整 Spec

每件含 Goal / AC / Tasks / Files / Dependencies / Effort / DoD。

---

### Task 1 · Worker Dashboard + Case Study 上傳介面

**Goal**：把 Phase 2a worker dashboard 真實版做出來、同時內建 Case Study 上傳能力。

**AC（Acceptance Criteria）**：
1. Worker 登入後看到自己的 dashboard（取代當前 demo console）
2. Dashboard 含 4 個 section：個人能力卡 / Case Study / 接案紀錄 / Tier 進度
3. Case Study 上傳介面：4 欄位（問題 / 解法 / 數據結果 / 過程截圖）+ Supabase Storage 存圖
4. 每個 Case Study 有公開 URL：`/worker/<slug>/case/<case-id>`
5. Worker 可選擇 Case Study 是否「公開展示」或「僅 BeyondPath 內部看」
6. Client 可在 worker profile 公開頁看到該 worker 的所有 public Case Study
7. Mobile responsive、跟其他頁面風格一致

**Tasks**：
- T1.1 設計 Supabase schema：`worker_case_studies` 表（id / worker_id / title / problem / solution / metrics / images / is_public / created_at）
- T1.2 設計 Supabase Storage bucket：`case-study-images`（RLS 設定 + public read）
- T1.3 改 `worker.jsx` 替換 demo console、加 4 section dashboard
- T1.4 新增 `components/case-study-upload.jsx` 上傳 form
- T1.5 新增 `case.html?worker=<slug>&id=<case-id>` 公開展示頁
- T1.6 改 worker profile 公開頁加 Case Study 列表 section
- T1.7 Mobile responsive 適配
- T1.8 Chrome MCP e2e test：上傳 → 公開 → client side 看見

**Files Affected**：
- `components/worker.jsx`（major refactor）
- `components/case-study-upload.jsx`（new）
- `case.html`（new）
- `worker.html` or `profile.html`（new public worker profile）
- `supabase/migrations/<timestamp>_case_studies.sql`（new schema）
- `components/styles.css`（minor）

**Dependencies**：無

**Effort**：**M-L** · 城堡實跑估 6-10 hr（cwd 大量 jsx refactor + supabase schema + e2e test）· 實際時程 1-2 週

**DoD**：
- ✅ Worker 真實 dashboard live、demo console deprecated
- ✅ 至少 1 個 Case Study 上傳完成 + 公開 URL 可訪問
- ✅ Client 在 worker profile 公開頁可看到 Case Study
- ✅ Mobile 6 page broken=0
- ✅ commit + push + prod deploy verified

---

### Task 2 · Client Side Vetting（intake 加把關）

**Goal**：Client intake 流程加入信任把關機制、解 worker 對「奧客 / 賴帳 / 詐騙」恐懼。

**AC**：
1. Client intake step 0 加「組織類型」欄位（個人 / 工作室 / 中小企業 / 大企業 / 其他）
2. Step 1 加「過往是否曾在 BeyondPath 完成過案件」欄位（首次 / 已完成 N 案）
3. 第一次合作的 client、submit 流程加「第一次合作要 50% 預付」說明 + 同意 checkbox
4. Slack 通知 lead 時 highlight：「首次 client · 需 50% 預付」or「老 client · NPS X.X」
5. Worker 在收到配對通知時、能看到 client side 信任分數標籤（首次 / 已完成 / 信用優）

**Tasks**：
- T2.1 改 `app2.jsx` ClientIntakeApp step 0 加「組織類型」欄位
- T2.2 改 step 1 加「過往合作紀錄」自動偵測（依 email 比對 client_intakes 表）
- T2.3 改 submit modal 加「首次合作需 50% 預付」說明 + checkbox（首次必勾）
- T2.4 改 `notify-lead-slack/index.ts` 加 client 信任分數段
- T2.5 改 decision email template（client × 4）加「下一步：50% 預付」說明

**Files Affected**：
- `components/app2.jsx`（minor）
- `supabase/functions/notify-lead-slack/index.ts`（minor）
- `supabase/migrations/<timestamp>_client_trust.sql`（新欄位 client_intakes.org_type / first_time / prepay_agreed）

**Dependencies**：無

**Effort**：**S** · 城堡實跑估 3-5 hr · 實際時程 1 週

**DoD**：
- ✅ Client intake 流程含 3 個新欄位、submit 流程含 prepay checkbox
- ✅ Slack 通知含 client 信任分數
- ✅ Decision email 含 prepay 說明
- ✅ Chrome MCP e2e test pass

---

### Task 3 · 手動 Escrow v1（綠界 + Edward 人工裁）

**Goal**：把 5/15 ship 的 3-tier 爭議 playbook 從文檔升成可執行的手動 escrow 流程。

**AC**：
1. 試做案啟動時、client 透過綠界（ECPay）付 100% 案款進入 BeyondPath 帳戶
2. Milestone 1 完成（worker 交付 + client 驗收 OK）→ Edward 觸發釋款 50% 給 worker
3. Milestone 2 完成（最終交付 + client 驗收 OK）→ Edward 觸發釋款 50% 給 worker
4. 任一 milestone client 拒收 → 啟動 3-tier 爭議 playbook：
   - Tier 1：worker / client 自行協商（3 天）
   - Tier 2：Edward 介入仲裁（按 docs/playbooks/dispute-escalation.md）
   - Tier 3：律師 / 司法仲裁
5. 所有金流紀錄存進 Supabase（`escrow_transactions` 表）
6. Client + Worker 都有 dashboard 看到「案款狀態 / 已釋款多少 / 剩餘多少」

**Tasks**：
- T3.1 設計 Supabase schema：`escrow_transactions` 表
- T3.2 開綠界商家帳戶（Edward 親動、需公司登記）
- T3.3 寫 escrow 文件範本（合約 / 客戶同意書 / 退款條件）`docs/templates/escrow-agreement-v1.md`
- T3.4 寫 Edward 操作 SOP：`docs/playbooks/escrow-manual-sop.md`
- T3.5 改 client dashboard / worker dashboard 加「案款狀態」section
- T3.6 改 decision email 加 escrow 條款

**Files Affected**：
- `supabase/migrations/<timestamp>_escrow.sql`
- `docs/templates/escrow-agreement-v1.md`（new）
- `docs/playbooks/escrow-manual-sop.md`（new）
- `components/worker.jsx`（minor、加案款 section）
- `components/app2.jsx`（minor、client 端同上）
- `supabase/functions/notify-lead-slack/index.ts`（minor、escrow 條款）

**Dependencies**：
- 綠界商家帳戶（Edward 親動、可能要法人 / 商業登記）
- 法務 sign-off 合約範本

**Effort**：**S（spec + UI）+ Edward 親動 M（綠界開戶）** · 城堡實跑估 4-6 hr · Edward 親動 3-5 天（綠界審核 + 法務）

**DoD**：
- ✅ 綠界商家帳戶開通
- ✅ Escrow 合約範本 sign-off
- ✅ Client + Worker dashboard 顯示案款狀態
- ✅ 至少 1 個首案啟動 escrow 流程驗證

**注意**：這條 Edward 親動部分（綠界開戶 + 法務）= 不可逆 / 涉金錢 / 涉法律。Tier D 拍板。

---

### Task 4 · Send-Decision-Email Edge Function（接 Slack button）

**Goal**：5/15 已寫好的 7 套 decision email template 接 Slack interactive button、Edward 一鍵觸發。

**AC**：
1. Slack notify-lead-slack 訊息加 4-7 個 button（依 worker / client 分流）
2. 點 button 觸發 send-decision-email Edge Function
3. Edge Function 根據 button 類型呼叫對應 email build function（已 ship 在 notify-lead-slack v6）
4. Resend 寄信給對應 lead
5. Slack 訊息 update 為「已寄出 [email type]」

**Tasks**：
- T4.1 新增 `supabase/functions/send-decision-email/index.ts`（Edge Function）
- T4.2 改 `notify-lead-slack/index.ts` 加 interactive button block
- T4.3 改 `notify-lead-slack/index.ts` 處理 Slack interactive callback
- T4.4 設定 Supabase Edge Function permissions + Slack signing secret
- T4.5 Chrome MCP test：Slack click → email 寄出

**Files Affected**：
- `supabase/functions/send-decision-email/index.ts`（new）
- `supabase/functions/notify-lead-slack/index.ts`（major update）

**Dependencies**：Slack signing secret（已有）

**Effort**：**S-M** · 城堡實跑估 4-6 hr · 實際時程 1 週

**DoD**：
- ✅ Slack click → email 在 30s 內寄出
- ✅ 4-7 個 button 對應 7 套 template
- ✅ Slack 訊息 update 顯示「已寄出」
- ✅ Edward 親 test pass

---

### Task 5 · 後台配對介面（Matching UI Admin 端）

**Goal**：給 Edward 一個快速看當前所有 worker / client lead、做配對決策的後台介面。

**AC**：
1. `/admin?role=admin&pass=xxx` 或 Vercel password protection 的後台頁
2. 左欄：所有 client lead（含信任分數、需求摘要、預算）
3. 右欄：所有 worker（含 Tier、可用性、報價區間、最近案況）
4. 中欄：拖拉配對 or 點擊「推薦這個 worker 給這個 client」
5. 配對後自動觸發 Slack 通知 + 7 套 decision email button

**Tasks**：
- T5.1 新增 `admin.html`（簡單 password protection 或 Vercel password）
- T5.2 新增 `components/admin-matching.jsx`
- T5.3 串接 Supabase RLS（admin role 可讀全部 worker / client）
- T5.4 加配對動作 + Slack 通知 trigger
- T5.5 簡單 UI 配對結果展示

**Files Affected**：
- `admin.html`（new）
- `components/admin-matching.jsx`（new）
- `supabase/migrations/<timestamp>_admin_rls.sql`
- `supabase/functions/trigger-matching-notification/index.ts`（new）

**Dependencies**：Task 4（send-decision-email Edge Function）

**Effort**：**M** · 城堡實跑估 5-7 hr · 實際時程 1-1.5 週

**DoD**：
- ✅ Edward 登入 admin 頁、看到所有 worker / client lead
- ✅ 點配對 → Slack 通知出來
- ✅ 點 email button → 寄信

---

### Task 6 · AI 對談 → Worker Brief Card 自動產

**Goal**：把當前 ai_proof JSON（user 看不懂）轉成 client 看得懂的 markdown「Brief Card」。

**AC**：
1. Worker 完成 AI 對談、ai_proof JSON 存進 Supabase 後、Claude 二次 prompt 自動產 markdown Brief Card
2. Brief Card 5 段：背景 / 能力 / 風格 / 報價區間 / 適合接什麼
3. Card 存進 `worker_brief_cards` 表
4. Worker profile 公開頁顯示 Brief Card
5. Client 在配對通知中看到 Brief Card

**Tasks**：
- T6.1 設計 Supabase schema：`worker_brief_cards` 表
- T6.2 改 `worker-ai-interview/index.ts` 加二次 prompt 產 Brief Card
- T6.3 改 worker profile 公開頁顯示 Brief Card
- T6.4 改 Slack 配對通知含 Brief Card snippet

**Files Affected**：
- `supabase/functions/worker-ai-interview/index.ts`（minor）
- `supabase/migrations/<timestamp>_brief_cards.sql`
- `worker.html` or `profile.html`

**Dependencies**：Task 1（worker profile 公開頁）

**Effort**：**S** · 城堡實跑估 3-4 hr · 實際時程 3-5 天

**DoD**：
- ✅ 新申請 worker 自動產 Brief Card
- ✅ 公開頁可看
- ✅ Slack 配對通知含 snippet

---

## Sprint Timeline · 6 件交織排程

```
Week 1 (5/19-5/25)
├── Task 1 啟動（worker dashboard + Case Study）—— 主力 sprint、跨 2 週
├── Task 2 啟動（Client vetting）—— 小、1 週內完成
└── Task 3 spec done（escrow 範本 + SOP）—— Edward 同步開綠界戶

Week 2 (5/26-6/1)
├── Task 1 完成 + ship
├── Task 4 啟動（send-decision-email Edge Function）
└── Task 3 Edward 親動進度 review

Week 3 (6/2-6/8)
├── Task 4 完成 + ship
├── Task 5 啟動（admin matching UI）
└── Task 6 啟動（Brief Card）—— 等 Task 1 worker profile 完成

Week 4 (6/9-6/15)
├── Task 5 完成 + ship
├── Task 6 完成 + ship
└── Task 3 escrow 流程跑通（綠界開戶 + 法務 sign-off 完成）

Week 5-6 (6/16-6/29)
├── 6 件全 ship 完整 e2e test
├── 首案啟動（W4 簽下首案 = 5/14 launch roadmap 對齊）
└── Buffer + 修 bug
```

**雙軌工時**：
- 預估工時（資深 PM + 工程師團隊）：5-7 週
- 移動城堡實跑：~40-60 hr wall clock（6 件總合 + 修 bug + e2e test）
- 倍率：~5-8×（implementation-heavy、不像 research 那麼高倍率）

---

## Quick Win 順序（建議優先 ship 順序）

1. **Task 2（Client vetting）** —— 1 週、無 dependency、立刻可動
2. **Task 1（Worker dashboard + Case Study）** —— 2 週、最大價值
3. **Task 6（Brief Card）** —— 3-5 天、跟 Task 1 同 ship
4. **Task 4（send-decision-email）** —— 1 週、Task 5 依賴
5. **Task 5（admin matching）** —— 1-1.5 週
6. **Task 3（手動 escrow）** —— Edward 親動 dependency 多、平行跑

---

## Risk + Mitigation

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| 綠界開戶慢（Task 3）| M | H | Edward 即動申請、Task 3 implementation 不被 block |
| 法務 sign-off escrow 合約慢（Task 3）| M | H | 早期用簡化版（雙方 LOA + Edward 親寫合約）、律師 review 後升級 |
| Worker dashboard 重構影響現有 demo（Task 1）| M | M | Feature flag：新 dashboard 跟 demo console 並存、確認 OK 再切 |
| Niche 收斂後 BD 對象池縮小（A 拍板影響）| H | M | Q3 先用 broad、Q3 末根據首案 result 才正式收斂 |
| Case Study 上傳後 worker 隱私顧慮 | M | M | 預設「BeyondPath 內部看」、worker 主動勾才公開 |

---

## Dependency Map

```
Task 2 (Client vet) ───┐
                        ├──→ 首案啟動條件
Task 3 (Escrow) ───────┤
                        │
Task 1 (Dashboard) ────┤
                        ├──→ Worker profile 公開頁
Task 6 (Brief Card) ───┘     ↓
                              └──→ Client side 信任完整
Task 4 (Email) ────────┐
                        ├──→ Edward 1-click 配對 + 通知
Task 5 (Admin UI) ─────┘
```

---

## Definition of Sprint Done

- ✅ 6 件 task 全 ship + e2e test pass
- ✅ Prod live、commit + push 完成、Vercel CLI deploy verified
- ✅ Mobile 6+ page broken=0
- ✅ 首案啟動（W4 = 5/14 launch roadmap 對齊）
- ✅ Edward 親 test 全流程 OK
- ✅ Q3 末 retrospective + Q4 plan kickoff

---

## Hand-off · 下個 Session 蘇菲（or 工程師）進來該做的

**第一步**：Read 本檔（Q3 Sprint Plan v1）+ 5/14 launch roadmap + 5/16 三路調研 + 5/17 霍爾競品 verdict

**第二步**：確認 Edward 對 A/B 拍板是接受默認 or reverse、據此決定 sprint 主軸

**第三步**：按 Quick Win 順序動：先 Task 2（最快）→ Task 1（最大價值）→ Task 6（quick + 補完）→ Task 4 → Task 5 → Task 3（平行）

**第四步**：每件 ship 後在 docs/handoff-<date>.md 留交接、不斷接力

---

## 跟既有規劃對照

| 5/14 launch roadmap | 本 sprint plan 更新 |
|---|---|
| Phase 2a Worker dashboard | **Task 1 升級**：加 Case Study 上傳介面 + 公開頁 |
| Phase 2b Matching UI | **Task 5 補完**：admin 端 + 配對動作 + 通知 trigger |
| Phase 2c send-decision-email | **Task 4 補完**：Edge Function + Slack button + Resend 寄信 |
| （新）Trust 護城河 | **Task 2 + Task 3 新增**：Client vet + 手動 Escrow |
| （新）AI 工具 UX | **Task 6 新增**：Brief Card 自動產 |

---

## Sources

- 5/16 三路調研報告（howl + turnip + sophie subagent）—— 此 session 內
- 5/17 霍爾競品調研 + 賦能功能 10 候選—— 此 session 內
- 5/14 launch roadmap（[docs/launch/04-launch-roadmap-howl.md](04-launch-roadmap-howl.md)）
- 5/15 商業模式 POC v1（[docs/business-model-poc-v1.md](../business-model-poc-v1.md)）
- 5/15 PM 信任合規 brief（[docs/launch/02-trust-audit-suliman.md](02-trust-audit-suliman.md)）

---

*🌸 蘇菲 · Q3 Sprint Plan v1 · 2026-05-17 · Edward「開始規劃與執行吧」拍板後寫*
