# 28 · PMF 帳號 + 安全 完整需求單

> **作者**：🧙‍♀️ 沙利曼 · Head of Trust & Infrastructure
> **日期**：2026-05-29
> **背景**：Edward 5/29 13:09 拍板「城堡完善 PMF 基礎、能真的跑業務」。本檔把「身分認證研究（doc 26）」+「既有 auth 缺口（doc 14）」整合成**一張給卡西法的實作需求單**。
> **接力對象**：🔥 卡西法（實作）→ 走 Gate 1（卡西法技術）+ Gate 5（沙利曼資安）。
> **上游**：doc 26（身分認證研究）、doc 14（auth-hardening-spec P0-1/P0-2/P0-3）、001_initial_schema.sql、components/supabase.js、sign-in.html。
> **狀態**：📋 需求單 ready、待卡西法接、待 Edward 動手點。
> **重要**：底線建議、非正式法律意見。

---

## 0 · 給 Edward / 蘇菲先讀（一頁懂）

三塊其實是**同一套登入架構**、一次設計不重工：

| 塊 | 白話 | 為什麼現在做 |
|---|---|---|
| **A · 帳號系統（email-first）** | 用戶用 email 註冊登入、填完整資料（含電話必填）才能發案/接案 | 拿到可靠聯絡資料 + 擋掉明顯 fake（doc 26 的 Tier 0）|
| **B · Admin 後台守門** | 後台 `admin.html` 現在**任何人開 URL 都能操作**——上線前必擋 | 後台能看到全部客戶/接案者資料、裸奔 = 個資外洩風險 |
| **C · 雲端函式防洗** | 對外的雲端函式現在沒限流、有人狂打就燒我們的 AI 鑰匙（要花錢）| 一支腳本連打 = Anthropic 帳單失血 |

**蘇菲已定的方向（寫死進這份 spec）：**
1. 第一版帳號用 **email 註冊**（Supabase Auth magic link）——**免費、不用 Edward 去開簡訊商**
2. **電話必填**（先收下來、Edward 覆核時人工確認；第一版不自動驗手機）
3. **手機驗證碼（OTP）排下一階**（有規模再接簡訊商、本 spec 標 Tier 0.5）
4. **不碰身分證 / 人臉**（doc 26 研究結論）

**保守紀律（紅字）：不准動既有 wizard（app2.jsx 的 12 步發案流程）的設計、用既有元件。** Edward 已對「亂改設計」不耐 2 次（v1.0.8 退版教訓）。這份 spec 的 UI 動作只「**加一道登入閘 + 把電話設成必填**」、不重畫流程。

**一句話**：A 是「跑業務的地基」、B+C 是「上線前不能裸奔的兩道門」。三塊用同一套 Supabase Auth、卡西法一輪做完最省事。

---

## 1 · 三塊的依賴關係 + 分批建議

```
A 帳號系統（email magic link + 完整資料 gate）   ← 業務地基、Edward 5/29 最想要
        │
        ├── 共用同一套 Supabase Auth + profiles 表
        │
B Admin 守門（admin.html 登入閘 + email 白名單）   ← 上線阻擋、必先做（風險最高）
        │
C 雲端函式防洗（原 7 函式 caller check + IP 限流）  ← 燒錢防線、可跟 A/B 並行
```

### 分批建議（沙利曼排序：先擋裸奔、再蓋地基）

| 批次 | 內容 | 為什麼這順序 | 能否並行 |
|---|---|---|---|
| **Batch 1（先做·半天）** | **B · Admin 守門** | 後台裸奔是「上線阻擋級」風險——任何人現在開 `admin.html` 就能看全部客戶資料 + 按按鈕。這是**最低成本、最高風險**的洞、先補 | 獨立、可單獨 ship |
| **Batch 2（再做·1-2 天）** | **A · 帳號系統** | 業務地基。email magic link + 完整資料 gate + profiles 擴充。Edward 5/29 最想要的「能真的跑業務」 | 跟 C 可並行（不同檔）|
| **Batch 3（可並行·半天-1天）** | **C · 雲端函式防洗** | 燒錢防線。原 7 函式加 caller check + IP 限流。**可跟 Batch 2 同時做**（C 改 Edge Function、A 改前端+DB、不衝突）| 跟 A 並行 |

