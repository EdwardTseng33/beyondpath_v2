# 31 · Demo → 正式 Beta 文案 + 條款配套 spec（沙利曼 · Gate 5 信任視角）

> 設計者：沙利曼（Head of Trust & Infrastructure）
> 觸發：Edward 2026-05-29 17:09 拍板「拿掉 prototype demo 狀態、變成真正式服務」
> 性質：**設計文件**，給卡西法帳號系統 sprint 實作時用，不在本次直接改 app.html / legal 檔
> 對齊：privacy.html / terms.html v1.1（2026-05-28 我改的責任上限 + 平台聲明）
> 法律詞點到為止 · 這是底線建議，非正式法律意見 · 真接 $10K+ ACV 客戶仍建議外部律師複核

---

## 0 · 先講最重要的一句話（讀其餘前先讀這段）

**「正式服務」≠「立刻開始抽成收費」。**

現在的條款（terms.html §3.1 / §3.3 / §4）寫得很明確：
- Beta POC 階段 = 0% 抽成、不收費、不開發票
- 真實 take rate 在 §3.2「v1.0 上線後」才啟用

Edward 5/29 要的「真正式服務」，從信任與合規角度，最安全、也最符合他口頭意圖的解讀是：

> **「真實個資 + 真實配對 + 真實合約意向 + Edward 親自督導，但平台 take rate 仍為 0」的 Early Beta。**

也就是：拿掉「這是假的、模擬的、不算數」的自我否定，**但不偽稱我們現在抽成**。
- ✅ 改的是「**定位**」：從「demo 玩具」→「真的可以下單的早期服務」
- ❌ 不必改的是「**收費**」：take rate=0 仍可保留（早期免費反而是賣點，見 §1 文案 B 版）

如果 Edward 真的要「同時開始收費」，那是另一個更重的決策（觸發發票義務、金流、退費條款全套生效），**屬 Tier D 必 Edward 親口再拍一次板** —— 不在本次拿掉 demo 的範圍內。本 spec 預設「拿 demo 但暫不收費」路徑；若要連收費一起開，§4 checklist 末尾標了額外觸發項。

---

## 1 · 頂部橫幅文案：demo → 正式 Beta（給蘇菲挑 · 3 版）

### 現況（要改的字眼）

| 位置 | i18n key | 現中文 | 問題 |
|---|---|---|---|
| 頂部 label | `app.disc_top_label` | 「PROTOTYPE DEMO · 非正式服務」 | 自我否定，把真服務講成玩具 |
| 頂部 body | `app.disc_top_body` | 「所有資料皆為模擬 · 真實服務尚未開放 · 不收費 / 不處理真實個資 / 不簽法律效力文件 · 正式上線預計 2026 Q3」 | 「模擬 / 尚未開放 / 不處理真實個資 / 不簽法律文件」全部與「開始收真實個資」矛盾 |
| 底部 foot | `app.disc_foot` | 「Prototype v0.2 · 所有合約 / 付款 / 認證內容僅為展示、無法律效力 · 正式上線前完整律師審視中」 | 「僅為展示、無法律效力」與真實配對矛盾 |
| icon | （hardcode）`🚧` | 施工路障 | 換成更「早期但真實」的 icon，如 `🌱`（早期）或留白 |

### 設計原則（橫幅必同時滿足 5 點）

1. **傳達「真的」**：可以真的送 brief / 真的申請、會被 Edward 真的看到
2. **傳達「早期」**：案量小、還在打磨，**不過度承諾**（避免 §10 平台聲明被打臉）
3. **傳達「親自顧」**：Edward 親自督導每筆配對 = 早期的信任感來源，也是最大差異化
4. **不偽稱抽成**：take rate=0 期間不可暗示「付費平台」（避免誤導 + 公平交易法廣告不實風險）
5. **可關閉、不擋路**：保留現有 close 按鈕 + sessionStorage 邏輯，不改互動

### 版本 A · 穩健誠實版（推薦底線）

**中文**
- label：`Early Beta · 早期合作階段`
- body：`這是真實服務，你送出的需求與申請會由 Edward 親自審視與配對。目前為早期階段、首批合作、平台免費 · 我們會持續優化中 · `
- foot：`BeyondPath · Early Beta · 2026-05-29 · 真實配對服務、由 Edward 個人營運督導 · 完整條款見隱私與服務條款 · `

**English**
- label：`Early Beta · First cohort`
- body：`This is a real service. The brief or application you submit is personally reviewed and matched by Edward. We're early, working with our first partners, and free during Beta · We're improving continuously · `
- foot：`BeyondPath · Early Beta · 2026-05-29 · Real matching service, personally run and supervised by Edward · See full Privacy & Terms · `

