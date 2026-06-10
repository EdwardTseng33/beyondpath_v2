# 41 · 上線後端到端實測 + 流程細節技術檢查 · 卡西法（CTO / Gate 1）

作者：卡西法（CTO · Gate 1 主責 · Opus 4.8）
日期：2026-06-01（接 5/31 Edward 仔細檢查每一處與每一個流程細節）
對象：正式站 https://beyondpath.tw（已上 prod：前端 + 22 後端函式 + 資料庫搬遷）
方法：prod 真實瀏覽器實測（自己的 Chrome tab、不動蘇菲 tab）走 client / worker / sign-in 三線 + code 層交叉驗證 + 本地 preview（port 5859）真 375 viewport 手機版 emulation
紀律：prod 只讀 + 走流程、不真送出、不發真信、不直接 prod deploy。改 code 一律回報不自行 push。

## TL;DR

整條服務 prod 真的串起來了，不是 code 層想像，這次是真瀏覽器實測。三條主線（發案 / 接案 / 登入）全程無白屏、無產品 console error、無水平破版、狀態轉換正確、登入閘真的攔得住、後端橋接層（bpAuth / bpClientIntake / bpProfile / bpVerticals / bpFunnel）全部接到真 Supabase（不是 mock）、領域鎖 RPC 真的連 DB 動態擋掉沒人的領域。14 個 prod 頁面全 200、root 正確 redirect、jsx/dict 全載入。

沒有 上線即影響用戶必修 級的阻斷 bug。發現的問題全是優化級：CTA 雙箭頭文字瑕疵、AI parse 完成後標題沒更新、語言鈕觸控區 36px、waitlist.html 孤兒舊頁殘留 beta 文案、robots.txt 註解殘留 invite-only、sitemap lastmod 沒更新。

手機 375 版（女巫之前卡在工具沒測成的部分），我用 Claude_Preview MCP 的真 device emulation（Claude_in_Chrome 的 resize_window 在這台高 DPI 機器改不到 render viewport，這就是女巫卡住的根因）測成了：landing / 發案 wizard / sign-in 三頁在真 375 viewport 下零水平溢出、零破版。

## 一 Client 發案線實測（landing 到 wizard 到 送出撞登入閘 到 sign-in）

架構釐清（重要）：12 步 stepper（Pre-intake 到 Retainer）是 DEMO NAV 服務旅程導覽、頁面明標 用戶端不會看到。真實 client 發案表單是 app2.jsx 內部 4 步（step 0-3，setStep clamp Math.min(3)）。送出在 step 3 透過 IntakeSubmitModal。

- 步 0 Pre-intake：選領域 + 貼上傳 brief + 選身分（個人公司）+ 勾同意條款。渲染完整。前進門檻 canContinue() = vertical + brief 大於 30字 + clientType + betaAck（公司還要公司名）。未滿足時 CTA disabled + MissingHint 明確列缺什麼。實測選身分加勾條款後 CTA 由 disabled 到 enabled，狀態正確。
- 步 1 Confirm：補完偏好。前進成功、無 error。
- 步 2 AI Parse：loading 動畫。解析中 CTA disabled（state.parseDone gate）；解析完成 loading 消失、parsed content 出現（body 865 到 2075字）、CTA 解鎖。gate 正確。
- 步 3 送出：顯示候選案例參考 + Submit 鈕。點 Submit 只開 modal（不寫 DB）。我停在此不真送出。

登入閘（核心驗證）：
- prod 後端橋接層全掛載 + 真 Supabase client（非 mock）：bpAuth（signInWithGoogle signInWithEmail signOut getUser getSession onAuthStateChange）、bpClientIntake.submit、bpProfile、bpVerticals、bpFunnel、window.supabase 全 object。登入閘不是虛設。
- 我實際是未登入狀態（右上 Edward 顯示是 demo 預設、bpAuth.getUser() 回 loggedIn false）。所以點 Submit 真的走 need-login 分支。
- Modal mode need-login 顯示：送出前先登入 + 你填好的需求已暫存 登入後自動帶回來續送不用重填 + 取消 + 登入後送出。文案優秀（消除 填半天要重來 焦慮）。
- 點 登入後送出 到 草稿存進 localStorage bp-intake-draft（2541字）到 跳 sign-in.html 帶 return 與 role 與 resume=1。參數都帶上、草稿保住、resume 機制 code 已驗。

判定：client 發案線全通、無斷點、無白屏、無 error、文案清楚。這是上線核心路徑，PASS。

