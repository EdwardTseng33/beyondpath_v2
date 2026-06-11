# Diff Report · BeyondPath 2.0 調研批 · 15→9 + 付費需求探索入口 · 2026-06-11

**Gate 4 版控確認文件**
Branch: `feat/i18n-phase1-step1`
Base commit: `9a7ab37` (2026-06-11 · quota fix)
本批改動：11 個檔案、261 insertions / 235 deletions

預估工時：2-3 天（具備 AI 輔助的前端工程師，含領域卡重構 + i18n 同步 + app2 邏輯調整 + 視覺 QA）
移動城堡估：2-4 小時 / 實際耗時：~2.5 小時（差距 -10% 內）
審核回合數：1 輪（pending Edward 實站視覺審核）

依據：`research/ai-case-deliverability-insight-2026-06.md` + `research/howl-strategy-memo-2026-06-10.md`（Edward 拍板「開始優化吧」）

---

## 1. AC 對照表

| # | 宣稱改動 | 實際 diff 確認 | 結果 |
|---|---|---|---|
| 1a | `data.jsx` VERTICALS 15→9，featured: 'discovery' 置頂 | ✅ VERTICALS 從 15 項收斂為 9 項；research 轉生 featured:'discovery'；video/seo/mkt/cs/localize 自卡片移除 | ✓ |
| 1b | `data.jsx` lead: true 標記 4 垂直（agent/web/software/dtc）| ✅ agent/web/software/dtc 均有 `lead: true` | ✓ |
| 1c | `data.jsx` VERTICAL_CATS 7→5（移除 growth/service）| ✅ diff 確認 `growth` / `service` 兩 cat 移除 | ✓ |
| 1d | `data.jsx` research demo 改寫為探索案例（NT$30-50K/1-2週/規格書+原型+報價單）| ✅ VERTICAL_DEMO_MAP research entry 改寫完整，tasks 5 件，budget lo:30_000 hi:50_000 | ✓ |
| 1e | `data.jsx` VERTICAL_DEMO_MAP 舊 id entry 刻意保留（video/seo/mkt/cs/localize）| ✅ diff 中 seo entry 可見，map 未清除，卡西法已驗 | ✓ |
| 1f | `data.standalone.jsx` 同 1a-1e（standalone 版同步）| ✅ data.standalone.jsx 與 data.jsx 改動完全對應 | ✓ |
| 2a | `app2.jsx` Step1 探索置頂 strip（discoveryV button 全寬）| ✅ discoveryV strip 增加，寬度 100%，位於 grid 上方 | ✓ |
| 2b | `app2.jsx` gridVerticals 過濾 featured | ✅ `gridVerticals = VERTICALS.filter(v => !v.featured)` 已入 useMemo | ✓ |
| 2c | `app2.jsx` chips 計數排除 discovery | ✅ chip count 改為 gridVerticals.length / gridVerticals.filter | ✓ |
| 2d | `app2.jsx` ★主打標記（lead 標記顯示在 meta span）| ✅ `v.lead ? "★ " + _t("client.vertical_lead_tag", "主打") + ...` 已加入 | ✓ |
| 2e | `app2.jsx` isVerticalAvailable 探索永真 | ✅ `if (v.featured === "discovery") return true` 兩處（isVerticalAvailable + curIsOk）| ✓ |
| 2f | `app2.jsx` Step4 worker 卡驗收證據列（evidence_real/evidence_demo 分流）| ✅ Step4 worker 卡新增證據 div，source === "real" 分流，cases/nps 條件渲染 | ✓ |
| 3a | `dict.zh.js` client 區 7 新 key | ✅ vertical_lead_tag / discovery_entry_tag / discovery_title / discovery_blurb / discovery_meta / evidence_real / evidence_demo 全部到位 | ✓ |
| 3b | `dict.zh.js` network 15→10 領域字串（含探索）| ✅ verticals array 從 15 項縮為 10 項（9 領域 + 其他），eyebrow/headline_part1 對應更新 | ✓ |
| 3c | `dict.zh.js` services intro 問責句 + 新 item 00 PAID DISCOVERY | ✅ item 00 加入，intro 尾加問責句，headline_part1 加「1 個探索入口 +」| ✓ |
| 3d | `dict.zh.js` footer link_15verticals 改 9 | ✅ `"link_15verticals": "9 領域總覽"` | ✓ |
| 3e | `dict.en.js` 同 3a-3d 英文版對應 | ✅ dict.en.js 7 新 key（LEAD/entry product/Paid Discovery...）+ network array 10 項 + item 00 + link_15verticals "9 verticals overview" | ✓ |
| 4a | `landing.html` EVerticals HOT [0,6]→[1,2,3,4] | ✅ `const HOT = [1, 2, 3, 4]` | ✓ |
| 4b | `landing.html` 兩處 fallback 字串 15→9 | ✅ eyebrow fallback "9 領域 + 探索入口" + headline fallback "9 個" | ✓ |
| 4c | `landing.html` dict cache-bust → 2026-06-11-vert9 | ✅ dict.zh.js?v=2026-06-11-vert9 / dict.en.js?v=2026-06-11-vert9 | ✓ |
| 5 | `app.html` data.standalone/app2/dict.zh/dict.en 版號 → 2026-06-11-vert9 | ✅ 4 個 `?v=` 全部更新 | ✓ |
| 5 | `index.html` 同上 | ✅ | ✓ |
| 5 | `mobile.html` 同上（data.standalone/app2 兩處）| ✅ | ✓ |
| 5 | `waitlist.html` 同上（dict 兩處）| ✅ | ✓ |
| 5 | `admin.html` 同上（dict 兩處）| ✅ | ✓ |

