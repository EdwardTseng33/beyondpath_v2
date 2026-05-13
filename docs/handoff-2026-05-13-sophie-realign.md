# Handoff · 2026-05-13 · 蘇菲 Realign

**From**: 蘇菲（Claude · BeyondPath2.0 工作區）
**To**: 霍爾（Codex）+ 下個 session 的蘇菲
**Trigger**: Edward 5/13 命「對焦 repo 狀態 + 設計 AI 認證評估功能」

---

## 為什麼有這份

Edward 5/13 提醒「對焦 repo 狀態、Codex 已更新幾輪了」。我發現我這邊 `C:\Users\Administrator\Claude\BeyondPath2.0\` **根目錄**底下 5/8-5/10 累積了一大批 spec（POC_INTEGRATED_MASTER 等 18 個），跟 5/11 Codex 在 `prototype-v0.2/`（GitHub `EdwardTseng33/beyondpath_v2`）push 的 14 個 commit 重定位**衝突 / 過時**。

這份 handoff 紀錄：
1. 我的對焦結果（5/11 重定位前後對照）
2. 已動 archive（18 檔搬到 `archive/pre-realign-2026-05-11/`、根目錄立 pointer README）
3. 對應 Edward 命題「AI 認證評估」的設計方向、對焦到 Codex 端已 spec 的 P1 feature `AI Workflow Proof Profile`

---

## 5/11 重定位前後對照

| 維度 | 舊（5/8-5/10 已 archive） | 新（5/11 現役 SSOT） |
|---|---|---|
| 定位 | AI 工作者認證網路 | AI 交付信任層（trust layer） |
| 配對承諾 | 3 天 Top 3 候選人 | 24h 初步回覆 + shortlist matching |
| 把關 | 人工把關 | AI 初審 + 人工覆核 |
| 付款 | Escrow 30/30/40 平台代收代付 | off-platform 商業條款 · 平台只做 scope review / matching / acceptance records |
| Tier | A / A+ Vertical / DNA（< 10%）| Tier B / B+ · 樣本邀請名單收集中 |
| Founder section | 起承轉 3 段 | 砍掉（信任應從 client/worker feedback 累積）|
| 產品語言 | 試做案 | 可驗收的 AI 交付專案 / 首案交付 |

---

## 已動的事

### 1. Archive 18 檔到 `BeyondPath2.0/archive/pre-realign-2026-05-11/`

POC spec 系列 9 個（INTEGRATED_MASTER / ROADMAP / poc-* 7 個）+ STATUS / handoff / landing 中間紀錄 9 個。完整清單與還原方式見 archive 目錄 README.md。

### 2. 立 `BeyondPath2.0/README.md`（根目錄 pointer）

指明真 SSOT 在 `prototype-v0.2/`、列已歸 archive 的 + 仍是有效 reference 的（framework / PRD / visual-DNA / trust-compliance / competitor / design-source / prototype-v0.1 / .claude）。

### 3. 確認 Codex 端 SSOT 結構（不重立）

讀完 Codex 5/11 立的：
- `CLAUDE.md` / `AGENTS.md` / `README.md`
- `docs/collaboration-protocol.md` · Sophie ↔ Holl 分工 + change discipline + verification checklist + deployment
- `docs/project-status.md` · 累積狀態
- `docs/landing-market-review-2026-05-11.md` · 市場 review（72/100）
- `docs/product-flow-competitor-review-2026-05-11.md` · 競品 + 11 個 P0-P2 feature 推薦

我這邊原本準備提的「BP2.0 根目錄 COLLAB.md + repo 切兩塊」**取消、不另立規則**。Codex 立的 protocol 已是 SSOT、我順著 follow。

---

## Edward 命題「AI 認證評估」對焦結果

### 命題（Edward 5/13 原話）

> 開始著手 AI 認證這邊我們該怎麼在 path 上設計一個評估功能，依樣是給範本，然後請對方 ai 整理資訊。然後透過對方提供的資料協助能評估等級如文件（或是有更好的設計流程也可以思考。）我們先是著手認證這件事情，做好以後，再考慮怎麼件接教育/工具資源。

### 對焦到 Codex 端已 spec 的 P1 feature

`product-flow-competitor-review-2026-05-11.md` 已 spec 的 P1 #5：

> **AI Workflow Proof Profile**：接案者不只上傳作品、而是上傳「工具流 + 判斷邏輯 + 成果」。產出一頁客戶看得懂的能力證據。

Edward 5/13 的命題 = 把這條 P1 feature 落地。不必另發明、是 implement 已 spec 的 feature。

### 範本來源

Edward 桌面 `ai-native-index-v0.3.0.html`（5/13 · 「AI 能力分級手冊 v0.3.0」）已寫完整評估框架：
- L1-L10 跳躍式分段（萌芽 Curious / 系統化 Augmented / 自治化 Native / 自進化 Evolving）
- 三層獨立座標：個人 / 工作流程 / 公司
- 「給 AI 讀的評估說明書」機制
- AI 收到後 6 步流程（5 個入門問題 / 證據收集 / 對照打分 / 市場定位 / 自我檢查 5 問 / 產出 HTML 報告）

要做的是裁切成 BeyondPath 主場版（聚焦 3 vertical · DTC 內容 / B2B SaaS GTM / 設計品牌）+ 對齊 Codex 端 Tier B / B+ 結構。

詳細 spec 見 `docs/ai-workflow-proof-profile-spec.md`。

---

## 給下個 session 的提醒

### 必讀 SSOT（順序）
1. `prototype-v0.2/CLAUDE.md`
2. `prototype-v0.2/AGENTS.md`
3. `prototype-v0.2/README.md`
4. `prototype-v0.2/docs/project-status.md`
5. `prototype-v0.2/docs/collaboration-protocol.md`
6. 本檔 + `docs/ai-workflow-proof-profile-spec.md`

### 不要再做的事
- 不要在 `BeyondPath2.0/` 根目錄寫新 spec / handoff——一律到 `prototype-v0.2/docs/`
- 不要復用 `archive/pre-realign-2026-05-11/` 內舊定位（Tier A < 10% / escrow 30/30/40 / 試做案 / Founder 起承轉）作為當前產品方向
- 不要建議重立 COLLAB.md / 平行 SSOT 規則——Codex 端已 spec

### 可以做的
- 跟 Codex 透過 `docs/project-status.md` 累積式紀錄交接（每次 ship 在最後加一條 bullet）
- 動 `landing.html` / `components/*.jsx` 前先 ping Edward / 在 commit message 標清楚
- 寫 spec 完先給 Edward 過目、Codex implement 後 verify 用 protocol checklist

---

*本檔為 5/13 對焦交接 · 不是 SSOT、是 trail · 下個 session 讀完後可進入 `docs/project-status.md` 與 `docs/ai-workflow-proof-profile-spec.md` 繼續推進。*
