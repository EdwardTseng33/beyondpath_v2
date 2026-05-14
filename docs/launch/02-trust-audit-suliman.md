# 02 · Trust Audit · 沙利曼 Gate 5 信任關卡

> 對 BeyondPath beyondpath.tw 上線（撇開金流）做 Head of Trust + DevOps + 法務合規 audit。
>
> **作者**：🧙‍♀️ 沙利曼 · Head of Trust & Infrastructure
> **日期**：2026-05-14
> **Repo**：`C:\Users\Administrator\Claude\BeyondPath2.0\prototype-v0.2\`
> **Domain**：`beyondpath.tw` · Vercel · Supabase project `iacwmkcloxjffghrweie`
> **Verdict（先講）**：🟡 **Conditional GO** — 修完第 6 段「上線前必修 6 項」就可上、其中 5 項在 1-3 天內可做完、剩 1 項（律師合約 review）並行跑、不擋上線。

---

## 1. RLS Production Policy（ready-to-run SQL）

### 現況風險
`migrations/001_initial_schema.sql` 已寫了 RLS policy，但 **`project-status.md` 明確記錄 RLS 目前 DISABLED** 在 `worker_applications` + `client_intakes`（為了允許 anon submit）。這是 prototype 期權宜、**上線前必修**。

不修的後果（critical）：
- 任何人拿到 anon publishable key（已硬寫在 `components/supabase.js` 第 7 行，**設計上就是要公開**）可以 `select *` 全表
- 工人 portfolio / 客戶 brief / budget / email 全部公開
- 個資法 §27 安全維護義務違反、爆雷 = 行政罰 + 信任崩盤

### 上線 SQL（直接貼進 Supabase SQL Editor 跑）

```sql
-- ============================================================
-- BeyondPath 002 production RLS hardening
-- Date: 2026-05-14
-- 目標：re-enable RLS + 寫出對 anon / authenticated / admin 三方都正確的 policy
-- 跑法：Supabase Dashboard → SQL Editor → 全選貼 → Run
-- 退路：若爆，跑檔末「rollback」段
-- ============================================================

-- Step 1 · 先清掉舊 policy（避免衝突 · 001 schema 已建的會被覆蓋）
drop policy if exists "profiles: own row select" on public.profiles;
drop policy if exists "profiles: own row update" on public.profiles;
drop policy if exists "profiles: admin sees all" on public.profiles;

drop policy if exists "worker_apps: own rows" on public.worker_applications;
drop policy if exists "worker_apps: anyone can insert (with auth or anon)" on public.worker_applications;
drop policy if exists "worker_apps: own row update" on public.worker_applications;
drop policy if exists "worker_apps: admin sees all" on public.worker_applications;
drop policy if exists "worker_apps: admin update" on public.worker_applications;

drop policy if exists "client_intakes: own rows" on public.client_intakes;
drop policy if exists "client_intakes: anyone can insert" on public.client_intakes;
drop policy if exists "client_intakes: own row update" on public.client_intakes;
drop policy if exists "client_intakes: admin sees all" on public.client_intakes;
drop policy if exists "client_intakes: admin update" on public.client_intakes;

-- Step 2 · 確保 RLS enabled
alter table public.profiles enable row level security;
alter table public.worker_applications enable row level security;
alter table public.client_intakes enable row level security;

-- Step 3 · profiles policy
-- profiles 由 trigger auto-create、user 不該直接 insert
-- 規則：本人看本人 / 本人更新本人 / admin 看全部 / 沒人能 delete
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles_select_admin"
  on public.profiles for select
  to authenticated
  using (auth.jwt() ->> 'email' = 'edwardt0303@gmail.com');

create policy "profiles_update_admin"
  on public.profiles for update
  to authenticated
  using (auth.jwt() ->> 'email' = 'edwardt0303@gmail.com')
  with check (auth.jwt() ->> 'email' = 'edwardt0303@gmail.com');

-- Step 4 · worker_applications policy
-- 規則：
--   INSERT 開 anon + authenticated（允許未登入 submit · 已預期）
--   SELECT 限本人或 admin
--   UPDATE 限 admin（只有 Edward 能改 status / edward_notes）
--   DELETE 不開（admin 從 Dashboard 手動）

create policy "worker_apps_insert_anyone"
  on public.worker_applications for insert
  to anon, authenticated
  with check (true);