> **建議**：Batch 1 當天 ship（B 風險最高、改動最小）。Batch 2 + Batch 3 並行排同一個 sprint。

---

## A · PMF 帳號系統（email-first · doc 26 Tier 0）

### A.0 現況盤點（卡西法 cold start 必讀）

我已掃過 code，現況：
- ✅ `components/supabase.js` 已有 `bpAuth`：`signInWithGoogle` / `signOut` / `getUser` / `getSession` / `onAuthStateChange`
- ✅ `sign-in.html` 已有 Google OAuth 登入頁（含 client/worker 角色選擇）
- ✅ `profiles` 表已存在（001_initial_schema.sql）：`id / email / full_name / avatar_url / role / created_at / updated_at` + `handle_new_user` trigger 自動建檔
- ✅ `client_intakes` 表**已有 `phone` 和 `job_title` 欄位**（20260528_client_intakes_required_fields.sql）——但目前是**選填、沒 gate**
- ❌ `bpAuth` **沒有 email magic link / OTP 方法**（要新增）
- ❌ `profiles` **沒有 `phone` / `identity_type` / `profile_complete` 欄位**（要加）
- ❌ 發案/接案流程**沒有「登入後才能送」的 gate**（`sign-in.html` 甚至有條 `app.html?role=client&step=0` 的「不需註冊試一次」連結直接繞過）

### A.1 要改什麼檔

**File 1 · `components/supabase.js`（加 email 登入方法 · 不動既有）**

`bpAuth` 加 2 個方法（既有 `signInWithGoogle` 等全保留、Google 路徑不拔）：

```js
// Supabase Auth 原生：signInWithOtp({ email }) = email magic link
// 用戶填 email → 收信點連結 → 自動登入回站
async signInWithEmail(email, redirectTo) {
  const { data, error } = await client.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo || (window.location.origin + '/app.html') },
  });
  return { data, error };
},
```

> **設計選擇（沙利曼註）**：用 **magic link（passwordless）** 不用 email+密碼。理由：(1) 不存密碼 = 不揹密碼外洩責任 + 不用做忘記密碼流程；(2) Supabase 原生、零後端；(3) 點信即驗證 email、一步到位。若 Edward 偏好 email+密碼、再加一個 `signInWithPassword`——但 magic link 是 PMF 階段 CP 值之王。

**File 2 · `profiles` 完整資料 helper（`components/supabase.js` 新增 `bpProfile`）**

```js
window.bpProfile = {
  async get() {
    const { user } = await window.bpAuth.getUser();
    if (!user) return { data: null, error: { message: 'not-signed-in' } };
    const { data, error } = await client.from('profiles')
      .select('id, email, full_name, phone, identity_type, role, profile_complete')
      .eq('id', user.id).single();
    return { data, error };
  },
  async updateRequiredFields({ fullName, phone, identityType }) {
    const { user } = await window.bpAuth.getUser();
    if (!user) return { data: null, error: { message: 'not-signed-in' } };
    // profile_complete = 三項齊備才 true（DB 端也有 generated column 兜底、見 A.2）
    const patch = {
      full_name: fullName || null,
      phone: phone || null,
      identity_type: identityType || null,
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await client.from('profiles')
      .update(patch).eq('id', user.id).select().single();
    return { data, error };
  },
};
```

**File 3 · `sign-in.html`（加 email 登入區塊 · 用既有樣式）**

- `sign-in.html` 已有完整 `.si-email-form` / `.si-input` / `.si-cta-primary` CSS（見檔案 82-89 行）——**樣式已備好、現在沒接 handler**。直接接上即可、不必新增 CSS。
- 在既有「Continue with Google」按鈕下方、用既有 `.si-divider`（已有 "OR" 樣式）+ `.si-email-form` 加：email input + 「寄登入連結給我」按鈕 → 呼叫 `bpAuth.signInWithEmail(email, redirectTo)`
- 送出後顯示「我們寄了登入連結到 {email}、去收信點一下」確認態（用既有 `.si-loading` 區塊改文案、不新增元件）
- **保留** Google OAuth 按鈕（雙路徑、用戶自選）
- **底部那條「用發案表單試一次（不需註冊）」連結**：見 A.3 gate 設計——保留入口、但送出前攔截要登入

