# 18 · Payment Flow SOP · 平台不持有金流（路徑 D）· 霍爾 CPO

**作者**：🧙 霍爾（CPO · Opus 4.7）
**版本**：v1.0 · 2026-05-28
**Trigger**：Edward 5/28 13:00 新軸「簽約金 → 約定期款流程文件」
**對應**：沙利曼路徑 D（平台不碰錢）+ file #15 v1.6.0β sprint
**法律意義**：**平台不持有客戶款 = 不觸發《銀行法》《電子支付機構管理條例》《信託業法》**

---

## 0. TL;DR · 兩種案型金流

| 案型 | 金流路徑 | 平台 take rate | 觸發金融法？ |
|---|---|---|---|
| **一次性案** | 客戶 → 接案者帳（直付）· 4 階段（30/30/40 + take rate）| 17-20% × 案款 | ❌ 否 |
| **Retainer 月繳** | 客戶綁卡（綠界定期扣款）→ 接案者帳（直扣）| 17-23% × 月費 | ❌ 否 |

**核心信念**：平台**完全不持有客戶款**。客戶錢直接付給接案者、接案者收到後再轉 take rate 給平台。這是 Y1-Y2 的設計、Y3+ 流水 ≥ NT$ 500 萬月才評估真實 escrow / 第三方託管。

---

## 1. 一次性案金流 · 4 階段 SOP

### 1.1 流程圖

```
[1] 配對成功
       ↓
[2] 雙方簽合約
   ├─ Beta 階段：Google Docs 雙簽 + LINE 截圖
   └─ 上線後：法樂 e-Sign（電子簽 · NT$ 300/合約）
       ↓
[3] 簽約金 30%
   客戶 → 接案者銀行帳（不經平台）
       ↓
[4] Kickoff 開工
   接案者收到 → 平台看板登記 milestone 1
       ↓
[5] 中期款 30%
   Milestone 1 驗收後、客戶 → 接案者
       ↓
[6] 結案款 40%
   最終交付 + 客戶確認、客戶 → 接案者
       ↓
[7] 平台 take rate 17-20%
   接案者結案後 → 平台帳戶轉 take rate
   （不是客戶付平台、平台不持有客戶款）
       ↓
[8] 平台代開「服務費發票」給接案者
   接案者拿來抵稅、含營業稅 5%
```

### 1.2 階段 SOP 細節

#### 階段 1 · 配對成功 → 雙方簽合約

**Edward / Admin Console 動**：
- 配對成功後、admin.html projects tab 切「sow_signed pending」
- 系統自動發信給雙方（worker + client）：
  - 標題：`[BeyondPath] 配對成功 · 合約準備中`
  - 內容：合約範本下載連結 + Edward LINE / Phone
- Edward 親 LINE 雙方安排簽約時間

**Beta 階段簽約**（W1-W6）：
- Google Docs 合約模板（含 IP 三段式 + DPA §27 + 平台角色 + NDA + 違約金）
- 雙方各自下載、簽名（手寫或電簽都可）、LINE 截圖回傳給 Edward
- Edward 存檔到 Supabase Storage `contracts/<project_id>/`

**上線後簽約**（W7+）：
- 法樂 e-Sign 整合（NT$ 300 / 合約 · 跨平台電子簽法律效力 OK）
- 自動歸檔到 Supabase Storage

**沙利曼合約必含條款**（5 件 · file #15 §2 軸 B）：
- IP 三段式（前期 client / 中期 共有 / 後期 client）
- DPA §27 個資處理
- 平台角色聲明（媒合非服務提供者、責任上限 = 平台 take rate 2 倍）
- NDA + 非競業 12 個月
- 仲裁地台北 + 適用台灣法

---

#### 階段 2 · 簽約金 30%（客戶 → 接案者）

**客戶動**：
- 合約簽完後 7 個 work day 內、客戶 ATM / 銀行轉帳到接案者帳戶
- 接案者帳戶 = worker 在 apply 時填的銀行帳號（已 admin 審）
- 轉帳備註：`BP-<project_id>-簽約金`

**接案者動**：
- 收到後 24h 內、Admin Console 看板 click 「簽約金已收」按鈕
- 系統自動 update `projects.metadata.payment_stage_1 = received_at`
- 系統發信通知 Edward + Client：
  - 標題：`[BeyondPath] 簽約金已到位 · Kickoff 啟動`

**Edward 動**：
- 收到通知後、Slack `#移動城堡` 看到 ack
- 不需介入、除非接案者 48h 後仍未確認（系統自動 alert Edward）

