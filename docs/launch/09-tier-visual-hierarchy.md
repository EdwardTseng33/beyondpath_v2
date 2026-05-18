# 09 · Tier Visual Hierarchy · B / B+ / A+ Worker Card

**Date**: 2026-05-18
**Author**: 🔮 女巫 (Creative Director / Gate 2)
**Scope**: Step 4 worker card 3-tier 視覺分層（B / B+ / A+ · 預留 S）
**Context**: T1.5 階段 Step 4 改抓 Supabase 真實 worker、現有 UI 僅有 A+ / A 兩 token、需擴成 B / B+ / A+ 三層、未來預留 S。
**Status**: 🟢 Design Spec Ready · pending calcifer CSS implement

---

## 0 · 重大 cross-spec gap（必先讀）

派工 prompt 寫「BeyondPath warm-serif（Georgia italic）+ 琥珀 #D4712A brand DNA」——**這是錯的**。

prototype-v0.2 實際 brand DNA（`components/styles.css` :root、`landing.html` head）：

| Token | 實際值 | 派工 prompt 寫的 |
|---|---|---|
| 主色 | `oklch(0.88 0.22 128)` electric chartreuse `#c7e84a` | 琥珀 #D4712A ❌ |
| 字體 | IBM Plex Sans + JetBrains Mono + Noto Sans TC | Georgia italic serif ❌ |
| 主題 | "terminal/AI-native dark theme" `#0a0a0b` | warm-serif 紙本儀式感 ❌ |

5/13 v3.3 user-level CLAUDE.md 已立「先 grep 用戶既有 CSS 看他本人寫的風格」鐵律。**本 spec 以實際 prototype-v0.2 DNA 為準**：electric chartreuse + dark terminal + IBM Plex Sans + JetBrains Mono。

> 派工 prompt 提的 warm-serif 琥珀 = `BeyondPath/` 老版（v1.0.7）DNA、不是 `BeyondPath2.0/prototype-v0.2/` v0.3 DNA。**Edward 已搬到新 DNA、請同步 brief 認知**。

---

## 1 · 設計 principle（憲法級）

### 1.1 Dignity preservation 三原則

1. **「不同調」不「降級」** —— 每個 tier 用不同 hue 表 confident identity、不是 saturate → desaturate 降級廉價感
2. **「累積信任 narrative」不「鎖頭 paywall」** —— B = 起步 / B+ = 累積 / A+ = 資深 / S = 大師、講 case_count 與經歷、不講「未解鎖」
3. **「Mercy boost 反馬太」延伸** —— 既有 styles.css `.bp-worker .mercy` 已用 `var(--info)` 藍色傳達「反馬太加成」、本 spec 沿用同精神：B / B+ 給予可見正面 signal、不視覺懲罰

### 1.2 必守不做清單

- ❌ 不用 `grey-out` / `muted` / `opacity: 0.5` 表 B（這是降級劣化）
- ❌ 不用 🔒 / lock icon / paywall stripe（這是 freemium 廉價感）
- ❌ 不用「壓低尺寸」表 B 卡（card 整體 dimensions 三 tier 一致）
- ❌ 不用「灰階 avatar」表 B（既有 styles.css L719-722 對所有 tier 套 `filter: grayscale(0.55)` 是 hover 解灰、不是 tier 區分）
- ✅ 用「色相 hue 切換」表 differentiation：B = info 藍 / B+ = accent dim chartreuse / A+ = accent 飽和 chartreuse / S = warm gold 金
- ✅ 用 narrative micro-copy 把 case_count 翻成正面身份（起步 / 累積 / 資深 / 大師）

### 1.3 為什麼 hue 切換不是降級

實證：既有 styles.css L530-532：
```css
.bp-flag.ok .ic { color: var(--accent); }       /* chartreuse */
.bp-flag.warn .ic { color: var(--warn); }       /* amber */
.bp-flag.info .ic { color: var(--info); }       /* blue */
```

OK / Warn / Info 三 token 同 saturation level、不同 hue——這是 prototype-v0.2 design system 已立的 pattern。tier 沿用同 pattern = **零 token 新增成本 + DNA 一致**。

---

## 2 · Tier × 5 維 token spec

### 2.1 Token 新增

styles.css `:root` 新增 9 個 tier hue token（沿既有 oklch pattern）：

