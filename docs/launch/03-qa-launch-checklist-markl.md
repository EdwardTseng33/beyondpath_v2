# Gate 4 · Launch QA Checklist — BeyondPath v0.2
*Gate 4 版控確認 · 作者：馬魯克 · 2026-05-14*
*對應 commit：`3e5e789` (Wire client intake to Supabase with submit modal)*

---

## 1. Entry Inventory（所有可被點進來的入口 · 全列）

### 凡例
- **Status**：`live`（可正常 render） / `partial`（功能存在但有限制） / `internal`（非對外分享）
- **From**：哪些入口可到達此 entry

---

### 1.1 `/landing.html`（`beyondpath.tw/landing.html`）
| 欄位 | 內容 |
|---|---|
| **完整 URL** | `https://beyondpath.tw/landing.html` |
| **URL 變體** | 無 query param 變體（所有 CTA 從 landing 往外）|
| **預期 render** | 公開 landing page：品牌 header + hero 區 + problem/engine/trust/case/tier/FAQ 段 + 底部 final CTA |
| **預期 user 行為** | 閱讀 → 點 client CTA 進發案流 / 點 worker CTA 進認證申請 / 點 worker demo 看成果 / 點 SIGN IN |
| **Status** | `live` |
| **From** | 直連 URL；`sign-in.html` 右上角回首頁；`waitlist.html` 右上角；worker 申請完成頁回首頁 |

---

### 1.2 `/`（root，`beyondpath.tw/`）
| 欄位 | 內容 |
|---|---|
| **完整 URL** | `https://beyondpath.tw/` |
| **URL 變體** | 無 |
| **預期 render** | Vercel 靜態托管預設：若無 `index` 重定向，可能 404 或 Vercel 目錄列表 |
| **預期 user 行為** | 理想：自動 redirect 到 `landing.html`；實際：需確認 Vercel routing |
| **Status** | `partial`（需確認 root redirect，目前 project-status.md 沒記錄 root → landing 的 redirect rule）|
| **From** | 直連 URL、搜尋引擎 |

> **風險：** `beyondpath.tw/` root 若沒有 redirect 規則，外部分享裸網域會 404。上線前必確認 `vercel.json` 有無 redirect `"/"` → `"/landing.html"`。

---

### 1.3 `/app.html?role=client&step=0`（客戶發案流）
| 欄位 | 內容 |
|---|---|
| **完整 URL** | `https://beyondpath.tw/app.html?role=client&step=0` |
| **URL 變體** | `?role=client&step=0`（step 0-11 均可接，跳到對應 journey step）；`?role=client&signedin=1`（Google OAuth 回調後） |
| **預期 render** | BP_AppShell → ClientIntakeApp → step 0 起點（垂直行業選擇）|
| **預期 user 行為** | 選行業 → 填 brief → 設 budget/timeline → Step 04 Match（觸發 IntakeSubmitModal）→ 填 email → Supabase insert → 解鎖合約 CTA |
| **Status** | `live`（Supabase 已串，Modal email 收集已啟用）|
| **From** | landing hero CTA「我要發案」；landing footer CTA；sign-in.html 底部鏈接 |

---

### 1.4 `/app.html?role=worker&onboarding=1`（Worker 認證申請流）
| 欄位 | 內容 |
|---|---|
| **完整 URL** | `https://beyondpath.tw/app.html?role=worker&onboarding=1` |
| **URL 變體** | 無額外 step param |
| **預期 render** | BP_AppShell → WorkerCertApp → Step 0 歡迎頁（Apply for Tier B Certification 按鈕）→ 3 步 apply 流程 |
| **預期 user 行為** | 閱讀說明 → 進入 Step 0（get brief）→ Step 1（paste back AI JSON）→ Step 2（preview ability card + 填 email）→ Supabase insert worker_applications → 顯示 submitted 確認頁 |
| **Status** | `live`（3 步流程 + Supabase 已串）|
| **From** | landing nav「APPLY · BETA」按鈕；landing hero worker CTA；sign-in.html 底部鏈接 |

---

