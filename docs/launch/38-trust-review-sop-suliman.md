# 38 · 信任 / 審核 / 防濫用機制盤點 · 沙利曼

> **作者**：🧙‍♀️ 沙利曼 · Head of Trust & Infrastructure
> **日期**：2026-05-31
> **觸發**：Edward（營運者視角）——「有人亂寫怎麼辦、有沒有認證機制、審核時間多久、審核中有沒有提示用戶、防呆夠不夠」
> **範圍**：註冊防濫用 / worker 認證機制 / 審核 SLA + 用戶提示 / 資料防呆安全面
> **依據**：doc 26（身分認證研究）、doc 28（PMF 帳號 + 安全需求單）、doc 12（audit flags）、doc 33 + 35（service flow audit）、doc 36（PMF 量化）、`worker.jsx` / `app2.jsx` / `supabase.js` / `worker-ai-interview` Edge Function / `001_initial_schema.sql` 等實際 code
> **紀律**：只讀 code + docs、只寫本 doc、不碰產品檔（卡西法在動前端 cache-buster）
> **重要**：底線建議、非正式法律意見。

---

## 0 · 給 Edward / 蘇菲先讀（一頁懂）

你問的四件事，現況各打幾分：

| 你問的 | 現況 | 一句話 |
|---|---|---|
| **亂寫 / 假人擋不擋得住？** | 🟡 七成擋得住 | email verified + 電話必填 + AI 訪談自吹偵測 + 你人工覆核——擋掉「明顯亂寫」沒問題。**但「同一人灌大量假發案」這個洞沒堵**（client 發案無重複防護、無頻率限制）|
| **有沒有認證機制？完不完整？** | 🟢 完整 | worker 走「申請 → AI 七段訪談 → 自動產能力卡 + audit flags 自吹偵測 → 你人工覆核 approve/reject」。狀態機六態齊全。**機制完整、就缺一個白紙黑字的「覆核標準」**（你心裡有、但沒寫下來、換人/未來自動化會飄）|
| **審核多久？審核中有沒有提示用戶？** | 🟢 出乎意料地好 | worker / client 兩端**都已經有審核提示**——文案寫了「24h AI 初步回覆、3-7 天人工覆核、結果寄 email、72h 沒收到來提醒不會掉案」。**但這是「承諾」、現在沒有任何機制保證你真的 3-7 天內做完**（純靠你記得） |
| **防呆夠不夠？** | 🟡 前端夠、後端有兩個破口 | 前端必填 + 格式驗證做得不錯。**破口一**：client 發案可被同一人重複灌爆（無 dedupe / 無頻率限制）。**破口二**：燒 token 的兩支 AI 函式還沒上 IP 限流（有人狂打 = Anthropic 帳單失血）|

**verdict（給 Edward）**：你問的「審核提示」這塊——好消息，**已經做了、而且做得比我預期好**。真正的洞不在「提示」、在「**承諾了 3-7 天但沒機制兜底**」+ 「**假發案能零成本灌爆**」+ 「**燒錢函式沒上鎖**」這三件。前兩件是開放用戶前該補的營運洞、第三件是省錢的硬防線。**不是裸奔、但有三個沒人盯的破口。**

---

## 1 · 註冊防濫用現況（亂寫 / 假人 / 假資料）

### 1.1 現在擋假人的五道防線（盤點）

| 防線 | 現況 | 擋什麼 | 強度 |
|---|---|---|---|
| **Email verified** | ✅ 有（Google OAuth 自帶 verified email / magic link 點信即驗）| 拋棄式假信箱 | 中 |
| **電話必填 + 格式驗證** | ✅ 有（`profile_complete` generated column DB 端兜底 + 前端 `phone.trim().length < 6` 擋空 / 太短）| 逼假人留可聯絡資料、提高偽造成本 | 中 |
| **完整資料 gate** | ✅ 有（姓名 + 電話 + 身分類型三項齊才能發案 / 接案）| 逼 fake 編一整套真實感資料 | 中 |
| **AI 訪談自吹偵測（audit flags）** | ✅ 有（doc 12 · 六條規則 · server-side 自動跑 · 標進 `ai_proof.audit_flags`）| worker 自吹自擂、低證據高自評、全滿分可疑、泛詞無例 | 中-高（針對 worker）|
| **Edward 人工覆核** | ✅ 有（最後一關、人眼判斷）| 前四道漏掉的異常 | 高（但靠你的時間）|

