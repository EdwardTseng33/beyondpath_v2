# 37 · 營運者 SOP 表（Operations SOP · 馬魯克 PM/QA Lead）

**作者**：馬魯克（PM / QA Lead · Sonnet 4.6）
**日期**：2026-05-31
**觸發**：Edward 5/31 上線前確認整套日常運作 SOP 是否完整
**依據**：
- `PRD_Product_Flow_v0.2.md`（霍爾 12 步狀態機）
- `BeyondPath_Product_Framework.md`（v0.4 完整產品框架）
- `Trust_Compliance_Brief_Product_Flow.md`（沙利曼合規 brief）
- `docs/launch/18-payment-flow-howl.md`（金流路徑 D SOP）
- `docs/launch/32-go-live-billing-spec.md`（正式收費上線 spec · 沙利曼）
- `docs/launch/33-service-flow-audit-markl.md`（5/29 服務流程盤點）
- `docs/launch/35-service-flow-recheck-markl.md`（5/29 斷點複查）
- `components/admin.jsx` + `components/supabase.js`（後台 + 金流 API 實作）
**範圍**：雙邊註冊 → 填資料 → 發案 → AI 拆解 → 配對 → worker 邀請 → 接受/婉拒 → 簽約 → 金流 → 履約 → 交付 → 驗收 → 撥款 → 雙邊評鑑 NPS

---

## 重要前提（讀 SOP 前先看）

**金流路徑尚未拍板**（doc 35 G-7）：

現有 code 走的是「代收代付」路徑（客戶刷卡→錢進 Edward 綠界戶→再撥 worker）；
doc 18 霍爾設計走的是「路徑 D」（客戶直付 worker→worker 再轉 take rate 給平台）。
兩條路法律結構完全不同，**本 SOP 表用路徑 D 為底**（沙利曼建議、法律風險低）。
若 Edward 最終拍板代收代付路徑，§金流段需要重寫一份。

**Y1 PMF 階段定位**：1 人營運（Edward 是發案方窗口 + 審核員 + 對帳員），所有「系統自動」的步驟要特別標清楚——沒有的地方就是要 Edward 親自處理的地方。

---

## 一 · 雙邊 SOP 主表

### 環節 1 · Worker 申請進池（接案者）

| 維度 | 現況 |
|---|---|
| **誰做** | 系統自動（AI 面試）+ Edward 人工審核（admin console approve 按鈕）|
| **時間** | 用戶端：AI 面試約 10-15 分鐘 / Edward 審核：收到後 24-72 小時內（無 SLA，Edward 自定）|
| **用戶看到什麼** | 申請完成後系統自動寄 ack email（`worker-ack-email` Edge Function 已接）：「感謝申請，我們的 AI 已完成初步評估，Edward 會在 72 小時內與你確認結果。」|
| **Edward 怎麼知道** | 需確認 `notify-lead-slack`（已接 client intake，但 worker apply 是否也有 Slack 通知）——目前 doc 33 只提 client intake 有通知，**worker 申請無 Slack push → Edward 要主動登 admin.html 看 Pending Workers tab**|
| **Admin 操作** | 登 admin.html → Pending Workers tab → 看 AI proof 資料 + L_score + skill matrix → 點 Approve / Reject + 寫 admin_notes|

**缺口：**
- Worker 申請後無主動 push 通知給 Edward——要靠 Edward 主動開 admin.html 才知道有人申請
- admin.html 已有 auth gate（Google 登入白名單 `edwardt0303@gmail.com`）但需確認 Google OAuth 設定已完成（doc 35 G-3）

---

### 環節 2 · Client 發案前準備（帳號 + 完整資料）

| 維度 | 現況 |
|---|---|
| **誰做** | 系統自動（magic link / Google OAuth 登入）+ 用戶填資料 |
| **時間** | 登入 30 秒 / 填完整資料（姓名 + 電話 + 身分類型）約 2 分鐘 |
| **用戶看到什麼** | 登入後 profile_complete gate：若三項未填齊，發案按鈕 blocked，顯示「請先完成基本資料才能發案」|
| **防呆邏輯** | `profiles` 表 `profile_complete` = DB generated column（phone + identity_type + full_name 三項齊才 true）；前端 `app2.jsx` 在進 Step 01 前先查 `bpProfile.get()` 確認 profile_complete|
| **Edward 介入點** | 無需介入（全自動）|

