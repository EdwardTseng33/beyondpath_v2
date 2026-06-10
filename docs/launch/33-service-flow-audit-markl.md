# 33 · 服務流程完整 e2e 盤點 · 馬魯克 QA Lead

**作者**：🌿 馬魯克（PM / QA Lead · Sonnet 4.6）
**日期**：2026-05-29
**觸發**：Edward 5/29 17:23「仔細檢查整個服務流程」+ 「發案類別按池子反推」
**範圍**：接案者申請進池 → 客戶發案 → 配對 → 邀請 → 簽約 → 履約 → 交付 → 驗收 → 評鑑 → 抽佣收款（整條鏈）
**依據**：
- `docs/deploy/2026-05-28-all-migrations.sql`（13 個 migration · 1462 行）
- `supabase/functions/`（28 個雲端函式）
- `docs/launch/08-matching-pipeline-spec-calcifer.md`（配對演算法 spec）
- `docs/launch/18-payment-flow-howl.md`（金流設計）
- `docs/launch/24-qa-integration-report.md`（5/28 QA 報告）
- `docs/launch/28-pmf-account-auth-spec.md`（帳號系統 spec · 5/29）
- `components/app2.jsx` + `components/data.jsx`（前端發案流程 + VERTICALS 定義）

---

## TL;DR · 紅燈燈號

🔴 **整條鏈還跑不通一個真實案**——有 3 個 P0 斷點尚未接好、以及 1 個根本性的「池子空 + 選項不動態」問題。

**最大 3 個斷點**：

| 排序 | 斷點 | 影響 |
|---|---|---|
| 1 | 綠界 `payment_intents` 付款成功後、**沒有自動寫入 `commission_records`** | 金流閉環沒接通——客戶付了錢但系統不知道 |
| 2 | 發案選領域是**靜態 15 個**、池子只有 3 個（agent/strategy/software）有 Edward 一人 | 客戶選到沒有 worker 的領域、配對直接出空 demo |
| 3 | Admin 後台（`admin.html`）**沒有登入閘**（doc 28 B 塊待做）| 任何人知道 URL 就能操作全平台 |

---

## 一 · 10 環節逐項盤點

### 環節 1 · 接案者申請進池

**現況：已做（後端 live · 前端前端 flow OK）**

- `worker_applications` 表已建、欄位齊：`email / display_name / ai_proof / l_score / verticals / tier_suggestion / status / unified_card / country`
- `worker-ai-interview` Edge Function 跑真實 Claude AI 對談、萃取 `ai_proof` 寫進 DB
- `worker_unified_v` view 已建（`status in ('approved','tier_b','tier_b_plus') AND unified_card IS NOT NULL`）
- `bp_workers_by_vertical` + `bp_workers_by_vertical_tw_only` helper function 已建
- Edward seed 進去了（`edwardt0303@gmail.com · status=approved · verticals=['agent','strategy','software']`）
- QA 5/28 驗過：worker journey 前端 flow PASS（AI 面試兩條路徑都通、country select 正確）

**斷點**：
- Worker apply 成功後、Admin 現在要**手動在 Supabase Studio 點 `status = 'approved'`**——沒有 admin.html 審核 UI 的審批按鈕可用（admin.jsx Pending Workers tab 有 Approve/Reject 按鈕但 admin 後台沒登入閘、還不能安全操作）

**洞 / 風險**：
- `admin.html` 無 auth gate（doc 28 B 塊待做）——任何人能按 Approve、會把隨機 worker 放進配對池
- worker apply 重複提交無 dedupe（doc 01 W6 建議加 unique partial index、未確認是否已加）

**上線前必補**：
- 🔴 **P0**：admin.html 登入閘（doc 28 Batch 1 · 卡西法做 · 半天）
- 🟡 **P1**：worker apply email unique partial index 防重複提交

---

### 環節 2 · 客戶發案（Step 01-04 選領域 → brief → AI 拆解 → 配對）

**現況：前端做了 · 後端部分做了 · 關鍵動態邏輯沒做**

- Step 01：8 個必填欄位 gate 已做（QA 5/28 PASS）
- Step 02：Confirm Expectations 頁 render PASS
- Step 03：`client-brief-parse` Edge Function 真跑 Claude AI 拆解 OK
- Step 04：配對展示頁有前端 fallback（`source: demo`）
- `client_intakes` 表 + `notify-lead-slack` Slack 通知 Edward 已接通

