# BeyondPath . Auth Hardening Spec . P0-1 / P0-2 / P0-3

- 撰寫人: Calcifer (CTO subagent)
- 日期: 2026-05-28
- 接力對象: Suliman (Trust subagent) review + Edward 動手
- Sprint: Q3 2026 sprint 2 (上線後第一波 hardening)
- 上游 dependency: 13 號 sprint plan + 7 個既有 Edge Function + Supabase Auth Google provider

## 0. 為什麼這份 spec

prod 上線後 (commit 2804600) 蘇菲 5/28 13:00 拆 7 件 -> 4 件純 UI/CSS/DB/doc 走卡西法當天 ship、3 件碰 auth/secret/payment 路徑 (P0-1 / P0-2 / P0-3) 規格寫死、由沙利曼 review 後下 sprint 動。本檔 = 給沙利曼接力的單一憑證 + Edward 動手前必看的清單。

---

## P0-1 . Admin Console Google OAuth gate

### 1.1 現況問題

- admin.html + components/admin.jsx 走「無 auth 直接讀 client_intakes / worker_applications」路徑
- RLS policy 「client_intakes: admin sees all」雖檢 auth.jwt() ->> email 條件、但若呼叫端沒帶 JWT (anon key) -> policy 條件 false -> 但 own rows 條件也 false -> SELECT 回空
- 真正風險: 若 Edward 自己登入 (Edward 的 JWT 帶 email)、admin policy 過 -> 看到全部
- 風險升級: 任何 anon 也能 INSERT (policy 「anyone can insert」) -> 攻擊面在 INSERT side
- 結論: admin.html 看不到資料不等於有 gate . 需 explicit Google OAuth login + email allowlist 才算 Tier C 入口

### 1.2 改動範圍

**File 1: admin.html**

在 React mount 前加 auth gate component (pseudo jsx):

    if (!user) return <SignInGate />;
    if (user.email !== ADMIN_EMAIL) return <ForbiddenScreen />;
    return <AdminConsole />;

- <SignInGate />: 顯示「Sign in with Google」按鈕 + 觸發 bpAuth.signInWithGoogle() (既有)
- <ForbiddenScreen />: 顯示「This admin console is private. Reach out at edwardt0303 at gmail dot com」+ Sign out 按鈕

**File 2: components/admin.jsx**

- AdminConsole 頂層加 useEffect listen bpAuth.onAuthStateChange -> reset state on logout
- 移除既有「直接呼叫 supabase.from client_intakes select」之前的 implicit anon 假設、改 require await bpAuth.getUser 拿到 user.id 才呼叫

**File 3: Supabase Dashboard (Edward 手動)**

- Auth > Providers > Google 確認 enabled
- Auth > URL Configuration > Redirect URLs 加 https://beyondpath.tw/admin.html
- Authentication > Users 確認 edward 的 admin email 已存在

**File 4: Google Cloud Console (Edward 手動)**

- OAuth Consent Screen > Test Users 加 admin email (若仍 testing mode)
- Credentials > OAuth Client > Authorized redirect URIs 確認含 https://iacwmkcloxjffghrweie.supabase.co/auth/v1/callback

### 1.3 email allowlist 寫法

不存在 supabase 設定面、必寫在前端 admin.html (array literal):

    const ADMIN_EMAILS = [edward_admin_email_literal_here];
    if (ADMIN_EMAILS.indexOf(user.email) === -1) return <ForbiddenScreen />;

不要存 DB . 因為:
1. POC 階段 1 個 admin . 加 DB table 過頭
2. allowlist 改動 = 程式碼改 = git diff + review 留痕 (DB 改可被惡意 admin 寫入 SQL 改動)

### 1.4 沙利曼 review 必檢查項

- [ ] admin.html ADMIN_EMAILS 是寫死 array . 不從 query string / cookie / localStorage 動態讀
- [ ] OAuth redirect URL 限 https . 不允 http
- [ ] ForbiddenScreen 不洩漏 user.email 給未授權者
- [ ] auth state change listener 在 cleanup 階段 unsubscribe (避免 memory leak)
- [ ] 移除 admin.html 直接 fetch anon Supabase 的 fallback code path