**結論**：擋「明顯亂寫 / 拋棄式假帳號 / worker 自吹」這幾類——**五道防線疊起來，PMF 階段夠用，七成以上擋得住**。沙利曼簽。doc 26 的判斷（手機 OTP + email + 完整資料 gate + 人工覆核可擋約 80% fake）成立，只是手機目前是「必填收下來、人工確認」、OTP 自動驗證排 Tier 0.5（合理、不阻擋上線）。

### 1.2 但有三個「假人/亂寫零成本」的洞（Edward 點名的核心擔憂）

| 洞 | 位置 | 攻擊場景 | 嚴重度 |
|---|---|---|---|
| **🔴 洞 A · client 發案可被灌爆** | `client_intakes` 用 raw `.insert()`（`supabase.js` 269 行）· **無 dedupe、無同 email / IP 頻率限制** | 一個人（或一支腳本）填 100 次假發案 → 你收到 100 封 Slack 通知 + 100 個假需求 → 配對池被假需求淹沒、你人工覆核被癱瘓 | 開放用戶前必補 |
| **🟡 洞 B · 燒 token 函式無限流** | `client-brief-parse` / `worker-ai-interview` 兩支對外 AI 函式 · 無 IP 限流（doc 28 C / doc 33 斷點 #4 已點名、**仍未修**）| 一支腳本連打 `client-brief-parse` → 每打一次燒一次 Anthropic token → **你的 AI 帳單直接失血**。這不只是假資料、是真金白銀流失 | 開放用戶前必補（省錢硬防線）|
| **🟢 洞 C · worker 重複申請錯誤不友善** | worker apply 用 raw `.insert()`（`supabase.js` 125 行）· DB 有 `worker_applications_email_key unique(email)` 擋重複、**但前端錯誤處理是 generic「送出失敗：{raw message}」**（`worker.jsx` 1608 行）| 同 email 第二次申請 → DB 回 23505 unique violation → 用戶看到一句看不懂的 raw DB 錯誤、以為系統壞了 | 上線後優化（不致命、但體驗差）|

> **沙利曼註**：洞 C 其實是好消息包著壞消息——doc 33 環節 1 點名「worker apply 重複提交無 dedupe」，但我掃 code 發現 **DB 層的 unique(email) 已經補了**（`20260528_seed_edward_profile.sql`），重複申請進不了 DB。剩下的只是「前端沒把這個 DB 錯誤翻成人話」。比 doc 33 寫的好，優先序可降。

---

## 2 · Worker 認證機制（申請 → AI 訪談 → 覆核）

### 2.1 機制完整度盤點

**流程**（`worker.jsx` + `worker-ai-interview` Edge Function）：

```
申請（基本資料 + email）
  → AI 七段訪談（server-side 真 Claude 對談、萃取 ai_proof）
  → 自動產「能力卡」（L_score 自評 / skill_matrix 6 維 / case_count / strengths / growth）
  → server 自動跑 audit flags 自吹偵測（doc 12 六條規則）
  → 寫進 worker_applications（status='pending'）
  → Edward 在 admin.html Pending Workers tab 看能力卡 + audit flags
  → approve（tier_b / tier_b_plus）/ reject / need_more_info
  → 結果 email 通知（send-decision-email）
```

**狀態機**（`001_initial_schema.sql` 72 行）：
`pending → reviewing → tier_b / tier_b_plus / rejected / need_more_info`
——六態齊全、含「需補件」中間態。✅ 完整。

**判真偽 / 能力的工具**：
- ✅ AI 訪談（七段、真 Claude、非表單）——比競業「填表 + 上傳作品」更難造假
- ✅ audit flags 六條（doc 12）——自動標「自信高證據低 / 全滿分可疑 / 泛詞無例 / 不會自省 / 跨太多領域」、給你「第二雙眼睛」
- ✅ Edward 人工覆核——最後判斷

**Edward 覆核時看得到的資訊**（admin.jsx WorkerCard）：
- ✅ 完整能力卡（L_score / 6 維 skill matrix / case_count / strengths / growth）
- ✅ audit flags（按嚴重度紅/橘/灰排序、approve 前多看一眼）
- ✅ email / 申請時間 / verticals / tier 建議

→ **資訊充足**。沙利曼判定：認證機制**完整、可上線**。

### 2.2 唯一缺口：「覆核標準」沒白紙黑字

機制完整，但**「什麼樣的 worker 該 approve、什麼樣該 reject、什麼樣該 need_more_info」這個判準只在 Edward 心裡、沒寫下來**。

風險：
- 現在你一個人覆核、靠直覺 OK
- 但（a）一致性會飄（今天嚴明天鬆）；（b）未來找人幫你覆核 / 半自動化時，沒有可交接的標準；（c）被 reject 的 worker 問「為什麼」時，沒有可引用的客觀準則 → 容易起爭議

