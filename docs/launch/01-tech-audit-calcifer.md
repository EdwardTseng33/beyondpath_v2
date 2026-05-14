# BeyondPath · Launch Tech Audit · Calcifer

- 撰寫人: Calcifer (CTO subagent)
- 日期: 2026-05-14
- 對象 domain: beyondpath.tw (Vercel 已加 custom domain · DNS + SSL 通)
- 基線狀態: prototype-v0.2 · Supabase wired · RLS partial · 三表已上

---

## 1. 當前系統架構

BeyondPath 是「React UMD + Babel CDN 純靜態前端 + Supabase 託管後端」的最小架構。沒 build pipeline、沒自家 server、沒 backend 程式碼。所有商業邏輯（auth / write / read）都靠瀏覽器直連 Supabase。Vercel 只做 static file CDN + custom domain + security header。

```
+-- 使用者瀏覽器 --------------------------------------+
| beyondpath.tw/{landing|sign-in|app|mobile|index}.html |
|  +- React 18.3.1 (unpkg dev build · 注意 1)            |
|  +- Babel standalone 7.29.0 (unpkg · 帶 SRI)           |
|  +- supabase-js@2 (cdn.jsdelivr · 未 pin minor)         |
|  +- components/{supabase,app2,worker,journey,...}.jsx  |
|       +- window.bpSupabase / bpAuth / bpWorkerApply    |
|             / bpClientIntake (附 cache-bust ?v=x.y.z)   |
+--+--------------------------------------------------+
   | 1. Static HTML/JS              | 2. HTTPS · supabase-js
   v                                 v
+--------------------+    +--------------------------------+
| Vercel Edge CDN     |    | Supabase (beyondpath-poc)      |
|  prototype-v0.2     |    |  iacwmkcloxjffghrweie.supabase.co
|  vercel.json:       |    |  +- GoTrue Auth (OAuth+JWT)    |
|   X-Frame DENY      |    |  |   +- Google Provider         |
|   nosniff           |    |  +- PostgREST                  |
|   Referrer policy   |    |  +- Postgres 15                |
|   Permissions       |    |  |  · public.profiles          |
|   policy            |    |  |  · public.worker_applications
+--------------------+    |  |  · public.client_intakes    |
       ^                   |  +- triggers: handle_new_user,  |
       |                   |              set_updated_at      |
   GoDaddy DNS             +-----+--------------------------+
   beyondpath.tw                 | 3. OAuth callback redirect
   ANAME/CNAME -> Vercel         v
                          +----------------------------+
                          | Google Cloud OAuth          |
                          |  Project: moving-castle     |
                          |  Client: BeyondPath Web     |
                          |  Redirect URI:               |
                          |  iacwmkcloxjffghrweie...     |
                          |  /auth/v1/callback           |
                          +----------------------------+
```

### 元件版本盤點

| 元件 | 版本 | 載入方式 | 風險 |
|---|---|---|---|
| React | 18.3.1 | unpkg/react@18.3.1/.../react.development.js | 警 · dev build · prod 嚴格禁用 (未壓縮 + 多 warn + 慢 30~50%) |
| ReactDOM | 18.3.1 | unpkg · development.js | 警 · 同上 |
| Babel standalone | 7.29.0 | unpkg · 帶 SRI hash | 通 · 但 prod 跑 babel = 慢 |
| supabase-js | @2 (不 pin minor) | cdn.jsdelivr | 警 · 半年內 minor bump 可能無預警跑進 prod |
| sign-in.html React | 18.x | unpkg · production.min.js | 通 · 唯一一支正確 |
| Vercel | Free tier · static | prototype-v02 專案 | 通 |
| DNS | GoDaddy | ANAME/CNAME -> Vercel | 假設已 working |
| SSL | Vercel auto Let's Encrypt | — | 通 · auto-renew |

### Single source of truth · 不變化
- 對外 entry: landing.html / sign-in.html / app.html / mobile.html
- 同源限制: 一切寫入都在前端 supabase-js 跟 Supabase 之間 · 沒第三方 API
- 環境變數: 目前沒用 Vercel env vars — SUPABASE_URL + SUPABASE_PUBLISHABLE_KEY 寫死在 components/supabase.js

---

## 2. AI / API 串接 health（含 Supabase OAuth + 兩條 submit）

### A. Google OAuth 登入完整 trace

