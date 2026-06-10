# BeyondPath 2.0（worker 媒合 POC）· 產品護照

> 套用範本：`~/.claude/protocols/product-passport-template.md`
> 配合 SOP：`~/.claude/sops/v5.4.x/v5.4.22-multi-product-portfolio.md`
> 建立日：2026-05-21 · 蘇菲首次填入、缺項標「待 Edward 補」

---

## § 1. 願景 / 為什麼存在

worker（freelancer / soft skill 工作者）與發案方的媒合 POC、含信任機制與付款流程。本身是獨立新產品、剛好掛 beyondpath.tw 域名。**不是 BeyondPath 的下一代**——是不同產品。

## § 2. 定位 / 目標用戶

- **主要**：worker（freelancer · 認證導向）+ 發案方（小企業 / 個人）
- **不是**：BeyondPath（PATH 工具）的延伸 user · 不是純台灣（國際待 Edward 補）

## § 3. 設計 DNA

待 Edward 補（從 landing.html / app.html 觀察、shipped 設計風格已存在、需 Edward 確認核心 DNA 敘述）

預估方向（蘇菲觀察 prototype-v0.2 推斷、待 Edward 確認）：
- 字體：可能企業 sans-serif（非 BP 老的 warm-serif）
- 質感：trust + 跨境 POC 形象

## § 4. 當前狀態

- **階段**：POC prototype v0.2、上線中
- **上線網址**：beyondpath.tw/（含 landing.html / app.html / sign-in.html / legal/privacy.html）
- **後端**：Supabase（含 send-decision-email / notify-lead-slack / worker-ack-email / worker-accept-decline functions）
- **最近 handoff**：`docs/handoff-2026-05-19.md` ← 本檔過期時以該檔為準
- **launch 文件**：`docs/launch/00-launch-plan-sophie.md` 系列（含 tech-audit-calcifer / rls-hardening / qa-launch-checklist / trust-audit-suliman / launch-roadmap-howl / jwt-rotation / gdpr-deletion）
- **下一步**：待讀最新 handoff 確認

## § 5. 真實用戶 feedback 來源

- **真實用戶聯絡管道**：worker submitted flow（`app.html?role=worker&onboarding=1&submitted=1`）+ notify-lead-slack（看 Slack 接到的 lead）
- **回饋頻率**：待 Edward 補
- **負責人**：Edward
- **回饋紀錄位置**：待建立
- **當前缺口**：是真實 POC、有真實 worker 申請 flow、但 feedback 收集機制尚未明文化

## § 6. 競品紀錄

待補（不同於 BP 老的、競品池可能含跨境 freelance 平台 · Upwork / Fiverr / Toptal / 在地媒合平台）

## § 7. 失誤 / lesson 紀錄

待 Edward / 蘇菲下次接到該產品 session 時補（POC 階段、應該有早期教訓累積中）

## § 8. 對外政策

- **Tier A-B 自決**：UI 微調 / 文案修正 / 後端優化（過 Gate 1+2+5）
- **Tier C 必先 Edward 拍板**：worker 註冊規則變動 / 付款流程變動 / GDPR 相關
- **NO-GO**：對外發佈 / 媒體（POC 階段、低調為主）

## § 9. 城堡團隊配置

- **主力**：卡西法（Supabase + edge functions）+ 沙利曼（trust audit / RLS / JWT rotation / GDPR）+ 馬魯克（QA launch checklist）
- **launch 期** 動員：sophie launch plan + calcifer tech audit + suliman trust audit + markl QA + howl roadmap = 5 人 council

## § 10. 跨產品共用素材

- **跟 BeyondPath 的關係**：不同產品、Edward 2026-05-21 明確區分
- **共用體系**：可能掛同一 Beyondspec 體系（待 Edward 確認）
- **共用後端**：使用 Supabase（不同於 BP 老的 Firebase）

---

*v0.1 初版 · 2026-05-21 · 蘇菲填入、Edward 待補 § 3 設計 DNA + § 5 真實用戶 feedback 細節*
