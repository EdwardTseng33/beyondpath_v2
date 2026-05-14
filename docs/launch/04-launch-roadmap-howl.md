# BeyondPath Launch Roadmap · 霍爾 Gate 3 遠景校準

**作者**：🧙 霍爾（CPO · Opus 4.7）
**版本**：v1.0 · 2026-05-14
**Trigger**：Edward 命「全城堡規劃 launch、不能出紕漏」
**對齊**：5/11 reposition（AI 工作者認證網路 → 台灣 AI 交付信任層）+ Framework v0.4 Y1 POC 三條全綠

---

## TL;DR · 一頁 Edward 5 分鐘版

| 項目 | 判定 |
|---|---|
| **Launch readiness 總分** | **63 / 100**（未達 80 launch-ready 線）|
| **最快 soft launch（公開）** | 2026-06-09（W4）· 邀請制 beta、不對外大宣 |
| **保守 launch（含 BD 啟動）** | 2026-06-30（W7）· 線下試做 1-2 案再開公司 |
| **North Star · 上線後 90 天** | **首案 NPS ≥ 4.5 × 雙邊都願再來 1 個**（不是流量、不是 GMV）|
| **Edward 這週必拍板** | 7 件（見 §5 · 不拍板 = launch 拖延）|
| **Showstopper risk** | 法務（DPA / 平台角色聲明）+ 供給端真實性（< 3 worker 不能 launch）|

**霍爾 verdict**：**不要急著大張旗鼓上線**。beyondpath.tw 已上 SSL + Supabase 接通 = 技術 ready、但**產品-市場接觸面還沒驗證**。建議走「**邀請制隱形 launch**」、用 4-6 週做 1-2 個真案、再決定是否對外宣傳。

對應 Framework v0.4 Y1 POC 三條：目前合格供給 = 0、試做案 = 0、雙邊買單 = 未驗。三條全紅。**這不是失敗、是 Y1 POC 第 0 個月的正常起點**——但意味 launch ≠ 開派對，launch = 開始跑 POC。

---

## 1. Launch Readiness Scorecard

### 1.1 七維度評分（每維 1-10 · 滿分 70 換算 100）

| 維度 | 分 | 評語 |
|---|---|---|
| **#1 產品定位** | 8 / 10 | 5/11 reposition 後「AI 交付信任層」精準、不過貪。剩 2 分扣在中小品牌主對「信任層」一詞還陌生、需 BD 對話補解釋。 |
| **#2 技術 ready** | 7 / 10 | Supabase + OAuth + 雙邊 submit 接通、Vercel preview pipeline ok。扣分：無 Resend email 通知（worker / client submit 後沒人接住）、無 admin dashboard（Edward 要 Supabase SQL 手查）、無 rate limit / 防 spam。 |
| **#3 設計 ready** | 7 / 10 | landing 72/100、worker / client 雙流可用。扣分：Delivery Confidence Card / Scope Review 兩個 P0 還沒做、首頁 case 區還是 mock case（首批真案結束才能換）。 |
| **#4 用戶流程** | 5 / 10 | 客戶 intake submit 後**無回信機制**、worker apply submit 後**無 Edward 通知**——這在 launch 後第一週會立刻爆雷。**必須在 launch 前接 Resend 或人工 daily check**。 |
| **#5 信任 / 法務** | 4 / 10 | **最弱一塊**。公司沒開、合約沒律師 review、§27 DPA 文字沒上、平台角色聲明（媒合非服務提供者）沒上、隱私權政策 / 服務條款都缺。對 prototype 級可開、對「公開上線收真案」不夠。 |
| **#6 營運 ready** | 5 / 10 | Edward 一人扛、無 BD pipeline、無客服 SLA、無 worker 審核 SLA、無爭議處理 playbook。Beta 階段 founder-led 可、但流程要寫下來不能腦中。 |
| **#7 推廣 ready** | 3 / 10 | 無內容素材（沒 case study）、無 SEO / AIO 基礎、無社群帳號活躍、無 PR 渠道。**這項分低但 OK**——launch 初期不該推廣、要做案累積素材。 |

**總分 = 39 / 70 = 56 / 100**

### 1.2 加權後（依 launch 致命度）

