// BeyondPath POC · Supabase Edge Function
// notify-lead-slack v2 · 接 Database Webhook INSERT → post to Slack #beyondpath-leads
//   v2 (2026-05-15): client_intakes 額外 call Claude API 給 Edward decision support
//
// Trigger source: Supabase Dashboard → Database → Webhooks
//   - worker_applications INSERT → POST /functions/v1/notify-lead-slack
//   - client_intakes INSERT → POST /functions/v1/notify-lead-slack
//
// Secrets required:
//   SLACK_BOT_TOKEN — Sophie bot xoxb (chat:write + in #beyondpath-leads)
//   ANTHROPIC_API_KEY — Claude API key (for Edward decision support analysis)

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const SLACK_BOT_TOKEN = Deno.env.get("SLACK_BOT_TOKEN") ?? "";
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";
const ANTHROPIC_MODEL = Deno.env.get("ANTHROPIC_MODEL") ?? "claude-sonnet-4-6";
const LEADS_CHANNEL_ID = "C0B3RRKGQCD"; // #beyondpath-leads (private)

// Resend 寄申請確認信 (2026-05-15 v4) · Edward 給 RESEND_API_KEY 後 enable
// 解 5/15 synthetic testing P0-3 anxiety「不知道有沒有送到」
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const RESEND_FROM = Deno.env.get("RESEND_FROM") ?? "BeyondPath <hello@beyondpath.tw>";
const PUBLIC_HOMEPAGE = "https://beyondpath.tw";

