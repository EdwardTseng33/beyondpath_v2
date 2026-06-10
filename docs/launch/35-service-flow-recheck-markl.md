# 35 · 服務流程再確認 · 馬魯克獨立 QA（上線前最終複查）

**作者**：馬魯克（PM / QA Lead · Sonnet 4.6）
**日期**：2026-05-29
**觸發**：Edward 5/29 上線前要求再確認整條服務串得通
**依據**：
- doc 33（2026-05-29 初版服務流程盤點 · 3 大斷點 + 8 P0 + 7 P1）
- `ecpay-webhook/index.ts`（今日更新版）
- `components/admin.jsx`（AdminAuthWrapper 實作）
- `components/supabase.js`（bpVerticals.getAvailableVerticals + bpProfile）
- `components/app2.jsx`（availVerticals state + isVerticalAvailable + profile gate）
- `supabase/migrations/20260529_bp_available_verticals.sql`
- `docs/deploy/2026-05-29-all-migrations.sql`（4 段搬遷）
- 前端頁面清單（nps.html / arbitration.html / milestone-detail.html 存在確認）
- doc 32（沙利曼正式收費 spec · 金流路徑 D vs 代收代付未拍板）

**QA 視角紀律**：獨立審查、不審自己的 code（今日修改由卡西法實作）。本文件只讀 + 判斷，不改 code。

---

## TL;DR · 一句結論

**三大斷點在 code 層面全部已修**，但「還沒上正式站」是最大阻擋——SQL 未跑、Edge Function 未 deploy、Supabase Auth 未設，整條鏈在 prod 環境是零。部署步驟完成後，Client 端可以跑通真實案的主幹流程；Worker 端有 2 個入口（milestone 操作、交付上傳）仍需確認 prod 可用。

---

## 一 · doc 33 三大斷點現況對照

### 斷點 1 · 金流閉環（ecpay-webhook 未寫 commission_records）

**doc 33 狀態**：P0 · ecpay-webhook 在 RtnCode=1 後，沒有自動寫入 commission_records.event_type='client_paid'

**今日修法確認**：

讀 `ecpay-webhook/index.ts`——第 62-121 行新增 `insertClientPaidCommission()` 函式，在 RtnCode=1 確認後（第 326-365 行 section 6.5）呼叫：

- 冪等保護：先查同 contract_id + reference_number 的 client_paid 是否已存在，webhook 重送不重複記帳
- INSERT commission_records（event_type='client_paid', amount_ntd, payment_method='ecpay_credit', reference_number=MerchantTradeNo）
- INSERT 成功後 DB trigger `recalc_contract_commission_totals` 自動更新 contracts.client_paid_total_ntd
- INSERT 失敗時：不回 0|fail 給綠界（避免 5 次 retry 造成雙寫），改走 Slack 急報 admin 手動補帳

**QA 判定**：Code 層 PASS。邏輯自洽、冪等有做、失敗降級路徑有備案。

**剩餘條件**：Edge Function 必須 deploy prod（EDWARD-DEPLOY-GUIDE 步驟 4）。未 deploy = code 等於沒修。

---

### 斷點 2 · 發案領域鎖（靜態 15 個 vs 池子 3 個）

**doc 33 狀態**：P0 · VERTICALS 硬碼 15 個，池子只有 3 個有人，客戶選空領域走完流程得到假配對

**今日修法確認**：

三層都修了：

**DB 層**：`20260529_bp_available_verticals.sql` — 新增 `bp_available_verticals()` RPC，查 worker_unified_v（status approved/tier_b/tier_b_plus）中有人的 distinct verticals。`2026-05-29-all-migrations.sql` 段 3 同步包含。GRANT anon + authenticated 可執行（發案表單登入前就要顯示）。

**supabase.js 層**：`window.bpVerticals.getAvailableVerticals()` 呼叫 `client.rpc('bp_available_verticals')`，失敗回 error（前端 fallback 放行全部）。