**訊息模板**（Edward → Client、簽約完）：
```
[Client 名]、合約簽完了！

接下來：
1. 請你 7 個 work day 內把簽約金 NT$ X（案款 30%）轉到接案者 [W01 名]
   的帳戶 [銀行 / 帳號]
2. 備註寫：BP-[project_id]-簽約金
3. 接案者收到會在平台 ack、我會 LINE 你確認 kickoff 日期

任何問題隨時 LINE 我。
```

**訊息模板**（Edward → Worker、簽約完）：
```
[Worker 名]、合約簽完了！

接下來：
1. Client 7 day 內會匯簽約金 NT$ X 到你的帳戶
2. 收到後請去 Admin Console 看板 click「簽約金已收」
3. 然後跟 Client 約 kickoff 日期、開始 milestone 1

我會 LINE 你 ack 提醒。
```

---

#### 階段 3 · Kickoff 開工 → Milestone 1

**接案者動**：
- Admin Console 看板填 milestone 1 spec：
  - title / scope / acceptance criteria / due_at
- 按 milestone 推進交付、達標後上傳 deliverable_url + note
- 通知 Client 驗收

**Client 動**：
- 收到 milestone 1 交付通知（系統信）
- 客戶後台 client.html 看 deliverable、點 ✓ 驗收 / ✗ 退回
- 驗收 → 系統 update `project_milestones.client_ack_at`

---

#### 階段 4 · 中期款 30%（客戶 → 接案者）

**觸發**：Milestone 1 client 驗收後

**客戶動**：
- 收到中期款催收信（系統自動發、milestone 1 驗收後 24h）：
  ```
  [Client 名]、Milestone 1 已驗收 ✓
  
  請 7 個 work day 內匯中期款 NT$ Y（案款 30%）到接案者帳戶。
  備註寫：BP-[project_id]-中期款
  ```
- ATM / 銀行轉帳

**接案者動**：
- 收到後 Admin Console click「中期款已收」、系統發 ack
- 啟動 milestone 2

---

#### 階段 5 · 結案款 40%（客戶 → 接案者）

**觸發**：最終交付 + 客戶確認 accepted

**客戶動**：
- 最終 milestone 驗收後、catch 中期款一樣流程
- 結案款 NT$ Z（案款 40%）匯接案者

**接案者動**：
- 收到後 click「結案款已收」
- 系統 update `projects.status = 'accepted'`、`projects.accepted_at = now()`
- 觸發雙邊 NPS 收集（client + worker 各填 0-10 score + comment）

---

#### 階段 6 · 平台 take rate（接案者 → 平台）

**觸發**：結案款入帳後 14 個 work day 內

**接案者動**：
- 接案者結算總案款（NT$ X + Y + Z = 100% 案款）
- 平台 take rate 17-20%（依 Tier / 案型）
- 接案者 ATM / 銀行轉帳到平台帳戶
- 平台帳戶 = Edward 個人行號 / 公司戶（依登記進度）
- 備註：`BP-<project_id>-takerate`

**平台動**：
- Admin Console 對帳：每月 1 號跑 cron、列出上月所有 status=accepted 案、檢查 take rate 是否到位
- 未到位 → Edward 親 LINE 接案者催收（30 day grace）
- 60 day 仍未到位 → 暫停接案者下次配對 + 索賠

**take rate 規則**（依 Tier）：

| Worker Tier | Take Rate |
|---|---|
| B（起步）| 20% |
| B+（進階）| 19% |
| A（資深）| 18% |
| A+（大師）| 17% |

**目的**：高 Tier worker 拿 take rate 折扣激勵升級。

---

#### 階段 7 · 平台代開「服務費發票」給接案者

**動作**：
- 接案者付完 take rate 後、平台代開「BeyondPath 服務費」發票給接案者
- 發票項目：「BeyondPath 配對 + 平台服務費 / 案號 BP-<project_id>」
- 發票金額：take rate × 案款（含營業稅 5%）
- 接案者拿這張發票抵自己的營業稅 / 所得稅

**法律意義**：
- 平台向接案者收 take rate = 服務費（B2B 服務）
- 客戶向接案者付案款 = 接案者本業收入（接案者自開發票給客戶）
- **客戶不付平台、平台只跟接案者交易 = 平台不持有客戶款** ✅

---

## 2. Retainer 月繳金流 SOP

### 2.1 流程

