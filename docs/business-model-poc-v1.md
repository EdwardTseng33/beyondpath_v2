# BeyondPath POC 商業模式 v1

> 2026-05-15 蘇菲整理 · 基於 howl launch-roadmap + sulima trust-audit + product-flow-competitor-review + Edward 5/15 17:30 重定位（系統化 AI 化品牌）
> 目的：把 prototype 階段「不碰錢、純媒合」商業模式整個寫死、給 BD launch + W1-W12 sprint 用

---

## 0 · 核心原則

**BeyondPath POC 階段 = 媒合 + 評估 + 工具、不碰錢、不簽合約、不公開仲裁**

- 對 user：完全是「BeyondPath 系統 + AI 配對演算法 + 品質審核層」、看不到人工層
- 對內：Edward 是後台 final reviewer + 親裁仲裁、不對外揭露
- 收費 POC 階段 = 0；Q3 上線後拍板（success fee / subscription / hybrid）
- 履約保證 / escrow / 第三方託管 = Y2 流水 NT$500 萬以上才評估接（綠界 ECPay）

---

## 1 · 完整 service flow（5 stage）

### Stage 1 · Lead intake（已 ship）

**Worker apply**：
- 雙軌：Route A 自帶 AI（paste-back）/ Route B BP 內建 AI 訪談（chat）
- 兩條都產同樣 ai_proof JSON（L-Score / Tier / 6 維 skill matrix）
- INSERT `worker_applications` 進 Supabase

**Client intake**：
- 4 step：basics → brief → preview → submit
- INSERT `client_intakes` 進 Supabase

**自動觸發**：
- Slack 通知 `#beyondpath-leads`（含 AI 顧問建議）
- Resend 自動寄確認信（v6 系統化品牌、含 24h 期待管理）

### Stage 2 · Match（Phase 2 sprint 補）

**現況**：
- Edward 看 Slack lead + AI 顧問建議、後台手動 pick worker

**Phase 2 目標**：
- Edward 在某個 admin UI（Slack interactive button 或 web admin）點 `Match` decision
- 系統依 decision 寄 match-list email 給 client（含 1-3 worker 能力卡 + 試做案報價 + 試做案範圍）
- 同時寄 worker email「你被推薦給 client X、若有興趣 24h 內回覆」

### Stage 3 · SOW + 報價（template ship、worker 自填）

**Worker 收到 client 選定通知 → 給 client**：
- SOW（用 BP 範本 · scope / milestone / payment terms / IP / 終止）
- 報價單（用 BP 範本 · 工時 / hourly rate / 總價 / 試做案 vs retainer 對比）

**範本路徑**：
- `docs/templates/sow-trial-project.md`
- `docs/templates/quote-format.md`

**BP 平台角色聲明**（範本內含）：
- BeyondPath 為媒合平台、不為交易主體
- 雙方契約直接在 worker / client 間成立
- BP 不收平台費（POC 階段）、不擔保任何一方履約
- 爭議協調可寫信 `hello@beyondpath.tw`

### Stage 4 · Delivery + 驗收

**Worker 交付 deliverable 給 client**

**Client 用 BP 驗收 checklist**（`docs/templates/delivery-acceptance-checklist.md`）：
- 對齊 SOW 列的 deliverable 一一勾選
- 滿意 → 簽收 + 直接付款給 worker（BP 不碰錢）
- 不完整 → 列具體缺項 + 設 deadline 補件
- 嚴重不符 → 進 Stage 5 爭議協調

### Stage 5 · 結算 + Review（雙方直接）

**結算**：
- Worker / client 直接支付（LinePay / 銀行匯款 / Stripe link 等 worker 自選）
- BP 不碰錢、不開發票（client 跟 worker 直接結算稅務）

**Review（POC 階段 manual）**：
- 案結後 BP 系統寄 review 邀請給雙方
- Worker 累積 review 進公開 portfolio
- Client review 進內部 DB（不公開）

**升級 path**：
- 滿意 → retainer / 第二案
- 不滿意 → 雙方結束

---

## 2 · Trust 機制（沒 escrow 怎麼建信任）

### Worker 端
1. **AI 認證 + Tier 分級**：L-Score 評估 + skill matrix 6 維 + Edward 後台 final review
2. **Portfolio 公開**：worker 能力卡含 vertical / case_count / 自豪 workflow
3. **累積 review**：跑過案後 client review 進 worker public profile
4. **試做案小額**：NT$30-100k 範圍、client 試水成本低
5. **不簽長約**：worker 隨時可退、不綁定

### Client 端
1. **BP intake AI 驗證**：brief 至少 20 字、預算 / 時程 / vertical 必填、AI 顧問 verify real budget / real project
2. **Slack 後台 review**：Edward 看 brief + AI 顧問建議、低品質 lead 直接拒（POC 階段手動）
3. **試做案先行**：滿意才 retainer、不滿意可結束
4. **不簽長約**：client 隨時可換 worker

### BP 平台端
1. **AI 評估 + 多維配對演算法**（對外 framing）
2. **品質審核層**（內部 Edward review、對外不揭露）
3. **爭議協調機制**（Stage 5 看下方）

---

## 3 · 爭議協調 escalation playbook（3-tier）

詳細：`docs/playbooks/dispute-escalation.md`

**Tier 0 · 雙方自行溝通**（預設）
- BP 不介入、worker / client 直接溝通解決
- 大部分爭議在此 tier 解