**斷點（Edward 特別點名）**：

**發案領域選項是靜態硬碼、不動態反映池子供給**

`components/data.jsx` 的 `VERTICALS` 陣列寫死 15 個領域：
```
dtc / design / video / web / software / system / agent / data /
b2b / research / mkt / seo / cs / localize / other
```

目前池子 `worker_unified_v` 裡只有 Edward 一人、`verticals = ['agent', 'strategy', 'software']`。

客戶選 `dtc`、`design`、`video`、`mkt`、`seo`、`cs`、`localize`、`other` 等 12 個領域——Step 4 pool query 回 0 筆、前端 fallback 進 demo 靜態資料，**顯示假的配對結果**，客戶以為有真人可配、其實沒有。

`app2.jsx` 已有 `real pool` vs `demo pool` 的 label（`poolState.source`），但：
1. demo 出現時 label 是「案例展示」、用戶不一定理解這代表「沒有真的 worker」
2. 更根本的問題：用戶根本不該在沒有 worker 的領域完成整個發案流程

**洞 / 風險**：
- 客戶選到空領域 → 走到 Step 4 → 點「送出需求」→ Edward 收到 Slack 通知 → 配對是 demo → 沒有真人可邀請 → 整條流程卡死
- 早期客戶體驗極差、信任崩塌

**上線前必補**：
- 🔴 **P0**：發案領域選項動態化（詳見第二節「特別檢查」）

---

### 環節 3 · AI 配對

**現況：Edge Function 已建 · 但 5 維演算法的「前端串接」部分仍有缺口**

- `match-workers` Edge Function 已建（`supabase/functions/match-workers/index.ts`）
- 5 維演算法（tier/capacity/domain/L_score/mercy）已在 `_shared/match-algorithm.ts` 實作
- `VERTICAL_ADJACENCY` map 已建
- `worker_unified_v` + `bp_workers_by_vertical` 可查詢真實 worker pool
- doc 08 Task P0-1（worker schema unification）的 `worker-schema.ts` 已 ship（45 assertion PASS）

**斷點**：
- doc 08 Task P0-2（Step 4 前端接 Supabase 真實 worker pool）狀態：`app2.jsx` 1019 行已有 `window.bpWorkers.queryByVertical` 呼叫，但這個 helper function 的定義需要確認是否接的是 `match-workers` Edge Function 還是直接查 PostgREST。若是直接查 `worker_unified_v` PostgREST，則**配對分數算法（5 維）沒有跑到**——等於只做 vertical filter、沒做真正的 scoring
- doc 08 Task T1.4（`worker-ai-interview` 結束後 pre-compute `unified_card`）、T1.5（前端抓 `unified_card`）狀態待確認

**洞 / 風險**：
- 若 5 維配對沒跑、顯示的「配對分數」是硬算或沒有，會對客戶造成誤解

**上線前必補**：
- 🟡 **P1**：確認 `bpWorkers.queryByVertical` 是否真的跑 `match-workers` Edge Function 的 5 維算法、還是只做 vertical filter

---

### 環節 4 · 邀請信 + 接拒（send-decision-email / worker-accept-decline）

**現況：已做**

- `send-decision-email` Edge Function 已建
- `worker-accept-decline` Edge Function 已建
- QA 5/28 報告：invitations accept → contract.html（local-only limit，需 prod 部署驗）

**斷點**：
- `send-decision-email` 沒有 admin caller check（doc 28 C 塊待做）——任何人能以平台名義發信
- `worker-accept-decline` GET 路徑問題（doc 14 P0-3 提過）：email 連結點擊用 GET、可能被爬蟲或 email preview 意外觸發 accept/decline

**洞 / 風險**：
- 任意攻擊者能狂打 `send-decision-email` 洗信箱（doc 28 C 的 Group A 待修）
- email 連結 GET 路徑的安全疑慮

**上線前必補**：
- 🔴 **P0**：`send-decision-email` 加 admin caller check（doc 28 Batch 3 · 卡西法 + 沙利曼）
- 🟡 **P1**：`worker-accept-decline` GET → POST 加中間確認頁（doc 14 P0-3）

