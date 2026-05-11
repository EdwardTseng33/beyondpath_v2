# Trust Content Spec · Prototype v0.2

**作者**：沙利曼 Madame Suliman · Head of Trust & Infrastructure
**派工方**：主對話蘇菲 · 補強 sprint round 1（5 P0）
**日期**：2026-05-09
**用途**：給卡西法 implement、所有對外 trust / 法律措辭文字 final draft
**對應 PRD**：`PRD_NextGen_Prototype_v0.1.md` + `Trust_Compliance_Brief_Product_Flow.md`
**範圍**：對外 demo 用 UX 文案 · 非合約全文 · 非正式法律意見

---

## 重要前置聲明（給 Edward + 卡西法 + 其他 agent 看）

本文件**只是 UX 展示用文案**——目的是讓 prototype demo 時、發案方 / worker / 投資人能在 1 句話內理解每一條信任機制。

**不能取代的東西**：
1. 真正的合約全文（待 Edward 親簽 + 律師 review · 預算 NT$ 30K-50K · 上線前 must）
2. 個資登記文件（個資法 §27 · 上線前 must）
3. 綠界 ECPay 商家合約（Edward 親簽）
4. DPA 條款細節（律師 review）

**Prototype 上線前必加 disclaimer**：見 §1。每張 trust card 點開後的「詳細條款 →」link、Y1 dogfood 階段先 link 到 placeholder（「正式條款律師 review 中、預計 2026 Q3 上線」），**不可亂寫條款細節騙投資人**。

---

## §1 · 對外 URL Disclaimer Banner（補強 #5）

### 1.1 Top Banner（每頁顯示 · sticky · 可關但 reload 後重現）

**Final 定稿（5 行版 · 黃底 / 黃條紋背景 + 黑字）**：

```
🚧 PROTOTYPE DEMO · 非正式服務
此為 BeyondPath 產品流程展示版、所有資料皆為模擬。
真實服務尚未開放、合約 / 付款 / 認證機制律師審視中。
不收取任何費用、不處理真實個資、不簽訂法律效力文件。
正式上線預計 2026 Q3 · 加入 waitlist → 收到通知 [→ 連結]
```

**設計規範（給卡西法 + 女巫）**：
- 高度：32px desktop / 40px mobile（mobile 兩行斷）
- 背景：`#1a1a08`（warm-charcoal × yellow tint）+ 細條紋（`repeating-linear-gradient` 45deg）
- 文字色：`#fff8d4`（warm cream）
- Emoji 🚧 用 system emoji（不另載字體）
- 「PROTOTYPE DEMO」用 JetBrains Mono uppercase + letter-spacing 0.08em
- 「→ 連結」hover 時變 chartreuse `#c7e84a` underline
- 關閉按鈕（× 右上角 16px）· 關閉後 sessionStorage 記住、reload 不重現（**不要 localStorage** · 每 session 重提醒）

**繁中 / EN 雙版本（i18n 預留）**：

```
EN version：
🚧 PROTOTYPE DEMO · NOT A LIVE SERVICE
This is a product flow demo of BeyondPath. All data shown is simulated.
The live service is not yet open. Contracts, payments, and certification
processes are under legal review. No fees, no real PII, no binding documents.
Public launch planned Q3 2026 · Join waitlist for updates [→ link]
```

### 1.2 Footer（每頁底部 · 不可關）

**Final 定稿（簡版 3 行）**：

```
BeyondPath · Prototype v0.2 · Last updated 2026-05-09
此頁所有合約 / 付款 / 認證內容僅為展示、無法律效力
正式上線前完整律師審視中 · 加入 waitlist [→ 連結]
```

**設計規範**：
- 高度 60px · `#0a0a0b` 純黑底 · 文字 `#6a6a6c` 50% 灰
- 字體 JetBrains Mono 11px / line-height 1.6
- 中央對齊 desktop / 左對齊 mobile
- 「加入 waitlist」chartreuse underline · click → 開外部 form（Tally / Typeform · 收 email + 角色 client/worker + 領域偏好）