**File 4 · 完整資料表單（登入後、發案/接案前）**

- **不新建大頁面**。在 `app.html`（發案）/ worker onboarding 流程**進入前**插一個輕量「補完整資料」步驟：
  - 若 `bpProfile.get()` 回 `profile_complete = false` → 顯示一個小表單：姓名 + 電話（必填）+ 身分類型（個人/公司 radio）
  - 三項齊 → `bpProfile.updateRequiredFields()` → 解鎖繼續
  - 三項缺 → 「繼續」按鈕 disabled + helper 文案「電話是配對成功後我們聯絡你的方式」
- **沙利曼保守註**：這一步是「閘」、不是「重畫流程」。用既有 `.si-input` / 既有 form 元件、視覺對齊現有 wizard、**不要設計新風格**。

### A.2 資料表變動

**新 migration · `20260529_profiles_required_fields.sql`：**

```sql
-- profiles 完整資料欄位擴充 (PMF 帳號系統 · doc 28 · 沙利曼 spec)
-- 全部 nullable + 向後相容、既有 row 自動 NULL、不破壞

alter table public.profiles
  add column if not exists phone text;

alter table public.profiles
  add column if not exists identity_type text
    check (identity_type in ('individual', 'company'));

-- Tier 0.5 預留欄位（手機 OTP 排下一階、先建欄位、暫不啟用）
alter table public.profiles
  add column if not exists phone_verified_at timestamptz;

-- profile_complete: generated column · 姓名 + 電話 + 身分類型 三項齊才 true
-- 前端 gate 讀這欄、DB 端也擋（雙保險）
alter table public.profiles
  add column if not exists profile_complete boolean
    generated always as (
      full_name is not null and full_name <> ''
      and phone is not null and phone <> ''
      and identity_type is not null
    ) stored;

comment on column public.profiles.phone is
  'PMF 必填 · Edward 覆核時人工確認 · 第一版不自動驗 · Tier 0.5 接 OTP';
comment on column public.profiles.identity_type is
  'individual / company · 發案/接案前必填';
comment on column public.profiles.phone_verified_at is
  'Tier 0.5 預留 · 手機 OTP 通過時間 · 第一版恆 NULL';
```

> **RLS 不用改**：既有 `profiles: own row select/update` + `admin sees all` policy（001_initial_schema.sql）已涵蓋。新欄位繼承同 policy。

> **client_intakes.phone 已存在**——A 階段把它從「選填」變「發案前必填」是**前端 gate 的事**（A.3）、不必改 schema。

### A.3 「直接填表送出」→「登入後才能送」（保守做法）

**Edward 原話**：現有「直接填表送出」改成「登入後才能送」、**但保守、別大改既有 wizard**。

沙利曼的最小侵入做法（不動 12 步流程設計）：

| 做法 | 動作 | 侵入度 |
|---|---|---|
| ✅ **採用** | 用戶可以**照舊走完整個 wizard 填資料**（體驗不變）、但**按「送出」那一刻**檢查 `bpAuth.getUser()`：未登入 → 彈「登入後送出」→ 導去 `sign-in.html?role=client&return=...`、登入回來自動帶回填好的資料續送 | 低（只攔送出那一步）|
| ❌ 不採用 | 一進 wizard 就強制登入（會擋掉「先試試看」的早期用戶、轉換率掉）| 高 |

- **資料暫存**：wizard 已有的 state（app2.jsx 內部 state / 若有 localStorage 草稿）→ 登入跳轉前存 `localStorage`（key 如 `bp-intake-draft`）、回來 rehydrate。**若既有流程已有草稿機制就沿用、沒有就加最小一個**（卡西法判斷、不大改）。
- **完整資料 gate**：送出前除了「要登入」、還要 `profile_complete = true`（缺電話/姓名/身分類型 → 先補 A.1 File 4 的小表單）。
- **保留「不需註冊試一次」的探索體驗**：用戶可看、可填、可走流程——只在**真正送出（寫進 DB / 觸發配對）**那關要登入 + 完整資料。這正是 doc 26 §3「輕量註冊、要動作才升級」的哲學。

