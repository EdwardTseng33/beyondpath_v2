# Mobile Viewport Audit · 2026-05-20

**By**: 🌸 蘇菲（castle session · 接 5/19 handoff §5 動作 A）
**Viewport tested**: 375 × 812（iPhone SE/12 mini · Safari mobile baseline）
**Pages**: landing / app?role=client / app?role=worker / admin / waitlist / legal/privacy
**Method**: preview MCP eval · 量 overflow / touch target / font-size

---

## Summary · 一句話

整體 mobile 沒整頁橫向 scroll（hOverflow: false 全頁過關）、但 **30+ touch target < 40px** + **134 處文字 < 11px** + **landing.html mobile @media 沒補 touch hit area**——核心問題是 mobile 上 button / link 太擠、文字太小、a11y 標準（Apple HIG 44 / Material 48 / WCAG ≥ 14px body）多處不過。

---

## Critical（破壞 mobile usability · 必修）

| # | 頁面 | 元件 | 量到的尺寸 | 問題 |
|---|---|---|---|---|
| C1 | landing | 頂部提醒列「×」關閉鈕 | 20 × 20 | 點不到、Apple HIG 44 / Material 48 |
| C2 | app | step navigation「←」「next →」 | 36 × 36 | 接近但 < 44 |
| C3 | app | radio/checkbox input | 13 × 13 | mobile 上選不到 |

## High（明顯影響首屏 trust + 轉換）

| # | 頁面 | 元件 | 量到的尺寸 | 問題 |
|---|---|---|---|---|
| H1 | landing | 主 CTA `▲ APPLY · BETA` | 127 × 29 | 高度只 29、< 44 |
| H2 | landing | 提醒列文案 `EARLY BETA · 邀請制` | fs 10 / 10.5 | 行動上幾乎看不到 |
| H3 | landing | 4 個 metric NETWORK / FIRST REVIEW / FIRST PROJECT / MODE 標籤 | fs 9.5 | label + value 都 9.5px |
| H4 | landing | nav link（9 個流程協定 / 核心引擎 / Tier 飛輪等） | 高 19 | 點擊區太擠 |
| H5 | app client | filter button（All · 全部 15 等 7 個） | 高 28 | 整排太矮 |
| H6 | waitlist | `BACK TO LANDING` | 高 12 | 接近不可點 |
| H7 | app worker | profile chip `Edwardedward@beyondpath.io` | 34 × 30 | mobile 上難按 |

## Medium（細節、可後修）

| # | 頁面 | 問題 |
|---|---|---|
| M1 | landing | ASCII mono 排版（`scope · acceptance (M1) → milestone ...`）在 375 寬上 overflow，68 個 SVG / span element rightPx > 375。雖然 .le-stream 已用 overflow: hidden 含住，但内部視覺密度過高、mobile 上閱讀價值低 |
| M2 | landing | 134 處文字 < 11px（code-comment 裝飾 + footer 等）·  user-facing 段（提醒列 / metric / CTA）已在 H 級處理；剩餘多為刻意 mono 裝飾 |
| M3 | privacy | inline link 高 19-21px ·  在長文中 inline、不能展太大會破壞段落、現狀 line-height 1.6 可接受 |
| M4 | admin | mobile audit 0 issue（內部 desktop 用、empty pre-auth state）·  不做 mobile 處理 |

---

## 修補 strategy

### Wave A · Critical + High touch target（純 CSS · 純可逆）

落點：landing.html `<style>` block + app2.jsx filter / step nav class + waitlist.html footer。

1. `.bp-disclaimer-top .close` mobile：補 padding to ≥ 44×44 hit area + font 18px（從 14px）
2. `.le-nav .btn-primary` mobile：padding 12px 16px、font 11px（從 10px、原 padding 8/12）
3. `.le-telemetry .l` mobile @media 480px：font 11px（從 10px）
4. `.bp-disclaimer-top` `.label` `.body` mobile：font 12px（從 10 / 10.5px）
5. app2.jsx step nav button `min-width: 44px; min-height: 44px`
6. app2.jsx filter button padding-y 升至 ≥ 12px（觸發 height ≥ 44）
7. waitlist.html `BACK TO LANDING` padding-y 升至 ≥ 14px
8. app worker profile chip padding：升至 min-width/height 44

### Wave B · 後續可選（5 維 weight 編輯介面 / Q3 sprint 後再評）

- 全頁 < 11px 裝飾文字檢視（user 看不到的可保留 9.5px 作風格、user 行動相關必 ≥ 12）
- ASCII parse(brief) 橫排在 mobile 用更短版本 or 隱藏 .le-stream
- Telemetry .v 28px（mobile）可保留、視覺 anchor

---

## 不做的

- Admin Console mobile 適配（內部 desktop-only · noindex）
- 重寫 grid layout（現狀 mobile 已單欄、不必動）
- Touch target 全 ≥ 48dp Material 標準（先做 ≥ 44 Apple HIG、user feedback 後再升）

---

## 影響評估

- Wave A 全部 ≤ 12 處 CSS 改動 / 0 JSX 結構改動 / 0 新檔 / 純 mobile @media 補強
- Desktop 完全不變
- 純可逆、git revert 即回 5/19 狀態

---

*🌸 蘇菲 · 2026-05-20 audit · 接 5/19 handoff 動作 A · 工時：mobile audit ~30 min · Wave A ship 預估 30-45 min*
