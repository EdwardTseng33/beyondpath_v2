# Synthetic User Testing · Round 2 Compare Report · 2026-05-15

> **Method**: Round 1 反饋 → ship 3 fixes → Opus 4.7 delta prompt 重評 12 persona
> **Round 1 cost**: NT$54 · 8092 output tokens
> **Round 2 cost**: NT$14 · 2567 output tokens
> **Total**: NT$68 / 12 persona × 2 輪

---

## 1 · Submit Decision 變化（before vs after fixes）

| ID | Before | After | Δ | 主因 |
|---|---|---|---|---|
| W01 | yes | **yes** | = | P2-1 解 JSON 焦慮 · 信心強化 |
| W02 | unsure | **unsure** | = | 三 fix 都沒打到她痛點（Tier 看不懂 / Brief 沒提示 / submit 後黑箱）|
| W03 | yes | **yes** | = | P2-1 對工程腦受用 · 信心強化 |
| W04 | **no** | **no** | = | fix 3 只救貼 JSON · Step 2 跳出 ChatGPT 根因未動 |
| W05 | unsure | **unsure** | = | 高 Tier senior 專屬 onboarding 沒動 |
| W06 | yes | **yes** | = | 穩定 |
| **C01** | yes | **yes** | = | P0-2 banner 直接打到痛點 · **信心強化、不再想繞過 email Edward** |
| C02 | yes | **yes** | = | P1-2 文案改 OK 但 NDA/發票仍 blocker |
| C03 | unsure | **unsure** | = | P0-2 + P1-2 改善 · 但 Tier/價格透明度仍 blocker |
| C04 | yes | **yes** | = | P1-2 改對方向（Bonus Signal）· vertical depth 仍 supply 問題 |
| C05 | unsure | **unsure** | = | P0-2 提一格信任 · 但大金額仍不放心 4 步表單 |
| C06 | yes | **yes** | = | P1-2 改善 mercy 措辭 · 發票流程仍 blocker |

**Submit 率**: round 1 = round 2 = **7/12 (58%)** · **0 變化**

---

## 2 · 但這不是「失敗」—— 深層 insight 大改

### Insight 1: 文案 fix **解信任、不解結構**

P0-2 / P1-2 / P2-1 三個都是「文案 / UX message」級 fix。Round 2 顯示：
- **既有 yes 用戶信心強化**（C01「不再想繞過去 email Edward」、W01/W03 信任更強）
- **unsure 用戶 reasoning 更精準**（從表面文案焦慮 → 深層結構問題暴露）
- **no 用戶仍 no**（W04 root cause = Step 2 跳出站、文案救不到）

文案 fix 是「retention + signal quality」工作、不是「conversion」工作。要拉 submit 率得修 **structural** issues。

### Insight 2: Unsure → Yes 的真正 blocker（這 round 真曝光）

之前 Round 1 unsure 用戶的痛點被「文案」掩蓋。Round 2 fix 文案後、Round 2 重評暴露真 blocker：

| Persona | Round 2 暴露的真 blocker | Fix scope |
|---|---|---|
| **W02** 文案半生熟 | Tier/L-Score 看不懂、submit 後黑箱、Brief 沒指引 | 中（4-6 hr · L-Score sample link + email confirmation + Brief template）|
| **W04** 中年新手 | Step 2 整個跳出 ChatGPT 流程斷裂 | 大（5-7 day · server-side chat 介面）|
| **W05** senior 設計總監 | 高 Tier 不該走同樣 onboarding | 中（4 hr · 加 Talk-to-Edward 分流）|
| **C03** 餐飲老闆 | 看不到價格區間 | 中（4 hr · 加範例 tier × 預算 mapping）|
| **C05** 傳產 NT$500k | 大金額不放心 4 步表單、想實體對接 | 中（2-3 day · Enterprise Talk-to-Edward 流程）|

### Insight 3: Yes 用戶的 remaining concerns（保留 but 不擋 conversion）

| Persona | Remaining concern | 處理時機 |
|---|---|---|
| C02 B2B SaaS | NDA / 發票 / 合約機制 | P1-3 · 2-3 day · 下個 sprint |
| C04 YouTuber | 24h 太慢 + worker pool vertical depth | 等 supply side 累積 |
| C06 NPO | 發票 / 議題 tag | 中（4 hr · 加 tag）|
| W06 RevOps | 客戶端能否勾 RevOps 領域 | 中（4 hr · client intake 加 vertical option）|