**建議**：補一張一頁的「Worker 覆核 Rubric」（不是大工程、半小時寫得出來）：

| 維度 | approve 門檻（建議起點）| reject 訊號 | need_more_info 訊號 |
|---|---|---|---|
| audit flags | 0-1 個 low/medium | ≥ 2 個 high flag 且無補充 | 1 個 high flag、但其他扎實 → 追問 |
| case_count | ≥ 3 案 或 有具體 client / 數字 | case_count 0 + portfolio 空 + L_score ≥ 8（明顯自吹）| case_count 少但 strengths 具體 → 請補作品連結 |
| strengths 具體度 | 含 client 名 / 數字 / 工具串接 | 全是泛詞（「會用 AI」「擅長 workflow」）| 半具體 → 追問一個案例細節 |
| vertical 對應池子缺口 | 落在你想長的領域（agent/strategy/software）| — | 跨太多領域（≥ 5）→ 請聚焦 |

> 這 rubric 是**底線建議、起點值**——你跑前 5-10 個真實申請後依手感調。重點不是數字精準、是「有一張可引用、可交接、可解釋給被拒者聽」的紙。

---

## 3 · 審核時間 + 提示（SLA）— Edward 點名的「審核提示」

### 3.1 好消息：審核提示已經做了（而且兩端都做）

我掃 code 確認——**這塊不是洞，是已完成項**：

**Worker 端**（`worker.jsx` 977-1051 submitted 確認態）：
- ✅ 「Supabase 已收到你的申請 · 你應該幾分鐘內收到一封自動確認信」
- ✅ 「24h 內 AI 初步回覆 · 3-7 天人工覆核 → 結果用 email 寄到你留的信箱」
- ✅ 「若 72h 內沒收到任何信、寄到下方信箱提醒、不會掉案」（防焦慮 + 防漏接）
- ✅ 申請流程說明頁標「avg approval 7 days」「批次審核每月 1 號 / 15 號」
- ✅ 提供手動補件 email（複製按鈕）

**Client 端**（`app2.jsx` 1751 submit 確認態）：
- ✅ 「24h 內：AI 初審 + 人工覆核 → 配對方案、候選人與時程寄到你的 email」
- ✅ 「送出進人工審核、不代表正式合約或付款」（清楚標明這不是正式承諾、防誤解）

→ **沙利曼判定：審核提示完整、文案清楚、有防焦慮設計（72h 兜底）+ 防誤解設計（不代表合約）。這塊我簽，不必補。**

### 3.2 真正的洞：承諾了「3-7 天」，但沒機制保證你做得到

提示文案說「3-7 天人工覆核」「avg approval 7 days」——這是**對用戶的承諾**。但現在：

- ❌ 沒有任何系統提醒「這個申請已經 pending 5 天了、快超時」
- ❌ admin 後台沒有「pending 超過 X 天」的紅燈 / 排序
- ❌ 純靠 Edward 自己記得登入後台看

**攻擊場景（其實是營運場景）**：你忙一週沒登入後台 → 三個 worker 申請躺了 8 天 → 超過你自己承諾的「7 days」→ 用戶照文案說的「72h 沒收到來提醒」→ 你才發現漏了 → 信任受損 + 可能棄案。

**這是「承諾 vs 兜底」的差距**——提示做得好，反而把標準訂高了，現在更需要一個機制確保你達得到。

### 3.3 建議：給審核加一個「超時不漏」的兜底（兩個層次）

| 層次 | 做法 | 成本 | 何時 |
|---|---|---|---|
| **最小（開放用戶前）** | admin.html Pending Workers / Client Intakes tab 加一個「**距申請已 N 天**」欄位 + 超過 3 天標橘、超過 5 天標紅、預設按等待時間排序（最久的在最上面）。**純前端、查 `created_at` 算差、半小時** | 極低 | 開放用戶前 |
| **進階（上線後）** | 每天一支 cron：掃 `worker_applications status='pending'` + `client_intakes status='new'` 超過 N 天的 → Slack 提醒 Edward「有 X 件審核躺超過 3 天」。配 doc 36 每週儀表板的「警示燈」一起做 | 低 | 上線後第 1-2 週 |

> **沙利曼註**：你的提示文案是資產不是負債——它逼出了一個好習慣（給用戶明確 SLA）。但 SLA 一旦寫給用戶看、就該有兜底。最小版的「超時排序 + 紅燈」半小時能做、開放用戶前補上、就不會發生「忘了有人在等」。

### 3.4 各環節 SLA 現況對照

