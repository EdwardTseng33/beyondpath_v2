# 06 · UX Audit · 蕪菁頭 用戶意圖 & 行為分析

**Date**: 2026-05-14
**Reviewer**: 🥕 蕪菁頭 (UX / User Intent · Drop-off & Friction)
**Scope**: prototype-v0.2 全 user-facing entries · 雙 persona walkthrough
**Verdict (TL;DR)**: 🛑 **NO-GO**——P0 三項先修才能進 soft launch（邀請制 beta）。P1 三項上線前完成。

---

## 1. Persona Walkthrough × 2

### 1.1 Mei · 32 歲 · DTC 保養品牌主（發案方）

**背景**：台灣有機保養品牌「芙光」主理人兼行銷。月流水 150-200 萬、IG 1.2 萬粉。試過 ChatGPT 寫文案但「沒品牌感」、Canva Pro 素材跟不上競品。這週看到 IG 有人分享 BeyondPath。

**搜尋意圖類型**：比較型（BeyondPath vs 朋友介紹 vs PTT vs 廣告代理商）。

#### 第 1 屏 · Landing Hero

Mei 看到：
- 頂部 disclaimer banner：「PROTOTYPE DEMO · 非正式服務 · 所有資料皆為模擬」（`landing.html:408-413`）
- Hero 標題：「加入 AI 工作的下一個時代。把不確定，變成可驗收的交付。」
- 三條 takeaway pills、主 CTA「我想進入 AI 發案流程 →」

**心理活動**：
- 「PROTOTYPE DEMO？這是測試版？我的需求能被認真處理嗎？」——disclaimer 動搖第一印象
- Hero 標題太抽象、「加入 AI 工作的下一個時代」對她不痛不癢、她要的是「找到人、不踩雷」
- 三條 pill 裡「把焦慮的需求、拆成範圍、交付物與驗收標準」有感
- Static bar「FIRST REVIEW 24H」「FIRST PROJECT NT$50K+」——24H 安心、NT$50K 讓她想「這是最低門檻嗎？我案子可能 5-8 萬」

點「我想進入 AI 發案流程 →」。

#### 進入 client intake（4 step）

**Step 1 Pre-intake**：選領域 + 上傳 brief。Demo brief 預填降低阻力、她改幾個字繼續。

**Step 2 Confirm**（topbar 顯示「AI Parse」⚠ bug）：
- Tier B/A/A+/S 不懂、mobile 沒有右側 Rail 說明
- 預算滑桿預設 **NT$240,000**（`app2.jsx:1092`）——她想的是 8-10 萬、心慌
- NPS 門檻「≥ 4.5 / 4.7」她以為是真實過往評分（其實沒有）

**Step 3 AI Parse**（topbar 顯示「Confirm」⚠ bug）：
- 3 秒動畫有「真在分析」的安心感
- 卡片顯示「Budget NT$184K-241K」——遠高於她預算、無解釋
- 「multi-expert DAG attached」她不懂 DAG

**Step 4 Match**：5 位候選人全 Edward（prototype 數據 bug）。她 shortlist 2 個、點 Submit。

#### IntakeSubmitModal

填 email + 公司、送出。Modal 消失、CTA 變「Continue to contract →」嚇到——以為直接簽合約。沒有確認信、沒有下一步。

**完整走完估時**：認真 15-20 分鐘 / 快走 5-8 分鐘。
**最卡關**：Step 2 Confirm + Step 3 預算。

---

### 1.2 Arc · 28 歲 · Brand Designer · AI Workflow 實踐者（接案方）

**背景**：自由接案 brand designer、做 DTC 視覺。每月 2-3 案、Threads 聲量介紹、有 Midjourney + Figma + Claude Pro。看朋友 IG 分享「通過 BeyondPath Tier B 像拿到認證書」。

**搜尋意圖類型**：交易型（明確：申請認證、看能否換穩定案源）。

#### Landing → Worker CTA

Arc F 型快速掃。注意到「Worker Console demo」是 hero 第三條 link（灰色細字、容易忽略）。點「我想加入 AI 接案網路 →」。

#### WorkerEmptyState（step=intro）

- 12 節點圓形動畫
- 標題：「You're 1 step away from the closed club. 還差一步加入 < 10%」
- 副標：「5 步 · 30-45 分鐘 · 用你自己的 AI 整理工作證據 · 24h 內 Edward 親自覆核」

**心理活動**：「< 10%」激起挑戰意願、「30-45 分鐘」讓他猶豫「現在不是時候」。點開始。

#### Step generate（複製 AI Brief + 開外部 AI）

要求離開頁面去 Claude / ChatGPT / Gemini 跑 7 段 30-45 分鐘訪談。

