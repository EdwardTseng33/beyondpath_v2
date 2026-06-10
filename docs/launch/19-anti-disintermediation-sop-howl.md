# 19 · 防雙方跳過平台 4 防線 SOP + 月繳定價區塊文案 · 霍爾 CPO

**作者**：🧙 霍爾（CPO · Opus 4.7）
**版本**：v1.0 · 2026-05-28
**Trigger**：Edward 5/28 13:00 新軸「防雙方跳過平台」+ 蘇菲 5/28 13:00 給 4 防線判斷
**對應**：file #15 v1.6.0β sprint + file #16 retainer + file #18 金流路徑 D

---

## 0. TL;DR · 4 防線疊加保護

| 防線 | 強度 | 觸發成本 | 主要對抗 |
|---|---|---|---|
| **#1 合約條款**（NDA + 非競業 12 月 + 違約金 ×3）| 法律強制力 | 律師費 NT$ 15-25K | 蓄意繞過 |
| **#2 平台不可替代價值** | 自然黏著 | 持續工程投入 | 「平台只是仲介」誤解 |
| **#3 監測 + 早期偵測** | 行為追蹤 | 系統 logging | 隱性脫離 |
| **#4 自然黏著機制** | retention by design | 產品設計成本 | 一次性流失 |

**核心信念**：4 條防線**疊加保護**、單一防線失效不致命。不靠單一手段、不靠強硬法律壓制（會嚇跑接案者）、不靠純監視（傷信任）、而是讓**留在平台 > 繞過平台**成為雙方理性選擇。

---

## 1. 防線 1 · 合約條款（沙利曼 ship）

### 1.1 NDA 條款

每個 worker apply 通過時必簽：

```
【NDA · 保密協議】

接案者 [Worker 名] 同意：

1. 透過 BeyondPath 認識之客戶資訊（公司名、聯絡方式、案件需求、
   商業機密、提案內容）均屬機密、未經書面同意不得對外揭露。

2. 客戶資訊保密期 = 合作關係結束後 5 年。

3. 違反 NDA、需賠償 BeyondPath 與客戶之直接損失、外加違約金
   = 案款 / 月費之 3 倍。
```

### 1.2 非競業 12 個月條款

每個 worker apply 通過時必簽：

```
【非競業條款】

接案者 [Worker 名] 同意：

1. 透過 BeyondPath 配對之客戶、於合作結束後 12 個月內、
   不得繞過 BeyondPath 平台直接接受該客戶任何形式之服務委託
   （包含但不限於：直接簽約、轉介費、口頭協議、無償服務）。

2. 違反非競業、需賠償 BeyondPath：
   - 違規金額之 3 倍（一次性案參考案款）
   - 或違規金額之 2 倍（retainer 月繳參考 6 個月月費）

3. 12 個月後 = 自動解除、雙方可自由發展業務關係。
```

### 1.3 違約金倍率（沙利曼條款）

| 違規類型 | 違約金 |
|---|---|
| 一次性案繞過簽約 | **案款 × 3** |
| Retainer 月繳繞過簽約 | **6 個月月費 × 2**（≈ 12 個月月費）|
| 客戶資訊外洩 | 損失賠償 + 案款 × 3 |
| 蓄意挖客戶（worker 主動拉走）| 違規金額 × 5 + 終身禁用平台 |

### 1.4 客戶端對等條款

Client 簽案合約必含：

```
【客戶非繞過條款】

客戶 [Client 名] 同意：

1. 透過 BeyondPath 認識之接案者、於合作結束後 12 個月內、
   不得繞過平台直接委託該接案者新案。

2. 違反、需賠償 BeyondPath：
   - 違規案款之 2 倍（一次性）
   - 或 6 個月月費 × 1.5 倍（retainer）

3. 例外：若該接案者已從平台退場（自願離開或被除名）、
   客戶可自由聯絡。
```

### 1.5 沙利曼條款合約位置

- 一次性合約模板（L1）§5「非繞過與保密」
- Retainer 合約模板（L2）§7「非繞過、保密、終止」
- NDA 獨立文件（L3）給 worker 簽 + 客戶簽
- 違約金條款（每份合約都引）

---

## 2. 防線 2 · 平台不可替代價值（霍爾 + 卡西法 ship）

### 2.1 核心信念

合約條款是 deterrent、但**真正讓人不想繞過平台的是「繞過比留下更不划算」**。