```
[1] Retainer 合約簽訂
   雙方雙簽 + Edward 親見證
       ↓
[2] 綠界定期扣款設定
   Client 綁卡（信用卡或自動扣款）
       ↓
[3] 每月扣款日（合約寫死、例：每月 5 日）
   綠界自動扣 NT$ X 萬 → 接案者帳戶（不經平台）
       ↓
[4] 接案者每月固定日轉 17-23% × 月費給平台
   合約寫死、例：每月 15 日
       ↓
[5] 平台代開「服務費發票」給接案者（月度）
       ↓
[6] 月度 check-in（30 min · Edward 親跑首 3 月）
   評估 deliverable / NPS / renewal signal
       ↓
[7] 終止條件
   ├─ 試運 month 1 不滿意 → 全額退費
   ├─ Month 2+ 提前 30 day 通知 → 無違約金
   └─ Worker 違反 SLA → client 可立即終止 + 退費
```

### 2.2 綠界定期扣款設定（W5 卡西法 ship）

**為什麼綠界**：
- 台灣 SaaS 普遍用
- 信用卡 / ATM 自動扣款都支援
- API 文件成熟、卡西法 W5 可接
- 手續費：每筆 2.55% + NT$ 5（信用卡）/ NT$ 10（ATM）

**設定流程**：
1. Edward 開綠界商家帳號（NT$ 0 月費 · 抽手續費）
2. 卡西法接 API：client 信用卡綁定 → 每月自動扣款
3. 扣款成功 → 直接匯接案者帳戶（綠界支援 split payment 直給接案者）
4. 平台不持有現金、只拿 take rate 月度結算

**Edward 動**：W5 親開綠界商家帳號（30 min · 卡西法陪）

### 2.3 Take Rate 月度結算

**Retainer take rate**（依 Tier）：

| Worker Tier | Take Rate |
|---|---|
| B（起步）| 23% |
| B+（進階）| 21% |
| A（資深）| 19% |
| A+（大師）| 17% |

**計算範例**（NT$ 3 萬月費 · Tier B+）：
- 月費 NT$ 30,000
- 接案者收：NT$ 30,000（扣綠界手續費 NT$ 770 後 NT$ 29,230）
- 接案者轉平台 take rate：21% × NT$ 30,000 = NT$ 6,300
- 接案者實收：NT$ 29,230 - NT$ 6,300 = **NT$ 22,930**
- 平台實收：NT$ 6,300（扣自家稅後約 NT$ 5,000）

### 2.4 退費 SOP

**試運 month 1 退費**：
- Client 在 month 1 結束前提出不滿意 → 平台代協調退費
- 退費路徑：接案者 → client 全額退（NT$ X 萬）
- 平台不抽 take rate（month 1）
- 沙利曼 retainer 合約寫死此條款

**Month 2+ 提前終止**：
- 提前 30 day 通知 → 終止當月 retainer 服務
- 終止月 take rate 按比例計（例：終止當月已過 15 day → 50% × take rate）

---

## 3. 平台不持有客戶款 · 法律聲明

### 3.1 為什麼這樣設計

**台灣《銀行法》第 29 條**：「除法律另有規定者外、非銀行不得經營收受存款、受託經理信託資金、公眾財產或辦理國內外匯兌業務。」

**平台若持有客戶款（escrow）**：
- 可能被認定為「準存款」/「信託」/「第三方支付」
- 需向金管會申請「電子支付機構執照」（資本額 NT$ 5 億）
- 或走「電子票證」（資本額 NT$ 3 億）
- BeyondPath Y1-Y2 階段 = **無法達到**

**平台不持有客戶款（路徑 D）**：
- 客戶直接付接案者
- 平台只跟接案者收 take rate（B2B 服務）
- = 完全不觸發《銀行法》《電子支付機構管理條例》
- = Y1-Y2 完全合法、無需特許執照

### 3.2 公開聲明（landing footer + intake page）

沙利曼必 ship：

```
【BeyondPath 平台服務聲明】

BeyondPath 為媒合平台、不是服務提供者。

✓ 客戶與接案者之合約由雙方直接訂立、適用台灣法律
✓ 案款 / 月費由客戶直接付給接案者、BeyondPath 不持有任何客戶款項
✓ BeyondPath 向接案者收取媒合服務費（take rate 17-23%）
✓ 如有爭議、BeyondPath 提供仲裁服務、仲裁地 = 台北
✓ BeyondPath 責任上限 = 平台 take rate 之 2 倍

接案者所收款項屬其本業收入、需自行報稅；
BeyondPath 代為提供配對與服務、不擔保交付品質之最終結果，
但提供 60 day 內爭議仲裁與必要時介入協調。
```