**缺口：**
- 若 email magic link 的 Resend API key 未設，登入信送不出去（doc 35 P1-6，Edward 操作 5 分鐘）
- 若 SQL migration 未跑（`20260529_profiles_required_fields.sql`），profile gate 欄位不存在

---

### 環節 3 · 發案（Step 01-04：選領域 → brief → AI 拆解 → 配對）

| 維度 | 現況 |
|---|---|
| **誰做** | 系統自動（AI 拆解、動態池子查詢）+ 用戶操作 |
| **時間** | 選領域 1 分鐘 / 填 brief 10-20 分鐘 / AI 拆解 10-30 秒 / 看配對 1 分鐘 |
| **用戶看到什麼** | Step 01 選領域：有 worker 的領域正常顯示，無 worker 的顯示灰色 disabled + 「此領域 worker 累積中，可提交讓我們人工媒合」/ Step 03 AI 拆解：AI 逐字打出任務分解 + 預估工時區間 + 建議 Tier / Step 04 配對：3 位候選 worker 卡片 + match score + 「為什麼推薦」1 句話 |
| **Edward 怎麼知道** | 客戶送出發案後，`notify-lead-slack` Edge Function 自動推 Slack 訊息給 Edward，含：客戶名 + brief 摘要 + AI 推薦 Top 3 worker + match score（doc 08 T4 已接）|
| **預期管理** | 用戶送出後看到「已收到你的需求，24 小時內 Edward 會確認配對並與你聯繫」|

**缺口：**
- Step 04 配對是否真的跑 5 維 scoring 演算法，或只做 vertical filter（doc 35 P1-5）——early stage 只有 Edward 一人在池子裡影響不大，但需確認
- Anthropic API key 是否還有效（5/15 已設，doc 35 確認未過期）

---

### 環節 4 · Admin 手動配對 + 發邀請信

| 維度 | 現況 |
|---|---|
| **誰做** | Edward 人工（admin console 操作）+ 系統自動（send-decision-email Edge Function 發信）|
| **時間** | Edward 收 Slack 通知到發信：目標 24 小時內 / 系統自動發信：秒級 |
| **流程** | admin.html → Client Intakes tab → 選 intake → Run Match（跑 5 維算法）→ 勾選 worker → 填可選訊息 → 點 Send Invites |
| **用戶看到什麼（Worker）** | 收到邀請 email：案件摘要 + 客戶匿名 brief + 截止回覆時間（未定義 SLA）+ 接案 / 婉拒 連結 |
| **用戶看到什麼（Client）** | 「我們已找到合適的專家，專家正在確認檔期，24 小時內會有確認結果」（需確認是否已有此通知，**目前代碼中未明確看到這個提示**）|

**缺口：**
- Client 在這個等待環節缺乏主動通知——發出邀請後 client 沒有任何 status update，會焦慮
- Worker 的接案/婉拒 email 連結目前用 GET 路徑（安全疑慮，doc 35 P1-2）

---

### 環節 5 · Worker 接案 / 婉拒

| 維度 | 現況 |
|---|---|
| **誰做** | Worker 點 email 連結 → 系統自動（`worker-accept-decline` Edge Function）|
| **時間** | Worker 24 小時內回覆（無強制 SLA，超時替補邏輯待確認）|
| **用戶看到什麼（Worker）** | 點「接案」→ 導到確認頁 → 「已確認接案，合約準備中」/ 點「婉拒」→ 導到婉拒頁 → 「已記錄，謝謝你的回覆」|
| **用戶看到什麼（Client）** | **系統目前沒有在 worker 接案後主動通知 client**——doc 18 §1.1 有 Edward 手動 LINE client 的 SOP，但系統端無自動 email |
| **Edward 怎麼知道** | 系統是否有 Slack push 給 Edward 當 worker accept/decline？**目前代碼中未見此通知**——Edward 需要主動去 admin Contracts 或 Decisions History 查 |
| **超時替補** | doc 12 有設計 24h timeout 自動替補，但前端 / Edge Function 實作待確認 |