### 1.3 Waitlist Link 文案（form 內標題 + 描述）

**Form 標題（< 10 字）**：
```
搶先體驗 BeyondPath
```

**Form 描述（< 60 字）**：
```
正式上線前 14 天、我們會寄一封啟用信給你。
不發行銷信、不分享 email、隨時可退訂。
```

**收集欄位**（卡西法 implement form 時用）：
1. Email（必填）
2. 你的身份（單選）：發案方 Client / 接案方 Worker / 投資人 / 其他
3. 你的領域偏好（單選 · 對 Worker / Client 都顯示）：DTC 內容自動化 / B2B SaaS GTM / 品牌 DNA × AI / 其他
4. 一句話告訴我們你目前最頭痛的事（textarea · 選填 · max 200 字）

**送出後 thank-you 文案**：
```
✓ 收到。我們在 2026 Q3 正式上線前 14 天寄信給你。
在這之前、你可以繼續逛 prototype demo —— 所有資料模擬、放心點。
```

---

## §2 · Step 07 Escrow 退款 5 情境 UX 文案（補強 #2）

### 設計概念

5 張 trust card 橫排（mobile：直排）· 每張 80px 高 / 240px 寬 desktop · 點 card 展開詳細條款（手風琴式 · 一次只展開一張）。

每張 card：
- 左 emoji（24px · 不用 SVG icon · 用 system emoji）
- 右上 標題（≤ 8 字 · IBM Plex Sans bold 14px）
- 右下 一句白話（≤ 30 字 · IBM Plex Sans regular 12px / `#9a9a9c`）
- Hover：邊框變 chartreuse `#c7e84a` 1px solid
- 展開後：顯示「詳細條款」link → 連到 placeholder「📄 完整條款律師審視中、預計 2026 Q3 上線、查看 [合約框架] →」

### 5 張 Card Final 定稿

#### Card a · Worker 中斷

```
🛟 Worker 中途離場
平台 7 天內幫你找替補 worker、訂金 100% 安全。
[詳細條款 →]
```

**展開後白話補充（< 60 字）**：
```
不管 worker 因任何原因無法繼續（生病、出國、不接了）、
平台 7 個工作天內媒合 Tier 等級相同或更高的替補 worker。
你已付的訂金一塊不少、由平台 escrow 完整託管。
```

---

#### Card b · 品質爭議

```
⚖️ 品質有爭議
雙方提證據、平台 7 天內判定、不服可走法院。
[詳細條款 →]
```

**展開後白話補充**：
```
Worker 交付後、若你覺得沒達到當初講好的規格、
雙方可以各自上傳「證據」（截圖、原始檔、規格對照）給平台。
平台仲裁團 7 天內判定、決定按進度退多少。
如果你不接受平台判定、保留走法院的權利（無法剝奪）。
```

---

#### Card c · 客戶任意取消

```
🚪 你想取消
按進度退 70%、剩 30% 補償 worker 已投入時間。
[詳細條款 →]
```

**展開後白話補充**：
```
你可以任何時候喊停、不需要理由。
已完成的 milestone 100% 結算給 worker（你拿成果）。
進行中的 milestone：你拿回 70%、worker 拿 30%（補償他已開工的時間）。
這個 70/30 拆法是消保法允許的合理範圍、不是處罰你。
```

---

#### Card d · 雙方合意取消

```
🤝 雙方都想停
按完成進度結算、誰也不吃虧。
[詳細條款 →]
```

**展開後白話補充**：
```
若你和 worker 都同意中止案件（例如：scope 變了、共識不對）、
按 worker 實際完成進度結算、剩餘訂金 100% 退還給你。
這是最和平的退場方式、平台只負責執行結算。
```

---