### 1.5 Edward 動手清單

- [ ] Supabase Dashboard > Auth > Providers > Google 確認 enabled
- [ ] Supabase Dashboard > Auth > URL Configuration > Redirect URLs 加 https://beyondpath.tw/admin.html
- [ ] Google Cloud Console > Credentials > OAuth 2.0 Client > Authorized redirect URIs 確認含 callback URL
- [ ] sprint 結束後 deploy 前用無痕視窗測登入 -> 應走 Google OAuth flow -> return admin
- [ ] 用第二個非 admin Google 帳號測 -> 應看到 ForbiddenScreen
- 預估時間: 8-12 分鐘 (含 Google Cloud Console 來回切)

### 1.6 城堡實跑估時

- 卡西法 front-end 改 (admin.html + admin.jsx): 1.5-2 hr
- 沙利曼 review (Gate 5): 30-45 min
- Edward 手動 dashboard 設定: 8-12 min
- 上線 smoke test (兩個帳號): 10 min
- 小計: 3-5 hr 移動城堡

---

## P0-2 . Edge Function admin caller check + IP rate limit

### 2.1 現況問題

- 7 個 Edge Function: client-brief-parse / match-workers / notify-lead-slack / send-decision-email / worker-accept-decline / worker-ack-email / worker-ai-interview
- 全部走 supabase.functions.invoke . 預設 --verify-jwt true 但部署旗標未在 git 留痕
- 攻擊面: 任何拿到 anon key 的人 (anon key 在 frontend 明文) 都能直 invoke 燒 token (Anthropic 計費)
- 其中 send-decision-email / match-workers / worker-accept-decline 是 admin / system 動作 . 不該允 anon 呼叫

### 2.2 改動範圍 (依 function 分類)

**Group A . admin-only (3 個 function)**

- match-workers/index.ts
- send-decision-email/index.ts
- worker-accept-decline/index.ts (POST 路徑 . GET 走中間頁見 P0-3)

需加 caller check (typescript pseudocode):

    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response("Unauthorized", { status: 401 });
    }
    const jwt = authHeader.slice(7);
    const r = await supabaseAdmin.auth.getUser(jwt);
    if (r.data.user?.email !== ADMIN_EMAIL) {
      return new Response("Forbidden", { status: 403 });
    }

**Group B . public-facing rate-limit (4 個 function)**

- client-brief-parse (Anthropic 燒 token . 高優先)
- worker-ai-interview (Anthropic 燒 token . 高優先)
- notify-lead-slack (低 . 但仍要)
- worker-ack-email (低 . 但仍要)

需加 IP rate limit (pseudocode):

    const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0] || "unknown";
    const key = "ratelimit:" + functionName + ":" + ip;
    const count = await rateLimitStore.increment(key, 60); // 60s window
    if (count > 10) {
      return new Response("Rate limit exceeded . retry in 60s", { status: 429 });
    }

### 2.3 IP rate limit . Deno KV vs Upstash Redis 取捨

| 維度 | Deno KV (Supabase Edge Runtime 內建) | Upstash Redis (external) |
|---|---|---|
| 成本 | 0 USD/mo (內建) | 0 USD/mo free tier (10k req/day) . 之後 0.2 USD/100k |
| Latency | 極低 (同 process) | 30-80 ms (跨 region) |
| Setup | 0 步 (直 await Deno.openKv) | 註冊 + token + secret 設定 |
| 一致性 | eventually consistent | strong consistent |
| 過期清理 | 需手動 / await kv.delete | 自動 (EX flag) |
| 推薦 | client-brief-parse / worker-ai-interview . 高頻 . latency 敏感 | 跨 function 共用 quota 才用 |

**卡西法建議**: 7 個 function 全走 Deno KV . 成本 0 . 不引入 external dep . 同 origin 一致性問題影響小。如未來分 region 部署再評 Upstash。決定權給沙利曼 + Edward。

### 2.4 沙利曼 review 必檢查項