---

### 環節 5 · 簽約（generate-contract-pdf + contract.html + submit-signature）

**現況：已做（Phase 1 + Phase 2 都 ship）**

- `contracts` 表已建（Phase 1 + Phase 2 欄位齊）
- `generate-contract-pdf` Edge Function 已建（用 pdf-lib 生 PDF + 上傳 Storage）
- `submit-signature` Edge Function 已建（JWT verify + 照片 upload + 雙方簽署狀態更新）
- `contract.html` 簽署頁已建（QA 5/28 P1-1 修好 friendly error classifier）
- `contract-verify.html` 公開驗證頁 PASS（QA 5/28 PASS）
- `signature_attempts` 表已建（IP rate limit · 5次/15分）
- `admin.html` Contracts tab 已建（QA 5/28 PASS after P0 fix）
- SHA-256 hash + `final_certificate_url` 預留欄位已建
- `contract_snapshot` jsonb 已建（防後續改動破壞合約對應）

**斷點**：
- Beta 階段（W1-W6）：合約簽署走 Google Docs + LINE 截圖手動流程（doc 18 §1.1）——系統自動化的 contract.html 需要 prod 部署後才能完整驗
- Phase 2 `resend-contract-certificate` 函式：QA 5/28 local-only limit、需 prod 部署驗

**洞 / 風險**：
- contracts RLS 目前 admin-only（Phase 1 設計）——contract.html 簽署頁的 anon 路徑是透過 submit-signature Edge Function 的 service_role 走，這個路徑需要 prod 驗
- `admin.html` 沒有 auth gate（見環節 1 P0）

**上線前必補**：
- 🟡 **P1**：prod deploy 後跑完整 contract flow smoke（doc 08 EDWARD-DEPLOY-GUIDE 步驟 7 第 2-3 項）
- 🟡 **P1**：律師合約 review（Beta 階段 Google Docs template）——doc 00 §6 P3

---

### 環節 6 · 履約 Milestone（contract_milestones + milestone-detail.html）

**現況：已做（資料層 · 部分前端待確認）**

- `contract_milestones` 表已建（3 個 milestone · 30/30/40 · status machine 完整）
- `contract_milestones_history` audit log 已建
- `update-milestone-status` Edge Function 已建（含 dispute_count → arbitration 自動觸發）
- `get-milestone-detail` Edge Function 已建
- 里程碑 status trigger 已建（`recalc_contract_milestones_total` 自動更新 `milestones_total`）
- `milestone-detail.html` 前端頁面（需確認是否已 ship）

**斷點**：
- `milestone-detail.html` 是否已在 Vercel 上線（doc 29 deliverables-design-howl.md 有設計、但清單裡沒看到這個 HTML 檔）
- admin.html 的 milestone 操作需要 admin auth gate（同上）
- worker / client 的 milestone 操作 **現在只有 admin 路徑**（RLS admin-only）——worker 和 client 如何自己更新 milestone 狀態？（需要透過 Edge Function service_role 路徑）

**洞 / 風險**：
- Worker 更新 milestone status（如標「delivered」）的前端入口不明確——admin 一手包攬太累
- Client 退件的前端頁面（milestone-detail.html?role=client&token=...）是否 live 待確認

**上線前必補**：
- 🔴 **P0**：確認 worker / client 的 milestone 操作前端入口是否已 ship（milestone-detail.html）
- 🟡 **P1**：admin 一手包攬退件 / 批准的流程太重——至少需要 client 自己能操作驗收

---

### 環節 7 · 交付檔案（upload-deliverable + 雲端儲存 + 版本）

**現況：已做（資料層完整）**

- `milestone_deliverables` 表已建（SHA-256 · 版本管理 · 100MB 上限）
- `deliverable_external_links` 表已建（Figma / GDrive / GitHub 等外部連結）
- `deliverable_download_log` audit log 已建（GDPR 合規）
- `upload-deliverable` Edge Function 已建
- `download-deliverable` Edge Function 已建
- `add-external-link` Edge Function 已建
- Storage bucket `deliverables` 私有（Edward 手動建）

