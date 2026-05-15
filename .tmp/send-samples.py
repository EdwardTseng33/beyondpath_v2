# -*- coding: utf-8 -*-
# Polish v6 worker + client confirmation email · 系統化 AI 化、移除所有 Edward 親自字眼
# 跟 supabase/functions/notify-lead-slack/index.ts buildWorkerConfirmEmail / buildClientConfirmEmail 1:1 同源
import json, urllib.request, sys

API_KEY = "re_DdL1423J_4dHNbJvw6gVunr6jLyZuTfaD"
TO = "edwardt0303@gmail.com"
FROM = "BeyondPath <hello@beyondpath.tw>"
HOMEPAGE = "https://beyondpath.tw"

# ============ Worker Sample ============
name = "Arc (Sample)"
lScore = 7
tier = "B+"
verticals = "DTC 內容 · B2B SaaS GTM"
caseCount = "5-15"

worker_html = f"""<!DOCTYPE html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>BeyondPath · Application Received</title></head><body style="font-family:'IBM Plex Sans','Noto Sans TC',system-ui,sans-serif;background:#0a0a0b;color:#f0eee8;margin:0;padding:40px 20px;">
<div style="max-width:580px;margin:0 auto;background:#141416;border:1px solid #2a2a2e;padding:40px 36px;">

  <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.18em;color:#c7e84a;margin-bottom:20px;">● BEYONDPATH · APPLICATION RECEIVED</div>

  <h1 style="font-family:Georgia,'Noto Serif TC',serif;font-style:italic;font-size:30px;font-weight:400;line-height:1.25;margin:0 0 8px;color:#f0eee8;">{name}，</h1>
  <p style="color:#c8c6c0;line-height:1.75;font-size:16px;margin:0 0 28px;">謝謝你加入 BeyondPath closed club 的申請。</p>

  <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.12em;color:#9a9aa3;text-transform:uppercase;margin-bottom:12px;">▍ 系統初評 / SYSTEM EVALUATION</div>
  <table style="width:100%;border-collapse:collapse;margin-bottom:28px;font-size:14px;">
    <tr><td style="padding:8px 0;color:#9a9aa3;border-bottom:1px dashed #2a2a2e;width:120px;">AI L-Score</td><td style="padding:8px 0;color:#c7e84a;border-bottom:1px dashed #2a2a2e;font-family:'JetBrains Mono',monospace;font-weight:700;">{lScore} / 10</td></tr>
    <tr><td style="padding:8px 0;color:#9a9aa3;border-bottom:1px dashed #2a2a2e;">建議 Tier</td><td style="padding:8px 0;color:#c7e84a;border-bottom:1px dashed #2a2a2e;font-family:'JetBrains Mono',monospace;font-weight:700;">{tier}</td></tr>
    <tr><td style="padding:8px 0;color:#9a9aa3;border-bottom:1px dashed #2a2a2e;">領域</td><td style="padding:8px 0;color:#c8c6c0;border-bottom:1px dashed #2a2a2e;">{verticals}</td></tr>
    <tr><td style="padding:8px 0;color:#9a9aa3;">案件數量</td><td style="padding:8px 0;color:#c8c6c0;">{caseCount}</td></tr>
  </table>

  <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.12em;color:#9a9aa3;text-transform:uppercase;margin-bottom:12px;">▍ 接下來 24 小時 / NEXT 24H</div>
  <p style="color:#c8c6c0;line-height:1.7;font-size:15px;margin:0 0 14px;">BeyondPath 系統將完成多維評估、回信告知你結果。三種可能：</p>
  <div style="background:rgba(199,232,74,0.04);border-left:2px solid #c7e84a;padding:16px 20px;margin:0 0 14px;color:#c8c6c0;line-height:1.85;font-size:14px;">
    <div style="margin-bottom:6px;"><span style="color:#c7e84a;font-weight:700;">✓</span> 「歡迎進首案池」 + 第一個案件方向預告</div>
    <div style="margin-bottom:6px;"><span style="color:#d4712a;font-weight:700;">◐</span> 「需補資料再評估」 + 具體要補哪些 case 截圖 / testimonial</div>
    <div><span style="color:#9a9aa3;font-weight:700;">✗</span> 「暫不通過、6 個月可重新申請」 + 具體補強方向</div>
  </div>
  <p style="color:#9a9aa3;font-size:13px;font-style:italic;margin:0 0 32px;">不會超過 24h 沒任何系統回覆。</p>

  <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.12em;color:#9a9aa3;text-transform:uppercase;margin-bottom:12px;">▍ BeyondPath 是什麼 / WHAT IS BP</div>
  <p style="color:#c8c6c0;line-height:1.75;font-size:14px;margin:0 0 12px;">台灣首個 <b style="color:#f0eee8;">AI 認證交付網路</b>、用 <b style="color:#f0eee8;">AI 評估 + 多維配對演算法</b>媒合付費 AI 工具有實戰經驗的 worker 跟品牌。</p>
  <p style="color:#9a9aa3;line-height:1.75;font-size:13px;margin:0 0 28px;font-style:italic;">目前 prototype 階段、預計 <b style="color:#c7e84a;font-style:normal;">2026 Q3</b> 正式上線。你會是首批 <b style="color:#f0eee8;font-style:normal;">founding worker</b>。</p>

  <div style="background:rgba(255,255,255,0.02);border:1px dashed #2a2a2e;padding:14px 18px;margin:0 0 24px;color:#c8c6c0;line-height:1.6;font-size:13px;">
    → 想補資料 (case 截圖 / 客戶 testimonial) 寫信到 <b style="color:#c7e84a;">hello@beyondpath.tw</b>
  </div>

  <hr style="border:none;border-top:1px solid #2a2a2e;margin:24px 0;"/>
  <p style="color:#9a9aa3;font-size:12px;margin:0 0 8px;">— BeyondPath · <a href="{HOMEPAGE}" style="color:#c7e84a;text-decoration:none;">{HOMEPAGE}</a></p>
  <p style="color:#6a6a72;font-size:10px;font-family:'JetBrains Mono',monospace;letter-spacing:0.04em;margin:8px 0 0;">prototype 階段 · 不簽法律效力文件 · 不收申請費 · 正式服務於 2026 Q3 啟動</p>
</div>
</body></html>"""