### 1.5 `/app.html?role=worker&onboarding=1&submitted=1`（Worker 申請完成頁）
| 欄位 | 內容 |
|---|---|
| **完整 URL** | `https://beyondpath.tw/app.html?role=worker&onboarding=1&submitted=1` |
| **URL 變體** | 無 |
| **預期 render** | WorkerCertApp 完成狀態：顯示「APPLICATION RECEIVED」確認訊息 + 兩個 CTA（看 Worker Demo / 回首頁）|
| **預期 user 行為** | 看確認訊息 → 選擇看 demo 或回 landing |
| **Status** | `live` |
| **From** | 只能從 Step 2 submit 後到達；或直連 URL（直連會 bypass apply 流程但仍可 render）|

---

### 1.6 `/app.html?role=worker&view=worker-demo`（Worker Console Demo）
| 欄位 | 內容 |
|---|---|
| **完整 URL** | `https://beyondpath.tw/app.html?role=worker&view=worker-demo` |
| **URL 變體** | 無 |
| **預期 render** | BP_AppShell → Worker Dashboard（通過認證後的工作儀表板 demo 視圖）|
| **預期 user 行為** | 看 Worker Console demo 功能、了解平台能力 |
| **Status** | `live`（2026-05-11 新增 direct path，不再被 apply flow 擋住）|
| **From** | landing hero「先看通過後 Worker Console」鏈接；申請完成頁 CTA；sign-in.html 底部鏈接 |

---

### 1.7 `/sign-in.html`（通用登入，預設 client 角色）
| 欄位 | 內容 |
|---|---|
| **完整 URL** | `https://beyondpath.tw/sign-in.html` |
| **URL 變體** | `?role=client`（預設）；`?role=worker` |
| **預期 render** | 登入卡片：角色切換器（client/worker）+ Google OAuth 按鈕 + email 備用說明 |
| **預期 user 行為** | 選角色 → 點 Continue with Google → Supabase OAuth redirect → 成功後跳 `app.html?role={role}&signedin=1` |
| **Status** | `live`（實際 Supabase Google OAuth，已完成 e2e 驗收）|
| **From** | landing nav「SIGN IN」按鈕（帶 `?role=client`）|

---

### 1.8 `/sign-in.html?role=client`
| 欄位 | 內容 |
|---|---|
| **完整 URL** | `https://beyondpath.tw/sign-in.html?role=client` |
| **預期 render** | 同 sign-in.html，預選 client 角色 |
| **Status** | `live` |
| **From** | landing nav SIGN IN 按鈕 |

---

### 1.9 `/sign-in.html?role=worker`
| 欄位 | 內容 |
|---|---|
| **完整 URL** | `https://beyondpath.tw/sign-in.html?role=worker` |
| **預期 render** | 同 sign-in.html，預選 worker 角色 |
| **Status** | `partial`（UI 支援，但 landing 目前沒有直連 `?role=worker` 的 sign-in 按鈕，只有 apply CTA）|
| **From** | 直連 URL（手動）|

---

### 1.10 `/waitlist.html`
| 欄位 | 內容 |
|---|---|
| **完整 URL** | `https://beyondpath.tw/waitlist.html` |
| **URL 變體** | 無 |
| **預期 render** | waitlist 聯繫頁：email 顯示（`edwardt0303@gmail.com`）+ copy email 按鈕 + mailto 草稿 CTA + 角色說明 3 格 |
| **預期 user 行為** | 看說明 → 點 mailto 連結開信箱、或手動複製 email |
| **Status** | `live`（無後端表單，手動 email fallback，已驗收）|
| **From** | app.html disclaimer banner「加入 waitlist →」；landing.html footer「加入 waitlist →」；mobile.html disclaimer |

---

### 1.11 `/mobile.html`
| 欄位 | 內容 |
|---|---|
| **完整 URL** | `https://beyondpath.tw/mobile.html` |
| **URL 變體** | 無 |
| **預期 render** | 手機模擬 prototype：iOS 機殼框 + 客戶發案流（mobile 視圖）+ prototype disclaimer banner |
| **預期 user 行為** | Demo 展示用，看客戶發案的 mobile UX |
| **Status** | `live`（standalone mobile demo，disclaimer banner 顯示）|
| **From** | 直連 URL（主要用於內部展示 / demo）；landing 及 app.html 無公開連結 |

---

### 1.12 `/index.html`（設計畫板視圖）
| 欄位 | 內容 |
|---|---|
| **完整 URL** | `https://beyondpath.tw/index.html` |
| **URL 變體** | 無 |
| **預期 render** | 設計 canvas 視圖：桌面 + 手機 artboard 並排，含 BP_AppShell / IOSDevice 組件 |
| **預期 user 行為** | 內部設計審查 / 原型對照用，非公開 share 頁 |
| **Status** | `internal`（功能性 render，但非主要對外入口）|
| **From** | 直連 URL（內部）|