create policy "worker_apps_select_own"
  on public.worker_applications for select
  to authenticated
  using (auth.uid() = user_id);

create policy "worker_apps_select_admin"
  on public.worker_applications for select
  to authenticated
  using (auth.jwt() ->> 'email' = 'edwardt0303@gmail.com');

create policy "worker_apps_update_admin"
  on public.worker_applications for update
  to authenticated
  using (auth.jwt() ->> 'email' = 'edwardt0303@gmail.com')
  with check (auth.jwt() ->> 'email' = 'edwardt0303@gmail.com');

-- Step 5 · client_intakes policy（同上模式）
create policy "client_intakes_insert_anyone"
  on public.client_intakes for insert
  to anon, authenticated
  with check (true);

create policy "client_intakes_select_own"
  on public.client_intakes for select
  to authenticated
  using (auth.uid() = user_id);

create policy "client_intakes_select_admin"
  on public.client_intakes for select
  to authenticated
  using (auth.jwt() ->> 'email' = 'edwardt0303@gmail.com');

create policy "client_intakes_update_admin"
  on public.client_intakes for update
  to authenticated
  using (auth.jwt() ->> 'email' = 'edwardt0303@gmail.com')
  with check (auth.jwt() ->> 'email' = 'edwardt0303@gmail.com');

-- Step 6 · 驗證（跑完看回傳）
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public' and tablename in ('profiles', 'worker_applications', 'client_intakes');
-- 預期：3 row、rowsecurity = true

select schemaname, tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public'
order by tablename, cmd;
-- 預期：12-14 row policy

-- ============================================================
-- ROLLBACK（爆掉時跑這段、回到 prototype 階段 RLS-off）
-- ============================================================
-- alter table public.worker_applications disable row level security;
-- alter table public.client_intakes disable row level security;
-- 注意：profiles 不建議 disable RLS、會洩漏 email
```

### 跑完後手動測試 3 條
1. **匿名 submit**：用無痕視窗開 `app.html?role=worker&onboarding=1` 走完流程、確認 `worker_applications` insert 成功（worker 自己 paste-back AI JSON）
2. **匿名 select**：在 SQL Editor 用 `set role anon; select * from worker_applications limit 1;` 應該 **回 0 row**（policy 擋掉）
3. **Edward select**：登入後（自己 google account）在 app.html 開 console 跑 `await window.bpSupabase.from('worker_applications').select('*')` 應該 **看到全部**

3 條都過 = RLS hardened OK。

### Anon key 暴露的本質風險（**not a bug, by design**）
`components/supabase.js` 第 7 行的 `sb_publishable_Ke3oOlMiYwQ4_XGhYofF3w_TdBtoQEY` 是 Supabase 的 **publishable key**（=新版 anon key）、設計上就是要放 frontend、**它的安全靠 RLS 而不是靠藏 key**。所以「RLS 必須正確設定」= 唯一防線。RLS 沒 enable 等於把整個資料庫 publish。

### 額外 hardening（非阻擋、但建議 1 週內補）
- **Service role key 絕不放 frontend**：current code 用 publishable key 是對的、但日後若 Edward 要做 admin dashboard、必須用 server-side（Vercel serverless function）並把 service_role key 放 Vercel env vars、絕不入 git
- **Rate limit anon insert**：Supabase Pro 內建有 rate limit、若上 paid plan 開到「100 req/min per IP」可擋洗版 attack

---

## 2. OAuth Flow 安全 Review

### 整體 verdict：🟢 OAuth 本身 OK、但有 3 處要修

Supabase OAuth flow 走的是 PKCE + Authorization Code、token 由 Supabase 後端管、瀏覽器只拿 access token + refresh token——這是 2026 標準 best practice、不必擔心 implicit flow 的舊雷。

### 逐項

| 項目 | 現況 | 風險 | 修法 |
|---|---|---|---|
| **Redirect URI 配置** | `sign-in.html` 第 207 行動態組 redirect：`window.location.origin + ... + "app.html?role=" + chosenRole + "&signedin=1"` | **🟡 中**：origin 是 trusted、但 query string `role` 來自 URL 可被注入；若 Supabase Site URL 沒收緊、有 open redirect 風險 | Supabase Dashboard → Authentication → URL Configuration 設 **Site URL** = `https://beyondpath.tw`、**Redirect URLs allow list** 只列：`https://beyondpath.tw/app.html`、`https://beyondpath.tw/sign-in.html`、`http://localhost:5858/*`（dev）。其他都拒 |
| **state / nonce** | Supabase JS SDK 自動產生並驗 | 🟢 OK | 不必動 |
| **Session token 存哪** | `persistSession: true` → 預設存 **localStorage**（key: `sb-iacwmkcloxjffghrweie-auth-token`） | **🟠 中-高**：localStorage 易受 XSS 偷 token；prototype 期暫可接受、但若 React state 注入點被攻擊 = session 全失守 | Supabase SDK 沒提供 httponly cookie 模式（除非自己包 server-side auth）；**接受此風險到 v1.0、條件是 §3 entry point XSS audit 過關** |
| **httponly / secure cookie** | 不適用（用 localStorage） | — | 同上 |
| **Logout 真實清乾淨** | `signOut()` 呼叫 Supabase `auth.signOut()` + 但 `app.html` 的「shell logout」（per project-status）只清 `bp-active-role` / `bp-worker-onboarding` localStorage—— **沒呼叫 `bpAuth.signOut()`**！ | **🔴 高**：用戶以為登出了、但 Supabase session 還活著、回站立刻又自動 redirect 進 dashboard | **必修**：在 logout button handler 加 `await window.bpAuth.signOut()`、確認 `getSession()` 回 null 才 redirect 到 landing |
| **Admin 是 Edward 個人 Google account（hardcoded email）** | `auth.jwt() ->> 'email' = 'edwardt0303@gmail.com'` | **🟠 中**：Edward gmail 被釣魚 = 整個資料庫公開 | **強制開 Google 2FA**（hardware key 最佳、authenticator app 次之）+ 把 gmail recovery email 也設安全 + 一年內遷到公司網域 `edward@beyondpath.tw` + Google Workspace |