#### Card e · 不可抗力

```
🌪 不可抗力
天災 / 戰爭 / 重大疫病、訂金全退、雙方互不究責。
[詳細條款 →]
```

**展開後白話補充**：
```
若發生天災、戰爭、政府禁令、重大疫病、平台系統當機 72 小時以上、
雙方都沒辦法繼續、訂金 100% 退還給你、worker 也不會被求償。
14 天內雙方協商：要展延？還是直接終止？
這條只在「真的不可抗力」時觸發、不是商業風險（如錢不夠了）。
```

---

### Step 07 頁面整體 layout 建議（給女巫 + 卡西法）

```
[ Top:  訂金 30% / NT$ 15,000 已託管 escrow · 綠界 ECPay 第三方保管 ]

[ 5 張 trust card 橫排 ]

[ Bottom:  ✓ 我已了解上述 5 種退款機制 · [我同意、進入 Step 08 →] ]
```

**底部勾選文案 final**：
```
☐ 我已了解 BeyondPath 的 5 種退款情境
☐ 我同意訂金由綠界 ECPay 第三方託管、按 milestone 釋放
```

兩個都勾 → 「進入 Step 08」按鈕亮起。

---

## §3 · Step 06 合約 10 條紅字標示（補強 #2 連帶）

### 10 條合約清單（Step 06 展示用）

按 Trust Brief §2 + Framework §10.3、簡化成 client 友善版本：

| # | 條款名稱（≤ 8 字） | 一句白話描述（≤ 35 字） | 是否紅字 ⭐ |
|---|---|---|---|
| 1 | 雙方資訊 | 你和 worker 的基本資料、營業地址、Tier 等級 | |
| 2 | 服務範圍 | AI 拆解結果作為附件 A、scope 鎖死 | |
| 3 | 付款 / Milestone | 30% 訂金 / 30% 中期 / 40% 結案 | |
| 4 | **IP 歸屬** | 結案 + 全額付款後、交付物著作權歸你 | ⭐ **紅字** |
| 5 | NDA 保密 | 雙向保密 3 年、違約罰兩倍案件金額 | |
| 6 | **終止條款** | 退款 5 種情境、違約金不超過案件 30% | ⭐ **紅字** |
| 7 | DPA 個資 | Worker 不得儲存 / 轉讓客戶資料、結案 30 天清除 | |
| 8 | 仲裁地 | Y1 台北地方法院、Y2 後跨境走仲裁中心 | |
| 9 | 不可抗力 | 天災 / 戰爭 / 重大疫病、雙方協商 14 天 | |
| 10 | **平台角色** | BeyondPath 是媒合 + 託管平台、不是服務提供者 | ⭐ **紅字** |

### 為什麼這 3 條紅字（消保法 §17）

**法源**：《消費者保護法》第 17 條 + 行政院消保處公告「定型化契約應記載及不得記載事項」——重大條款必須以「足以引起消費者注意」方式呈現。

紅字 3 條：
- **§4 IP 歸屬**：客戶最在乎的「我買了到底拿到什麼」
- **§6 終止條款**：違約金 / 退款比例 = 客戶最容易跟平台爭議的點
- **§10 平台角色**：客戶可能誤以為「平台保證 worker 品質」、必須講清楚平台只媒合 + 託管

### Step 06 UX layout 建議

```
電子合約 · 預覽

[ ⬇ 10 條條款列表（可摺疊）]

  □ §1 雙方資訊
  □ §2 服務範圍
  □ §3 付款 / Milestone
  □ §4 IP 歸屬 ⭐ 重大條款
  □ §5 NDA 保密
  □ §6 終止條款 ⭐ 重大條款
  □ §7 DPA 個資
  □ §8 仲裁地
  □ §9 不可抗力
  □ §10 平台角色 ⭐ 重大條款

[ ⏰ 30 日審閱期 ]

[ □ 我已逐條閱讀、特別是 ⭐ 重大條款 ]
[ □ 我了解此合約 30 日內可無條件取消 ]
[ □ 我了解 BeyondPath 是媒合 + 託管平台、worker 履約品質由 worker 個人負責 ]

[ 簽字 → ]（三個都勾才亮起）
```