---

## 2. Per-Entry Verification Checklist

每條 `[ ]` = 上線前必親手確認，`[auto]` = 可用 Chrome MCP 自動截圖驗證，`[manual]` = 必手動（如真實 OAuth）。

---

### 2.1 `/landing.html`
- [ ] [auto] HTTP 200 OK（curl 或瀏覽器網路面板）
- [ ] [auto] 頁面無白屏，hero 區、nav、FAQ 段可見
- [ ] [auto] console 無 error（允許 Google Fonts preconnect warning）
- [ ] [auto] 「我要發案」CTA 點擊 → 跳轉 `app.html?role=client&step=0`（正確 URL）
- [ ] [auto] 「申請 Tier B 認證」/ worker CTA → 跳 `app.html?role=worker&onboarding=1`
- [ ] [auto] 「先看通過後 Worker Console」→ 跳 `app.html?role=worker&view=worker-demo`
- [ ] [auto] nav 「SIGN IN」→ 跳 `sign-in.html?role=client`
- [ ] [auto] footer `waitlist.html` 鏈接可點通
- [ ] [auto] mobile 375px 寬度視圖：nav 無破版，CTA 按鈕可見
- [ ] [manual] 深色模式（OS-level）無明顯顏色崩潰

---

### 2.2 `/` (root)
- [ ] [auto] `beyondpath.tw/` 是否 200 redirect 到 `landing.html` → **確認 `vercel.json` rewrites 規則**
- [ ] [auto] 若 redirect 規則不存在：確認是否 404 或 Vercel 目錄列表（任一皆不可接受）
- [ ] [manual] 直接在瀏覽器輸入 `beyondpath.tw` 確認行為

---

### 2.3 `/app.html?role=client&step=0`
- [ ] [auto] HTTP 200 OK
- [ ] [auto] React 載入成功（BP_AppShell visible），無 React render error
- [ ] [auto] step 0 行業選擇卡片顯示（至少 3 個 vertical 選項可見）
- [ ] [auto] console 無 error（允許 `[BeyondPath] Supabase client ready` info log）
- [ ] [manual] 選行業 → 填 brief → 進 step 4（Match）→ IntakeSubmitModal 彈出
- [ ] [manual] Modal 填入 test email → submit → Supabase 確認 `client_intakes` 有新 row
- [ ] [auto] mobile 視圖：ClientIntakeApp 在 IOSDevice 框內，無水平溢出
- [ ] [auto] CDN 資源載入（unpkg React、Babel、supabase-js）無 4xx/5xx
- [ ] [manual] Step 05 之後合約 CTA 在 modal submit 前是否 disabled

---

### 2.4 `/app.html?role=worker&onboarding=1`
- [ ] [auto] HTTP 200 OK
- [ ] [auto] WorkerCertApp 歡迎頁 render（顯示「Tier B 認證」說明）
- [ ] [auto] 「Apply for Tier B Certification」按鈕可見且可點
- [ ] [auto] console 無 error
- [ ] [manual] Step 0（get brief）：AI brief generator copy-prompt 顯示、Claude/ChatGPT/Gemini 按鈕可點（新分頁開啟）
- [ ] [manual] Step 1（paste back）：JSON 格式驗證（malformed JSON 要有錯誤提示）
- [ ] [manual] Step 2（preview card + email）：ability card 正確 render L score 與 axis
- [ ] [manual] Step 2 submit：Supabase `worker_applications` 有新 row，email 欄位正確
- [ ] [auto] mobile 375px 下：3-step flow 無破版
- [ ] [auto] 完成後跳轉到 submitted 狀態頁（URL 或 in-page state）

---

### 2.5 `/app.html?role=worker&onboarding=1&submitted=1`
- [ ] [auto] HTTP 200 OK（直連）
- [ ] [auto] 「APPLICATION RECEIVED」確認文字可見
- [ ] [auto] 「看通過後 Worker Console」CTA 可點 → 跳 `app.html?role=worker&view=worker-demo`
- [ ] [auto] 「← 回 BeyondPath 首頁」可點 → 跳 `landing.html`
- [ ] [auto] console 無 error
- [ ] [auto] mobile 下：layout 無破版

---