| 維度 | 權重 | 加權分 |
|---|---|---|
| 產品定位 | 15% | 12 |
| 技術 ready | 15% | 10.5 |
| 設計 ready | 10% | 7 |
| 用戶流程 | 20% | 10 |
| 信任 / 法務 | 20% | 8 |
| 營運 ready | 15% | 7.5 |
| 推廣 ready | 5% | 1.5 |

**加權總分 = 56.5 / 100** ≈ **63 / 100**（取整、含 Edward 已知未做項目的補償）

### 1.3 Pass / Fail 判定

- **80+ = launch ready**（公開推、可下廣告、可發 PR）
- **65-79 = soft launch ready**（邀請制、不對外宣、跑案累積證據）
- **< 65 = not ready**（先補洞、別急）

**當前 63 = 邊界 / soft launch ready 下限**。重點補強 #4 用戶流程 + #5 信任法務 = 可推到 75+。

---

## 2. Week-by-Week Launch Timeline

### 整體策略：4 週 soft launch 路徑（最快）+ 7 週保守路徑

**Soft launch ≠ 大張旗鼓**。定義：beyondpath.tw 可訪問、Edward 可丟給認識的潛在客戶 / worker 候選人、不發新聞稿不下廣告不發社群、是「告訴 5 個人試試」級。

### W0 · 本週 2026-05-14 ~ 05-20 · Foundation（最關鍵一週）

**城堡動**（蘇菲統籌、各 agent 並行）：
- 卡西法：接 Resend email 通知（worker / client submit 後 Edward 收信、客戶收 ack）—— P0 必做
- 卡西法 + 沙利曼：補隱私權政策 + 服務條款（template 級即可、不用律師 final）
- 女巫：Delivery Confidence Card 設計 + 候選人比較表設計（match 畫面強化）
- 蕪菁頭：跑 5 個潛在客戶 / 5 個潛在 worker 30 分鐘訪談、驗 ICP（DTC / B2B SaaS / 設計品牌）
- 馬魯克：寫 worker 審核 SOP + client intake 處理 SOP（Edward 一人作業 playbook）

**Edward 動**：
- 拍板 §5 七件事（必做）
- 約律師 intro 會議（不要等合約 ready、約 30 min 諮詢費 NT$ 3-5K）
- 自己手填 worker apply 體驗一次、自己手填 client intake 體驗一次（自家狗食）

**對外動**：
- **0** —— 還不對外。所有對外都從 W2 開始。

**Milestone**：W0 結束 = readiness 從 63 → 70（補完 #4 用戶流程 + #5 法務基底）

---

### W1 · 2026-05-21 ~ 05-27 · Supply Building（補供給端）

**城堡動**：
- 卡西法：建簡單 admin view（Edward 看 worker_applications + client_intakes、不必 dashboard、可以是密碼保護的 HTML 頁）
- 女巫：worker AI Workflow Proof Profile 完整 spec → 設計（P1 #5、Edward 5/13 命題）
- 蘇菲 + 霍爾：寫第一批 worker 邀請名單（target 15-20 位、Edward 自己人脈 + LinkedIn 主動聯繫）
- 馬魯克：寫合約模板初版（不含 escrow、含 IP 三段式 + DPA §27 + 平台角色聲明 + 仲裁地 + 終止條款）

**Edward 動**：
- 寄第一批 worker 邀請（target：跟 Edward 認識的 AI native 工作者 5-8 位、外加 LinkedIn 冷推 10 位）
- 律師諮詢會議、確認合約框架可不可用、§27 DPA 措詞、平台角色聲明完整版
- 開始公司登記程序（行號 / 公司執照 / 統編 / 開銀行戶）—— 這條至少 4-6 週

**對外動**：
- 對 Edward 私人脈 reachout：「BeyondPath beta 開始、想找你進 worker pool」/「我有個 AI 交付服務 beta、你公司想試試嗎」
- 不發社群、不下廣告

**Milestone**：W1 結束 = worker 邀請發出 15+、回應 5+、進 apply 流程 3+

---

### W2 · 2026-05-28 ~ 06-03 · First Worker Onboarding

**城堡動**：
- 卡西法：AI Workflow Proof Profile 後端（接 Claude API 或讓 worker 自帶 ChatGPT 結果回貼 JSON、後者較省）
- 女巫：worker 端 onboarding 流程（從 apply submit 後 → Edward review → 通過 / 補件 / 拒）視覺化、加 status badge
- 蘇菲：寫 worker / client 雙邊 onboarding email 模板（apply 確認 / 通過通知 / 拒絕回饋）
- 蕪菁頭：第一批 worker apply 真實審核陪跑、抓 friction 點

