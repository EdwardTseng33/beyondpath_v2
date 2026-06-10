# BeyondPath QA SOP & Checklist — 每次 ship 必跑

- 作者：馬魯克 (PM/QA Lead)
- 建立日期：2026-05-28
- 版本：v1.0
- 用途：SOP 模板，每次 ship 前複製使用，不是一次性產出
- 對應 sprint：v1.6.0β 起適用，往後每版繼承

---

## 1. BeyondPath QA 8 維 testing type 對照

| 類型 | 是什麼 | 何時跑 | 城堡主責 |
|---|---|---|---|
| **流程服務測試 (e2e)** | 完整 client / worker / admin journey 跑一遍，看商業 flow 是否閉環。驗「整條路走得通」 | 每次 M / L feature ship、每次 sprint 結束 | 卡西法 (Chrome MCP) |
| **猴子測試 (monkey)** | 隨機亂點、亂填、非預期輸入，找 crash 與邊界 bug。驗「非正常路徑不會爆」 | 每次涉及表單 / 使用者輸入的 ship | 卡西法 (Chrome MCP) |
| **回歸測試 (regression)** | 每次 ship 跑同一套固定 checklist，驗改 A 沒壞 B | 每次 ship（必跑，和 smoke 並行）| 馬魯克統籌、卡西法執行 |
| **冒煙測試 (smoke)** | 5 分鐘快速驗核心路徑通不通，不深入細節 | 每次任何 push，含 hotfix / CSS 調整 | 卡西法 |
| **負載測試 (load)** | 模擬高流量，看 Edge Function / Supabase 撐不撐 | 正式上線前、重大架構改動前 | 卡西法 + 沙利曼 |
| **視覺回歸 (visual regression)** | 截圖對比 ship 前後 5 個重點頁面，找 layout 破版 | 每次涉及 CSS / UI 的 ship | 女巫 (Gate 2) |
| **資安測試 (security)** | SQL injection / XSS / auth bypass / Edge Function 無 auth 漏洞 | 每次涉及 auth / DB / Edge Function 的 ship | 沙利曼 (Gate 5) |
| **跨裝置測試 (cross-device)** | Mobile 375px / Desktop 1440px / Tablet 768px × Chrome / Safari | 每次涉及 UI 改動的 ship；M/L feature 必跑 | 卡西法 (Chrome MCP) + 女巫 |

---

## 2. BeyondPath 必過 5 步 Checklist（每次 ship 必跑）

> 使用方式：複製下方 checklist 段落，填入本次版本號與日期，逐項打勾

### 本次 ship 資訊

- 版本：v______
- 日期：________
- 執行人：________
- 對應 diff-report：`docs/launch/______`

---

### Step 1 · Smoke（目標 5 分鐘）

| # | 項目 | 結果 |
|---|---|---|
| S1 | admin 後台 (`/admin.html`) 能進、需 Google OAuth，未登入有 gate | [ ] PASS / [ ] FAIL |
| S2 | client 表單 (`/app.html?role=client&step=0`) 能開、第一頁正常 render | [ ] PASS / [ ] FAIL |
| S3 | worker 申請 (`/app.html?role=worker&onboarding=1`) 能 submit | [ ] PASS / [ ] FAIL |
| S4 | Landing (`/landing.html`) 3 條核心 CTA 連結不 404 | [ ] PASS / [ ] FAIL |
| S5 | Root (`/`) 有正常 redirect 到 landing，不 404 | [ ] PASS / [ ] FAIL |

**Smoke 結果：** [ ] 全 PASS 繼續 Step 2 / [ ] 有 FAIL → 停止、列 P0 bug

---

### Step 2 · 流程服務測試 E2E（目標 30 分鐘）

跑完整 3 條 journey，每條必走到最後一步：

#### Journey A · Client 發案流（11 步）

