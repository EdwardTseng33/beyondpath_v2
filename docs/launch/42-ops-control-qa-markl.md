# 42 · 營運者掌控視角 QA + 流程細節檢查 · 馬魯克

**作者**：馬魯克（PM / QA Lead · Sonnet 4.6）
**日期**：2026-05-31
**觸發**：Edward 5/31「仔細檢查每個流程細節」+「營運者能確實支援、觀察、獲得通知」
**依據**：
- `docs/launch/37-operations-sop-markl.md`（doc 37 · 整條服務鏈 SOP）
- `supabase/functions/_shared/notify-edward.ts`（4 事件 email 實作）
- `supabase/functions/notify-lead-slack/index.ts`（Slack 通知實作）
- `supabase/functions/worker-accept-decline/index.ts`（worker 接拒流程）
- `docs/launch/38-trust-review-sop-suliman.md`（沙利曼信任盤點）
- `docs/launch/36-pmf-quantification-turnip.md`（蕪菁頭 PMF 儀表板）
- `docs/launch/32-go-live-billing-spec.md`（金流正式收費 spec）
- `docs/launch/33-service-flow-audit-markl.md`（5/29 整條鏈盤點）
**紀律**：只讀 code/docs + 寫本 doc，不碰 code（卡西法另一路在實測）

---

## 0 · 一頁懂（給 Edward 先讀）

| 視角 | 現況 | 一句話 |
|---|---|---|
| **通知層** | 🟡 4 個事件有 email，但 5 個關鍵事件沒有 push | 知道「新申請 / 發案 / 交付 / 簽完」，但不知道「worker 接拒 / 付款到帳 / 仲裁發起 / 抽佣逾期 / 配對 0 結果」|
| **觀察層** | 🟡 後台 5 個 tab 有，但缺「一眼全局」dashboard | 能查到個別案件，但沒有「現在有幾個案在跑、哪個卡住」的總覽 |
| **支援層** | 🟡 基本工具到位，但幾個決策時刻缺資訊 | 能 approve/reject/判仲裁，但 worker 婉拒理由、付款確認、爭議脈絡不夠清楚 |
| **流程細節** | 🟡 骨架完整，文案好，但 5 個斷點會讓用戶困惑 | SLA 有承諾、超時提醒沒做、client 在等待期缺乏更新、空白狀態文案不足 |

**最該補的 3 件**（詳見第五節）：
1. **worker 接拒後通知 Edward**（現在這個事件沒有 push，Edward 不知道 worker 決定了）
2. **admin 加等待時間排序 + 超時紅燈**（承諾了 SLA 但沒機制保證做到，半小時可補）
3. **client 在「邀請已發 → worker 決定前」的等待期加一條狀態更新通知**（現在 client 完全不知道進度）

---

## 一 · 通知層 QA（notify-edward 4 事件 + 缺口）

### 1.1 現有 4 個事件（已補，OK）

`supabase/functions/_shared/notify-edward.ts` 實作了 4 個事件，呼叫路徑確認：

| 事件 | `EdwardEventType` | 觸發函式 | 狀態 |
|---|---|---|---|
| Worker 新申請 | `worker_apply` | `notify-lead-slack/index.ts` L.1140 | ✅ 已接通 |
| Client 新發案 | `client_intake` | `notify-lead-slack/index.ts` L.1159 | ✅ 已接通 |
| Milestone 交付 | `milestone_delivered` | `upload-deliverable/index.ts` L.375 | ✅ 已接通 |
| 合約雙方簽完 | `contract_signed` | `submit-signature/index.ts` L.411 | ✅ 已接通 |

email 包含「Next」行動指引 + 「Open admin (Tab)」按鈕，格式乾淨。Resend fail-soft（key 未設則 silent skip，不阻主流程）。

### 1.2 缺口：以下 5 個事件 Edward 收不到通知

