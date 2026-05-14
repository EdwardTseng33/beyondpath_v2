# 00 · Launch Plan · 蘇菲整合（城堡 6 council deep-dive）

**Date**: 2026-05-14
**Integrator**: 🌸 蘇菲（主對話）
**Verdict (TL;DR)**: 🛑 **目前 NO-GO** → 修完 17 條 must-fix 後 🟡 **Soft Launch GO**（邀請制 beta）

Edward 命「規劃完善、不出紕漏」、城堡 7 人並行 6 council deep-dive。本檔是整合 + 行動清單 + Edward 拍板項。

---

## 1 · 6 Council Verdict 矩陣

| Council | Verdict | Critical 數 | 文件 |
|---|---|---|---|
| 🔥 卡西法 · 技術 | 🟡 Conditional GO | 5 MF | `01-tech-audit-calcifer.md` + `02-rls-hardening.sql` |
| 🧙‍♀️ 沙利曼 · 信任 | 🟡 Conditional GO | 8 P0+P1 | `02-trust-audit-suliman.md` |
| 🌿 馬魯克 · QA | 🛑 NO-GO | 3 P0 Blocker | `03-qa-launch-checklist-markl.md` |
| 🧙 霍爾 · 產品 | 63/100 readiness | 5 critical 風險 | `04-launch-roadmap-howl.md` |
| 🔮 女巫 · 設計 | 🟡 Conditional GO | 7 C1-C7 | `05-design-audit-witch.md` |
| 🥕 蕪菁頭 · UX | 🛑 NO-GO | 3 P0 + 3 P1 | `06-ux-audit-turnip.md` |

**共識**：產品骨架對、技術 wired 通、設計 DNA 守住、定位清楚——但 17 條 must-fix 不修就上 = 信任崩塌 + 用戶卡關 + 資料庫公開。

---

## 2 · 整合 Must-Fix（17 條 · 去重後）

### 🔴 P0 · 上線前必修（10 條）

| # | 項目 | 來源 | Owner | 工時 |
|---|---|---|---|---|
| 1 | **RLS 重啟 production policy** · Supabase SQL Editor 跑 `02-rls-hardening.sql` | 卡西法 MF1 + 沙利曼 §1 + 馬魯克 M-02 | **Edward**（30 秒貼 SQL）| 0.5h |
| 2 | **Supabase Site URL + Redirect URLs 加 beyondpath.tw** | 卡西法 MF2 + 馬魯克 M-03 | **Edward**（30 秒 UI 點按）| 0.25h |
| 3 | **Vercel root redirect** `/` → `/landing.html`（`vercel.json` 加 rewrite）| 馬魯克 M-01 | 蘇菲 | 5 min |
| 4 | **Topbar stepper labels 順序錯**（`app2.jsx:19-24`）| 蕪菁頭 F-02 + 馬魯克 confirm | 蘇菲 | 5 min |
| 5 | **Prototype Banner 改 Early Beta**（`landing.html:408-413` 砍「資料皆為模擬 / 真實服務尚未開放」字眼） | 蕪菁頭 F-01 | 蘇菲 | 10 min |
| 6 | **Worker submitted state 文字矛盾修**（`worker.jsx:712-715` 改成「Supabase 已收到、24h 內 Edward 親自覆核」）| 蕪菁頭 F-06 + 馬魯克 confirm | 蘇菲 | 10 min |
| 7 | **WCAG AA --muted token 修**（`styles.css:12` `#7a786f` → `#9a9aa3` · 移除 landing/sign-in/waitlist 三處 override） | 女巫 C1 | 蘇菲 | 10 min |
| 8 | **logout 漏洞修** · app.html shell logout 加 `await bpAuth.signOut()` 清 Supabase session | 沙利曼 §2 | 蘇菲 | 20 min |
| 9 | **React production build**（`app.html` + `index.html` 換 `react.production.min.js`）| 卡西法 MF4 | 蘇菲 | 30 min |
| 10 | **Edward Gmail 2FA** | 沙利曼 §2 | **Edward**（10 分鐘）| 10 min |

P0 = 城堡 dev work ~2 小時 + Edward 親自 ~40 分鐘

### 🟡 P1 · 上線前最好修（7 條 · 影響第一批轉換率）