### 紅字 3 條詳細條款 final 定稿（展開時顯示）

#### §4 IP 歸屬 ⭐

```
此案的「交付物著作權」（你最終拿到的設計檔、文案、code 等）：

✓ 結案 + 全額付款後、100% 轉讓給你（買斷）
✓ 你可以無限制使用、修改、再販售
✓ Worker 保留「在 portfolio 展示」的權利（須匿名化、不揭露你的品牌名 / 客戶資料）
✗ Worker 通用 know-how（他自己的工作流程、模板、AI prompt 庫）不在轉讓範圍

⚠️ AI 生成內容（如 ChatGPT 寫的文案、Midjourney 生的圖）著作權狀態：
   台灣法尚無定論（2025 智財局函釋傾向「人類創作部分有著作權、純 AI 無」）。
   Worker 須在交付時揭露 AI 使用比例、便於你後續授權處理。
```

#### §6 終止條款 ⭐

```
案件可中途終止、依情境退款（5 種、見 Step 07 退款情境）：

a) Worker 中斷 → 100% 退款 + 平台 7 天內媒合替補
b) 品質爭議 → 平台 7 天內仲裁、不服可走法院
c) 你任意取消 → 70% 退、30% 補償 worker
d) 雙方合意 → 按進度退
e) 不可抗力 → 100% 退

⚠️ 違約金上限：不超過案件總額 30%（消保法 §17 規定）。
   若 worker 要求超過此比例的違約金、條款無效、平台連帶責任。

⚠️ 平台仲裁 ≠ 法院判決：
   你不服平台仲裁、保留走訴訟權利（消保法 §17 不可剝奪）。
```

#### §10 平台角色 ⭐

```
BeyondPath 在這個案件中的角色：

✓ 資訊媒合：用 AI 算法幫你找到 Tier 等級匹配的 worker
✓ 資金託管：訂金 / milestone 款項由綠界 ECPay 第三方保管
✓ 仲裁服務：爭議時提供 7 天內第一階段仲裁

✗ BeyondPath 不是 worker 的雇主
✗ BeyondPath 不為 worker 的交付品質直接負責
✗ Worker 違約時、你的求償對象是 worker 個人（平台協助但不連帶）

⚠️ 平台責任上限：平台抽佣金額（17-20%）的 2 倍
   例：案件 NT$ 100,000、平台抽佣 NT$ 17,000 → 責任上限 NT$ 34,000

🛡️ 例外：若是平台系統故障、配對錯誤、escrow 操作失誤導致你損失、
   平台依《消保法》直接負責、不適用上述上限。
```

### 30 日審閱期勾選 UX 文案 final

**勾選方塊文字**（消保法 §17 必含）：

```
☐ 我了解此合約屬定型化契約、依《消保法》第 17 條、
   我有 30 天的審閱期、可在此期間內無條件取消。
   今天是 2026/MM/DD、最後可取消日是 2026/MM/DD（自動計算 +30 日）。
```

**勾選後的 confirmation toast（展示用）**：
```
✓ 已記錄你的閱讀同意 · 30 日審閱期至 2026/MM/DD
```

---

## §4 · Worker Onboarding 法律 / 個資 Framework（補強 #3）

### 4.1 申請 Form 收集欄位（Tier B 級申請 · 入門）

**Final 定稿欄位 list**（給卡西法 implement form 時用）：

#### A 區 · 基本身份（必填）

```
☐ 姓名（中文 + 英文 · 用於合約簽字 · 不公開顯示）
☐ Email（用於通知、合約寄送）
☐ 手機號（用於 escrow 撥款 SMS 二次確認、不公開）
☐ 身份證末 4 碼（KYC · 不公開、僅平台 admin + 律師可見）
```