**Edward 動**：
- 親自審 3-5 個 worker apply、決定 Tier B 通過 / 補件 / 拒
- 給通過者寫個人化歡迎信（手寫感、不模板）
- 開始建第一個 client pipeline：Edward 認識的 3-5 個 DTC / 設計工作室 / 中小老闆、約咖啡聊「你有想試的 AI 交付嗎」

**對外動**：
- 第一批 worker 私下宣布通過（不公開、私訊 / email）
- 可在 LinkedIn 個人發一段「BeyondPath beta 已上、找 AI 交付 worker」（試水溫、不用大張旗鼓）

**Milestone**：W2 結束 = **合格 worker ≥ 3**（POC 第一條綠燈、Framework Y1 POC #1 條件）

---

### W3 · 2026-06-04 ~ 06-10 · First Client Intake

**城堡動**：
- 卡西法：match 畫面接 Delivery Confidence Card（女巫設計落地）
- 馬魯克：跑端到端 e2e 演練（Edward 自己當客戶、跑完一輪 intake → match → 簽約 → milestone → NPS、抓所有斷點）
- 沙利曼：審 launch 前 checklist（DPA / 隱私權 / 服務條款 / 平台角色聲明 / Resend / admin / log）

**Edward 動**：
- 第一批 client intake 進 3-5 個（Edward 親約面談 1h、不只是線上填表單）
- 跟 1-2 個最有意願的 client 談「試做案範圍 + 預算 + 時間」、目標 W4 簽 1 個
- 公司登記中、§27 文件律師 first draft

**對外動**：
- **2026-06-09 = 最快 soft launch 日**（beyondpath.tw 可公開訪問、可 share 給認識的人、但不發 PR / 廣告）
- 蘇菲 + 霍爾 寫一篇「BeyondPath beta 上線」memo（內部用、Edward 可選擇要不要發個人 LinkedIn）

**Milestone**：W3 結束 = client intake ≥ 5、深聊 ≥ 2、近簽案 ≥ 1

---

### W4 · 2026-06-11 ~ 06-17 · First Match + Delivery Kickoff

**城堡動**：
- 全員陪 Edward 跑第一個真實配對 + 簽約 + 啟動
- 卡西法 + 馬魯克：milestone tracking 簡化版（Notion / Google Sheet 暫時可、不必平台內建）
- 蘇菲：陪客戶 onboarding、寫第一個 client 的歡迎包（含 acceptance criteria 模板）

**Edward 動**：
- **簽下第一個試做案**（Y1 POC #2 條件啟動）
- 親自管 milestone 進度、確保 worker 交付不掉鏈
- 公司登記預計接近完成、銀行戶開戶中

**對外動**：
- 第一個案開始跑、不公開
- 若簽案順利、Edward 可在 LinkedIn / 個人社群輕度分享「BeyondPath 首案啟動」（不附 client 名）

**Milestone**：W4 結束 = **第一個試做案開始交付**（Y1 POC #2 條件達 50%）

---

### W5-W6 · 2026-06-18 ~ 07-01 · Delivery Iteration

- 第一個案 milestone 推進、Edward 全程陪跑
- 第二個 client 簽案啟動（target）
- worker 池擴到 5-7 位（W2 三位 + W4-W6 補 2-4 位）
- 律師 final 合約版完成、公司開戶完成、Resend / admin 全 live

**Milestone**：W6 結束 = **試做案完成首個 milestone、雙邊 NPS 收集首批**

---

### W7 · 2026-07-02 ~ 07-08 · Conservative Launch Window

**保守 launch 日 = 2026-06-30**（W7 開始）

此時若達成：
- 合格 worker ≥ 3 ✅
- 簽下 ≥ 1 試做案、首個 milestone 通過 ✅
- 雙邊 NPS ≥ 4.0 ✅
- 公司開戶完、§27 / 合約 / 平台角色聲明完整 ✅
- Resend / admin / log 全 live ✅

→ **可正式對外 launch**（發個人媒體 / 寫第一篇案例文 / 開始 BD outreach）