## 二 領域鎖（只開池子有人的領域）prod 實測

- bpVerticals.getAvailableVerticals() RPC 真連 DB、回 3 個有 approved worker 的領域。
- Step 0 共 15 張領域卡：5 張 enabled（Custom Software Dev / AI Agent / B2B SaaS GTM / Brand Market Research / Other）、10 張 disabled（opacity 0.45 + cursor not-allowed + tooltip 此領域 worker 累積中 + meta 文字 worker 累積中 取代 sample workers + onClick 擋住）。
- 初始預選 vertical 若無人，前端自動切到第一個有人的領域（doc 34 P0-3 fallback 實證生效），當前選的是 Custom Software Dev（enabled），不會卡死。

判定：領域鎖上線後真的生效（disable 灰掉 + 累積中提示 + 自動切換）。PASS。

待蘇菲確認的小事：RPC 回 3 vs UI enabled 4 個業務領域卡 + Other。可能是一個 RPC vertical 對應多張前端細分卡的映射。建議蘇菲確認每張 enabled 業務卡背後真有 approved worker（避免用戶選了顯示有人但其實空池的領域、配對落空）。非阻斷、低風險。

## 三 Sign-in 登入線實測（email Google）

- prod 載入完整、無 error、role=client 正確帶入（CLIENT toggle 高亮）。
- 雙路：Continue with Google OAuth + email magic link（寄登入連結給我）。
- 隱私文案到位：用 Google 登入只會看到你的 email 與大頭照不存其他資料。
- email 格式驗證：填無效 not-an-email 按送出 到 HTML5 原生驗證攔截（type=email）+ code regex 雙保險 到 停在頁面、沒呼叫 signInWithEmail、沒發信。表單驗證生效。
- 安全亮點（沙利曼 Gate 5）：getReturnFromQuery() 只接受站內相對路徑、擋 open-redirect。登入成功後有 return 目標就導回原處續送。

判定：sign-in 流程順、雙路登入 + email 驗證 + open-redirect 防護到位。PASS。（不真送 magic link Google 完成登入，避免發真信、且無測試帳號。）

## 四 Worker 接案線實測（landing 到 加入接案網路 到 認證申請）

- app.html role=worker onboarding=1 渲染完整、無白屏、worker.jsx（122KB 最大檔）載入、無產品 error。
- 去 BETA 乾淨：APPLY TIER B CERTIFICATION APPLICATIONS OPEN（不再是 beta 邀請制）。
- 內容：Hero 1 step away from the closed club + 資深 worker fast-track（30min 視訊跳過 4 步）+ Tier B 認證 4 步（Submit form / Upload 3 portfolio / AI 拆解評估 / 30min video review）+ 數據（AVG 7 days / pass 約 28% / Tier A 小於 10%）。
- 主路徑 CTA 我有 ChatGPT Claude Gemini 自己跑訪談 點進 Step 1 貼 Brief：1918字訪談 prompt textarea + 複製 BRIEF + 打開 Claude ChatGPT Gemini + AI 跑完了貼回來。狀態轉換正確。
- worker 申請最終也走同套 bpAuth 登入閘。不真送（避免髒 worker_applications）。

判定：worker 認證申請線通、結構清楚、文案到位。PASS。

console 雜訊澄清：worker 頁讀到 5 條 EXCEPTION（A listener indicated an asynchronous response by returning true but the message channel closed），這是 Chrome extension content script 注入的雜訊（來源 0:0、無 jsx 行號），非 BeyondPath 程式碼 error。產品自身 errorTextInBody false。

## 五 手機 375 版（真 device emulation 解女巫卡住的工具問題）

工具根因：Claude_in_Chrome 的 resize_window 在這台高 DPI 桌面螢幕改不到 render viewport（量到 innerWidth 永遠 2560，連蘇菲的 m375 tab 也是 2560），這就是女巫之前卡住的原因。解法：改用 Claude_Preview MCP（起本地 server port 5859 + preview_resize mobile preset）等於真 375x812 viewport emulation。

- landing 375：水平溢出無（docScrollW 375 hScroll false）。overflow 元素 25 個但全是 SVG 星空裝飾 line，被 overflow hidden 容器裁切、用戶看不到 scroll。無破版。
- 發案 wizard（app client）375：水平溢出無。overflow 元素 0 個。無破版（MobileShell IOSDevice 外框分支 375 下渲染完美）。
- sign-in 375：水平溢出無。overflow 元素 0 個。無破版。

