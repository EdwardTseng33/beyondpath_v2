# BeyondPath 產品流程與競品調研建議

日期：2026-05-11  
目的：檢查目前 POC 服務流程，找出能提高發案方使用意願、接案者自主加入意願的功能與敘事優化。

## 一句話判斷

BeyondPath 目前最有潛力的定位不是「AI freelancer marketplace」，而是：

> 台灣中小品牌的 AI 交付信任層：把 AI 需求拆成可驗收交付專案，並媒合已審核、能對成果負責的 AI-native 工作者。

這個定位比「試做案」「AI 工作者認證網路」「AI 工具媒合」更能同時說服發案方、接案者與策略天使。

## 目前流程觀察

### 發案方流程現況

目前已有的強項：

- 從 vertical / brief / AI parse / expectation / match 到 acceptance framework / milestone review / NPS / retainer，流程完整。
- 已有「3 位候選人 + 配對理由」的核心價值。
- 已有 milestone、NPS、retainer 等信任機制雛形；付款與合約先維持 off-platform。
- 對發案方而言，最有價值的是「不用自己判斷誰真的會 AI 交付」。

目前的缺口：

- 首頁說明還需要更直接解釋「為什麼交給 BeyondPath 的人比較可靠」。
- Client flow 對第一次來的品牌主偏產品展示，還缺「交付保障」的安心語言。
- Match 畫面有分數，但還可以更像採購決策表：風險、適配理由、預算信心、替補機制。
- 尚未把「AI 初審 + 人工覆核」產品化成一個明確 step，例如 Scope Review / Delivery Review。

### 接案者流程現況

目前已有的強項：

- Worker Console 已經有 active case、tier、wallet、AI coach、inbox，很完整。
- Tier ladder、skill gap、tool subsidy、推薦權重，對高品質接案者有吸引力。
- 已新增直接 demo path：`app.html?role=worker&view=worker-demo`，不再藏在申請流程後。

目前的缺口：

- 申請者還不知道「我提交後平台會如何評估我的 AI workflow」。
- 需要更強的誘因：加入後不是只是等案，而是能建立「AI 交付履歷」。
- Worker 端可新增「我的能力證據頁」：案例、工具流、交付品質、NPS、可接案領域，用於被客戶理解。

## 競品調研摘要

| 競品 | 對客戶的核心承諾 | 對人才的誘因 | BeyondPath 可借鏡 |
|---|---|---|---|
| Toptal | Top 3% talent，嚴格篩選 | 高品質客戶與高單價 | 強化審核可信度，但避免空喊百分比，先講審核項目與案例證據。 |
| A.Team | Vetted experts / AI builders，組隊交付 production-ready AI | 和高階 peers 做高影響力專案 | BeyondPath 可加入「不是單一 freelancer，而是可組隊交付」敘事。 |
| MarketerHire | 48 小時內以 AI + human expertise 配對 vetted marketer | 被推薦給需要行銷成果的品牌 | 對 DTC / MarTech 方向很接近，可借鏡「快、少篩選、直接給人選」。 |
| Upwork Expert-Vetted | Top 1% talent badge，Enterprise trust | badge、priority、higher pay、Talent Manager | 接案者需要「被看見的憑證」與更高報價理由。 |
| Lemon.io / Gun.io | 48h 或 3-5 天內給 vetted developer shortlist | 已審核、被手工配對、較高品質案源 | BeyondPath 不必照抄固定天數：先承諾 24 小時初步判斷，再進入短名單媒合。 |
| Contra | Commission-free contracts、portfolio、payments、workspace | 0% commission / freelancer-friendly | 接案者會被低抽成、作品展示、直接溝通吸引；BeyondPath 可強調初期分潤透明。 |
| Mayple | Vetted marketing experts，強調 achieved above-benchmark results | 專家被高品質品牌看見 | BeyondPath 的 worker 審核應從「會用 AI」升級成「有結果證據」。 |
| Mercor | AI talent / domain expert marketplace，服務 AI labs 與 AI training | 高技能專家被媒合到 AI 相關工作 | BeyondPath 應避開 Mercor 的 AI lab/data training，專注台灣品牌的 AI 交付。 |

## 建議新增或強化的產品功能

### P0：最該先做，直接提高發案轉換

1. **交付信心卡 Delivery Confidence Card**
   - 出現在候選人配對後。
   - 顯示：為什麼推薦、過往相似案例、可能風險、平台怎麼把關、替補條件。
   - 目的：讓品牌主不是只看分數，而是能做採購決策。

