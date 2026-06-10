# 34 · 端到端技術串接實測 · 卡西法（CTO / Gate 1）

**作者**：卡西法（CTO · Gate 1 主責）
**日期**：2026-05-29
**觸發**：Edward 5/29 上線前最終確認「整條服務的資料流真的串得起來嗎」
**方法**：程式碼層資料流串接追蹤（每環節追上一環到下一環的資料接不接得上）+ 能跑的部分本地 Chrome MCP 實測
**現況前提**：還沒上正式站——新搬遷 SQL 沒跑、Supabase Auth email provider 沒設、金流函式沒 deploy 到 prod。所以每環節標明「通 / 待上線才能真跑」。
**紀律**：只讀 code + 寫本報告、沒改任何產品 code。整體 GO/NO-GO 留給馬魯克（我不自審我串的東西）。

---

## TL;DR

程式碼層：整條 20 環節資料流全部串得通，沒有孤兒資料、沒有接不上的斷點。馬魯克 5/29 早上 audit 標的 8 個 P0 斷點，code 層全部補完（金流閉環、領域鎖、admin 登入閘、scope-aware 里程碑、前端缺頁、退費 event 都進來了）。剩下的不是斷、是待上線才能真跑——4 個新 migration 要跑、Auth email provider 要開、Edge Function 要 deploy、Secret 要設。本地 Chrome 實測 5 個 user-facing 頁面全渲染、零產品 console error、admin 登入閘確實擋住未授權。

量化數據（PMF 漏斗）：每個環節都有落庫、admin 後台都看得到。漏斗 8 個關鍵數（註冊 / 發案 / 配對 / 簽約 / 完成 / NPS / 代收 GMV / 抽佣）全部撈得出來。唯一缺埋點：發案中途放棄(funnel drop-off) 沒記——只有送出成功進 client_intakes，半路跳掉的客戶查不到。這是 PMF 轉換率分析的盲點，標在第三節。

---

## 一 · 端到端資料流逐環節表（20 環節）

每環節：上一環產出什麼 / 流到哪 / 這一環接得上嗎。