**app2.jsx 層**：
- `availVerticals` state（null = 查詢中 = 不卡）
- `isVerticalAvailable(v)` 函式：null 階段放行全部 / other 永遠開 / 命中 vertical id 或 cat 名才開放
- 初始化時若預選 vertical 不在池子裡（dtc 可能沒人），自動切到第一個有人的領域

**QA 判定**：Code 層 PASS。動態化邏輯完整，fallback 設計合理（寧可多開不卡早期試用）。

**剩餘條件**：
1. SQL migration 需跑（`bp_available_verticals` RPC 才存在於 Supabase）
2. Edge Function 不涉及，但前端 HTML 需確認有引入最新 supabase.js（Vercel push 後確認）

---

### 斷點 3 · Admin 後台無登入閘

**doc 33 狀態**：P0 · admin.html 任何人知道 URL 就能操作全平台

**今日修法確認**：

讀 `components/admin.jsx` 第 1679-1790 行：

- `ADMIN_EMAILS = ["edwardt0303@gmail.com"]`（白名單）
- `AdminAuthWrapper()`：3 種狀態（loading / signin / forbidden / ok）
  - 未登入 → `AdminSignInGate`（Google 登入按鈕）
  - 登入但不在白名單 → `AdminForbidden`（「此後台為私人使用」，不顯示登入者 email）
  - 白名單 → `AdminApp`
- `onAuthStateChange` 監聽：OAuth redirect 回來時自動解析 session
- `root.render(<AdminAuthWrapper />)`：整個 admin.html 都包在 auth gate 內

**QA 判定**：Code 層 PASS。白名單邏輯正確，forbidden 頁面不洩漏 email（沙利曼 Gate 5 要求有符合）。

**剩餘條件**：
1. Supabase Auth 的 Google OAuth provider 必須在 Supabase Dashboard 啟用（Authentication > Providers > Google），並設好 Client ID + Client Secret
2. admin.html 的 Redirect URL 必須加進 Supabase Auth > URL Configuration > Redirect URLs
3. Vercel 部署後，Google OAuth Console 的 Authorized redirect URIs 也需加 `https://beyondpath.tw/admin.html`

**這 3 個是 Edward 必做的手動設定，不是 code。沒設 = admin 登入按下去會 OAuth 失敗。**

---

## 二 · 整條鏈能否跑通一個真實案

### Client 端：逐步走一遍

| 步驟 | 動作 | 現況判定 | 阻擋點 |
|---|---|---|---|
| 1 | 進 app.html 登入（Google OAuth / email magic link） | Code OK | 需 Supabase Auth Google Provider 設好 + email magic link provider 啟用 |
| 2 | 填完整資料（姓名 + 電話 + 身分類型）| Code OK：profile gate 有做（profile_complete generated column）| 需 SQL migration 跑（profiles 欄位加了 phone / identity_type / profile_complete）|
| 3 | Step 01 選領域 | Code OK：動態池子 + disabled 邏輯有做 | 需 SQL migration 跑（bp_available_verticals RPC）|
| 4 | Step 02-03 填 brief + AI 拆解 | Code OK（已知 QA PASS）| 需 Anthropic API key 在 Edge Function secrets 設好（5/15 已設，確認未過期）|
| 5 | Step 04 看配對結果 | Code OK：有人的領域才顯示 real pool，其他 fallback demo | 需 Edge Function deploy（match-workers）|
| 6 | 收邀請信 + 查看接案者 | Code OK（send-decision-email 已做）| 需 Edge Function deploy + Resend API key 設好（5/15 已設）|
| 7 | 簽約（contract.html）| Code OK（QA 5/28 smoke PASS）| 需 Edge Function deploy（generate-contract-pdf / submit-signature）|
| 8 | 收貨驗收（milestone-detail.html）| 前端頁面存在（確認有 milestone-detail.html）| 需確認 milestone-detail.html prod 可開 + worker/client token 路徑正確 |
| 9 | 付款（綠界）| Code OK（斷點 1 已修）| 需 ECPAY 3 個環境變數設好 + 綠界 ReturnURL 設好 + Edge Function deploy |
| 10 | 金流對帳看板跳「已收款」| Code OK（commission trigger 已接）| 同上 |

