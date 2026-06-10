# BeyondPath PMF 正式上線 · STATUS

> 最後更新：2026-06-10（週三）· 維護：蘇菲（主對話）
> 跨 session hub — 新 session 開場讀此檔接上全局

---

## 一句話現況

正式站已上線且運轉（金流函式全部活在 prod、開放申請文案已生效、中英 i18n 完整）。2026-06-10 全產品 QA（6 面向 + 11 合成用戶）結論：六面向全 🟡、無 🔴，骨架健康、法務金流是真功夫，但「從 demo 升級正式收費」收尾沒清乾淨。完整報告：[docs/qa-2026-06-10-full-product-qa.md](docs/qa-2026-06-10-full-product-qa.md)。

### 2026-06-10 QA 四大項 → 同日全數處理完畢（Edward 點頭 · 蘇菲執行 · prod 已驗證）
1. ✅ **資安 P0 已擋**：`.vercelignore` 上線，`/docs/*` + `/*.md` + `supabase/` + 備份檔正式站全部 404（實測過）；legal 頁正常未誤擋
2. ✅ **版控已補**：快照 commit `fd85d1c` + 退版錨點 tag `v0.9.0-prod-snapshot-20260610`，已上傳 GitHub（branch `feat/i18n-phase1-step1`）
3. ✅ **金流文案 17 處全對齊代收代付**：Step07 整面 / dict 中英 / worker fallback / 配對信 4 處（notify-lead-slack 已重新上線）/ 英文 escrow·custody 9 處 / 「+15% 平台溢價」矛盾句 4 處
4. ✅ **Tier 階梯已統一**：S/A+/A/B+/B（中英 dict 同步、prod dict 實測確認）
- 全站 cache-buster 統一 `?v=2026-06-10-pay`（mobile.html 首次補上）
- prod 部署 `prototype-v02-88q6dd4wa` · 出事退版：Vercel promote 前一版 + git tag 雙保險

### ⚠️ 本檔先前過時點（已於 6/10 修正認知，code 待後續同步）
- 舊版標 ecpay-webhook / mark-commission-event / 7 個 rate-limit 為「未 deploy」→ **實測證實全部已上線 prod**
- 5/31 antispam migration + SLA 紅燈、6/1 admin Dashboard + M-1/M-2 通知，先前未記入本檔

---

## 5/29 交付總覽（一整天）

| 區塊 | 內容 | 狀態 |
|---|---|---|
| 金流閉環 | ecpay-webhook 付款成功 → 自動寫 commission_records → admin「已收款」自動跳 | code ✅ 未 deploy |
| 帳號系統 | 雙邊 email 註冊 + 登入閘（只攔送出那刻）+ 完整資料 gate（profiles.profile_complete）| code ✅ 未 deploy |
| 發案領域鎖 | bp_available_verticals RPC，只開池子有 approved worker 的領域（動態）| code ✅ 未 deploy |
| admin 登入閘 | AdminAuthWrapper + ADMIN_EMAILS 白名單 + forbidden 不洩資料 | code ✅ 未 deploy |
| 正式收費 | 代收代付 B + Tier 費率對齊（B20/B+19/A18/A+17/S17，retainer +3）| code ✅ 未 deploy |
| 退費 event | commission_records 加 refund_issued + ecpay_refund | code ✅ 未 deploy |
| 去 BETA 文案 | 全平台「BETA/demo/POC/測試/邀請制/waitlist」清除 → 開放申請定位 | ✅ 完成 |
| 條款去 Beta | terms/privacy v1.2 純標籤清 + 違約金理由換正式版 | ✅ 完成 |
| 責任上限 | Beta 50K/正式 200K → 服務費 ×3 保底 5 萬（兩份同步）| ✅ 完成 |

## 三路上線前確認（5/29 晚）

- **doc 34（卡西法）技術串接**：20 環節資料流全通、0 真斷點、本地 5 頁全綠
- **doc 35（馬魯克）服務流 QA**：三大斷點 code 全修、未部署所以正式站還跑不通
- **doc 36（蕪菁頭）PMF 量化**：能量化、北極星=雙邊 60 天回購率、8 個關鍵數撈得到、唯一盲點=發案放棄沒埋點

---

## 關鍵決策（Edward 拍板）

- **金流**：B 代收代付（走綠界、沙利曼 Gate 5 確認合法、跟 Pro360 同路、繞開銀行法 §29）
- **軟體交付範圍**：B（交付成果 + 協助上線）
- **責任上限**：服務費 ×3、保底 NT$50,000（去 Beta 後）
- **定位**：認證制接案網路、開放申請（worker 認證門檻 / client 註冊即發案）
- **身份驗證**：PMF 輕量（email + 電話必填 + Edward 人工覆核、無證件 / 無人臉）
- **發案領域**：只開池子有人的（agent / strategy / software + 其他），池子加人自動開

---

## 上線清單

**✅ 已完成**：綠界鑰匙（Edward 設）/ Storage buckets（蘇菲建）/ Edward 接案者檔案入池 / 全部程式

**⬜ 待做（上線）**：
1. 跑搬遷 SQL ×4 — 合併檔 `docs/deploy/2026-05-29-all-migrations.sql`（蘇菲可代跑）
2. 開 Supabase Auth email provider + Redirect URLs（`/app.html` + `/admin.html`）— Edward 後台 / 蘇菲可瀏覽器代
3. 金流函式上正式站 — **需 Edward 點頭 + 先看 preview**（classifier 擋 prod 金流 deploy、v1.0.8 教訓）
4. 出 preview 測試連結 → Edward 視覺審 → 整批上 prod

**待 deploy 函式**：ecpay-webhook / mark-commission-event / submit-signature(scope-aware) / 7 個 rate-limit

---

## 5/30 自治優化（完成）

- ✅ PMF 漏斗埋點（發案中途放棄追蹤、純前端 localStorage、零個資、不改設計）
- ✅ 金流矛盾修正（發案頁 app2.jsx L312「不代收專案款」舊路徑 A 文案 → 接 dict 代收代付版，全頁金流說法一致）
- ✅ beta 殘留清除 6 處（去字留義）+ 編譯全綠 + i18n 772=772 對齊
- ✅ STATUS + doc 36 PMF 量化框架存檔

## 待續

- 🔄 去 BETA 大改動視覺驗收（女巫 Gate 2 進行中）
- 上線編排（需 Edward 參與：Auth 設定 + preview 視覺審 + 金流點頭）
- worker 端漏斗埋點（client 已補、worker 同類缺口待補）
- 全站漏斗數據進 admin（需建 funnel_events table + deploy、要 Edward 拍）

## ⚠️ deploy 時必做（cache-buster）

改了 app2.jsx + dict.zh.js + dict.en.js → app.html 這 3 行 `?v=` 都要 bump 成 `?v=2026-05-30-funnel-beta`（L371 dict.zh / L372 dict.en / L397 app2.jsx），否則用戶 CDN 命中舊版

---

## doc 索引（docs/launch/）

28 帳號 auth / 31 demo→正式 / 32 收費 billing / 33+35 服務流 / 34 技術串接 / 36 PMF 量化