| # | 環節 | 資料接點（上到下） | 載體（table / function） | 串接狀態 |
|---|---|---|---|---|
| 1 | 訪客到註冊 | OAuth/email magic link 到 auth.users 到 profiles row | bpAuth.signInWithGoogle / signInWithEmail（signInWithOtp）| 通 · 待開 email provider |
| 2 | 註冊到完整資料 gate | profiles 三欄 到 profile_complete(generated col) | bpProfile.get/updateRequiredFields · 20260529_profiles_required_fields.sql | 通（DB generated col + 前端雙保險）|
| 3 | 登入閘攔送出 | 未登入到存 draft 到 localStorage 到跳 sign-in.html?return= 到 resume 帶回 | IntakeSubmitModal（4 態 machine）· sign-in.html | 通（本地實測 OK）|
| 4 | 領域鎖 | worker_unified_v distinct verticals 到前端 chip enable/disable | bp_available_verticals() RPC · bpVerticals.getAvailableVerticals | 通 · 待建 RPC |
| 5 | 發案 | intake state 到 client_intakes INSERT(status=new) + delivery_scope flatten | bpClientIntake.submit · 20260529_client_intakes_delivery_scope.sql | 通 |
| 6 | AI 拆解 | brief 到 Claude 到 parsed tasks/tier 到 state.parsed | client-brief-parse Edge Function | 通 · 待 deploy + ANTHROPIC_API_KEY |
| 7 | 配對(5 維) | parsed + vertical 到 worker_unified_v 到 5 維 scoring 到 Top N | bpWorkers.queryByVertical(filter) + bpMatch.runForVertical(scoring) · match-workers | 通（兩段式 · 見第二節註）· 待 deploy |
| 8 | Slack 通知 + 內部配對 | client_intakes 到 match-workers 到寫 match_result 到 Slack Top 3 | notify-lead-slack 內部 call match-workers | 通 · 待 deploy + SLACK token |
| 9 | 邀請信 | admin 選 worker 到生 JWT(7d) 到 token_hash 寫 worker_decisions 到 Resend | bpAdmin.sendDecisionEmail 到 send-decision-email | 通 · 待 deploy + JWT_SECRET/RESEND |
| 10 | 接受/婉拒 | email link 到 JWT verify 到 worker_decisions.decided_at 到 302 redirect | worker-accept-decline 到 landing banner | 通 · 待 deploy |
| 11 | 簽約(PDF+簽名) | client_intake_id + worker_application_id 到 contracts + snapshot | generate-contract-pdf(pdf-lib) · contract.html · submit-signature | 通 · 待 deploy + Storage bucket |
| 12 | 里程碑(scope-aware) | contract.client_intake_id 到撈 delivery_scope 到 30/30/40(B 加上線確認) | seedDefaultMilestones(submit-signature 內) · contract_milestones | 通（雙方簽完自動 seed）|
| 13 | 履約 | milestone status machine + dispute_count 到自動仲裁觸發 | update-milestone-status · get-milestone-detail · milestone-detail.html | 通 · 待 deploy |
| 14 | 交付 | milestone 到 SHA-256 + 版本 + 外部連結 到 audit log | upload-deliverable / download-deliverable / add-external-link | 通 · 待 deploy + deliverables bucket |
| 15 | 驗收 | client approve/reject 到 dispute>=3 自動 arbitration | client-acceptance 到 trigger-arbitration · arbitration.html | 通 · 待 deploy |
| 16 | 評鑑(NPS) | 全 milestone approved + nps_invited_at 空 到雙方 JWT(14d) 到 nps.html | client-acceptance inline NPS invite · submit-nps · nps.html | 通 · 待 deploy |
| 17 | Tier 升降 | nps 到 recalc 到 nps_avg/count cache + tier_history | submit-nps 到 recalc-worker-tier | 通 · 待 deploy |
| 18 | 代收(綠界) | contract 到 amount(<=200K) 到 payment_intents 到綠界 CheckMacValue | create-ecpay-payment · payment_intents | 通 · 待 deploy + ECPay 3 key |
| 19 | 付款到抽佣記帳 | webhook RtnCode=1 到 status=paid 到自動 INSERT commission_records(client_paid) 到 recalc trigger 更新 contracts.client_paid_total_ntd | ecpay-webhook 到 insertClientPaidCommission | 通（馬魯克 P0-2 已補）· 待 deploy |
| 20 | 撥款 + 退費 | admin 標 worker_paid_out / refund_issued 到 recalc 到對帳完成 | mark-commission-event(5 event) · 20260529_commission_refund_event.sql | 通 · 待 deploy |

結論：20 環節 code 層 0 個真斷點。沒有上一環產出但下一環吃不到的孤兒資料。所有待上線都是函式/SQL/Secret 待上 prod，不是程式邏輯接不上。

---

## 二 · 馬魯克 5/29 audit 的 8 個 P0 vs 現況（code 層逐項驗）

| P0 | 馬魯克標的斷點 | code 層現況 | 我的判定 |
|---|---|---|---|
| P0-1 | admin.html 無登入閘 | AdminAuthWrapper 包 mount · Google OAuth + 寫死 email 白名單(edwardt0303@gmail.com，不從 query/cookie 讀)· 3 態(loading/forbidden/ok)· 本地實測未登入確實擋住、只顯示登入 gate | 已補 + 實測通 |
| P0-2 | ecpay-webhook 付款成功沒寫 commission_records | insertClientPaidCommission 已加 · RtnCode=1 後自動 INSERT client_paid · 冪等保護(查同 contract+reference_number)· 失敗 Slack 急報 + admin 可手動補 · recalc trigger 自動更新 contracts 累計 | 已補 |
| P0-3 | 發案領域靜態 15 個 vs 池子只 3 個 | bp_available_verticals() RPC + bpVerticals + Step1 動態 enable/disable · 當前選的不在池子自動切第一個有人的領域 · RPC 失敗 fallback 放行全部(不卡早期試用)· 走 Edward 拍的 Option A 動態 | 已補 |
| P0-4 | nps.html 是否存在 | 檔案存在 · client-acceptance inline 寄信指向它 | 檔案在 · 功能待 prod 驗 |
| P0-5 | arbitration.html + admin 仲裁 UI | arbitration.html 檔案存在 | 檔案在 · admin 仲裁 tab + 判決後金流動作待 prod 驗（見第四節）|
| P0-6 | Storage bucket contracts/deliverables | code 假設已建（upload-deliverable / generate-contract-pdf 用）| Edward 手動建（非 code 問題）|
| P0-7 | 綠界 3 個環境變數 | code 讀 ECPAY_MERCHANT_ID/HASH_KEY/HASH_IV，缺則 fail-fast | Edward 手動設（非 code 問題）|
| P0-8 | 13 個 migration 已跑 | working tree 有 4 個新 20260529 migration 未跑 | 待跑（非 code 問題）|