> 為什麼推薦：合規最穩。每句都查得到根據（真審視 = 真的；免費 = take rate 0；早期 = §10 限制仍合理）。沒有任何一句會在出事時被打臉。

### 版本 B · 賣點版（早期免費當優勢）

**中文**
- label：`Early Beta · 首批免費`
- body：`真實配對服務、現已開放下單。早期階段由 Edward 親自督導每筆配對、首批合作不收費 · 名額有限 · `
- foot：`BeyondPath · Early Beta · 真實服務、Edward 親自督導 · 早期免費為限時優惠、未來版本將啟用平台費（上線前 30 日預告）· 完整條款見隱私與服務條款 · `

**English**
- label：`Early Beta · Free for first partners`
- body：`A real matching service, now open. In this early stage, Edward personally supervises every match — free for our first partners · Limited spots · `
- foot：`BeyondPath · Early Beta · Real service, personally supervised by Edward · Free for early partners is a limited offer; platform fees apply in future versions (30-day notice) · Footer links to full Privacy & Terms · `

> 注意：B 版用「現已開放下單 / 名額有限 / 限時」這類行銷語。**合規 caveat**：foot 必須明確寫「未來啟用平台費 + 30 日預告」（呼應 terms §3.2），否則「免費」可能被解讀為永久承諾。我已把這句寫進 foot，不可省。

### 版本 C · 極簡版（最低存在感、適合不想橫幅搶戲）

**中文**
- label：`Early Beta`
- body：`真實服務 · Edward 親自督導配對 · 早期階段持續優化中 · `
- foot：`BeyondPath · Early Beta · 真實配對服務、由 Edward 個人營運 · 完整條款見隱私與服務條款 · `

**English**
- label：`Early Beta`
- body：`A real service · Personally supervised by Edward · Early stage, improving continuously · `
- foot：`BeyondPath · Early Beta · Real matching service, personally operated by Edward · See full Privacy & Terms · `

> 適合：若女巫覺得橫幅視覺太重、想降存在感。資訊量最少但仍誠實。

### 沙利曼的挑選建議（給蘇菲）

- **若暫不收費（本 spec 預設路徑）→ 用 A 或 C。** A 把「免費」當早期事實陳述、最穩。
- **若 Edward 想把「早期免費」當行銷鉤子 → 用 B**，但 foot 的「未來啟用平台費 + 30 日預告」一字不可刪。
- 三版我都已確保：無「模擬 / 不算數 / 無法律效力」字眼、無過度承諾、有 Edward 親自督導的信任錨點。

### i18n 實作備註（給卡西法）

- 改 5 個 key：`disc_top_label` / `disc_top_body` / `disc_foot` 的 zh + en（dict.zh.js / dict.en.js + app.html inline data-i18n 預設文字三處都要同步，避免 fallback 露舊字）
- `disc_top_waitlist` 連結建議改向：拿掉 demo 後「加入 waitlist」語意變弱。若仍免費下單，可改為「了解運作方式 →」或維持 waitlist 作為「想被優先配對」入口（由蘇菲 / 霍爾定文案，非我的範圍）
- icon `🚧` → 建議 `🌱` 或移除，由女巫定

---

## 2 · 服務條款配套：「自我否定字眼」盤點 + 改 / 留判定

我把 privacy.html + terms.html 裡所有「demo / 模擬 / 不算數」類字眼分三類：**改成正式語言** / **保留（合理早期免責）** / **依收費決策再定**。

### 2.1 必改（自我否定、與真實服務矛盾）

| 檔 · 位置 | 現字眼 | 問題 | 改法建議 |
|---|---|---|---|
| privacy `<meta description>` (L7,14) | 「Beta 階段（POC）」 | POC = 概念驗證 = 不算數 | 「Early Beta 階段」（拿掉 POC / 概念驗證） |
| privacy legal-note (L69) | 「Beta · POC（概念驗證）階段」 | 同上 | 「Early Beta 階段、由 Edward Tsai 個人營運」 |
| privacy legal-meta (L66) | 「版本 v1.1（Beta · POC）」 | 同上 | 「版本 v1.2（Early Beta）· 2026-05-29」 |
| privacy footer (L314) | 「Beta POC」 | 同上 | 「Early Beta」 |
| terms `<meta>` (L7,14) | 「Beta 階段（POC）」 | 同上 | 「Early Beta 階段」 |
| terms legal-meta (L70) | 「版本 v1.0（Beta · POC）」 | 同上 | 「版本 v1.1（Early Beta）· 2026-05-29」 |
| terms legal-note (L73) | 「Beta · POC（概念驗證）階段」 | 同上 | 「Early Beta 階段」 |
| app.html foot (L380) | 「所有合約 / 付款 / 認證內容僅為展示、無法律效力」 | **最嚴重** · 真配對下「無法律效力」會讓用戶以為條款不綁定 | 刪除「僅為展示、無法律效力」整句、改 §1 橫幅 foot 文案 |