| # | 步驟 | 預期結果 | 結果 |
|---|---|---|---|
| A1 | Landing → 點「我要發案」進 `app.html?role=client&step=0` | 進入行業選擇頁 | [ ] |
| A2 | 選擇行業（例：行銷） | 進入下一步 brief 填寫 | [ ] |
| A3 | 填完 brief、設 budget / timeline | 資料正確帶入下一步 | [ ] |
| A4 | 到 Step 04 Match → 觸發 IntakeSubmitModal | Modal 出現、要求填 email | [ ] |
| A5 | 填 email → submit | Supabase insert 成功 + 解鎖合約 CTA | [ ] |
| A6 | 重新載頁面、相同 email 已記錄 | Admin 後台可見新一筆 client intake | [ ] |

#### Journey B · Worker 認證申請流（3 步）

| # | 步驟 | 預期結果 | 結果 |
|---|---|---|---|
| B1 | Landing → 點 Worker CTA 進 `app.html?role=worker&onboarding=1` | 進入 Step 0 歡迎頁 | [ ] |
| B2 | Step 0 → Step 1（AI JSON paste）→ Step 2（preview + email）→ submit | 走完 3 步不中斷 | [ ] |
| B3 | Supabase `worker_applications` 有新紀錄、submitted 確認頁出現 | DB row 存在 | [ ] |

#### Journey C · Admin 後台管理流

| # | 步驟 | 預期結果 | 結果 |
|---|---|---|---|
| C1 | 進 `/admin.html` 未登入 → redirect / 攔截 | Gate 有擋，不顯示資料 | [ ] |
| C2 | Google OAuth 登入 → admin 進入 Console | 能看到 client / worker 列表 | [ ] |
| C3 | 非 admin email 登入 → ForbiddenScreen | 不能進資料頁 | [ ] |

**E2E 結果：** [ ] 3 條全過 / [ ] 有失敗 → 列明 Journey 代號 + 步驟號

---

### Step 3 · 猴子測試（目標 15 分鐘）

針對 3 個高風險表單做非預期輸入：

| # | 測試場景 | 驗證點 | 結果 |
|---|---|---|---|
| M1 | Client intake：所有欄位貼超長字串（1000 字）| 不 crash / 不 break layout | [ ] PASS / [ ] FAIL |
| M2 | Client intake：email 欄填非 email 格式 submit | 有 validation 錯誤提示、不進 DB | [ ] PASS / [ ] FAIL |
| M3 | Worker 申請：Step 1 貼無效 JSON submit | 有錯誤提示、不 crash | [ ] PASS / [ ] FAIL |
| M4 | 所有表單：連點 submit 2 次快速觸發 | 不重複 insert / 有 loading state | [ ] PASS / [ ] FAIL |
| M5 | Mobile 375px viewport：主要流程三頁截圖 | 無明顯破版 | [ ] PASS / [ ] FAIL |
| M6 | 直接帶奇怪 query param（`?role=xxx&step=999`）| 不 crash、有 fallback | [ ] PASS / [ ] FAIL |

**猴子測試結果：** [ ] 全 PASS / [ ] 有 FAIL → 列項目號

---

### Step 4 · 視覺檢查（目標 10 分鐘）

女巫主責。對比本版 vs 上一版截圖：

| # | 頁面 | Viewport | 結果 |
|---|---|---|---|
| V1 | `/landing.html` | Desktop 1440px | [ ] PASS / [ ] FAIL / [ ] N/A |
| V2 | `/landing.html` | Mobile 375px | [ ] PASS / [ ] FAIL / [ ] N/A |
| V3 | `/app.html?role=client&step=0` | Desktop | [ ] PASS / [ ] FAIL / [ ] N/A |
| V4 | `/app.html?role=worker&onboarding=1` | Desktop | [ ] PASS / [ ] FAIL / [ ] N/A |
| V5 | `/admin.html` (Google auth 後) | Desktop | [ ] PASS / [ ] FAIL / [ ] N/A |

