# 05 · Design Audit · 女巫 Gate 2 視覺檢修

**Date**: 2026-05-14
**Reviewer**: 🔮 女巫 (Creative Director / Gate 2)
**Scope**: prototype-v0.2 全 6 entries + 2 component bundles 上線前視覺一致性
**Verdict (TL;DR)**: 🟡 **CONDITIONAL GO** — 6 個 must-fix 修完即可上線、不影響核心 DNA、皆為小修

---

## 1. Cross-entry 視覺一致性 audit

### 1.1 Logo / heromark 三套並存 ⚠️ critical

| Entry | Logo mark spec | File:line |
|---|---|---|
| `landing.html` | Nav: 800 22px sans-serif text；Hero: `<Heromark>` 360px orbital SVG（5 tier 公轉） | landing.html:430-489, 645 |
| `sign-in.html` | `.si-top .mark` 16×16 `border-radius: 4px` + `linear-gradient(135deg, var(--accent), oklch(0.72 0.14 100))` | sign-in.html:38 |
| `waitlist.html` | `.wl-mark` 16×16 `border-radius: 4px` + 純色 `var(--accent)` + `box-shadow 0 0 0 4px rgba(199,232,74,0.08)` | waitlist.html:33 |
| `app.html` (shell) | `.bp-shell-mark` 14×14 `border-radius: 3px` + `linear-gradient(135deg,#c7e84a,#86b800)` | app.html:66 |
| `worker.jsx` (intake) | `.bp-logo-mark` 14×14 `clip-path: polygon(50% 0, 100% 100%, 0 100%)` 三角 | styles.css:79-84 |

**問題**：5 個 entries 5 套 logo mark。styles.css L79 定義的三角 mark 是設計系統 SSOT、但 sign-in / waitlist / app.html shell 各自重發明圓角方塊。**降低品牌辨識度**。

**Fix（must）**：sign-in.html、waitlist.html、app.html shell 三處的 `.mark` 都改用 `clip-path` 三角（沿用 `.bp-logo-mark`）或統一為 4px 純色方塊一致——擇一即可。建議統一用三角（已是 styles.css SSOT）。

### 1.2 Token 一致性

✓ **chartreuse 統一**：6 entries 都用 `#c7e84a` / `var(--accent)` / `oklch(0.88 0.22 128)`，沒外來色入侵。
✓ **font stack 統一**：IBM Plex Sans + JetBrains Mono + Noto Sans TC 三家串到底。
✓ **dark bg 統一**：所有 entries 都 `#0a0a0b` / `var(--bg)`。

### 1.3 padding 不一致

| Entry | Top bar padding | File:line |
|---|---|---|
| landing | `14px 56px`（scrolled 改 10px） | landing.html:68, 81 |
| sign-in | `18px 32px` | sign-in.html:37 |
| waitlist | `18px 32px` | waitlist.html:31 |
| app.html | `10px 18px` | app.html:63 |

**影響輕微**：每個 entry 內部一致、跨 entry 切換時 nav 高度跳。
**Fix（nice）**：不必為 launch fix、放 v0.3+。

### 1.4 IntakeSubmitModal vs Worker apply intro 風格不齊 ⚠️ critical

5/14 新加的 IntakeSubmitModal（app2.jsx:1021-1069）全用 inline style + hardcoded color，跟 styles.css token 系統脫節：

| 屬性 | IntakeSubmitModal | styles.css SSOT (.bp-btn / .bp-input / .bp-panel) | 落差 |
|---|---|---|---|
| primary button padding | `12px 18px` | `9px 14px` | +33% |
| input padding | `12px 14px` font 15 | `10px 12px` font 13 | +20% |
| modal border | `1px solid rgba(199,232,74,0.4)` 寫死 | 應該 `var(--accent-line)` | hardcoded |
| 字體 | `"Noto Sans TC, sans-serif"` 寫死 | 應該 `var(--zh)` | hardcoded |
| 背景 | `#0a0a0b` 寫死 | 應該 `var(--bg)` 或 `var(--surface)` | hardcoded |

對比 worker apply 的 `bp-onboarding` / `bp-onb-card`（worker.jsx:751-822）= 純 token + class 化、是設計系統正確姿勢。