#### B 區 · 專業資料（必填 · 公開展示用）

```
☐ Portfolio URL（個人網站 / Behance / Dribbble / GitHub / Notion 任一）
☐ 主要領域（複選 max 2）：
  · DTC 內容自動化（電商品牌 / 廣告投手 / 內容自動生成）
  · B2B SaaS GTM（產品行銷 / SEO / lifecycle email）
  · 品牌 DNA × AI（品牌策略 / 視覺識別 / AI workflow 整合）
  · 其他（自填領域）
☐ AI 工具熟練度（自評 1-5 分）：ChatGPT / Claude / Midjourney / 自動化工作流（n8n / Zapier）
☐ 過去 12 個月實際接過的 AI 相關案件數（≥ 3 案才能進 Tier B 申請池）
```

#### C 區 · 工作習慣（選填 · 提升 matching 準確度）

```
☐ 預期月接案數（1 / 2-3 / 4+）
☐ 每週可投入時數（< 10 / 10-20 / 20-40 / 40+）
☐ 偏好案件規模（< 50K / 50-200K / 200K+）
☐ 排程偏好（彈性 / 固定週期 / 緊急可加價）
☐ 一句話介紹自己（max 100 字 · 公開顯示在 worker card）
```

### 4.2 個資聲明（一行白話 · form 底部必顯示）

**Final 定稿（< 50 字）**：

```
✓ 我同意 BeyondPath 收集上述資料、僅用於 Tier 認證審核、
  不會轉售第三方、可隨時要求查閱 / 刪除（個資法 §3）。
```

**展開後完整版（點 [完整個資聲明 →] 顯示）**：

```
BeyondPath 個資處理聲明（Worker 申請版）

收集目的：
  · Tier 認證審核（A 區 + B 區）
  · 媒合配對（B 區 + C 區）
  · escrow 撥款 KYC（A 區身份證末 4 碼 + 手機）
  · 合約簽訂（A 區姓名 + email）

不做的事：
  ✗ 不轉售給第三方
  ✗ 不用於行銷推送（你可選擇收 / 不收平台公告）
  ✗ 不訓練 AI 模型（你的 portfolio 不會被當訓練資料）

你的權利（個資法 §3 + GDPR §17）：
  ✓ 隨時要求查閱你的個資
  ✓ 隨時要求補充 / 修正
  ✓ 隨時要求刪除帳號（30 天內完全清除、合約紀錄除外）
  ✓ 帳號刪除後、平台僅保留匿名化 metadata（案件數、領域、Tier 等級）

資料保留期：
  · 帳號活躍期：永久
  · 帳號註銷後：30 天內清除（個資部分）/ 7 年（合約 + 金流紀錄、稅法要求）

聯絡方式：
  · 個資相關詢問：privacy@beyondpath.tw（waitlist 階段先指向 Edward 個人 email）
```

### 4.3 Tier 認證審核 SLA 文案

**Final 定稿（form 送出後的 confirmation 頁）**：

```
✓ 你的 Tier B 申請已送出！

📅 審核時程：
  · 平台採批次審核制：每月 1 號 / 15 號統一審核
  · 你的申請進入下一批：2026/MM/15 開始審核
  · 預計通知時間：3-5 個工作天（最遲 2026/MM/20）

📝 審核流程：
  1. 自動檢核（即時）：portfolio URL + AI 工具自評是否完整
  2. 人工審查（3-5 天）：審委會看你的 portfolio 質量 + 領域匹配度
  3. 通過 / 待補件 / 暫不通過 → email 通知

⏰ 通過率參考：
  · Tier B：~38% 通過進入下一階段
  · Tier A：< 10% 整體通過率（含 Tier B 已通過者再申請 Tier A）

下一步：
  → 我們會在 [日期] 寄通知信
  → 在這之前、你可以繼續完成 portfolio（雖然送出後就不再修改）
  → 任何問題：worker-support@beyondpath.tw
```