function buildWorkerConfirmEmail(row: Record<string, unknown>): { subject: string; html: string; text: string } {
  const name = (row.display_name as string) || "創作者";
  const lScore = row.l_score ?? "?";
  const tier = (row.tier_suggestion as string) || "B / B+";
  const verticals = Array.isArray(row.verticals) ? (row.verticals as string[]).join(" · ") : "";
  const caseCount = (row.case_count as string) || "";

  const subject = `已收到你的 BeyondPath 申請 · ${name}`;
  const text = [
    `${name} 你好，`,
    ``,
    `謝謝你願意走進 BeyondPath 這個 closed club。`,
    ``,
    `▍你的初評`,
    `  AI L-Score: ${lScore} / 10`,
    `  建議 Tier: ${tier}`,
    verticals ? `  領域: ${verticals}` : null,
    caseCount ? `  案件數量: ${caseCount}` : null,
    ``,
    `▍接下來 24 小時`,
    `Edward 會親自覆核、回信給你。回信會是這三種之一：`,
    ``,
    `  ✓ 「歡迎進首案池」 + 第一個案的方向預告`,
    `  ◐ 「建議補 X 證據再 review」 + 具體哪個 case 截圖 / testimonial`,
    `  ✗ 「目前不適合、6 個月後可重申」 + 具體補強方向`,
    ``,
    `不會超過 24h 沒任何回應。`,
    ``,
    `▍BeyondPath 是什麼`,
    `台灣首個 AI 認證交付網路、媒合付費 AI 工具有實戰經驗的 worker 跟需要 AI 落地案件的品牌。`,
    `目前 prototype 階段、預計 2026 Q3 正式上線。你會是首批 founding worker。`,
    ``,
    `→ 想補資料 (case 截圖 / 客戶 testimonial) 直接回這封信給 Edward`,
    ``,
    `— BeyondPath`,
    `${PUBLIC_HOMEPAGE}`,
    ``,
    `————————`,
    `prototype 階段 · 不簽法律效力文件 · 不收申請費 · 正式服務於 2026 Q3 啟動`,
  ].filter(line => line !== null).join("\n");

  const html = `<!DOCTYPE html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>BeyondPath · Application Received</title></head><body style="font-family:'IBM Plex Sans','Noto Sans TC',system-ui,sans-serif;background:#0a0a0b;color:#f0eee8;margin:0;padding:40px 20px;">
<div style="max-width:580px;margin:0 auto;background:#141416;border:1px solid #2a2a2e;padding:40px 36px;">

  <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.18em;color:#c7e84a;margin-bottom:20px;">● BEYONDPATH · APPLICATION RECEIVED</div>

  <h1 style="font-family:Georgia,'Noto Serif TC',serif;font-style:italic;font-size:30px;font-weight:400;line-height:1.25;margin:0 0 8px;color:#f0eee8;">${name}，</h1>
  <p style="color:#c8c6c0;line-height:1.75;font-size:16px;margin:0 0 28px;">謝謝你願意走進 BeyondPath 這個 closed club。</p>

  <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.12em;color:#9a9aa3;text-transform:uppercase;margin-bottom:12px;">▍ 你的初評 / INITIAL EVALUATION</div>
  <table style="width:100%;border-collapse:collapse;margin-bottom:28px;font-size:14px;">
    <tr><td style="padding:8px 0;color:#9a9aa3;border-bottom:1px dashed #2a2a2e;width:120px;">AI L-Score</td><td style="padding:8px 0;color:#c7e84a;border-bottom:1px dashed #2a2a2e;font-family:'JetBrains Mono',monospace;font-weight:700;">${lScore} / 10</td></tr>
    <tr><td style="padding:8px 0;color:#9a9aa3;border-bottom:1px dashed #2a2a2e;">建議 Tier</td><td style="padding:8px 0;color:#c7e84a;border-bottom:1px dashed #2a2a2e;font-family:'JetBrains Mono',monospace;font-weight:700;">${tier}</td></tr>
    ${verticals ? `<tr><td style="padding:8px 0;color:#9a9aa3;border-bottom:1px dashed #2a2a2e;">領域</td><td style="padding:8px 0;color:#c8c6c0;border-bottom:1px dashed #2a2a2e;">${verticals}</td></tr>` : ""}
    ${caseCount ? `<tr><td style="padding:8px 0;color:#9a9aa3;">案件數量</td><td style="padding:8px 0;color:#c8c6c0;">${caseCount}</td></tr>` : ""}
  </table>

  <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.12em;color:#9a9aa3;text-transform:uppercase;margin-bottom:12px;">▍ 接下來 24 小時 / NEXT 24H</div>
  <p style="color:#c8c6c0;line-height:1.7;font-size:15px;margin:0 0 14px;">Edward 會親自覆核、回信給你。回信會是這三種之一：</p>
  <div style="background:rgba(199,232,74,0.04);border-left:2px solid #c7e84a;padding:16px 20px;margin:0 0 14px;color:#c8c6c0;line-height:1.85;font-size:14px;">
    <div style="margin-bottom:6px;"><span style="color:#c7e84a;font-weight:700;">✓</span> 「歡迎進首案池」 + 第一個案的方向預告</div>
    <div style="margin-bottom:6px;"><span style="color:#d4712a;font-weight:700;">◐</span> 「建議補 X 證據再 review」 + 具體案件截圖 / testimonial</div>
    <div><span style="color:#9a9aa3;font-weight:700;">✗</span> 「目前不適合、6 個月後可重申」 + 具體補強方向</div>
  </div>
  <p style="color:#9a9aa3;font-size:13px;font-style:italic;margin:0 0 32px;">不會超過 24h 沒任何回應。</p>

  <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.12em;color:#9a9aa3;text-transform:uppercase;margin-bottom:12px;">▍ BeyondPath 是什麼 / WHAT IS BP</div>
  <p style="color:#c8c6c0;line-height:1.75;font-size:14px;margin:0 0 12px;">台灣首個 <b style="color:#f0eee8;">AI 認證交付網路</b>、媒合付費 AI 工具有實戰經驗的 worker 跟需要 AI 落地案件的品牌。</p>
  <p style="color:#9a9aa3;line-height:1.75;font-size:13px;margin:0 0 28px;font-style:italic;">目前 prototype 階段、預計 <b style="color:#c7e84a;font-style:normal;">2026 Q3</b> 正式上線。你會是首批 <b style="color:#f0eee8;font-style:normal;">founding worker</b>。</p>

  <div style="background:rgba(255,255,255,0.02);border:1px dashed #2a2a2e;padding:14px 18px;margin:0 0 24px;color:#c8c6c0;line-height:1.6;font-size:13px;">
    → 想補資料 (case 截圖 / 客戶 testimonial) 直接 <b style="color:#c7e84a;">回這封信給 Edward</b>
  </div>

  <hr style="border:none;border-top:1px solid #2a2a2e;margin:24px 0;"/>
  <p style="color:#9a9aa3;font-size:12px;margin:0 0 8px;">— BeyondPath · <a href="${PUBLIC_HOMEPAGE}" style="color:#c7e84a;text-decoration:none;">${PUBLIC_HOMEPAGE}</a></p>
  <p style="color:#6a6a72;font-size:10px;font-family:'JetBrains Mono',monospace;letter-spacing:0.04em;margin:8px 0 0;">prototype 階段 · 不簽法律效力文件 · 不收申請費 · 正式服務於 2026 Q3 啟動</p>
</div>
</body></html>`;
  return { subject, html, text };
}

