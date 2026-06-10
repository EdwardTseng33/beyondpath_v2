# Diff Report · BeyondPath i18n Phase 1 · 2026-05-25

**Gate 4 版控確認文件**
Branch: `feat/i18n-phase1-step1`
Prod commit (base): `2804600` (2026-05-19 · Worker Decision Banner marathon)
Branch HEAD: `7ee2a8c` (2026-05-25 · Gate 2 P0+P1 fix)
總 commits: 24（含 5/20-21 post-marathon follow-up 8 件 + 5/25 i18n phase 1 main 16 件）

預估工時：2-3 天（具備 AI 輔助的前端工程師，含 i18n 框架設計 + 917 key 翻譯 + 4 頁接線 + 視覺 QA）
移動城堡估：6-8 小時 / 實際耗時：(待回填，session 中跑完)
審核回合數：3 輪（Gate 1 console audit + Gate 2 P0+P1 fix + Gate 4 本次）

---

## 1. Commit Log Review

### 5/20-21 Post-Marathon Follow-up（8 件）

| hash | type | scope | message |
|---|---|---|---|
| a4b0f47 | docs | handoff | 5/19 L6 全自主 PMF marathon 紀錄 |
| 78845f5 | feat | audit-wave1 | 文案 + 視覺修補 4 件 |
| f372b7c | feat | audit-wave2 | critical+high 後端 7 件 |
| f023725 | fix | email-template | join newline syntax · raw newline → \\n |
| 13fb40f | feat | mobile-a11y | Wave A · mobile audit + Phase 0 #6 |
| ea5b53f | feat | phase-0 | 信任地基 4 件 |
| 37a3383 | feat | a3+a1+a4 | 5 維權重編輯介面 + 警示燈 |
| eada6aa | feat | audit-flags | Phase 0 #3 · worker ai_proof 警示燈 |

**評估**：prefix 一致（feat/fix/docs）、scope 語義清楚，無問題。

### 5/25 i18n Phase 1（16 件）

| hash | type | scope | message | 評估 |
|---|---|---|---|---|
| f1fe7e0 | feat | i18n | Phase 1 Step 1 · landing 框架 + 切換器 demo | OK |
| f4732a3 | feat | i18n | Phase 1 Step 2 · landing 11 段 array data 接 dict + mobile fix | OK |
| 16cfdc4 | feat | i18n | dict.en.js full translation · 462 strings | OK |
| 4fafd5d | feat | i18n | Phase 1 Step 2.5 · EStory 8 inline JSX + 6 frame | OK |
| 6cf064c | feat | i18n | Step 3a · waitlist.html 接 i18n + 20 leaf | OK |
| 77a5b2b | feat | i18n | Step 3b · admin.html + admin.jsx 75 leaf | OK |
| 2fc512d | feat | i18n | Step 3c · app.html + app2.jsx + worker.jsx 192 leaf | OK |
| 1c78551 | feat | ui | remove le-staticbar from landing nav · edward request | OK |
| a6af2c4 | feat | i18n | dict.en.js 5 new namespaces · 287 strings | OK |
| 3232981 | feat | i18n | Step 3d · Priority B 深層結構 ~125 leaf · 53 新 key | OK |
| c64b38e | feat | i18n | dict.en.js step 3d 53 new placeholders | OK |
| 923f7cc | feat | i18n | Step 3e · worker.jsx Apply Flow 168 leaf | OK |
| bfb861f | feat | i18n | dict.en.js step 3e 167 strings | OK |
| a556465 | fix | ui | app.html lang switcher to permanent top nav + brand home link | OK |
| 4e6c2ee | fix | ui | revert duplicate top-nav · keep brand link in existing shell nav | OK |
| 7ee2a8c | fix | ui | unify Brand Lockup spec + nav consistency across 4 entries (P0+P1) | OK |

**整體評估**：24 件 commit message 全部 PASS。feat/fix prefix 使用一致、scope 語義清晰、step 標號有序（Step 1→2→2.5→3a→3b→3c→3d→3e），可追蹤。

**小建議（非強制）**：Step 3c 的 commit message 結尾有中文 `Priority A 覆蓋 192 leaf`，與其他 commit 的英文 body 稍微不統一，但屬風格問題、不影響版控完整性。

---

## 2. 版號 Bump 建議

當前版本：`v1.0.0`（`components/shell.jsx` / `components/shell.standalone.jsx`）

**建議：bump → v1.1.0**

判斷依據：

| 維度 | 內容 | 等級 |
|---|---|---|
| 功能新增 | 全平台 i18n 框架（index.js + LangSwitcher）| MINOR |
| 功能新增 | 語言切換器 UI（4 頁全接）| MINOR |
| 功能新增 | 917 個 dict key（zh + en 雙語）| MINOR |
| 功能調整 | 4 頁 nav 一致化 + Logo 可點 | MINOR |
| Bug fix | nav 重複 top-nav revert | PATCH |
| Bug fix | Brand Lockup spec 統一 | PATCH |