### 4.4 沒過怎辦 Fallback 文案

#### 情境 a · 待補件（最常見 · ~40%）

```
📩 你的 Tier B 申請：需要補件

我們審查了你的 portfolio、覺得方向對、
但有以下需要補強：

  · [動態列：審委會勾選的補件項]
    例：「最近 12 個月 AI 案件不足 3 個」
    例：「portfolio 連結 404、請更新」
    例：「AI 工具自評需附 1 個實際 workflow 截圖」

📅 補件期限：14 天（至 2026/MM/DD）
   逾期未補件 = 視為放棄、可下個月重新申請

→ [前往補件 →]
```

#### 情境 b · 暫不通過（~22%）

```
🌱 你的 Tier B 申請：暫不通過

我們審查後認為現階段還沒準備好、
但這不是淘汰、是「再試一次」的機會。

審委會的回饋：
  · [動態列：審委會評語、限 200 字]

建議下一步：
  · 再做 2-3 個 AI 實作案件（任何形式都行、自己練手 / pro bono / 朋友案）
  · 補強 portfolio 視覺呈現（不是只放成品、show the workflow）
  · 6 個月後再申請、我們會優先審你的二次申請

📚 學習資源：
  · BeyondPath Lab（免費 · waitlist 階段先 placeholder）
  · 推薦課程：[列 3 個合作的線上課程]

我們相信你會回來。
```

#### 情境 c · 通過（~38%）

```
🎉 恭喜！你通過 Tier B 認證

下一步：
  1. 簽 Worker Service Agreement（電子合約 · 律師審視中）
  2. 完成 KYC（身份證 + 銀行帳號 · 5 分鐘）
  3. 進入 worker dashboard、開始接案

  你的 Tier B 徽章已啟用 · 預估 14 天內首案媒合
  認證等級：Tier B（基礎）→ 累積 30 案 + NPS ≥ 4.0 可升 Tier A

→ [進入 Worker Dashboard →]
```

---

## §5 · Tier 升級具體 Checklist（補強 #4）

### 5.1 Worker Dashboard 內 Tier Tab 升級顯示

對齊 Framework §9 + §13 Y1 POC 條件、給 worker 看「我離下一階還差什麼」。

### 5.2 Tier B → Tier A 升級條件

**Final 定稿 checklist 文案**：

```
🎯 Tier B → Tier A 升級

當前進度：3 / 4 條件達成

  ☑ 完成 30 個案件（目前 32 / 30）
  ☑ 平均 NPS ≥ 4.0（目前 4.3 / 4.0）
  ☑ 完成「Tier A 認證培訓模組」（4 / 4 課程）
  ☐ 客戶推薦信 ≥ 3 封（目前 2 / 3）

🔓 還差：1 封客戶推薦信
  → 案件結案時、客戶可選擇「推薦此 worker」、即計入

📅 預計達成：3 個案件後（依你目前 NPS 趨勢估）

→ [查看 Tier A 認證培訓進度]
→ [下一個媒合案件]
```

### 5.3 Tier A → Tier A+ 升級條件（3 種 vertical）

#### Tier A → Tier A+ · DTC 內容自動化

```
🎯 Tier A → Tier A+ · DTC 內容自動化徽章

當前進度：2 / 4 條件達成

  ☑ DTC 領域案件 ≥ 3 個（目前 5 / 3）
  ☑ DTC 領域 NPS ≥ 4.5（目前 4.6 / 4.5）
  ☐ 完成「DTC × AI workflow 進階培訓」（2 / 6 模組）
  ☐ 通過「主審委員會口試」（尚未排程）

🔓 還差：4 個培訓模組 + 1 場口試
  → 主審委員會每季 1 場、下次：2026/Q3 開放報名
  → 培訓模組可分批完成、無時限

📅 預計達成：2-3 個月（依你目前接案頻率）

🎁 升級獎勵：
  · 案值溢價 +30-50%
  · 推薦池優先權重 +15%
  · BeyondPath Lab 免費課程 unlock
```