### 2.2 4 個不可替代價值

#### A · AI 拆解 + 配對演算法

- Client brief → AI 拆 5 維（vertical / tier / capacity / domain / L_score）
- AI 推薦 top 3 worker + reasoning
- 接案者繞過 = client 下次要自己重新找人、無 AI 輔助
- 客戶繞過 = 找下個案要自己 brief 拆解、無 AI 輔助

**Edward 動**：W3+ Admin Console 顯示「AI 配對 reasoning」給雙方看、強化「平台貢獻」可見性。

---

#### B · 認證 badge（Tier B+ / A 認證）

- Worker 通過 Tier B+ / A 認證 = 平台公開展示徽章
- 繞過平台 = badge 失效、新客戶不會認得他的 Tier
- 客戶找新 worker = 沒平台篩 = 高 risk

**Edward 動**：
- W2-W3 確認 Tier 認證視覺權威性（女巫已 ship `09-tier-visual-hierarchy.md`）
- Tier 證書可下載 PDF（worker 可放 LinkedIn / portfolio）
- LinkedIn / IG 可標 `Certified by BeyondPath Tier B+`

---

#### C · 持續 AI 工具更新（retainer 殺手鐧）

**Retainer 客戶獨享**：
- 每月平台同步更新 AI workflow library
- 接案者拿不到 = 他要自己跑遍 AI tool 更新
- 客戶拿不到 = 他要自己研究哪些 AI 工具更新值得用

**實作**（蘇菲 + 霍爾 W6-W12 ship）：
- 月度「BeyondPath AI Workflow Update」memo（內部 retainer client 獨享）
- 每月新 AI tool / prompt / workflow 介紹 1-3 件
- Retainer worker 也拿（升能力）、但 worker 拿不到 = 工具落後
- 一次性案 client 也拿不到、只能簽 retainer 才有

**這是 retainer 最大差異化**：
- 一次性 = 你拿到的是「過去 AI 能力」
- Retainer = 你持續拿到「最新 AI 能力」

---

#### D · 平台仲裁兜底

- 出包時、Edward 親裁、worker / client 都有保護
- 繞過 = 出包雙方自己處理、無第三方仲裁
- 60 day acceptance dispute 機制（landing Step 09）

**Edward 動**：W4-W6 ship「仲裁 case study」內部文件、讓 worker / client 知道仲裁價值（不是抽象、是真實案例）。

---

## 3. 防線 3 · 監測 + 早期偵測（馬魯克 + 蕪菁頭 ship）

### 3.1 配對後第一個月雙方不能直接交換手機 / LINE

**動機**：第一個月 = 最容易繞過期。雙方還沒建立信任度依賴平台。

**實作**（卡西法 W3-W4 ship）：
- 配對後 30 day 內、worker / client 之間溝通透過平台訊息系統（內建）
- 平台代轉訊息、不顯示對方手機 / LINE / 個人 email
- 30 day 後自動開放（建立信任後雙方主動交換）
- 例外：律師 / 簽合約必要時、Edward 親開白

**訊息系統 spec**：
- worker.html / client.html 各自看到 `messages` tab
- 每個 project 一個 message thread
- 不顯示手機 / LINE / 個人 email（系統 regex 過濾）
- email 通知 fallback：「你有新訊息、請上 BeyondPath 查看」

### 3.2 30 day 觀察期 NPS 隱含偵測

NPS 問卷加 3 個隱含問題（蕪菁頭 W4-W6 ship）：

```
1. 你最近一個月用 BeyondPath 平台訊息系統聯絡接案者 / 客戶幾次？
   [ ] 0-1 次 [ ] 2-5 次 [ ] 6-15 次 [ ] 16+ 次

2. 你是否與接案者 / 客戶在平台外（LINE / 電話 / 私下 email）聯絡？
   [ ] 完全沒有 [ ] 偶爾 [ ] 經常 [ ] 主要管道

3. 你下次有類似需求、會：
   [ ] 透過 BeyondPath 找 [ ] 直接找這位接案者 [ ] 自己找其他人
```

**偵測規則**：
- 問題 2 答「主要管道」 = 高 risk 繞過
- 問題 3 答「直接找這位接案者」 = 已準備繞過

**回應**：
- Edward 親 LINE 客戶：「[Client 名]、看到你跟 [Worker 名] 合作很順、太好了！下次新案歡迎透過平台跑、有 AI 配對 + 60 day 仲裁保護。」
- 不是指責、是溫和提醒平台價值