5/29 早上 8 個 P0：code 能解的(P0-1/2/3/4/5)都解了，剩 P0-6/7/8 是 Edward 手動上線動作。

### 註 · 環節 7 配對的兩段式設計（馬魯克 P1-3 答案）

馬魯克問前端到底有沒有真的跑 5 維 scoring。追完 code：有，但分兩段、有條件。

- 第一段 bpWorkers.queryByVertical：PostgREST 直查 worker_unified_v，只做 vertical filter（contains verticals），不算分。worker >= 3 個真人才 source=real，否則 fallback demo。
- 第二段 bpMatch.runForVertical：只在有 state.parsed（客戶過 AI 拆解）時才觸發，真打 match-workers Edge Function 跑 5 維 scoring（tier/capacity/domain/L_score/mercy），回 breakdown + why，蓋掉第一段的 placeholder 分數（75 + L_score*2）。

含意：客戶若沒跑 AI 拆解、或池子 < 3 真人 / 看到的是 placeholder 分數，不是真 5 維。PMF 早期池子小，這條 fallback 很常走到。不是 bug、是 graceful degradation，但要知道 Step 4 顯示的分數不保證都是 5 維算出來的。標為技術觀察、非斷點。

---

## 三 · PMF 量化數據可記錄現況（漏斗 8 數 × 落庫 × admin 可見性）

Edward 要的之後可查可算——逐項確認每個環節有沒有落庫 + admin 撈不撈得到。

| PMF 漏斗指標 | 落庫位置 | 怎麼算 | admin 可見性 |
|---|---|---|---|
| 註冊數 | profiles（auth.users 對應）| count(profiles) | 可查（admin RLS sees all）|
| 完整資料完成率 | profiles.profile_complete(generated) | count(true) / count(*) | 可查 |
| 發案數 | client_intakes(status=new)| count + group by vertical / delivery_scope | Admin Console Client Intakes tab |
| 配對數(有結果) | client_intakes.match_result(jsonb) + matched_at | count(matched_at not null) | 可查 |
| 邀請/接受/婉拒 | worker_decisions(decision + decided_at) | group by decision | Admin Console Decisions History tab |
| 簽約數 | contracts(status + signed)| count by status | Admin Console Contracts tab |
| 完成數(全 milestone approved) | contract_milestones.status + contracts.nps_invited_at | count(nps_invited_at not null) | 可查 |
| NPS | nps_responses(0-10) + worker_applications.nps_avg/count cache | avg / group by role | 可查（cache 欄 + 明細）|
| 代收 GMV | commission_records(client_paid) + contracts.client_paid_total_ntd(trigger 累計) | sum(client_paid) | Admin Contracts 金流看板 |
| 抽佣收入 | commission_records(commission_collected) + contracts.commission_collected_total_ntd | sum(commission_collected) | 可查 |
| Tier 分布變化 | worker_applications.tier_history(jsonb) + tier_suggestion | group by tier · 時序看 tier_history | 可查 |
| 交付邊界分布(A/B) | client_intakes.delivery_scope | group by delivery_scope | 可查（5/29 新 flatten 欄）|