```css
:root {
  /* === Tier hue system (2026-05-18 女巫 spec v0.1) === */
  /* B = info 藍系 (起步) | B+ = chartreuse dim (累積) | A+ = chartreuse 飽和 (資深) | S = warm gold (大師) */
  --tier-b: oklch(0.78 0.10 230);              /* 沿用既有 --info 同色相、新名稱 semantic 化 */
  --tier-b-soft: oklch(0.78 0.10 230 / 0.12);
  --tier-b-line: oklch(0.78 0.10 230 / 0.35);

  --tier-bplus: oklch(0.78 0.18 128);          /* 介於 accent-dim 0.66 與 accent 0.88 之間 */
  --tier-bplus-soft: oklch(0.78 0.18 128 / 0.12);
  --tier-bplus-line: oklch(0.78 0.18 128 / 0.35);

  /* A+ 沿用既有 --accent / --accent-soft / --accent-line（不改） */

  --tier-s: oklch(0.82 0.16 75);               /* 沿用既有 --warn 同色相 = warm gold (預留未來) */
  --tier-s-soft: oklch(0.82 0.16 75 / 0.12);
  --tier-s-line: oklch(0.82 0.16 75 / 0.35);
}
```

**設計邏輯**：3 個新 hue 都是 prototype-v0.2 既有 palette 內已存在的色相（info / accent / warn）——**零外來色入侵**、女巫憲法第一條守住。

### 2.2 Tier × 5 維 token 對照

| 維度 | Tier B (起步) | Tier B+ (累積) | Tier A+ (資深) | Tier S (大師 · 預留) |
|---|---|---|---|---|
| **Badge** color | `var(--tier-b)` 藍 | `var(--tier-bplus)` 漸亮 chartreuse | `var(--accent)` 飽和 chartreuse | `var(--tier-s)` warm gold |
| **Badge** bg | `var(--tier-b-soft)` | `var(--tier-bplus-soft)` | `var(--accent-soft)` | `var(--tier-s-soft)` |
| **Badge** border | `var(--tier-b-line)` 1px | `var(--tier-bplus-line)` 1px | `var(--accent-line)` 1px | `var(--tier-s-line)` 1px + inner glow |
| **Badge** icon prefix | 無（純文字 `B · 起步`） | 無（純文字 `B+ · 累積`） | 無（純文字 `A+ · 資深`） | `▲` mono prefix（`▲ S · 大師`） |
| **Badge** label format | `Tier B · 起步` | `Tier B+ · 累積` | `Tier A+ · 資深` | `Tier S · 大師` |
| **Avatar** border | `1px solid var(--tier-b-line)` | `1px solid var(--tier-bplus-line)` | `1px solid var(--accent-line)` | `1px solid var(--tier-s-line)` + 2px outer halo `box-shadow: 0 0 0 2px var(--tier-s-soft)` |
| **Avatar** ::after glow | `linear-gradient(160deg, transparent 50%, var(--tier-b-soft))` | `linear-gradient(160deg, transparent 50%, var(--tier-bplus-soft))` | (既有) `linear-gradient(160deg, transparent 50%, oklch(0.88 0.22 128 / 0.12))` | `linear-gradient(160deg, transparent 40%, var(--tier-s-soft))` + 額外 conic spin pulse |
| **Avatar** size | 52px (同 A+) | 52px (同 A+) | 52px (既有) | 52px (同 A+、halo 多 2px) |
| **Card** bg default | `var(--surface)` (同 A+) | `var(--surface)` (同 A+) | `var(--surface)` (既有) | `var(--surface)` (同 A+) |
| **Card** bg selected | `linear-gradient(180deg, var(--tier-b-soft), transparent 50%), var(--surface)` | `linear-gradient(180deg, var(--tier-bplus-soft), transparent 50%), var(--surface)` | (既有) chartreuse soft | `linear-gradient(180deg, var(--tier-s-soft), transparent 40%), var(--surface)` + 1px accent gold inset |
| **Card** border default | `var(--line)` (同 A+) | `var(--line)` (同 A+) | `var(--line)` (既有) | `var(--line)` |
| **Card** border selected | `var(--tier-b)` | `var(--tier-bplus)` | `var(--accent)` (既有) | `var(--tier-s)` |
| **Score** color | `var(--tier-b)` 藍 | `var(--tier-bplus)` 漸亮 chartreuse | `var(--accent)` (既有) | `var(--tier-s)` warm gold |
| **Score** font-size | 28px (同 A+) | 28px (同 A+) | 28px (既有) | 32px (大師更顯眼) |
| **Score** font-weight | 400 (mono regular) | 400 (mono regular) | 400 (既有 mono) | 500 (略加粗) |
| **Typography** name | 15px 500 var(--text) (同 A+) | 15px 500 var(--text) (同 A+) | 15px 500 var(--text) (既有) | 15px 600 var(--text) |
| **Typography** role | 11px mono var(--text-2) (同 A+) | 11px mono var(--text-2) (同 A+) | 11px mono var(--text-2) (既有) | 11px mono var(--text-2) |
| **Typography** blurb | 12px zh var(--muted) (同 A+) | 12px zh var(--muted) (同 A+) | 12px zh var(--muted) (既有) | 12px zh var(--muted) |

