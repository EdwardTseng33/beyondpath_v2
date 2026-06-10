# 43 · 三身分完整服務體驗 UX QA · 蕪菁頭

> 作者：🥕 蕪菁頭（用戶意圖 & 行為分析）· 2026-06-01
> 正式站 https://beyondpath.tw · Chrome 實測三身分 + code 交叉驗證 + a11y tree
> 依據：doc 41（卡西法 e2e PASS）+ doc 42（馬魯克營運 QA）+ doc 06（5/14 UX audit）

---

## TL;DR
- **發案者 7/10**：landing 30 秒大致懂，但 wizard 兩個認知炸彈——12 步 stepper（以為要走 12 步）+ DEMO NAV banner 暴露給用戶。送出後黑盒子是最大信任裂縫。
- **接案者 7.5/10**：認證流程結構清楚、文案到位。最大問題 APPLY 按鈕沒角色說明。
- **營運者 6/10**：後台可操作，但沒有「今天要我做什麼」全局視圖，要掃 5 個 tab 才知現況。
- **APPLY 判斷：保留功能、改名**（「申請接案 / JOIN AS WORKER」），解決角色混淆。

---

## 一、發案者（Client）
- Landing 第一屏 30 秒理解度 7/10：雙 CTA 分工清楚、USE CASES 秒懂、24h/50K 期待校準好。但 hero 大標是平台主張、沒接住 SMB「找人不踩雷」的核心恐懼；marquee/AGENT STREAM 動畫對非技術用戶是噪訊。
- **問題 1（blocker）**：12 步 stepper 讓用戶以為要走 12 步 → conversion 殺手。實際只 4 步。改「步驟 1/4」+ 12 步旅程移 info tooltip。
- **問題 2（high）**：DEMO NAV banner「用戶端不當看到」正式站用戶可見 → 動搖正式感信任。必須隱藏/移除。
- 問題 3（medium）：預填 demo brief「這是我要改的嗎」困惑。
- 問題 4（high）：送出前登入閘文案好（「需求已暫存、登入帶回」），但缺「登入後 24h email 收到配對方向」這句。
- 最大斷點：**送出 brief 後黑盒子**——不知道何時/誰/多久聯絡。

## 二、接案者（Worker）
- 認證申請頁 8/10：排他動機（<10%）、4 步清楚、時間成本透明、免費、資深 fast-track 好。
- 問題：主 CTA 傳流程不傳動機；Tier 制在申請頁不透明（要回 landing 找）。
- AI 訪談 7.5/10：prompt 品質高、三 AI 快開連結降摩擦。問題：貼回 JSON 的資料去向不透明。
- 送出後同樣缺確認信/誰聯絡/方式。

## 三、營運者（Edward）
- Admin 第一眼全局感 6/10：進門是「0 個 Pending」空列表，不是「今天要做什麼」。**缺 Dashboard tab**（待辦/超時/需動作）。
- 可做：approve/reject worker、看 intake、Run Match、寄信、看 Decisions History。
- 做不到（要另查 Supabase）：worker 接受/拒絕狀態、哪個 intake 快超 24h、超時未 review、全站幾案在跑。
- 操作模型是「被動查詢」（Edward 主動找問題），1 人管 >5 案會漏事（呼應 doc 42 通知覆蓋 36%）。
- Admin 無 auth gate（POC 靠 URL 不公開）——用戶信任層面 P0，v1+ 補。

## 四、APPLY 入口判斷（Edward 點名）
- 現況：nav 右上 `SIGN IN`（→sign-in?role=client）+ `▲ APPLY`（→app.html?role=worker&onboarding=1）並排、未登入可見。
- 問題：APPLY 對發案者是認知噪訊——不清楚給誰、可能誤點以為「申請發案」、「該點哪個」的停頓消耗轉換。
- **明確建議：保留 + 改名**。改「▲ 申請接案」或「▲ JOIN AS WORKER」，按鈕自帶角色歸屬。**不移除**——接案者招募是雙邊平台 Day 1 核心任務，只是名字沒攜帶足夠資訊。

## 五、三身分最該修 UX

### 必修（M）
| # | 身分 | 問題 | 建議 |
|---|---|---|---|
| M1 | 全部 | 送出後黑盒子（無「接下來/多久」告知）| 送出成功頁加「24h 內 email 收到 X、超時寄 hello@beyondpath.tw」|
| M2 | 發案者 | 12 步 stepper 誤以為走 12 步 | 改「步驟 1/4」、12 步旅程移 info tooltip |
| M3 | 發案者 | DEMO NAV banner 用戶可見 | flag 隱藏，正式用戶不顯示 |
| M4 | 雙邊 | APPLY 無角色說明 | 改「申請接案 / JOIN AS WORKER」|
| M5 | 營運者 | Admin 無全局 Dashboard | 新增 Dashboard tab（待辦/超時/需動作）|

### 優化（P）
P1 hero 大標接住「找人不踩雷」恐懼 / P2 預填預算 240K 偏高 / P3 AI 訪談資料去向透明 / P4 申請頁 Tier 說明 / P5 FAQ 留個人 email 改 hello@ / P6 SIGN IN 預設 role=client 誤導接案者 / P7 admin auth gate（配沙利曼 Gate 5）

---

Sources: UserGuiding marketplace onboarding / Excited marketplace UX / UX Design Institute onboarding 2025