**缺口：**
- Worker 接案後，client 沒有系統 email 通知——需 Edward 手動 LINE
- Worker accept/decline 後，Edward 無主動 push——需手動看 admin 才知道

---

### 環節 6 · 簽約（電子合約 + 雙方簽署）

| 維度 | 現況 |
|---|---|
| **誰做** | Edward 操作 admin console 觸發合約產生 → 系統自動（`generate-contract-pdf` Edge Function 生 PDF + 發信雙方）→ 雙方各自操作 `contract.html` 簽署（上傳照片）|
| **時間** | 合約產生：秒級 / 雙方簽署：實際等待時間 Edward 無法控制，建議 SLA 3 個 work days |
| **流程** | admin.html → Contracts tab → 選 intake + worker → 填案件總金額 → 點 Generate Contract PDF → 系統 email 雙方 PDF 下載連結 + 簽署頁連結 |
| **用戶看到什麼** | 收到 email：合約 PDF 連結 + 「請至此網址完成電子簽署」/ contract.html：顯示合約內容摘要 + 上傳簽名照片 / 簽署完：「簽署完成，等待對方簽署」|
| **Edward 怎麼知道雙方都簽完** | admin.html Contracts tab 顯示 `client_signed_at` + `worker_signed_at` 欄位——目前需手動刷新查看，**無主動通知** |
| **Y1 Beta 簡版** | doc 18 §1.1 Beta W1-W6：Google Docs 雙簽 + LINE 截圖給 Edward 存 Supabase Storage 即可 |

**缺口：**
- 雙方簽署完成後，無主動通知 Edward——Edward 要主動查 admin Contracts tab
- 簽署 SLA 未定義（建議 3 個 work days 超時提醒 client / worker）

---

### 環節 7 · 付款（金流）

**這一段是 Edward 最重點確認的環節。根據金流路徑 D（平台不持有客戶款）：**

#### 7.1 簽約金 30%（M1 kickoff 款）

| 維度 | 現況（路徑 D）|
|---|---|
| **誰做** | Edward 親口告知 client 付款帳號（worker 銀行帳號）→ Client 自行 ATM 轉帳→ Worker 收到後在系統 ack（按「已收到簽約金」）→ 系統自動觸發 kickoff |
| **時間** | Client 轉帳：合約簽完後 7 個 work days 內 / Worker ack：收到後 24 小時內 |
| **用戶看到什麼（Client）** | 收到 email 或 Edward LINE：「請在 7 個 work days 內轉帳 NT$ X 到 [Worker 名] 帳戶 [銀行/帳號]，備註：BP-[project_id]-簽約金」/ 目前**無系統確認 client 已付的反饋** |
| **用戶看到什麼（Worker）** | 收到款項後，登入平台點「已收到簽約金」→ 系統自動更新 milestone 1 status + 發信通知 Edward + client：kickoff 啟動 |
| **Edward 怎麼知道** | Worker ack 後系統 email 通知（doc 18 §1.2 有規劃）+ 後台看 milestone 狀態 |
| **對帳** | `commission_records` 表自動記錄 `client_paid` event（路徑 D 下這筆是 worker 側的 ack，不是綠界 webhook）|

**路徑 D vs 現有 code 差異說明：**

- **現有 code（代收代付）**：admin.html 可以 `createEcpayPayment()` 產生綠界付款連結 → 客戶刷卡 → 錢進 Edward 綠界戶 → webhook 自動記帳
- **路徑 D（霍爾設計 / 沙利曼建議）**：客戶直接轉帳給 worker → worker ack → 系統記錄

**Edward 必須親口決定用哪個路徑（doc 35 G-7 懸空）。** 目前 admin Contracts tab 有綠界付款連結按鈕（代收代付路徑），但法律上沙利曼建議走路徑 D。

#### 7.2 中期款 30%（M2 milestone 完成後）

| 維度 | 現況（路徑 D）|
|---|---|
| **誰做** | Worker 完成 milestone 1 交付 → Client 驗收確認 → Edward / 系統提示 client 付 M2 款 → Client 轉帳 → Worker ack |
| **時間** | Client 驗收：7 天默認自動通過（超時自動 approve，doc 12 規範）/ Client 付款：驗收後 7 work days |
| **用戶看到什麼** | Worker：交付後看到「待客戶驗收」狀態 / Client：收到「milestone 1 交付，請確認或退件（7 天內，超時自動通過）」/ 驗收通過後 client 收到「請付 M2 款」通知 |