### A.4 工時（雙軌）

| 項目 | 內容 |
|---|---|
| 任務 | email magic link 登入 + profiles 完整資料 gate（電話必填）+ 發案前登入閘 |
| 預估工時（AI 輔助工程師）| **1.5-2.5 天** |
| 移動城堡估 | **4-7 小時**（卡西法實作 + 沙利曼 Gate 5 + 馬魯克 QA + Edward 審核）|
| bottleneck | Supabase Auth email provider 設定（Edward 動手、~5 分鐘、見 §Edward 動手點）+ 發案前登入閘的草稿 rehydrate（要測「跳轉登入回來資料還在」）|

> 比 doc 26 估的 3-5 天短——因為 email magic link 不用接 SMS provider（省掉外部開戶等待）、`bpAuth` 已有骨架、`client_intakes.phone` 已存在。

---

## B · Admin 後台登入守門（doc 14 P0-1）

### B.0 現況問題（風險最高、先做）

- `admin.html` + `components/admin.jsx` 開頭註解白紙黑字寫「**無 auth gate · 不對外公開**」（admin.jsx 第 2 行）——但「不對外公開」只靠 noindex、**URL 知道的人直接開就能操作**
- 後台能：看全部 `client_intakes`（客戶 email/電話/brief）、`worker_applications`（接案者全資料）、approve/reject、發信、建合約、改里程碑、仲裁判決……**裸奔 = 全平台資料 + 操作權外洩**
- **這是上線阻擋級（NO-GO）洞**——B 必須先補

### B.1 要改什麼檔

**File 1 · `admin.html`（mount 前加登入閘）**

React mount 前包一層 auth gate（pseudo）：

```jsx
// 1. 未登入 → 顯示登入頁（沿用 sign-in 的 Google + email 兩條路徑）
if (!user) return <AdminSignInGate />;
// 2. 登入了但不是白名單 email → 拒絕頁
if (ADMIN_EMAILS.indexOf(user.email) === -1) return <AdminForbidden />;
// 3. 通過 → 既有 AdminConsole（不動內部）
return <AdminConsole />;
```

- `<AdminSignInGate />`：「這是私人後台、請用授權帳號登入」+ Google 登入按鈕（觸發既有 `bpAuth.signInWithGoogle`）。**沙利曼建議 admin 用 Google OAuth**（比 magic link 更難被冒用、且 Edward 本來就有 Google 帳號）——不必為 admin 開 email magic link。
- `<AdminForbidden />`：「此後台為私人使用、若你需要協助請聯絡 edwardt0303 [at] gmail」+ 登出按鈕。**不要顯示登入者的 email**（避免洩漏給誤入者）。

**File 2 · `components/admin.jsx`（auth state 管理）**

- `AdminConsole` 頂層加 `useEffect` listen `bpAuth.onAuthStateChange` → 登出時 reset state（清空已載入的客戶資料）
- cleanup 階段 `unsubscribe`（避免 memory leak — sign-in.html 已有此 pattern 可參考）
- **既有資料載入邏輯不動**（bpAdmin.* 那些方法全保留）——只在最外層加閘

**File 3 · email 白名單寫法（admin.html 內、寫死 array）**

```js
const ADMIN_EMAILS = ['edwardt0303@gmail.com'];
```

- **寫死在前端、不從 query string / cookie / localStorage 動態讀**（防注入）
- **不存 DB**：POC 階段 1 個 admin、改白名單 = 改 code = git diff 留痕（比 DB 改更可審計）

### B.2 資料表變動

**無**。B 不碰 DB——前端閘 + 既有 RLS policy（`admin sees all` 已檢 `auth.jwt() ->> 'email' = 'edwardt0303@gmail.com'`）。

> **沙利曼資安重點**：前端閘是「UX 防呆」、**真正的資料防線是 RLS + Edge Function caller check**（見 C）。前端閘擋掉「誤入者看到後台」、RLS 擋掉「拿 anon key 直接撈 DB」。兩層都要。光有前端閘、有人用 anon key 直連 Supabase 仍可能撈到資料——所以 C 的 caller check 同等重要。

### B.3 工時（雙軌）