| # | 缺口事件 | 為什麼重要 | 嚴重度 |
|---|---|---|---|
| **N-1** | **Worker 接受 / 婉拒** | `worker-accept-decline/index.ts` 掃過：只更新 DB status，無任何 push。Edward 不知道 worker 決定了→只能輪詢 admin Decisions History tab。**worker 婉拒後 Edward 要重派，每晚一個小時就晚一個小時回 client** | 🔴 必補 |
| **N-2** | **付款到帳（路徑 D）** | 路徑 D 下，client 轉帳給 worker，唯一感知路徑是 worker 登入平台點「已收款 ack」。若 worker 沒 ack，Edward 完全不知道付款狀態。doc 37 §7 已點出，但系統層沒有 fallback alert | 🔴 必補 |
| **N-3** | **仲裁發起**（第 3 次退件自動觸發）| `trigger-arbitration` Edge Function 有呼叫，但掃程式碼沒見到觸發後 `notifyEdward`。仲裁被觸發但 Edward 沒收到通知→案件卡住→雙方等 Edward 判決，沒人告訴他要判 | 🔴 必補 |
| **N-4** | **配對 0 結果**（空領域發案）| client 選到沒有 worker 的領域，走完發案→Step 4 出 demo 假結果→Edward 收到 Slack intake 通知，但 Slack 通知裡看不出「這是一個配不到人的空配對」。Edward 回了 Slack 卻找不到可邀請的 worker，浪費往返 | 🟡 重要 |
| **N-5** | **抽佣收款逾期（>14 work days）** | doc 37 §7.4 明確說「系統目前無自動追催」，純靠 Edward 記得。Y1 案件少可撐，超過 5 個並行案就有漏帳風險 | 🟡 重要 |

### 1.3 通知完整性評分

現有 11 個關鍵事件點（含雙邊流程），4 個有通知，5 個確認沒有，2 個待確認（worker ack 收款後是否有 Edward 通知）。
**通知覆蓋率：約 36%，明顯不足。**

---

## 二 · 觀察層 QA（admin 後台全局視野）

### 2.1 現有 admin.html 5 個 tab 功能確認

| Tab | 功能 | 缺口 |
|---|---|---|
| Pending Workers | 看申請 + AI proof + audit flags + Approve/Reject | 無「等待天數」欄，無超時紅燈（沙利曼 38 §3.3 已指出）|
| Client Intakes | 看 brief + Run Match + Send Invites | 無「距發案幾天」欄，24h SLA 無兜底 |
| Decisions History | 看 worker accept/decline 結果 | 有，但是**被動查詢**，沒有事件 push → 發現時已晚 |
| Contracts | 簽約狀態 + milestone + 金流 + 仲裁 + commission | 功能最豐富，但 milestone 狀態變化無主動 push（doc 37 §8）|
| Arbitration | 仲裁案件列表 + 判決（已實作 ArbitrationTab）| 有 tab，但仲裁發起時 Edward 無主動通知 |

**verdict**：5 個 tab 的資訊是**完整的**，問題不是「看不到」，是「沒有人告訴 Edward 要去看」。

### 2.2 缺口：沒有「全局狀態總覽」

現在 Edward 要了解全局，需要依序開 5 個 tab 掃。沒有一個畫面能同時看到：
- 目前有幾個案件在跑 + 各在哪個階段
- 哪些已超時等待（worker 沒接、milestone 沒交付、client 沒驗收）
- 哪些案件需要 Edward 動作（待派邀請、待判仲裁、待寄請款單）

這對「1 人營運，每天 15-30 分鐘」的場景是真實痛點。doc 36 蕪菁頭設計的「每週儀表板 5 分鐘看一張表」有規劃，但尚未整合進 admin.html。

### 2.3 全局缺口具體清單