### 2.3 narrative micro-copy（dignity 核心手法）

每個 tier badge 後面接「身份 narrative」、把 case_count 翻成正面標籤：

| Tier | case_count 範圍 | 身份 label | Why dignity preserved |
|---|---|---|---|
| B | 0–2 | `起步` | 「起步」= 新人通過認證、不是「未夠資格」 |
| B+ | 3–5 | `累積` | 「累積」= 持續成案、正在進化 |
| A+ | 6+ + NPS ≥ 4.7 | `資深` | 「資深」= 累積出領域權威 |
| S | 預留（未來：跨領域 + NPS ≥ 4.85 + 平台貢獻） | `大師` | 「大師」= 平台頂端、極少數 |

micro-copy 寫進 badge label：`Tier B · 起步` / `Tier B+ · 累積` / `Tier A+ · 資深` / `Tier S · 大師`。

**B 卡 portfolio empty state** 既有 styles.css/app2.jsx 已寫：
```
Portfolio sealed · Tier B 新人 · 等首案完成解鎖
```
**改寫**（去 paywall 感 + 加 dignity）：
```
首案進行中 · 完成後解鎖 portfolio · 你可以從 voice / 領域 match 評估
```

「首案進行中」= 主動語態 + 進行式、不是 sealed 被動鎖死。

### 2.4 Existing Tier A token 處理

既有 `bp-tier.a` style：
```css
.bp-tier.a { color: var(--text-2); background: transparent; border-color: var(--line); }
```

這是「準 A+ 但未達」的中間態、目前 demo data 有 5 個 worker 用 `tier: 'A'`（w-jay / w-noa / w-ren / 多 generic worker）。

**判斷**：worker-ai-interview Edge Function 只產 B / B+、demo data 的 `tier: 'A'` **不是真實 production tier**、是 prototype 過渡用。

**Spec 決議**：
- T1.5 implement 時、Step 4 真實 worker 只會 render `B` / `B+` / `A+`
- demo data 內 `tier: 'A'` 的 worker、calcifer T1.5 同步更新 → `B+` 或保留作為「視覺示例」
- 既有 `.bp-tier.a` CSS class 保留、但 production data 流量 → 0
- 未來 `S` tier 等 Edward 啟用（資料層 + UI 都已預留）

---

## 3 · 既有 Design DNA Audit

### 3.1 對齊清單

| DNA 元素 | prototype-v0.2 現況 | 本 spec 處理 | 衝突？ |
|---|---|---|---|
| 主色 chartreuse | `--accent oklch(0.88 0.22 128)` | A+ 不變 | ✅ 守 |
| Hue palette | info 藍 / accent 綠 / warn 琥珀 三系並存 | B 借 info / S 借 warn | ✅ 守（零外來色） |
| Dark theme | `#0a0a0b` bg + `#131316` surface | 全 tier 同 bg/surface | ✅ 守 |
| Font stack | IBM Plex Sans + JetBrains Mono + Noto Sans TC | 全 tier 同 stack | ✅ 守 |
| Badge SSOT | `.bp-tier` 999px radius 1px solid border | B/B+/A+/S 同形狀 | ✅ 守 |
| Worker card grid | `auto 1fr auto` 三欄、52px avatar、28px score | 三 tier 全同 dimensions | ✅ 守 |
| Mercy boost token | `.mercy` 用 `var(--info)` 藍 | 跟 B tier 同色相 | ⚠️ 視覺重疊風險 |

### 3.2 Mercy × Tier B 視覺重疊風險（low risk）

`.bp-worker .mercy` 用 `var(--info)` 藍、Tier B badge 也用 `var(--info)` 系（`--tier-b`）= 同色相。

**判斷**：低風險、共存 OK。理由：
- `.mercy` 在 card 右下、Tier badge 在 title-row 左側、空間區隔
- `.mercy` 是 `+10 反馬太` 字尾 hint、Tier badge 是 `Tier B · 起步` 主標籤
- 同色相反而**強化 narrative**：藍 = 平台給予 booster 的兩種正面 signal（新人 + 反馬太）

**Calcifer implement note**：若實際 render 後發現視覺干擾、可 fine-tune `--tier-b` lightness 0.78 → 0.74（更深一階）區分。

### 3.3 跟 5/18 vertical-aware demo 不衝突