### Logout 修法（給卡西法 implement · 本份是 spec）

找到 `app.html` 或對應 shell component 的 logout handler、現在大概長這樣：

```js
// 現況（不夠）
localStorage.removeItem('bp-active-role');
localStorage.removeItem('bp-worker-onboarding');
window.location.href = 'landing.html';
```

改成：

```js
// 修法
async function handleLogout() {
  try {
    if (window.bpAuth) {
      await window.bpAuth.signOut();
    }
  } catch (e) {
    console.warn('[BeyondPath] signOut error (continuing):', e);
  }
  try {
    localStorage.removeItem('bp-active-role');
    localStorage.removeItem('bp-worker-onboarding');
  } catch (e) {}
  window.location.href = 'landing.html';
}
```

### Open redirect 防護
在 `sign-in.html` 第 207 行 redirectTo 組裝時、**驗證 `chosenRole` 只能是 `client` 或 `worker`**（current code 有過濾但 redirect 組裝沒用過濾後的、改成嚴格白名單）：

```js
const safeRole = (chosenRole === 'worker' || chosenRole === 'client') ? chosenRole : 'client';
const redirectTo = window.location.origin + window.location.pathname.replace(/sign-in\.html$/, "app.html") + "?role=" + safeRole + "&signedin=1";
```

---

## 3. Entry Point Security Audit

每個對外 entry 的安全風險清單。

### 3.1 `landing.html`
- **Risk**：純展示頁、沒收集個資、沒 form submit → 風險最低
- **必修**：無
- **建議**：加 `<meta http-equiv="Content-Security-Policy" content="default-src 'self' https://*.supabase.co https://fonts.googleapis.com https://fonts.gstatic.com https://cdn.jsdelivr.net https://unpkg.com 'unsafe-inline' 'unsafe-eval'">` —— Babel standalone 必須 unsafe-eval、所以 CSP 較鬆、但可擋外部 inject 第三方 script

### 3.2 `app.html?role=client&step=0`（Client Intake）
- **Risk 1**：`IntakeSubmitModal` 收集 email + companyName + intakeData JSON → 直接 insert Supabase。intakeData 是用戶在 textarea 打的字、若 React state 沒 escape 而是直接拼 HTML、有 **stored XSS** 風險（攻擊者 submit `<script>` 進 intake_data、若 admin dashboard 又把它 raw render = 觸發）
- **必修**：
  - 確認 React 18 預設會 escape `{var}` 表達式（**會**、所以只要不用 `dangerouslySetInnerHTML` 就安全）
  - **Grep 過全 component**：`grep -r dangerouslySetInnerHTML components/` 應該 0 hit、確認後安全
  - Edward 未來建 admin dashboard 看 intake_data 時、render 用 `<pre>{JSON.stringify(data, null, 2)}</pre>` 不要用 raw HTML