#### 7.3 結案款 40%（M3 + NPS 後）

與 M2 相同流程，付款後加觸發 NPS 評鑑邀請。

#### 7.4 平台抽佣（take rate）

| 維度 | 現況（路徑 D）|
|---|---|
| **誰做** | 結案後 Edward 手動寄送請款單 → Worker 匯 take rate 到 Edward 帳戶（個人戶）→ Edward 手動在 admin console `mark-commission-event`（commission_collected）標記 |
| **時間** | 結案後 14 個 work days（doc 18 建議）|
| **抽佣計算** | `commission-calc.ts` Tier 階梯：Worker Tier B 20% / B+ 19% / A 18% / A+ 17% / S 17%；retainer 各 +3% |
| **用戶看到什麼（Worker）** | 結案後 email：「案件完成！案款 NT$ X，平台服務費 NT$ Y（Z%），請在 14 個 work days 內匯款到 [Edward 帳戶]」/ 系統寄 PDF 請款單（`send-commission-invoice` Edge Function）|
| **對帳（Edward 端）** | admin.html → Contracts tab → 選合約 → 看 `commission_amount_ntd`（應收）/ `commission_collected_total_ntd`（已收）/ 點「標抽佣已收回」標記 |

**缺口：**
- 路徑 D 下，client 付款是直接轉帳給 worker，系統沒有自動得知 client 是否已付——全靠 worker ack，若 worker 沒 ack 系統不知道
- 請款單的寄送目前需 admin 手動觸發（`send-commission-invoice` 按鈕），無自動 cron
- terms.html 費率條款與 `commission-calc.ts` 不一致（doc 32 §1.3 NO-GO 條件，必修）

---

### 環節 8 · Kickoff + 履約 Milestones

| 維度 | 現況 |
|---|---|
| **誰做** | 系統自動（簽約金 ack 後自動建 3 個 milestone：M1 30% / M2 30% / M3 40%）+ Worker 操作（標 delivered）+ Client 操作（驗收 / 退件）|
| **時間** | 每個 milestone 期限由合約定義（`due_date` 欄位）；驗收 7 天默認通過 |
| **用戶看到什麼（Worker）** | `milestone-detail.html?role=worker&token=X`：看 milestone 交付要求 + 上傳附件 + 外部連結 + 標「已交付」|
| **用戶看到什麼（Client）** | `milestone-detail.html?role=client&token=X`：看 worker 交付的內容 + 驗收 / 退件（最多 3 次，第 3 次觸發仲裁）|
| **Edward 怎麼知道** | admin.html Contracts tab → Milestones：目前需手動刷新查看，**milestone 狀態變化無 push 通知**（例如 worker 標 delivered 後 Edward 不知道）|

**缺口：**
- Milestone 狀態變化（worker 標 delivered / client 驗收 / client 退件）無主動通知 Edward——要靠定期查 admin 或 LINE 溝通
- Worker 上傳交付檔案的前端入口（milestone-detail.html?role=worker）需 prod 部署後確認可用（doc 35 P1-1）
- 連續退件觸發仲裁後，`arbitration.html` 頁面存在但功能完整性需確認（doc 35 P1 層）

---

### 環節 9 · Client 驗收

| 維度 | 現況 |
|---|---|
| **誰做** | Client 操作（milestone-detail.html 驗收按鈕）+ 系統自動（驗收後 escrow 釋款 + trigger NPS）|
| **時間** | Client 7 天默認自動通過（`client-acceptance` Edge Function 有實作）|
| **用戶看到什麼** | 驗收通過：「milestone X 驗收完成，款項撥付中」/ 退件：「已送出修改意見，worker 將在 24 小時內確認」|
| **3 次退件後** | 系統自動觸發仲裁（`trigger-arbitration` Edge Function）→ 雙方收到仲裁通知 email → 進入 arbitration.html 提立場 → Edward 在 admin.html Arbitration tab 判決 |

**缺口：**
- 仲裁判決後，金流補償（partial_pay / contract_terminate）目前只有 `verdict_decision` 欄位，無自動執行——Edward 需手動通知雙方執行補款 / 退款