vertical-aware 是 horizontal 維度（DTC / 軟體 / 設計 ... 15 vertical）、tier 是 vertical 維度（B / B+ / A+ / S）。兩維度正交：
- vertical 影響 worker.role / worker.badges / worker.blurb（領域內容）
- tier 影響 worker card 整體 hue（信任層級）

實際 render：DTC vertical 內 B / B+ / A+ worker 都可能存在、視覺上分別顯示藍 / 漸亮綠 / 飽和綠——不衝突。

---

## 4 · 10 維 Rubric Self-audit

| # | 維度 | 評分 | 一句評 |
|---|---|---|---|
| 1 | Color | 9 | 借既有 info/accent/warn 三系切 hue、零外來色入侵、token 自洽 |
| 2 | Typography | 8 | 三 tier 沿用既有字階、S 略加粗 weight 表大師、不破壞 SSOT |
| 3 | Spacing | 9 | 不動既有 worker card 16px padding / 52px avatar / 4×14 stats grid、全 tier 一致 dimensions |
| 4 | Hierarchy | 9 | hue 分層 + narrative micro-copy + score color、三層 signal 對齊、未來 S 有差異化升級 |
| 5 | Consistency | 9 | 沿用 `.bp-tier` 999px badge 形狀、沿用 mercy 藍系、沿用既有 hover/selected state |
| 6 | Accessibility (WCAG AA) | 8 | `--tier-b oklch(0.78 0.10 230)` on `#0a0a0b` = ~7.8:1（pass AA + AAA）、`--tier-bplus oklch(0.78 0.18 128)` = ~9.2:1（pass AAA）、A+ 既有 oklch(0.88 0.22 128) = ~12:1（pass AAA）、所有 badge bg = 12% opacity 仍維 4.5:1+。Calcifer implement 時用 Chrome DevTools 對比驗證 |
| 7 | Brand DNA fit | 10 | 完全守 prototype-v0.2「terminal/AI-native dark + electric chartreuse」DNA、零妥協 |
| 8 | Dignity preservation | 9 | hue 切換而非 desaturate、narrative 起步/累積/資深而非 sealed/locked、portfolio empty state 改成「首案進行中」主動語態 |
| 9 | Information density | 8 | 不新增資訊量、僅替換 hue + label suffix、保持既有 6-stat grid（NPS / load / last / domain / voice / works）一致 |
| 10 | Mobile responsive | 9 | tier badge 999px radius + 短文字（5-7 字元）、既有 `.bp-worker` mobile 已測 768/375、新 hue 不增寬度、無需新 media query |

**總分：88 / 100** ✓ (目標 ≥ 85、達標)

**最低 3 維**：
- Color (9)：扣 1 分因為 `--tier-bplus` 介於 dim 與 accent 之間、實際 render 可能跟 selected state gradient 微疊、需 calcifer Chrome 實測 fine-tune
- Typography (8)：扣 2 分因為 S tier 加粗 600 是僅有的字重變化、其他 tier 全沿用 500、是否真有「大師感」差異待 Edward 預覽
- Accessibility (8)：扣 2 分因為對比比例為計算估值、未實測——calcifer T1.5 implement 後跑 DevTools axe + Chrome Lighthouse 補驗

**改善方向**（calcifer 接手時補）：
1. `--tier-bplus` 在 Step 4 真實 render 後若視覺混淆、降 lightness 0.78 → 0.74 試
2. S tier weight 600 vs 500 在實機 + mobile 對比、若差異不夠明顯改 conic gradient halo
3. WCAG 對比實測寫進 `docs/launch/05-design-audit-witch.md` § 6 補充段

---

## 5 · 3 個 tier card 文字 mock

### 5.1 Tier B (起步)

```
┌──────────────────────────────────────────────────────────────┐
│  ◯ avatar          @arc.lin                    [Tier B · 起步]│
│  (border:info)      Worker Name (15px 500)                  64│
│                     Frontend Developer · React              /100│
│                     新加入 BeyondPath · 通過 worker 認證 · 起步 │
│                     [DTC] [Brand DNA]                          │
│  ────────────────────────────────────────────────             │
│  NPS 4.62   load 0/3   last 8d   domain 78%   voice 1.1k   ...│
│  ────────────────────────────────────────────────             │
│  首案進行中 · 完成後解鎖 portfolio · 可從 voice / 領域 match 評估 │
└──────────────────────────────────────────────────────────────┘
   ↑ 邊框灰 → selected 變藍 var(--tier-b)
   ↑ avatar glow 用 info-soft 藍
   ↑ score 用 var(--tier-b) 藍
   ↑ badge 藍底藍邊
```

