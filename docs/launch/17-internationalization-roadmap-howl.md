# 17 · Internationalization Roadmap · Y1 純台灣 → Y3 跨國 · 霍爾 CPO

**作者**：🧙 霍爾（CPO · Opus 4.7）
**版本**：v1.0 · 2026-05-28
**Trigger**：Edward 5/28 13:00 新軸「跨國界 Y2 路線」+ 蘇菲 5/28 13:00 給判斷：Y1 純台灣 / AI 翻譯只開「布告欄」層級
**對應**：5/28 audit Beta POC + file #15 v1.6.0β sprint

---

## 0. TL;DR · Y1/Y2/Y3 三階梯

| 年度 | 範圍 | 核心動作 | 不做 |
|---|---|---|---|
| **Y1（2026 Q3-Q4）** | 純台灣 | 中文預設、英文 dual-label、worker 個人頁可雙語、客戶 intake「歡迎國外接案者投件」checkbox + 明文聲明 | 海外簽約 / 海外金流 / 海外仲裁 |
| **Y2（2027）** | + 新加坡（SG）| SG 子站獨立合約 / 金流（Stripe Connect SG）/ 法律 / 跨境稅 GST 9% | MY / TH / VN 不開 |
| **Y3（2028）** | + 馬來西亞（MY）| MY 子站（FPX 金流 / SST 6%）| 其他東南亞市場 |

**霍爾 核心 thesis**：Y1 別跨國、跨國是 Y2 累積 100 真實案後才該談的事。但 Y1 要留**國際接案者投件入口**——這個是「布告欄」層級、不擾動主合約金流、且有 BD narrative 價值（「BeyondPath 是台灣品牌的 AI 交付窗口、也接國際接案者參與」）。

---

## 1. Y1（2026 Q3-Q4）· 純台灣 + 國際 worker 投件入口

### 1.1 主軸

- **預設語言**：繁體中文
- **法律 / 金流 / 仲裁**：全部台灣
- **真實簽約對象**：台灣公司 + 台灣 / 國際 worker（但合約地 = 台灣、適用台灣法）

### 1.2 國際 worker 投件入口（Y1 即開）

**動機**：
1. 台灣 AI 工作者池有限（5/27 audit 合格 3 位、扣 W01/W03/W06 後 pool 不多）
2. 有國際野心的台灣 worker 可雙語呈現 = profile 升級
3. 接到國際 AI 工作者投件 = BeyondPath narrative 升級（「不只台灣、也接國際」）
4. 不需開新法律 / 金流 = 邊際成本接近 0

**實作**（女巫 + 卡西法 W3-W4）：

#### A · Worker apply 流程加雙語選項
- worker 個人頁可填中英文雙版 bio + portfolio
- Tier B+ / A 升 worker 可標「Bilingual」/「International ready」badge
- Worker 個人頁 URL 可加 `?lang=en` query 開英文版

#### B · Client intake 加「歡迎國外接案者投件」checkbox
- intake 表單最後加 1 個 checkbox：「□ 我歡迎國外（非台灣）接案者投件這個案」
- 預設 unchecked、Edward / 演算法只 match 台灣 worker
- 若 checked → 國際 worker 也進候選池

#### C · 平台明文聲明（沙利曼條款 · file #18 對應）
landing footer + 客戶 intake 完成頁加聲明：

> 「BeyondPath 為台灣登記之服務、所有簽約 / 付款 / 仲裁適用台灣法律。歡迎國際接案者參與投件、但合約一律以台灣為地、客戶與接案者簽訂之合約適用台灣個資法、公平交易法、消保法等。」

### 1.3 英文 dual-label 範圍（landing 已有）

5/27 audit 顯示 landing 已有部分英文 dual-label（如 hero 標語）。Y1 不擴大、維持現狀 + 加：
- worker 個人頁可選英文模式
- client intake「歡迎國外接案者投件」一句英文 tooltip