**Fix（must）**：IntakeSubmitModal 整段重構成 token 化 + 抽 `.bp-modal` / `.bp-modal-card` 共用 class 到 styles.css、給未來其他 modal（合約 confirm / cancel 流程）用。

---

## 2. Brand DNA 對齊

### 2.1 Chartreuse 出現密度

✓ landing.html：accent 出現 ~40 次（hero eyebrow / CTA / nav active / heromark / tier ladder / engine mock / orbital）= 飽和但合理（這是 brand 主頁）
✓ sign-in：accent 出現 ~12 次（eyebrow / disclaimer dot / role select active / google button hover / form footer link）= 適當留白
✓ waitlist：accent 出現 ~8 次（eyebrow / mark / note bg / email code / CTA / role 拉到 footer link）= 簡單頁面留白足夠
✓ app.html shell / worker.jsx：accent 在 active state / progress bar / score / tier A+ = 功能性 highlight 正確

### 2.2 字體配重

✓ EN mono + zh sans 對位一致（landing hero `clamp(40px, 5.4vw, 84px) 800 zh` / sign-in `28px 700 zh` / waitlist `40px 800 zh` / worker `30px 500 sans`）—— 每頁有 hero scale、但 font-weight 不齊：
- landing hero 800
- sign-in si-h 700
- waitlist wl-h 800
- worker bp-h1 500

**判斷**：worker.jsx `.bp-h1` 500 是工具型內頁、不必跟 marketing 頁同重。sign-in 卡片標題用 700 比 800 輕——合理（sign-in 不需 marketing 厚重感）。**這個落差 OK、不修**。

### 2.3 zh body 留白規則

✓ landing 用了 `word-break: keep-all; text-wrap: balance; font-feature-settings: "palt" 1, "kern" 1`（landing.html:92-103）—— **這是 zh 排版的 best practice、其他 entries 都沒**：
- sign-in.html **無** zh-Hant 排版規則
- waitlist.html **無** zh-Hant 排版規則
- app.html **無** zh-Hant 排版規則

**Fix（nice）**：把 landing.html L92-103 那段 `:lang(zh-Hant) h1, :lang(zh-Hant) h2` 移到 styles.css 變全域、所有 entries inherit。**不修也不影響上線、但中文標題的「不要在不該斷的字斷行」品質會提升**。

---

## 3. Responsive audit

### 3.1 Desktop 1280+ ✓

所有 entries 在 1280+ 看 OK。landing 用 max-width 1320 居中、worker dashboard 用 `grid-template-columns: 1fr 360px` rail layout、sign-in/waitlist 用 max-width 440/660 card 居中——都通。

### 3.2 Tablet 768 ✓

- landing：`@media (max-width: 1200px)` engines 改 2col / verticals 改 3col、`@media (max-width: 1100px)` tier-split 改 single col——OK
- worker dashboard：styles.css L167 `@media (max-width: 1380px)` 將 tier-ladder 從 5col → 3col——OK
- sign-in / waitlist：本來就 max-width card、tablet 沒問題

### 3.3 Mobile 375 ⚠️ 多處需注意

#### 3.3.1 mobile.html ⚠️ critical
**問題**：mobile.html:57-62 disclaimer banner 是 `position: fixed; top: 0`、但 body L16-23 沒對應 padding-top、而是 padding 32px 16px——**banner 蓋住 iPhone frame 頂端 ~30-40px**。

**Fix（must）**：mobile.html L17 `padding: 32px 16px` → `padding: 60px 16px 32px`（或 banner 改 sticky 不 fixed）。

#### 3.3.2 sign-in mobile role select
sign-in.html:244-267 inline style 寫死、`@media (max-width: 600px)` 段（L97-101）只調 si-card padding / si-h font-size、**沒處理 role select 兩個 button 的尺寸**。在 375 viewport 預估還 OK（button 自然 flex:1）但 button 高 ~32px、低於 AA target 24×24 過但離 AAA 44×44 還差。

**Fix（nice）**：role select button 增加 `min-height: 40px`、padding 改 12px 14px。

#### 3.3.3 worker apply paste textarea
worker.jsx:867 textarea `minHeight: 280` + `fontFamily: var(--mono) fontSize: 12`——在 mobile 375 寬好用、但用 monospace 12px 在 mobile 鍵盤上輸入 JSON 不友善。**Edward 規則「不重 redesign」**——保留現狀。