**Client 端結論**：主幹流程在 code 層面可走通。關卡全在「prod 部署步驟是否完成」。

---

### Worker 端：逐步走一遍

| 步驟 | 動作 | 現況判定 | 阻擋點 |
|---|---|---|---|
| 1 | 申請進池（app.html?role=worker）| Code OK（QA 5/28 PASS）| 同 client 登入前提 |
| 2 | AI 面試（worker-ai-interview）| Code OK（QA 5/28 PASS）| 需 Anthropic API key |
| 3 | 等 Edward 審核 / 進池 | Admin 審核 UI：approve 按鈕在 admin.html Pending Workers tab（Code OK）| Admin auth gate 需設好才能安全操作 |
| 4 | 收邀請信 | Code OK（send-decision-email）| 需 Edge Function deploy + Resend |
| 5 | 接案（worker-accept-decline）| Code OK | 需 Edge Function deploy |
| 6 | 交付檔案（upload-deliverable）| **待確認**：upload-deliverable Edge Function 已建，但 worker 端的前端上傳 UI 在哪？milestone-detail.html 有這個入口嗎？| Beta 期 Edward 可 admin 代操作，但需確認有路徑 |
| 7 | milestone 狀態更新（標 delivered）| **待確認**：update-milestone-status 有 Edge Function，但 worker 側前端入口（milestone-detail.html?role=worker&token=）需 prod 驗 | milestone-detail.html 存在，但 token route 需 prod smoke |
| 8 | 收 NPS 邀請 | nps.html 存在（確認）| 需 Edge Function deploy（submit-nps）|
| 9 | 收款（接案者看板）| worker-payout.html 存在（確認）| 目前是 admin 手動 mark-commission-event（Beta OK）|

**Worker 端結論**：申請 → 認證 → 收邀請 → 接案主幹 OK。交付和 milestone 操作的 worker 前端入口需 prod 上線後煙霧測試確認。

---

## 三 · 上線阻擋清單

### GO / NO-GO 級（任一未完成 = 不能上線）

| # | 項目 | 性質 | 誰做 | 工時 |
|---|---|---|---|---|
| G-1 | **SQL migration 跑**（`2026-05-29-all-migrations.sql` 4 段）| 環境前提 | Edward | 3 分鐘 |
| G-2 | **Edge Function deploy**（`deploy-all-functions.sh`，含更新版 ecpay-webhook）| 環境前提 | Edward | 5 分鐘 |
| G-3 | **Supabase Auth Google OAuth provider 設好**（Dashboard + Redirect URL + OAuth Console redirect URI）| 帳號系統前提 | Edward | 10 分鐘 |
| G-4 | **Supabase Auth email magic link provider 啟用**（Authentication > Providers > Email，確認 Enable email confirmations 開啟且 Resend SMTP 設定生效）| 帳號系統前提 | Edward | 5 分鐘 |
| G-5 | **ECPAY 3 個環境變數設好**（ECPAY_MERCHANT_ID / HASH_KEY / HASH_IV）+ 綠界 ReturnURL 設好 | 金流前提 | Edward | 5-10 分鐘 |
| G-6 | **Storage bucket `contracts` + `deliverables` 已建**（Supabase Studio → Storage）| 交付前提 | Edward | 2 分鐘 |
| G-7 | **金流路徑拍板**（doc 32 §6 必拍 1：路徑 D 平台不持有客戶款 vs 代收代付現有 code）| 法律 + 架構前提 | Edward 親口拍 | 決策 |
| G-8 | **terms.html Beta 字眼收斂 + 費率條款一致性修**（doc 32 §1.1 + §1.3：terms §3.2 金額階梯 → Tier 階梯，與 commission-calc.ts 對齊）| 法律前提（沙利曼 NO-GO 條件）| 蘇菲/卡西法 | 半天 |