⚠️ **最高 drop-off 風險點**：
- 需要 context switch 到別的 app
- 訪談可能被打斷（電話、通知）
- 沒有 sessionStorage、回來 step state 重置
- 免費 AI 可能 token 限制截斷

#### Step paste → preview

Arc 貼 JSON、看到 L7 + 6 軸 skill matrix + Tier B+ 建議。能力卡有說服力——正面。但他想「客戶能看到這張嗎？」沒有說明。

#### Submitted State

⚠️ **文字矛盾**：「PROTOTYPE NOTE · 不會自動送出或儲存個資、請手動寄信給 Edward」——但 Supabase 已 wired、實際上資料已收到。

**Arc 的反應**：
- 「我輸入了那麼多、結果沒真的送出？」——信任損傷
- 困惑：要不要寄信？寄了會重複嗎？
- 2-3 天沒回音 → drop off

---

## 2. Entry Inventory（用戶角度）

| URL | 設計用途 | 用戶來這時想做 | 實際能做 | mismatch 等級 |
|---|---|---|---|---|
| `landing.html` | 主 landing | 了解產品、決定要不要試 | 讀內容、點 2 個 CTA | **基本對齊**、disclaimer 造成困惑 |
| `app.html?role=client&step=0` | 發案 intake | 開始填需求 | 走 4 步 intake、留 email | **對齊**、但 Step 3 budget 偏高、Topbar bug |
| query param 跳特定 step | 繼續未完成填寫 | refresh / back | state 不持久、跳哪都 reset | **嚴重 mismatch** |
| `app.html?role=worker&onboarding=1` | Worker 認證 | 申請 Tier B | 走 3 步 apply | **中度**、Step 2 要離開頁面 |
| `?role=worker...&submitted=1` | 申請完成頁 | 確認已收到 | 看文字 + mailto | ⚠️ **矛盾**：Supabase 已 wired vs note 說不存 |
| `?role=worker&view=worker-demo` | Worker console demo | 看通過後界面 | 看完整 dashboard | **對齊**、但 demo entry 在 landing 不顯眼 |
| `sign-in.html` | 登入 | 看帳號 dashboard | Google OAuth + role 選 | **部分 mismatch**、用戶以為有帳號實則 stateless |
| `?role=client` | 從 nav SIGN IN | 看 client dashboard | 登入後跳 client intake 重開 | **mismatch** |
| `?role=worker` | 同上 worker 版 | 看 worker 帳號 | 登入後跳 worker onboarding | **mismatch** |
| `waitlist.html` | 聯絡 | 留下聯絡方式 | 複製 email / mailto | **基本對齊**、無表單後端 |
| `mobile.html` | mobile prototype | 手機體驗 | 看 mobile 原型 | 用戶找不到入口 |
| `index.html` | Design canvas | 開發用 | 看 UI 元件 | 用戶不該看到 |

**最嚴重的 intent vs capability mismatch**：
1. `sign-in.html` 進去用戶以為有「帳號」、但 client intake 是 stateless
2. Worker submitted 頁說「不自動儲存」但 Supabase 已收到——矛盾訊息
3. Landing CTA 直接跳 intake 不需登入、但 nav SIGN IN 暗示有帳號體系

---

## 3. Friction Points 清單

### F-01 · PROTOTYPE DEMO banner 持續顯示 ⚠ critical
**位置**：`landing.html:408-413` 黑色 banner
**用戶感受**：「這不是真的服務、我不要浪費時間。」
**修法**：上線前移除、或改為 Early Beta 不帶「資料皆為模擬」字眼。

### F-02 · Topbar stepper 步驟順序錯位 ⚠ critical
**位置**：`app2.jsx:19-24` labels `[Pre-intake, AI Parse, Confirm, Match]` 但 `app2.jsx:1123-1126` 實際 render 順序 Pre-intake → Confirm → AI Parse → Match。
**用戶感受**：「我現在在哪步？我以為在做 AI Parse 但明明在填選項。」
**修法**：Topbar labels 改成 `[Pre-intake, Confirm, AI Parse, Match]` 對齊 `bp-dock` meta（`app2.jsx:1131-1133`）。

### F-03 · Worker apply Step 2 要求離開頁面 (high)
**位置**：`worker.jsx:577-645` AI_BRIEF
**用戶感受**：「我花 35 分鐘做訪談、回來頁面已刷新、我得重來。」
**修法**：sessionStorage 暫存 generate state、加說明「完成後再回來貼 JSON、不需要在同一次完成」。

### F-04 · 預算滑桿預設 NT$240,000 錨定偏高 (high)
**位置**：`app2.jsx:1092` default `budget: 240000`、但 landing 說 NT$50-100K。
**用戶感受（Mei）**：「24 萬？我預算 8-10 萬、是不是規模不夠？」
**修法**：預設值改 NT$100,000、或加說明「這是上限、不是平台最低門檻」。