#### 3.3.4 client intake 12-step bp-jtrack
app.html:128 `grid-template-columns: repeat(12, 1fr)` 是 desktop only——找不到 mobile fallback。樓上「bp-jtrack-hide」應該在 mobile 預設 collapse？

**Fix（must）**：app.html bp-jtrack 應 `@media (max-width: 768px)` 改成 2-row scroll-horizontal 或預設折疊。**這個影響很大、12 個 dot 在 375px 寬會碎裂**。

#### 3.3.5 IntakeSubmitModal mobile
app2.jsx:1051 `padding: 20`、modal max-width 480、在 375 viewport modal 寬 = 375 - 40 = 335px、`padding: "32px 28px"` (L1052) inner = 335 - 56 = 279px——**夠用**。但 cancel + submit button 並排 (L1060) 在 375px 可能要 wrap。

**Fix（nice）**：L1060 加 `flexWrap: "wrap"`。

---

## 4. Accessibility (WCAG AA) 重點

### 4.1 Color contrast

✓ `var(--text)` `#f0eee8` on `var(--bg)` `#0a0a0b` ≈ **18.5:1**（過 AA & AAA）
✓ `var(--text-2)` `#c2bfb8` on `var(--bg)` ≈ **12.5:1**（過 AA & AAA）
✓ `var(--accent)` `oklch(0.88 0.22 128)` ≈ `#c7e84a` on `var(--bg)` ≈ **14.2:1**（過 AAA）

⚠️ sign-in.html L19 `--muted: #9a9aa3` on `var(--bg)` ≈ **6.7:1**（過 AA、邊緣過 AAA 7:1）——**OK**。

❌ landing.html L34 註解寫「原 #7a786f 4.0:1 邊緣 fail」——**styles.css L12 仍是 `--muted: #7a786f`**！只在 landing 內 le-root scope 用 `#9a9aa3` 覆寫。**其他 entries（sign-in 也自己覆寫 / waitlist 自己覆寫 / app.html / worker.jsx）有沒有都 override？**

實際檢查：
- `waitlist.html` L20 `--muted: #9a9aa3` ✓（已 override）
- `sign-in.html` L19 `--muted: #9a9aa3` ✓（已 override）
- `app.html` 沒 override `--muted`——直接吃 styles.css `#7a786f` ⚠️
- `worker.jsx` 大量用 `var(--muted)`——也吃 `#7a786f` ⚠️

**Fix（must）**：把 `styles.css` L12 `--muted: #7a786f` 改成 `#9a9aa3`（4.0:1 → 6.7:1）。這是 SSOT、改 1 個地方所有 entries inherit、不用 14 處 override。

### 4.2 Hit target

- ✓ landing CTA `.le-cta-primary` min-height 60px → 過 AAA
- ✓ landing nav button padding 9px 16px → 約 36px、過 AA 24×24
- ⚠️ sign-in role select inline button (L244-267) 約 32px height、過 AA、不過 AAA
- ⚠️ worker.jsx ApplyProgress button (L1058 「← 回 intro」) padding 0 inline、純文字 11px、< 24×24 → **fail AA**

**Fix（must）**：worker.jsx L1058 「← 回 intro」加 `padding: "8px 12px"; minHeight: 32`。

### 4.3 Focus state

- ✓ styles.css L926 `.bp-thumb:focus-visible { outline: 2px solid var(--accent); }`
- ✓ styles.css L943 `.bp-trust-card:focus-visible` 同上
- ❌ **大部分 button 沒 :focus-visible**：sign-in si-btn / waitlist wl-btn / worker bp-btn—— browser default outline 是 webkit 黑灰色 ring、在 dark bg 上**看不見**！

**Fix（must）**：styles.css 加全域 `*:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }` 或對 `.bp-btn, .si-btn, .wl-btn` 都加 `:focus-visible` rule。

### 4.4 alt text / aria-label

**令人擔憂**：
- landing.html：grep `aria-label|alt=` 只 2 個 hit（SVG `aria-hidden`）
- app2.jsx：1 個 hit
- worker.jsx：1 個 hit
- sign-in.html：0 個 hit（除 SVG `aria-hidden`）

