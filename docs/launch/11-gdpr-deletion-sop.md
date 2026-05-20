# GDPR / 個資法刪除請求處理 SOP

**Owner**: Edward + 沙利曼（policy）+ 卡西法（DB ops）
**Brief ref**: #7 (sulima H3)
**Last update**: 2026-05-21 (calcifer ship)
**Touched files**:
- `supabase/migrations/20260521091000_gdpr_purge.sql` (pg_cron monthly purge)
- `supabase/functions/...` 無新 endpoint · 用 mailto:hello@beyondpath.tw fallback

---

## TL;DR · 兩條路線

| 路線 | 對象 | 觸發 | 動作 |
|---|---|---|---|
| 自動 purge | 12 個月前的舊資料 | pg_cron 每月 1 號 19:00 UTC | DELETE 三張表的舊 row · 寫 bp_purge_log |
| 用戶 deletion request | 還沒 12 個月、但用戶主動要求刪 | mailto:hello@beyondpath.tw | Edward 手動 + audit log |

---

## 自動 purge（pg_cron 跑）

### 範圍

```
client_intakes:      created_at < now() - 12 months
worker_applications: created_at < now() - 12 months AND status IN ('rejected', 'archived')
worker_decisions:    created_at < now() - 12 months
```

⚠ worker_applications 的 active row（pending / reviewing / approved / tier_b / tier_b_plus）不會被 purge · 必須有 explicit reject/archive 才會自動 delete。

### Audit trail

每次 purge 寫一筆到 `public.bp_purge_log`：
- `ran_at`：實際跑的時間（UTC）
- `table_name`：哪張表
- `rows_deleted`：刪了幾筆
- `details`：jsonb（含 retention period + cutoff timestamp）
- `error_message`：失敗時的 SQLERRM

查詢：
```sql
SELECT * FROM public.bp_purge_log
ORDER BY ran_at DESC LIMIT 12;
```

### 驗證 pg_cron job 還在

```sql
SELECT jobname, schedule, command, active
FROM cron.job WHERE jobname = 'bp-monthly-purge';
```

### 排程時間

`0 19 1 * *` = UTC day 1 of month at 19:00
= TST day 2 of month at 03:00（UTC+8）
= 月初凌晨 · 低流量時段

---

## 用戶 deletion request（手動處理）

### 收件路徑

用戶寄信到 `hello@beyondpath.tw`、主旨應含 "delete" / "刪除" / "退出" / "資料刪除請求" 等關鍵字。

### Edward SLA

收到後 **7 個工作日內**處理完。實際操作流程：

#### Step 1. 驗證身分

- 確認來信 email = 該用戶當初註冊 email
- 若 email 不一致：回信要求補一份能 prove ownership 的資訊（如：上次 BeyondPath 對話 ID / 申請日期 / 配對結果 ID）
- 拒絕匿名刪除（不能讓第三方惡意刪別人帳號）

#### Step 2. 找該用戶資料

```sql
-- Client side
SELECT id, email, company_name, status, created_at
FROM public.client_intakes
WHERE email = '<user_email>';

-- Worker side
SELECT id, email, display_name, status, created_at
FROM public.worker_applications
WHERE email = '<user_email>';

-- Decisions trail
SELECT d.id, d.client_intake_id, d.worker_application_id, d.decision, d.created_at
FROM public.worker_decisions d
JOIN public.worker_applications w ON d.worker_application_id = w.id
WHERE w.email = '<user_email>';
```

#### Step 3. 確認沒 active 約

- 若 client 有 in-progress matching（status='reviewing' / 'matched' / 'in_progress'）→ 先回信問是否願意取消對方配對 · 取消後才能刪
- 若 worker 有 active accepted decision（worker_decisions.decision='accepted' + 7 天內）→ 同上、先處理 active engagement

#### Step 4. 執行刪除

```sql
-- WARNING: 此操作不可逆 · 跑前先在 admin notes 記錄 deletion request
-- (deletion_log 表是 future · 目前用 bp_purge_log 加 'manual-deletion' 標記)

BEGIN;

-- 1. delete client_intakes (cascade -> worker_decisions FK)
DELETE FROM public.client_intakes WHERE email = '<user_email>';

-- 2. delete worker_applications (cascade -> worker_decisions FK)
DELETE FROM public.worker_applications WHERE email = '<user_email>';

-- 3. log to bp_purge_log
INSERT INTO public.bp_purge_log (table_name, rows_deleted, details)
VALUES (
  'manual-deletion-request',
  0,
  jsonb_build_object(
    'requester_email', '<user_email>',
    'processed_by', 'edwardt0303@gmail.com',
    'request_received_at', '<original_request_iso_timestamp>',
    'note', 'GDPR / 個資法用戶主動要求刪除'
  )
);

COMMIT;
```

#### Step 5. 回信確認

模板：
```
[user_name] 你好，

我們已收到你的資料刪除請求、處理完成。

刪除範圍：
- 你的 BeyondPath 帳號相關資料（intake brief / worker application / matching decisions）
- 處理時間：[ISO timestamp]
- 操作人：Edward (edwardt0303@gmail.com)

未來重新申請：
- 你隨時可以重新申請（用同一 email 或新 email 都行）
- 你的歷史紀錄已永久刪除、新申請會從零開始評估

謝謝你過去的支持。

— BeyondPath
```

---

## 邊界 case

### Case A · 用戶要求刪「但保留 case study」

- 不行。POC 階段沒做匿名化機制
- 解法：回信說明「刪 = 連 case study 也刪 · 我們未來做匿名化機制後可以保留」
- 用戶可選擇：留所有 / 刪所有

### Case B · 用戶要求「只刪一部分」

- POC 階段不支援部分刪除
- 解法：回信「只能 all-or-nothing」

### Case C · 法律機關要求

- 沙利曼 review · Tier D escalate · 不可由 Edward 個人決定
- 流程：法律機關正式公文 → 沙利曼 audit → Edward + 法律顧問拍板 → 操作

### Case D · 死亡 / 法人解散

- 親屬 / 法定代表人提供 official document → 沙利曼 audit → 處理同 manual deletion

---

## 不要做的事

- ❌ 不要不經身分驗證就刪資料（防惡意第三方利用 deletion 流程做 DoS）
- ❌ 不要忘記 audit log 寫進 `bp_purge_log`（後續可能要對 compliance audit 提證據）
- ❌ 不要把 deletion email 內容 forward 給其他人（含家人、合作伙伴）
- ❌ 不要在 Slack public channel 公開單一刪除請求（涉個資）

---

## 未來改進（backlog）

- v2 加 `bp_deletion_requests` 表 · 用戶可填表自動 trigger（不必走 email）
- v2 加 24h grace period（用戶寄出 deletion request 後 24h 內可撤回）
- v3 加匿名化機制（保留 anonymized case study + 刪可識別個資）
- v3 整合 Supabase Auth deletion API（一鍵刪 auth + app data）