### 2.6 `/app.html?role=worker&view=worker-demo`
- [ ] [auto] HTTP 200 OK
- [ ] [auto] Worker Dashboard demo 視圖 render（非 apply flow，直接看 console）
- [ ] [auto] console 無 error
- [ ] [auto] 主要 dashboard 模塊可見（案件列表 / ability card / 等）
- [ ] [auto] mobile 下：無破版
- [ ] [manual] logout / 返回按鈕：點後 localStorage 清除，redirect 到 `landing.html`

---

### 2.7 `/sign-in.html`（及 `?role=client` / `?role=worker`）
- [ ] [auto] HTTP 200 OK
- [ ] [auto] 登入卡片 render（Google 按鈕、role 切換器可見）
- [ ] [auto] console 無 error（允許 `[BeyondPath] Supabase client ready`）
- [ ] [auto] prototype 免責聲明 banner 可見
- [ ] [manual] `?role=client` → client tab 預選（綠色高亮）
- [ ] [manual] `?role=worker` → worker tab 預選
- [ ] [manual] 點 Continue with Google → 彈出 Google OAuth popup 或 redirect（不卡住、不 404）
- [ ] [manual] OAuth 成功後：redirect 回 `app.html?role={role}&signedin=1`
- [ ] [manual] 已登入用戶直連 `sign-in.html` → 自動 redirect，不重複要求登入
- [ ] [auto] mobile 下：card 無破版，Google 按鈕完整可見
- [ ] [auto] 右下角「← 回首頁」鏈接可點 → `landing.html`

---

### 2.8 `/waitlist.html`
- [ ] [auto] HTTP 200 OK
- [ ] [auto] 頁面 render（email 欄位 `edwardt0303@gmail.com` 可見）
- [ ] [auto] console 無 error
- [ ] [auto] Copy email 按鈕在 DOM 中（clipboard API，可能需 HTTPS 才跑）
- [ ] [manual] 點 「寫信給 Edward」mailto 按鈕 → 信箱 app 開啟 + subject/body 預填
- [ ] [auto] 「BACK TO LANDING」按鈕可點 → `landing.html`
- [ ] [auto] mobile 375px 下：layout 無破版，role 說明 3 格正常堆疊

---

### 2.9 `/mobile.html`
- [ ] [auto] HTTP 200 OK
- [ ] [auto] iOS 機殼框 render，頁面無白屏
- [ ] [auto] prototype disclaimer banner 可見
- [ ] [auto] `waitlist.html` 連結可點
- [ ] [auto] console 無 error
- [ ] [auto] 真實手機瀏覽（375px）：全螢幕模式無邊框，UX 可操作
- [ ] [manual] 客戶發案流 step 1-4 可走通（mobile.html 內的 ClientIntakeApp）

---

### 2.10 `/index.html`（設計畫板）
- [ ] [auto] HTTP 200 OK
- [ ] [auto] 桌面 + 手機 artboard 並排 render
- [ ] [auto] console 無 error
- [ ] 上線前評估是否需要加 `noindex` meta tag（設計畫板不宜被搜尋引擎索引）

---

## 3. Cross-Entry Flow 連接 Audit

### 3.1 Landing → Client 完整流程
```
landing.html
  ↓ 「我要發案」CTA
app.html?role=client&step=0
  ↓ Step 0 → 1 → 2 → 3 → 4（Match / IntakeSubmitModal）
  ↓ submit → Supabase client_intakes 寫入 → 解鎖 Step 5 合約 CTA
  ↓ (Step 5-12 剩餘 journey steps)
```
- [ ] 全路徑 CTA 均可點通，無斷鏈
- [ ] IntakeSubmitModal submit 後 step 才往下走（Modal 不閃退）
- [ ] 回頭：app.html 內無「回 landing」CTA（正常，登出才回）

### 3.2 Landing → Worker Apply 完整流程
```
landing.html
  ↓ 「申請 Tier B 認證」CTA
app.html?role=worker&onboarding=1
  ↓ Step 0 get brief → Claude/ChatGPT/Gemini（新分頁）
  ↓ 回來 → Step 1 paste JSON → Step 2 preview + email
  ↓ submit → Supabase worker_applications 寫入 → submitted 確認頁
  ↓ 確認頁 CTA 1：→ app.html?role=worker&view=worker-demo
  ↓ 確認頁 CTA 2：→ landing.html
```
- [ ] 每步 CTA 均可點通
- [ ] 外部 AI 按鈕在新分頁開啟（不覆蓋當前頁）
- [ ] 確認頁兩個 CTA 均正確跳轉
- [ ] `landing.html` 回到起點正確