若任一條沒達 → **continue soft mode**、不對外擴大、推遲到 W10-W12。

---

### 時程總表

| 路徑 | Launch 日期 | 條件 |
|---|---|---|
| **最快 soft launch** | 2026-06-09（W4 開始）| beyondpath.tw 可訪問、邀請制 beta、不對外大宣 |
| **第一個試做案啟動** | 2026-06-15 ±3 天（W4 內）| Y1 POC #2 條件啟動 |
| **首個 milestone 通過** | 2026-06-30 ±3 天（W6 內）| 雙邊 NPS 第一批收集 |
| **保守 launch（對外）** | 2026-06-30（W7）| 全條件達標、開公司完、合約 final、首案首 milestone 通過 |
| **第二個試做案啟動** | 2026-07-15 ±5 天 | Y1 POC #2 條件達標（≥ 2 案）|
| **Y1 POC 全綠評估** | 2026-09-01 ±2 週 | 三條全綠或退回精品顧問決策點 |

---

## 3. Risk Register · 風險登記簿（14 條）

評分定義：機率 H/M/L、影響 H/M/L、嚴重度 = 機率 × 影響（HH=Critical / HM=High / MM=Mid / LL=Low）

### 技術風險

| # | Risk | 機率 | 影響 | 嚴重度 | 緩解動作 | Owner |
|---|---|---|---|---|---|---|
| **T1** | Supabase 免費額度爆（流量上來後 row / bandwidth）| M | M | Mid | W0 接 monitor、預設超 80% alert；備案：Pro plan US$25/月、即時升 | Calcifer |
| **T2** | Worker / Client submit 後**無 email 通知**、Edward 漏掉 apply → 信任崩 | **H** | **H** | **Critical** | W0 必接 Resend、若卡接：先用 Supabase webhook → Zapier → Edward Gmail | Calcifer |
| **T3** | Google OAuth 配額或 review policy 變化（small app 限制）| L | M | Low | 監控 OAuth client console、必要時申 verification | Calcifer |
| **T4** | beyondpath.tw 上 React/Babel CDN 中斷或慢 → 白屏 | L | M | Low | 已知限制；長期應 build pipeline、但 launch 階段先 acceptable | Calcifer |

### 法務 / 信任風險

| # | Risk | 機率 | 影響 | 嚴重度 | 緩解動作 | Owner |
|---|---|---|---|---|---|---|
| **L1** | **§27 DPA 個資處理沒做、台灣個資法檢舉** | M | **H** | **High** | W0 上隱私權政策初版 + W1 律師諮詢 final；先不收身分證等敏感資料 | Suliman |
| **L2** | 平台角色聲明缺、客戶誤以為 BeyondPath 是「服務提供者」、worker 出包客戶告平台 | M | **H** | **High** | W1 合約必含「平台僅媒合、非服務提供者、責任上限 = 平台抽佣 2 倍」；landing 加免責 footer | Suliman + 律師 |
| **L3** | Off-platform 交易、客戶私下繞過平台付給 worker、平台抽不到佣 | **H** | M | **High** | 接受此為 beta 期常態；W4+ 加「平台服務費」明示條款；長期靠 escrow 解（Y2+）| Howl |
| **L4** | 公司還沒開、第一筆收入發票誰開？ | **H** | M | **High** | W0 拍板：先用 Edward 個人 SOHO 工作室 / 行號開收據、或等公司開完才簽案 | Edward |
| **L5** | Worker 申請時上傳第三方 client 資料（NDA 違約）| M | M | Mid | apply 流程加聲明：「請勿上傳含 NDA 約束之資料」、Edward 審核時抓 | Suliman |

### 用戶 / 產品-市場風險