> 核心動作：全站 `POC` / `概念驗證` / `prototype` / `僅為展示` / `無法律效力` / `模擬` → 收斂為 **`Early Beta`**。
> `Early Beta` 仍合法表達「早期、可能變動」，但不否定「這是真的、條款綁定、個資真實處理」。

### 2.2 保留（早期 Beta 的合理免責 · 不動）

| 檔 · 位置 | 字眼 | 為何保留 |
|---|---|---|
| privacy §9.1 / terms §1.2 | 「服務可能中斷、資料可能變動、不保證配對成功率」 | 早期服務正當免責、不是自我否定。建議把「Beta 階段限制」→「Early Beta 限制」即可 |
| privacy §9.4 / terms §9.5 | 「依現狀（AS-IS）提供」 | 標準免責、正式服務也常見。保留 |
| privacy §9.5 / terms §9.6 | 責任上限兩段式（Beta NT$50K / 正式 NT$200K） | **我 5/28 改的、設計正確**。「Beta」這裡指階段不是否定，保留。建議文字「Beta POC 階段」→「Early Beta 階段」對齊 |
| terms §3.2 / §3.4 | 「正式版上線後啟用 take rate」預告 | 正確的「未來收費預告」、合規必要。保留 |
| terms §4 | 退費規則「正式版上線後啟用」預告 | 同上。保留 |

### 2.3 依「是否同時開始收費」決策再定（金流相關）

| 檔 · 位置 | 現字眼 | 路徑 A（拿 demo · 暫不收費 · 本 spec 預設） | 路徑 B（拿 demo + 同時收費 · 需 Edward 再拍板） |
|---|---|---|---|
| terms §3.1 (L150) | 「0% 抽成、不收費」 | **保留**、但「Beta POC」→「Early Beta」 | 改為實際 take rate + §3.2 表生效 |
| terms §3.3 (L167) | 「不開發票」 | **保留** | 改：依法開立電子發票（觸發營業稅義務） |
| terms §1.2 (L93) / privacy §10.2(d) | 「不抽成、不收費、不託管專案款」 | **保留** | 「不抽成」需改；「不託管款項」可續留（最低中介設計仍可不碰金流） |
| privacy §10.3 (L298) | 「平台不抽成、不收費」 | **保留** | 改 |

> 強烈建議走路徑 A：**拿掉 demo 標籤 + 保留早期免費**。
> 理由：收費一旦開啟，會連鎖觸發發票（營業稅法）、退費條款生效、金流 KYC、消保法網購 7 日鑑賞期適用性評估等一整套，**遠超「改文案」的範圍**。早期免費本身就是合理且有吸引力的定位。
> 路徑 B 若要走，請 Edward 親口確認，並另開一個「收費上線」spec（金流 + 發票 + 退費全套）。

---

## 3 · 個資存放合規確認（Edward 要「用戶資料存放好」）

帳號系統會存雙邊真實個資。我把帳號系統預期會收的欄位，逐一對照 privacy.html 現有揭露，確認涵蓋是否完整。

### 3.1 帳號系統欄位 vs privacy.html 揭露對照

| 帳號系統會收的欄位 | privacy.html 是否已揭露 | 目的揭露 | 缺口 |
|---|---|---|---|
| Email | ✅ §2.1 / §2.2 必填 | ✅ 配對通知、合約寄送 | 無 |
| 姓名 / 顯示名 | ✅ §2.1 聯絡人姓名 / §2.2 顯示姓名 | ✅ 信件抬頭 / 視覺展示 | 無 |
| 身分類型（個人/公司/工作室） | ✅ §2.1 | ✅ 配對分流 | 無 |
| **電話** | ⚠️ §2.1 列為 client **選填**、§2.2 worker **未列** | ⚠️ 現只寫「B2B 流程加值」 | **見 §3.2 必補** |
| 密碼 / 認證憑證 | ⚠️ §7.1 cookie 表有 auth-token、但「我們蒐集什麼」段未明寫密碼 hash | — | 建議 §2 加「登入認證以雜湊（hash）儲存、平台無法還原明文」一句 |
| OAuth 識別（Google sub） | ⚠️ §4.1 / §8 提 Google OAuth、但 §2 未明列「我們會存 Google 帳號識別碼」 | — | 建議 §2 加一條：OAuth 登入存「Google 帳號識別碼 + email」、不存 Google 密碼 |
| 案件 / brief / portfolio | ✅ §2.1 / §2.2 完整 | ✅ | 無 |
| AI 訪談對話 | ✅ §2.2 + 特別聲明 | ✅ 不訓練第三方模型 | 無（已做得好） |