**視覺結果：** [ ] 全 PASS / [ ] 有 FAIL → 描述具體差異

---

### Step 5 · 資安基礎（目標 5 分鐘）

沙利曼主責。詳細流程引用 `docs/launch/14-auth-hardening-spec.md` P0-1 / P0-2 / P0-3。

| # | 項目 | 結果 |
|---|---|---|
| SA1 | Admin 後台未登入直接存取 → 有 gate 攔截（不顯示任何資料）| [ ] PASS / [ ] FAIL |
| SA2 | Edge Function POST 無有效 JWT → 回 401 / 403，不執行邏輯 | [ ] PASS / [ ] FAIL |
| SA3 | Client intake email 欄填 `<script>alert(1)</script>` → 不執行 / 存入 DB 被 escaped | [ ] PASS / [ ] FAIL |
| SA4 | RLS policy：anon 用戶無法讀 `client_intakes` 完整清單 | [ ] PASS / [ ] FAIL |
| SA5 | Environment variable / API key 沒有暴露在前端 HTML source | [ ] PASS / [ ] FAIL |

> SA2 為警示級：若 Edge Function POST 完全不擋 → 列 P0，block ship。
> 完整 auth hardening spec 見 `docs/launch/14-auth-hardening-spec.md`。

**資安結果：** [ ] 全 PASS / [ ] 有 FAIL → 列項目號 + 描述

---

## 3. Bug Severity 定義

| 等級 | 定義 | 上線決定 |
|---|---|---|
| **P0 上線阻擋** | crash / 資料遺失 / 安全漏洞 / 法律違規 / 任一完整 journey 走不通 | 必須修完才能 ship |
| **P1 上線就修（1 週內）** | 邏輯錯誤 / 體驗明顯破口 / 特定主流瀏覽器 break / Mobile 375px 嚴重破版 | 可 ship，但必有修補時程 + owner |
| **P2 上線後補（v1.6.0β-W3 內）** | UI 小瑕疵 / 邊緣 case / 非主流瀏覽器相容 / 非關鍵流程 bug | 不阻擋 ship，排入下週 backlog |
| **P3 後補（不阻擋）** | 完美主義級 polish / 文案微調 / 錦上添花 | 不阻擋 ship，有空才做 |

---

## 4. 紅黃綠燈評估標準

| 燈號 | 條件 | 動作 |
|---|---|---|
| **GO** | 0 個 P0 + P1 數量 ≤ 2 + 卡西法 self-verdict GO | 馬魯克蓋章，通知蘇菲可 ship |
| **GO-with-fixes** | 0 個 P0 + P1 數量 3-5 個 + 每個 P1 有 owner + 修補時程 | 馬魯克開條件 GO，P1 修補計畫必須附上 |
| **NO-GO** | 任 1 個 P0 / P1 數量 > 5 / 卡西法 self-verdict NO-GO | 馬魯克 block ship，列出必修清單，報蘇菲 |

> 與 v5.4.23 燒錢 Gate 對齊：若 NO-GO 導致 sprint 燒時間，馬魯克必回填 estimation_log + 寫 lesson_qa_*.md，說明為何沒在 Step 1 Smoke 早期發現。

---

## 5. 跑 QA 的人員職責

| 角色 | 職責 | 主跑步驟 |
|---|---|---|
| **卡西法** | 實際 e2e + 猴子測試 (Chrome MCP)，提供截圖 + console log 作為 PASS 證據 | Step 1 Smoke / Step 2 E2E / Step 3 猴子 / Step 5 SA2 |
| **馬魯克** | 寫報告 + 整合結果 + 紅黃綠燈 verdict + 版控確認 + diff-report AC 核對 | 統籌整個 SOP，Step 5 SA4/SA5 |
| **女巫** | 視覺回歸（截圖對比），依 10 維 rubric 評分 | Step 4 視覺檢查 |
| **沙利曼** | 資安測試 + 合規 review，引用 `14-auth-hardening-spec.md` 流程 | Step 5 全部 (SA1-SA5) |
| **蘇菲** | 整合最後 verdict，給 Edward 一句話 + GO / NO-GO 決定 | 接收馬魯克報告，最終拍板 |

