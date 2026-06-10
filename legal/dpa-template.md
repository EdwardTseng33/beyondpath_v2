# BeyondPath · Data Processing Agreement (DPA) Template

> ⚠ **PMF 階段不外送律師、接 SI 案前自審 + 蘇菲 + 霍爾 ack 後簽**
> （Edward 5/28 拍板律師全停 · 城堡自治）
>
> **本模板僅在以下條件啟用**：
> - 客戶為企業 / 公司 / 政府機構（非個人）
> - ACV ≥ NT$ 100,000
> - 客戶明確要求 DPA / 涉 GDPR / 涉客戶端 PII 委託處理
> - 接 SI（系統整合）案、Beta POC 不主動上 DPA
>
> Beta POC 一般 client / worker 簽 terms.html + privacy.html 即足、不另簽 DPA。

---

**版本**：v1.0（Beta POC · Template）
**最近更新**：2026-05-28
**作者**：BeyondPath（Edward Tsai · 個人營業者）
**用途**：當 BeyondPath 為 client 處理其終端用戶之個資時、雙方應簽署本 DPA 規範資料處理範圍與權責。

---

## §1 · 適用範圍

本 DPA 適用於以下情境：

- Client（資料控制者 / Data Controller）委託 BeyondPath（資料處理者 / Data Processor）處理該 Client 之終端用戶個人資料
- 委託範圍包含但不限於：worker 配對、AI 拆解、email 通訊、Tier 評估

不適用於：
- BeyondPath 自身蒐集之個資（依 privacy.html 規範、BeyondPath 為 Controller）
- 個人 client 案件（個人 client 提供之資料為自身個資、不適用「處理者-控制者」關係）

---

## §2 · 雙方角色

| 角色 | 對象 | 法律定位 |
|---|---|---|
| 資料控制者 Controller | Client（公司 / 機構） | 決定個資處理目的與方法 |
| 資料處理者 Processor | BeyondPath（Edward Tsai） | 依 Controller 指示處理個資 |

雙方關係依：
- 中華民國《個人資料保護法》§4 / §8 / §27
- 適用時依歐盟 GDPR Art. 28（Processor 義務）
- 適用時依美國 CCPA / CPRA Service Provider 規範

---

## §3 · 個資處理範圍

### 3.1 處理目的
僅為履行 Client 與 BeyondPath 間之服務合約（如：worker 配對、AI 拆解、email 寄送）所必要之處理。

### 3.2 處理項目
依雙方主合約附件約定、典型可能包含：
- Client 終端用戶 email
- Client 業務 brief 內容
- 配對結果與通訊紀錄

### 3.3 資料主體類別
- Client 內部員工
- Client 終端客戶（若委託處理）
- Client 配合廠商 / worker

### 3.4 處理期間
與主合約存續期間相同、合約終止後依 §10 處理。

---

## §4 · BeyondPath（Processor）義務

### 4.1 僅依 Controller 指示處理
BeyondPath 僅得依 Client 書面（含 email）指示處理個資、不得超出指示範圍。除非：
- 法律強制要求（屆時 BeyondPath 須於不違法情況下事先通知 Client）

### 4.2 保密義務
BeyondPath 確保所有接觸個資之人員（目前僅 Edward Tsai 一人）：
- 簽署保密承諾
- 僅在必要範圍內接觸個資
- 離職 / 終止合作後保密義務持續

### 4.3 技術與組織措施
BeyondPath 採取以下安全措施（呼應 privacy.html §4 與個資法 §27 安全維護計畫）：
- 傳輸加密：HTTPS / TLS 1.2+
- 靜態加密：Supabase Postgres AES-256
- 存取控制：Supabase RLS + admin 限定 Edward gmail
- 備份：Supabase Pro 每日備份 + 7 天 PITR
- 異常偵測：Supabase logs + Vercel logs（90 天輪替）

### 4.4 次處理者（Sub-processor）
BeyondPath 使用以下次處理者、Client 於簽署本 DPA 時視為同意：

| 次處理者 | 用途 | Region | 適用 DPA |
|---|---|---|---|
| Supabase | DB / Auth | 日本 ap-northeast-1 | Supabase DPA · SOC 2 Type II |
| Vercel | Hosting | 全球 CDN（origin 含日本 / 新加坡 / 美西） | Vercel DPA |
| Resend | Email 寄送 | 美國 us-east-1 | Resend DPA |
| Google Cloud | OAuth | 全球分散式 | Google Standard Contractual Clauses |
| Anthropic | AI 推理 | 美國 us-east | Anthropic Commercial Terms（對話不入訓練） |

新增次處理者時、BeyondPath 須於 30 日前以 email 通知 Client、Client 可於 30 日內提出異議。