2. **Scope Review / 首案範圍審核**
   - 在 brief parse 後加一個 AI-assisted review 狀態。
   - 文案：`Edward 會先確認這個需求是否適合首案交付、預算是否合理、驗收點是否清楚。`
   - 目的：把「AI 把關」變成產品流程，不只是口號。

3. **Acceptance Criteria 驗收清單**
   - 每個專案自動產生 3-7 條驗收標準。
   - 例如：交付格式、版本數、渠道、可修改次數、deadline、成功指標。
   - 目的：降低「做了很多但不知道算不算完成」的風險。

4. **候選人比較表**
   - Top 3 不只列人，還要有欄位：
   - `適合原因 / 不適合原因 / 類似案例 / 預估費用 / 可開始時間 / 替補風險`
   - 目的：讓發案方覺得平台替他做了採購前置工作。

### P1：提高接案者加入意願

5. **AI Workflow Proof Profile**
   - 接案者不只上傳作品，而是上傳「工具流 + 判斷邏輯 + 成果」。
   - 產出一頁客戶看得懂的能力證據。
   - 目的：讓接案者覺得 BeyondPath 能幫他把身價翻譯給客戶。

6. **首案候選池狀態**
   - 顯示：目前排在哪些 vertical、還缺什麼資料、哪類案子較有機會被推薦。
   - 目的：避免接案者申請後像黑箱。

7. **報價建議器**
   - 根據 Tier、領域、案例、時程給建議價格帶。
   - 目的：幫好接案者不靠低價競標，也幫客戶理解為什麼貴。

8. **認證回饋報告**
   - 即使沒通過，也給「補強方向」。
   - 目的：提高接案者對平台公平性的信任。

### P2：等有首批案子後做

9. **替補承諾 Replacement Policy**
   - 可先是人工版：若 milestone 前明顯失配，平台協助重配。
   - 不要太早承諾保證退款，但要有處理機制。

10. **成果案例頁**
   - 用真案替換 prototype case。
   - 每案包含：問題、交付物、AI workflow、時程、NPS、下一步。
   - 目的：這會是未來 SEO / AIO / GEO 的核心素材。

11. **Role-specific Landing**
   - `/for-clients`：找 AI 交付者。
   - `/for-workers`：建立 AI 交付履歷。
   - 目前 landing 單頁承載兩邊，之後會越來越重。

## 首頁文案優化方向

原文問題：

> 你不是缺 AI 工具。你缺的是一個能把需求接住、把成果交出來的人。

這句有痛點，但「為什麼要交給 BeyondPath 的人」還不夠直觀。

已改方向：

> 會用 AI 的人很多。能對交付結果負責的人很少。

理由：

- 比「缺工具」更接近採購者的真實疑慮。
- 直接把問題從工具導入拉到「成果責任」。
- 更適合作為 SEO / AIO / GEO 的品牌敘事起點：AI 交付、可驗收、已審核、成果負責。

建議持續使用的核心詞：

- AI 交付專案
- 可驗收交付
- 已審核 AI 工作者
- 中文 brief
- 24 小時初步判斷
- 短名單候選人
- 首案交付
- AI 工作交付信任層

應避免過早使用的詞：

- 試做案：容易讓客戶覺得像實驗品。
- 全自動平台：目前仍需要人工覆核，不宜過度承諾完全自動化。
- 代收代付 / escrow：正式法律與付款機制未完成前，公開 prototype 應避免呈現平台碰款，先改成驗收框架與媒合服務費方向。
- top 1% / top 3%：除非有實際審核樣本與通過率，不要硬借用。

## 建議下一步

1. 在 client match 畫面新增 Delivery Confidence Card。
2. 在 worker onboarding 加一段「你會建立 AI Workflow Proof Profile」。
3. 把首頁案例段從 mock case 改成「首批案型模板」，等真案出來再替換。
4. 建立 1 頁 `/for-workers` 或 landing 內的 worker section，主詞是「建立你的 AI 交付履歷」。
5. 首批 3-5 個案子結束後，優先補「真案例 + NPS + 交付物截圖」，這會比任何平台規格更能提高信任。

## 參考來源

- Toptal: https://www.toptal.com/top-3-percent
- A.Team: https://www.a.team/
- A.Team join: https://www.a.team/join
- MarketerHire: https://marketerhire.com/marketing-talent
- Upwork Expert-Vetted: https://www.upwork.com/enterprise/expert-vetted
- Upwork Expert-Vetted talent: https://www.upwork.com/talent/expert-vetted
- Lemon.io: https://lemon.io/startups/
- Gun.io: https://gun.io/find-freelance-software-developer/
- Contra: https://contra.com/features/get-discovered
- Mayple: https://www.mayple.com/
- Mercor: https://mercorca.com/