| 缺口 | 位置 | 影響 |
|---|---|---|
| **O-1** 無全局進行中案件看板 | admin.html 無 Dashboard tab | 超過 3 案並行就容易漏接 |
| **O-2** 無「待 Edward 動作」聚合 | 無法一眼知道「這 3 件要我決定」| 每天開後台需掃 5 tab 才能知道有無待辦 |
| **O-3** 無等待天數 + 超時紅燈 | Pending Workers / Client Intakes | 沙利曼 38 §3.3 已點名，必補 |
| **O-4** 無 milestone 交付到期預警 | Contracts tab 無 due_date 倒數 | 不知道 worker 是否快要 miss deadline |
| **O-5** 無金流異常快速警示 | commission_records 無異常 alert | 逾期抽佣無醒目紅燈 |

---

## 三 · 支援層 QA（Edward 介入時的工具與資訊）

Edward 的介入點有 5 個：worker 覆核、配對確認、合約生成、仲裁判決、請款標記。逐一檢查：

### 3.1 Worker 覆核（Pending Workers tab）

**Edward 有什麼**：AI proof + L_score + skill matrix + audit flags（紅/橘/灰排序）+ approve/reject/need_more_info 按鈕 + admin_notes 欄位。

**缺口**：
- **S-1** 沒有「覆核 Rubric」（沙利曼 38 §2.2）：什麼分數該 approve、幾個 audit flag 可忽略、need_more_info 要問什麼問題——這些只在 Edward 心裡，無法交接，也無法給被拒者說明理由。

### 3.2 配對確認（Client Intakes tab）

**Edward 有什麼**：Run Match 跑 5 維算法（或 PostgREST 直查，doc 33 P1 待確認）+ Top 3 候選卡 + 可自定配對權重（Settings tab，localStorage 持久）+ Send Invites + 自定訊息。

**缺口**：
- **S-2** Match 結果沒有告訴 Edward「這個 brief 的配對信心度」——3 個候選都是低匹配（match score 60 分以下）時，Edward 無法快速判斷「要送邀請還是回 client 說無合適人選」
- **S-3** 配對是空集合（空領域）時，admin 介面沒有明確提示「此案無可邀請 worker，建議人工路線」

### 3.3 仲裁判決（Arbitration tab）

**Edward 有什麼**：ArbitrationTab 已實作（admin.jsx L.1219），列出所有仲裁案件，`decideArbitration` 函式可選 verdict_decision。

**缺口**：
- **S-4** 仲裁發起時 Edward 無主動通知（同 N-3），可能遺忘判決
- **S-5** 仲裁判決後，金流補款（partial_pay）或終止（contract_terminate）目前只改 `verdict_decision` 欄位，**沒有自動執行**——Edward 需要手動通知雙方付補款或退款，且系統沒有指引流程說明

### 3.4 請款單 / 抽佣（Contracts tab → Commission）

**Edward 有什麼**：`mark-commission-event` 按鈕（標 commission_collected）+ `send-commission-invoice` 按鈕（手動觸發請款單 PDF）+ `commission_amount_ntd`（應收）vs `commission_collected_total_ntd`（已收）欄位對帳。

**缺口**：
- **S-6** 結案後 14 work days 無自動提醒請款——需 Edward 自己記得手動點
- **S-7** worker 匯款後無系統確認機制——靠 Edward 手動去銀行 app 看，再回來 admin 點標記

---

## 四 · 流程細節 QA（業務視角，每環節）

### 4.1 文案與時間預期

| 環節 | 文案現況 | 問題 |
|---|---|---|
| Worker 申請確認 | 「24h 內 AI 初步回覆、3-7 天人工覆核」、「72h 沒收到來提醒」| 沙利曼 38 §3.1 已確認已做，好。**但 3-7 天承諾沒機制兜底（38 §3.2）** |
| Client 發案確認 | 「24h 內 Edward 確認配對並與你聯繫」| 文案已做，**但 24h SLA 比 worker 的 3-7 天更緊、更該有超時提醒** |
| 發邀請後 client 等待 | 「我們已找到合適的專家，專家正在確認檔期，24小時內會有確認結果」| **doc 37 §4 指出這條通知「目前 code 中未見」——缺失** |
| Worker 接案確認 | 「已確認接案，合約準備中」| 已做 |
| Worker 婉拒確認 | 「已記錄，謝謝你的回覆」| 已做。但 **client 在 worker 婉拒後沒有通知**（doc 37 §5）|
| 簽約等待對方 | `contract.html`：「對方已/尚未簽署」即時顯示 | 已做 |
| Milestone 驗收 7 天超時 | 「7 天默認自動通過」邏輯已做 | 用戶是否看得到「7 天後自動通過」倒數？ **文案有說 7 天但沒有倒數顯示** |
| NPS 邀請 | email 已做 | 7 天未填無 reminder（doc 37 §11） |