### 缺埋點（PMF 盲點 · 標給蘇菲/蕪菁頭決定要不要補）

| 缺的數 | 為什麼缺 | 影響 | 建議 |
|---|---|---|---|
| 發案漏斗 drop-off | 只有按送出成功才進 client_intakes · Step 01 到 04 半路跳掉的客戶完全沒記 | 算不出 100 人開始發案、幾人走到送出的轉換率——PMF 最關鍵的 funnel 數據 | 加前端 step 進度埋點（GA event 或輕量 funnel_events table）· 非上線 blocker、但 PMF 分析必要 |
| AI 拆解觸發 vs 完成 | client-brief-parse 是 stateless · 沒記誰拆解過、拆幾次 | 算不出 AI 拆解到配對的轉換 + 不知 Anthropic 成本歸屬到哪個 intake | 上線後第 1 週補（配 P1 IP 限流一起做）|
| 配對展示到送出的轉換 | Step 4 看到配對但沒送出的 session 沒記 | 不知看到配對結果對送出的影響 | 同 drop-off 一起補 |
| 登入成功率 | Supabase Auth 後台有，但沒匯進自家看板 | 低優先 · Supabase dashboard 可看 | 不急 |

一句話：結果型數據（已發案/已簽約/已付款/NPS）全部記得到、admin 看得到。缺的是過程型漏斗數據（誰半路跳了）。這是 PMF 轉換率優化的盲點，不是上線 blocker。

---

## 四 · 技術斷點清單（依嚴重度 · 全部是待上線非程式斷）

### 上線前必做（Edward / 蘇菲手動 · 非 code）

| # | 項目 | 動作 | owner |
|---|---|---|---|
| D1 | 4 個新 migration 沒跑 | Supabase SQL Editor 跑 20260529_profiles_required_fields / bp_available_verticals / client_intakes_delivery_scope / commission_refund_event | Edward/蘇菲 |
| D2 | Supabase Auth email provider 沒開 | Dashboard 到 Auth 到開 Email provider（magic link 才通、否則 signInWithEmail 死）| Edward |
| D3 | Edge Function 沒 deploy prod | working tree 改了 9 個 function（含 ecpay-webhook 金流閉環、match-workers、profile/vertical 相關）· deploy 後才生效 | 蘇菲(CLI)|
| D4 | 5 個 Secret | JWT_SECRET / ANTHROPIC_API_KEY / RESEND_API_KEY / SLACK_BOT_TOKEN / ECPay 3 key 確認都在 | Edward |
| D5 | Storage bucket | contracts + deliverables 兩個私有 bucket 手動建 | Edward |

### 技術觀察（非斷點 · 上線後追）

| # | 觀察 | 風險 | 建議 |
|---|---|---|---|
| T1 | commission_records 無 DB unique 約束 | webhook 只做軟冪等（查 contract+reference_number），DB 層沒擋 · 極端情況（冪等查詢 timeout + 綠界重送）可能雙寫 client_paid | 加 partial unique index (contract_id, event_type, reference_number) where event_type=client_paid · 上線後第 1 週 |
| T2 | 配對 5 維有條件觸發 | 池子 < 3 真人 或 客戶沒過 AI 拆解 / 顯示 placeholder 分數非真 5 維（見第二節註）| PMF 早期正常 · 文案已標過往案例參考 · 池子大了自然走真 5 維 |
| T3 | arbitration 判決後金流無自動化 | decide-arbitration 寫 verdict_decision，但 partial_pay / contract_terminate 後續款項動作要 admin 手動 mark-commission-event | Beta 量小手動 OK · 規模化再自動化 |
| T4 | worker-accept-decline 走 GET | email link 點擊用 GET，理論上爬蟲/email preview 可能誤觸 accept | 加中間確認頁（GET 到 POST）· P1 非急 |
| T5 | client-brief-parse / worker-ai-interview 無 IP 限流 | 公開 endpoint 被連打 / Anthropic 費用失控 | 加 Deno KV IP 限流 · 上線後第 1 週（沙利曼 P1）|
| T6 | 發案 drop-off 無埋點 | PMF 轉換率算不出（第三節）| 補 funnel 埋點 |
| T7 | 金流結構待 Edward 拍板（沙利曼 doc 32）| 現有 ecpay-webhook 是代收代付（平台持全額）· doc 18 既定是路徑 D（平台不碰錢）· 兩者打架 | 這是法律/商業判斷、不是技術斷點 · 我只報 code 跑代收代付這個事實 · 拍哪條留沙利曼+Edward |