**斷點**：
- Storage bucket `deliverables` 是否已在 Supabase Studio 手動建（doc EDWARD-DEPLOY-GUIDE 步驟 2）——需 Edward 確認
- Worker 上傳交付檔案的**前端介面**是否存在（`upload-deliverable` 有函式但 worker 端的 UI 在哪？）
- `archived_at` 機制（結案後 30 天封存）目前沒有自動 cron 觸發

**洞 / 風險**：
- 若 Storage bucket 沒建、upload 就會 fail
- Worker 上傳入口不清楚——若只有 admin 能上傳，beta 階段可手動但規模不了

**上線前必補**：
- 🔴 **P0**：確認 `contracts` + `deliverables` Storage bucket 已建（Edward 步驟 2）
- 🟡 **P1**：Worker 上傳交付檔案的前端入口（至少 beta 期 Edward 用 admin 代操作也 OK，但要確認有這條路）

---

### 環節 8 · 驗收（client-acceptance + 退件 3 次仲裁 arbitration）

**現況：已做（backend 完整 · 前端待確認）**

- `client-acceptance` Edge Function 已建（含自動觸發仲裁 + NPS）
- `trigger-arbitration` Edge Function 已建
- `arbitration_cases` 表已建（5 工作日 deadline · 雙方立場 · admin 判決三選項）
- `decide-arbitration` Edge Function 已建
- `submit-arbitration-position` Edge Function 已建
- `get-arbitration-detail` Edge Function 已建
- 自動觸發：dispute_count >= 3 → `trigger-arbitration` internal call（update-milestone-status + client-acceptance 都有接）

**斷點**：
- `arbitration.html` 前端頁面——雙方提立場的介面是否已 ship？（spec 提到 `arbitration.html?case_id=X&role=Y&token=Z`）
- Admin 後台「仲裁案件」tab——QA 5/28 報告沒提及，admin.html 目前有 5 tabs（Pending Workers / Client Intakes / Decisions History / Contracts / Settings），仲裁案件在哪個 tab？

**洞 / 風險**：
- 仲裁被觸發（第 3 次退件）但雙方沒有地方可以提立場 → 案件卡住
- Admin 沒有看到仲裁案件的 UI → Edward 不知道要判決

**上線前必補**：
- 🔴 **P0**：確認 `arbitration.html` 是否 live + admin 仲裁 UI 是否存在
- 🔴 **P0**：仲裁判決後的金流處理（partial_pay / contract_terminate 的實際款項誰負責通知 / 執行？目前只有 `verdict_decision` 欄位但沒有自動化後續動作）

---

### 環節 9 · 評鑑（submit-nps + Tier 升降 recalc-worker-tier）

**現況：已做（backend 完整）**

- `nps_responses` 表已建（0-10 score · unique contract + role）
- `submit-nps` Edge Function 已建（JWT verify + insert + update worker cache + 呼叫 recalc-worker-tier）
- `recalc-worker-tier` Edge Function 已建
- 觸發：所有 milestone approved + `nps_invited_at` 空 → 自動寄 NPS 邀請（`update-milestone-status` + `client-acceptance` 都有接）
- `nps_avg / nps_count / completed_case_count` cache 欄位已建（`worker_applications`）
- `tier_history` jsonb 欄位已建（升降紀錄）

**斷點**：
- `nps.html` 前端頁面是否存在（spec 提到 `nps.html?id=X&role=Y&token=Z`）——若不存在、NPS 邀請信寄出去但用戶點進去看到 404

**洞 / 風險**：
- NPS 邀請信指向的頁面不存在 = 評鑑收不到 = Tier 升降沒數據

**上線前必補**：
- 🔴 **P0**：確認 `nps.html` 是否 live（若不存在必須建）

---

### 環節 10 · 抽佣 + 收款（綠界 create-ecpay-payment + commission + 對帳）

**現況：已做大部分 · 有 1 個關鍵斷點**

**已做**：
- `payment_intents` 表已建（綠界 API 自動付款 + webhook 對帳）
- `create-ecpay-payment` Edge Function 已建
- `ecpay-webhook` Edge Function 已建（CheckMacValue 驗簽 + status 更新）
- `ecpay-redirect` Edge Function 已建（前端跳轉）
- `get-payment-status` Edge Function 已建
- `commission_records` 表已建（4 event_type：client_paid / worker_paid_out / commission_collected / invoice_issued）
- `send-commission-invoice` Edge Function 已建（生 PDF invoice + email）
- `mark-commission-event` Edge Function 已建（admin 手動標記各 event）
- `recalc_contract_commission_totals` DB trigger 已建（自動累計 `client_paid_total_ntd` + `commission_collected_total_ntd`）