### 4.2 狀態顯示清晰度

| 位置 | 問題 |
|---|---|
| Step 04 配對展示 | `source: demo` 標注「案例展示」，用戶不一定理解代表「沒有真人」（doc 33）——需要更明確的文案「目前此領域 worker 累積中，以下為案例參考」 |
| 發案後等待 | 送出 brief 後的「等待畫面」狀態是靜態的，無任何進度感知（像送出後掉進黑洞）|
| 合約生成等待 | 合約 PDF 生成期間（秒級）用戶會不會看到 loading 狀態？ |
| Milestone 交付後 | Worker 標「已交付」後，client 看到的狀態是否立刻更新？或需刷新？ |

### 4.3 空狀態 / 錯誤 / 極端值

| 情境 | 現況 | 問題 |
|---|---|---|
| 空領域發案 | Step 04 fallback demo 資料，label「案例展示」| 文案不夠清楚，用戶易誤解為真實配對（缺口 F-1）|
| Worker 申請重複 email | DB unique constraint 已擋，但前端顯示 raw DB 23505 error（沙利曼 38 §1.2 洞 C）| 前端友善錯誤訊息缺失（F-2）|
| 連續 3 次退件 | 自動觸發仲裁，email 雙方通知 | 是否有中文清楚說明「已進入仲裁」+ 接下來怎麼做？ |
| 超過 3 次退件後，client 再點「退件」| 系統應攔截，但 UX 流程有沒有清楚說明「此 milestone 已在仲裁中，無法再退件」？ |
| NPS 連結 7 天後過期 | 未確認 JWT 是否有 exp 設定 | 若 exp 設 7 天，用戶 8 天才點就 404，沒有友善提示 |
| 合約 PDF 生成失敗 | Edge Function error 500 | 用戶看到什麼？需確認 friendly error classifier 是否覆蓋此情境 |

### 4.4 雙邊體驗斷點（最影響信任的 5 個）

| # | 斷點位置 | Client 體驗 | Worker 體驗 | Edward 體驗 |
|---|---|---|---|---|
| **BP-1** | 邀請發出 → worker 決定前 | 完全沒收到任何更新，不知道進度（最大斷點）| 收到邀請 email，流程清楚 | 收到 intake 通知，但不知道 worker 是否看到邀請 |
| **BP-2** | Worker 婉拒後 | 不知道 worker 婉拒了，繼續等 | 婉拒成功確認 | 不知道（N-1 缺口）|
| **BP-3** | 簽約金轉帳後（路徑 D）| 轉帳了但不確定對方收到沒 | 收到錢後需主動登入 ack | 靠 worker ack 得知 |
| **BP-4** | Milestone 交付後 | 不確定何時收到「可驗收」通知 | 標完「已交付」後不知道 client 何時會看 | 收到 email 通知，但只要看 admin milestone tab |
| **BP-5** | 仲裁判決後 | 不確定接下來金流怎麼處理 | 同左 | 判了但沒有系統指引後續補款 / 退款流程 |

---

## 五 · 缺口分級

### 5.1 上線後必補（影響核心信任 / 可能造成流程卡死）