| 項目 | 內容 |
|---|---|
| 任務 | admin.html 登入閘 + email 白名單 + admin.jsx auth state |
| 預估工時 | **0.5-1 天** |
| 移動城堡估 | **3-4 小時**（卡西法 1.5-2hr + 沙利曼 review 0.5hr + Edward dashboard 設定 + smoke）|

---

## C · 雲端函式防洗（doc 14 P0-2）

### C.0 現況盤點（沙利曼已掃 code · 重要更新）

我掃過 `supabase/functions/`（現在共 ~28 個函式、比 doc 14 寫的 7 個多很多）：

- ✅ **好消息**：5/28 新建的金流/合約/仲裁函式（`create-ecpay-payment` / `decide-arbitration` / `mark-commission-event` / `get-payment-status` / `generate-contract-pdf` 等）**已有 admin email JWT 檢查**（`if (user.email !== "edwardt0303@gmail.com") return 403`）——pattern 已成熟、可複用
- ✅ **綠界 webhook 已有 CheckMacValue 簽章驗證**（`ecpay-webhook` / `ecpay-redirect` / `create-ecpay-payment` 都驗）——**Part C 此項只需「確認」、不需新做**
- ❌ **缺口確認**：doc 14 點名的**原 7 個函式全部沒有 caller check、也沒有 IP 限流**：

| 函式 | admin check | IP 限流 | 分類 | 風險 |
|---|---|---|---|---|
| `match-workers` | ❌ | ❌ | admin-only | 任何人能跑配對 |
| `send-decision-email` | ❌ | ❌ | admin-only | 任何人能以平台名義發信 |
| `worker-accept-decline` | ❌ | ❌ | admin/system | （另見 doc 14 P0-3 GET→POST 議題）|
| `client-brief-parse` | ❌ | ❌ | public · **燒 Anthropic token** | 🔴 狂打 = AI 帳單失血 |
| `worker-ai-interview` | ❌ | ❌ | public · **燒 Anthropic token** | 🔴 狂打 = AI 帳單失血 |
| `notify-lead-slack` | ❌ | ❌ | public | 洗 Slack |
| `worker-ack-email` | ❌ | ❌ | public | 洗信 |

### C.1 要改什麼檔

**Group A · admin-only（3 函式加 caller check）**

`match-workers` / `send-decision-email` / `worker-accept-decline`（POST 路徑）加：

```ts
const ADMIN_EMAIL = "edwardt0303@gmail.com"; // 與其他函式一致、建議抽 _shared/admin.ts 常數
const authHeader = req.headers.get("Authorization");
if (!authHeader?.startsWith("Bearer ")) return new Response("Unauthorized", { status: 401 });
const jwt = authHeader.slice(7);
const { data: { user } } = await supabaseAdmin.auth.getUser(jwt);
if (user?.email !== ADMIN_EMAIL) return new Response("Forbidden", { status: 403 });
```

> **沙利曼建議**：把 `edwardt0303@gmail.com` 從各函式硬寫**抽成 `_shared/admin.ts` 一個常數**（現在散在 5+ 個函式裡硬寫、改 admin 要改一堆地方、且容易漏）。卡西法做這 3 函式時順手抽、其他函式下個 sprint 收斂。

**Group B · public-facing（4 函式加 IP 限流）**

`client-brief-parse` / `worker-ai-interview`（高優先、燒 token）+ `notify-lead-slack` / `worker-ack-email`：

```ts
// 已有 prior art：submit-nps 等函式已讀 x-forwarded-for / cf-connecting-ip
const ip = (req.headers.get("x-forwarded-for")?.split(",")[0]
         || req.headers.get("cf-connecting-ip") || "unknown").trim();
const key = `ratelimit:${functionName}:${ip}`;
const count = await rateLimitStore.increment(key, 60); // 60s 窗
if (count > 10) {
  return new Response("Rate limit exceeded", {
    status: 429, headers: { "Retry-After": "60" },
  });
}
```

- **儲存選 Deno KV**（Supabase Edge Runtime 內建、零成本、零外部依賴）——doc 14 已分析過 Deno KV vs Upstash、結論用 Deno KV。沙利曼同意。
- **KV key TTL 設 120s**（不無限累加）
- **admin JWT bypass**：帶 admin token 的 request 自動跳過限流（Edward 操作後台不該被擋）

