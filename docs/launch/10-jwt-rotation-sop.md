# JWT Secret Rotation SOP

**Owner**: Edward
**Brief ref**: #4 (sulima H1 + calcifer G5)
**Last update**: 2026-05-21 (calcifer v2 ship)
**Touched files**:
- `supabase/functions/_shared/jwt-light.ts` (kid support + clock skew leeway + 24h TTL)
- `supabase/functions/send-decision-email/index.ts` (TOKEN_TTL_HOURS = 24)
- Supabase Secret `JWT_SECRET` (Edward 親手管)

---

## TL;DR

1. JWT 簽 worker accept/decline link · TTL 24h · 用 HS256
2. `JWT_SECRET` 可以是純字串（單 key · 自動命名 `v1`）**或** JSON map（多 key · 例 `{"v1":"...","v2":"..."}`）
3. 輪替時：加新 key 進 JSON map · 設 `JWT_CURRENT_KID=v2` · 等 TTL 過後刪舊 key

---

## 為什麼要輪替

| 場景 | 行動 |
|---|---|
| Suspect leak（unauthorized accept email click pattern） | 立即輪替 |
| 季度安全衛生 | Q3 / Q4 各一次 |
| Compliance audit 要求 | 依政策 |

不輪替的後果：洩漏的 secret 可永久偽造 accept/decline link · 平台信任崩盤。

---

## 輪替步驟

### Step 0. 準備

- 取得 Edward 同意（影響 prod accept link · 必走 Tier C policy 拍板）
- 跟蘇菲 / 沙利曼確認時機（不要在 prod traffic 高峰）
- 跟卡西法 dry-run 一次（local supabase functions serve）

### Step 1. 產生新 secret

```bash
# 用 cryptographically random · 32 bytes -> base64
openssl rand -base64 32
# 例：xK9aJp...zR4n=
```

複製 output · 標記為 `v2`（next kid）。

### Step 2. 把舊 + 新 secret 寫成 JSON map

- 找 Supabase Dashboard → Project Settings → Edge Functions → Secrets
- 找 `JWT_SECRET`
- 把當前值（單字串、視為 `v1`）改成 JSON：
  ```json
  {"v1":"<old-secret-value>","v2":"<new-secret-value>"}
  ```
- 另外新增 secret `JWT_CURRENT_KID` = `v2`

⚠ JSON map 寫法注意：
- key 必須是 `v` + 數字（例 `v1`, `v2`, `v3`）· `pickCurrentKid` 自動選最高數字
- value 必須是 string · 沒 escape 問題（Supabase Dashboard text input OK）

### Step 3. 等 Supabase 自動 propagate (約 30s-2min)

新 token 簽出來會帶 `header.kid = "v2"`、用 `v2` secret 簽。
**舊 token 帶 `header.kid = "v1"` 仍可 verify**（map 內 v1 仍在）。

### Step 4. 等 TTL 過

TTL = 24h、所以 **24h 後**所有 v1 簽出的 token 自然過期。
等 25h（多 1h buffer 含 clock skew leeway）。

### Step 5. 刪舊 secret

把 JSON map 改成：
```json
{"v2":"<new-secret-value>"}
```

- 此時 v1 secret 物理刪除 · 即使有人留著舊 token 也無法 verify
- 可選：移除 `JWT_CURRENT_KID`（map 只剩 v2、自動選 v2）

### Step 6. Verify

跑一輪 e2e：
1. admin.html 寄一封新邀請信給 test worker（用自己 email 當 worker）
2. 收信 · 點 accept link · 確認 302 redirect to landing
3. landing 顯示 `worker_decision=success&action=accept` banner

---

## 異常處理

### Case A · 新 secret 寫錯 / Supabase secret 無法 propagate

- 立刻 revert JSON map · 把 v2 拿掉 · 留 v1 plain string · 等 propagate
- send-decision-email 會 fallback 用 v1 簽（pickCurrentKid 找最高數字）

### Case B · 24h 內發現 v1 leaked

- 直接刪 v1 from map · 不等 24h
- 結果：所有 v1 簽出的 outstanding 邀請信失效
- Edward 必須 admin.html 重新寄一批新邀請信給未回的 worker
- 蘇菲在 #beyondpath-leads channel 公告：「v1 secret rotated for security · 舊邀請信失效 · 重新寄送中」

### Case C · clock skew warning

`verifyDecisionToken` 已有 ±60s leeway · 一般 NTP 漂移 OK。
若有 > 60s skew · 該 worker 仍會看到 invalid-or-expired banner · 寄信到 hello@beyondpath.tw 手動處理。

---

## 不要做的事

- ❌ 不要把 JWT_SECRET commit 進 repo（包括 `.env.example`）
- ❌ 不要在 Slack / email 內貼 secret value
- ❌ 不要跳過 ttlSeconds 改成 > 24h（brief #4 立的紀律 · 不退回 7 day）
- ❌ 不要在沒 Edward 拍板的狀況下 rotate prod secret
- ❌ 不要忘記 `JWT_CURRENT_KID` env 設置 · 缺它 + JSON map 有多 key 會走 heuristic 但不保證

---

## 跟既有的東西關係

- `worker_decisions.token_hash` = SHA-256 of JWT · 跟 secret 無關 · rotate 不影響 audit trail
- `worker-accept-decline` Edge Function 自動跟 `jwt-light.ts` v2 對齊 · 不需單獨 deploy
- `send-decision-email` Edge Function 已 wire 新 TTL · 不需單獨改

---

## 跟下個版本的關係（待 implement · 下個 sprint）

- v3 改 Asymmetric (RS256 / EdDSA) · `JWT_PUBLIC_KEYS` + `JWT_PRIVATE_KEY` 分開
- v3 加 `revoke list` · 主動撤銷單一 worker decision（不必等 TTL）
- v3 整合 Supabase Vault（如 GA · 目前 beta）