**關鍵斷點（Edward 點名確認）**：

**`payment_intents` 付款成功後，沒有自動寫入 `commission_records.event_type='client_paid'`**

掃 `ecpay-webhook/index.ts`——webhook 確認 `RtnCode=1`（付款成功）後的動作：
1. UPDATE `payment_intents.status = 'paid'`
2. 寄客戶收據 email
3. 寄 worker「客戶已付款」通知

**完全沒有** INSERT `commission_records`（event_type='client_paid'）。

`2026-05-28-all-migrations.sql` line 1348 的 comment 已標注：
> `[4] 蘇菲整合段: payment_intents.status='paid' -> INSERT commission_records event_type='client_paid'（不在此 migration · 屬 instance 2 commission_records 表領地）`

這一段被標為「待整合」但目前沒有任何 function 做這件事。

**後果**：
- 客戶刷了綠界付款 → webhook 確認付款 → `payment_intents.status = 'paid'`
- 但 `commission_records` 表沒有 `client_paid` event → `contracts.client_paid_total_ntd` 不會自動更新
- Edward 的金流對帳看板（admin Contracts）顯示「尚未付款」
- Worker 收到「客戶已付款」的 email 通知（webhook 有寄），但 admin 看板沒反映

**洞 / 風險**：
- 金流閉環斷開——客戶付了但系統不知道、對帳失去自動化意義
- admin 要手動去 mark-commission-event 才能補上 = 人工介入 = 容易漏 = 帳不對

**上線前必補**：
- 🔴 **P0**：`ecpay-webhook` 在 `RtnCode=1` 後自動 INSERT `commission_records`（event_type='client_paid' · amount = `payment_intents.amount_ntd`）

其他抽佣流程：
- `send-commission-invoice`（平台抽佣請款單）需要 admin 手動觸發——Beta 期 OK，但 doc 18 提到「接案者結案款入帳後 14 work day 自動催收」目前是純手動
- `commission_collected`（接案者匯回抽佣）目前純手動 mark——OK for Beta

**上線前必補**：
- 🟡 **P1**：`ecpay-webhook` 付款成功後連動寫 `commission_records.client_paid`（上面 P0 已列）
- 🟡 **P1**：`send-commission-invoice` 觸發時機確認（admin 手動觸發 vs 系統自動）

---

## 二 · 特別檢查（Edward 點名）

### 檢查 1 · 發案類別 vs 池子供給動態邏輯

**現況**：

前端 `components/data.jsx` 硬碼 15 個 VERTICALS：
```
content: dtc / design / video
build:   web / software / system / agent / data
strategy: b2b / research
growth:  mkt / seo
service: cs / localize
other:   other
```

`worker_unified_v` 目前只有 Edward 一人、`verticals = ['agent', 'strategy', 'software']`。

用 SQL 查池子有 approved worker 的領域：
```sql
SELECT DISTINCT unnest(verticals) AS vertical
FROM worker_unified_v
WHERE country = 'TW' OR country IS NULL;
```
預期結果：`agent`、`strategy`、`software`（3 個）

**問題**：
- 發案時顯示 15 個領域全部可選
- 客戶選 `dtc`、Step 4 query `worker_unified_v WHERE verticals @> '{dtc}'` → 0 筆
- 前端 fallback 進 demo 靜態資料 → 客戶以為配到真人
- 走完發案 → Edward 收通知 → 沒有真人 worker 可邀請 → 案子卡死

**建議動態邏輯實作**（P0 · 卡西法接）：

**Option A · 前端啟動時查池子（推薦）**：
```javascript
// components/supabase.js 加 helper
window.bpVerticals = {
  async getAvailableVerticals() {
    // 查 worker_unified_v 有人的 verticals
    const res = await client.rpc('bp_available_verticals');
    return { data: res.data, error: res.error };
  }
};
```

