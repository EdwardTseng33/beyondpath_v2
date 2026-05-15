# 爭議協調 Escalation Playbook v1

> BeyondPath POC 階段內部 playbook · 對外稱「BeyondPath 爭議協調機制」、不揭露人工層
> 處理 worker / client 試做案爭議、累積首 10 案 case study → 系統化進 Q3 escrow

---

## 0 · 設計原則

**對外品牌**：「BeyondPath 爭議協調機制」、看不到人工
**對內運作**：POC 階段 Edward 親裁、累積 case → 寫 SOP → Q3 上線前系統化
**目標**：3-tier escalation、80% 案在 Tier 0-1 解決、Tier 2-3 為最後手段

---

## 1 · Tier 0 · 雙方自行溝通（預設、80% 案在此 tier 解）

**Trigger**：worker / client 對 deliverable / 進度 / 付款有分歧

**BP 介入度**：0%（不介入）

**期望時程**：24-72 hr 雙方溝通

**SOP**：
- 雙方先 email / 視訊溝通
- 用 BP 工具對齊（SOW + 驗收 checklist + 報價單）
- 若 80% 共識 → 簽收 + 部分付款 / 補件 / 結案
- 若 < 80% 共識 → 進入 Tier 1

**Edward 後台動作**：
- 看 Slack `#beyondpath-leads` 該案進度（worker / client 都有 thread）
- 不主動介入
- 若雙方 ping 平台、進 Tier 1

---

## 2 · Tier 1 · BP 協調（user 寄 hello@beyondpath.tw）

**Trigger**：任一方寄信 `hello@beyondpath.tw` 描述爭議 + 對方 cc

**BP 介入度**：30%（提協調方案、不仲裁）

**期望時程**：24-48 hr BP 回應、進入協調對話

**SOP**：

**Step 1 · 收信 + 分類**（Edward 後台、自動 Slack ping）：
- 看雙方立場
- 對齊 SOW + 驗收 checklist + 溝通紀錄
- 分類爭議類型：
  - 規格不符（worker 沒交 SOW 明列項目）
  - 品質爭議（client 主觀不滿意）
  - 進度延遲（worker 或 client 拖時程）
  - 付款爭議（client 拖付 / worker 多算）
  - IP / 授權爭議
  - 其他

**Step 2 · 寄 BP 協調 email 給雙方**（template ready）：
- BP 重述雙方立場、確認沒誤解
- 列爭議點 1-3 個
- 提 3-5 個 **協調方案選項**：
  - A · 部分簽收 + 部分付款（依完成度）
  - B · Worker 補件 + 延期驗收
  - C · 重做 + 期限
  - D · 退案 + 已交付 IP 不轉移
  - E · 各擔一半損失 + 案結
- 雙方各回 BP「同意哪個方案」（或提另案）

**Step 3 · 達成共識 → 案結**：
- BP 寄結案信給雙方
- 紀錄進 `events/dispute-cases/` 內部 log（累積 case study）
- Worker / Client 各自 review 對方（POC 階段 manual）

**Step 4 · 無共識 → 進 Tier 2**

**對外稱呼**：「BeyondPath 爭議協調團隊」/「平台協調機制」、絕不寫「Edward 親自看」

---

## 3 · Tier 2 · BP 仲裁建議（Edward 親裁）

**Trigger**：Tier 1 兩輪協調無共識（≥ 5 工作日）

**BP 介入度**：60%（給仲裁建議、無法律效力）

**期望時程**：5-10 工作日深度 review

**SOP**：

**Step 1 · 深度 review**：
- 取所有原始文件：SOW + 報價單 + 驗收 checklist + email 紀錄 + 視訊摘要 + deliverable 樣本
- 比對 SOW 條款（§2 scope / §3 timeline / §4 payment / §5 IP / §7 termination）
- 找客觀依據：哪邊違 SOW？哪邊主觀？

**Step 2 · 訪談雙方**（POC 階段 Edward 親接）：
- 30 min 個別視訊（worker + client 各一次）
- 對齊事實 / 動機 / 預期
- 中性立場（對外稱「BeyondPath 仲裁團隊」）

**Step 3 · 寫仲裁建議書**（template ready）：
- 案件摘要
- 雙方立場
- 依據 SOW 的客觀判定
- 仲裁方案（5 種）：
  - 1. **支持 worker** · client 全額付 + 接收 deliverable
  - 2. **支持 client** · worker 退已收 + 不轉 IP
  - 3. **部分支持 worker** · client 付 70-80% + 接收（缺項 worker 自擔）
  - 4. **部分支持 client** · worker 補件後 client 付 70-80%
  - 5. **共同擔損** · 雙方各扛一半、案結、不評價
- 雙方 5 工作日內回 BP 是否接受
- 若**雙方都接受** → 案結 + 紀錄 case study
- 若**任一方拒** → 進 Tier 3

**重要聲明**（仲裁書內含）：
- BP 仲裁建議**無法律效力**、為 POC 階段試行協調
- 雙方接受視為自願和解、不代表 BP 為交易主體
- 拒絕仲裁建議可走 Tier 3 法律途徑

---

## 4 · Tier 3 · 法律途徑（最終、< 5% 案到此 tier）