---

### 3.3 同接案者 1-2 月後接到同類風格案件警示

**動機**：若同 worker 1-2 月後接到「跟之前 client 同 vertical / 同類風格 / 同案款區間」的新案、可能是 client 繞過平台介紹給朋友。

**實作**（蕪菁頭 W6+ ship）：
- Admin Console 跑 cron 每月分析 worker_applications.cases_completed 變化
- 比對新案 vs 過去 3 個月案的：vertical / 案款區間 / brief 相似度
- 相似度 > 70% → flag worker for Edward review

**回應**：
- Edward 親 LINE worker：「[Worker 名]、看你最近接的 [新案 vertical] 跟之前 [舊 client 名] 那個案很像、是同一個圈子的客人嗎？歡迎透過 BeyondPath 介紹過來、平台抽 take rate 但你拿持續 retainer + AI 工具更新。」
- 不是指責、是給 worker 一個「主動拉客回平台」的選擇

---

## 4. 防線 4 · 自然黏著（霍爾 + 蘇菲 ship）

### 4.1 Retainer 月繳天然黏

- 月繳客戶 = 不需要重新發包 = 不會接觸新 worker = 不會被挖
- Retainer 設定每月扣款日 = 自動黏

### 4.2 接案者怕失去 lead pipeline

**動機**：worker 繞過一個 client = 失去整個平台的未來 leads

**實作**：
- Worker apply 通過後、Edward 親口（或 onboarding email）說明：
  ```
  歡迎 [Worker 名] 加入 BeyondPath。
  
  我們是 founder-led 平台、每位通過 worker 都是親自審。
  
  你以後接的案會有兩種：
  1. 平台配對給你的（本身就是合格 client）
  2. 你自己平台外接的（不歸我們管）
  
  但要注意：你透過平台認識的 client、12 個月內不能繞過平台
  直接接他的案——這條合約寫死、違約金案款 × 3。
  
  我們的核心信念是：BeyondPath 給你的是「持續穩定的 lead
  pipeline + AI 工具更新 + Tier badge + 仲裁保護」。
  
  繞過一次 = 你失去整個平台未來 leads。
  留下 = 你拿穩定收入 + 持續升能力 + 平台保護。
  
  自己選。
  ```

### 4.3 第一案高滿意度 = 不想換

**動機**：worker / client 第一案 NPS ≥ 60 = 雙方都不想冒風險換新合作對象

**實作**：
- Edward 親管首 3 案 milestone、確保品質
- NPS 收集後若 ≥ 60、立刻給雙方獨家 retainer 提案（W7 起）
- 高滿意度 = 自然黏

### 4.4 平台社群 / 知識共享

**動機**：worker 不只為了接案、為了「成為 BeyondPath certified worker 圈子的一員」

**實作**（W12+ Y1 後期 ship）：
- Worker 內部 Slack / Discord 群（Edward 親管）
- 月度 AI workflow 分享會（線上 30 min）
- Worker 之間互相介紹案（平台抽 referral fee）

**Y1 不做、Y2 再評估**：BeyondPath worker 年會 / 認證證書授獎典禮

---

## 5. 月繳定價區塊文案 draft（女巫 W3 ship 視覺、卡西法 W4 接 prod）

### 5.1 區塊位置

landing.html · 在現有 step 5「Tier 認證」之後、step 8「60 day acceptance」之前插入新 section

### 5.2 Hero 對比表（中英 dual-label）

```html
<section class="bp-retainer-pricing">
  <div class="bp-section-header">
    <h2>持續交付 vs 一次性發包</h2>
    <p class="muted">Retainer vs One-time projects</p>
  </div>
  
  <div class="bp-pricing-compare">
    <!-- 一次性 -->
    <div class="bp-pricing-card bp-pricing-onetime">
      <div class="bp-pricing-tag">一次性發包</div>
      <div class="bp-pricing-amount">NT$ 30 萬</div>
      <div class="bp-pricing-desc">單一案件交付</div>
      <ul class="bp-pricing-features">
        <li>1 個 specific 交付</li>
        <li>4-6 週時程</li>
        <li>無持續支援</li>
        <li>每次重新磨合</li>
      </ul>
    </div>
    
    <!-- Retainer ⭐ -->
    <div class="bp-pricing-card bp-pricing-retainer bp-pricing-featured">
      <div class="bp-pricing-tag">★ 月繳 Retainer ★</div>
      <div class="bp-pricing-amount">NT$ 3 萬 / 月</div>
      <div class="bp-pricing-desc">年約 NT$ 36 萬 · 含維護</div>
      <ul class="bp-pricing-features">
        <li>每月固定 deliverable + 變動需求彈性</li>
        <li>同一 worker · 不必重新磨合</li>
        <li>AI 工具持續更新（你不用追新）</li>
        <li>月度 check-in + 仲裁兜底</li>
      </ul>
      <button class="bp-cta-primary">成為 BeyondPath retainer 客戶</button>
    </div>
  </div>
  
  <p class="bp-pricing-note">
    月繳客戶比一次性發包 <strong>節省 25-40% 總成本</strong>、
    且持續累積 BeyondPath AI workflow library 獨家更新。
  </p>
</section>
```