- **Risk 2**：intake_data 是 jsonb、Supabase 不會檢 schema、用戶可塞任意大 JSON 撐爆儲存 → DoS
- **必修**：在 `bpClientIntake.submit()` 加 client-side size check：`if (JSON.stringify(intakeData).length > 50000) throw new Error('資料過大')`

### 3.3 `app.html?role=worker&onboarding=1`（Worker Cert）
- **Risk 1**：worker 自己貼 AI 給的 JSON 進系統、JSON 完全用戶可控 → 同 3.2 stored XSS / jsonb DoS、同修法
- **Risk 2**：worker 可重複 submit 同一 email、洗 row → 影響 admin review pipeline、不算安全雷
- **建議**：DB 加 unique constraint `(email, status='pending')`（v1.1 補、不擋上線）

### 3.4 `sign-in.html`
- **Risk**：見 §2、redirect query + logout 兩處
- **必修**：見 §2 修法

### 3.5 `mobile.html`、`index.html`
- **Risk**：跟 `app.html` 共用 component、同 3.2 / 3.3
- **建議**：上線前**確認 index.html（design canvas）是否還對外**——這是「artboard view」、應該不對外發 URL、若不對外用、可在 Vercel 改 `index.html` redirect 去 `landing.html` 避免誤入

### 3.6 `waitlist.html`
- **Risk**：純 mailto + clipboard copy、無 form backend → 風險最低
- **必修**：無

### 3.7 全站共通
- **Supabase publishable key 暴露** → 已說明、靠 RLS 防、不算 bug
- **CDN script 從 unpkg / jsdelivr 載 React + Babel + Supabase-js** → supply chain attack 風險（若 CDN 被 hack、可注入惡意 code）
- **建議（不擋上線）**：給 CDN script 加 **Subresource Integrity (SRI) hash**、Babel standalone / supabase-js 都支援 SRI

範例：

```html
<!-- 現況 -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

<!-- 升級（去 jsdelivr 拿對應版本的 SRI hash 貼進來） -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.0"
        integrity="sha384-..."
        crossorigin="anonymous"></script>
```
— 寫死版本號 + SRI = 即使 CDN 被攻擊也擋住。

---

## 4. 個資法 §27 內部安全維護計畫 · Template

> 對齊 2025-11 修正後的台灣個人資料保護法 §27、行政院個資保護委員會「非公務機關個人資料檔案安全維護管理辦法」要點。
>
> ⚠ **這是底線建議、不是正式法律意見**。Edward 找律師審合約時、把這份一併過目、確認用詞無漏。

---

# BeyondPath 個人資料檔案安全維護計畫

**版本**：v1.0
**生效日**：2026-__-__
**負責人**：Edward Tsai（edwardt0303@gmail.com）
**最近更新**：__

## 1. 適用範圍

BeyondPath（網域 `beyondpath.tw`、Supabase project `iacwmkcloxjffghrweie`、本機開發環境）所有蒐集、處理、利用之個人資料。

## 2. 個資清冊（蒐集範圍）

| 資料項目 | 來源 | 表格 / 欄位 | 用途 | 法定依據（個資法 §19） |
|---|---|---|---|---|
| Email | Worker / Client 自願提供 | `worker_applications.email`、`client_intakes.email`、`profiles.email` | 配對、聯繫、發送服務通知 | 第 5 款（當事人同意） |
| 姓名 / display name | 同上 | `display_name`、`profiles.full_name` | 識別、聯繫 | 同上 |
| Google 大頭照 URL | Google OAuth | `profiles.avatar_url` | 介面顯示 | 同上 |
| Worker portfolio（AI proof JSON）| Worker 自願 paste-back | `worker_applications.ai_proof` | Tier 認證評估 | 同上 |
| Client intake brief / budget / timeline | Client 自願填寫 | `client_intakes.intake_data` | 需求理解、媒合 worker | 同上 |
| 公司名稱（選填）| Client 自願 | `client_intakes.company_name` | 媒合判斷 | 同上 |

**不蒐集**：身分證字號、銀行帳號、信用卡、護照、健保、地址（撇開金流期間明示不收）。

