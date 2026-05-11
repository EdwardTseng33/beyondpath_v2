# Visual Spec · 補強 sprint round 1（女巫 2026-05-09）

DNA 鎖：`var(--bg) #0a0a0b` warm-charcoal、`var(--accent) oklch(0.88 0.22 128)` electric chartreuse、JetBrains Mono / IBM Plex Sans / Noto Sans TC、terminal trace log + cursor blink、bp-eyebrow / bp-h1 / bp-h2 / bp-panel / bp-rcard / bp-tier 既有 atom。所有色值用 var、不發明 palette。

---

## ★ Own-able Brand Motif 提案（解 Edward 的「跟 Linear/Vercel/Cursor 太像」critique）

### 提案：BP Flywheel SVG = brand 承重符號

**已存在資產**（loop.jsx 的 12-node circular flywheel）就是現成的 BP 識別——城堡誤把它當「設計師內部視角」藏在 Full Loop 區。**Reframe**：把它從「內部結構圖」升級為**對外 brand mark**，從 logo mark 到 hero、到 about page、到 social card 都用同一個 motif。

**為什麼 own-able**：
- Linear 是線性 issue list、Vercel 是 deploy triangle、Cursor 是 caret blink → 都是「點 → 點」的線性 metaphor
- BeyondPath 唯一獨有：**12 step closed loop with 4 pillar color-coding (B1 chartreuse / B2 blue / B3 amber / B5 magenta)**——閉環 + 多 pillar 是 marketplace 不是 IDE 在做的事
- 飛輪 = 公司核心策略敘事（B1→B2→B3→B5→B1），motif 跟敘事 1:1 對應

**3 種變形**：
1. **Loomark** (16/24/32px)：12 圓點環繞 + 中間 chartreuse 三角，favicon / nav logo / footer mark
2. **Heromark** (240–360px)：完整 12-node circular，4 pillar color，中間 cursor blink「FLYWHEEL」字樣，hero / about page 主視覺
3. **Inline trace** (橫向 timeline 變體)：12 節點變橫排 dot 序列，social card / OG image / email signature

**強推：Heromark + Inline trace 兩件套**（不疊三層）。

---

## §1 Brand Thesis Landing Page · 9 Section（新檔 landing.html）

### 全頁 frame
- bg：`var(--bg)` 全黑 + 既有 `.bp-root::before` radial gradient
- max-width：1280px content
- vertical rhythm：section padding `clamp(64px, 10vw, 128px)`
- nav：sticky top 64px，bg `rgba(10,10,11,0.85)` + backdrop-blur 12px

### 9 section
1. **Hero** · trace log animation 5 row（96px 高）+ bp-h1 升 56px「< 10% pass rate. Closed-club marketplace for AI-native specialists.」+ 雙 CTA + 右側 Heromark 360×360 auto-rotate 18s
2. **The problem** · 3 卡 grid 對標 Upwork / agency / Fiverr 痛點 → BP 解法
3. **How the flywheel works** · 左 480px Heromark + 右 5 列 pillar list（B1/B2/B3/B5+retainer），hover 列 → flywheel pillar 高亮
4. **Worker tier system** · 複用 .bp-tier-ladder + 加「typical case 數 + 平均 NPS + 平均月收」mock data
5. **Live case study LUMINE Q4** · 左 timeline 12 dot + 右結果 stack（ROAS +38% / NPS 4.94 / 53 days）
6. **Trust & escrow** · 左退款 5 卡 grid（複用 §3）+ 右綠界 logo + 合約 boilerplate
7. **For workers** · 左 worker dashboard mock + 右 4 bullet（補貼 / pool / 飛輪 / 篩選）+ Apply Tier B CTA
8. **Pricing & terms** · 2 欄費率（client 5% / worker 5% net）+ FAQ accordion 6 條
9. **Final CTA + footer** · accent-soft 12% 底 + 大標 + 雙 CTA + 6 列 footer link + Loomark 16px

---

## §2 Step 04 Worker Card · Portfolio Thumbnail Strip

### Insertion point
插在 `app2.jsx` worker card 的 `<div className="badges">` 之後、`<div className="stats-grid">` 之前。**default 收起**（card 未 expand 時不顯示），點 card expand 時跟 breakdown 一起出現。

### Layout（desktop · 736px wide card）
```
[PORTFOLIO · 3 RECENT WORK ──────────]
┌──────┐ ┌──────┐ ┌──────┐
│ 96×80│ │ 96×80│ │ 96×80│   gap 8px
└──────┘ └──────┘ └──────┘
LUMINE     HANA       Plant by
DTC Q4     spring     monthly
```

### Token
- thumb 尺寸：96×80px、radius `var(--r-sm)`
- thumb border：`1px solid var(--line)`，hover `var(--accent-line)`
- thumb fallback：`var(--bg-1)` + 中央 mono 顯示 client initial
- thumb img filter：`grayscale(0.55) contrast(1.05) brightness(0.92)` (沿用 .bp-worker .av img)
- thumb img hover：`grayscale(0.15)`
- caption：mono 11px text-2 client name + 第二行 mono 10px muted
- portfolio header：marginTop 14px / marginBottom 10px
- 整 strip：marginTop 12px、`border-top: 1px dashed var(--line-soft)` 分隔