**Group C · webhook 簽章（確認、不新做）**

- ✅ 綠界 webhook 已驗 CheckMacValue——卡西法**確認** `ecpay-webhook` 的驗證沒被繞過即可
- **其他 webhook**：目前除綠界外無對外 webhook 接收端（其餘函式是主動呼叫第三方、不接 callback）。若未來加新 webhook → 必驗簽章（沙利曼 Gate 5 會擋）

### C.2 資料表變動

**無**。C 全在 Edge Function 層（caller check + Deno KV 限流）、不碰 DB。

### C.3 沙利曼 Gate 5 review 必檢查項（卡西法做完我會逐項驗）

- [ ] 3 個 admin-only 函式加 caller check、走 Bearer prefix、不接 query string token
- [ ] `supabaseAdmin`（service role key）只在 Edge Function env var、**絕不**出現在前端（沙利曼會 grep 前端確認）
- [ ] 限流 key = `IP + 函式名`（不只 IP、避免跨函式干擾）
- [ ] 429 response 帶 `Retry-After: 60`
- [ ] Deno KV key TTL ≤ 120s
- [ ] admin JWT request bypass 限流
- [ ] `client-brief-parse` / `worker-ai-interview`（燒 token 兩支）限流確實生效（連打第 11 次 → 429）
- [ ] admin email 抽 `_shared/admin.ts` 常數（消除硬寫散落）

### C.4 工時（雙軌）

| 項目 | 內容 |
|---|---|
| 任務 | 3 函式 caller check + 4 函式 IP 限流 + webhook 確認 + admin 常數抽取 |
| 預估工時 | **1-1.5 天** |
| 移動城堡估 | **4-6 小時**（卡西法 3-4hr + 沙利曼 Gate 5 1-1.5hr + Edward redeploy + smoke）|

> 比 doc 14 P0-2 估的略省——因 5/28 新函式已有可複用 pattern、且 prior art（submit-nps 的 IP 讀取）已在。

---

## 三塊累計工時

| 塊 | 卡西法 | 沙利曼 | Edward | 移動城堡 |
|---|---|---|---|---|
| A 帳號系統 | 2.5-4 hr | 0.75-1 hr | 0.2-0.4 hr | 4-7 hr |
| B Admin 守門 | 1.5-2 hr | 0.5 hr | 0.15-0.25 hr | 3-4 hr |
| C 函式防洗 | 3-4 hr | 1-1.5 hr | 0.4-0.6 hr | 4-6 hr |
| **小計** | **7-10 hr** | **2.25-3 hr** | **0.75-1.25 hr** | **11-17 hr** |

雙軌：
- 預估工時（AI 輔助工程師）：3-5 天（24-40 hr）
- 移動城堡：11-17 hr
- 倍率：0.4x-0.7x（城堡比工程師快——既有架構成熟、pattern 可複用、卡西法+沙利曼+Edward 並行）

---

## Edward 動手點（只有他能做、卡西法做不了）

### A 帳號系統（Supabase Dashboard · ~5-8 分鐘）
- [ ] **Auth > Providers > Email**：確認 enabled（magic link 走這個）
- [ ] **Auth > Email Templates > Magic Link**：確認模板文案（可用預設、或改成中文）
- [ ] **Auth > URL Configuration > Redirect URLs**：加 `https://beyondpath.tw/app.html`（magic link 點完導回站）
- [ ] **Auth > Rate Limits**：確認 email 寄送頻率限制（Supabase 內建、防有人狂寄 magic link 洗信箱）

### B Admin 守門（Supabase + Google Cloud Console · ~8-12 分鐘）
- [ ] **Supabase > Auth > Providers > Google**：確認 enabled（admin 走 Google OAuth）
- [ ] **Supabase > Auth > URL Configuration > Redirect URLs**：加 `https://beyondpath.tw/admin.html`
- [ ] **Google Cloud Console > OAuth Client > Authorized redirect URIs**：確認含 `https://iacwmkcloxjffghrweie.supabase.co/auth/v1/callback`
- [ ] 部署後**無痕視窗測**：(1) 用 Edward Google 帳號 → 進後台；(2) 用第二個非 admin 帳號 → 看到 Forbidden 頁