- [ ] 3 個 admin-only function 加 caller check . 不走 anon key
- [ ] Authorization header 一律走 Bearer prefix . 不接受 query string token
- [ ] supabaseAdmin (service role) 不在 frontend 暴露 . 只在 Edge Function env var
- [ ] rate limit 用 IP + function name 為 key . 不只 IP (避免 cross function 干擾)
- [ ] rate limit 429 response 帶 Retry-After: 60 header
- [ ] Deno KV key TTL 設 120s . 不無限累加
- [ ] rate limit 例外: 帶 admin JWT 的 request 自動 bypass (Edward 操作 admin console 不該被擋)
- [ ] verify_jwt 旗標在 supabase/config.toml 寫死 . 不靠 deploy CLI 旗標

### 2.5 Edward 動手清單

- [ ] 確認 Supabase project 已 enable Deno KV (Edge Runtime 自動 enable . 不需手動)
- [ ] 若選 Upstash . 註冊 + token + 在 Supabase Dashboard > Edge Functions > Secrets 加 UPSTASH_URL / UPSTASH_TOKEN
- [ ] 7 個 function 全 redeploy (supabase functions deploy <name>)
- [ ] 用 admin token 測 admin-only function (應 200) + 用 anon token 測 (應 401/403)
- [ ] 用同 IP 連發 client-brief-parse 11 次 (應第 11 次 429)
- 預估時間: 25-35 分鐘 (含 deploy + smoke test)

### 2.6 城堡實跑估時

- 卡西法 Edge Function 改 (7 function): 3-4 hr
- 沙利曼 review: 1-1.5 hr (多 function 多面)
- Edward deploy + smoke: 25-35 min
- 小計: 4-6 hr 移動城堡

---

## P0-3 . worker-accept-decline GET -> POST 中間頁

### 3.1 現況問題

- worker email 內 link 形如 https://...functions/.../worker-accept-decline?token=xxx&decision=accept
- 防毒軟體 (Symantec / Norton / 公司郵件閘) 預訪問 link 做 URL safety check -> 觸發 GET -> 自動 accept/decline
- 結果: worker 還沒按下「接案」, 系統已記錄 accepted . 真實 worker 看到信時已 too late
- 這是 GET 「副作用化」反 REST . 必走 POST + 中間頁確認

### 3.2 改動範圍

**File 1: 新 accept.html**

- 簡單 React + Supabase client 頁
- 從 query string 拿 token + decision
- 顯示「You are accepting work XYZ . click confirm to proceed」
- Confirm 按鈕 onClick -> POST 到新 worker-accept-decline-confirm endpoint
- 成功 -> 顯示「Done . we have notified Edward」
- 失敗 -> 顯示「Link expired / already used . contact admin」

**File 2: 新 Edge Function worker-accept-decline-confirm/index.ts**

- POST only . GET 回 405
- verify token (與既有 worker-accept-decline 同 logic)
- 寫入 worker_applications.decision + decision_at = now
- 觸發 send-decision-email (內部 fetch . admin token)

**File 3: 既有 worker-accept-decline/index.ts**

- GET 路徑改成 302 redirect to https://beyondpath.tw/accept.html?token=xxx&decision=accept
- POST 路徑 deprecated . 改回 405 (避免雙路徑混淆)
- 保留 30 天 deprecation period 後刪整個 function

**File 4: templates/worker-accept-decline-email.html (或 send-decision-email 內 hardcode template 位置)**

- link 從 functions worker-accept-decline 改成 https://beyondpath.tw/accept.html

### 3.3 防防毒軟體預訪問 logic

中間頁 accept.html 必加 (pseudocode):

    // 不要 onLoad 自動 POST . 等用戶 click
    // 不要在 link 內帶 final action token . 中間頁 fetch 才換 token
    useEffect(() => {
      // 只 verify token 仍 valid . 不執行 action
      bpVerifyToken(token).then(setVerified);
    }, []);
    const onConfirm = () => bpExecuteDecision(token, decision);

防毒軟體 GET 只觸發 verify (idempotent) . 不執行 action。

### 3.4 沙利曼 review 必檢查項