```sql
-- 新增 helper function
CREATE OR REPLACE FUNCTION public.bp_available_verticals()
RETURNS text[]
LANGUAGE sql STABLE SECURITY INVOKER
AS $$
  SELECT ARRAY(
    SELECT DISTINCT unnest(verticals)
    FROM public.worker_unified_v
    WHERE (country = 'TW' OR country IS NULL)
  );
$$;
GRANT EXECUTE ON FUNCTION public.bp_available_verticals() TO anon, authenticated;
```

前端 Step 01 載入時：
- 呼叫 `bpVerticals.getAvailableVerticals()`
- 有 worker 的領域 → 正常顯示（含 badge「有認證 worker」）
- 沒有 worker 的領域 → 灰色 disabled + tooltip「此領域 worker 累積中、可提交需求讓我們人工媒合」
- `other` 永遠顯示（走人工媒合）

**Option B · 靜態鎖定到有人的 3 個**（更快 · 更保守）：
- 暫時直接在 `data.jsx` 只顯示 `agent`、`strategy`、`software`（+ `other`）
- 等池子擴大了再開放其他領域
- 缺點：pool 擴大後還要改 code

**馬魯克建議**：先走 Option B（3 天內可 ship）、同時讓卡西法排 Option A 作為 Sprint 後段補進來。

**P0 必補**：發案選領域要反映池子現實、不能讓客戶選到沒有 worker 的領域走完整個流程。

---

### 檢查 2 · 整條鏈的斷點清單

**斷點 #1（P0 · 最嚴重）**：`payment_intents` paid → `commission_records` 未自動寫入

- 位置：`ecpay-webhook/index.ts`（`RtnCode=1` 分支）
- 缺少：INSERT `commission_records`（event_type='client_paid'）
- 影響：金流對帳失去自動化、admin 看板失去準確性

**斷點 #2（P0 · 配對空集）**：發案領域靜態 → 空領域被選 → 配對出 demo

- 位置：`components/data.jsx` VERTICALS 硬碼 + 無動態池子 check
- 影響：客戶走完整個發案流程、卻沒有真實 worker 可邀請

**斷點 #3（P0 · 安全）**：Admin 後台無 auth gate

- 位置：`admin.html` / `components/admin.jsx`（doc 14 P0-1 / doc 28 B）
- 影響：任意人能操作全平台——approve worker、issue contract、觸發仲裁、查看所有個資

**斷點 #4（P1 · 燒錢）**：`client-brief-parse` / `worker-ai-interview` 無 IP 限流

- 位置：這兩個函式缺 doc 28 C 的 IP 限流
- 影響：任何人連打 → Anthropic API 費用失控

**斷點 #5（P1 · 配對品質）**：前端配對是否真的跑 5 維 scoring 演算法

- 位置：`app2.jsx` 的 `bpWorkers.queryByVertical` 是 PostgREST 直查還是 `match-workers` Edge Function
- 影響：若只做 vertical filter 沒有 scoring，顯示的「配對分數」是假的

**斷點 #6（P1 · 前端缺頁）**：`nps.html` / `arbitration.html` / `milestone-detail.html` 是否存在

- 影響：NPS 邀請信 + 仲裁立場提交 + milestone 操作的前端入口，若 404 則整段流程卡死

**斷點 #7（P1 · 環境變數）**：綠界 3 個 key 是否已在 Edge Function secrets 設好

- 位置：`ECPAY_MERCHANT_ID` / `ECPAY_HASH_KEY` / `ECPAY_HASH_IV`（doc EDWARD-DEPLOY-GUIDE 步驟 3）
- 影響：create-ecpay-payment 調用時直接 fail

---

## 三 · PMF 上線前 P0 必補總清單

