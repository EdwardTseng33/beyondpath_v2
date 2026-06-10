# PMF 量化框架 · BeyondPath · 蕪菁頭 · 2026-05-29

> 作者：🥕 蕪菁頭（用戶意圖 & 行為分析）
> 觸發：Edward 5/29「產品正式上線後有沒有量化的可能——怎麼判斷 PMF 驗證成功 / 失敗」
> 產品背景：台灣 AI native 雙邊接案配對平台 · 正式收費（B 代收代付）· 池子 3 領域少數 worker · worker 認證制
> 研究基礎：a16z GMV Retention + Sharetribe 雙邊市集指標 + Sean Ellis 40% Test + Lenny's marketplace metrics + Fiverr/Upwork 早期指標

---

## 一、北極星指標

**推薦北極星：配對完成後雙邊 60 天回購率**

定義：案件完全交付 + 雙邊 NPS 收到後，client 60 天內發第二案 或 worker 60 天內接第二案 的比率。

計算：（60 天內有第二次交易的唯一用戶數）÷（首案完成用戶數）× 100%

為什麼是這個：雙邊媒合平台 PMF 核心只有一個問題——雙方有沒有真的解決到問題、解決到願意再來。GMV/MAU/NPS 都是代理指標、可被一次性好奇心或行銷污染；唯有「自願回購」是用戶用行動投票。a16z GMV Retention：頂尖服務市集供給端 GMV 12 個月可達 2-3x；Upwork 早期 PMF 核心訊號是 client 第二次發案率 > 40%。

早期樣本（< 10 案）讀法：用質性取代量化——訪談每個完成案雙方「會不會再來、為什麼」，5 人中 4 人說會 = 北極星訊號成立。

---

## 二、雙邊轉換漏斗

### 2.1 需求側 Client

訪客 → 點 CTA（>30%）→ 開始填案（>60%）→ 送出 brief（>40%，`client_intakes.created_at`）→ 收到配對（>80%）→ 點邀請（>50%）→ 簽約（>70%，`contracts.status=signed`）→ 完成驗收（>60%）→ 付款（>90%，`commission_records.client_paid`）→ **60 天回購（目標 >40%）**

關鍵：client 回購追蹤需帳號系統（doc 28）關聯 email。帳號系統是追蹤北極星的前提基礎設施。

### 2.2 供給側 Worker

申請（`worker_applications`）→ 通過認證（>50%）→ 收邀請 → 接案（>60%）→ 交付（>80%）→ 收款（>95%）→ 好評 NPS≥4（>60%）→ **30 天留存接第二案（>50%）**

關鍵：worker pool 現只 Edward 一人，量化漏斗等 worker ≥ 5 才有意義，早期靠質性。

---

## 三、雙邊健康指標（防單邊枯竭）

**供給健康**：認證 worker 數（月淨增≥1）/ 接案率（>60%）/ 交付準時率（>80%）/ worker 30 天留存（>50%）/ worker NPS（>4.0）

**需求健康**：月發案數（早期≥3）/ 配對成功率 fill rate（>70%）/ 配對滿意度（>50%）/ 回購率（>40%）/ 平均發案金額（NT$30K-150K）/ 空配對率（<20%）

**流動性**：發案→配對 <24h / 配對→接案 <48h / 送出→簽約 <7 天。核心指標 Search-to-fill rate >75%（4 案至少 3 案配上人）。

---

## 四、商業指標

| 指標 | 計算 | 資料來源 |
|---|---|---|
| GMV 總成交額 | SUM(commission_records.client_paid_total_ntd) | 需金流閉環（已修）|
| 實收抽佣 | SUM(commission_collected) | commission_records |
| 平均案件金額 | GMV / 完成案數 | contracts |
| Take Rate 實現率 | 實收佣金 /（GMV×tier_rate）| 對帳 |
| CAC | 行銷支出 / 付費 client（現 0、Edward 個人網絡）| 推廣後補 |
| LTV | 平均案額 × 平均案數 × take rate | 需帳號系統 |

Tier 抽佣：A 17% / B 20% / B+ 23%（對標 Fiverr 27.6% / Upwork 20%，合理）