- [ ] accept.html confirm 按鈕觸發前 token 已 verify . 未 verify 不顯示 button
- [ ] worker-accept-decline-confirm Edge Function 只接 POST . GET 回 405
- [ ] token 一次性使用 . DB 內加 used_at column . 二次 POST 回 409 conflict
- [ ] CORS 限 https://beyondpath.tw origin . 不允 wildcard
- [ ] decision parameter validation: 只接 accept / decline . 其他 400
- [ ] email template link 強制 https . 不允 http
- [ ] 既有 worker-accept-decline GET path 改 302 後 . 不再回 200
- [ ] deprecation 30 天後 . 確認 email log 看 0 個 worker 走舊 GET path . 才刪 function

### 3.5 Edward 動手清單

- [ ] 確認既有 worker-accept-decline Edge Function 名 + token 結構 (從 supabase functions list)
- [ ] 部署 accept.html 到 Vercel
- [ ] 部署新 Edge Function worker-accept-decline-confirm
- [ ] 改 email template HTML 內 link
- [ ] 用測試 worker email 送一封 -> 防毒軟體 (若有) 自動點 -> 確認沒誤 accept
- [ ] 真實 worker 點 link -> confirm -> 確認 accept 流程正常
- [ ] 30 天後 (sprint 後) confirm 0 GET hit -> 刪 worker-accept-decline 舊 function
- 預估時間: 20-30 分鐘

### 3.6 城堡實跑估時

- 卡西法 accept.html + 新 Edge Function: 2-3 hr
- 卡西法 email template 改 + 既有 function 改 GET -> 302: 30-45 min
- 沙利曼 review: 1 hr
- Edward deploy + smoke (含等 worker email 抵達): 20-30 min
- 小計: 3-4 hr 移動城堡

---

## 4. 三件累計

| 項目 | 卡西法 hr | 沙利曼 hr | Edward hr | 城堡實跑 |
|---|---|---|---|---|
| P0-1 admin OAuth | 1.5-2 | 0.5-0.75 | 0.15-0.2 | 3-5 hr |
| P0-2 caller check + rate limit | 3-4 | 1-1.5 | 0.4-0.6 | 4-6 hr |
| P0-3 GET -> POST 中間頁 | 2.5-3.75 | 1 | 0.3-0.5 | 3-4 hr |
| **小計** | **7-9.75 hr** | **2.5-3.25 hr** | **0.85-1.3 hr** | **10-15 hr** |

雙軌工時:
- 預估工時 (具 AI 輔助的中級工程師): 2-3 天 (16-24 hr)
- 移動城堡: 10-15 hr
- 倍率: 0.5x-0.95x (城堡比工程師快 . 因卡西法 + 沙利曼 + Edward 並行 + 城堡 ai_proof 上下文已暖)

雙軌反差解釋: 此 spec 因有 doc 預鋪 + 既有 7 個 Edge Function pattern 可複用 . 城堡反而快過工程師。新建 from-scratch case 倍率才會 6-15x。

---

## 5. Sprint 排程建議

- Week 1 (5/29 - 6/4): P0-1 (admin OAuth) -> 上線當週上 . 風險低 . 用戶可見性高
- Week 2 (6/5 - 6/11): P0-2 (Edge Function caller check + rate limit) -> 7 個 function 集中改 . 沙利曼 deep review week
- Week 3 (6/12 - 6/18): P0-3 (GET -> POST 中間頁) -> 涉 email template + Vercel + 新 function 部署 . 排最後給時間 backup
- Week 4 (6/19 - 6/25): smoke + bug fix + deprecation 監測啟動

---

## 6. 上下游 reference

- docs/launch/01-tech-audit-calcifer.md (上游架構基線)
- docs/launch/02-trust-audit-suliman.md (沙利曼上份審視)
- docs/launch/02-rls-hardening.sql (上次 RLS 改動參考)
- docs/launch/07-q3-2026-sprint-plan-sophie.md (sprint plan)
- docs/launch/10-jwt-rotation-sop.md (相關 SOP)
- docs/launch/13-q3-sprint-v2.md (current sprint context)

---

v0.1 . 卡西法 . 2026-05-28 . 接力沙利曼 . 上線後第一波 hardening . 不在當天 ship . 進下 sprint