### 3.3 Sign-in → Dashboard 流程
```
sign-in.html?role=client
  ↓ Continue with Google → OAuth redirect
app.html?role=client&signedin=1
  ↓ ClientIntakeApp（已登入狀態）
```
```
sign-in.html?role=worker
  ↓ Continue with Google → OAuth redirect
app.html?role=worker&signedin=1
  ↓ WorkerDashboard（已登入狀態）
```
- [ ] [manual] 兩條 OAuth 路徑均完成驗收
- [ ] [manual] `signedin=1` param 是否改變 UI 狀態（顯示真實帳號名稱等）
- [ ] [manual] 已登入用戶再次訪問 `sign-in.html` → auto redirect（不重複登入）
- [ ] [manual] 登出後 redirect 回 `landing.html`，localStorage role/onboarding 清除

### 3.4 Waitlist Email Fallback
```
waitlist.html
  ↓ 點 mailto CTA
信箱 app 開啟（預填 subject + body）
  ↓ 手動寄出
```
- [ ] [manual] `mailto:edwardt0303@gmail.com` 連結有效，subject/body 預填正確
- [ ] [auto] Copy email 按鈕在 HTTPS 下 clipboard API 可運作
- [ ] waitlist.html 本身無後端表單 → 設計上 intentional，無需修復

### 3.5 Disclaimer Banner → Waitlist 連結
- [ ] [auto] `app.html` top banner 的 `waitlist.html` 連結可點
- [ ] [auto] `landing.html` footer 的 `waitlist.html` 連結可點
- [ ] [auto] `mobile.html` top banner 的 `waitlist.html` 連結可點

### 3.6 Worker Demo 無登入強制
- [ ] [auto] `app.html?role=worker&view=worker-demo` 可在無登入狀態下訪問（設計為 open demo）
- [ ] [auto] 不強制跳 `sign-in.html`

### 3.7 Broken Link 掃描
以下鏈接已知可能有問題，上線前必確認：

| 鏈接 | 所在頁面 | 風險 |
|---|---|---|
| `beyondpath.tw/`（root）| 外部分享 | 無 redirect rule → 404 |
| `#problem` `#engines` `#trust` 等 anchor | landing.html nav | 確認 DOM id 存在 |
| `mailto:edwardt0303@gmail.com?subject=...` | landing FAQ、worker flow | 手機可能無法開啟信箱 |
| `https://claude.ai/new` 等外部 AI 連結 | worker apply step 0 | 外部 URL，定期確認有效 |
| `href="#"` + preventDefault | worker apply「Read terms & DPA」| 刻意 placeholder，上線前加 noindex / disclaimer 說明 |

---

## 4. Regression Suite

### 4.1 Critical Path 清單（10 條必跑）

| # | Test Case | 可自動 | 工具 |
|---|---|---|---|
| R-01 | `landing.html` 載入 + 主 CTA「我要發案」跳 `app.html?role=client&step=0` | [auto] | Chrome MCP |
| R-02 | `landing.html` worker CTA 跳 `app.html?role=worker&onboarding=1` | [auto] | Chrome MCP |
| R-03 | Client intake Step 0→3 完整走完不 crash | [partial] | Chrome MCP（截圖驗） |
| R-04 | IntakeSubmitModal 彈出、email 填入、submit → console 無 error | [manual] | 手動 |
| R-05 | Worker apply Step 0→2 + valid JSON paste → preview card render | [manual] | 手動 |
| R-06 | Worker apply submit → Supabase `worker_applications` 新 row | [manual] | 手動 + Supabase Dashboard |
| R-07 | Worker submitted 頁 CTA「→ Worker Demo」跳轉正確 | [auto] | Chrome MCP |
| R-08 | Sign-in Google OAuth 完整流程（trigger + redirect 回 app） | [manual] | 手動（需真實 Google 帳號）|
| R-09 | 登出 → localStorage 清除 → redirect `landing.html` | [manual] | 手動 |
| R-10 | `waitlist.html` mailto CTA 可觸發、email 正確 | [manual] | 手動 |

### 4.2 額外回歸項目（5 條）