---

## 3 · 跨 round 變化模式分類

### Type A · 文案打到痛點（fix 顯著生效）
- **C01** D2C 創辦人 ← P0-2 banner 改寫直接解「為什麼不直接 email Edward」焦慮
- **C04** YouTuber ← P1-2 「希望 worker 自帶聲量」方向反轉、體驗改善
- **C06** NPO ← P1-2 「願意給新銳 worker 機會」取代「mercy」、施捨感去除
- **W01 / W03 / W04** ← P2-1 JSON parse error 友善化、新手 / 工程腦都更安心

### Type B · 文案沒打到（fix 跟痛點 mismatch）
- **W02** ← 三個 fix 都跟她痛點正交 · 仍 unsure
- **W05** ← senior tier 專屬 onboarding 痛點 · fix 沒動
- **W06** ← 7 段問題透明度 / client side RevOps 選項 · 沒動

### Type C · 結構問題（文案救不到）
- **W04** ← Step 2 paste-back 體驗斷裂 · 唯一 no submit · 救不到
- **C02** ← B2B NDA / 發票 / 合約 · 結構性 missing
- **C05** ← 大金額需要線下對接 · 流程沒設計
- **C03** ← Tier × 價格透明度 · 結構需重設

---

## 4 · Sprint 排序建議（基於 Round 2 真實 blocker）

### 🔴 P0 · Critical for conversion（拉 unsure → yes）
1. **P0-1 Worker apply server-side chat 介面**（5-7 day · 解 W04 + 改善 W02 / W05 體驗 · 預計拉 W04 no→yes、W02 unsure→yes）
2. **P0-3 Submit confirmation email**（1-2 day · Resend 開帳號 · 解 W02 anxiety + 全部用戶 trust）

### 🟠 P1 · High value（structural · 開新 client 區段）
3. **P1-3 B2B / Enterprise 流程**（2-3 day · 加 NDA/發票/Talk-to-Edward 預約 · 解 C02 / C05 + Enterprise 大金額流入 channel）
4. **價格透明度**（4 hr · Tier × 預算 mapping table · 解 C03 unsure → yes）
5. **W05 senior 分流**（4 hr · 加 Talk-to-Edward 入口 · 解 W05 unsure → yes）

### 🟢 P2 · Nice-to-have（提升 quality of lead）
6. C06 議題/公益 tag（4 hr）
7. W06 client side RevOps vertical option（4 hr）
8. W02 L-Score sample link + Brief template（4 hr）

---

## 5 · 第三輪 testing 評估

**不建議現在跑**——

理由：
- Round 2 已經暴露 deeper structural blockers
- 同 persona 同 prompt 跑第三輪 = same answer（沒新 fix 入場）
- 應該先 ship sprint plan §4 P0-P1（5-10 day scope）、再跑 Round 3 看真實 conversion lift

**Round 3 該跑的時機**：
- 等 P0-1（worker server-side chat）+ P0-3（confirmation email）+ P1-3（B2B 流程）至少 ship 1-2 條 之後
- 預期 submit 率從 7/12 (58%) → 9-10/12 (75-83%) 才算 fix 真的拉動 conversion

**或者 Round 3 換思路**：
- 不重評 same 12 persona、改設計 6 new persona 補齊覆蓋（如：學生 / 退休族 / 海外華人 client / agency 中介）
- Cost ~NT$30、捕捉 Round 1 漏掉的 user segment

---

## 6 · 結論 · 給 Edward 的 1 句話

文案 fix 已 ship、體驗改善 confirmed、但 **conversion 沒提升**——下一輪要動的是 structural backlog（worker server-side chat / B2B 流程 / 價格透明度 / submit confirmation email）才能拉 submit 率。Round 2 的真價值是把「文案是不是真因素」這條假設 disprove 掉、暴露真 blocker。

---

*Generated 2026-05-15 · Sophie via Claude Opus 4.7 · Round 1 + Round 2 共 NT$68 · 24 data points (12 persona × 2 round)*