function buildClientConfirmEmail(row: Record<string, unknown>): { subject: string; html: string; text: string } {
  const company = (row.company_name as string) || "團隊";
  const budget = (row.budget_range as string) || "(未填預算)";
  const timeline = (row.timeline as string) || "";
  const vertical = (row.vertical as string) || "";

  const intakeData = row.intake_data as Record<string, unknown> | null;
  const enterprise = (intakeData && typeof intakeData === "object" && intakeData.enterprise && typeof intakeData.enterprise === "object")
    ? intakeData.enterprise as Record<string, unknown>
    : null;
  const enterpriseFlags: string[] = [];
  if (enterprise?.nda) enterpriseFlags.push("NDA");
  if (enterprise?.invoice) enterpriseFlags.push("公司發票");
  if (enterprise?.contract) enterpriseFlags.push("公司簽約");
  if (enterprise?.talkToEdward) enterpriseFlags.push("視訊聊");

  const subject = `已收到你的 BeyondPath 需求 · ${company}`;
  const text = [
    `${company} 你好，`,
    ``,
    `謝謝你願意把 brief 交給 BeyondPath。`,
    ``,
    `▍你的需求初評`,
    `  預算範圍: ${budget}`,
    timeline ? `  時程: ${timeline}` : null,
    vertical ? `  領域: ${vertical}` : null,
    enterpriseFlags.length > 0 ? `  Enterprise: ${enterpriseFlags.join(" · ")}` : null,
    ``,
    `▍接下來 24 小時`,
    `Edward 會親自看過、回信給你。回信會是這四種之一：`,
    ``,
    `  ✓ 配 1-3 位 Tier B+ / A worker 名單 + 能力卡 + 報價 + 試做案建議`,
    `  ◐ brief 需補資料 (例如預算 / 時程 / deliverable 細節)`,
    `  ◑ 直接約 30 min 視訊聊深需求`,
    `  ✗ vertical 不在 BeyondPath 主場 (DTC 內容 / B2B SaaS / 設計品牌)、建議其他方向`,
    ``,
    `不會超過 24h 沒任何回應。`,
    ``,
    `▍BeyondPath 怎麼配對`,
    `  · worker 池 100% AI 認證 (Tier B 起跳、Tier A+ 走 Edward 親自媒合)`,
    `  · 配對演算法 + Edward 人工 review`,
    `  · 試做案 NT$30-100k、做完才決定要不要 retainer`,
    `  · 不簽長約、不綁定、worker 跟你直接結算`,
    ``,
    `→ 急的話直接回這封信給 Edward (edward@beyondpath.io)`,
    ``,
    `— BeyondPath`,
    `${PUBLIC_HOMEPAGE}`,
    ``,
    `————————`,
    `prototype 階段 · 不簽法律效力文件 · 不收平台費 · 正式服務於 2026 Q3 啟動`,
  ].filter(line => line !== null).join("\n");

  const html = `<!DOCTYPE html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>BeyondPath · Brief Received</title></head><body style="font-family:'IBM Plex Sans','Noto Sans TC',system-ui,sans-serif;background:#0a0a0b;color:#f0eee8;margin:0;padding:40px 20px;">
<div style="max-width:580px;margin:0 auto;background:#141416;border:1px solid #2a2a2e;padding:40px 36px;">

  <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.18em;color:#c7e84a;margin-bottom:20px;">● BEYONDPATH · BRIEF RECEIVED</div>

  <h1 style="font-family:Georgia,'Noto Serif TC',serif;font-style:italic;font-size:30px;font-weight:400;line-height:1.25;margin:0 0 8px;color:#f0eee8;">${company}，</h1>
  <p style="color:#c8c6c0;line-height:1.75;font-size:16px;margin:0 0 28px;">謝謝你願意把 brief 交給 BeyondPath。</p>

  <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.12em;color:#9a9aa3;text-transform:uppercase;margin-bottom:12px;">▍ 你的需求初評 / INITIAL READ</div>
  <table style="width:100%;border-collapse:collapse;margin-bottom:28px;font-size:14px;">
    <tr><td style="padding:8px 0;color:#9a9aa3;border-bottom:1px dashed #2a2a2e;width:120px;">預算範圍</td><td style="padding:8px 0;color:#c7e84a;border-bottom:1px dashed #2a2a2e;font-family:'JetBrains Mono',monospace;font-weight:700;">${budget}</td></tr>
    ${timeline ? `<tr><td style="padding:8px 0;color:#9a9aa3;border-bottom:1px dashed #2a2a2e;">時程</td><td style="padding:8px 0;color:#c8c6c0;border-bottom:1px dashed #2a2a2e;">${timeline}</td></tr>` : ""}
    ${vertical ? `<tr><td style="padding:8px 0;color:#9a9aa3;border-bottom:1px dashed #2a2a2e;">領域</td><td style="padding:8px 0;color:#c8c6c0;border-bottom:1px dashed #2a2a2e;">${vertical}</td></tr>` : ""}
    ${enterpriseFlags.length > 0 ? `<tr><td style="padding:8px 0;color:#9a9aa3;">Enterprise</td><td style="padding:8px 0;color:#d4712a;font-family:'JetBrains Mono',monospace;font-size:13px;">${enterpriseFlags.join(" · ")}</td></tr>` : ""}
  </table>

  <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.12em;color:#9a9aa3;text-transform:uppercase;margin-bottom:12px;">▍ 接下來 24 小時 / NEXT 24H</div>
  <p style="color:#c8c6c0;line-height:1.7;font-size:15px;margin:0 0 14px;">Edward 會親自看過、回信給你。回信會是這四種之一：</p>
  <div style="background:rgba(199,232,74,0.04);border-left:2px solid #c7e84a;padding:16px 20px;margin:0 0 14px;color:#c8c6c0;line-height:1.85;font-size:14px;">
    <div style="margin-bottom:6px;"><span style="color:#c7e84a;font-weight:700;">✓</span> 配 <b>1-3 位</b> Tier B+ / A worker 名單 + 能力卡 + 報價 + 試做案建議</div>
    <div style="margin-bottom:6px;"><span style="color:#d4712a;font-weight:700;">◐</span> brief 需補資料 (預算 / 時程 / deliverable 細節)</div>
    <div style="margin-bottom:6px;"><span style="color:oklch(0.78 0.10 230);font-weight:700;">◑</span> 直接約 <b>30 min 視訊</b>聊深需求</div>
    <div><span style="color:#9a9aa3;font-weight:700;">✗</span> vertical 不在 BeyondPath 主場、建議其他方向</div>
  </div>
  <p style="color:#9a9aa3;font-size:13px;font-style:italic;margin:0 0 32px;">不會超過 24h 沒任何回應。</p>

  <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.12em;color:#9a9aa3;text-transform:uppercase;margin-bottom:12px;">▍ BeyondPath 怎麼配對 / HOW MATCHING WORKS</div>
  <ul style="color:#c8c6c0;line-height:1.85;font-size:14px;margin:0 0 24px;padding-left:20px;">
    <li style="margin-bottom:4px;">worker 池 100% AI 認證（Tier B 起跳、Tier A+ 走 Edward 親自媒合）</li>
    <li style="margin-bottom:4px;">配對演算法 + Edward 人工 review</li>
    <li style="margin-bottom:4px;">試做案 <b style="color:#c7e84a;">NT$30-100k</b>、做完才決定要不要 retainer</li>
    <li>不簽長約、不綁定、worker 跟你直接結算</li>
  </ul>

  <div style="background:rgba(255,255,255,0.02);border:1px dashed #2a2a2e;padding:14px 18px;margin:0 0 24px;color:#c8c6c0;line-height:1.6;font-size:13px;">
    → 急的話直接 <b style="color:#c7e84a;">回這封信給 Edward</b>（edward@beyondpath.io）
  </div>

  <hr style="border:none;border-top:1px solid #2a2a2e;margin:24px 0;"/>
  <p style="color:#9a9aa3;font-size:12px;margin:0 0 8px;">— BeyondPath · <a href="${PUBLIC_HOMEPAGE}" style="color:#c7e84a;text-decoration:none;">${PUBLIC_HOMEPAGE}</a></p>
  <p style="color:#6a6a72;font-size:10px;font-family:'JetBrains Mono',monospace;letter-spacing:0.04em;margin:8px 0 0;">prototype 階段 · 不簽法律效力文件 · 不收平台費 · 正式服務於 2026 Q3 啟動</p>
</div>
</body></html>`;
  return { subject, html, text };
}