---

### 環節 10 · 撥款 Worker

| 維度 | 現況（路徑 D）|
|---|---|
| **誰做** | Client 在驗收後根據 Edward 通知轉帳給 worker（路徑 D：直接轉帳）→ Worker ack |
| **時間** | 路徑 D：無自動托管，依 client + worker 自行協議；建議 5 個 work days |
| **用戶看到什麼（Worker）** | `worker-payout.html`：看合約款項狀態、各 milestone 已收 / 待收 |
| **對帳** | admin.html Contracts tab：`client_paid_total_ntd`（已付）/ `commission_amount_ntd`（應抽佣）/ `commission_collected_total_ntd`（已收抽佣）|

**缺口：**
- 路徑 D 下，撥款是 client 直接轉帳給 worker，平台系統對這筆款項沒有自動感知——靠 worker ack 或雙方 LINE 確認
- Worker 看 `worker-payout.html` 可以看到款項狀態，但數字的準確性取決於 worker ack 是否即時

---

### 環節 11 · 雙邊評鑑 NPS

| 維度 | 現況 |
|---|---|
| **誰做** | 系統自動（最後 milestone 驗收後自動發 NPS 邀請 email）→ 雙邊各自操作 `nps.html` |
| **時間** | 自動觸發：即時 / 用戶填 NPS：目標 72 小時內（未設強制 SLA）|
| **用戶看到什麼** | 收到 email：「案件完成！請花 2 分鐘評鑑這次合作」→ `nps.html?id=X&role=Y&token=Z`：5 維度評分（交付品質 / 溝通效率 / 創意度 / 時程準確 / 整體推薦度）+ 文字評語 |
| **後台效果** | NPS 填完後：worker 的 `nps_avg` / `nps_count` / `completed_case_count` 自動更新 → `recalc-worker-tier` 自動跑 Tier 升降判斷 |
| **Edward 介入點** | 無需介入（全自動）|

**缺口：**
- 若用戶 7 天未填 NPS，目前無追催機制——系統不會再寄 reminder email

---

## 二 · 金流 SOP 細化（重點段）

**下表假設路徑 D（客戶直付 worker）。若 Edward 拍板代收代付，整欄需重寫。**

| 步驟 | 系統做什麼 | Edward 做什麼 | 用戶看到什麼 | 時間 |
|---|---|---|---|---|
| 合約生成 | `generate-contract-pdf` 生 PDF + 發信雙方 + 寫 `contracts` 表 | 在 admin Contracts tab 觸發按鈕 | 收到「合約 PDF + 請完成簽署」email | 秒級 |
| 雙方簽署 | `submit-signature` 驗簽 + 更新 `client_signed_at` / `worker_signed_at` | 查 admin 確認兩邊都簽完 | contract.html 頁面即時顯示「對方已簽署 / 尚未簽署」| 人工 1-3 天 |
| 付款指示 | 系統無自動化（路徑 D）| Edward 告知 client：worker 帳號、金額、備註格式 | Client 收到 email / LINE：付款說明 | 即時（Edward 主動）|
| Client 轉帳 | 無系統感知 | 確認 worker ack 後即知客戶付了 | Client：無反饋（除非 Edward 另行 LINE 確認）| 7 work days 內 |
| Worker ack 收款 | 更新 milestone 狀態 + 自動 email 雙方 + 更新 `commission_records.client_paid` | 收到系統通知（需確認 worker ack 後是否有 Slack push）| Worker：「已記錄收款，Kickoff！」/ Client：「簽約金已到位，專案啟動」| 秒級（worker ack 後）|
| 對帳看板 | `recalc_contract_commission_totals` DB trigger 自動計算 `client_paid_total_ntd` | 看 admin Contracts tab `client_paid_total_ntd` 欄位 | Worker：`worker-payout.html` 顯示收款紀錄 | 即時（trigger 後）|
| 結案請款 | `send-commission-invoice` 生 PDF 請款單 + email worker | admin 手動點「寄送請款單」按鈕 | Worker 收到請款單 email（含 PDF）| 手動觸發（秒級）|
| Worker 匯抽佣 | 無系統感知（路徑 D worker 自行匯）| 收到匯款後，admin 點「標抽佣已收回」| Worker：無系統反饋（建議 Edward 手動回 email 確認）| 14 work days |
| 對帳確認 | `commission_collected_total_ntd` 欄位更新（admin mark 後）| admin Contracts tab 確認金額一致 | — | 手動 mark 後即時 |