| 環節 | 提示給的 SLA | 系統現況 | 兜底機制 |
|---|---|---|---|
| worker 申請 → AI 初步回覆 | 24h | AI 訪談即時跑、能力卡當場產 | 即時、無需兜底 ✅ |
| worker 申請 → 人工覆核 | 3-7 天 | 純人工、Edward 手動 | ❌ 無超時提醒（§3.3 補）|
| client 發案 → AI 初審 | 24h | `client-brief-parse` 即時跑 | 即時 ✅ |
| client 發案 → 人工覆核 + 配對 | 24h | 人工 + match-workers | ❌ 無超時提醒（§3.3 補）· 且 24h 比 worker 的 3-7 天更緊、更該兜底 |

> **注意**：client 端承諾「24h」比 worker 端「3-7 天」更緊。client 是付錢的一方、超時的信任傷害更大。§3.3 的超時排序對 client_intakes 同等重要、甚至更優先。

---

## 4 · 資料防呆 / 安全面（必填 / 格式 / 繞過）

### 4.1 前端防呆（做得不錯）

| 項目 | 現況 | 判定 |
|---|---|---|
| client 發案 8 必填欄位 gate | ✅ Step 01 必填擋（QA 5/28 PASS）| 好 |
| 電話格式驗證 | ✅ `phone.trim().length < 6` 擋空 / 太短（`app2.jsx` 1662）| 基本夠（PMF）|
| email 格式驗證 | ✅ regex `/^[^@\s]+@[^@\s]+\.[^@\s]+$/`（`worker.jsx` 1570）| 好 |
| brief 長度驗證 | ✅ < 20 字擋下、提示回補（`app2.jsx` 682）| 好 |
| 同意條款 checkbox | ✅ 必勾才能繼續（`app2.jsx` 659）| 好 |
| 完整資料 DB 端兜底 | ✅ `profile_complete` generated column（前端繞過也擋）| 好（雙保險）|

→ **前端防呆 + DB generated column 雙保險，PMF 階段夠。** 沙利曼簽。

### 4.2 能被繞過 / 沒擋住的（兩個後端破口，同 §1.2）

| 破口 | 說明 | 對照 §1.2 |
|---|---|---|
| **client_intakes 無頻率 / 重複防護** | 前端必填擋得住「填不完整」、擋不住「填完整但重複灌 100 次」。後端 raw insert 無 dedupe、無 IP 限流 | 洞 A |
| **AI 函式無 IP 限流** | 前端驗證可被繞過（直接打 Edge Function endpoint）→ 燒 token | 洞 B |

> **沙利曼資安重點**：**前端驗證永遠只是 UX 防呆、不是安全防線。** 真正的防線在後端（DB constraint + Edge Function caller check + IP 限流）。現在 DB constraint 有做（電話必填、worker email unique），但**「對外函式的 IP 限流」這道後端防線缺**——這是攻擊者繞過前端直接打 API 的標準路徑。doc 28 C 塊 / doc 33 斷點 #4 已點名、卡西法待修。

---

## 5 · 必補項清單（分「開放用戶前必補」vs「上線後優化」）

### 🔴 開放用戶前必補（4 項）

| # | 項目 | 為什麼擋在開放前 | Owner | 工時 |
|---|---|---|---|---|
| **必補-1** | **client_intakes 防灌爆**：加同 email / 同 IP 發案頻率限制（如 24h 內同 email ≤ 3 案）+ 後端 dedupe（短時間內完全相同 brief 擋下）| 假發案零成本灌爆 = 你的人工覆核被癱瘓 + Slack 被淹（洞 A）| 卡西法 | 2-3 hr |
| **必補-2** | **AI 函式 IP 限流**：`client-brief-parse` / `worker-ai-interview` 加 Deno KV IP 限流（doc 28 C Group B、已有 spec）| 燒 Anthropic token = 真金白銀失血（洞 B）| 卡西法 + 沙利曼 Gate 5 | 半天 |
| **必補-3** | **審核超時不漏（最小版）**：admin tab 加「距申請 N 天」欄 + 超時紅燈 + 按等待排序 | 提示承諾了 3-7 天 / 24h、但沒機制保證做得到（§3.2）| 卡西法 | 0.5 hr |
| **必補-4** | **Worker 覆核 Rubric（一頁）**：寫下 approve / reject / need_more_info 判準 | 覆核標準只在你心裡、無法交接 / 解釋給被拒者（§2.2）| 蘇菲 + 沙利曼 | 0.5 hr（寫 doc）|

> 必補-1 / -2 是「防濫用 + 防燒錢」的硬洞、必補-3 / -4 是「兌現承諾 + 可交接」的營運洞。四項加起來約**一個 sprint 內可清**（卡西法 ~6hr + 沙利曼 ~2hr）。