async function sendConfirmationEmail(toEmail: string, subject: string, html: string, text: string): Promise<{ ok: boolean; error?: string }> {
  if (!RESEND_API_KEY) {
    // Resend 未設、silent skip (不阻塞 Slack 通知)
    return { ok: false, error: "resend-not-configured" };
  }
  if (!toEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(toEmail)) {
    return { ok: false, error: "invalid-email" };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [toEmail],
        subject,
        html,
        text,
      }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { ok: false, error: errData.message || `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  schema: string;
  record: Record<string, unknown>;
  old_record?: Record<string, unknown> | null;
}

function truncate(text: string, max = 140): string {
  if (!text) return "";
  return text.length > max ? text.slice(0, max) + "…" : text;
}

function formatWorker(row: Record<string, unknown>): string {
  const name = (row.display_name as string) || "(未填名稱)";
  const email = (row.email as string) || "(無 email)";
  const lScore = row.l_score ?? "?";
  const tier = (row.tier_suggestion as string) || "(待 review)";
  const verticals = Array.isArray(row.verticals) ? (row.verticals as string[]).join(", ") : "";
  const cases = (row.case_count as string) || "";

  const lines = [
    `💼 *新 Worker Apply* · _${name}_`,
    `\`${email}\` · L-Score *${lScore}* · 建議 Tier *${tier}*`,
  ];
  if (verticals) lines.push(`領域：${verticals}`);
  if (cases) lines.push(`案件：${cases}`);
  return lines.join("\n");
}