**Fix（must · 對外上線必修）**：
- sign-in role select button 加 `aria-label="選擇我的角色：發案方"` / `aria-label="選擇我的角色：接案者"`
- 所有 `<img src=... />`（worker.jsx avatar / app.html assets）若無 alt 加 `alt=""`（裝飾）或 `alt="avatar"`（功能）
- IntakeSubmitModal 加 `role="dialog" aria-labelledby="..." aria-modal="true"`
- landing.html `bp-disclaimer-top .close` button 已有 `aria-label="關閉提醒"` ✓

---

## 5. Cross-page wayfinding

### 5.1 Landing → Sign-in
✓ landing nav L658 `<a href="sign-in.html?role=client" className="btn-ghost">SIGN IN</a>` — 視覺連續（dark bg + chartreuse accent + nav 高度雖然不齊但 disclaimer banner 在頂貫穿）

### 5.2 Worker apply 3-step ApplyProgress
✓ worker.jsx:1050-1070 — 1 / 2 / 3 圓 + 直線連接、active 用 accent、done 用 accent-soft——**清楚但有點素**。對比 client intake 12-step `.bp-jtrack` 圓角 dot——兩套 progress 視覺**不一致**：
- worker apply: 圓圈 + 連接線（24×24 圓）
- client intake: 圓角方塊 grid（padding 6px 8px、border-radius 6px）

**不是 critical**：兩個 flow 步驟數差太多（3 vs 12）、用同一套視覺反而擠。**保留現狀**。

### 5.3 Client intake step 04 → IntakeSubmitModal ⚠️
從 12-step grid 跳到全屏 modal、視覺**突兀**：
- 12-step 是 dark + accent dot 排排站
- modal 全屏 dim overlay + 中央 card with `border: "1px solid rgba(199,232,74,0.4)"`（accent line）

突兀感主要來自 modal 沒過渡動畫 + 字體 hardcoded（見 §1.4）。**修了 §1.4 就連帶緩解**。

---

## 6. Must-fix before launch（按 critical 排序）

### Critical (must · 上線前修)

| # | File:line | Issue | Fix |
|---|---|---|---|
| **C1** | `components/styles.css:12` | `--muted: #7a786f` 4.0:1 邊緣 fail AA（app.html + worker.jsx 沒 override 直接 fail） | 改 `--muted: #9a9aa3`（移除 landing/sign-in/waitlist 三處的 local override） |
| **C2** | `app.html:128` `.bp-jtrack-inner` | mobile 12-col grid 在 375 寬碎裂 | 加 `@media (max-width: 768px) { .bp-jtrack-inner { grid-template-columns: repeat(6, 1fr); } .bp-jtrack-inner > * { font-size: 10px; } }` 或預設折疊 |
| **C3** | `mobile.html:17` | disclaimer banner fixed top 蓋住 iPhone frame | body padding 改 `60px 16px 32px` |
| **C4** | `components/app2.jsx:1051-1067` IntakeSubmitModal | inline style + hardcoded color、不用 token | 抽 `.bp-modal` / `.bp-modal-card` 共用 class 到 styles.css、修為 token 化 |
| **C5** | `components/styles.css` 全域 | 缺 `:focus-visible` 規則、focus state 在 dark bg 不可見 | 加 `*:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }` |
| **C6** | `sign-in.html:244-267` + `worker.jsx:1058` + IntakeSubmitModal | 多處 button / interactive 缺 aria-label | 加 aria-label；modal 加 `role="dialog"` |
| **C7** | `sign-in.html:38` + `waitlist.html:33` + `app.html:66` | logo mark 三套（圓角方塊 / 純色方塊 / 漸層方塊）vs styles.css `.bp-logo-mark` 三角 SSOT | 全部統一三角 clip-path（或統一 4px 純色方塊）擇一 |

### Nice-to-fix（v0.x+1 可延後）