```
[1] user 開 https://beyondpath.tw/sign-in.html?role=worker
[2] sign-in.html App() useEffect 跑 bpAuth.getSession()
    +- 沒 session -> 渲染 Google 按鈕
    +- 有 session -> 跳轉 app.html?role=worker&signedin=1
[3] user 點 Continue with Google
[4] persistRole(role) -> localStorage[bp-active-role] = role
[5] redirectTo 計算:
      window.location.origin + pathname.replace(/sign-in.html$/, app.html)
      + ?role=worker&signedin=1
      -> https://beyondpath.tw/app.html?role=worker&signedin=1
[6] bpAuth.signInWithGoogle(redirectTo)
    +- supabase-js: signInWithOAuth({ provider: google, options: { redirectTo } })
[7] 瀏覽器跳轉到 https://iacwmkcloxjffghrweie.supabase.co/auth/v1/authorize
       ?...redirect_to=https%3A%2F%2Fbeyondpath.tw%2Fapp.html...
[8] Supabase 轉導 Google OAuth consent
[9] user 同意 -> Google -> POST iacwmkcloxjffghrweie.supabase.co/auth/v1/callback
[10] Supabase 換 token -> 重導 https://beyondpath.tw/app.html?role=worker&signedin=1
       #access_token=...&refresh_token=...
[11] app.html bootstrap script 跑 localStorage[bp-active-role]
     supabase-js detectSessionInUrl: true -> 自動解析 hash -> 寫 localStorage
[12] handle_new_user trigger -> public.profiles 新增一筆
```

**可能 break 的點:**

| # | Break point | 觸發條件 | 修法 |
|---|---|---|---|
| B1 | Supabase Site URL 沒含 https://beyondpath.tw | 第 10 步 callback 後拒絕重導 · 顯示 redirect_to is not allowed | Supabase Dashboard → Authentication → URL Configuration 同步補 |
| B2 | Google Cloud OAuth Authorized origins 沒含 https://beyondpath.tw | 第 8 步 Google 拒絕 client | GCP → APIs & Services → Credentials → BeyondPath Web → Authorized JavaScript origins 補 |
| B3 | Google OAuth Authorized redirect URIs 改成 beyondpath.tw 路徑 | 不必補 — OAuth callback 永遠在 Supabase domain · 不在 beyondpath.tw | 維持現狀 iacwmkcloxjffghrweie.supabase.co/auth/v1/callback |
| B4 | 從 prototype-v02.vercel.app 跟 beyondpath.tw 並存 · cookie/session 不共享 | session 在兩 domain 看不到對方 | 上線後 README + project-status 全面改 beyondpath.tw · Vercel 設 redirect prototype-v02 → beyondpath.tw |
| B5 | localStorage SameSite / 第三方 cookie 限制 | Safari ITP 機制可能拒 third-party cookie | supabase-js 用 localStorage 非 cookie · 但 OAuth flow 中段 Supabase 會種 cookie · Safari 嚴格隱私模式可能失敗 → 提示用 Chrome |

### B. Worker apply Submit -> worker_applications trace

```
worker.jsx Step 3 Preview -> SubmitToSupabaseBtn.doSubmit()
[1] regex 驗 email
[2] 檢查 window.bpWorkerApply 已 load
[3] bpWorkerApply.submit({ email, displayName, aiProof })
[4] components/supabase.js · bpWorkerApply:
    a. bpAuth.getUser() · 取登入用戶 (or null)
    b. 組 payload: { user_id, email, display_name, ai_proof, l_score,
                     verticals, case_count, tier_suggestion, status: pending }
    c. client.from(worker_applications).insert(payload).select().single()
[5] PostgREST POST /rest/v1/worker_applications
    +- RLS policy anyone can insert (with auth or anon) 放行
[6] 回傳 row · status=success -> setTimeout 600ms -> onDone()
```

**可能 break 的點:**

| # | Break point | 觸發條件 | 修法 |
|---|---|---|---|
| W1 | RLS 目前 disabled 在 worker_applications · prototype OK 但 prod 必修 | spam bot 灌 row、惡意 user 改別人 row | 上線前重啟 RLS（見 §5 SQL）|
| W2 | l_score check (0-10) · 若 AI 回傳 11 整筆 insert fail | aiProof 沒驗證 | bpWorkerApply 加 clamp Math.max(0, Math.min(10, lScore)) |
| W3 | case_count 是 text · AI 回 number 直接寫入 | type mismatch -> fail | bpWorkerApply 加 String(caseCount) |
| W4 | tier_suggestion 是自由 text · 未來想做 check constraint 沒檢查 | 髒資料 | v2 再補 |
| W5 | 大檔 ai_proof JSON · Postgres jsonb 1GB 上限沒問題 · 但 PostgREST timeout | 一般 < 10kb · 不會碰到 | 無 |
| W6 | 重複 submit 沒 dedupe · 同 email 多筆 | 用戶連點 | 加 unique partial index (email) where status=pending |