| # | Test Case | 可自動 | 工具 |
|---|---|---|---|
| R-11 | mobile 375px 下 `landing.html` CTA 可見且可點 | [auto] | Chrome MCP mobile viewport |
| R-12 | `app.html?role=worker&view=worker-demo` 無 apply flow 擋住 | [auto] | Chrome MCP |
| R-13 | CDN 資源（React/Babel/Supabase）全數 200，無 4xx | [auto] | Chrome MCP 網路面板 |
| R-14 | `beyondpath.tw/` root → 確認 redirect 或 landing 頁顯示 | [manual] | 瀏覽器直連 |
| R-15 | `sign-in.html` 已登入用戶 auto redirect，不重複登入 | [manual] | 手動 |

### 4.3 Chrome MCP 可自動驗的部分
以下可用 Chrome MCP `screenshot` + `read_console_messages` 自動化：
- 所有 `[auto]` 標記項目（R-01、R-02、R-07、R-11、R-12、R-13）
- 每個 entry 的 HTTP 200 + 頁面截圖
- console error 掃描（0 error = PASS）
- mobile viewport render（設定 375x812）

### 4.4 必手動的部分
以下必手動（無法 bypass 真實外部依賴）：
- Google OAuth 完整流程（R-08）— 需真實 Google 帳號 + 真實 OAuth redirect
- Supabase 寫入驗證（R-04、R-06）— 需 Supabase Dashboard 確認 row
- 登出流程（R-09）— 需有登入 session
- mailto CTA 開信箱（R-10）— 需手動測試（手機行為不同於桌面）
- `beyondpath.tw/` root redirect（R-14）— 需確認 Vercel routing

---

## 5. Rollback 預備

### 5.1 Stable Commit 鎖定
```
Stable commit：3e5e789
Message：Wire client intake to Supabase with submit modal
Branch：main（預設）
Tag 建議：launch 前執行 → git tag v0.2.0-launch 3e5e789
```

**上線前動作：**
```bash
# 鎖 tag
git tag v0.2.0-launch 3e5e789
git push origin v0.2.0-launch

# 確認 Vercel 當前部署 commit
npx vercel@latest ls prototype-v0.2 --prod
```

### 5.2 Vercel Rollback Path
Vercel 支援即時 rollback（不需 git revert）：

```bash
# 列出所有 deployment
npx vercel@latest list --scope <team>

# 直接 promote 前一個 deployment 到 production
npx vercel@latest promote <deployment-url>
```

或 Vercel Dashboard → Project → Deployments → 選前一版本 → Promote to Production。

**Rollback 判準：**
- Supabase write 失敗率 > 10% → rollback
- landing/app.html 白屏 → rollback
- Google OAuth redirect 失敗 → 先確認 Supabase OAuth 設定，再考慮 rollback

### 5.3 DNS Rollback Path
- Domain `beyondpath.tw` 由 Vercel DNS 管理（假設 nameservers 指向 Vercel）
- Vercel project rollback = DNS 不需動，只需 Vercel promote 前版本
- 若 Vercel 完全失效：備援方案為將 DNS 指向前次備份 host（需手動，TTL 等候 15-60 分鐘）

**上線前確認 DNS：**
```
nslookup beyondpath.tw
→ 應解析到 Vercel anycast IP（76.76.21.x 或 76.223.x.x）
```

### 5.4 Supabase 資料備份
**重要：Supabase DELETE 不易 rollback（資料遺失即永久）**

```sql
-- 上線前手動備份（Supabase Dashboard → SQL Editor）
-- 或用 pg_dump 備份
SELECT * FROM worker_applications;
SELECT * FROM client_intakes;
SELECT * FROM profiles;
```

- RLS 目前 DISABLED（`worker_applications` + `client_intakes`）→ **正式上線前必須啟用 RLS policy**，否則任何人可讀全表
- Schema rollback：`supabase/migrations/001_initial_schema.sql` 保存在 repo，可 re-apply
- 資料 rollback：無自動備份 → 需 Supabase Pro plan 啟用 Point-in-Time Recovery，或手動 export

**RLS 啟用優先順序（上線前 Must-Do）：**
```sql
-- worker_applications：anon 只能 insert，不能 select/update/delete 他人資料
ALTER TABLE worker_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon insert only" ON worker_applications FOR INSERT TO anon WITH CHECK (true);

-- client_intakes：同上
ALTER TABLE client_intakes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon insert only" ON client_intakes FOR INSERT TO anon WITH CHECK (true);
```

### 5.5 Launch Rollback Runbook（緊急流程）