### 1.4 AI 翻譯只開「布告欄」層級

蘇菲 5/28 13:00 判斷：AI 翻譯只用在**單向溝通**（worker 個人頁、案件 brief 描述、客戶 intake 描述）、不用在**雙向協商**（合約條款、milestone 驗收、付款協議、爭議處理）。

**理由**：AI 翻譯出包 = 法律糾紛 risk High（同一條款中英文意思不同 = 合約解釋衝突）。Y1 任何法律 / 金流 / 爭議文件全用中文 + Edward 親翻譯 / 律師審。

---

## 2. Y2（2027）· + 新加坡子站

### 2.1 觸發條件（Y1 結束 12/31 評估）

**必達 5 條才推 Y2 SG**：

1. Y1 累積真實案 ≥ 100 個（POC 已過 ramp-up）
2. Y1 retainer 客戶 ≥ 10 個（持續性買單已驗）
3. 國際投件率 ≥ 15%（國際 worker 投到「歡迎國外接案者」案的比例）
4. 國際 worker pool 累積 ≥ 30 位合格（自然累積、非主動招）
5. 真實國際客戶詢問 ≥ 20 次「我可不可以用 BeyondPath 找台灣以外 worker」

若 < 5 條 → Y2 仍純台灣、延 Y3 再評估 SG。

### 2.2 SG 子站架構

**獨立元素**：
- 公司：BeyondPath SG Pte Ltd（新加坡子公司、ACRA 登記）
- 法律：新加坡 PDPA（個資）/ Sale of Goods Act / Misrepresentation Act
- 金流：Stripe Connect SG（30/30/40 split 直付 worker）
- 稅務：GST 9%（2024 起）
- 仲裁：SG SIAC（小額爭議走 CCG）
- 域名：beyondpath.sg（or beyondpath.com 區域分流）

**共享元素**：
- Product UX / brand
- Worker pool（跨站可見、但簽約照子站）
- Admin Console（Edward 看全球、子站分頁）

### 2.3 Y2 估算

- 開 SG 子公司：~SGD 1,500-3,000（ACRA 登記 + Nominee Director）
- Stripe Connect SG 設定：~1 週工程 + Stripe KYC
- 律師費：~SGD 5,000-10,000（首次 PDPA + 合約 SG 版）
- Y2 總 setup：**~SGD 10,000-15,000（NT$ 24-36 萬）**
- Y2 目標：SG 案 ≥ 20 個、SG 客戶 ≥ 10 個

### 2.4 Y2 時程概念

```
Q1（1-3 月）· 評估 + 子公司開設
Q2（4-6 月）· 法律 + 金流 + 子站 implement
Q3（7-9 月）· 首批 SG worker / client BD
Q4（10-12 月）· 累積至 20 案 / 10 客戶 evaluate
```

---

## 3. Y3（2028）· + 馬來西亞子站

### 3.1 觸發條件

Y2 SG 累積至 ≥ 50 案 / ≥ 25 客戶後評估 MY。

### 3.2 MY 子站架構

- 公司：BeyondPath MY Sdn Bhd（馬來西亞 SSM 登記）
- 法律：馬來西亞 PDPA 2010 / Contracts Act
- 金流：FPX（馬來西亞銀行金流）+ Stripe Connect MY
- 稅務：SST 6%
- 仲裁：AIAC（亞洲國際仲裁中心 KL）
- 域名：beyondpath.my

### 3.3 不開的市場

Y3 後評估再開、本 roadmap 不涵蓋：
- 泰國（金流 / 法律複雜、人均 GDP 低 BeyondPath 客單價對不到）
- 越南（同上）
- 印尼（同上）
- 菲律賓（同上）
- 香港（Y2-Y3 觀察、若 SG 順可考慮加 HK 但 region 法律敏感）

---

## 4. Y1 → Y2 升級觸發信號（5 個必看）

監控 dashboard（蕪菁頭 + 蘇菲負責、月度 review）：