function formatClient(row: Record<string, unknown>): string {
  const company = (row.company_name as string) || "(未填公司)";
  const email = (row.email as string) || "(無 email)";
  const vertical = (row.vertical as string) || "";
  const budget = (row.budget_range as string) || "(未填預算)";
  const timeline = (row.timeline as string) || "";

  const intakeData = row.intake_data as Record<string, unknown> | null;
  const brief = intakeData && typeof intakeData === "object"
    ? truncate((intakeData.brief as string) || (intakeData.description as string) || (intakeData.project_brief as string) || "", 140)
    : "";

  // v3 (2026-05-15) · Enterprise flags from intake_data.enterprise
  const enterprise = (intakeData && typeof intakeData === "object" && intakeData.enterprise && typeof intakeData.enterprise === "object")
    ? intakeData.enterprise as Record<string, unknown>
    : null;
  const enterpriseFlags: string[] = [];
  if (enterprise?.nda) enterpriseFlags.push("📑 NDA");
  if (enterprise?.invoice) enterpriseFlags.push("🧾 公司發票");
  if (enterprise?.contract) enterpriseFlags.push("📝 公司對公司簽約");
  if (enterprise?.talkToEdward) enterpriseFlags.push("📞 想視訊聊");

  const lines = [
    `📋 *新 Client Intake* · _${company}_`,
    `\`${email}\` · 預算 *${budget}*${timeline ? ` · 時程 ${timeline}` : ""}`,
  ];
  if (vertical) lines.push(`領域：${vertical}`);
  if (enterpriseFlags.length > 0) {
    lines.push(`⚠ *Enterprise needs*：${enterpriseFlags.join(" · ")}`);
  }
  if (brief) lines.push(`> ${brief}`);
  return lines.join("\n");
}

const EDWARD_ADVISOR_PROMPT = `你是 BeyondPath 創辦人 Edward 的 AI 顧問。剛收到一筆 client lead 進來、Edward 要決定怎麼接。

請給 Edward 三件事（總長 ≤ 100 字、Slack mrkdwn 格式、用繁體中文）：

1. *接 / 不接 / 看情況* + 一句直白理由（避免客套、給 actionable）
2. *Tier 建議*（B / B+ / A / A+）+ 一句 why（看複雜度與品牌等級）
3. *報價建議*（NT$ 區間、含 +15% 平台溢價）+ 適合契約類型（試做案 / 月費 retainer）

注意：
- 純 Slack mrkdwn、用 *粗體* 標 key info、不要 markdown code block
- 不灑空話（「值得進一步討論」「需要更多資訊」這種無資訊量的話禁止）
- 若預算太低或 brief 太模糊、直接說「不接」並建議 Edward 推回去
- 對應預算粗判：< 50k → B、50-150k → B+/A、150-300k → A、> 300k → A+`;