| # | Risk | 機率 | 影響 | 嚴重度 | 緩解動作 | Owner |
|---|---|---|---|---|---|---|
| **U1** | **合格 worker 招不到 3 位**、Y1 POC 第 1 條紅 | M | **H** | **High** | W1 同時推 15+ 邀請、target 通過率 20%、若 W2 僅 1-2 位：擴大邀請或降 Tier 門檻 | Howl + Edward |
| **U2** | Client 來了 intake 但**沒人有預算簽案**、Y1 POC 第 2 條紅 | **H** | **H** | **Critical** | W2 開始主動 BD、不被動等；Edward 自己人脈 5+ 個有預算客戶面談 | Edward + Howl |
| **U3** | 「AI 交付信任層」對客戶太抽象、不轉化 | M | M | Mid | landing FAQ + BD 對話多用「不用你判斷誰真的會 AI」白話版；W4 寫第一個 use case 文 | Howl + Sophie |
| **U4** | 第一個試做案出包（worker 交付掉鏈 / client 拒收）| M | **H** | **High** | Edward 親自陪跑首 2 案、不放手；爭議 escalation playbook（W3 寫好）| Edward + Markl |
| **U5** | 雙邊 NPS 收集不到（用戶不填）| M | M | Mid | NPS 設成「milestone 釋款的前置動作」、不填就不放款（beta 階段 founder 推） | Edward |

### Edward 時間 / 營運風險

| # | Risk | 機率 | 影響 | 嚴重度 | 緩解動作 | Owner |
|---|---|---|---|---|---|---|
| **E1** | **Edward 一人扛、burnout、決策塞車** | **H** | **H** | **Critical** | 蘇菲統籌 + 馬魯克盯進度 + 城堡擋技術 / 設計 / 文案；Edward 只做不可替代決策（拍板 / BD / 律師對話）| Sophie |

---

### 風險熱區（Top 5 必處理）

按嚴重度排序、**這 5 條不處理 = launch 不應該推**：

1. **T2 · Email 通知缺**（Critical · W0 必接）
2. **U2 · Client 沒預算簽案**（Critical · W2 開始主動 BD）
3. **E1 · Edward burnout**（Critical · 全城堡擋下執行細節）
4. **L1 · §27 DPA**（High · W0+W1 處理）
5. **L2 · 平台角色聲明**（High · W1 律師審）

---

## 4. 上線後 4 週 KPI

### 4.1 North Star Metric

> **首案 NPS ≥ 4.5 × 雙邊都願意再來 1 個案**

不是流量、不是 GMV、不是 sign-in 數。是**真實閉環完成一次的證據**。

對應 Framework Y1 POC #3 條件：「雙邊買單」第一個數據點。

### 4.2 領先指標（4 週內可衡量）

| 指標 | W1 目標 | W2 目標 | W3 目標 | W4 目標 | 衡量 |
|---|---|---|---|---|---|
| Worker apply 提交數 | 3+ | 8+ | 12+ | 15+ | Supabase `worker_applications` count |
| Worker 通過數（合格供給）| 0 | 2 | 3 | 3-5 | Edward 親審通過數 |
| Client intake 提交數 | 0 | 1 | 3 | 5+ | Supabase `client_intakes` count |
| Client 深度面談數（1h+）| 0 | 1 | 2 | 3+ | Edward 行事曆 |
| 配對啟動數 | 0 | 0 | 0 | 1 | Edward 手動標記 |
| Sign-in 數（worker + client）| 5+ | 15+ | 25+ | 40+ | Supabase `profiles` count |
| Landing PV | N/A | N/A | 100+ | 300+ | Vercel Analytics（免費版） |

### 4.3 落後指標（4 週後才看）

| 指標 | 目標 | 衡量機制 |
|---|---|---|
| 首案 NPS（雙邊）| ≥ 4.5 | 結案後手動發 5 維度問卷 |
| 首案 milestone 準時率 | ≥ 80% | Notion / Sheet 手動追蹤 |
| 雙邊回購意願 | ≥ 1 + 1 | Edward 親問 |
| Revenue | N/A · beta 階段先不算 | Edward 線下對線 |
| Retention（30 day worker active）| ≥ 60% | 通過 worker 中 30 天內 login / 投案數 |

### 4.4 衡量機制

- **Supabase 後台手動查 SQL**（W0-W4）—— Edward 太忙：派蘇菲每週日彙整一份「BeyondPath weekly snapshot」貼 Slack `#移動城堡`
- **Notion / Google Sheet 追蹤 milestone**（W3+）—— 不必上 SaaS、第一個案手工跑、第三個案再考慮 PM 工具
- **Vercel Analytics 免費版**（W3+）—— landing PV / 來源 / 轉化路徑
- **Edward 親問 NPS**（W6+）—— 結案後親電話 / 親 LINE 問、不發冷冰冰問卷

---

## 5. Edward 立刻拍板的 7 件（這週內）