**出錯誰處理：**
- 客戶轉帳備註寫錯 → Edward 人工確認匹配
- Worker ack 延遲（>48 小時）→ 系統目前無自動 alert → Edward 需主動追 worker
- 抽佣逾期（>14 work days）→ 系統目前無自動追催 → Edward 手動 email

---

## 三 · 後台能管什麼 / 不能管什麼

### admin.html 可以做的事（Edward 的工作台）

| 功能 | 操作 | Tab |
|---|---|---|
| 審核 worker 申請 | 看 AI proof + skill matrix + audit flags → Approve / Reject / Archive | Pending Workers |
| 觸發 AI 配對 | 選 client intake → Run Match → 看 Top 3 候選 + score breakdown | Client Intakes |
| 發邀請信 | 選 worker → 填訊息 → Send Invites | Client Intakes |
| 生成合約 PDF | 選 intake + worker + 金額 → Generate Contract | Contracts |
| 查看合約狀態 | 看雙方簽署時間 + milestone 進度 + 金流狀態 | Contracts |
| 管理 milestone | 看 milestone 狀態 + 手動更新（update-milestone-status）| Contracts → Milestones |
| 發綠界付款連結（代收代付路徑）| 選 milestone → 輸入金額 + email → 產連結複製或發信 | Contracts → Payments |
| 標抽佣已收 | 選合約 → mark-commission-event → 選 commission_collected | Contracts → Commission |
| 寄請款單 | 選合約 → 寄送 commission invoice PDF | Contracts → Commission |
| 看 NPS 評鑑 | 看雙邊 NPS score + 評語 | NPS Reviews |
| 仲裁判決 | 看仲裁案件 + 選 verdict → 執行判決 | Arbitration |
| 調整配對權重 | 5 維 (tier/capacity/domain/L_score/mercy) 可調（localStorage 持久）| Settings |

### admin.html 做不到的事（缺口）

| 缺口 | 影響 | 替代方案 |
|---|---|---|
| Worker 申請無 push 通知 | Edward 要主動開 admin 看有沒有新申請 | Supabase 加 webhook 或 Edge Function notify-lead-slack 加 worker 申請觸發 |
| Worker accept/decline 後無通知 | Edward 不知道 worker 有沒有接 | 需加 Slack push 或手動查 Decisions History tab |
| Milestone 狀態變化無通知 | Edward 不知道 worker 何時交付 | 需加 Slack push 或定期查 admin |
| 合約雙方簽完無通知 | Edward 要手動查 admin Contracts | 需加 Slack push |
| 客戶付款無感知（路徑 D）| 付沒付全靠 worker ack | 靠 worker ack + Edward 追蹤 |
| 請款單自動寄送 | 需手動觸發 | 接 cron 或 milestone complete 自動觸發 |

---

## 四 · 缺口清單

### 開放用戶前必補（開放前必做）

| # | 缺口 | 嚴重度 | Owner | 工時估 |
|---|---|---|---|---|
| B-1 | **金流路徑拍板**（路徑 D vs 代收代付）| P0 | Edward 親口決定 | 決策 |
| B-2 | **terms.html 費率條款與 `commission-calc.ts` 對齊**（Tier 階梯 vs 金額階梯不一致，doc 32 §1.3）| P0 | 蘇菲 + 卡西法 | 半天 |
| B-3 | **Beta 字眼清除 + 收費條款正式化**（doc 32 §1.1）| P0 | 蘇菲 + 卡西法 | 半天 |
| B-4 | **Worker 申請後 client 發案後均缺 Edward 主動通知**（worker apply 無 push，client 發案有 Slack 但 worker accept/decline 無通知）| P0 | 卡西法 | 半天-1天 |
| B-5 | **Client 在環節 4（配對等待）缺少 status update**（發出邀請後 client 沒有反饋）| P0 | 卡西法 | 2-3 小時 |
| B-6 | **prod 部署步驟未完成**（SQL migration / Edge Function / Auth / ECPay keys，doc 35 G-1 至 G-6）| P0 | Edward | 30-45 分鐘 |
| B-7 | **合約 SLA 未定義**（雙方簽署超時無追催、milestone 驗收 7 天提醒機制）| P1 | 蘇菲 | 設計 + 實作各半天 |