```
Issue detected
  ↓
1. 截圖 + console log 紀錄（30 秒）
  ↓
2. Vercel Dashboard → 前一 deployment → Promote（< 2 分鐘）
  ↓
3. 確認 beyondpath.tw 恢復正常（curl -I + 瀏覽器確認）
  ↓
4. 若 Supabase 問題：Supabase Dashboard → Logs 確認 error
  ↓
5. 通知 Edward + 寫 incident note
```

---

## 6. Go / No-Go Verdict

### 6.1 Must-Fix before Go（No-Go 條件）

| # | 問題 | 優先級 | 說明 |
|---|---|---|---|
| M-01 | `beyondpath.tw/` root 無 redirect → 裸網域 404 | **P0 · BLOCKER** | 外部分享裸網域會 404，須在 `vercel.json` 加 redirect 規則 |
| M-02 | Supabase RLS DISABLED | **P0 · BLOCKER** | `worker_applications` + `client_intakes` 任何人可讀全表，含個資（email）；上線前必啟用 INSERT-only policy |
| M-03 | Google OAuth redirect URI 確認 | **P1 · BLOCKER** | 確認 Supabase OAuth redirect URI 已包含 `https://beyondpath.tw/...`（目前只有 `iacwmkcloxjffghrweie.supabase.co`，需補 production domain） |

> M-01~M-03 任一未修 = **No-Go**

---

### 6.2 建議修（非 BLOCKER）

| # | 問題 | 優先級 | 說明 |
|---|---|---|---|
| S-01 | `index.html` 缺 `noindex` meta tag | P2 | 設計畫板不宜被 Google 索引 |
| S-02 | `sign-in.html?role=worker` 無 landing 入口 | P2 | Worker 若走 sign-in 路線（非 apply），需手動輸入 URL |
| S-03 | Worker apply「Read terms & DPA」是 `href="#"` placeholder | P3 | 上線前說明或移除，避免用戶期待看到條款 |
| S-04 | `beyondpath.tw` 加 DNS CAA record | P3 | SSL 安全加固（防 SSL 偽簽） |
| S-05 | Supabase anon key 在 client-side 裸露 | P3 | publishable key 設計上 ok，但確認 Supabase project 的 allowed domains 限縮在 `beyondpath.tw` |

---

### 6.3 已知 Known Issue（上線後接受 · 待 v0.3 修）

| # | 問題 | 說明 |
|---|---|---|
| K-01 | 無 form submission backend（waitlist 靠 mailto）| 設計上刻意，prototype 階段可接受 |
| K-02 | React/Babel 從 unpkg CDN 載入，需要網路 | Static prototype 設計限制，可接受 |
| K-03 | Worker apply JSON parse 無嚴格 schema 驗證 | 用戶貼入非標準 JSON 可能 silent fail |
| K-04 | `index.html` 設計畫板對外可見 | 無破壞性影響，但設計師看 raw artboard 不佳 |
| K-05 | 無 analytics / error tracking | Launch 後看不到 client-side crash rate，建議 v0.3 加 Sentry 或 PostHog |
| K-06 | `www.beyondpath.tw` redirect 需確認（project-status.md 未記錄）| 應確認 `www` subdomain 是否也 redirect 到 `beyondpath.tw/landing.html` |

---

### 6.4 本次 Verdict

**目前狀態：NO-GO（2026-05-14 · Markl 馬魯克）**

原因：M-01（root 404）、M-02（RLS off）、M-03（OAuth redirect URI 未含 production domain）三條 P0 Blocker 尚未確認修復。

**當 M-01~M-03 全部修復並驗收 PASS 後：GO。**

估計修復工時（移動城堡）：
- M-01：`vercel.json` 加 1 條 redirect → 5 分鐘
- M-02：Supabase SQL Editor 執行 2 條 ALTER + CREATE POLICY → 10 分鐘
- M-03：Supabase Dashboard → Auth → URL Configuration → 加 production domain → 5 分鐘

總預計：20 分鐘修復 + 30 分鐘驗收 = 50 分鐘 → **今日可 Go**。

---

*馬魯克 Gate 4 版控確認完畢 · 2026-05-14*
*Stable commit locked：`3e5e789` (Wire client intake to Supabase with submit modal)*
*下一步：M-01~M-03 交卡西法修復 + 驗收後，馬魯克重跑 Section 2+3 各 [auto] 項目，全綠後 tag `v0.2.0-launch` push。*