---

## 6. 跟 v5.4.23 燒錢 Gate 對齊

本 SOP 不重複寫 Gate 5 完整內容，依下列規則對齊：

1. **沙利曼 review 流程** 引用 `docs/launch/14-auth-hardening-spec.md`（P0-1 Admin Console gate / P0-2 / P0-3）
2. **任何 NO-GO** 觸發前必先跑 Step 1 Smoke（5 分鐘）——若 Smoke 就失敗，後續步驟停止，不燒後續測試時間
3. **馬魯克 Gate 4 checkpoints 必須有證據**：截圖 / console output / test runner stdout，空口 PASS 無效
4. **燒時間 Gate 5 定義**（v5.4.23）：
   - 若同一 bug 被 skip > 1 次 → 升 P0 處理
   - 若 NO-GO 阻擋發生在「明顯可在 Smoke 階段攔到的 bug」→ 馬魯克寫 lesson_qa_*.md 補充「Smoke 未抓到的 root cause」
5. **不允許繞過 SOP 直接 push**：任何 push 前 Step 1 Smoke 強制執行，無例外

---

## 7. QA 報告彙整模板

> 跑完 5 步後，卡西法 / 女巫 / 沙利曼各回報，馬魯克整合成以下格式交給蘇菲

```
# QA 整合報告 · vX.X.X · YYYY-MM-DD

## 結論
燈號：[ ] GO / [ ] GO-with-fixes / [ ] NO-GO
P0 數：___  P1 數：___  P2 數：___  P3 數：___

## 5 步結果摘要
- Step 1 Smoke：PASS / FAIL（___）
- Step 2 E2E：PASS / FAIL（___）Journey A/B/C 均過 / 失敗項：___
- Step 3 猴子：PASS / FAIL（___）
- Step 4 視覺：PASS / FAIL（___）
- Step 5 資安：PASS / PASS / FAIL（___）

## Bug 清單
| ID | 嚴重度 | 描述 | Owner | 修補時程 |
|---|---|---|---|---|
| BUG-001 | P_ | | | |

## 證據附錄
- 截圖：（連結或 `/docs/launch/` 路徑）
- Console log：（卡西法提供）
- 沙利曼 review：（引用 `14-auth-hardening-spec.md` 對應段）

## 一句話給 Edward
（蘇菲填寫）

## 回填資料
- 預估工時：___ / 移動城堡估：___ / 實際耗時：___ (差距 _%)
- 審核回合：___ 輪
```

---

## 附錄：常見 Bug 快速查表

| 症狀 | 可能原因 | 先查哪裡 |
|---|---|---|
| Client intake submit 後資料沒進 DB | Supabase anon key missing / RLS policy 擋 INSERT | 開 Chrome DevTools Network → 看 Supabase POST response |
| Admin 後台看不到任何資料 | JWT 沒帶 / admin email 不符 RLS allowlist | `14-auth-hardening-spec.md` P0-1 |
| Worker submit 後沒有確認頁 | `worker_applications` insert FAIL / submitted state URL 未正確帶 | 看 `app.html?role=worker&onboarding=1&submitted=1` 直連是否正常 |
| Landing CTA 點了沒反應 | href 斷掉 / JS error 擋住 click handler | 開 Console 看有無 error |
| Mobile 375px 版面破版 | CSS breakpoint 覆蓋問題 | DevTools Toggle Device，縮小到 375px 截圖 |
| Root `/` 404 | `vercel.json` redirect 未設 | 確認 `vercel.json` 有 `"/" → "/landing.html"` rule |