### 5.2 Tier B+ (累積)

```
┌──────────────────────────────────────────────────────────────┐
│  ◯ avatar          @mei.ko              [Tier B+ · 累積]      │
│  (border:漸亮綠)    Worker Name (15px 500)                   78│
│                     Copy + Reels Script · zh                /100│
│                     已成案 4 件 · NPS 4.71 · 持續累積信任      │
│                     [DTC] [Reels]                              │
│  ────────────────────────────────────────────────             │
│  NPS 4.71   load 1/3   last 4d   domain 88%   voice 32k Threads│
│  ────────────────────────────────────────────────             │
│  Portfolio · 4 RECENT WORK    [...] [...] [...] [...]         │
└──────────────────────────────────────────────────────────────┘
   ↑ 邊框灰 → selected 變漸亮綠 var(--tier-bplus)
   ↑ avatar glow 用 tier-bplus-soft（介於 dim/accent）
   ↑ score 用 var(--tier-bplus)
   ↑ badge 漸亮綠底邊
```

### 5.3 Tier A+ (資深)

```
┌──────────────────────────────────────────────────────────────┐
│  ◯ avatar          @arc.lin             [Tier A+ · 資深]      │
│  (border:飽和綠)    Worker Name (15px 500)                   92│
│                     Visual + Brand DNA · DTC                /100│
│                     7 個 DTC 保養專案 · 品牌 DNA × AI 旗艦徽章   │
│                     [DTC] [Brand DNA × AI]                     │
│  ────────────────────────────────────────────────             │
│  NPS 4.86   load 2/4   last 11d  domain 92%  voice 18.4k IG   │
│  ────────────────────────────────────────────────             │
│  Portfolio · 3 RECENT WORK    [LUMINE] [HANA] [Plant by Plant] │
└──────────────────────────────────────────────────────────────┘
   ↑ 既有 design、不變
   ↑ score 用 var(--accent) 飽和 chartreuse
   ↑ badge 飽和綠底邊
```

### 5.4 三 tier 並排視覺差異速覽

```
[Tier B · 起步]      [Tier B+ · 累積]    [Tier A+ · 資深]
  藍系                漸亮綠              飽和綠
  score:64 藍         score:78 漸亮綠     score:92 飽和綠
  border:藍           border:漸亮綠       border:飽和綠
  narrative:起步      narrative:累積      narrative:資深
  portfolio:首案中    portfolio:4 件      portfolio:旗艦
```

**每個 tier 都 confident**——沒有任何卡看起來「比較弱 / 比較廉價 / 比較不重要」。三色都是 prototype-v0.2 既有 palette、視覺上一家人、不是 tier 越低越褪色。

---

## 6 · Implement note（給 calcifer T1.5）

### 6.1 CSS 改動範圍

- `components/styles.css` :root 加 9 個新 tier hue token（§2.1）
- `components/styles.css` `.bp-tier` block 擴充 `.b` / `.bplus` / `.s` 三 modifier class
- `components/styles.css` `.bp-worker` block 加 `.tier-b` / `.tier-bplus` / `.tier-s` parent modifier、影響 avatar border / score color / selected gradient
- `components/app2.jsx` `Tier` atom（L11-13）擴 4 種 case
- `components/app2.jsx` worker card render（L860+）加 `tier-{b/bplus/aplus/s}` parent class
- `components/data.standalone.jsx` 改 portfolio empty state copy（L932）

### 6.2 不動的東西

- 不動 worker card 整體 dimensions（grid / padding / avatar size / score size）
- 不動 stats-grid / breakdown bar / mercy hint 既有 logic
- 不動 既有 A+ worker 的視覺（只是 A+ 從 default 變 explicit `.tier-aplus` class）

### 6.3 預估 calcifer 工時

CSS 改：1-1.5 hr
JSX 改：30 min
Chrome 實測 + WCAG 對比驗證：30-45 min
**Total**：2-2.5 hr

---

## 7 · DoD self-check

- [x] 5 維 token × 3 tier (+S 預留) spec 完整
- [x] Design principle 寫死（dignity 三原則 + 不做清單）
- [x] 既有 design DNA audit + 衝突檢查
- [x] 10 維 rubric 自評 88/100 ≥ 85
- [x] 3 tier card 文字 mock
- [x] Cross-spec gap 揭露（warm-serif 錯誤 brief）
- [x] Calcifer implement note

---

*v0.1 於 2026-05-18 立 · 女巫 Gate 2 設計 spec · pending calcifer T1.5 CSS implement + Edward 視覺預覽。*