### 5.3 4 個 value prop section

```html
<div class="bp-retainer-values">
  <h3>為什麼選 Retainer？</h3>
  
  <div class="bp-value-grid">
    <div class="bp-value-card">
      <div class="bp-value-icon">⚡</div>
      <h4>算力穩定</h4>
      <p>每月固定算力 + 工作者帶寬、不必擔心 peak 期接不到人。</p>
    </div>
    
    <div class="bp-value-card">
      <div class="bp-value-icon">📈</div>
      <h4>持續優化</h4>
      <p>同一 worker 越來越懂你、deliverable 品質月月升、不是換新人從頭學。</p>
    </div>
    
    <div class="bp-value-card">
      <div class="bp-value-icon">🔧</div>
      <h4>維運包含</h4>
      <p>AI workflow 月度更新、bug 即時修、新工具自動套用——平台幫你追新。</p>
    </div>
    
    <div class="bp-value-card">
      <div class="bp-value-icon">🎯</div>
      <h4>彈性需求</h4>
      <p>本月需求變了？變動量在合理範圍內彈性處理、不必重新發單重新議價。</p>
    </div>
  </div>
</div>
```

### 5.4 透明月費表（蘇菲 5/28 12:00 audit §2.5 拆解）

```html
<div class="bp-retainer-breakdown">
  <h3>NT$ 3 萬月費 · 透明拆解</h3>
  
  <table class="bp-pricing-table">
    <thead>
      <tr>
        <th>項目</th>
        <th>金額 NT$</th>
        <th>說明</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Worker 月度交付費</td>
        <td>22,500</td>
        <td>worker 實收（已扣平台 take rate）</td>
      </tr>
      <tr>
        <td>平台媒合 + AI 工具更新</td>
        <td>4,500</td>
        <td>BeyondPath 服務費（17-23% × 月費）</td>
      </tr>
      <tr>
        <td>仲裁準備金</td>
        <td>1,500</td>
        <td>退費 / 爭議備援（未爭議全額退）</td>
      </tr>
      <tr>
        <td>月度 check-in</td>
        <td>1,500</td>
        <td>Edward 親跑 30 min check-in</td>
      </tr>
      <tr class="bp-pricing-total">
        <td><strong>總計</strong></td>
        <td><strong>30,000</strong></td>
        <td><strong>含 5% 營業稅、e-Invoice 月寄</strong></td>
      </tr>
    </tbody>
  </table>
</div>
```

### 5.5 適合 retainer 的 3 vertical + 不適合的 2 vertical

```html
<div class="bp-retainer-fit">
  <h3>Retainer 適合誰？</h3>
  
  <div class="bp-fit-grid">
    <div class="bp-fit-yes">
      <h4>✓ 適合</h4>
      <ul>
        <li>
          <strong>DTC 電商品牌</strong>
          ——每月新品上市、需穩定文案 / 設計 / 自動化
        </li>
        <li>
          <strong>B2B SaaS 創辦人</strong>
          ——持續行銷內容 + AI workflow 自動化 + 客戶 onboarding
        </li>
        <li>
          <strong>設計工作室 / 顧問公司</strong>
          ——AI 工具持續迭代、需固定夥伴跟上新工具
        </li>
      </ul>
    </div>
    
    <div class="bp-fit-no">
      <h4>✗ 不適合</h4>
      <ul>
        <li>
          <strong>一次性活動 / 專案</strong>
          ——短期需求、一次性發包更划算
        </li>
        <li>
          <strong>純探索性需求</strong>
          ——還沒確定要做什麼 AI 交付、先試做一次性案
        </li>
      </ul>
    </div>
  </div>
</div>
```