| # | 缺口 | 說明 | 嚴重度 | Owner | 估時 |
|---|---|---|---|---|---|
| **M-1** | **Worker accept/decline 後主動通知 Edward** | 補 `notifyEdward("worker_decision", ...)` 呼叫在 `worker-accept-decline/index.ts`。內容：worker 名 + 決定（接/婉拒）+ case 摘要 + Admin tab 連結 | 🔴 必補 | 卡西法 | 1-2 hr |
| **M-2** | **仲裁發起後通知 Edward** | `trigger-arbitration/index.ts` 補 `notifyEdward("arbitration_triggered", ...)` 呼叫（需擴充 `EdwardEventType`）| 🔴 必補 | 卡西法 | 1-2 hr |
| **M-3** | **admin 超時排序 + 等待天數紅燈** | Pending Workers / Client Intakes tab 加「距申請/發案 N 天」欄，> 3 天橘，> 5 天（或 > 1 天 for client）紅，預設按等待時間排序。純前端，計算 `created_at` 差 | 🔴 必補 | 卡西法 | 0.5 hr |
| **M-4** | **邀請已發後 client status update** | 「邀請已發出，worker 正在確認（通常 24 小時內）」的系統 email 或 app 內通知給 client | 🔴 必補 | 卡西法 | 2-3 hr |
| **M-5** | **Worker 婉拒後 client 通知** | worker decline 後，系統自動寄 email 給 client：「此 worker 暫時無法配合，我們正在為你安排替代方案，24 小時內更新」| 🔴 必補 | 卡西法 | 1-2 hr |
| **M-6** | **Worker 覆核 Rubric**（一頁 doc）| approve / reject / need_more_info 的判準白紙黑字，可引用可交接。不是 code，是一份 doc | 🟡 必補 | 蘇菲 + Edward | 0.5 hr |

### 5.2 上線後 1-2 週優化（重要但不阻 Day 1）

| # | 缺口 | 說明 | 嚴重度 | Owner |
|---|---|---|---|---|
| **A-1** | **Worker ack 收款後通知 Edward**（N-2）| `worker-ack` 函式補 Slack push + email 給 Edward | 🟡 | 卡西法 |
| **A-2** | **配對 0 結果文案明確化**（N-4 + F-1）| Step 04 空配對時，文案改為「此領域目前 worker 累積中，以下為案例參考，Edward 將人工協助媒合」 | 🟡 | 蘇菲 + 卡西法 |
| **A-3** | **仲裁判決後流程指引**（S-5）| 判決完成後，admin 顯示「接下來你需要做的事：通知 X 補款 NT$ Y / 退款 NT$ Z」操作提示 | 🟡 | 卡西法 |
| **A-4** | **Milestone due_date 到期預警**（O-4）| Contracts → Milestones tab 加「截止 N 天」倒數顯示，< 3 天標橘，< 1 天或已過標紅 | 🟡 | 卡西法 |
| **A-5** | **抽佣逾期自動提醒**（N-5 + S-6）| 結案後 14 work days cron：掃 `commission_records` 無 `commission_collected` 的合約→Slack/email ping Edward | 🟡 | 卡西法 |
| **A-6** | **Worker 重複申請友善錯誤訊息**（F-2）| 前端把 23505 DB error 翻成「你已用此 email 申請過了，結果將寄到信箱 / 有問題寄 hello@beyondpath.tw」| 🟢 | 卡西法 |
| **A-7** | **NPS 7 天 reminder**（doc 37 §11）| 結案後 7 天無填寫→送第二封 NPS 提醒 email | 🟢 | 卡西法 |
| **A-8** | **admin 全局 Dashboard tab（O-1 + O-2）**| 進行中案件 + 待 Edward 動作清單（配合 doc 36 每週儀表板設計）| 🟢 | 卡西法 |

---

## 六 · 通知覆蓋率補充對照表

列出整條鏈 11 個事件點，標記通知狀態（讓 Edward 一眼知道哪些有、哪些沒有）：