Touch target（真 375 量測）：
- 三頁主互動元素（發案接案 CTA、Continue with Google、email input、寄登入連結）全大於等於 44px。
- 同意條款 checkbox 視覺 13x13 但包在 label 304x38，點 label 任何處都 toggle（HTML 原生），實際 hit area 304x38、手機可點，非阻斷（高度 38 略低 44、優化級）。修正 5/20 audit checkbox 選不到 的 Critical 判定，有 label 救濟。
- 剩小目標：語言鈕 中 EN 36x36、footer inline text links（14-21px）等於優化級次要連結。

暗色模式：BeyondPath 本身就是暗色設計（深色背景為預設、無 light dark 切換），切暗色模式對這站不適用，無 light mode 需驗。

判定：三頁手機版零破版、零水平溢出、主互動觸控 OK。PASS。

## 六 全站頁面健康 + 跨頁一致性

- 14 個 prod 頁面 + legal 子頁全 200（landing about sign-in app waitlist contract-verify arbitration mobile nps worker-payout payment-thanks admin legal-privacy legal-terms）。root 到 307 redirect 到 landing.html。無 404、無死連結。
- jsx dict 資源含 cache-buster v=2026-05-31-launch 全 200（app2 steps-5-8 steps-9-12 dict.zh worker admin）。
- 去 BETA：landing about legal-privacy legal-terms 乾淨。landing 的 waitlist 3 處全是 i18n key 名（disc.foot_waitlist 等）、實際 href 都指 app.html role=client、文案 立即發案，無真連結指向 waitlist.html。

## 七 問題清單（分級）

### 上線即影響用戶必修（阻斷級）0 個

無。三條主線無白屏、無 error、無破版、無斷流程、登入閘有效、後端真接。

### 優化級（不阻斷上線後可排程修）

- O1 app2.jsx CTA：所有 wizard CTA 文字渲染成雙箭頭（Confirm expectations 兩個箭頭 / Run AI parse 兩個箭頭）。影響視覺小瑕疵。建議 ctaLabel 已含箭頭、渲染模板可能又加一個，查 button 模板移除重複箭頭。
- O2 app2.jsx step 2：AI parse 完成後標題仍 AI is reading your brief（沒更新成 拆解完成）。影響文案不精準、用戶不確定是否完成。建議 parseDone true 時切標題。
- O3 waitlist.html：孤兒舊頁，H1 想收到 BeyondPath beta 進度、note 第一批 beta 試做、mailto BeyondPath Waitlist，跟正式 開放申請 定位矛盾。影響低（全站無入口連到它、不在 sitemap）；但直接打 URL 舊書籤 舊外部連結會看到矛盾舊文案。建議 去 BETA 收尾一併更新文案或下架（建議下架 + 301 到 app.html role=client）。
- O4 robots.txt：註解殘留 BeyondPath POC invite-only product。影響極低（crawler 不解讀註解）、去 BETA 痕跡。建議改 open application。
- O5 sitemap.xml：lastmod 全 2026-05-15、5/31 大改後沒更新；缺 about.html。影響 SEO 細節（搜尋引擎不知頁面已更新）。建議 bump lastmod + 補 about.html。
- O6 語言鈕 領域鎖映射：(a) 中 EN 語言鈕 36x36 略低 44 (b) RPC 3 vs UI enabled 4 業務卡 映射待蘇菲確認每張卡真有 worker。影響低。建議 (a) 補 padding 到 44 (b) 蘇菲核對映射。

### 環境雜訊（非產品問題不修）
- Chrome extension 注入的 5 條 message-channel EXCEPTION（0:0、非 BeyondPath code）。
- Babel in-browser transformer production warning（in-browser babel 固有；長期可考慮 precompile 省效能成本、但非上線阻斷）。

## 八 給蘇菲 Edward 的一句話

整條順、能上線、用戶走得通。沒有會擋死用戶的 bug。剩下的 6 個優化（雙箭頭、parse 標題、waitlist 孤兒頁、robots sitemap 收尾、語言鈕觸控）都是上線後排個小 sprint 收乾淨的程度、不擋現在開門做生意。手機版三頁實測零破版，女巫卡的工具問題我用 Claude_Preview 真 emulation 繞過了。

整體 GO NO-GO 留給馬魯克（Gate 4），我不自審我串的東西。我這關（Gate 1 流程測試）：PASS。

---

卡西法 2026-06-01 prod 真瀏覽器實測 + 本地 375 emulation 工時移動城堡估約 50 min（含工具受限繞道）無改任何 prod code
