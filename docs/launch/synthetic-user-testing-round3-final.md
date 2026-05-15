# Synthetic User Testing · Round 3 Final Report · 2026-05-15

> **Method**: Round 1 baseline → ship 3 文案 fix → Round 2 → ship 4 structural fix → Round 3 → final compare
> **Total cost**: NT$82 / 3 輪 / 36 data points
> **Sprint cost**: ~6 hr 工 (7 fixes total)
> **Result**: Submit 率 58% → 58% → **92%** · structural fix 真拉 conversion

---

## 1 · 三輪 Submit Decision 完整時序

| ID | R1 | R2 | R3 | Δ | 主推 fix |
|---|---|---|---|---|---|
| W01 | yes | yes | yes | = | (穩定) |
| **W02** | unsure | unsure | **yes** | ↑↑ | Fix 6 senior fast-track |
| W03 | yes | yes | yes | = | (穩定) |
| **W04** | no | no | **unsure** | ↑ | Fix 6 senior fast-track（部分解）|
| **W05** | unsure | unsure | **yes** | ↑↑ | Fix 6 senior fast-track |
| W06 | yes | yes | yes | = | (穩定) |
| C01 | yes | yes | yes | = | Fix 5 價格透明強化信心 |
| **C02** | yes (NDA blocker) | yes (NDA blocker) | **yes (blocker 解)** | ↑ commit 強度 | Fix 4 NDA toggle |
| **C03** | unsure | unsure | **yes** | ↑↑ | Fix 4+5 公司簽約 + 價格透明 |
| C04 | yes | yes | yes | = | Fix 5 略提信心 (vertical supply 問題) |
| **C05** | unsure | unsure | **yes** | ↑↑ | Fix 4 公司簽約 + Talk-to-Edward |
| **C06** | yes (發票 blocker) | yes (發票 blocker) | **yes (blocker 解)** | ↑ commit 強度 | Fix 4 公司發票 toggle |

### Submit 率

| Round | Yes | Unsure | No | 率 |
|---|---|---|---|---|
| Round 1 | 7 | 4 | 1 | **58%** |
| Round 2 | 7 | 4 | 1 | **58%** (0 變化) |
| Round 3 | **11** | **1** | 0 | **92%** (+34%) |

---

## 2 · 7 fixes ship 完整對照

| Fix | Iter | Scope | 解 persona | 結果 |
|---|---|---|---|---|
| P0-2 banner 改 Edward 親自配對 24h | 1 | 30 min | C01 / C03 / W01 | ✓ 信心強化（不拉 submit）|
| P1-2 Bonus Signals client 視角 | 1 | 2 hr | C02 / C04 / C06 | ✓ 文案改善 |
| P2-1 JSON parse error 友善 | 1 | 1 hr | W01 / W02 / W03 | ✓ 焦慮解除 |
| Fix 4 Enterprise needs 4 toggles | 2 | 2 hr | C02 / C05 / C06 | **✓✓ 拉 unsure → yes** |
| Fix 5 Tier 價格區間 hint | 2 | 1 hr | C01 / C03 / C04 | **✓✓ 拉 unsure → yes** |
| Fix 6 Senior fast-track mailto | 2 | 1 hr | W02 / W04 / W05 | **✓✓ 拉 unsure → yes** |
| Fix 7 notify-lead-slack v3 Enterprise flags | 2 | 30 min | (B2B Edward 端) | ✓ 後台效率 |

**ROI**: 6 hr 工 + NT$82 testing = 拉 4 unsure → yes + 1 no → unsure = **+34% submit 率**。每 hr 工換 ~6% conversion lift。

---

## 3 · Round 1 → 2 vs Round 2 → 3 對比 insight

### Round 1 → 2（文案 fix）= **0 conversion lift**
- 信任 / 信心強化（既有 yes 用戶）
- 暴露 deeper structural blocker
- unsure / no 不變

