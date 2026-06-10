# Edward 動手清單 · 2026-05-28 整批上線

蘇菲整合精簡版 · 預估 30-40 分鐘

---

## 步驟 1 · 跑 SQL 搬遷（~3 分鐘）

打開 Supabase Studio → SQL Editor → 開新 query

**複製貼上** `docs/deploy/2026-05-28-all-migrations.sql` 整個檔案（13 個搬遷檔已合併成 1 個 1493 行 SQL）→ 跑

預期：13 個段落依序跑完、無錯誤（或既有資料的 idempotent skip）

---

## 步驟 2 · 建 2 個 Storage 私有儲存桶（~2 分鐘）

Supabase Studio → Storage → New bucket

```
□ contracts    · 私有 · 不對外開放下載
□ deliverables · 私有 · 不對外開放下載
```

---

## 步驟 3 · 設 9 個環境變數（~8 分鐘）

Supabase Studio → Project Settings → Edge Functions → Manage Secrets → Add

**既有應該有的**（確認、沒有就補）：
```
JWT_SECRET           = (5/19 已設、不動)
RESEND_API_KEY       = (5/15 已設、不動)
SLACK_BOT_TOKEN      = (5/14 已設、不動)
ANTHROPIC_API_KEY    = (5/15 已設、不動)
SUPABASE_SERVICE_ROLE_KEY = (預設有)
```

**新加**：
```
PUBLIC_SITE_BASE       = https://beyondpath.tw
INTERNAL_FN_SECRET     = (執行 openssl rand -hex 32 拿亂數)
PMF_BANK_NAME          = (你的銀行名、例：玉山銀行)
PMF_BANK_ACCOUNT       = (你的個人銀行帳號)
PMF_BANK_ACCOUNT_NAME  = Edward Tseng
ECPAY_MERCHANT_ID      = (綠界後台 https://vendor.ecpay.com.tw 拿)
ECPAY_HASH_KEY         = (同上)
ECPAY_HASH_IV          = (同上)
ECPAY_ENV              = production    (先測試也可填 sandbox)
```

---

## 步驟 4 · 部署 21 個雲端函式（~5 分鐘）

在 `prototype-v0.2/` 目錄跑：

```bash
bash docs/deploy/deploy-all-functions.sh
```

預期：21 個函式全部部署完成、最後印「✓ 21 個雲端函式全部部署完成」

---

## 步驟 5 · 綠界後台設 ReturnURL（~3 分鐘）

進 https://vendor.ecpay.com.tw/ → 系統設定 → 廠商通知設定

**ReturnURL** = `https://iacwmkcloxjffghrweie.supabase.co/functions/v1/ecpay-webhook`

存檔。

---

## 步驟 6 · Vercel 上線（~2 分鐘）

```bash
git add -A
git commit -m "feat: 2026-05-28 商業閉環後段全 ship · 抽佣 + 仲裁 + 綠界 + 交付檔案"
git push
```

Vercel 自動偵測 push、~2 分鐘後上線。

---

## 步驟 7 · 抽驗（~20 分鐘）

照順序跑一次完整流程驗收：

```
□ 1. https://beyondpath.tw/admin.html → Contracts 頁籤打得開
□ 2. 建一筆假合約（填 budget + contract_type=one_off）→ 系統自動算抽佣 + PDF 含服務費明細
□ 3. 雙方收信點簽 → contract.html 拍照簽 → 自動完成
□ 4. 按「產綠界付款連結」→ 客戶 email 收到 → 用 test card 4311-9522-2222-2222 刷
□ 5. 看 admin Contracts「金流」欄自動跳「已收款」+ 接案者收到「客戶已付款」信
□ 6. 接案者上傳 milestone 交付檔案 → 客戶下載 + 驗收通過
□ 7. 故意 reject 3 次 → 自動進「仲裁案件」頁籤 → admin 判決
□ 8. 全 milestone 通過 → 自動寄 NPS 邀請 → 評分 → 接案者 Tier 升降
□ 9. 接案者收到抽佣請款單 → ATM 轉款 → admin 在金流對帳子頁籤標「已收抽佣」
```

任何步驟出錯 → 截圖丟回對話、蘇菲接手修。

---

## 補位 · 如果你想跳過綠界 API 先跑（PMF 案 1 用人工）

若你還沒拿到綠界 key、想先接朋友圈第 1 案、跳過步驟 3 後半（ECPAY_*）+ 步驟 5 也可：

- 客戶刷卡改成「Edward 手動建付款單」（直接登綠界後台建）
- 系統其他都跑（合約 / 簽署 / 履約 / 抽佣對帳全部 OK）
- 第 2 案前再設 ECPAY_* + 重新部署綠界相關 4 個雲端函式即可

---

*蘇菲整合 · 從原 75-90 分鐘縮短到 30-40 分鐘 · 21 個雲端函式批次部署 + 13 個搬遷檔合併 + 9 個環境變數一頁清單*