| # | P0 項目 | Owner | 工時估 | 依據 |
|---|---|---|---|---|
| P0-1 | **Admin 後台 auth gate**（admin.html 登入閘 · email 白名單）| 卡西法 + Edward | 半天 | doc 28 Batch 1 |
| P0-2 | **`ecpay-webhook` 付款成功後自動寫入 `commission_records`** | 卡西法 | 2-3hr | 本次盤點發現 |
| P0-3 | **發案領域動態化**（Option B 先鎖 3 個 + other / Option A 動態查池子）| 卡西法 | 半天-1天 | 本次盤點 + Edward 點名 |
| P0-4 | **`nps.html` 是否存在**（若無必須建）| 卡西法 | 1-2hr | 環節 9 |
| P0-5 | **`arbitration.html` 是否存在 + admin 仲裁 UI**（若無必須建入口）| 卡西法 | 1-2天（若無）| 環節 8 |
| P0-6 | **Storage bucket `contracts` + `deliverables` 已建**（Edward 步驟 2）| Edward | 2分鐘 | EDWARD-DEPLOY-GUIDE |
| P0-7 | **綠界 3 個環境變數已設**（ECPAY_MERCHANT_ID / HASH_KEY / HASH_IV）| Edward | 5分鐘 | EDWARD-DEPLOY-GUIDE 步驟 3 |
| P0-8 | **SQL migrations 已跑**（13 個 migration · 2026-05-28）| Edward | 3分鐘 | EDWARD-DEPLOY-GUIDE 步驟 1 |

---

## 四 · P1 建議補（上線後第 1 週）

| # | P1 項目 | Owner | 工時估 |
|---|---|---|---|
| P1-1 | `client-brief-parse` / `worker-ai-interview` IP 限流（Deno KV）| 卡西法 + 沙利曼 | 半天 |
| P1-2 | `send-decision-email` / `worker-accept-decline` admin caller check | 卡西法 | 2-3hr |
| P1-3 | 確認 5 維配對 scoring 是否真的跑到（或補接 `match-workers` Edge Function）| 卡西法 | 1-2hr |
| P1-4 | Worker 上傳交付檔案的前端入口確認（beta 期 admin 代操作亦可）| 蘇菲 + 卡西法 | — |
| P1-5 | Client milestone 驗收前端入口（milestone-detail.html?role=client）| 卡西法 | 半天 |
| P1-6 | 帳號系統 email magic link + 完整資料 gate（doc 28 A 塊）| 卡西法 | 1-2天 |
| P1-7 | Resend API key 設好（email 通知才通）| Edward | 5分鐘 |

---

## 五 · 紅黃綠燈 · 整條服務流程判定

### 最終燈號

🔴 **整條服務流程目前無法跑通一個真實案**

**理由**：
1. **P0-2 金流斷點**：客戶用綠界付款後、commission_records 沒有自動記錄 → 帳不對
2. **P0-3 池子空**：客戶發案只有 3 個領域有真人（Edward），但發案介面開了 15 個領域 → 客戶選到空領域走完整個流程、配不到任何人
3. **P0-1 Admin 裸奔**：後台沒有登入閘 → 安全紅線、無法對外 soft launch

**如果 3 個 P0 斷點都修完（P0-1 至 P0-8 清單完成）**：

🟡 整條鏈的骨架可以跑、但還有幾個「前端頁是否存在」需要確認（nps.html / arbitration.html / milestone-detail.html）。確認後才能說「跑得通一個真實案的全程」。

### 最大 3 個斷點（Edward 看這個就好）

**第 1 名 · 金流閉環沒接通**（P0-2）
客戶用綠界付款了、但系統的帳沒有自動更新。`ecpay-webhook` 在確認付款成功後需要多加一行插入 `commission_records`，目前這行缺失。修起來大概 2-3 小時。

**第 2 名 · 發案領域顯示的比池子有的還多**（P0-3）
現在開了 15 個領域讓客戶選，但只有 agent、strategy、software 這 3 個有 Edward 一人可配。客戶選其他 12 個會走完整個流程、最後收不到真的 worker。最保守的修法：先鎖定只顯示這 3 個領域 + other，等池子擴大再開放。

**第 3 名 · Admin 後台任何人都能開**（P0-1）
`admin.html` 沒有登入要求。知道 URL 的人可以 approve worker、看所有客戶資料、觸發合約。doc 28 Batch 1 已有完整 spec，卡西法半天可以 ship。

---

*🌿 馬魯克 · PM / QA Lead · 2026-05-29*
*老師我檢查完了。10 個環節都過了一遍，發現 8 個 P0 + 7 個 P1。最大的洞是金流閉環沒接通（ecpay-webhook 缺一段）+ 領域選項比池子有的多（會讓客戶白走流程）。清單在上面，卡西法接就可以動了。*