T7 重要：技術上 ecpay-webhook 代收代付路徑跑得通、帳算得對。但沙利曼 doc 32 標了這跟既定法律策略(路徑 D)相反。技術可行不等於該用這結構正式收費——這個分叉我不替 Edward 拍，留沙利曼 Gate 5 + Edward。

---

## 五 · 本地 Chrome MCP 實測（能跑的部分 · v3.4 smoke）

本地無 prod Supabase env，所以驗的是前端渲染 + JS 無爆錯 + bp namespace 全載 + 登入閘擋得住。DB 互動的真跑要等上線。

| 頁面 | 渲染 | 產品 console error | 關鍵驗證 |
|---|---|---|---|
| landing.html | 渲染 OK（h1 + 全文 8032 字）| 0 | 行銷頁不載 supabase（預期）|
| app.html?role=client | Step UI 渲染 | 0（5 條 exception 是 Chrome 擴充噪音 message channel closed，非產品）| 8 個 bp namespace 全載成 object · supabase client init OK |
| app.html?role=worker | 渲染 OK | 0 | bpWorkerApply + bpAiInterview 載入 |
| admin.html（未登入）| 只顯示登入 gate | 0 | hasAdminTabs=false · 請用授權帳號登入 · noindex meta 在 / P0-1 登入閘實測擋住 |
| sign-in.html?role=client | 渲染 OK | 0 | Google OAuth + email magic link + role toggle + bpAuth 載入 |

Smoke 結論：5 個 user-facing 頁面零白屏、零產品 console error、admin 登入閘確實擋未授權。唯一噪音是瀏覽器擴充的 message-channel 訊息（非產品 code）。

註：Claude Preview MCP 對 app.html（in-browser Babel 編譯 6700+ 行 JSX）會 render timeout，改用 Chrome MCP 跑（較穩）· 已記為 preview 工具限制、非產品問題。

---

## 六 · 給馬魯克的交接（你做 GO/NO-GO · 我不自審）

我串接實測的事實：

1. 20 環節 code 層全通、0 真斷點、0 孤兒資料 · 你 5/29 早上標的 P0-1 到 P0-5（code 能解的）全補完
2. 剩 D1-D5 是 Edward/蘇菲手動上線動作（跑 SQL / 開 email provider / deploy function / 設 secret / 建 bucket）· 不是程式問題
3. 量化數據結果型全記得到、admin 看得到 · 缺的是過程型 funnel drop-off 埋點（T6）· 非上線 blocker
4. 7 個技術觀察(T1-T7) · 都是上線後追、不是擋上線 · 其中 T7 金流結構是法律/商業分叉、留沙利曼+Edward
5. 本地 smoke 5 頁全綠 + admin 登入閘實測擋得住

我的串接判定：code 層 ready、上線動作（D1-D5）做完就能跑通一個真實案。但整體 GO/NO-GO（含 prod 真跑 e2e、金流結構拍板、Gate 5 信任關）是你 + 沙利曼 + Edward 的事，我不自審我串的東西。

---

*34 號報告 · 卡西法 · 2026-05-29 · 端到端技術串接實測 · 程式碼層追蹤 + 本地 Chrome smoke · 20 環節 0 真斷點 · 8 P0 code 層全補 · 量化數據結果型全可撈、缺 funnel drop-off 埋點 · 上線剩 5 個 Edward/蘇菲手動動作*