---

## 五、PMF 判定門檻表

### 業界基準（雙邊市集）
Sean Ellis Test ≥40%「非常失望」/ NPS ≥50 強·≥30 站得住 / D90 留存 25-40% / client 回購 >40% / worker 30天留存 >50% / fill rate >75% / GMV Retention >80% / take rate 實現 >90% / 有機成長 >15%

### BeyondPath 分階段

**前 10 案（現況）· 質性優先**：完成 ≥3 案 + 訪談 4/5 說會再來 + NPS≥4.0 + 0 起繞過平台 + 至少 1 金流閉環走通 = PMF 站得住

**10-30 案（3-6 月）**：client 60天回購 >40% + worker 30天留存 >50% + fill rate >70% + 平均案額 >NT$30K + 發案→簽約 >50% + Sean Ellis ≥40%

**30+ 案 / GMV >NT$1M（Scale）**：GMV MoM >20% + take rate 實現 >85% + NPS≥50 + CAC payback <12月 + 有機發案 >30%

---

## 六、每週儀表板（Edward 每週 5 分鐘看一張表）

設計原則：早期用戶少看「絕對數 + 趨勢」，案數 ≥10 才看比率。

```
一、需求漏斗：本週新 brief / 配對成功 / 進邀請 / 簽約 / 累計 GMV
二、供給漏斗：worker pool 總數 / 收邀請 / 接案 / 交付完成
三、北極星：60 天回購 client 數 / worker 30 天留存 / 本週 NPS
四、商業：本週 GMV / 實收佣金 / take rate 實現率
五、警示燈：空配對率>50% / 有繞過平台 / 金流手動件數>0 / admin 異常登入
```

手動可跑查詢（Supabase Studio）：
- 本週發案：`SELECT COUNT(*) FROM client_intakes WHERE created_at >= NOW() - INTERVAL '7 days';`
- 本週簽約：`SELECT COUNT(*) FROM contracts WHERE created_at >= NOW() - INTERVAL '7 days';`
- NPS 平均：`SELECT AVG(score) FROM nps_responses WHERE created_at >= NOW() - INTERVAL '30 days';`
- worker pool：`SELECT COUNT(*) FROM worker_applications WHERE status='approved';`
- 本週 GMV：`SELECT SUM(amount_ntd) FROM payment_intents WHERE status='paid' AND created_at >= NOW() - INTERVAL '7 days';`

---

## 七、缺埋點清單（與技術串接對齊）

**記得到**：發案數 / 簽約數 / worker 認證數 / NPS / milestone 狀態 / 付款確認 / worker tier

**需補（優先序）**：
- P0 ecpay-webhook → commission_records 自動寫（GMV/take rate）— 已修
- P0 nps.html live 確認 — 卡西法確認
- P0 client 帳號系統（回購追蹤前提）— 已做
- P1 worker 邀請 log / 前端 GA4 pageview+click（訪客→brief 漏斗）/ send-decision-email log
- **P1 發案中途放棄埋點（開始填→送出流失率）— 5/30 卡西法補**
- P2 Sean Ellis 問卷觸發（需 ≥40 用戶）/ milestone due_date 填寫

---

## 結論

PMF 能量化，但早期（<10 案）量化是輔助、質性訪談是主體。北極星 = 雙邊 60 天回購率。建帳號系統（doc 28，已做）+ 修金流閉環（doc 33 P0，已修）是追蹤北極星最小前提。達 >40% 回購 + NPS≥4.0 + 有機案件 >30% 三者同時成立 = PMF 站得住。

**早期操作建議**：每案結後 24h Edward 親自電訪雙方 3 問（解決了什麼 / 本來怎麼解決 / 會不會推薦），存進表格，5 案跑一次 theme 抽取。小樣本看「信號一致性」非統計顯著性。

---

Sources: a16z GMV Retention / a16z 13 Marketplace Metrics / Sharetribe Academy / Mercury PMF Guide / Dittofi liquidity / Survicate NPS Benchmarks 2025 / Allied Venture Pre-PMF / Fiverr Q4 2024 / Lenny's marketplace metrics