#### Tier A → Tier A+ · B2B SaaS GTM

```
🎯 Tier A → Tier A+ · B2B SaaS GTM 徽章

當前進度：1 / 4 條件達成

  ☑ B2B SaaS 案件 ≥ 3 個（目前 4 / 3）
  ☐ B2B SaaS NPS ≥ 4.5（目前 4.2 / 4.5、需提升）
  ☐ 完成「B2B SaaS GTM 進階培訓」（1 / 8 模組）
  ☐ 通過「主審委員會口試」（尚未排程）

🔓 還差：NPS 0.3 + 7 個培訓模組 + 1 場口試
  → NPS 提升建議：[查看 AI Coach 6 維分析]
  → B2B SaaS 培訓比 DTC 多 2 模組（因領域複雜度）

📅 預計達成：4-6 個月

🎁 升級獎勵：
  · 案值溢價 +30-50%
  · B2B 客戶池優先曝光（Y2 SG 拓展時優勢）
```

#### Tier A → Tier A+ · 品牌 DNA × AI（旗艦徽章）

```
🎯 Tier A → Tier A+ · 品牌 DNA × AI 徽章 · 最稀缺

⚠️ 這是 BeyondPath 最高難度認證、整體通過率 < 3%

當前進度：0 / 5 條件達成

  ☐ 跨領域案件 ≥ 5 個（目前 2 / 5、需 DTC + B2B + 至少 1 個其他）
  ☐ 多個領域同時 NPS ≥ 4.7（目前單領域最高 4.6）
  ☐ AI 工具熟練度 ≥ Lv5（目前 Lv4）
  ☐ 完成「品牌 DNA × AI 旗艦培訓」（0 / 12 模組）
  ☐ 通過「主審委員會 + 客戶模擬案件」雙審

🔓 這是長期目標、不是 6 個月任務
  → 一般需 12-18 個月累積
  → 通過後享：案值溢價 +50-100% + 旗艦徽章公開展示 + 跨境媒合優先

🎁 升級獎勵：
  · BeyondPath「Master Tier」名單公開展示
  · Y2 SG / Y3 MY 拓展時、優先跨境媒合
  · BeyondPath Lab 講師資格（可開課抽成）
```

### 5.4 Tier 失格 / 降階機制

**Final 定稿警示文案（出現在 worker dashboard 頂部 warning bar）**：

```
⚠️ 認證警示 · Tier 降階風險

你的最近 2 個案件 NPS：
  · 案件 #4521：NPS 2.8（低於門檻 3.0）
  · 案件 #4519：NPS 2.9（低於門檻 3.0）

⚠️ 連續 2 案 NPS < 3.0 觸發 Tier 降階預警
   下個案件 NPS ≥ 3.5 → 解除預警
   下個案件 NPS < 3.0 → 自動降階 Tier B → Tier C（限制接案）

🛟 平台支援：
  · [預約 AI Coach 1 對 1 諮詢（30 分免費）]
  · [查看你的 6 維 skill 評估]
  · [回顧低分案件回饋]

❤️ 我們相信你能回來。
```

---

## §6 · 實作備註（給卡西法 + 女巫）

### 6.1 哪些是真實規範、哪些是 prototype 展示