**Tier 1 · BP 協調**（user 寄 `hello@beyondpath.tw`）
- POC 階段 Edward 後台接（對外稱「BeyondPath 協調團隊」）
- 24-48h 內回應、看兩邊立場 + 對齊 SOW + 提協調方案
- 若雙方接受 → 案結
- 若一方不接受 → 進 Tier 2

**Tier 2 · BP 仲裁建議**（POC 階段 Edward 親裁）
- BP 根據 SOW + 驗收 checklist + 雙方溝通紀錄、給仲裁建議
- 建議方向：part-payment / 重做 / 退案 / 平台 dispute log
- 平台仲裁建議**非法律效力**（POC 階段、未來 Q3 上線前接 escrow + 正式仲裁）

**Tier 3 · 法律途徑**（最終）
- 平台合約聲明：爭議由台灣台北地方法院為第一審管轄法院（sulima audit L530）
- BP 不代表任一方、提供溝通紀錄 + SOW + 驗收 checklist 作為證據

**POC 階段 Edward 親裁規則**：
- 首 5 案 Edward 親跑、累積 case study
- 5 案後寫成 W3 escalation playbook
- 10 案後評估 Tier 1 / Tier 2 是否該系統化

---

## 4 · 收費模式

### POC 階段（5/15 - Q3 上線前）
**0 收費**
- 不收申請費
- 不收平台費
- 不收 success fee
- 不收 worker / client subscription

**為什麼**：純驗證 PMF、累積 case study、找出哪個收費模式 conversion 最高

### Q3 上線後候選方案

| 方案 | 收誰 | 多少 | 觸發 |
|---|---|---|---|
| **A · Success fee** | Worker | 8-12% | 案結 client 滿意後 worker 付給 BP |
| **B · Client subscription** | Client | NT$2k-5k / 月 | 月費 unlimited matching |
| **C · Worker subscription** | Worker | NT$500-1k / 月 | visibility 升級（首頁 highlight）|
| **D · Hybrid** | 雙方 | 上述組合 | 例：success fee 5% + worker subscription tier |

**拍板規則**：POC 跑 6 個月、看 ≥ 20 案件實際行為 → Q3 上線前 1 月拍板

---

## 5 · 法律基底（sulima 整理）

詳細：`docs/launch/02-trust-audit-suliman.md`

- 平台合約**不含 escrow**、雙方契約直接在 worker / client 間成立
- IP 三段式：作品所有權 / 使用權 / 平台展示權分層
- DPA §27 個資告知 + 退場機制
- 平台角色聲明：BeyondPath 為媒合平台、不為交易主體
- 仲裁地：台灣台北地方法院（第一審）
- 終止條款：雙方任一方違約 / 不可抗力 / 平台關閉的退場 path

**待 ship**（howl roadmap W3 / Markl 寫）：
- 合約模板初版
- 律師審視（POC 階段以 BD friend 律師 friend 過、Q3 上線前正式律師審）

---

## 6 · BD launch 啟動條件

### Phase 1 ship（5/15-5/22）
- ✅ Worker apply 雙軌
- ✅ Client intake
- ✅ Submit + email 確認自動化
- ⏳ 7 套回信 template ready（本 sprint）
- ⏳ SOW + 報價單 + 驗收 checklist + dispute playbook（本 sprint）

### Phase 2 ship（5/22-6/5）
- ⏳ Worker dashboard 真實版（看 active lead）
- ⏳ Matching UI（Slack button 或 web admin）
- ⏳ Edge Function `send-decision-email`（接 Slack button 觸發）

### Phase 3 BD launch（6/5+）
- BD 給 sweet spot worker（W01/W03/W06）+ client（C01/C04）各 1-2 個朋友
- 收 ≥ 5 real worker apply + ≥ 3 real client intake
- 跑通首 5 案 → 累積 escalation case study

### Phase 4 Q3 上線前（7-8 月）
- 接 escrow（綠界 ECPay）
- 拍板收費模式
- 正式律師審合約
- 自動化爭議仲裁系統（POC tier 1 / tier 2 系統化）

---

## 7 · 跟既有 docs 對齊

| 既有 doc | 本 doc 引用 |
|---|---|
| `docs/launch/04-launch-roadmap-howl.md` | risk register + W1-W12 timeline + 收費規劃 |
| `docs/launch/02-trust-audit-suliman.md` | 法律基底 + 仲裁地 + DPA + 平台角色聲明 |
| `docs/product-flow-competitor-review-2026-05-11.md` | 競品比較 + 驗收框架建議 |
| `docs/landing-market-review-2026-05-11.md` | 市場定位 + 競品差異化 |
| `docs/ai-workflow-proof-profile-spec.md` | Worker 認證評估方法 |

---

## 8 · 待解問題（next sprint 拍板）

1. **平台服務費條款 wording**（W4+ 開始試水）：要在 SOW 範本內加「BeyondPath 為媒合平台、未來可能收 success fee」聲明嗎？
2. **Refund 政策**：試做案 worker 交付完全不符 SOW、client 已直接付款、能 refund 嗎？POC 階段 BP 不碰錢 = 沒法強制 refund、靠 Edward 協調
3. **Off-platform 交易**：worker / client 認識後跳過 BP、未來怎麼 detect / mitigate？howl roadmap 寫接受為 beta 期常態
4. **Worker pool 累積策略**：BD launch 首批 10 worker / 30 worker / 50 worker 各階段該怎麼設計？

---

*v1 · 2026-05-15 立 · 配合 BD launch + W1-W12 sprint 拍板 service 完整性*
*後續更新進 v2 / v3 等同檔追加版本記錄、不另開新檔*
