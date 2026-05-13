# AI Workflow Proof Profile · 規格 v0.1

**Owner**: 蘇菲（draft）· 待 Edward 拍板進 implement
**對應 feature**: `product-flow-competitor-review-2026-05-11.md` P1 #5
**Status**: draft · 等 Edward review 後進 round 1 implement
**Last updated**: 2026-05-13

---

## 0 · 一句話

把 BeyondPath worker 認證從「上傳作品 + 等審」升級成「**讓對方 AI 整理你的工作證據、平台 AI 初審、Edward 覆核**」——對齊 Codex 端 5/11 reposition 後的「AI 初審 + 人工覆核」承諾。

---

## 1 · 為什麼這樣設計

### 1.1 對 Worker
- 不用填表格、不用憑印象寫 portfolio——把過去案件丟給自己常用的 AI（Claude / ChatGPT / Gemini）、AI 按範本整理
- 整理出的是「工具流 + 判斷邏輯 + 成果」結構化證據、客戶看得懂、申請者也看得懂自己強在哪
- 通過後拿到「**一頁式 AI Workflow Proof Profile**」、可分享、客戶配對時直接看

### 1.2 對 Platform / Edward
- **Zero LLM cost**：Worker 用自己付費的 AI 整理、我們不付 token 費
- **AI 初審**：平台這邊只跑 schema parse + 證據強度 audit（小 prompt、低 cost）
- **人工覆核**：Edward 看 AI 初審結果 + 原 HTML、給 Tier B / B+ 決定（POC 階段 < 10 案 / 月可承擔）
- **可累積**：Acceptance records / NPS / 結案證據持續疊加進每個 worker 的 profile、形成 Codex 端強調的「**trust data layer**」

### 1.3 對 Client
- 看候選人不是看分數、是看「**這個 worker 的 AI workflow 證據**」
- 配上 Codex 端 P0 #1 spec 的 Delivery Confidence Card、可做採購決策（不只挑分數）

---

## 2 · 整體流程（4 stage）

```
Stage 1 · 取得範本
  Worker 進 app.html?role=worker&onboarding=1
  → 看到「下載 AI Workflow Proof 範本」CTA
  → 下載 worker-proof-profile-template.html

Stage 2 · 對方 AI 整理（off-platform · 我們不付 token）
  Worker 把範本 + 自己過去案件丟給常用 AI
  → AI 按範本 7 段結構整理
  → AI 產出單檔 HTML 報告（檔名建議 my-ai-workflow-proof.html）

Stage 3 · 上傳到平台
  Worker 在 onboarding flow 上傳 HTML（或先用 mailto fallback 寄到 edwardt0303@gmail.com）
  → 平台 AI 初審（parse HTML schema + 5 條 audit rule）
  → 出「初審結果」（PASS / FLAG / REJECT + 理由）

Stage 4 · Edward 覆核 + 給 Tier
  Edward 看 worker 上傳的 HTML + 平台 AI 初審結果
  → 決定：Tier B / Tier B+ / 退件補件 / 拒絕
  → 通過後 worker 進首案候選池、profile 進 client match 畫面
```

---

## 3 · 範本結構（worker-proof-profile-template.html · 7 段）

繁中、~3000 字、給對方 AI 讀的「評估說明書」格式（仿 Edward v0.3.0 手冊邏輯、但裁切聚焦 BP 主場）。

### 段 1 · 自我介紹 + 主領域
要求對方 AI 帶 worker 填：姓名（或暱稱）/ 所在地 / 主領域選 1-2 個（**DTC 內容 / B2B SaaS GTM / 設計品牌** 三個 vertical 鎖）/ 過去 2 年主要案件數量區間 / 中文母語 yes/no。

### 段 2 · AI 工具棧 + 用了多久
要求列：用過哪些 AI 工具（ChatGPT / Claude / Cursor / Make / v0.dev / Midjourney / Notion AI 等）+ 用了多久 + 主要用在什麼任務。**證據要求**：付費訂閱截圖 / Settings 頁截圖 / 自訂 prompt 或 GPT 設定截圖（任 1）。

### 段 3 · 工具流（Workflow）
這是核心段。要求對方 AI 帶 worker 描述：1-3 個「**從接到需求到交付成果**」的完整 workflow、含每一步用什麼工具、怎麼判斷下一步、卡住怎麼 fallback。範例（範本附）：
```
案例 A · DTC 品牌 IG 短影音素材週產 12 支
1. ChatGPT 把品牌 brief 拆成 12 條 hook
2. Claude 把每條 hook 寫成 30 秒腳本
3. Veo 3 / Runway 跑視覺
4. CapCut + 我手動配音 + 上字
5. Notion AI 寫 IG caption
判斷邏輯：hook < 3 秒抓眼球 / 配色對齊品牌 DNA / 字幕用人話不用書面
卡住 fallback：AI 跑出垃圾 → 改 prompt 加「拒絕模板化」/ 視覺不對 → 改種子或加風格 reference
```