### 上線後優化（soft launch 後第 1-2 週）

| # | 缺口 | 嚴重度 | Owner | 說明 |
|---|---|---|---|---|
| A-1 | Worker 上傳交付檔案前端入口確認（milestone-detail.html?role=worker）| P1 | 卡西法 | Beta 期 Edward admin 代操作亦可 |
| A-2 | Milestone 狀態變化 Slack push 給 Edward | P1 | 卡西法 | 重要但不阻擋上線 |
| A-3 | 合約雙方簽完 Slack push 給 Edward | P1 | 卡西法 | 同上 |
| A-4 | 請款單自動觸發（結案後 14 天 cron）| P1 | 卡西法 | 目前純手動，Beta OK |
| A-5 | NPS 7 天未填 reminder email | P1 | 卡西法 | 影響評鑑資料完整度 |
| A-6 | Worker ack 逾期（>48hr）自動 alert Edward | P1 | 卡西法 | 目前靠 Edward 手動追 |
| A-7 | 仲裁判決後金流補款自動化 | P2 | 卡西法 + 沙利曼 | Y1 人工處理可接受 |
| A-8 | 5 維配對 scoring 確認是否真跑（vs PostgREST direct query）| P1 | 卡西法 | early stage 只有 1 個 worker 影響小 |

---

## 五 · 一人營運節奏建議（Edward 參考）

PMF 階段每日最低維護量約 **15-30 分鐘**：

| 時間點 | 動作 | 工具 |
|---|---|---|
| 每天 10:00 | 開 admin.html 掃 Pending Workers tab + Client Intakes tab 有無新進 | admin.html |
| 每天 10:00 | 掃 Slack #移動城堡（或專案頻道）看有無 client intake Slack 通知 | Slack |
| 案件啟動時 | 確認雙方已簽約 + 付款指示已傳達 | admin.html + LINE |
| Milestone 節點 | 確認 worker 有沒有標 delivered、client 有沒有驗收 | admin.html |
| 結案時 | 手動觸發請款單 + 確認 worker 匯款 + mark 已收 | admin.html |
| 每週五 | 掃 admin NPS Reviews tab 看有無評鑑數據 | admin.html |

---

## 六 · 巡檢總結

**SOP 完整度評估：整體骨架已在、但通知 / 感知層有明顯缺口。**

作為一人營運者，Edward 現在需要主動「輪詢」5 個地方（admin.html 各 tab + Slack）才能知道全局狀態。在用戶量小（< 5 個並行案件）時可以撐得住，但要有心理準備：現階段沒有一個「一眼看清所有在跑案件狀態」的 dashboard 給 Edward。

**最大 3 個缺口（給主對話蘇菲摘要）：**

1. **金流路徑拍板懸空**（B-1）：代收代付 vs 路徑 D 這個決策沒落地，今天的 code 跟設計文件打架，開放用戶前 Edward 必須親口說用哪個。這個決策影響金流的每一個步驟怎麼寫。

2. **通知 / 感知層斷裂**（B-4 + B-5）：worker 申請後 Edward 不知道、worker 接案後 client 不知道、milestone 交付後 Edward 不知道——整條鏈靠 Edward 輪詢 admin 或靠 LINE 手動維繫。現在案件少還撐得住，一旦超過 3 個並行案件就會漏接。

3. **terms / 費率不一致**（B-2 + B-3）：conditions 還有 Beta POC 字眼 + 費率條款跟程式算的不同。正式開始抽佣的第一筆，worker 就會質疑「條款說 20% 你收了 23%」。這條比 code bug 更危險——是法律 + 信任問題。

---

*馬魯克 · PM / QA Lead · 2026-05-31*
*老師我把整條服務鏈的營運 SOP 打完了。骨架是在的——13 個環節都有系統支撐，金流、合約、milestone 的 code 都有。但通知那一層有明顯的洞，Edward 現在要主動輪詢才能知道有什麼在動。最大的三個問題列在最後一段，金流路徑那個是唯一純決策題，其他兩個是可以修的。*