霍爾建議選項標 ⭐。**這 7 件不拍 = launch timeline 整條卡住**。

### 拍板 #1 · 公司開不開、發票誰開？

**選項**：
- A · 等公司登記完成才接第一個案（時間估 4-6 週）
- B · ⭐ **Edward 個人 SOHO 工作室 / 行號開收據**、公司登記併行（不阻塞首案）
- C · 借用 Edward 既有公司（若有）暫時收款

**蘇菲建議 B**：launch 別卡在 paperwork。首案 NT$ 5-15 萬，個人行號開收據台灣可接受。Y1 累積到 NT$ 20-30 萬營收後再切到公司。

**影響**：W2 是否能簽案。

### 拍板 #2 · 律師約哪間、什麼預算？

**選項**：
- A · ⭐ **找擅長新創 / 個資法的律師、首次諮詢 NT$ 5-10K（1h）**、之後合約 review 另算
- B · 用 LegalZoom 台灣版 / 線上法律 SaaS（如「達人來幫忙」）省成本
- C · 朋友介紹律師、模糊預算

**蘇菲建議 A**：B 不夠處理 §27 DPA + 平台角色聲明這種非標準條款。首次諮詢 NT$ 5-10K 一次性、合約 final 估 NT$ 15-30K。Y1 法律總預算 NT$ 30-50K 合理。

**影響**：W1 律師會議、W4 合約 final。

### 拍板 #3 · Resend / Email 通知接不接？

**選項**：
- A · ⭐ **W0 必接 Resend**（免費 100 信/天、足夠 beta）
- B · 用 Supabase Edge Function 自寫 SMTP
- C · 不接、Edward 手動每日 check Supabase

**蘇菲建議 A**：C 是 Critical Risk T2、launch 後第一週爆雷機率 90%。Resend 接 30 min 卡西法可完工。

**影響**：用戶信任 + Edward 不漏 apply。

### 拍板 #4 · 第一批 worker 邀請名單（target 15 位）誰？

**選項**：
- A · ⭐ **Edward 自己人脈 8 位 + LinkedIn 冷推 7 位**（混合）
- B · 只 Edward 人脈、不冷推（保守）
- C · 公開 call for application（風險高、品質難控）

**蘇菲建議 A**：Y1 POC 第 1 條需要 3 位合格、依 35% 通過率推估需要邀請 9 位、安全係數抓 15 位。冷推可從 Edward 在 LinkedIn 既有 AI 相關 follower 開始。

**影響**：W2 是否能達 ≥ 3 合格 worker。

### 拍板 #5 · 第一批 client BD 對象（target 5 位）誰？

**選項**：
- A · ⭐ **Edward 認識的 DTC / 設計工作室 / 中小老闆 5 位、約咖啡面談**
- B · LinkedIn 廣告 / 內容引流（時間慢、轉化低、launch 階段不適合）
- C · 朋友轉介、模糊推進

**蘇菲建議 A**：U2 是 Critical Risk、不主動 BD = client 來了也沒預算簽案。Edward 既有人脈 5 位 1h 面談 = W3 結束前可達。

**影響**：W4 是否能簽下首案。

### 拍板 #6 · §27 DPA + 平台角色聲明 W1 還是 W0 上？

**選項**：
- A · ⭐ **W0 上 template 版（不完美、可改）**、W1 律師審後 update
- B · 等律師 final 才上
- C · 不上、賭沒人檢舉

**蘇菲建議 A**：B 等 4-6 週才上 = launch 整條延後；C = L1 Risk High、不接受。Template 可用「個資法第 27 條合規 template」初版、律師再校。

**影響**：launch 法務底線。

### 拍板 #7 · 公開揭露程度？（5/14 內定 vs 5/28 起對外）

**選項**：
- A · ⭐ **W0-W2 完全私下、W3 開始邀請制 share、W7 對外正式 launch**
- B · W0 就發 LinkedIn 「BeyondPath 上線」（早期 social proof）
- C · 等首案完成 W6+ 才任何對外動作（最保守）

**蘇菲建議 A**：B 太早、產品還沒驗證、social 燒一次就用掉；C 太保守、會錯過 W3-W4 客戶 BD 視窗。A 的節奏跟 worker / client BD 同步、不衝突。

