# 綠界 ECPay 自動付款 . Deploy 動手清單

> 2026-05-28 calcifer ship · 綠界 AIO V5 自動付款 + webhook 對帳 · 商業閉環 85% → 95%

## 新增/修改檔案

### 新建 (7 個)
- `supabase/migrations/20260528_payment_intents.sql` — payment_intents table + RLS + index
- `supabase/functions/_shared/ecpay-helpers.ts` — CheckMacValue 算法 + MerchantTradeNo 生成 + form parse
- `supabase/functions/create-ecpay-payment/index.ts` — admin 產綠界付款連結（含寄 email 給客戶）
- `supabase/functions/ecpay-redirect/index.ts` — 公開 GET endpoint . 從 DB 讀 preflight 生 auto-submit form POST 到綠界
- `supabase/functions/ecpay-webhook/index.ts` — 綠界 ReturnURL callback . verify CMV . 標 paid . 寄雙方 email
- `supabase/functions/get-payment-status/index.ts` — admin polling endpoint . 30s 一次看 status
- `payment-thanks.html` — 客戶付款後 returnpoint . ClientBackURL 指向這

### 修改 (2 個)
- `components/supabase.js` — bpAdmin 加 4 method: createEcpayPayment / listPaymentIntents / getPaymentStatus / cancelPaymentIntent
- `components/admin.jsx` — Contracts 頁籤每筆 contract 加 PaymentIntentsPanel sub-panel

## Edward 動手清單

### 1. 跑 migration
```bash
# 在 Supabase Studio SQL Editor 跑
cat supabase/migrations/20260528_payment_intents.sql
```
或 supabase CLI:
```bash
supabase db push
```

### 2. 設 Supabase secrets (Supabase Dashboard > Settings > Edge Functions > Secrets)
```
ECPAY_MERCHANT_ID=<綠界後台 https://vendor.ecpay.com.tw/ 拿>
ECPAY_HASH_KEY=<綠界後台拿>
ECPAY_HASH_IV=<綠界後台拿>
ECPAY_ENV=production    # 或 sandbox 測試用
```
若沒設、create-ecpay-payment 會 return `{ ok: false, error: "ECPay secrets missing..." }`。

### 3. 部署 3 個新 Edge Function
```bash
supabase functions deploy create-ecpay-payment
supabase functions deploy ecpay-redirect
supabase functions deploy ecpay-webhook
supabase functions deploy get-payment-status
```

### 4. 綠界後台設定 ReturnURL
登入 https://vendor.ecpay.com.tw/ > 系統設定 > 系統介接設定 > 設定:
```
ReturnURL: https://iacwmkcloxjffghrweie.supabase.co/functions/v1/ecpay-webhook
ClientBackURL: https://beyondpath.tw/payment-thanks.html   (這個由 create-ecpay-payment 帶過去 . 後台不必設)
```

### 5. push 前端到 Vercel
```bash
git add supabase/ components/ payment-thanks.html docs/
git commit -m "ship: 綠界 ECPay 自動付款 + webhook 對帳 (calcifer 2026-05-28)"
git push
```

## 測試流程 (sandbox)
1. 設 `ECPAY_ENV=sandbox` + sandbox MerchantID/HashKey/HashIV (綠界文件提供)
2. admin 進 admin.html > Contracts tab > 找一筆 contract > 展開「綠界自動付款」panel
3. 點「+ 產綠界付款連結」 > 填 NT$ 100 / payment_type=all / customer_email=your@email > 確認
4. email 收到付款連結 > 點進去 > 走綠界測試卡（4311-9522-2222-2222 / 任意未來日期 / 222）
5. 付款成功 > 等 5-10 秒 > admin panel 自動 polling 看到 status=paid
6. 客戶 email 收到收據 + worker email 收到開工通知

## 紀律
- 不動 commission_records 表（卡西法 instance 2 領地）
- payment_intents.status=paid 之後 . 蘇菲整合段把 → INSERT commission_records event_type=client_paid（不在本次 PR）
- v5.4.23 燒錢 Gate 5 . 對外 API + 新雲端函式 + webhook = C 級（需驗證）但可逆、ship OK

## 安全
- create-ecpay-payment + get-payment-status 需 admin JWT
- ecpay-redirect 公開（trade_no 是 18 字 unique key、客戶從 email 點才知道）
- ecpay-webhook 公開（綠界 server-to-server call、用 CheckMacValue HMAC-SHA256 驗 + service_role 寫 DB）
- 個人戶 NT$ 20 萬月上限：前端不擋（金額 > 20 萬會 confirm 提示）、實際依綠界返回錯誤碼

## 後續整合 (蘇菲收齊時做、不在本次 PR)
1. webhook 標 status=paid 後 . 自動 trigger 寫 commission_records (用 cron 或 DB trigger)
2. payment-thanks.html 加 polling 30s 自動更新 status 顯示（目前是靜態）
3. admin 加「對帳完成」按鈕 . 把 payment_intents 列表跟 commission_records 比對