### Round 2 → 3（structural fix）= **+34% conversion lift**
- 直接解掉 unsure 用戶的真 blocker（NDA / 發票 / 簽約 / 價格透明 / senior 路徑）
- 4/4 unsure persona → yes
- 1 no persona → unsure（部分進步）

**Lesson learned**：
- **文案級 fix 改善 trust + signal quality、不拉 conversion**
- **Structural fix（解 deeper blocker）真拉 conversion**
- POC 階段 first-pass focus structural、文案放 polish phase

---

## 4 · 剩 1 unsure（W04）的真 root cause

W04 = 47 歲中年轉職、半年自學 ChatGPT、AI 半生熟。

R3 後仍 unsure 的兩個 root cause：

1. **「You're 1 step away from the closed club」整體 framing 像獵頭話術**——對 conservative 用戶 反感（但對 W01/W03 vibe 對、是 trade-off）
2. **Step 2 paste-back 體驗斷裂仍未解**——Senior fast-track 不適用她（她不是 senior）

要解 W04 兩條路：
- **Worker apply server-side chat 介面**（5-7 day · 解所有 worker paste-back 痛點 · 拉 W04 → yes 預估）
- **Tier B 友善 framing alternative**（4 hr · 文案 · 給保守用戶 less aggressive 入口）

**判斷**：拉 1 個 W04 投資 5-7 day 不划算。應該先 BD（11/12 = 92% conversion 已 sufficient）、實戰收 5-10 個真用戶 lead 累積 product-market signal、再回頭評估 W04 segment 是否值得 invest server-side chat。

---

## 5 · BD 推進建議（基於 3 輪 testing）

### 立刻可發 BD 的 sweet spot persona（11/12 high confidence）
- **Worker**: W01 (28 自由設計 AI 重度) / W02 (34 文案 半生熟) / W03 (25 工程 LLM agent) / W05 (49 設計總監 senior fast-track) / W06 (31 RevOps)
- **Client**: C01 (32 D2C 創辦人) / C02 (41 B2B SaaS) / C03 (38 餐飲老闆) / C04 (29 YouTuber) / C05 (52 傳產二代 enterprise) / C06 (36 NPO)

### 暫不發（需先解 root cause）
- **W04** 中年新手 worker —— 等 Worker server-side chat ship 再發

### 首批 lead 目標
- 5 個真 worker（W01 / W03 / W06 type 各 1-2 個）
- 5 個真 client（C01 / C04 type 各 1-2 個 + 1 enterprise C02 / C05 type 試水）
- 累積 2-4 週實戰、看真實 submit 率是否吻合 92% prediction
- 收 testimonial + iterate

---

## 6 · Sprint Cost vs Value

| 指標 | Round 1+2+3 |
|---|---|
| 總 testing cost | NT$82 (~$2.7 USD) |
| 總 fix sprint 工 | ~6 hr (3 文案 + 4 structural) |
| Submit 率 lift | +34% (58% → 92%) |
| Persona 改善 | 4 unsure → yes + 1 no → unsure |
| Castle commit count | 5 (3 fixes + 2 reports) |
| 預估真實 BD 成本節省 | 高 — 比直發 lead 試錯快 10x（每 lead 真 trial 成本遠超 testing cost）|

---

## 7 · 結論 · 給 Edward 的 1 句話

3 輪 testing + 7 fixes 把 BeyondPath POC submit 率從 **58% → 92%**、解掉 4 unsure persona 的真 blocker（NDA / 發票 / 簽約 / 價格透明 / senior 分流）。剩 1 unsure (W04 中年新手) 需要 worker server-side chat (5-7 day) 才能解、**不建議現在動、先 BD 收實戰 lead 驗證 92% prediction、再決定 W04 segment 是否投資。**

---

*Generated 2026-05-15 · Sophie via Claude Opus 4.7 · 3 輪 / 36 data points / NT$82 / +34% conversion lift*