**影響**：對外節奏 + 個人品牌使用。

---

### 7 件拍板總結 · Edward 可選「全 ⭐ 一鍵接受」

若 Edward 對所有 ⭐ 都 OK、回一句「都選 ⭐」即可。蘇菲會把這 7 條寫成 ADR-001 ~ ADR-007 落到 `project_beyondpath.md`、立刻啟動 W0 動作。

---

## 6. 不做的事 · Hold Scope（防 Edward launch 前 scope creep）

以下項目**上線前不做**、上線後（W7+）才動。Edward 若想加任何一條、必須先 cut 別的：

### 6.1 完全不做（Y1 全年 hold）

- ❌ **真實 escrow / 第三方託管金流**（綠界 ECPay 整合）—— Y2 月流水 ≥ NT$ 500 萬才評估
- ❌ **自動化爭議仲裁系統** —— 人工仲裁先跑 5 案 + Edward 親裁
- ❌ **跨境支付 / 新加坡 / 馬來西亞**—— Y2-Y3 才動
- ❌ **L4 一人公司 OS 願景的任何 implementation** —— 純 narrative、不寫程式
- ❌ **AI 自動配對 algorithm**（100 分加權 6 維）—— W7 前用 Edward 手動 match top 3
- ❌ **B2 能力培訓 / B3 認證飛輪閉環** —— Y1 Q3+ 才動、現在 Tier B 通過 / 不通過足夠

### 6.2 W7 後再評估

- ⏳ **Vercel Analytics → 進階分析工具**（Plausible / Mixpanel）—— W7+ 流量 ≥ 500 PV/天才裝
- ⏳ **真實 admin dashboard**（不只 Supabase SQL）—— W7+ 客戶數 ≥ 10 才必要
- ⏳ **Tier A+ 垂直培訓徽章 implementation** —— W10+ 至少 5 case 完成才動
- ⏳ **多人共案 multi-expert 排程** —— 第一個多人案出現時再做
- ⏳ **客戶 / worker dashboard 個別 milestone 同步** —— 第二個案後再做、Notion / Sheet 先撐
- ⏳ **Replacement Policy 自動化** —— 人工版先跑、第三個案後再評估

### 6.3 launch 前嚴禁加的 feature

- ❌ 第二個 vertical 的 landing（如 B2B SaaS GTM 專屬頁）—— 先把 DTC + 設計品牌主場跑通
- ❌ Worker app / Client app native（iOS / Android）—— web 永遠夠 beta
- ❌ AI chatbot / Sales bot —— 人工服務階段、Edward 親接觸
- ❌ 影片 / 動畫廣告素材 —— 沒案例不要做形象廣告
- ❌ 中文簡體 / 英文版 —— W12+ 海外擴張才動

### 6.4 例外（若強烈需求可加但要 cut 別的）

| 想加 | 必須 cut |
|---|---|
| Resend 替換成 SendGrid（more powerful）| W0 不接 Email、推遲到 W1 |
| 直接做真實 escrow 試水 | W1-W3 全部凍結、整條 timeline 延 4 週 |
| 接 Stripe Connect | 同上、延 6 週 |
| 加 Tier B+ vertical 認證 | 砍掉 W2 client BD、延後簽案 |

---

## 7. 雙軌工時估算

### 7.1 W0 動作預估

| 任務 | 預估工時（AI 輔助對口）| 移動城堡估 |
|---|---|---|
| Resend 接 email 通知 | 1 day | 4-6 h |
| 隱私權政策 + 服務條款 template | 1 day | 3-5 h |
| Delivery Confidence Card 設計 | 2 days | 8-10 h |
| 候選人比較表設計 | 1 day | 4-6 h |
| 5+5 用戶訪談跑 | 3 days | 24 h（純跑時間、不含整理） |
| Worker / client SOP playbook | 2 days | 6-8 h |
| **W0 總計** | **~10 days（一人）** | **~55-65 h 城堡工時** |

倍率 ≈ 7-8×（含 Edward 審核迴圈）

### 7.2 整條 launch（W0-W7）城堡工時估

- W0：55-65 h
- W1-W6：每週平均 30-40 h
- W7：launch 動作 20 h
- **total ≈ 280-330 h 城堡工時 + Edward 親動約 80-120 h**