### 段 4 · 過去案件成果（Evidence）
要求列 2-5 個過去案件：案件類型 / 客戶產業 / 交付物 / 用時 / 客戶反饋（NPS or 文字 or 續約 yes/no）。**證據要求**：交付物截圖 / 對話紀錄截圖 / 結案 invoice / 客戶 testimonial（任 2）。

### 段 5 · 判斷邏輯（Judgement）
要求對方 AI 訪 worker 3 條：(1) 你怎麼判斷 AI 跑出的東西能不能用？(2) 你拒絕過什麼樣的案件？為什麼？(3) 你最自豪的一次「AI 跑爛、你救回來」是什麼？

這段測**worker 是不是真會用 AI、不是只把 AI output 直接給客戶**。

### 段 6 · 報價邏輯
要求列：你怎麼定價？（按案 / 按時 / 按交付物 / 按 milestone）/ 你的價格區間 / 為什麼這個價（時間成本 / AI 工具訂閱 / 經驗值）。

### 段 7 · 自我評估（L1-L10 + 信心區間）
對方 AI 拿 Edward 的 v0.3.0 手冊 L1-L10 標準對照 worker 提供的證據、給 L 分 + 信心區間 + 「為什麼是這個分數」的證據引用。

**範本最後附**：對方 AI 自我檢查 5 問（證據夠不夠 / 是否取低 / 偏誤檢查 / 證據深淺 / 結構天花板）—— 直接 copy Edward v0.3.0 手冊的「自我檢查 5 問」段。

---

## 4 · 平台 AI 初審邏輯（5 條 audit rule）

Worker 上傳 HTML 後、平台這邊跑一次小 prompt 給 Claude：

```
你是 BeyondPath 認證 AI 初審員。讀此 worker proof profile HTML、按 5 條 audit rule 判斷：

1. Schema 完整度：7 段都有填？（缺 ≥ 2 段 → FLAG）
2. 證據強度：段 2 / 段 4 證據附齊？（< 2 件深證據 → FLAG）
3. L 分對應：對方 AI 給的 L 分跟證據對應嗎？（差 ≥ 2 級 → FLAG「自評過頭」）
4. Vertical 鎖：主領域是 DTC 內容 / B2B SaaS GTM / 設計品牌 三選 1-2？（不在 → FLAG「BP 不主打此 vertical」）
5. 紅旗檢查：拒絕過什麼案件 / AI 跑爛救回來——這兩個答得出來嗎？（答不出來 → FLAG「可能不是真實踐者」）

5 條全 PASS → 出「初審 PASS · 建議 Tier B / B+」（B+ 條件：L ≥ 7 且 至少 2 vertical 都有深證據）
任 1 FLAG → 出「初審 FLAG · 待 Edward 覆核」+ 具體理由
≥ 3 FLAG → 出「初審 REJECT」（送補件、不上 Edward queue）
```

這個 prompt 小（< 1k token in / < 500 token out）、cost 可忽略。

---

## 5 · Edward 覆核 checklist（POC 階段親自看）

打開 worker 上傳的 HTML、5 分鐘內過：

- [ ] 工具流（段 3）是不是「真的會用 AI」、不是「我會用 ChatGPT」這種空話？
- [ ] 段 4 案件證據——交付物截圖看得到實質工作嗎？
- [ ] 段 5 判斷邏輯——拒絕過什麼案件這題、答得**具體** vs **空泛**？
- [ ] 段 6 報價邏輯——市場合理嗎？離譜低或離譜高都需追問
- [ ] 段 7 自評 L 分——跟我直覺對嗎？（差 ≥ 2 級 = 異常）

通過 → Tier B（首案候選池）/ Tier B+（多 vertical / L ≥ 7 / 多深證據 = 升級）
退件 → 給 worker 「補強方向」（這對應 Codex 端 P1 #8 spec「認證回饋報告」）

---

## 6 · UI / 頁面變動（給 Codex implement 用）

### 改 `app.html?role=worker&onboarding=1`（Worker onboarding 頁）

加 3 個 UI element：

1. **下載 AI Workflow Proof 範本 CTA**（onboarding 頁第一步）
   - 文案：「先下載範本、用你常用的 AI（Claude / ChatGPT / Gemini）整理你的 AI workflow 證據、5-30 分鐘搞定」
   - 下載：`/templates/worker-proof-profile-template.html`
   - 旁邊 helper：「不知道怎麼用？看範本內附的 5 步操作說明」

2. **上傳已整理 HTML CTA**（onboarding 頁第二步）
   - 上傳目前 prototype 階段不真接、用 mailto 寄到 `edwardt0303@gmail.com`、附 helper 說明：「正式 beta 上線後會接後端、現在 prototype 階段請寄 email、Edward 24h 內回覆」
   - 跟現役 worker onboarding submitted state 對齊（已存在）