### 3.2 收電話的目的揭露（我之前標的 Gate 5 待補項 · 這次補進去）

**現況問題**：
- privacy §2.1 把電話放在 client「選填」、目的寫「B2B 流程加值」——太模糊
- §2.2 worker 完全沒列電話
- 帳號系統若兩邊都收電話「配對成功後聯絡用」，現有揭露不足以覆蓋此目的

**必補（給卡西法實作 privacy.html 時加 / 蘇菲核稿）**：

在 §2.1 與 §2.2 各補一條電話揭露，目的明確化：

> **聯絡電話（選填）**：用於配對成功後、經雙方同意的聯絡。
> 我們**不會**在配對前主動以電話聯繫你、**不會**將電話用於行銷、**不會**未經你同意把電話揭露給對方。配對成功且你同意後，電話才會與對方交換（與現行「配對後互傳 email」機制一致）。

**搭配 §3 使用目的段**補一行：

> 配對成功後、經雙方同意交換聯絡方式（含 email、電話）以利後續溝通。

> 合規理由：個資法 §8 告知義務要求「蒐集目的」明確。「B2B 加值」過於空泛，電話這種較敏感的直接識別資料，目的要具體到「配對後聯絡、需同意、不行銷」。把「電話保持選填」也降低最小化原則風險——若帳號系統把電話設為必填，需在揭露中改為必填並說明必要性。

### 3.3 既有揭露做得好、不動的部分（給 Edward 安心）

- ✅ §2.3「絕不蒐集」清單（身分證、銀行帳號、信用卡、生物特徵...）—— 與帳號系統不衝突，繼續守住這條界線
- ✅ §4 儲存位置 / 加密 / 跨境傳輸（Supabase 東京 + AES-256 + TLS）—— 帳號系統用同一套 Supabase，揭露已涵蓋
- ✅ §6 當事人權利（查詢 / 更正 / 刪除 / 7 工作天回覆）—— 帳號系統需確保 UI 上真的能行使（見 §4 checklist）
- ✅ 保存期限（結案後 2 年 / 刪除請求 30 天清除）—— 帳號刪除流程需對齊（呼應 docs 11-gdpr-deletion-sop）

### 3.4 帳號系統實作時，個資面的 3 個硬要求（給卡西法）

1. **密碼絕不明文**：bcrypt / argon2 雜湊，平台與 Edward 都無法還原。privacy §2 要明寫此事實。
2. **電話最小化**：能不設必填就不設必填；若設必填，揭露同步改 + 說明必要性。
3. **刪除真的可執行**：用戶按「刪除帳號」要真的能在 30 天內清除雙邊資料（含 Supabase row + 備份輪替），不是 UI 假按鈕。這是 §6 權利能否兌現的關鍵，也是出事時的合規證據。

---

## 4 · 拿掉 demo 標籤前提 checklist（Gate 5 · 不裸拿標籤）

拿掉 demo 標籤 = 對外宣告「這是真的」。一旦宣告，用戶會真的投入真實個資與信任。所以**標籤不能比基礎設施先拿掉**——否則就是「宣稱正式、實則沒到位」，這正是我最該擋的「沒人想到會出事的地方」。

### 拿 demo 標籤前，以下 N 項必先到位（GO 條件）