| # | 項目 | 來源 | Owner | 工時 |
|---|---|---|---|---|
| 11 | **cache-bust 全 entry bump `v0.8.0-launch`** + Chrome MCP 4 entry smoke | 卡西法 MF5 | 蘇菲 + 馬魯克 | 1h |
| 12 | **預算滑桿錨定** NT$240K → NT$100K（`app2.jsx:1092`）| 蕪菁頭 F-04 | 蘇菲 | 5 min |
| 13 | **Client intake state sessionStorage 持久化** | 蕪菁頭 F-05 | 蘇菲 | 1h |
| 14 | **Worker generate sessionStorage + 中斷提醒** | 蕪菁頭 F-03 | 蘇菲 | 30 min |
| 15 | **mobile bp-jtrack 12-col grid 碎裂修**（`app.html:128` 加 mobile media query） | 女巫 C2 | 蘇菲 | 15 min |
| 16 | **mobile.html disclaimer banner 蓋畫面修**（`mobile.html:17` padding） | 女巫 C3 | 蘇菲 | 5 min |
| 17 | **全域 `:focus-visible` 規則**（`styles.css`） | 女巫 C5 | 蘇菲 | 10 min |

P1 = 城堡 dev work ~3-4 小時

### 🟢 P2 · 上線後 sprint 1 補（軟性）

- IntakeSubmitModal token 化（女巫 C4）· 1-2h
- Logo mark 統一三角 SSOT（女巫 C7）· 30 min
- aria-label + role=dialog（女巫 C6）· 1h
- Mobile Tier tooltip（蕪菁頭 F-09）· 30 min
- Free AI fallback 說明（蕪菁頭 F-08）· 10 min
- 「不需帳號」說明（蕪菁頭 F-07）· 10 min
- Resend email 通知接（卡西法 + 霍爾 T2）· 等 Edward 拿 API key
- IntakeSubmitModal「flexWrap wrap」mobile（女巫 N5）· 5 min

### 🔵 P3 · soft launch 後 4 週內

- 公司開設 5-10 工作天（Edward + 代辦）
- 律師合約 review NT$ 30-50K（Edward + 律師）· 上線真實付費客戶前 must
- §27 個資內部計畫文件填寫（Edward 1h · template 已在 sulima §4）
- Supabase 自動備份（沙利曼）
- Sentry / monitoring 接（卡西法）

---

## 3 · Edward 拍板 + 親自動的事

### ⚡ 今天動（共 ~70 分鐘）