### F-05 · Client intake 無 state persistence (high)
**位置**：`app2.jsx:1080-1096` state 在 React component、refresh / back 清空。
**用戶感受**：「走完 4 步資料全不見了、不想重填。」
**修法**：sessionStorage 持久化 intake state、同 session 內 back / forward 可恢復。

### F-06 · Submitted state 文字矛盾 ⚠ critical
**位置**：`worker.jsx:712-715` PROTOTYPE NOTE vs Supabase 已 wired。
**用戶感受**：「我的申請有沒被收到？要不要寄信？」
**修法**：更新文字、說明 Supabase 已儲存、不需要額外寄信。

### F-07 · Landing nav SIGN IN role=client、CTA 繞過 sign-in (mid)
**位置**：`landing.html:658-659`
**用戶感受**：「我需要帳號嗎？之前填的有被存嗎？」
**修法**：landing 或 intake 起點明確「不需要帳號、留 email 就能開始」。

### F-08 · Worker apply 無免費 AI fallback 說明 (mid)
**位置**：`worker.jsx:577` AI_BRIEF
**用戶感受**：免費版 AI token 限制截斷、不知道怎麼處理。
**修法**：加一行「若免費版截斷、可分段跑第 1-4 段 + 第 5-7 段、再合併 JSON」。

### F-09 · Mobile Tier 選項無說明 (mid)
**位置**：`app2.jsx:1171` mobile 不顯示 Rail、但 Tier B/A/A+/S 選項只在 Rail 才有說明（`app2.jsx:906-922`）。
**用戶感受**：「Tier B 跟 A+ 差在哪？」
**修法**：Tier 選項區加 tooltip 或 inline expand。

### F-10 · "0 位 worker 通過認證" 對客戶不透明 (mid)
**位置**：`landing.html:665-684` POC tracker 說「啟動內測」、但用戶不知實際有幾位通過。
**用戶感受**：等 24h 才發現「沒合格 worker」、信任損傷重。
**修法**：landing 或 intake 起點誠實「目前 beta 認證中、首批 worker 審核中、你的需求會優先媒合最快可用」。

---

## 4. Drop-off 風險點預測

### Funnel 結構

```
Client funnel:
  Landing → CTA (F1) → Step 1 Pre-intake (F2) → Step 2 Confirm (F3) →
  Step 3 AI Parse (F4) → Step 4 Match (F5) → Submit Modal (F6)

Worker funnel:
  Landing → CTA (W1) → intro → generate (W2) →
  paste (W3：離開頁面跑 AI) → preview (W4) → submit (W5)
```

### 預測掉率（無實際數據、依 UX 模式推估）

| 節點 | 預測掉率 | 主因 |
|---|---|---|
| **F1** Landing → Client CTA | 60-70% 離開 | Disclaimer banner 打信心、Hero 不夠說「Mei 適合」 |
| **F2** Pre-intake 完成 | 70% | Demo brief 預填降低阻力 |
| **F3** Confirm 完成 | 55% | Tier 不懂、budget 預設偏高 |
| **F4** AI Parse 完成 | 85% | 動畫自動跑完、但 budget 數字偏高可能棄坑 |
| **F5** Match shortlist | 80% | 候選人列表可不 shortlist 就繼續 |
| **F6** Modal 送出 | 60% | 留 email 有人猶豫、無下一步說明 |
| **W1** Landing → Worker CTA | 70-80% 離開 | 30-45 分鐘訪談讓人猶豫 |
| **W2** Intro → Generate | 60% | 「30-45 分鐘」看到就關 |
| **W3** Generate → Paste（離開頁面）| ⚠️ **40-50% 掉率最高** | 強烈 context switch |
| **W4** Paste → Preview | 80%（能回來的人）| JSON parse 可能失敗 |
| **W5** Preview → Submit | 75% | Submitted note 矛盾困惑 |

### 上線後觀察指標（Supabase 可追蹤）

- `client_intakes` 表每日新增 rows（F6 完成率）
- `worker_applications` 表每日新增 rows（W5 完成率）
- 用 email domain 分析：同 email 多次嘗試 = 卡關重試
- ⚠️ 目前無 session / step-level tracking——上線前建議加 step completion event

---

## 5. 用戶心理門檻 Audit

### 5.1 第一眼信任

**Logo / 品牌**：IBM Plex Sans 800 weight 清晰、黃色 mark、感覺「科技 startup」、不像詐騙。但缺「台灣在地感」+「已有案例」。

**寫實度**：Hero「AGENT // STREAM」動畫設計師眼中很酷、但 Mei 看不懂。Static bar「24H / NT$50K+」具體——正面。

**評估（對 Mei）**：
- 正面：設計專業、有具體承諾（24H / NT$50K+）
- 負面：Prototype banner、沒真實案例、沒照片或真人、無台灣企業背書