| # | 前提項 | 主責 | 為什麼是前提 | 狀態 |
|---|---|---|---|---|
| 1 | 帳號系統 live（註冊 / 登入 / session 真的運作） | 卡西法 | 「真服務」最低門檻、用戶要能真的有帳號 | ⬜ 待 sprint |
| 2 | 密碼雜湊儲存（非明文、平台不可還原） | 卡西法 | 拿真個資前的資安底線、Gate 5 硬項 | ⬜ |
| 3 | 電話收集目的揭露補進 privacy（§3.2） | 卡西法 實作 / 蘇菲 核稿 | 開始收電話前揭露必到位（個資法 §8） | ⬜ |
| 4 | privacy / terms 的 POC / 模擬 / 無法律效力字眼改為 Early Beta（§2.1） | 卡西法 / 蘇菲 | 條款不可再自我否定、否則綁定力存疑 | ⬜ |
| 5 | 橫幅文案換成 §1 選定版本（5 個 i18n key） | 卡西法 / 女巫 | 拿掉 demo 的可見動作本體 | ⬜ |
| 6 | 帳號刪除真的可執行（30 天清雙邊資料 + 備份） | 卡西法 | §6 當事人權利要能兌現、不是假按鈕 | ⬜ |
| 7 | Supabase RLS 已硬化（雙邊資料隔離） | 卡西法 | 真個資進來前、防越權讀取（呼應 02-rls-hardening.sql / 02-trust-audit） | ⬜ 復查 |
| 8 | OAuth 識別碼揭露補進 privacy §2 | 卡西法 / 蘇菲 | Google sub / email 儲存的告知義務 | ⬜ |
| 9 | 責任上限 + 平台聲明已正式（非展示用） | 沙利曼 5/28 已做 | 真服務需有真的責任邊界 | ✅ 已完成 |
| 10 | Gate 5 全套復跑（secret 掃描 / auth / CVE / license） | 沙利曼 | 部署前信任關卡、帳號系統新 endpoint 必過 auth 檢查 | ⬜ 部署前 |

### 額外觸發項（僅路徑 B · 拿 demo + 同時開始收費才需要）

| # | 項目 | 為什麼 |
|---|---|---|
| B1 | Edward 親口再拍板「開始收費」（Tier D） | 收費是不可逆的商業 + 法律承諾 |
| B2 | 電子發票機制（營業稅法） | terms §3.3 收費即觸發開票義務 |
| B3 | 退費條款生效 + 流程 UI | terms §4 預告轉為正式 |
| B4 | 金流 vendor 風險評估 + DPA | 碰錢即觸發 vendor 風險 + KYC |
| B5 | take rate 表 §3.2 由「預告」轉「生效」 | 抽成正式啟用 |

> 沙利曼建議：路徑 A（拿 demo + 保留早期免費）可在帳號 sprint 內完成；路徑 B 另開 spec、不混在這次。

### NO-GO 判定（任一成立 = 不准拿掉 demo 標籤）

- ❌ 帳號系統收真實個資、但密碼明文或無 RLS → **NO-GO**（資安 breach 風險）
- ❌ 開始收電話、但 privacy 無電話目的揭露 → **NO-GO**（個資法 §8 違反）
- ❌ 橫幅改「正式服務」、但條款仍寫「僅為展示、無法律效力」→ **NO-GO**（自相矛盾、條款綁定力存疑）
- ❌ 路徑 B 收費、但無發票機制 → **NO-GO**（營業稅法）

---

## 5 · 給卡西法帳號 sprint 的實作清單（濃縮）

1. **i18n（5 key × 2 語）**：`disc_top_label` / `disc_top_body` / `disc_foot` 改 §1 選定版（dict.zh.js + dict.en.js + app.html inline 三處同步）
2. **icon**：`🚧` → 女巫定（建議 `🌱` 或移除）
3. **privacy.html**：POC/模擬/無法律效力 → Early Beta（§2.1 清單）+ 補電話目的揭露（§3.2）+ 補密碼雜湊 + OAuth 識別揭露（§3.4）
4. **terms.html**：POC → Early Beta（§2.1 清單）；金流字眼依路徑 A 保留「免費」
5. **帳號系統資安**：密碼雜湊 + RLS 復查 + 刪除可執行（§3.4 / §4 checklist 2/6/7）
6. **部署前**：派沙利曼跑 Gate 5 全套（checklist #10）

---

## 附錄 · 沙利曼的一句話總結（給蘇菲轉述 Edward）

> 「正式服務」我擋下一個誤解先：拿掉 demo 標籤 = 宣告「這是真的」，但不必然 = 「現在開始抽成」。
> 我建議走「拿掉 demo + 保留早期免費」這條路——最穩、最快、早期免費本身就是賣點。
> 真要連收費一起開，那是另一筆帳（發票、退費、金流全套），請 Edward 親口再拍一次。
> 橫幅 3 版我寫好了、條款字眼盤點清楚了、電話揭露這個我之前標的待補項這次補進去了。
> 帳號 sprint 前提我列了 10 項——標籤不能比地基先拿掉，不然就是「宣稱正式、實則裸奔」，那是我最該擋的地方。

---

*31 號 spec · 沙利曼 · 2026-05-29 · Gate 5 信任視角 · 配卡西法 28 號 PMF 帳號 spec 同 sprint 實作*