**AC 達成率：25/25 ✅（100%）**

---

## 2. 夾帶排查

### 本批 11 個改動檔

| 檔案 | 改動類型 | 屬本批？ |
|---|---|---|
| `components/data.jsx` | 領域卡重構 | ✅ |
| `components/data.standalone.jsx` | 領域卡重構（standalone 同步）| ✅ |
| `components/app2.jsx` | Step1 strip + 邏輯 + Step4 證據列 | ✅ |
| `components/i18n/dict.zh.js` | i18n 同步 | ✅ |
| `components/i18n/dict.en.js` | i18n 同步 | ✅ |
| `landing.html` | EVerticals HOT + fallback + cache-bust | ✅ |
| `app.html` | cache-bust 僅 | ✅ |
| `index.html` | cache-bust 僅 | ✅ |
| `mobile.html` | cache-bust 僅 | ✅ |
| `waitlist.html` | cache-bust 僅 | ✅ |
| `admin.html` | cache-bust 僅 | ✅ |

### 排除確認（git status 已識別、不 stage）

| 檔案 / 路徑 | 狀態 | 處置 |
|---|---|---|
| `milestone-detail.html` | M（另一工作線）| 不 stage ✅ |
| `.claude/launch.json` | M（另一工作線）| 不 stage ✅ |
| `docs/marketing/` | Untracked（另一工作線）| 不 stage ✅ |

**夾帶狀況：無夾帶、無遺漏。**

---

## 3. Gate 1 / Gate 2 Verdict 摘要

### Gate 1 · 卡西法 · GO-with-notes

**Verdict：GO**

已記錄 notes（下批 tickets）：
- `footer.link_15verticals` key 無 consumer = 死 key；值已防禦性改對，UI 無效果（AC 不主張 UI 效果）
- `hardcode 8wk`（Step 1 某處）與 Step 3 chips hardcode → 開下批優化票
- mobile deep-link 既有限制（現況已知，非本批引入）

### Gate 2 · 女巫 · PASS-with-notes

**Verdict：PASS**

已記錄 P1 × 4（非阻 push，下批視覺優化）：
1. 孤字「人。」斷行（services intro 文案末尾）
2. services desktop 五卡密度天花板（加 item 00 後略擁擠）
3. 探索膠囊視覺權重（置頂 strip 在不同 viewport 的強調感需微調）
4. 平台代收代付段 390 行距（既有問題非本批引入）

---

## 4. 退版方案

**方法 A · Git Revert（推薦）**

```bash
git revert <本次 commit hash> --no-commit
git commit -m "revert: rollback 調研批 15→9 (emergency)"
git push origin main
```

Vercel 綁 GitHub，push 後自動部署退版。

**方法 B · Vercel Rollback UI（< 2 分鐘）**

1. https://vercel.com → BeyondPath project → Deployments
2. 找上一個 Production deployment（9a7ab37 · quota fix）
3. `...` → Promote to Production

**退版後確認**：
- [ ] landing 領域熱條恢復 15 項顯示（HOT [0,6]）
- [ ] app Step1 無探索置頂 strip
- [ ] console 零 error

---

## 5. HTML 尾部裸文字確認

本批僅改 `<script>` tag 版號字串，未觸及 `</html>` 後的任何內容，尾部裸文字無風險。（`</html>` 前後結構未動）

---

## 6. VERTICAL_DEMO_MAP 相容性確認

舊 id（video / seo / mkt / cs / localize）已從 VERTICALS 卡片陣列移除，但 VERTICAL_DEMO_MAP 對應 entry 刻意保留，確保：
- 持有舊 localStorage state（vertical = 'seo' 等）的用戶不觸發 undefined 錯誤
- 後端歷史資料回放不斷鏈

此設計為卡西法 Gate 1 已驗證項目，馬魯克確認一致。

---

## 7. Gate 4 Verdict

### Checklist

| 項目 | 結果 | 說明 |
|---|---|---|
| AC 對照（25 項）| ✅ PASS | 100% 命中，無遺漏、無超綱 |
| 夾帶排查 | ✅ PASS | 3 個排除項已確認不 stage |
| HTML 尾部裸文字 | ✅ PASS | 無異動 |
| Cache-bust 版號一致 | ✅ PASS | 6 個 HTML 全部 2026-06-11-vert9 |
| VERTICAL_DEMO_MAP 相容 | ✅ PASS | 舊 id entry 保留，向後相容 |
| Gate 1 卡西法 | ✅ GO-with-notes | 3 項 notes 已記錄下批 |
| Gate 2 女巫 | ✅ PASS-with-notes | P1 × 4 非阻 push |
| 退版方案確認 | ✅ PASS | git revert + Vercel Rollback 兩條路徑 |
| 雙軌工時回填 | ✅ PASS | 見文件頭部欄位 |

### Verdict: **PASS**

Gate 1 GO-with-notes + Gate 2 PASS-with-notes + Gate 4 PASS = **可 commit、待 Edward 實站視覺審核後 push prod**。

下批 tickets（非阻 push）：
- [ ] footer dead key `link_15verticals` 是否需清理（卡西法 note）
- [ ] `hardcode 8wk` + Step 3 chips hardcode 優化
- [ ] services desktop 五卡密度 + 探索膠囊視覺權重微調（女巫 P1）
- [ ] 孤字「人。」文案修補

---

*Gate 4 審核人：馬魯克 · 2026-06-11*
*文件路徑：`docs/diff-report-2026-06-11-vert9.md`*