## 3. 蒐集方式 / 告知

- 蒐集前於各 entry（landing / app / sign-in）顯示「Prototype 階段、所有資料蒐集用於配對、有問題寫信 edwardt0303@gmail.com、可要求刪除」訊息（landing.html 已有 disclaimer banner、覆蓋此義務）
- 上線版加「隱私權政策」頁（見 §5 草稿）

## 4. 利用範圍與期間

- **利用範圍**：BeyondPath 內部配對、聯繫、Edward 人工 review
- **不對外提供** 個資給第三方（除非當事人明示同意 worker / client 互相聯繫時提供）
- **保存期間**：
  - Worker application：申請通過或拒絕後 2 年（供業務查核）
  - Client intake：案件結案後 2 年
  - 用戶 profile：帳號刪除請求後 30 天內清除
  - 異常 / 安全 log：1 年

## 5. 當事人權利行使方式（個資法 §3）

- 查詢、閱覽、製給複本：寄信 `edwardt0303@gmail.com`、附 email 驗證、7 個工作天內回覆
- 更正、補充：同上
- **停止蒐集 / 處理 / 利用**、**刪除**：同上、確認身份後 7 個工作天內處理
- 不收費（個資法 §14 規定可收手續費、BeyondPath 自願免收）

## 6. 安全維護措施

### 6.1 技術層
- 連線加密：全站 HTTPS（Vercel auto SSL）
- 資料庫加密：Supabase Postgres 自動 at-rest encryption（AES-256）
- 認證：Google OAuth + Supabase Auth
- 存取控制：Supabase RLS（Row Level Security）policy、見 `supabase/migrations/002_production_rls.sql`
- 備份：Supabase Pro plan 自動每日備份、保留 7 天 PITR
- 監控：Vercel logs + Supabase logs + （v1.1 加 Sentry）

### 6.2 管理層
- 唯一資料庫管理員：Edward Tsai（edwardt0303@gmail.com）
- Edward Google account 強制 **2FA**（hardware key + authenticator app）
- Supabase project 設定僅 Edward 一人可登入
- 第三方 vendor 清單：
  - **Vercel**（hosting · TOS + DPA on file）
  - **Supabase**（DB + Auth · SOC 2 Type II + GDPR DPA · 資料 region 確認在 ap-northeast-1 東京）
  - **Google Cloud**（OAuth · GCP 標準 DPA）
  - **Cloudflare**（若有用 · DNS / CDN）

### 6.3 人員層
- 目前唯一處理人：Edward
- 未來雇員 / 包商必須簽 NDA + 個資保密承諾書
- 委外律師 / 會計接觸個資範圍以最小化原則

## 7. 異常事件處理（資料外洩通報）

依個資法 §12、發現個資被竊取、洩漏、竄改或其他侵害時：

1. **立即** 確認外洩範圍、停止外洩源
2. **72 小時內** 通報行政院個資保護委員會（依 2025-11 §12 修正細則）
3. **適當方式** 通知當事人（email / 公告）
4. 紀錄事件原因、影響、處理過程、改善措施
5. 紀錄保存至少 5 年

通報窗口：個資保護委員會 https://www.pdpc.gov.tw/

## 8. 計畫檢討與修正

- 每年 1 月、Edward 自審本計畫一次、必要時修訂
- 法規變動（個資法修正）30 天內檢視適用性
- 重大事件後 30 天內修訂

---

**負責人簽署**：Edward Tsai · ____________ · 2026-__-__

---

> Edward 填空指引：填 §1 生效日、§4 保存期間若想調整可改、§6.1 Supabase 資料 region 上 Dashboard 確認（Project Settings → General → Region）、§8 第一次自審日期記行事曆。其他可保持原樣。

---

## 5. DPA / 隱私政策 / TOS Draft（簡版）

3 份 markdown template、Edward 一份份過。Prototype 級可上、上正式版需律師審。

### 5.1 隱私權政策 · `legal/privacy-policy.md`