# ============ Client Sample ============
company = "Lumine (Sample)"
budget = "NT$ 150,000 ~ 300,000"
timeline = "4-6 週"
vertical = "DTC 保養品牌"
enterpriseFlags = "公司發票 · 公司簽約"

client_html = f"""<!DOCTYPE html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>BeyondPath · Brief Received</title></head><body style="font-family:'IBM Plex Sans','Noto Sans TC',system-ui,sans-serif;background:#0a0a0b;color:#f0eee8;margin:0;padding:40px 20px;">
<div style="max-width:580px;margin:0 auto;background:#141416;border:1px solid #2a2a2e;padding:40px 36px;">

  <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.18em;color:#c7e84a;margin-bottom:20px;">● BEYONDPATH · BRIEF RECEIVED</div>

  <h1 style="font-family:Georgia,'Noto Serif TC',serif;font-style:italic;font-size:30px;font-weight:400;line-height:1.25;margin:0 0 8px;color:#f0eee8;">{company}，</h1>
  <p style="color:#c8c6c0;line-height:1.75;font-size:16px;margin:0 0 28px;">謝謝你把 brief 交給 BeyondPath。</p>

  <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.12em;color:#9a9aa3;text-transform:uppercase;margin-bottom:12px;">▍ 需求初評 / INITIAL READ</div>
  <table style="width:100%;border-collapse:collapse;margin-bottom:28px;font-size:14px;">
    <tr><td style="padding:8px 0;color:#9a9aa3;border-bottom:1px dashed #2a2a2e;width:120px;">預算範圍</td><td style="padding:8px 0;color:#c7e84a;border-bottom:1px dashed #2a2a2e;font-family:'JetBrains Mono',monospace;font-weight:700;">{budget}</td></tr>
    <tr><td style="padding:8px 0;color:#9a9aa3;border-bottom:1px dashed #2a2a2e;">時程</td><td style="padding:8px 0;color:#c8c6c0;border-bottom:1px dashed #2a2a2e;">{timeline}</td></tr>
    <tr><td style="padding:8px 0;color:#9a9aa3;border-bottom:1px dashed #2a2a2e;">領域</td><td style="padding:8px 0;color:#c8c6c0;border-bottom:1px dashed #2a2a2e;">{vertical}</td></tr>
    <tr><td style="padding:8px 0;color:#9a9aa3;">Enterprise</td><td style="padding:8px 0;color:#d4712a;font-family:'JetBrains Mono',monospace;font-size:13px;">{enterpriseFlags}</td></tr>
  </table>

  <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.12em;color:#9a9aa3;text-transform:uppercase;margin-bottom:12px;">▍ 接下來 24 小時 / NEXT 24H</div>
  <p style="color:#c8c6c0;line-height:1.7;font-size:15px;margin:0 0 14px;">BeyondPath 配對演算法將完成媒合、回信告知你結果。四種可能：</p>
  <div style="background:rgba(199,232,74,0.04);border-left:2px solid #c7e84a;padding:16px 20px;margin:0 0 14px;color:#c8c6c0;line-height:1.85;font-size:14px;">
    <div style="margin-bottom:6px;"><span style="color:#c7e84a;font-weight:700;">✓</span> 配 <b>1-3 位</b> Tier B+ / A worker 名單 + 能力卡 + 報價 + 試做案建議</div>
    <div style="margin-bottom:6px;"><span style="color:#d4712a;font-weight:700;">◐</span> brief 需補資料 (預算 / 時程 / deliverable 細節)</div>
    <div style="margin-bottom:6px;"><span style="color:#7eb6ff;font-weight:700;">◑</span> 建議深聊 <b>30 min 視訊</b> + 行事曆 link</div>
    <div><span style="color:#9a9aa3;font-weight:700;">✗</span> vertical 不在 BeyondPath 主場、建議其他方向</div>
  </div>
  <p style="color:#9a9aa3;font-size:13px;font-style:italic;margin:0 0 32px;">不會超過 24h 沒任何系統回覆。</p>

  <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.12em;color:#9a9aa3;text-transform:uppercase;margin-bottom:12px;">▍ BeyondPath 怎麼配對 / HOW MATCHING WORKS</div>
  <ul style="color:#c8c6c0;line-height:1.85;font-size:14px;margin:0 0 24px;padding-left:20px;">
    <li style="margin-bottom:4px;">worker 池 100% AI 認證（Tier B 起跳、Tier A+ 走平台旗艦媒合）</li>
    <li style="margin-bottom:4px;"><b style="color:#f0eee8;">AI 評估 + 多維配對演算法 + 品質審核層</b></li>
    <li style="margin-bottom:4px;">試做案 <b style="color:#c7e84a;">NT$30-100k</b>、做完才決定要不要 retainer</li>
    <li>不簽長約、不綁定、worker 跟你直接結算</li>
  </ul>

  <div style="background:rgba(255,255,255,0.02);border:1px dashed #2a2a2e;padding:14px 18px;margin:0 0 24px;color:#c8c6c0;line-height:1.6;font-size:13px;">
    → 急的話寫信到 <b style="color:#c7e84a;">hello@beyondpath.tw</b>
  </div>

  <hr style="border:none;border-top:1px solid #2a2a2e;margin:24px 0;"/>
  <p style="color:#9a9aa3;font-size:12px;margin:0 0 8px;">— BeyondPath · <a href="{HOMEPAGE}" style="color:#c7e84a;text-decoration:none;">{HOMEPAGE}</a></p>
  <p style="color:#6a6a72;font-size:10px;font-family:'JetBrains Mono',monospace;letter-spacing:0.04em;margin:8px 0 0;">prototype 階段 · 不簽法律效力文件 · 不收平台費 · 正式服務於 2026 Q3 啟動</p>
</div>
</body></html>"""

# ============ Send Both ============
def send(body):
    data = json.dumps(body, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(
        "https://api.resend.com/emails",
        data=data,
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json; charset=utf-8",
            "User-Agent": "BeyondPath-Sophie/1.0",
            "Accept": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, r.read().decode("utf-8")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8")

# Worker sample v6
status, resp = send({
    "from": FROM,
    "to": TO,
    "subject": "[Sample v6 · Worker] BeyondPath 已收到你的申請、評估中 · Arc",
    "html": worker_html,
})
print(f"Worker v6 sample HTTP {status} {resp[:200]}")

# Client sample v6
status, resp = send({
    "from": FROM,
    "to": TO,
    "subject": "[Sample v6 · Client] BeyondPath 已收到你的需求、配對中 · Lumine",
    "html": client_html,
})
print(f"Client v6 sample HTTP {status} {resp[:200]}")