### 5.2 Prototype Banner 雙重影響

`landing.html:408-413` banner 是雙刃劍：

**對內部測試**：提示開發版、避免誤解——正面。

**對潛在客戶**：
- 「所有資料皆為模擬」→「worker 都是假的？」
- 「真實服務尚未開放」→「為什麼現在花時間填？」
- 「正式上線預計 2026 Q3」→「去 waitlist 就好、之後再說」

**結論**：必修。改成「Early Beta · 人工把關」而不是「這不是真的服務」。

### 5.3 「沒結案案例」turn-off

Landing 的 beta use cases（`landing.html:797-826`）是描述型（「你適合如果在找 DTC 內容產線」）、沒真實案例的 NPS / 截圖 / 品牌名。

**對 Mei 影響**：
- **高 turn-off 風險**（80%+ 用戶在意）
- 台灣中小老闆採購第一個問題是「有類似案例嗎」
- 沒案例 = 「我是第一個用、承擔全部風險」——跟 BeyondPath「信任層」定位矛盾

**對 Arc 影響**：相對低、worker 在意「通過後接得到案嗎」+「Tier 對客戶有意義嗎」、案例不是第一阻力。

**建議**：上線前不需真實案例、但要有「案型框架」——描述一個真實執行中的案型（即使是創辦人親自）、說明「如何拆 brief、如何配對、如何驗收」。

---

## 6. Must-Fix Before Launch

### Must-Fix（按 UX Impact 排序）

| 優先 | 問題 | 影響 | friction |
|---|---|---|---|
| **P0** | 移除/更新 Prototype Banner（landing.html:408-413） | 所有到站用戶第一印象 | F-01 |
| **P0** | 修正 Topbar stepper labels 順序（app2.jsx:19-24） | Intake 全程步驟迷失 | F-02 |
| **P0** | 更新 Worker submitted state 文字（worker.jsx:712-715） | 申請者信任損傷 | F-06 |
| **P1** | 預算滑桿預設 NT$240K → NT$100K（app2.jsx:1092） | Mei 看到 24 萬卻步 | F-04 |
| **P1** | Client intake state sessionStorage 持久化 | Back/refresh 清空 | F-05 |
| **P1** | Worker apply Step 2 加「中斷提醒 + 可回來繼續」 | 30-45 分鐘訪談中斷風險 | F-03 |
| **P2** | Mobile Tier 選項加 tooltip（app2.jsx Step3 Tier）| Mobile 無 Rail 說明 | F-09 |
| **P2** | Landing/intake 明確「不需帳號」 | nav SIGN IN 矛盾 | F-07 |

**P0 = 上線前必修、否則 No-Go**
**P1 = 上線前完成、影響第一批轉換率**
**P2 = 上線後 sprint 1 補**

### Nice-to-Fix（上線後 sprint 1-2 補）

- Worker apply 加免費 AI fallback 說明（F-08）
- Client intake 加「我現在沒 brief、想先了解流程」入口
- Landing 加 1-2 個「案型框架」（不需真實案例、設計成「創辦人陪跑版」）
- IntakeSubmitModal 送出後顯示明確下一步說明
- Worker apply 完成後加 email auto-acknowledgement
- 加 Supabase step-level 事件追蹤
- Landing「Worker Console demo」連結提升曝光度

### Go / No-Go Verdict

**目前狀態：🛑 No-Go、除非 P0 三項先修。**

原因：

1. **Prototype Banner（F-01）是硬傷**——正式上線後 landing 頂部仍顯示「非正式服務 · 資料皆為模擬」、每個到站客戶立刻退出。不是視覺問題、是信任崩塌。

2. **Topbar Bug（F-02）讓 Client intake 喪失導向感**——走過 4 步看到錯誤步驟名稱、「我在哪」的核心導航資訊錯誤。增加用戶對平台可靠性的懷疑。

3. **Worker submitted 文字矛盾（F-06）傷接案方第一印象**——完成 35 分鐘訪談後看到「prototype 不存、請手動寄信」、信任與動機大幅下滑。直接影響供給側初始招募。

**P0 完成後、可進入 soft launch（小規模邀請制 beta）。**

P1 項目需在第一批真實用戶使用前完成、否則轉換率數據比實際產品潛力低、影響 Y1 POC 判斷。

### 上線後立即建立的觀察機制

- Supabase `client_intakes` + `worker_applications` 每日 row 數
- 若可加：step completion event（dock CTA 點擊時記錄當前 step）
- 24h 後 Edward 的回信率 + 用戶回應率（衡量「24H 承諾」執行品質）

---

*🥕 蕪菁頭 · 2026-05-14 · 用戶意圖 & 行為分析 · NO-GO + 3 P0 + 3 P1*