```markdown
# BeyondPath 隱私權政策

**最近更新**：2026-__-__
**版本**：v1.0（Beta）

## 1. 我們是誰

BeyondPath 是一個 AI 時代的工作配對網路、由 Edward Tsai（個人營業者、未來開設公司中）營運。聯繫：edwardt0303@gmail.com。

## 2. 我們蒐集什麼

當你使用 BeyondPath、我們可能蒐集以下個人資料：

- **登入資訊**：透過 Google OAuth 取得 email、姓名、大頭照
- **使用資訊**：你填寫的發案需求（brief / budget / timeline）或接案資料（portfolio / AI proof）
- **聯繫資訊**：你主動寄信給我們的內容

我們**不蒐集**：身分證字號、銀行帳號、信用卡、護照、健保、地址。

## 3. 我們如何使用

- 配對發案方與接案者
- Edward 人工 review 申請
- 寄送服務通知（重大進度、配對結果）
- 異常事件處理

我們**不會**：賣你的資料、廣告再行銷、提供給第三方。

## 4. 資料儲存

- 儲存在 Supabase（資料 region：日本東京）
- 全站 HTTPS 加密、資料庫 AES-256 at-rest 加密
- 每日自動備份、保留 7 天

## 5. 保存期限

- 申請 / 案件資料：完成後 2 年
- 帳號資料：你提出刪除請求後 30 天內清除

## 6. 你的權利

你可以隨時寄信 `edwardt0303@gmail.com` 行使：

- 查詢、閱覽你的資料
- 更正、補充
- 停止蒐集 / 處理 / 利用
- 刪除

我們會在 7 個工作天內回覆。

## 7. Cookies

我們僅使用必要 cookies（登入 session、語言偏好）、不用追蹤 cookies、不接第三方廣告。

## 8. 第三方服務

- **Google OAuth**：依 Google 隱私權政策
- **Supabase**：依 Supabase 隱私權政策、SOC 2 Type II
- **Vercel**：依 Vercel 隱私權政策

## 9. 政策變更

本政策更新時、會在首頁公告、重大變更會 email 通知。

## 10. 聯繫

任何個資疑問：edwardt0303@gmail.com
```

### 5.2 服務條款 · `legal/terms-of-service.md`

```markdown
# BeyondPath 服務條款

**最近更新**：2026-__-__
**版本**：v1.0（Beta · Prototype）

## 1. 同意條款

使用 BeyondPath 即表示你同意本條款。如果不同意、請停止使用。

## 2. 服務性質

BeyondPath 目前處於 **Beta 階段**、提供：

- 發案需求理解與整理（AI 輔助）
- AI 工作者 Tier 認證初審
- 配對候選工作者
- 交付過程的可驗收紀錄

**Beta 階段限制**：
- 服務可能中斷、資料可能變動
- 不保證配對成功率、時程精確度
- 商業條款（付款、合約簽訂）目前由 Edward 線下協助、平台不收費

## 3. 用戶責任

你保證：

- 提供的資訊真實、準確、合法
- 不上傳侵權內容（含 portfolio、brief、AI proof）
- 不嘗試破壞系統、繞過認證、攻擊其他用戶
- 不重複申請 / 灌水 / 偽造資料

違反者、Edward 有權終止你的帳號、保留通報法律單位的權利。

## 4. 智慧財產權

- 你上傳的 portfolio / brief 仍歸你所有
- BeyondPath 取得「為配對與展示之非專屬授權」、在你刪除帳號後失效
- BeyondPath 平台 code、UI、商標歸 Edward Tsai 所有

## 5. 免責聲明

Beta 階段、BeyondPath「依現狀」（AS-IS）提供、不對：

- 配對結果的商業成果
- 配對到的工作者實際表現
- 第三方（worker / client）的行為
- 服務中斷造成的損失

負責任、不過 BeyondPath 仍會盡力維護服務品質。

## 6. 責任上限

BeyondPath（含 Edward Tsai 個人）對任何單一用戶的累計賠償責任、上限為你在過去 12 個月實際支付給 BeyondPath 的費用（Beta 階段為 NT$ 0）、或 NT$ 10,000、取較高者。

> ⚠ 此條款是 **prototype 等級保守版**、上正式版前需律師調整。

## 7. 終止

我們可在 30 天前通知終止你的帳號、或在你違反條款時立即終止。
你可隨時透過 email 要求刪除帳號。

## 8. 準據法

本條款受**中華民國法律**管轄、爭議由**台灣台北地方法院**為第一審管轄法院。

## 9. 變更

條款修改時會在首頁公告、繼續使用視為同意新條款。

## 10. 聯繫

edwardt0303@gmail.com
```

### 5.3 用戶 DPA 同意條款（簽到時勾選一次）· `legal/dpa-consent.md`