3. **Tier B / B+ 標準說明**（onboarding 頁底部 collapsible）
   - 列：什麼是 Tier B / B+ / 通過後拿到什麼 / 沒通過會給補強方向

### 改 `landing.html`（不動 hero、加一個 worker 段補強）

對齊 Codex 端 P1 #5「AI Workflow Proof Profile」、可在「我想加入 AI 接案網路」CTA 下面加一行 sub：

> 提交範本整理後的 AI workflow 證據 · AI 初審 + Edward 親自覆核 · 24h 回覆

---

## 7 · ship 順序（建議）

| Sprint | 動作 | Owner |
|---|---|---|
| **W1** | 蘇菲寫 `templates/worker-proof-profile-template.html` 草稿（~3000 字繁中、7 段、附對方 AI 操作說明 + 自我檢查 5 問）| 蘇菲 |
| **W1** | Edward review template 草稿 + 回饋 | Edward |
| **W2** | 蘇菲改 landing.html worker CTA sub + worker onboarding 頁加 download CTA + mailto submit | 蘇菲 |
| **W2** | Codex push + deploy + Vercel verify | 霍爾 |
| **W3** | 邀 3-5 個朋友圈 worker 真實跑（dogfood）· Edward 親跑 5 份 review + 校準 L 分標準 | Edward + 蘇菲 |
| **W4** | 根據 dogfood 反饋迭代 template + audit rule + Tier B/B+ 標準 | 蘇菲 + Edward |
| **後續** | 等 W4 收斂、立 spec v0.2、進 build 階段（後端 form 接收 + 平台 AI 初審 prompt 上線 + Edward audit queue UI）| 卡西法（POC v1 階段才動） |

---

## 8 · 接後續：教育 / 工具補貼

Edward 5/13 明確「先做認證、後接教育 / 工具」。認證系統 ship 後：

- **L 分 < 5 的 worker** 自然觸發「升等需要這些技能」→ 接教育資源（B2 培訓模組）
- **L 分高但工具沒到位**（如 L7 但只用 ChatGPT）→ 接工具補貼（Claude Pro / Cursor / Notion AI 訂閱補貼 NT$ 500-1,500 / 月）
- **L 分高且全 vertical 強** → 邀入 Tier B+ 旗艦池（高單價案件優先配）

這部分等認證 ship 完、第一波 worker 跑進來、看數據再 spec、本檔不展開。

---

## 9 · 跟現役 Codex spec 的對應

| Codex spec（5/11 review） | 本 spec 對應 |
|---|---|
| P0 #1 Delivery Confidence Card | 用 worker proof profile 作為 client 看候選人的內容（spec 不重複） |
| P0 #2 Scope Review 首案範圍審核 | 配合 worker proof profile · Edward 覆核 worker 後、再做 client 案件 scope review |
| P0 #3 Acceptance Criteria | 結案後累積進 worker profile 的「過去案件成果」段（feedback loop） |
| P0 #4 候選人比較表 | 用 worker proof profile 作為比較表內容（風險、適配理由、預算信心 = 從 profile 7 段抽資料）|
| **P1 #5 AI Workflow Proof Profile** | **本 spec 主菜** |
| P1 #6 首案候選池狀態 | Tier B 通過後 worker dashboard 顯示「你在 DTC vertical 候選池排序 #N」 |
| P1 #7 報價建議器 | 用 worker profile 段 6（報價邏輯）+ Tier 對應給建議價格帶 |
| P1 #8 認證回饋報告 | 沒通過時、Edward 從 audit checklist 5 條挑「最大補強方向」回給 worker（不是冷冰冰拒絕）|

本 spec 是 P1 #5 主菜、同時把 P0 #1/#4 / P1 #6/#7/#8 內容串成一條 narrative。

---

## 10 · 不做的事（鎖 scope）

- 不做後端真實 form / data submission（保持 prototype disclaimer · Codex protocol 明文鎖）
- 不做平台代收代付 / escrow（5/11 reposition 已 off-platform）
- 不做 ML 自動 Tier 升降（POC 階段 hard rule + Edward 覆核）
- 不做 KYC（POC 不收身份證 / 公司登記）
- 不展開教育 / 工具補貼（先做認證、後接）
- 不重立 Tier A / A+ Vertical / DNA 舊架構（5/11 已簡化為 Tier B / B+）

---

## 11 · Edward 拍板項

進入 W1 W2 implement 前、3 件 Edward 拍板：

1. **範本 7 段結構是否 OK**（要加 / 要刪 / 段順序）？
2. **AI 初審 5 條 audit rule 是否 OK**（紅旗檢查、vertical 鎖、L 分 ±2 偵測等）？
3. **Tier B / B+ 標準**（B+ 條件「L ≥ 7 + 2 vertical 深證據」是否合理）？

確認後我立刻動 W1 範本 HTML 草稿、寄到你信箱（或直接 ship 到 `templates/`）。

---

*v0.1 spec · 2026-05-13 蘇菲 draft · 等 Edward review*