| 事件 | Edward email | Slack push | Client email | Worker email | 狀態 |
|---|---|---|---|---|---|
| Worker 新申請 | ✅ notify-edward | ✅ notify-lead-slack | ✅ ack email | — | 完整 |
| Client 新發案 | ✅ notify-edward | ✅ notify-lead-slack | ✅ ack email | — | 完整 |
| Edward 發邀請後（client 等待期）| — | — | ❌ 缺 | ✅ 邀請信 | 缺 client 更新（M-4）|
| Worker 接受 | ❌ 缺 | ❌ 缺 | ❌ 缺 | ✅ 確認頁 | 三方都缺（M-1 + M-5）|
| Worker 婉拒 | ❌ 缺 | ❌ 缺 | ❌ 缺 | ✅ 確認頁 | 三方都缺（M-1 + M-5）|
| 合約雙方簽完 | ✅ notify-edward | — | — | — | Edward 有，雙方用戶靠 contract.html 即時顯示 |
| 付款到帳（worker ack）| ⚠ 待確認 | — | ⚠ 待確認 | ✅ ack 後系統 email | 部分缺 |
| Milestone 交付 | ✅ notify-edward | — | ⚠ client 收到「待驗收」？待確認 | — | client 通知待確認 |
| Client 驗收通過 | — | — | ✅ 驗收確認 | ✅ 驗收通過 | OK（Edward 不需介入）|
| 仲裁發起 | ❌ 缺 | — | ✅ 仲裁通知 | ✅ 仲裁通知 | Edward 通知缺（M-2）|
| NPS 觸發 | — | — | ✅ NPS 邀請 | ✅ NPS 邀請 | OK（Edward 不需介入）|

---

## 七 · 一人營運日常建議（補充 doc 37 §5）

doc 37 §5 的節奏建議（每天 10:00 掃 admin + Slack）在 M-1 ~ M-3 補完前的 **過渡期操作 SOP**：

| 時間點 | 動作 | 說明 |
|---|---|---|
| 每天 10:00 | Pending Workers tab → 看「等待超過 3 天」的申請（手動看 created_at）| 超時提醒未補前人工管 |
| 每天 10:00 | Client Intakes tab → 看「等待超過 24hr」的 brief | 同上 |
| 收到 intake Slack 通知後 | 在 Decisions History tab 查這筆 intake 是否已有 worker 決定 | 因為 worker accept/decline 無主動 push |
| 每日 | 看 Contracts tab → Milestones 有無 worker 標「delivered」尚未驗收 | milestone 交付 Edward 有 email，但驗收等待用 admin 確認 |
| 每週一 | 對照上週案件清單，確認是否有 commission 未收（>14 work days 無 ack 的）| 逾期提醒未補前人工管 |

---

## 八 · 巡檢結論

**整體評分**：65 / 100

| 維度 | 分數 | 說明 |
|---|---|---|
| 通知層 | 55 | 4 事件已補，5 關鍵事件沒有 push，覆蓋率 36% |
| 觀察層 | 65 | 5 tab 資訊完整，但缺全局視野 + 超時紅燈 |
| 支援層 | 70 | 核心工具到位，仲裁後流程 + 抽佣提醒是痛點 |
| 流程細節（文案）| 75 | 文案整體品質好，7 個斷點可以改善 |
| 流程細節（極端值）| 60 | 空領域 / 重複申請 / 仲裁後流程需補 |

**一句話**：骨架完整、通知層是最大缺口。現在如果超過 3 個並行案件，Edward 必然會漏接某個事件。補完 M-1 至 M-5 之後，日常維護量可以降到真正的「15-30 分鐘」。

---

*馬魯克 · PM / QA Lead · 2026-05-31*
*老師我把通知層、觀察層、支援層、流程細節都過了一遍。發現 4 個 email 事件已做得不錯，但整條鏈上有 5 個事件完全沒有 push。最危險的是「worker 接拒後 Edward 不知道」——這個事件是整條鏈的關鍵轉折點，空缺了會讓 Edward 在等一個已經決定的答案。三個最重要的補項列在第 0 節，其他都放在第五節清單了。*