```markdown
# 個人資料蒐集同意條款

在你提交發案需求 / 接案申請前、請確認以下事項：

☐ 我已閱讀並同意 [BeyondPath 隱私權政策](/legal/privacy-policy)、[服務條款](/legal/terms-of-service)。

☐ 我同意 BeyondPath 蒐集、處理、利用我提供的 email、姓名、大頭照、申請 / 發案內容、用於配對與服務通知。

☐ 我了解我可以隨時透過 edwardt0303@gmail.com 行使查詢、更正、停止處理、刪除等權利。

☐ 我提供的資料真實、合法、不侵害第三方權利。

[ 不同意 · 返回 ]    [ 同意並提交 → ]
```

> 實作建議：在 `IntakeSubmitModal` + worker apply Step 3 preview 加一個強制勾選 checkbox、未勾選不能 submit。

---

## 6. 預上線必修 Checklist（按 critical 排序）

| # | 項目 | Critical | Owner | 工時 | 阻擋上線？ |
|---|---|---|---|---|---|
| 1 | **RLS 重啟 + 跑 002 migration**（§1 SQL） | 🔴 P0 | 卡西法 | 30 min | ✅ 阻擋 |
| 2 | **Supabase Site URL + Redirect allow list 收緊**（§2） | 🔴 P0 | Edward + 卡西法 | 15 min | ✅ 阻擋 |
| 3 | **Logout 修法**（呼叫 `bpAuth.signOut()`、§2） | 🔴 P0 | 卡西法 | 20 min | ✅ 阻擋 |
| 4 | **Edward Google account 開 2FA**（§2） | 🟠 P1 | Edward | 10 min | ✅ 阻擋 |
| 5 | **§27 個資內部計畫填空 + 簽**（§4） | 🟠 P1 | Edward | 1 小時 | ✅ 阻擋 |
| 6 | **隱私政策 / TOS / DPA 同意條款上線**（§5） | 🟠 P1 | 卡西法 + Edward | 2 小時 | ✅ 阻擋 |
| 7 | Google OAuth consent screen 狀態確認（**Test mode** 限 100 user/100 user · **Published** 才能對外公開） | 🟠 P1 | Edward | 30 min | ✅ 阻擋 |
| 8 | DPA 同意 checkbox 加進 client intake + worker apply submit modal | 🟠 P1 | 卡西法 | 1 小時 | ✅ 阻擋 |
| 9 | Open redirect chosenRole 白名單強制（§2） | 🟡 P2 | 卡西法 | 10 min | ❌ 軟 |
| 10 | intake_data / ai_proof size limit（§3） | 🟡 P2 | 卡西法 | 15 min | ❌ 軟 |
| 11 | CSP header（§3） | 🟡 P2 | 卡西法 | 30 min | ❌ 軟 |
| 12 | SRI hash for CDN scripts | 🟡 P2 | 卡西法 | 1 小時 | ❌ 軟 |
| 13 | Supabase 資料 region 確認在東京（個資跨境議題） | 🟡 P2 | Edward | 5 min | ❌ 軟 |
| 14 | Sentry / monitoring 接入 | 🟢 P3 | 卡西法 | 2 小時 | ❌ 軟 |
| 15 | **公司開設**（個人戶月限 30 萬、超過要走公司）| 🟢 P3 | Edward | 1-2 月 | ❌ 軟 · 撇開金流期間個人戶可撐 |
| 16 | **律師審合約**（NT$ 30-50K · 隱私 / TOS / 委任服務契約三份） | 🟢 P3 | Edward | 2-4 週並行 | ❌ 軟 · prototype 級 template 先上、律師版 v1.1 補 |
| 17 | DELETE 個資 SOP（手動 from Supabase Dashboard）寫紀錄 | 🟢 P3 | Edward | 30 min | ❌ 軟 |

### 1-3 天可完成版本（P0 + P1 共 7 項、總工時 5-6 小時）

day 1（卡西法主跑）：
- 1 · 跑 RLS migration（30 min）
- 2 · Supabase Dashboard 收緊 Site URL（15 min）
- 3 · 改 logout 邏輯（20 min）
- 6 · 隱私 / TOS / DPA 三份 markdown 渲染進 `/legal/*` 路徑（2 小時）
- 8 · DPA checkbox 加進兩個 submit modal（1 小時）