semver 規範：新增向後兼容功能 = MINOR。i18n 框架不是 breaking change（舊中文路徑仍可用），但這是一個完整的新能力（語言切換），不是 patch 等級。

**結論**：`v1.0.0 → v1.1.0`，不適合 v1.0.1（patch 通常是單一 bug fix）。

---

## 3. 改動範圍

### 新增檔案

| 檔案 | 說明 |
|---|---|
| `components/i18n/index.js` | i18n 核心框架（BPi18n · 187 行）|
| `components/i18n/dict.zh.js` | 繁體中文 dict（~1177 行）|
| `components/i18n/dict.en.js` | 英文 dict（~1182 行）|
| `components/i18n/LangSwitcher.jsx` | 語言切換器 React 元件 |

### 修改檔案（前端）

| 檔案 | 改動重點 |
|---|---|
| `landing.html` | 接 i18n（11 段 array data + EStory）+ 移除 le-staticbar + 切換器 mount |
| `app.html` | 接 i18n + 切換器接進 permanent top nav + Brand home link |
| `admin.html` | 接 i18n + admin namespace 75 leaf + 切換器 |
| `waitlist.html` | 接 i18n + waitlist namespace 20 leaf + 切換器 |
| `components/app2.jsx` | app/client namespace 接 dict（192 leaf 中的前端部分）|
| `components/worker.jsx` | worker namespace 接 dict（168 leaf Apply Flow + 125 Priority B）|
| `components/admin.jsx` | admin namespace 接 dict（75 leaf）|
| `components/shell.jsx` | nav 一致化 + Brand Lockup spec（主對話蘇菲 session 修）|
| `components/shell.standalone.jsx` | 同上（standalone 版本同步）|
| `components/styles.css` | P0+P1 fix 相關樣式（cache-bust v=2026-05-25-p0p1）|

### 修改檔案（後端 · 5/20-21 post-marathon）

| 檔案 | 改動重點 |
|---|---|
| `components/supabase.js` | (5/20 audit wave2 follow-up) |
| `supabase/functions/worker-ack-email/index.ts` | newline 語法修補 |
| `supabase/functions/notify-lead-slack/index.ts` | 同上 |
| `supabase/functions/match-workers/index.ts` | audit wave2 |
| `supabase/functions/send-decision-email/index.ts` | audit wave2 |
| `supabase/functions/worker-ai-interview/index.ts` | ai_proof 警示燈 Phase 0 #3 |
| `supabase/functions/_shared/*.ts` | audit-flags / jwt-light / match-algorithm |
| `supabase/migrations/` | worker_applications column revoke + GDPR purge |

### Dict Key 統計

| namespace | zh keys | en keys | 說明 |
|---|---|---|---|
| Step 1-2（landing 框架）| ~100 | ~100 | landing 主體 |
| Step 2.5（EStory）| ~16 | ~16 | EStory inline + frame |
| Step 3a（waitlist）| ~20 | ~20 | waitlist namespace |
| Step 3b（admin）| ~75 | ~75 | admin namespace |
| Step 3c（app/client/worker · Priority A）| ~192 | ~192 | app 主流程 |
| Step 3d（Priority B）| ~53 | ~53 | 深層結構 |
| Step 3e（worker apply flow）| ~168 | ~167 | Apply Flow |
| **合計** | **~917** | **~917** | |

---

## 4. 未完成項目（刻意 defer，非遺漏）

| 項目 | 原因 / 計畫 |
|---|---|
| P2 項目（Gate 2 留存）| 非 P0/P1，不阻 push |
| Worker Apply Flow Layer 1 dead code | 既有架構債，非 i18n 引入 |
| AI prompt 英文化（Phase 3）| GPT prompt 不在 Phase 1 scope |
| SEO prerender / SSR（hreflang 優化）| 海外 SEO 重要時做 Phase 3 |
| React 元件 i18n key 整合（shell.jsx v1.1.0 BP_VERSION）| 版號 bump 實際修改 code，Gate 4 不動 code，需在 push prod 前另做 |

---

## 5. 風險 / 已知限制

| 風險 | 嚴重度 | 說明 |
|---|---|---|
| Chrome SEO 初始化拿到 zh 值 | 低（現階段）| Phase 1 用 localStorage 切換，SEO crawler 拿到 zh 初值（default）。若海外 SEO 成為優先目標，需做 Phase 3 prerender 或 hreflang meta（waitlist.html 已有 hreflang link，landing/app 尚未）|
| i18n script 無 cache-bust 參數 | **中**（見第 6 節）| Cloudflare 邊緣可能 serve 舊版 dict，詳見下方 |
| waitlist.html 無 favicon | 低 | 不影響功能，SEO/品牌略有瑕疵 |
| BP_VERSION 仍顯示 v1.0.0 | 低 | shell.jsx 尚未 bump，push 前需補改 |

---

## 6. HTML 尾部 + Cache-Bust 確認結果

### </html> 收尾