| 動作 | 時間 | URL / 位置 |
|---|---|---|
| **1. Supabase SQL Editor 跑 `02-rls-hardening.sql`** | 30 秒 | [SQL Editor](https://supabase.com/dashboard/project/iacwmkcloxjffghrweie/sql/new) → 開檔貼 → Run |
| **2. Supabase Auth Site URL + Redirect URLs 加 beyondpath.tw** | 30 秒 | [URL Configuration](https://supabase.com/dashboard/project/iacwmkcloxjffghrweie/auth/url-configuration) → Site URL = `https://beyondpath.tw` → Redirect URLs add `https://beyondpath.tw/**` + `https://www.beyondpath.tw/**` → Save |
| **3. Gmail 2FA 開** | 10 分鐘 | [Google Account Security](https://myaccount.google.com/security) |
| **4. Resend 帳號開（要 launch 信通知）** | 5 分鐘 | resend.com → Github 登入 → API Keys → Create → 把 `re_` 那串給我 |
| **5. 公司開設代辦電話** | 1 通電話 | 不擋 soft launch、但收款必須 |

### 🤖 蘇菲建議拍板（你只要回「都採用」即可）

對齊霍爾 launch roadmap §5：

1. **公司結構**：Edward 個人行號暫用 + 公司併行登記 ⭐
2. **律師**：新創 / 個資法律師、首次諮詢 NT$ 5-10K ⭐
3. **Resend**：W0 必接 ⭐
4. **Worker 邀請名單**：Edward 人脈 8 + LinkedIn 冷推 7 = 15 位 ⭐
5. **Client BD 對象**：Edward 認識的 DTC / 設計工作室 / 中小老闆 5 位面談 ⭐
6. **DPA / 平台角色聲明**：W0 上 template、W1 律師審 ⭐
7. **公開揭露程度**：W0-W2 私下 / W3 邀請制 / W7 對外 ⭐

回我「都採用 ⭐」我同步寫成 ADR-001 ~ ADR-007 落檔。

---

## 4 · Launch Timeline

對齊霍爾 §2：

| 階段 | 日期 | Milestone |
|---|---|---|
| **W0** | 2026-05-14（今天）| 城堡 17 條 must-fix 修完 + Edward 70 分鐘動完 |
| **W1** | 2026-05-15 ~ 2026-05-21 | 內部 e2e dogfood 5 輪 + Resend 通知接通 + §27 文件填 |
| **W2** | 2026-05-22 ~ 2026-05-28 | 邀請 3-5 位內部信任圈 worker dogfood + 第 1 個 client 深聊 |
| **W3** | 2026-05-29 ~ 2026-06-04 | 邀請制 beta 開放 · 15 位 worker apply + 5 位 client intake |
| **W4** | 2026-06-05 ~ 2026-06-11 | 🟢 **Soft launch · 對 founder 圈公開（最快）** |
| **W5-7** | 2026-06-12 ~ 2026-07-02 | 首案啟動 · 公司開完 · 律師合約 ship · 雙邊 NPS 收 |
| **W7+** | 2026-07-03 → | 🚀 **保守對外 launch · IG / Threads / FB 公開貼文** |

---

## 5 · 風險登記簿（霍爾 §3 整合）

| Risk | 嚴重度 | 機率 | 緩解 |
|---|---|---|---|
| RLS 不修 = DB 公開 | 🔴 critical | 100% if not fixed | **P0 #1 修** |
| Topbar bug 用戶失向 | 🟠 high | 100% | **P0 #4 修** |
| Prototype banner 嚇退客戶 | 🔴 critical | 100% | **P0 #5 修** |
| Worker submitted 矛盾 | 🟠 high | 100% | **P0 #6 修** |
| Client 沒預算簽案 | 🔴 critical | mid | W2 起 Edward 主動 BD 5 位 |
| Edward burnout | 🔴 critical | mid | 城堡擋執行細節（已 in motion） |
| §27 DPA 缺 | 🟠 high | low（W7 前修完）| 沙利曼 template 已備、Edward 1h 填 |
| 公司沒開、發票不出 | 🟠 high | mid | 個人行號暫用、5-10 天並行 |
| 公開揭露太早 | 🟡 mid | mid | W0-W2 私下、W3 邀請制、W7 對外 |
| 免費 AI 截斷 worker apply | 🟡 mid | mid | P2 加 fallback 說明 |
| Mobile 體驗破 | 🟠 high | high if not fixed | P1 #15-16 修 |
| WCAG AA fail | 🟠 high | 100% if not fixed | P0 #7 修 |
| Gmail 帳號被釣 = 整 DB 公開 | 🔴 critical | low（2FA 後）| **P0 #10 修** |
| 律師合約 4 週內 ship 不來 | 🟡 mid | mid | 律師約上線、template 過渡 |

---

## 6 · KPI · North Star（霍爾 §4）

> **首案 NPS ≥ 4.5 × 雙邊都願意再來 1 個案**

不是流量、不是 GMV、不是 worker apply 數——這是 Y1 POC 三條全綠第一個數據點（Framework §13.1）。

### 4 週 target（W4 soft launch 後）

- worker apply submitted ≥ 15
- 合格 worker（Edward 親審通過）= 3-5
- client intake submitted ≥ 5
- Edward 深聊 client ≥ 3
- 配對啟動（worker + client 雙方同意進合約）≥ 1
- 24h 內 Edward 回信率 = 100%

---

## 7 · 接下來城堡並行動

1. **蘇菲**（now）：寫此 00 整合檔 + ship P0 (#3-#9) + commit + push + Vercel deploy
2. **卡西法**（next）：P1 #11 cache-bust 全 entry bump + Chrome MCP 4 entry smoke
3. **馬魯克**（next）：跑 regression suite 10 條 + 拍 v0.8.0-launch 版號
4. **沙利曼**（next）：等 Edward 確認 RLS SQL 跑完、Gate 5 final sign-off
5. **女巫**（next）：P1 #15-17 mobile / a11y batch fix
6. **霍爾**（next）：等 Edward 拍板 7 件 + 寫 ADR-001 ~ ADR-007
7. **蕪菁頭**（next）：W2 第 1 位 worker dogfood 跑、訪談記錄

---

## 8 · Soft Launch 條件（Gate 1-5 全 PASS）

| Gate | 條件 | 狀態 |
|---|---|---|
| Gate 1 · 流程測試（卡西法） | P0 #3-#9 ship + Chrome MCP 4 entry 0 console error | ⏳ 待動 |
| Gate 2 · 視覺檢修（女巫） | C1 修 + 其他 P1 修 + 重新 audit 8.5+ / 10 | ⏳ 待動 |
| Gate 3 · 遠景校準（霍爾） | scorecard 80+ / 100 + 7 拍板項落 ADR | ⏳ 待 Edward |
| Gate 4 · 版控確認（馬魯克） | v0.8.0-launch 版號 + diff-report + rollback 預備 | ⏳ 待動 |
| Gate 5 · 信任關卡（沙利曼） | RLS 跑完 + logout 修 + 2FA 開 + §27 上 | ⏳ 待 Edward + 蘇菲 |

5 Gate 全 PASS = soft launch GO。

---

*🌸 蘇菲 · 城堡 6 council 整合 · 2026-05-14*
*下一動：ship P0 fixes + commit + push + 等 Edward 動他的 70 分鐘*