### 🟡 上線後優化（4 項）

| # | 項目 | 說明 | Owner |
|---|---|---|---|
| 優化-1 | **worker 重複申請友善錯誤**：把 23505 unique violation 翻成「你用這個 email 申請過了、結果會寄到信箱 / 想補資料寄到 xxx」（洞 C）| 體驗、不致命（DB 已擋住重複進池）| 卡西法 |
| 優化-2 | **審核超時 cron + Slack**：每天掃 pending 超時件、自動 Slack 提醒（§3.3 進階版）| 配 doc 36 警示燈一起做 | 卡西法 |
| 優化-3 | **手機 OTP 自動驗證**（Tier 0.5）：接 SMS 商、`phone_verified_at` 欄位已預留 | 有規模再上、現在電話必填 + 人工確認夠（doc 26 結論）| 卡西法 + Edward 開戶 |
| 優化-4 | **audit flags v2**：admin override「我看過可 ignore」+ 通過/拒絕歷史回饋調規則（doc 12 §7）| 規模化後 | 蘇菲 + 卡西法 |

### ❌ 明確不做（劃清邊界、防 scope creep）

- ❌ **身分證 / 人臉 KYC**——doc 26 Tier 2、有金流規模接第三方再上、現在上沙利曼 NO-GO（個資法 §6/§27 保管炸彈 + 用戶流失）
- ❌ **手機 OTP 列為上線前必做**——doc 26 已判定排 Tier 0.5、電話必填 + 人工確認在 PMF 夠用、不阻擋開放用戶
- ❌ **重畫任何既有流程**——保守紀律、本 doc 所有建議都是「加閘 / 加欄 / 加限流 / 寫 doc」、不改設計

---

## 6 · 沙利曼 verdict

**亂寫 / 假人**：明顯亂寫擋得住（五道防線、七成以上）。但「同一人零成本灌大量假發案」這個洞沒堵（必補-1）。

**認證機制**：完整、可上線。AI 訪談 + audit flags + 人工覆核三層、資訊充足。唯一缺「白紙黑字的覆核標準」（必補-4、半小時）。

**審核時間 + 提示**：提示已做、做得好（兩端都有、含 72h 防焦慮兜底）。真正的洞是「承諾了 SLA 但沒機制保證達得到」（必補-3、半小時）。

**防呆**：前端 + DB 雙保險夠。兩個後端破口——發案無頻率限制（必補-1）、AI 函式無 IP 限流（必補-2、燒錢硬防線）。

**最該補的 3 件（開放用戶前）**：
1. 🔴 **client 發案防灌爆**（頻率 + dedupe）——擋假人灌爆你的覆核
2. 🔴 **AI 函式 IP 限流**——擋燒 Anthropic 帳單（真金白銀）
3. 🟢 **審核超時排序紅燈 + 覆核 Rubric**（兩件各半小時）——兌現你對用戶的 SLA 承諾 + 讓覆核可交接

> 「我不阻止你開門做生意。我只確保開門前、灌假發案的人進不來、燒你錢的腳本打不動、答應客人的 3 天你真的做得到。這三道補上、這扇門我簽。」

---

## 附 · 上下游 reference

- `docs/launch/26-identity-verification-research-suliman.md`（身分認證研究 · Tier 0/1/2）
- `docs/launch/28-pmf-account-auth-spec.md`（帳號 + admin 守門 + 函式防洗需求單）
- `docs/launch/12-audit-flags-spec.md`（worker 自吹偵測六規則）
- `docs/launch/33-service-flow-audit-markl.md` + `35-service-flow-recheck-markl.md`（整條鏈斷點）
- `docs/launch/36-pmf-quantification-turnip.md`（每週儀表板警示燈、可整合 §3.3 cron）
- `components/worker.jsx`（977-1051 submitted 提示 · 1562-1620 email 驗證 + insert）
- `components/app2.jsx`（1751 client submit 提示 · 1662 電話驗證 · 532-659 必填 gate）
- `components/supabase.js`（125 worker insert · 269 client_intakes insert · 無 dedupe）
- `supabase/migrations/001_initial_schema.sql`（worker/client status 機 + RLS）
- `supabase/migrations/20260528_seed_edward_profile.sql`（worker_applications email unique 已加）

---

v0.1 · 🧙‍♀️ 沙利曼 · 2026-05-31 · 營運者視角信任盤點 · 接力卡西法（必補-1/2/3）+ 蘇菲（必補-4）· 涉部署走 Gate 5