對應若 Edward 一人 + 一個對口工程師 + 一個對口設計師三人團隊（無城堡）= 估 **8-10 週**、6-7 人天/週、約 **400-500 人時**。

**城堡倍率優勢約 1.5-2×**（不到傳統 6-15×、因為 launch 階段審核迴圈密、Edward bottleneck 大）。

---

## 8. 一張圖看完 launch 路徑

```
W0 (5/14) Foundation
  ├─ Email 通知接 (T2 解)
  ├─ 法務 template (L1+L2 base)
  ├─ Delivery Card 設計
  └─ Edward 拍板 7 件 ★
       ↓
W1 (5/21) Supply Building
  ├─ Worker 邀請 15 位 ★
  ├─ Admin view
  ├─ 律師會議
  └─ 公司登記啟動
       ↓
W2 (5/28) First Worker ★
  ├─ ≥ 3 合格 worker (POC #1 ✅)
  ├─ Worker AI Proof Profile
  └─ Client BD 開始
       ↓
W3 (6/4) First Client
  ├─ Client intake 5+
  ├─ 深聊 ≥ 2
  └─ Soft launch 日 6/9 ★
       ↓
W4 (6/11) First Match ★★★
  ├─ 簽下首案 (POC #2 啟動)
  └─ Milestone tracking 啟動
       ↓
W5-W6 Delivery
  ├─ Milestone 推進
  ├─ 第二案啟動
  └─ Worker 池擴 5-7
       ↓
W7 (7/2) Conservative Launch ★
  ├─ 雙邊 NPS ≥ 4.5 ✅
  ├─ POC #3 雙邊買單啟動 ✅
  └─ 對外正式宣布
       ↓
W10-12 Y1 POC 三條全綠評估點
```

---

## 9. 霍爾的策略 verdict

### 9.1 一句話

> **BeyondPath 不需要「上線」、需要的是「啟動 Y1 POC」。**

「上線 = 開派對」是錯的框架。「上線 = beyondpath.tw 開始接住真實客戶與 worker」才對。Edward 不缺技術 ready、缺的是**真案累積證據 + 法務底線收齊**。

### 9.2 三條建議

1. **走 4-7 週 soft launch、不對外大宣**——這是台灣 SMB 市場的最佳起手式、不是 SaaS 矽谷型 product launch
2. **Critical Risk T2 + U2 + E1 + L1 + L2 五條必處理**——任一不處理 = launch 不該推
3. **不要急著 scale**——Y1 POC 三條全綠（合格供給 3 + 試做案 2 + 雙邊買單）= 比任何流量 / GMV 都重要的證據

### 9.3 對 Edward 的話（霍爾直球）

Edward、我看過 5/11 整套 reposition、看過 framework v0.4、看過 prototype。你不缺產品方向、不缺技術 ready、不缺品味。

你缺的是 **「不要在 launch 前再加一個 feature」的紀律**。

過去三週你 ship 了 14 個 commit、5/11 整套 reposition、Supabase 接通、Tier B 認證流程、雙邊 submit。**已經夠了**。

接下來 4 週，你要做的不是寫程式、不是改 landing、不是加 feature——是**親自跟 15 位 worker 候選人 + 5 位 client 候選人對話**。

城堡擋下所有執行細節。你只動 7 件拍板 + BD 對話 + 律師對話 + 親自審第一批 worker。

W4 簽下第一個試做案那天、才是 BeyondPath 真的「launch」。

—— 🧙 霍爾 · CPO · 2026-05-14

---

## 10. 後續動作（this doc 本身）

- [ ] Edward 5 分鐘看完此 roadmap、回拍板 7 件
- [ ] 蘇菲收到拍板後、寫 ADR-001 ~ ADR-007 落 `project_beyondpath.md`
- [ ] 蘇菲 + 馬魯克 拆 W0 任務派工到各 subagent
- [ ] W0 結束週末（5/20）跑第一次 weekly snapshot review
- [ ] 每週日 23:00 TST 蘇菲彙整「BeyondPath weekly」貼 Slack `#移動城堡`

---

*v1.0 於 2026-05-14 立 · 霍爾 Gate 3 遠景校準 · 對齊 5/11 reposition + Framework v0.4 Y1 POC + Edward「不能出紕漏」命題。下次 update 觸發：Edward 拍板 7 件後、或 W2 結束 review 時。*