### C 函式防洗（Supabase CLI / Dashboard · ~25-35 分鐘）
- [ ] 確認 Deno KV 已啟用（Edge Runtime 自動啟、不需手動）
- [ ] **redeploy 改動的 7 個函式**（`supabase functions deploy <name>`）
- [ ] smoke：用 admin token 打 admin-only 函式（應 200）+ 用 anon token 打（應 401/403）
- [ ] smoke：同 IP 連打 `client-brief-parse` 11 次（應第 11 次 429）

> **Edward 動手累計：約 0.75-1.25 小時**、分散在三個 dashboard。沙利曼建議照「Batch 1 B → Batch 2/3 A+C 並行」節奏、Edward 的 dashboard 動作也跟著批次走、不必一次全設。

---

## 蕪菁頭競業 UX 研究（doc 27）整合

- 查過：`docs/launch/27*` **目前不存在**。
- **待補**：蕪菁頭若產出競業註冊流程 UX 研究（doc 27）、其「註冊步驟數 / 何時要 email / 何時擋」的建議應回填進本 spec 的 **A.3（登入閘時機）**。
- 目前 A.3 的設計依據是 **doc 26 §3「輕量註冊、要動作才升級」哲學**（抄 Upwork/Fiverr 的分階段邏輯）——這已是業界主流 pattern、即使 doc 27 未補也站得住。doc 27 補上後做「註冊流程轉換率」的細調。

---

## Gate 流程

| Gate | 主責 | 範圍 |
|---|---|---|
| **Gate 1** 技術/流程測試 | 🔥 卡西法 | A/B/C 全部：email magic link flow 跑通 + admin 閘擋對人 + 限流確實 429 + Chrome 實測 |
| **Gate 5** 信任關卡 | 🧙‍♀️ 沙利曼 | secret（service role 不入前端）+ admin caller check + 白名單寫死不動態讀 + profiles PII classification（電話=敏感個資）+ DPA 影響（收電話要更新隱私政策說明用途）|

> **沙利曼 Gate 5 額外註**：A 收「電話」= 個資法一般個資、§19 同意即可、但**隱私政策要寫清楚「為什麼收電話 + 怎麼用」**（配對成功後聯絡用）。Edward 的隱私政策頁若還沒這條、上線前補一句。**不碰身分證/人臉 = 維持 doc 26 的 Tier 0 紅線、沙利曼簽。**

---

## 上下游 reference

- `docs/launch/26-identity-verification-research-suliman.md`（身分認證研究 · 本 spec 的 A 塊母體）
- `docs/launch/14-auth-hardening-spec.md`（P0-1=B / P0-2=C / P0-3=GET→POST 另議）
- `supabase/migrations/001_initial_schema.sql`（profiles / worker_applications / client_intakes + RLS）
- `supabase/migrations/20260528_client_intakes_required_fields.sql`（phone/job_title 已存在）
- `components/supabase.js`（bpAuth / bpProfile 要加的位置）
- `sign-in.html`（email 登入區塊要接的位置 · CSS 已備）
- `components/admin.jsx`（admin 閘要包的位置）
- `docs/launch/27-*`（蕪菁頭競業 UX · **待補**）

---

## 附 · 本 spec 沒做（劃清邊界、避免 scope creep）

- ❌ **手機 OTP 自動驗證**——排 Tier 0.5（profiles 已預留 `phone_verified_at` 欄位、接 SMS 商再啟用）
- ❌ **身分證 / 人臉**——doc 26 Tier 2、有金流規模接第三方 KYC 再上、現在上沙利曼 NO-GO
- ❌ **重畫 wizard 流程設計**——保守紀律、只加閘不改設計
- ❌ **email + 密碼登入**——第一版用 magic link、Edward 要密碼再加
- ❌ **doc 14 P0-3（worker-accept-decline GET→POST 中間頁）**——獨立議題、不在本 spec、原 doc 14 排 Week 3

---

v0.1 · 🧙‍♀️ 沙利曼 · 2026-05-29 · 整合 doc 26 + doc 14 · 接力卡西法 · 走 Gate 1 + Gate 5 · 三塊一套 Auth 架構、一輪做完