day 2（Edward）：
- 4 · 開 Google 2FA（10 min）
- 5 · §27 文件填空簽署（1 小時）
- 7 · 確認 Google OAuth consent screen published（30 min）

day 3：QA + 主對話蘇菲收尾。

P2 軟性項在 v1.0.1 補、不擋上線。

---

## 7. Go / No-Go Verdict

### 🟡 Conditional GO（撇開金流前提下）

#### Critical 阻擋條件已列、若上線前完成 P0 + P1（§6 第 1-8 項、3 天可完成）= 可上

撇開金流的 launch、本質上是一個**有 OAuth + 兩個 form + admin review 信箱**的 prototype 上線、合規負擔比真的 SaaS 平台輕得多——主要風險集中在 **RLS（資料外洩）+ logout（帳號接管）+ §27（行政罰）** 三條、都 1-3 天可解。

#### Go 後接受的風險（明示記錄）

| 風險 | 接受理由 | Monitor 機制 |
|---|---|---|
| Session token 存 localStorage（XSS 偷 token 可能性）| Supabase SDK 標準做法、修 server-side cookie auth 工程量大、prototype 期不值得 | §3 audit `dangerouslySetInnerHTML` 結果為 0 hit；XSS 攻擊面收窄；若 v1.0 後有真實付款再升級 |
| Admin = Edward 個人 Gmail | Gmail 是業界級基礎設施、+ 2FA 已夠擋一般攻擊 | 一年內遷 `edward@beyondpath.tw` + Workspace |
| 律師合約 review 並行（不擋上線）| Prototype 級 template 已涵蓋責任上限、智財、終止、準據法基本紅線 | v1.1（4 週內）律師版 ship、有重大變更時公告用戶 |
| CDN 無 SRI | supply chain attack 罕見、jsdelivr / unpkg 是業界級 | 加 SRI 列 v1.0.1 backlog |
| 個人戶 30 萬 / 月限額 | 撇開金流期間平台不過錢、限額不會卡 | Edward 開公司前不上付款流 |
| §27 文件未經主管機關認可 | 個資法 §27 是「應自行訂定」、不需報備、自審即可 | 每年 1 月自審、記行事曆 |

#### No-Go 條件（若以下任一未過、不上）
1. RLS 沒重啟（resp. 必查驗 `pg_tables` rowsecurity = true）
2. 匿名 select 測試沒回 0 row
3. Logout 沒清 Supabase session
4. 隱私政策 / TOS 沒掛上線
5. Google OAuth consent screen 還在 test mode（會擋 100+ user）

#### Go 後 30 天 monitor 機制

| 指標 | 工具 | 頻率 |
|---|---|---|
| Supabase auth.users 數 | Supabase Dashboard | 每週 |
| Anon insert 數 | SQL `select count(*) from worker_applications where created_at > now() - interval '7 days'` | 每週 |
| 失敗 OAuth 數 | Supabase Auth logs | 每週看一次、異常 spike alarm |
| Edward 收到的個資刪除請求 | gmail 標籤 `bp-privacy-request` | 即時、48h SLA |
| 政府個資修法 / 新規 | 個資保護委員會 newsletter | 每月 |

#### 升 v1.0 的進階規劃（不擋本次 launch）

- 公司開設完成 → 申請 Supabase Pro plan、把 db transferred 到公司戶頭
- 律師審完合約 → 更新 `legal/*` 文件、公告變更
- 接金流 → 必修 PCI-DSS scope（用 Stripe Checkout / TapPay 都 SAQ-A、不直接過卡號）、另寫 audit
- 接 NDA / 委任契約 → 補 `legal/services-agreement.md`、律師版

---

## Final Sign-off

🧙‍♀️ **沙利曼**：條件式 GO。RLS + Logout + §27 三條解、就放城堡推上線。Edward 開的不是 SaaS 巨獸、是有信任資料層的配對 prototype、合規門檻可以走 prototype 級的合理底線、不是 SOC 2 / ISO 27001 那種規模。**但 RLS 那條沒談判空間——上之前一定要驗過 anon select 回 0 row。**

> 「在我簽字之前、我需要看到 RLS 三條測試都過。其他都讓步、這條不讓。」

---

**附件**：本份 audit 對應的 SQL migration 已寫進 §1、可直接拆成 `supabase/migrations/002_production_rls.sql` 入 repo。