### C. Client intake Submit -> client_intakes trace

```
app2.jsx Step04 Match -> IntakeSubmitModal.doSubmit()
[1] regex 驗 email
[2] window.bpClientIntake 存在 -> submit
[3] payload: { user_id, email, company_name, intake_data,
               vertical, budget_range, timeline, status: new }
[4] PostgREST POST /rest/v1/client_intakes
```

**可能 break 的點:**

| # | Break point | 觸發條件 | 修法 |
|---|---|---|---|
| C1 | RLS 目前 disabled · 同 W1 | spam · 偷看別人需求 | 重啟 RLS |
| C2 | intake_data JSON 可能含 PII（公司名 / brief 自由 text）· 沒法律聲明 | GDPR / TW PDPA 風險 | landing.html + IntakeSubmitModal 加「資料用途 + 24h 內回覆」聲明 |
| C3 | selected_worker_id FK 沒先 populate · null OK | 無 | OK |
| C4 | 無 retry / 失敗只 alert · 用戶失去 brief 重打 | 網路抖 / Supabase down | doSubmit 失敗時 localStorage 暫存 intakeData |
| C5 | budget_range / timeline 自由 text · 沒 enum | 資料髒、難 query | 後續 v2 補 enum 或 lookup 表 |

### 共通風險

- SUPABASE_PUBLISHABLE_KEY (anon key) 寫死在 components/supabase.js — 這是正確做法（anon key 設計就是要曝光）、但前提是 RLS 必須正確否則等於把資料庫公開
- 沒 service_role key 暴露（已掃過、確認）
- 沒監控、沒 Sentry、Supabase 跑爆 / 額度滿沒人知

---

## 3. DB schema 上線審

### 三表通盤評估

#### profiles · 合格
- PK 對 auth.users(id) · cascade · 對
- RLS 啟用 · own row select/update + admin sees all · 對
- trigger handle_new_user 自動建 profile · security definer · 對
- 警 · role column 預設 null · 用戶第一次登入沒設 role · admin 介面要會處理 null
- 建議: updated_at trigger 已有、OK

#### worker_applications 大致合格 · 5 條補
- 通 · PK uuid · user_id FK on delete set null · 對
- 通 · index 三條 (user_id / status / l_score) · 對
- 通 · check constraint 在 l_score + status · 對
- 警 · RLS 目前 disabled（題目宣告）· 但 SQL 檔本身有 enable 跟 policy · 代表生產環境曾被手動 disable · 需查 Supabase Dashboard 確認當前狀態
- 警 · case_count 是 text · 應該改 int4 或保持 text 加 check constraint
- 警 · 缺 ip_address / user_agent · 沒法 audit 誰送的
- 警 · 缺 submission_source (web/mobile/api) · 未來分流會缺資料
- 警 · insert policy with check (true) 等於開放任何人灌 row · spam 風險

#### client_intakes 大致合格 · 4 條補
- 通 · FK selected_worker_id -> worker_applications · on delete set null · 對
- 警 · 同 RLS 問題（題目宣告 disabled）
- 警 · 缺 consent_at / consent_version · 沒紀錄用戶同意了哪版隱私政策（PDPA 要求）
- 警 · intake_data 可能含敏感商業 brief · 沒 column-level encryption · Supabase 預設 at-rest encryption 夠用但 admin 看得到
- 警 · 缺 priority / assigned_to · Edward 量大時看板會缺欄

### 建議補的新表（按優先序）

| 表 | 必要性 | 何時補 |
|---|---|---|
| audit_log (event/entity/who/when/before/after JSONB) | 中 · admin 操作審計 | 第二輪迭代 · 上線後 1 週內 |
| notifications (user_id/type/payload/read_at) | 低 · prototype 階段用 email 就夠 | v2 · 有 web push 再開 |
| pilot_cases (intake_id/worker_id/state/milestones/...) | 高 · 首案交付是 BP 商業核心、必須結構化追蹤 | 上線後 first pilot 之前必開 · 但不阻 launch |
| consents (user_id/policy_version/granted_at/scope) | 中高 · PDPA 合規 | 上線前 v1.1 · launch+7 天 |