**G-7 說明**：今日 ecpay-webhook 修的是「代收代付路徑」（客戶刷卡→錢進 Edward 個人戶→系統記帳）。但 doc 32 沙利曼指出現有 code 走代收代付、與 doc 18 既定策略路徑 D「平台不持有客戶款」打架，是法律灰區。Edward 必須親口拍板用哪個路徑，才能確認斷點 1 的修法方向是否正確。若選路徑 D，ecpay-webhook 的金流閉環邏輯需要改架構（接案者撥付 take rate，不是客戶刷卡進平台）。

---

### P1 級（上線後第 1 週補，不阻擋 soft launch）

| # | 項目 | 說明 |
|---|---|---|
| P1-1 | Worker 上傳交付檔案的前端入口確認 | milestone-detail.html?role=worker&token=X 的 upload UI，Beta 期 Edward admin 代操作亦可 |
| P1-2 | Milestone 操作 prod smoke test | worker 標 delivered / client 點驗收的 token 路徑，prod 部署後跑一遍 |
| P1-3 | `client-brief-parse` / `worker-ai-interview` IP 限流 | doc 28 C 塊，Deno KV 限流，防 Anthropic API 費用失控 |
| P1-4 | `send-decision-email` admin caller check | doc 28 Batch 3，防任意人打爆發信 |
| P1-5 | 5 維配對 scoring 確認 | app2.jsx 的 bpWorkers.queryByVertical 是 PostgREST 直查還是 match-workers Edge Function（不影響早期只有 1 個 worker 的配對） |
| P1-6 | Resend API key prod 確認有效 | email 通知必需，5/15 已設但需確認未過期 |
| P1-7 | terms.html Beta POC 字眼清除（非費率段）| 對外形象，不是法律前提 |

---

## 四 · 整體燈號

### 斷點層（code）：3/3 已修

| 斷點 | doc 33 狀態 | 今日修法 | QA 判定 |
|---|---|---|---|
| 斷點 1 · 金流閉環 | P0 · webhook 缺一段 | ecpay-webhook 加 insertClientPaidCommission() + 冪等保護 | PASS（Code 層）|
| 斷點 2 · 發案領域鎖 | P0 · 靜態 15 個 | bp_available_verticals RPC + supabase.js + app2.jsx 動態化 | PASS（Code 層）|
| 斷點 3 · Admin 後台裸奔 | P0 · 無 auth gate | AdminAuthWrapper + ADMIN_EMAILS 白名單 + forbidden 頁 | PASS（Code 層）|

### 環境層（prod）：0 已跑

**新搬遷 SQL 沒跑、Edge Function 未 deploy prod、Supabase Auth 未設**——目前 prod 環境是上週狀態，3 大斷點的修法等於不存在於 prod。

### 法律層（決策）：1 個 NO-GO 懸空

金流路徑拍板（G-7）是上線前必決事項。若走代收代付，今天的 ecpay-webhook 修法正確可用；若走路徑 D，需要重新設計接案者撥付 take rate 的流程，今天的斷點 1 修法需要調整方向。

---

## 五 · 能否跑通真實案（一句結論）

**Code 層：3 大斷點全修，整條主幹骨架可走通；但 prod 環境的部署步驟（SQL / Edge Function / Auth / ECPay）一步都沒跑，現在正式站上跑不通任何一個真實案。**

部署步驟（G-1 至 G-6）完成後，Client 發案 → 配對 → 邀請 → 簽約 → 付款整條主幹可通；Worker 端的 milestone 操作 + 交付上傳入口（P1-1 / P1-2）需 prod 上線後補驗。法律層的金流路徑拍板（G-7）決定斷點 1 修法是否需要返工，上線前 Edward 必須親口決定。

---

*馬魯克 · PM / QA Lead · 2026-05-29*
*老師我檢查完了。三個斷點 code 都修好了，打勾打到最後一格時發現法律那關還有一個岔路沒選（金流路徑），這個要等 Edward 拍板才能確定今天的修法是朝對的方向走。部署步驟清單在 G-1 到 G-8，完成後再跑一次煙霧測試就能上。*