| # | File:line | Issue | Fix |
|---|---|---|---|
| **N1** | `landing.html:92-103` | zh-Hant `word-break: keep-all` rule 只在 landing scope、沒到全域 | 移到 styles.css 全域 |
| **N2** | 各 entries top bar padding (56 / 32 / 32 / 18) | desktop 切換頁 nav 高度跳 | 統一 padding `14px 32px`（or 56） |
| **N3** | sign-in role select inline button | hit target ~32px 過 AA 不過 AAA | 加 `min-height: 40px` |
| **N4** | `worker.jsx:867` paste textarea mono 12px in mobile | 鍵盤輸入 JSON 不友善 | 不修（Edward 規則：不 polish micro） |
| **N5** | `app2.jsx:1060` cancel/submit button row | 375 寬可能 wrap 不漂亮 | 加 `flexWrap: "wrap"` |
| **N6** | sign-in.html `.si-card background: var(--bg)` | 卡片與底色同色、缺視覺分離（靠 1px border 撐） | 改 `background: var(--surface)` |
| **N7** | waitlist.html `<span>Beyond<span>Path</span></span>` 無 class | 維護差 | 抽 `.wl-brand-name` class、用 SSOT 三角 mark |

### Go / No-Go verdict

🟡 **CONDITIONAL GO** — 上線可以、但 C1-C7 **必須** 在 push 前一輪修完。修起來小（6-7 個 file edit、估 2-3 小時 dev time、可派卡西法批次）。修完才能說「Gate 2 PASS」。

**理由**：
- ✓ 沒紅色違憲（沒 Tailwind 入侵 / 沒 warm-serif on PATH 工具頁 / DNA 守住）
- ✓ 主要 entries 視覺一致性 ~85%（chartreuse + dark + 字體 stack 守住）
- ⚠️ 三套 logo mark + IntakeSubmitModal token 脫節 + 多處 a11y 漏 = **不是 redesign、是 token 補洞**
- ⚠️ mobile 12-step 碎裂 + mobile.html banner 蓋畫面 = **真實 mobile 用戶會踩**

修完後重新 audit、若 7 個 critical 都 ✓ 即可 Gate 2 PASS 進 Gate 4 版控。

---

## 評分（10 維 Design Rubric）

| 維度 | 評分 | 證據 |
|---|---|---|
| 視覺層次 | 8/10 | landing hero 大字 + 6 engine card + tier ladder 層次清楚 |
| 一致性 | 6.5/10 | chartreuse + dark 統一、logo mark 三套 + IntakeSubmitModal hardcoded 拖累 |
| 資訊密度 | 8/10 | landing 12 sections 飽和但用 section padding 144px 拆開、worker dashboard rail 360 適中 |
| 互動品質 | 7/10 | hover / focus 大部分有、但 focus-visible 漏 |
| 空狀態 | 8/10 | worker apply intro 「You're 1 step away」+ 12 dot orbital 設計感足 |
| AI 透明度 | 8.5/10 | worker apply step 1 brief 拿 AI / paste back / 預覽 ability card 流程清楚 + L score 自評 |
| 微文案 | 8/10 | 「24h 內 Edward 親自覆核」「3 天候選人 → 24 小時初步判斷」變動已 ship、人話化好 |
| 響應式 | 6.5/10 | mobile.html banner 蓋畫面 + bp-jtrack 12-col mobile 碎裂 |
| 色彩 | 9/10 | chartreuse + dark + warn/info 配色限制嚴格、無外來色 |
| 創新 | 8/10 | Heromark orbital 5-tier 系統 + EngineMock 6 canvas + 12 trust signal 軌道——production prototype 級別足 |

**總分 77.5 / 100** — 過 Gate 2 conditional 門檻、未到 85 ship-without-fix 標準。修完 C1-C7 重新評估、估 88-90 / 100、上線無虞。

---

## 我的觀察（女巫視角）

1. **DNA 沒漂走**：5/11 reposition 後 prototype-v0.2 守住 dark + chartreuse + JetBrains Mono + Noto Sans TC 四元組。沒被 Opus 4.7 warm-serif 預設拉走、Edward 5/13 反饋「不要再 polish micro」也守住了。
2. **設計系統正在從 ad-hoc 升 token-based**：styles.css 1006 行、有完整 token + class library。但 5/14 新加的 IntakeSubmitModal 走回 inline style 老路——這是「快速 ship 壓力下」自然會犯的、提醒 Edward 下次新 modal **先看 styles.css 有沒有 .bp-modal、沒有就抽一個再寫**。
3. **a11y 是上線前最不能省的**：sign-in 是 OAuth 入口、aria-label 0 個會被 a11y crawler 直接打回 ranking。`:focus-visible` 全域加 1 行就解。

—— 🔮 女巫
2026-05-14 · Gate 2 視覺檢修 conditional GO