### Foreign key / cascade 安全
- profiles.id -> auth.users on delete cascade · 對（刪 user 同步刪 profile）
- worker_applications.user_id -> auth.users on delete set null · 對（保留申請紀錄）
- client_intakes.user_id -> auth.users on delete set null · 對
- client_intakes.selected_worker_id -> worker_applications on delete set null · 對

通 · cascade 邏輯沒陷阱。

### Performance
- 流量預估：上線首月 < 1000 row · index 都不必想太多
- jsonb 欄位 (ai_proof / intake_data) Postgres 預設 GIN 沒建 · 沒事 · 量小不需要
- 沒 N+1 風險（前端 single insert / single select）

---

## 4. Auth 流程上線審

### 必設項目 · launch 前 critical

#### Supabase Dashboard -> Authentication -> URL Configuration

| Field | 目前 | 必須補成 |
|---|---|---|
| Site URL | (推測) https://prototype-v02.vercel.app | https://beyondpath.tw |
| Additional Redirect URLs | (可能空) | 全加: https://beyondpath.tw/** · https://beyondpath.tw/app.html · https://beyondpath.tw/sign-in.html · https://prototype-v02.vercel.app/** (過渡保留) · http://localhost:5858/** (開發) |

#### Google Cloud -> APIs & Services -> Credentials -> BeyondPath Web

| Field | 必須補成 |
|---|---|
| Authorized JavaScript origins | https://beyondpath.tw · https://prototype-v02.vercel.app (保留) · http://localhost:5858 |
| Authorized redirect URIs | 維持 https://iacwmkcloxjffghrweie.supabase.co/auth/v1/callback · 不必動 |

#### Supabase Auth -> Email Templates
- 上線後若開 magic link / email 確認 · template 用 BeyondPath 品牌 · 目前未開、跳過

### Session / refresh / 登出

components/supabase.js createClient 設定:
```
persistSession: true        通 · token 存 localStorage
autoRefreshToken: true      通 · 自動 refresh
detectSessionInUrl: true    通 · OAuth callback 自動解析 hash
```

-> 全對、沒破口。

**登出邏輯檢查:**
- app.html shell 登出時 bpAuth.signOut() + 清 localStorage bp-active-role / bp-worker-onboarding
- 但 supabase-js 自家 token 存在 sb-iacwmkcloxjffghrweie-auth-token localStorage key · signOut() 會清
- 通 · 登出後返回 landing.html · 重新登入流程 OK

**潛在破口:**
- 同瀏覽器多 tab：tab A 登出時 tab B 仍持有 session in memory 直到 reload · supabase-js 自帶 BroadcastChannel 同步、但若用戶用 incognito + 普通視窗交互、可能短暫狀態不一致 · acceptable for launch
- refresh_token 一年期 · 半年後可能要重新登入 · acceptable

---

## 5. Production hardening checklist

### 紅 Critical · launch 前必修

#### C-1 RLS 重啟 + production-grade policy

當前狀態：worker_applications + client_intakes 的 RLS 在 Supabase Dashboard 被手動 disabled。重啟 + 重定義 policy 由 supabase/migrations/002_production_rls.sql 提供（完整 SQL 一併產出在同次 commit · 見 02-rls-hardening.sql）。

policy 設計重點：
- SELECT: 用戶看自己 + admin 看全部
- INSERT: anon + auth 都可送 · 但限制 status 必為初始值 (pending / new) · email 必填
- UPDATE: 用戶改自己未審 row + admin 改全部
- DELETE: 只 admin

#### C-2 React 改 production build

app.html 第 313-314 行用 react.development.js + react-dom.development.js · prod 必改:
- 換 unpkg/react@18.3.1/.../react.production.min.js + react-dom.production.min.js
- 重算 SRI hash（用 openssl dgst -sha384 -binary | openssl base64 -A）

index.html 同樣處理。
landing.html / mobile.html 若也有 React 引用同步檢查。
sign-in.html 已用 production.min.js · 不必動。

#### C-3 環境變數策略（acceptable for launch · 但 nice-to-have）

當前 SUPABASE_URL + SUPABASE_PUBLISHABLE_KEY 寫死。
- Acceptable：anon key 本來就 public-facing · publish 在前端 = 設計如此
- Risk：未來換 Supabase project 要改 code · 不能換環境
- Optional fix (不阻 launch)：寫 components/config.js 從 meta tag 讀、HTML 端方便切換