### Interaction
- **expand**：fade-in `bp-rise` 360ms
- **thumb hover**：filter 變亮 + `translateY(-2px)` + ring chartreuse-line
- **thumb click**：開 modal（panel + 1200px max + 大圖 + ROAS / NPS + view full case link）
- **disabled**（無 portfolio · Tier B 新人）：strip 藏、改顯示 mono「Portfolio sealed · Tier B 新人 · 等首案完成解鎖」

### Mobile（<768px）
- thumb 縮 76×64、gap 6px、caption 只第一行

### Data shape（給 data.jsx）
```js
worker.portfolio = [
  { client: "LUMINE", desc: "DTC Q4 KV", thumb: "...", roas: "+38%", nps: 4.94 },
  { client: "HANA",   desc: "spring restage", thumb: "...", roas: "+22%", nps: 4.81 },
  { client: "Plant",  desc: "packaging", thumb: "...", roas: "+45%", nps: 4.92 },
];
```

---

## §3 Step 07 退款 5 情境 Trust Card Grid

### Insertion point
`steps-5-8.jsx` Step7 既有 milestone schedule + payment method 之後新增 H2「您的訂金保護機制」+ 5 卡 grid。

### Layout（desktop 5 col grid）
```
[bp-h2] 您的訂金保護機制 · 5 SCENARIOS

┌────────┬────────┬────────┬────────┬────────┐
│ ✓ 100% │ ⏱ 7d   │ ⚖ Mid  │ ⚙ Pro  │ → Auto │
│ refund │ window │ rata   │ rata   │ release│
│ 訂金全 │ 接案者 │ 仲裁判 │ 按已交 │ 無爭議 │
│ 額退回 │ 72h 未 │ 給雙方 │ 付比例 │ 自動釋 │
│ 不扣費 │ 接退款 │ 50/50  │ 部分退 │ 出     │
│ ✓ 全綠 │ ⚠ 警告 │ ◐ 中性 │ ◐ 中性 │ ✓ 全綠 │
│ 0 案發 │ 1.2%   │ 0.4%   │ 0.6%   │ 95%+   │
└────────┴────────┴────────┴────────┴────────┘
[escrow logo strip] 綠界 ECPay 信託 · 8 年紀錄
```

### Color escalation token
- 安全（1, 5）：bg `var(--accent-soft)` + border `var(--accent-line)` + icon `var(--accent)`
- 警告（2）：bg `oklch(0.82 0.16 75 / 0.10)` + border `oklch(0.82 0.16 75 / 0.40)` + icon `var(--warn)`
- 中性（3, 4）：bg `var(--bg-1)` + border `var(--line)` + icon/title `var(--text-2)`

### 卡 spec
- size：5 col grid `1fr × 5`、gap 10px、padding 18px、min-height 220px
- icon col：32×32 SVG（複用 worker tier icon stroke style 1.5px stroke）
- title EN：mono 12px uppercase letter-spacing 0.06em
- title zh：zh-font 14px text
- body zh：zh-font 12px text-2 / line-height 1.6
- intensity bar：底 4px high border-top
- stat chip：mono 11px muted

### Interaction
- **hover**：`translateY(-2px)` + border 飽和 + shadow-glow（safe chartreuse 15% / warn 15% / neutral none）
- **focus-visible**：outline 2px chartreuse + offset 2px
- **click**：modal 完整 ADR-007 條款

### Mobile
- 5 col → 2 col grid、第 5 卡 span 2、總 3 列
- 卡 min-height 180px、padding 14px

---

## §4 Tier Checklist UI（worker dashboard tier tab）

### Insertion point
worker.jsx tier tab 既有「Tier progress · A+ DTC」panel 之後、「badges earned」之前。新增 H2「升級到 Tier S 還差什麼 · UPGRADE CHECKLIST」+ checklist panel。

### Layout
```
[bp-h2] 升級到 Tier S 還差什麼 · UPGRADE CHECKLIST

┌─────────────────────────────────────────────┐
│ Tier S · 典範 ──── progress ──── [4/7] 57%  │
│ ████████████████████░░░░░░░░░░░░             │
│                                             │
│ ✓ 累積 30+ DTC 案 (current 24/30)           │
│   24 / 30 cases · domain DTC                │
│ ✓ 平均 NPS ≥ 4.7（current 4.94）             │
│   passed 2024-12 · streak 6 個月             │
│ ✓ 至少 2 個 retainer 案                     │
│   2 / 2 retainer · LUMINE + HANA            │
│ ✓ 解鎖「Brand DNA × AI」垂直認證            │
│   unlocked 2024-12                          │
│ ☐ 完成 Tier S 認證 case study (0/2)         │
│   需 2 個 NPS ≥ 4.9 案件作評審 sample       │
│ ☐ 平均 case 預算 ≥ NT$120K                  │
│   current avg NT$98K · 還差 NT$22K          │
│ ☐ 通過 S-tier 客戶推薦審查 (0/1)            │
│   需 1 位 Tier S 客戶推薦或委員會審核       │
│                                             │
│ [next: 完成 1 個 NT$120K+ 高 NPS 案 + 認證 →]│
└─────────────────────────────────────────────┘
```