**Trigger**：Tier 2 仲裁建議任一方拒絕

**BP 介入度**：0%（提供文件、不代表任一方）

**SOP**：

**Step 1 · BP 寄總結信給雙方**：
- 整個爭議過程紀錄
- BP 仲裁建議書
- 雙方溝通紀錄
- 提醒：**契約直接在 worker / client 間成立、BP 不為交易主體**

**Step 2 · 雙方自行尋律師**：
- BP 不推薦律師、不代表任一方
- 平台合約聲明：爭議由台灣台北地方法院為第一審管轄法院（sulima audit §530）
- BP 可作為「第三方證據提供方」、不擔保提供文件對某方有利

**Step 3 · BP 內部紀錄 + 雙方暫停 BP 服務**：
- 紀錄爭議至雙方 BP profile（內部、不公開）
- Worker 該案不入 portfolio
- Client 暫停下次 intake（直到爭議解）

---

## 5 · POC 階段 Edward 親裁規則

**首 5 案**：
- Edward 親跑全程、每案 ≥ 5 hr Edward 直接時間
- 案結後寫 1 頁 case study：時間軸 / 雙方立場 / 對齊點 / 仲裁方案 / 學到的事
- 紀錄至 `events/dispute-cases/case-YYYY-MM-DD-XXX.md`

**5 案後**：
- Edward review 5 case study、抽 common pattern
- 寫成 `docs/playbooks/dispute-escalation-v2.md`（patterns + 對應方案）

**10 案後**：
- 評估自動化潛力：
  - Tier 0 自然解決 % → 預期 60-80%
  - Tier 1 BP 協調共識率 → 預期 70-90%（協調後雙方共識）
  - Tier 2 仲裁接受率 → 預期 50-70%
  - Tier 3 法律 → 預期 < 5%
- 若 Tier 1 共識率 > 80% → 該 tier 可半自動化（template 對話 + Edward review final）
- 若 Tier 2 仲裁接受率 > 70% → 紀錄為 stable case base、可考慮 Q3 開放 community 仲裁員

**Q3 上線前升級**：
- 接 escrow → 改變遊戲規則（Tier 0-1 大幅減少、payment-side dispute 變主流）
- 自動化 Tier 1 對話 model
- Marketplace 公開仲裁員（社群 / 外部專家）

---

## 6 · Email template（Tier 1 / Tier 2 用）

### Tier 1 · BP 協調開場 email

```
Subject: [BeyondPath 爭議協調] 案件 BP-TRIAL-[編號] · 協調方案

[Worker name] 跟 [Client name] 你們好，

BeyondPath 收到雙方對試做案 BP-TRIAL-[編號] 的爭議反映。

我們已 review SOW + 驗收 checklist + 雙方溝通紀錄、整理如下：

▍爭議點
1. [具體爭議 1]
2. [具體爭議 2]

▍協調方案（請雙方各回信告訴 BP 同意哪個或提另案）

A · 部分簽收 + 部分付款（client 付 70%、worker 接收）
B · Worker 補件（[X] 工作日內）+ 延期驗收
C · Worker 重做（[Y] 工作日內）
D · 退案 + 已交付 IP 不轉移
E · 案結 + 各擔一半損失

請於 5 工作日內回覆。若無共識、可申請進入 BP 仲裁建議流程。

— BeyondPath 爭議協調團隊
hello@beyondpath.tw
```

### Tier 2 · BP 仲裁建議書 email

```
Subject: [BeyondPath 仲裁建議] 案件 BP-TRIAL-[編號] · 仲裁書

[Worker name] 跟 [Client name] 你們好，

BeyondPath 已 review 案件 BP-TRIAL-[編號] 的全部資料、出具仲裁建議書。

▍案件摘要
[2-3 句]

▍雙方立場
Worker：[立場]
Client：[立場]

▍依據 SOW 的客觀判定
[依 SOW §X 條款 + 驗收 checklist 結果]

▍BP 仲裁建議
[5 種方案中選 1]：[具體執行步驟 + 時程]

▍法律聲明
本仲裁建議**無法律效力**、為 BeyondPath POC 階段試行協調。
雙方接受視為自願和解、契約直接在 worker / client 間成立、BeyondPath 不為交易主體。

請於 5 工作日內回信 hello@beyondpath.tw 告知是否接受。

— BeyondPath 仲裁團隊
```

---

## 7 · 跟既有 docs 對齊

| 既有 doc | 引用點 |
|---|---|
| `docs/business-model-poc-v1.md` §3 | 整體 3-tier 架構 |
| `docs/templates/sow-trial-project.md` §6 §7 | 平台角色聲明 + 終止條款 |
| `docs/templates/delivery-acceptance-checklist.md` §5 | Tier 0 → Tier 1 trigger |
| `docs/launch/02-trust-audit-suliman.md` §530 | 法律基底：台北地院仲裁 |
| `docs/launch/04-launch-roadmap-howl.md` U4 | 風險：第一個試做案出包 |

---

*v1 · 2026-05-15 · BeyondPath POC 階段內部 playbook · 對外稱「BeyondPath 協調機制」*
*累積 5 / 10 案後寫 v2 / v3、Q3 上線前接 escrow 後寫 v4*