### 5.6 CTA「成為 BeyondPath retainer 客戶」

```html
<div class="bp-retainer-cta">
  <h3>準備好持續交付了嗎？</h3>
  <p>填客戶 intake、勾選「我想試 retainer 月繳」、我會親 LINE 你 30 min 細聊。</p>
  
  <button class="bp-cta-primary bp-cta-large">
    成為 BeyondPath retainer 客戶
  </button>
  
  <p class="muted bp-cta-note">
    試運期：第一個月不滿意全額退費。
    終止：提前 30 day 通知、無違約金。
  </p>
</div>
```

### 5.7 視覺指引（給女巫）

- 整體區塊用暖琥珀色（與 landing 一致）
- Retainer card 用「featured」效果（陰影 + 邊框 + ★ 標記）
- 對比表用 grid 2 欄、retainer 那邊大 + 亮
- Mobile：堆疊、retainer 在上
- 字體：warm-serif（Georgia / Fraunces · landing 一致）
- 不要用「冷紫 / 簡約 sans-serif」（觸發 v1.0.8 退版 lesson）

---

## 6. 4 防線疊加 risk register

| Risk | 防線命中 | 緩解 |
|---|---|---|
| Worker 蓄意挖客戶 | #1 違約金 × 5 + 終身禁用 | 簽合約時 Edward 親口說明、清晰震懾 |
| Client 私下找 worker 接下個案 | #1 違約金 × 2 + #3 NPS 隱含偵測 | Edward 親 LINE 溫和提醒、不嗆聲 |
| 第一個月私下交換 LINE | #3 平台代轉訊息 | 系統 regex 過濾、30 day 後自動開放 |
| 月繳 client 想自己跟 worker 簽月繳脫平台 | #1 違約金 + #2 AI 工具更新 + #4 retainer 黏 | 4 條疊加 |
| 認證徽章被無視（client 不在乎 Tier）| #2 強化、#4 retainer 黏 | landing 加 case study、Tier 升降故事 |
| 60 day 觀察期過、雙方私下了 | #4 retainer 月繳 + #1 12 個月非競業 | 第一案結案立刻 pitch retainer |

---

## 7. Edward 親動清單

| 動作 | 時間 | 頻率 |
|---|---|---|
| Worker onboarding 親口說 4 防線 | 30 min / worker | W2+ |
| Client 簽合約時 review 非繞過條款 | 10 min / case | W1+ |
| NPS 隱含偵測 review | 1h / 月 | 每月 |
| Worker 相似案 flag review | 30 min / flag | 隨機 |
| 違約 case 法律行動啟動 | 2-4h / case | 罕見 |

---

## 8. 霍爾的策略 verdict

> **4 條防線疊加保護 = retainer 商業模式可行的前提**。

不要靠單一防線。法律壓制太強 = 嚇跑接案者；純監測 = 傷信任；只靠 retainer 黏 = 第一案就有可能流失。

**4 條協同**：
- 防線 1（合約）= deterrent baseline
- 防線 2（平台價值）= 雙方理性留下
- 防線 3（監測）= 偵測異常
- 防線 4（自然黏著）= retention by design

**核心信念**：
- 不是「禁止繞過」、是「讓繞過比留下更不划算」
- 不是「壓制」、是「設計」
- 不是「監視」、是「早期偵測 + 溫和提醒」

—— 🧙 霍爾 · CPO · 2026-05-28

---

## 9. 後續動作

- [ ] Edward 拍板 §1.3 違約金倍率（×3 一次性 / ×2 retainer 月繳）
- [ ] 沙利曼 ship NDA + 非競業 12 月 + 違約金條款（律師 W2-W3 final）
- [ ] 女巫 W3-W4 ship 月繳定價區塊設計（landing.html）
- [ ] 卡西法 W3-W4 接平台代轉訊息系統（30 day 內不交換手機）
- [ ] 蕪菁頭 W4-W6 ship NPS 隱含偵測 3 問題
- [ ] 蕪菁頭 W6+ ship 同接案者相似案 flag cron

---

*v1.0 於 2026-05-28 立 · 配 file #15 v1.6.0β sprint + file #16 retainer BD + file #18 金流路徑 D · 4 防線疊加保護 retainer 商業模式可行性 · 月繳定價區塊文案 ready 給女巫 W3 ship。*