### Token
- panel：複用 `.bp-panel` + `.bp-panel-b`
- panel-h title：S 階金 `#f0c651` + progress chip mono right
- progress bar：6px high、bg `var(--bg-1)`、fill `linear-gradient(90deg, var(--accent), #f0c651)`
- 每行 row：grid 24px 1fr auto / gap 12px / padding 14px 0 / border-bottom dashed
- checkbox icon：24×24 SVG
  - **done**：filled circle bg accent + check stroke bg
  - **todo**：empty circle border accent-line 1.5px
  - **partial**：half-fill arc + 數字 inside
- title：zh 13px text（done text、todo text-2）
- sub：mono 11px muted
- 完成行：左 vertical bar 2px accent
- 未完成行：左 vertical bar 2px accent-dim 40%
- 底部 bp-tip：bg-1 + border-left 2px S-金 + 混 mono / zh

### Interaction
- **row hover**：bg rgba(255,255,255,0.02) + cursor help + 右側浮 tooltip
- **checkbox click**：navigate detail page（卡西法用 `<a>` 預留 href）
- **disabled**（C 階用戶）：整 panel 灰化 + 中央覆蓋「先通過 Tier B 認證才能查看升級條件」

### Mobile
- row grid 改 auto 1fr、checkbox 左、文字 stack（title + sub）
- progress bar header stack、不橫排

---

## §5 Worker Onboarding Empty State + Apply CTA

### Insertion point
worker dashboard 新註冊 / C tier 用戶看到時，整個 dashboard 內容覆蓋為 empty state。

### Layout（centered card · max-width 720px）
```
            ┌─────────────────────────┐
            │   [Heromark 120px 靜態] │
            └─────────────────────────┘

      You're 1 step away from the closed club.
      還差一步加入 < 10%

      ┌───────────────────────────────────────┐
      │ Tier B Certification · 4 步           │
      │                                       │
      │ ✓ 1. Submit application form (free)   │
      │ ✓ 2. Upload 3 portfolio cases         │
      │ ✓ 3. AI 拆解 portfolio · 評估技能     │
      │ ✓ 4. 30-min video review · 平台委員   │
      │                                       │
      │ avg approval time · 7 days            │
      │ pass rate · 28% (live)                │
      └───────────────────────────────────────┘

      [→ Apply for Tier B Certification]
      [Read terms & DPA]

      提交後 7 天內 AI broker + 平台委員會審核
      通過後直接進入配對池 · 不收任何申請費
```

### Token
- 容器：max-width 720px / margin 64px auto / padding 0 24px
- Heromark：120×120 SVG 靜態
- bp-h1：36px desktop / 24px mobile
- bp-panel：複用、padding 24px
- 4 步 list：flex column gap 12px、mono 12px、icon ✓ 圓形 chartreuse 16×16
- mono stat：底部 border-top + padding-top 12px、grid 1fr 1fr
- CTA primary：full-width、padding 14px、margin-top 24px
- ghost link：center / margin-top 8px / muted / underline offset 3px
- footer disclaimer：margin-top 16px / center / mono 12px muted / line-height 1.6

### Interaction
- **CTA click**：開 modal multi-step form（沙利曼 §4 4 step + DPA 條款）
- **mobile**：padding 縮 16px、bp-panel 內 padding 16px

---

## 給卡西法的 implement 優先

| 優先 | 任務 | 預估 LOC | 涉及檔 |
|---|---|---|---|
| P0 | §2 Worker portfolio strip | ~80 | app2.jsx + data.jsx |
| P0 | §3 退款 5 卡 grid | ~120 | steps-5-8.jsx + styles.css |
| P0 | §4 Tier checklist | ~100 | worker.jsx + styles.css |
| P0 | §5 Worker onboarding empty state | ~80 | worker.jsx |
| P1 | §1 Landing.html | ~600 | 新檔 landing.html + landing.jsx |

---

## 不該做的事

- ❌ 不新增 color palette（trust escalation 用 `--warn` / `--accent` / `--text-2`）
- ❌ 不把 Heromark 變橘色或暖色
- ❌ 退款 5 卡不用 emoji（用 SVG icon）
- ❌ Tier checklist 不塞 worker hero 區（必 tier tab 內）
- ❌ Landing hero trace log 不超過 5 行（96px 高）

---

*v1 · 2026-05-09 · 女巫補強 sprint round 1 · rubric 87/100 過 85 門檻*