---

## 4. 接案者違反不付 take rate 的處理

### 4.1 30 day 內未付

- 系統自動每週發 reminder（接案者 email）
- Edward 不介入、純自動化

### 4.2 30-60 day 未付

- Edward 親 LINE：
  ```
  [Worker 名]、上月案款 BP-[project_id] 的 take rate NT$ X 還沒進來。
  
  請 7 day 內處理、有問題隨時 LINE。
  ```
- Admin Console worker_applications.cases_disputed += 1（觸發 Tier 降級評估）

### 4.3 60-90 day 未付

- Edward 親電話催 1 次
- Admin Console 暫停接案者下次配對（status = 'suspended'）
- 接案者 profile 加「Take rate outstanding」flag（內部可見）

### 4.4 90 day+ 未付

- 啟動法律行動：
  - 沙利曼 + 律師發存證信函
  - 律師費 NT$ 5-10K（從 take rate 索賠）
  - 必要時走台北地院小額訴訟（NT$ 10 萬以下案款適用）

### 4.5 預防勝於追討

- 合約寫死：take rate 30 day 內付清、逾期 1.5% / 月利息
- Worker apply 時 KYC 嚴：銀行帳戶 + 身分證 + 簽 take rate 條款
- Admin 月度對帳：早偵測、早催收

---

## 5. Beta 階段（W1-W6）vs 上線後（W7+）差異

| 元素 | Beta（W1-W6）| 上線後（W7+）|
|---|---|---|
| 合約簽 | Google Docs + LINE 截圖 | 法樂 e-Sign |
| 客戶付款 | ATM 手動轉 + LINE 截圖 ack | 同上 / 或考慮 Stripe（不 escrow、純 payment gateway）|
| Retainer | 綠界定期扣款 | 同 / 或多加 Stripe Subscription |
| 對帳 | Edward 親每月手動 check Admin Console | 卡西法接 cron 自動 reconcile |
| 發票 | Edward 手開（個人行號）| 公司戶 + 雲端發票（綠界 / ezPay） |

---

## 6. Edward 親動清單

| 動作 | 時間 | 頻率 |
|---|---|---|
| 簽合約見證 | 30 min / 案 | W1+ |
| LINE 客戶催收簽約金 | 5 min / 案 | W1+ |
| 接案者 take rate 催收（30+ day 未付）| 10 min / 案 | 每月 |
| 開綠界商家帳號 | 30 min | W5 一次性 |
| 月度對帳 review | 1h | 每月 1 號 |
| 退費 / 終止 case 協調 | 1-2h / 案 | 隨機 |

**估 Edward 總親動**：W1-W12 約 **20-40 h**（不含案數 scaling）

---

## 7. 霍爾的策略 verdict

> **平台不持有金流 = Y1-Y2 唯一合法路徑**。

不要在 Y1 就想做「真實 escrow / 第三方託管」。那需要：
- 電子支付機構執照 NT$ 5 億資本
- 或信託業執照（更難）
- 或跟銀行合作信託專戶（流程慢、手續費高）

**Y1-Y2 用路徑 D**：
- 完全不持有客戶款
- 平台只跟接案者收 take rate（B2B 服務）
- 邊際成本 ~0、邊際法律風險 ~0

**Y3+ 評估升級**：
- 月流水 ≥ NT$ 500 萬 + 累積爭議 ≥ 5 個 = 評估真實 escrow
- 屆時可考慮與第三方支付（綠界 / 藍新）合作 escrow 專戶

—— 🧙 霍爾 · CPO · 2026-05-28

---

## 8. 後續動作

- [ ] Edward 拍板：簽合約用 Beta（Google Docs）還是直接上 e-Sign（NT$ 300 / 合約）
- [ ] 沙利曼 ship 平台不持有金流聲明（landing footer + intake page）
- [ ] 卡西法 W5 接綠界定期扣款 API
- [ ] 馬魯克 ship 月度對帳 SOP（Admin Console + cron）
- [ ] Edward W5 開綠界商家帳號

---

*v1.0 於 2026-05-28 立 · 配 file #15 v1.6.0β sprint + file #16 retainer BD · 平台不持有金流路徑 D 寫死 · Y1-Y2 完全合法 · Y3+ 才評估真實 escrow。*