#### C-4 Supabase Auth URL Configuration

見 §4。不修 = OAuth 直接壞。

### 黃 High · launch 後 7 天內

#### H-1 Vercel redirect: prototype-v02 -> beyondpath.tw

Vercel project settings -> Domains -> 為 prototype-v02.vercel.app 加 redirect 到 https://beyondpath.tw、防舊 link 散落網路造成 session split-brain。

#### H-2 Sentry / error tracking

加 Sentry browser SDK（CDN load · 不必 build system）· free tier 5k events/month · 個人 launch 期夠。塞在 React load 之前。

#### H-3 Uptime monitor

UptimeRobot free · 5 min interval · 監 https://beyondpath.tw/landing.html HTTP 200 + 含字串 BeyondPath。Webhook 接 Slack 移動城堡 channel ping 蘇菲。

#### H-4 cache-bust 一致性 fix

app.html 跟 index.html 用一致 ?v= 已對 · 但首次上 prod 前全部 bump 一輪（建議 ?v=0.8.0-launch）強制清 Vercel edge + 用戶瀏覽器。

#### H-5 Rate limiting

Supabase free tier 內建：
- Auth: 30 sign-in/hour/IP（夠）
- PostgREST: 沒明確 hard limit · 但每秒幾百 req 會觸發 Supabase abuse detection

加碼防爆量（acceptable for launch、不阻）:
- Cloudflare 套上去（前面包一層 free CDN）· launch+14 天內補

### 綠 Medium · launch 後 30 天內

- M-1: Supabase backups 確認（free tier 7 天 PITR · 夠 prototype）
- M-2: 加 audit_log + consents 表
- M-3: 把 supabase-js pin minor version (e.g. @2.45) 防無預警 bump
- M-4: 對外法律頁 privacy.html / tos.html（蘇菲 / sulima 主責、不在我 audit scope）

---

## 6. Go / No-Go verdict

### Verdict: 黃 Conditional Go

技術架構穩、流程通、無深層 bug · 但 5 條 critical 不修等於把資料庫公開 · 修完 = 直接 Go。

預估完整時間（含愛德華 manual 操作 Supabase Dashboard + GCP）：

| # | Must-fix | 預估工時 | 移動城堡時 | 誰做 |
|---|---|---|---|---|
| MF1 | 跑 002_production_rls.sql · RLS 重啟 | 0.5h | 1h | calcifer 寫 SQL · Edward 在 Supabase SQL editor 跑 |
| MF2 | Supabase Site URL + Redirect URLs 加 beyondpath.tw | 0.25h | 0.5h | Edward 手動 · calcifer 寫 step-by-step |
| MF3 | GCP OAuth Authorized JavaScript origins 加 beyondpath.tw | 0.25h | 0.5h | Edward 手動 · calcifer 寫 step-by-step |
| MF4 | app.html + index.html React 改 production.min.js + SRI 重算 | 0.5h | 1h | calcifer 改 + Edward 部署 |
| MF5 | 全 entry HTML cache-bust bump 到 ?v=0.8.0-launch + Vercel redeploy + Chrome MCP smoke 4 entry pages 0 error | 1h | 2h | calcifer 改 + Edward push · 馬魯克 Gate 1 smoke |

Critical 總計：預估 2.5h · 移動城堡 5h（含愛德華手動 + 我 audit + 卡西法寫 + 部署 + 驗證 + Slack 紀錄）

### 上線剩餘 polish（5 條修完後）
- supabase-js 從 @2 改 @2.45 防無預警 bump（10 min）
- Sentry CDN bundle 加入 4 entry pages（30 min）
- UptimeRobot 設好（10 min）
- README + project-status 全文 prototype-v02 -> beyondpath.tw（15 min）
- waitlist.html / landing.html 對外信箱統一（蘇菲決定，不在 audit scope）

### 上線後 14 天內補
- Cloudflare proxy 前置（防爆量）
- 002 RLS policy 在 staging 環境 dogfood 過再覆蓋 prod（這輪沒 staging · 走 prod 直接審 · 接受風險）

### 一句話
> 技術上可以、但 RLS + OAuth URL + React prod build 三件不修就上線 = 直接破窗。5 條 must-fix 寫死了路徑、Edward 在 Supabase + GCP Dashboard 手動 30 分鐘 + 我這邊 React build 改 + cache-bust + Chrome MCP smoke 2 小時 = 可放心。