| HTML | 尾部狀態 |
|---|---|
| `landing.html` | `</body></html>` 正常，無裸文字 |
| `app.html` | `</body></html>` 正常，無裸文字 |
| `admin.html` | `</body></html>` 正常，無裸文字 |
| `waitlist.html` | `</body></html>` 正常，無裸文字 |

### Favicon

| HTML | favicon |
|---|---|
| `landing.html` | `/favicon.svg` + `/favicon.ico` ✅ |
| `app.html` | `/favicon.svg` ✅ |
| `admin.html` | `/favicon.svg` ✅ |
| `waitlist.html` | **favicon 缺失** ⚠ |

### i18n Script Cache-Bust（重要）

全部 4 個 HTML 的 i18n 腳本均**無 cache-bust 版本參數**：

```
components/i18n/index.js        ← 無 ?v=
components/i18n/dict.zh.js      ← 無 ?v=
components/i18n/dict.en.js      ← 無 ?v=
components/i18n/LangSwitcher.jsx ← 無 ?v=
```

**對比**：其他元件都有 cache-bust，例如：
- `styles.css?v=2026-05-25-p0p1` ✅
- `app2.jsx?v=2026-05-25-i18n3c` ✅
- `worker.jsx?v=2026-05-25-i18n3c` ✅
- `shell.standalone.jsx?v=2026-05-25-brand-link` ✅

**風險評估**：dict.en.js / dict.zh.js 在這次 Phase 1 中改動最頻繁（累計 5 次 commit），若 Cloudflare 快取舊版 dict 而新版 HTML 讀取，會出現翻譯 key 丟失（顯示 key 字串而非翻譯文字）。這是 **CONDITIONAL 缺口**，建議 push 前補上。

---

## 7. 退版 SOP

**觸發條件**：push prod 後任一情況出現——某頁 i18n 切換器消失、某段翻譯 key 顯示原始 key 字串（如 `worker.apply.title`）、或 console 出現 i18n 相關 error。

### 方法 A · Vercel Rollback UI（推薦，最快 < 2 分鐘）

1. 開 https://vercel.com → 進 BeyondPath project
2. 左側選 **Deployments**
3. 找上一個 Production deployment（2804600 · 5/19）
4. 點右側 `...` → **Promote to Production**
5. 確認 → prod 立即回到 5/19 版本

### 方法 B · Git Revert（需再次 push）

```bash
git -C "C:/Users/Administrator/Claude/BeyondPath2.0/prototype-v0.2" revert 7ee2a8c..HEAD --no-commit
git commit -m "revert: rollback i18n phase 1 (emergency)"
git push origin main
```

**注意**：Method B 會保留 i18n commits 的歷史、但用 revert commits 覆蓋，比 reset --hard 安全。

### 退版後立即確認

- [ ] `https://beyondpath.tw` landing 正常顯示（zh only，無切換器）
- [ ] `https://beyondpath.tw/app/` console 零 error
- [ ] `https://beyondpath.tw/admin/` 正常登入

---

## 8. Gate 4 Verdict

### Checklist

| 項目 | 結果 | 說明 |
|---|---|---|
| Commit message prefix 一致 | ✅ PASS | 24 件全 feat/fix/docs |
| Commit scope 語義清楚 | ✅ PASS | step 標號有序可追蹤 |
| 版號 bump 判定 | ✅ PASS (待執行) | 建議 v1.0.0 → v1.1.0，需改 shell.jsx 兩檔 |
| HTML </html> 收尾正常 | ✅ PASS | 4 個 HTML 全部正常 |
| HTML 尾部裸文字 | ✅ PASS | 無裸文字 |
| Favicon 完整 | ⚠ CONDITIONAL | waitlist.html 缺 favicon |
| i18n script cache-bust | ⚠ CONDITIONAL | 4 個 i18n 腳本均無 ?v= 參數 |
| BP_VERSION 更新 | ⚠ CONDITIONAL | 仍顯示 v1.0.0，需手動 bump |
| 退版方案確認 | ✅ PASS | Vercel Rollback UI + git revert 兩條路徑 |
| 5/25 i18n commits 範圍合理 | ✅ PASS | 16 件對應 Step 1→3e，無超綱改動 |

### Verdict: **CONDITIONAL**

**必修後再 push（3 件）**：

1. **i18n script cache-bust（高優先）**：4 個 HTML 的 `index.js` / `dict.zh.js` / `dict.en.js` / `LangSwitcher.jsx` 補 `?v=2026-05-25` 參數，防止 Cloudflare 快取舊版 dict 造成翻譯 key 顯示錯誤
2. **BP_VERSION bump**：`shell.jsx` + `shell.standalone.jsx` 兩檔改 `v1.0.0` → `v1.1.0`
3. **waitlist.html favicon（低優先，可 post-push 補）**：補 `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />`

修完 3 件（或 Edward 決定 #3 post-push 補）→ Gate 4 PASS → 合併 Gate 5 結果 → push prod。

---

*Gate 4 審核人：馬魯克 · 2026-05-25*
*文件路徑：`docs/diff-report-2026-05-25-i18n-phase1.md`*