| 內容 | 屬性 | 說明 |
|---|---|---|
| §1 banner 文字 | ✅ Real（律師同意 prototype 階段這樣寫） | 上線前不需 review |
| §1 waitlist form | ✅ Real（form 真的能收 email） | Tally / Typeform 串好就能用 |
| §2 退款 5 情境 white text | ⚠️ Demo（律師必 review）| 上線前 §6.1 律師清單 #1 必過 |
| §3 合約 10 條 white text | ⚠️ Demo（律師必 review）| 上線前 §6.1 律師清單 #1 必過 |
| §3 紅字 3 條詳細 | ⚠️ Demo（律師必 review）| 上線前 §6.1 律師清單 #1 必過 |
| §4 worker onboarding form | ✅ Real（form 結構可用、實際 deploy 時補 KYC 對接）| KYC 對接綠界、Y1 上線前 |
| §4 個資聲明 | ⚠️ Demo（律師必 review）| 上線前 §6.1 律師清單 #1 必過 |
| §5 Tier 升級 checklist | ✅ Real（已對齊 Framework §9）| 對齊 Y1 POC 條件、可直接展示 |

### 6.2 共用 component 建議

給卡西法的 implementation 提示：

1. **`<TrustCard>` component**：Card a-e 退款情境共用、props = emoji + title + oneLine + expanded 內容
2. **`<RedFlagClause>` component**：合約 §4 / §6 / §10 紅字標示共用、props = clauseNumber + title + bullets
3. **`<ConsentCheckbox>` component**：所有勾選方塊共用、props = labelText + onCheck callback + 是否必勾
4. **`<DisclaimerBanner>` component**：top + footer 都用、props = variant (top / footer) + dismissible + content

### 6.3 a11y / i18n 提醒

- 所有勾選方塊必須 keyboard accessible（Tab / Space / Enter）
- 紅字標示不能只靠顏色（紅 + ⭐ icon + 「重大條款」label 三重提示）
- 文案預留 i18n（key-based · 不要 hardcode 中文 in JSX）
- 30 日審閱期日期動態計算（today + 30 · `Intl.DateTimeFormat` 格式化）

### 6.4 placeholder link 的處理

所有「[詳細條款 →]」「[完整個資聲明 →]」link 在 prototype 階段：
- 點擊 → 開 modal 顯示「📄 完整條款律師審視中、預計 2026 Q3 上線」
- modal 底部加「在那之前、你可以查看 [產品框架文件 →]」link → 連到 BeyondPath_Product_Framework.md GitHub URL（如有公開）
- **不可填入假條款騙投資人** · 這條沙利曼 hard rule

---

## 結語 · 給主對話蘇菲 + 卡西法 + 女巫

**沙利曼 GO/NO-GO**：
- ✅ **GO** · 此 spec 可給卡西法 implement、給女川 review 視覺呈現
- ✅ 文案均已避開正式法律條款全文、僅做 UX 展示用
- ✅ 紅字 3 條 + 30 日審閱期已對齊消保法 §17

**接縫對應**：
- §1 → 卡西法 implement banner + footer + waitlist form 串接
- §2 → 卡西法 implement Step 07 5 張 trust card + 女巫設計視覺
- §3 → 卡西法 implement Step 06 合約預覽 + 紅字 3 條展開 + 30 日審閱期勾選
- §4 → 卡西法 implement worker apply flow（如 prototype 範圍含 worker 註冊）
- §5 → 卡西法 implement worker dashboard tier tab checklist UI

**等下一步**：
1. 卡西法 implement、Gate 1 過
2. 女巫 Gate 2 review 視覺呈現（紅字配色、card layout、emoji 一致性）
3. 此 spec 進入 Trust_Compliance_Brief 的 §6 律師清單 #1（合約模板律師 review）一起送律師看

**沙利曼簽字**：本 spec 為 BeyondPath prototype v0.2 trust UX content 底線建議。所有真實合約 / 付款 / 認證機制上線前、§6.1 律師清單第 1, 2, 3 條必須完成。Gate 5 部署前再針對 prototype 公開時點審 banner 完整性 + waitlist form 安全性。

— 沙利曼 · Head of Trust & Infrastructure · 2026-05-09