async function getEdwardAdvisorAnalysis(briefData: {
  brief: string;
  budget_range?: string;
  timeline?: string;
  vertical?: string;
  company_name?: string;
}): Promise<string | null> {
  if (!ANTHROPIC_API_KEY || !briefData.brief || briefData.brief.trim().length < 20) {
    return null;
  }

  const userMsg = [
    `Brief：\n${briefData.brief.trim()}`,
    briefData.company_name ? `公司：${briefData.company_name}` : null,
    briefData.budget_range ? `預算：${briefData.budget_range}` : null,
    briefData.timeline ? `時程：${briefData.timeline}` : null,
    briefData.vertical ? `領域：${briefData.vertical}` : null,
  ].filter(Boolean).join("\n");

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 400,
        system: EDWARD_ADVISOR_PROMPT,
        messages: [{ role: "user", content: userMsg }],
      }),
    });
    const data = await res.json();
    if (!res.ok) return null;
    const text = data.content?.[0]?.text?.trim();
    return text || null;
  } catch {
    return null;
  }
}

async function postToSlack(text: string): Promise<{ ok: boolean; ts?: string; error?: string }> {
  const res = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Authorization": `Bearer ${SLACK_BOT_TOKEN}`,
    },
    body: JSON.stringify({
      channel: LEADS_CHANNEL_ID,
      text,
      unfurl_links: false,
      unfurl_media: false,
    }),
  });
  const data = await res.json();
  return data.ok
    ? { ok: true, ts: data.ts }
    : { ok: false, error: data.error || "unknown" };
}

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  if (!SLACK_BOT_TOKEN) {
    return new Response(JSON.stringify({ ok: false, error: "missing-slack-token" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  let payload: WebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "invalid-json" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (payload.type !== "INSERT") {
    return new Response(JSON.stringify({ ok: true, skipped: "non-insert" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  let text = "";
  let claudeAdvice: string | null = null;
  let emailTemplate: { subject: string; html: string; text: string } | null = null;
  let toEmail = "";

  if (payload.table === "worker_applications") {
    text = formatWorker(payload.record);
    toEmail = (payload.record.email as string) || "";
    emailTemplate = buildWorkerConfirmEmail(payload.record);
  } else if (payload.table === "client_intakes") {
    text = formatClient(payload.record);
    toEmail = (payload.record.email as string) || "";
    emailTemplate = buildClientConfirmEmail(payload.record);
    // 額外 call Claude 給 Edward decision support
    const intakeData = payload.record.intake_data as Record<string, unknown> | null;
    const brief = (intakeData && typeof intakeData === "object")
      ? ((intakeData.brief as string) || (intakeData.description as string) || (intakeData.project_brief as string) || "")
      : "";
    claudeAdvice = await getEdwardAdvisorAnalysis({
      brief,
      budget_range: payload.record.budget_range as string | undefined,
      timeline: payload.record.timeline as string | undefined,
      vertical: payload.record.vertical as string | undefined,
      company_name: payload.record.company_name as string | undefined,
    });
  } else {
    text = `📥 *新 Lead* (${payload.table}) · row id: \`${payload.record.id ?? "?"}\``;
  }

  // Append Claude advisor analysis if available
  if (claudeAdvice) {
    text += `\n\n✨ *Edward AI 顧問建議*\n${claudeAdvice}`;
  }

  // Parallel: Slack 通知 + 寄申請確認信 (Resend 沒設就 silent skip · 不阻塞 Slack)
  const [slackResult, emailResult] = await Promise.all([
    postToSlack(text),
    emailTemplate && toEmail
      ? sendConfirmationEmail(toEmail, emailTemplate.subject, emailTemplate.html, emailTemplate.text)
      : Promise.resolve({ ok: false, error: "no-email-template-or-recipient" }),
  ]);

  return new Response(JSON.stringify({
    ...slackResult,
    claude_advice_attached: !!claudeAdvice,
    confirmation_email_sent: emailResult.ok,
    confirmation_email_error: emailResult.ok ? undefined : emailResult.error,
  }), {
    status: slackResult.ok ? 200 : 500,
    headers: { "Content-Type": "application/json" },
  });
});