### 4.5 跨境傳輸告知
個資跨境傳輸至 §4.4 region、BeyondPath 已採適當保護措施（Supabase SOC 2 / Vercel DPA / Resend DPA / Anthropic terms）。詳見 privacy.html §4.3。

### 4.6 資料主體權利協助
若 Client 終端用戶向 BeyondPath 行使個資權利（查詢、更正、刪除），BeyondPath 須於 5 個工作日內通知 Client、由 Client 主導回應。

---

## §5 · Controller（Client）義務

- 確認對終端用戶已盡告知義務（個資法 §8 / §9）
- 取得終端用戶處理 / 委託處理之同意
- 提供 BeyondPath 處理所需之明確指示
- 對其終端用戶之資料主體權利請求負最終回應責任

---

## §6 · 資料外洩通報

### 6.1 BeyondPath 通報義務
BeyondPath 發現個資外洩、洩漏、竄改、毀損時：
- **72 小時內** 通知 Client（依個資法 §12 + GDPR Art. 33 精神）
- 提供：發生時間、外洩範圍、影響資料主體數、已採取措施、後續改善計畫

### 6.2 Client 協助
Client 須協助 BeyondPath 對受影響資料主體之通知（依 §12 + GDPR Art. 34）。

### 6.3 行政機關通報
- 主管機關通報由 Client（Controller）主導
- BeyondPath 提供必要資訊配合

---

## §7 · 稽核權

### 7.1 文件稽核
Client 得以書面要求 BeyondPath 提供：
- 安全維護計畫文件（個資法 §27）
- 次處理者清單與其合規證明
- 員工保密承諾證明

BeyondPath 須於 14 個工作日內回覆。

### 7.2 現場稽核
- Beta POC 階段、BeyondPath 為個人營業者、不接受現場稽核
- 正式版上線後（公司成立後）將另議稽核機制
- Client 可委託獨立第三方（如：BSI / KPMG）以遠端方式稽核（費用 Client 負擔）

### 7.3 稽核頻率
- 每年最多 1 次
- 發生資料外洩事件時可額外 1 次

---

## §8 · 責任分配

### 8.1 BeyondPath 責任上限
本 DPA 下、BeyondPath 對 Client 之累計賠償責任、依主合約責任上限或 terms.html §9.6 規範、兩者取較低者。

### 8.2 例外
因 BeyondPath 故意或重大過失（如：未經 Client 同意揭露個資、惡意刪除、系統性違反 §4 義務）造成之損害、不適用責任上限。

### 8.3 Controller 過失
若資料外洩或處理違法可歸責於 Client（如：Client 未盡告知義務、提供錯誤指示），責任由 Client 自負、BeyondPath 不負責。

---

## §9 · 期間與終止

### 9.1 期間
本 DPA 與主合約同期間生效、主合約終止 = DPA 終止。

### 9.2 終止後義務
DPA 終止後 30 日內、BeyondPath 須：
- 依 Client 書面指示、刪除或返還所有個資
- 提供刪除 / 返還證明（含時間戳、刪除範圍清單）

例外：法律要求保留之資料（如：稅務憑證）依法律期限保留、保留期間仍依本 DPA 保護。

---

## §10 · 適用法律與爭議解決

### 10.1 準據法
- Y1（2026）：中華民國法律
- Y2-Y3：依雙方主合約另定（呼應 terms.html §6）

### 10.2 爭議解決
- 先協商
- 協商不成依主合約爭議解決機制處理（terms.html §6）

### 10.3 法律優先順序
本 DPA 與主合約衝突時、就**個資處理事項**以本 DPA 優先；其他事項以主合約優先。

---

## §11 · 簽署

| 角色 | 簽署人 | 日期 |
|---|---|---|
| Controller（Client） | _____________ | _____________ |
| Processor（BeyondPath） | Edward Tsai | _____________ |

---

## 附錄 A · 城堡自審紀錄

| 自審項目 | Reviewer | 結果 | 日期 |
|---|---|---|---|
| 法務底線（責任上限 / 終止 / 跨境）| 🌸 蘇菲 | 待簽前確認 | __ |
| 安全合規（§4.3 / §6 / §7）| 🧙‍♀️ 沙利曼 | 待簽前確認 | __ |
| 商業條款（§5 / §8）| 🧙 霍爾 | 待簽前確認 | __ |
| Final sign-off | Edward | 待簽前確認 | __ |

> Edward 5/28 拍板：律師全停、城堡自審 GO 即可簽。
> 累積到 10-20 個 SI 案後重評估是否上律師。

---

*v1.0 · 2026-05-28 · 沙利曼草擬 · PMF 階段城堡自治模板 · 不外送律師*