| 信號 | Y1 基線 | Y2 觸發閾值 | 衡量 |
|---|---|---|---|
| **月案量** | < 5 / 月 | ≥ 15 / 月（連續 3 月） | projects count |
| **Retainer 客戶數** | 1-3 | ≥ 10 | retainer contracts active |
| **國際投件率** | 0% | ≥ 15% | int'l worker apply / total |
| **國際客戶詢問** | 0-2 / 月 | ≥ 5 / 月（連續 3 月） | intake source = int'l |
| **Worker pool 國際比例** | < 5% | ≥ 25% | profiles.country != TW |

**這 5 條同時達 3+ 個 = 觸發 Y2 SG evaluation**。

---

## 5. 跨國法律 risk register

| Risk | Y1 緩解 | Y2 緩解 |
|---|---|---|
| 國際 worker 拿台灣案、稅務問題（worker 不在台灣）| 合約寫死：worker 自負所在國稅務、平台只代開台灣發票 | SG / MY 子站各自處理 |
| 國際 client 拿台灣 worker、消費糾紛 | Y1 不開海外 client 簽約、只開海外 worker 投台灣案 | SG / MY 子站 |
| GDPR 適用（歐洲 worker / client）| Y1 不收歐洲 worker / client | Y2-Y3 不擴歐洲 |
| 跨境匯款 KYC / AML | Y1 平台不持有客戶款（路徑 D、file #18）= 不觸發 KYC/AML | Y2 Stripe Connect 處理 |
| 跨境合約適用法衝突 | Y1 一律台灣法 + 仲裁地台北 | Y2 SG 子站適用 SG 法 |
| 跨境支付幣別 / 匯率 | Y1 全 TWD | Y2 SGD / MYR / USD |

---

## 6. Edward 拍板 · Y1 國際入口要不要開

**選項**：

- A · ⭐ **Y1 開「國際 worker 投件入口」**（不開海外簽約 / 不開海外 client）
- B · Y1 完全純台灣（國際入口推遲到 Y2）
- C · Y1 開「國際 client 投案入口」（風險高、不建議）

**霍爾建議 A**：
- 邊際成本 ~0（女巫 + 卡西法 W3-W4 約 8-10h work）
- BD narrative 升級（「台灣品牌的 AI 交付窗口、接國際 worker」）
- 累積 Y2 觸發信號（國際投件率）
- 不擾動主合約 / 金流 / 法律
- worker pool 自然擴大

**影響**：W3-W4 是否要 ship 國際 worker 投件 + checkbox。

---

## 7. 對 Edward 的話

Edward、跨國這件事是**Y2 才該談的策略題、不是 Y1 該動的事**。

Y1 你只要做兩件：
1. **純台灣跑通**——案 100 個、retainer 10 個、雙邊 NPS ≥ 60
2. **國際入口留著**——worker 投件 + client checkbox + 明文聲明、不擾動主合約

到 Y1 結束評估 5 個觸發信號、達 3+ 個 = Y2 SG 子站推；< 3 個 = 繼續純台灣、延 Y3。

不要在 Y1 就「為了海外」做任何法律 / 金流 / 子公司動作。那會分散注意力、燒錢、慢主軸。

—— 🧙 霍爾 · CPO · 2026-05-28

---

## 8. 後續動作

- [ ] Edward 拍板 §6 國際 worker 投件入口開不開
- [ ] 若開 A → 派女巫 + 卡西法 W3-W4 ship
- [ ] 沙利曼 ship 平台聲明文字（file #18 §平台不持有金流聲明 同步寫）
- [ ] 蕪菁頭 monthly dashboard 加 5 個 Y1→Y2 觸發信號

---

*v1.0 於 2026-05-28 立 · 配 file #15 v1.6.0β sprint · 跨國 roadmap Y1/Y2/Y3 三階梯 · 下次 update 觸發：Y1 結束評估或 5 個信號中 3+ 達標時。*
