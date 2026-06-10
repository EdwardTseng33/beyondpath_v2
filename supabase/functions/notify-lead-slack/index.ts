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
import { buildClientAckEmail } from "../_shared/confirmation-email-template.ts";
import { rankWorkers, type ClientIntakeForMatch } from "../_shared/match-algorithm.ts";
import type { UnifiedWorker } from "../_shared/worker-schema.ts";
import { VERTICAL_ADJACENCY } from "../_shared/vertical-adjacency.ts";
import { notifyEdward } from "../_shared/notify-edward.ts";  // 2026-05-31 calcifer . doc 37 gap 2 . ops event -> Edward email

const SLACK_BOT_TOKEN = Deno.env.get("SLACK_BOT_TOKEN") ?? "";
// 2026-05-29 calcifer doc28 C . DB webhook 防偽造 . 設 WEBHOOK_SECRET 後 . request 必帶相符 header
// 未設則放行 (向後相容 . 既有 webhook 不會立刻壞) . 沙利曼建議上線後設此 secret
const NOTIFY_WEBHOOK_SECRET = Deno.env.get("NOTIFY_WEBHOOK_SECRET") ?? "";
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

  const subject = `BeyondPath 已收到你的申請、評估中 · ${name}`;
  const text = [
    `${name} 你好，`,
    ``,
    `謝謝你加入 BeyondPath closed club 的申請。`,
    ``,
    `▍系統初評`,
    `  AI L-Score: ${lScore} / 10`,
    `  建議 Tier: ${tier}`,
    verticals ? `  領域: ${verticals}` : null,
    caseCount ? `  案件數量: ${caseCount}` : null,
    ``,
    `▍接下來 24 小時`,
    `BeyondPath 系統將完成多維評估、回信告知你結果。三種可能：`,
    ``,
    `  ✓ 「歡迎進首案池」 + 第一個案件方向預告`,
    `  ◐ 「需補資料再評估」 + 具體要補哪些 case 截圖 / testimonial`,
    `  ✗ 「暫不通過、6 個月可重新申請」 + 具體補強方向`,
    ``,
    `不會超過 24h 沒任何系統回覆。`,
    ``,
    `▍BeyondPath 是什麼`,
    `台灣首個 AI 認證交付網路、用 AI 評估 + 多維配對演算法媒合 worker 跟品牌。`,
    `目前 prototype 階段、預計 2026 Q3 正式上線。你會是首批 founding worker。`,
    ``,
    `→ 想補資料 (case 截圖 / 客戶 testimonial) 寫信到 hello@beyondpath.tw`,
    ``,
    `— BeyondPath`,
    `${PUBLIC_HOMEPAGE}`,
    ``,
    `————————`,
    `BeyondPath v1.0 · 接案者申請免費 · 媒合服務費僅成功配對且雙方簽約完成才向接案者收（見服務條款 §3）`,
  ].filter(line => line !== null).join("\n");

  const html = `<!DOCTYPE html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>BeyondPath · Application Received</title></head><body style="font-family:'IBM Plex Sans','Noto Sans TC',system-ui,sans-serif;background:#0a0a0b;color:#f0eee8;margin:0;padding:40px 20px;">
<div style="max-width:580px;margin:0 auto;background:#141416;border:1px solid #2a2a2e;padding:40px 36px;">

  <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.18em;color:#c7e84a;margin-bottom:20px;">● BEYONDPATH · APPLICATION RECEIVED</div>

  <h1 style="font-family:Georgia,'Noto Serif TC',serif;font-style:italic;font-size:30px;font-weight:400;line-height:1.25;margin:0 0 8px;color:#f0eee8;">${name}，</h1>
  <p style="color:#c8c6c0;line-height:1.75;font-size:16px;margin:0 0 28px;">謝謝你願意走進 BeyondPath 這個 closed club。</p>

  <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.12em;color:#9a9aa3;text-transform:uppercase;margin-bottom:12px;">▍ 系統初評 / SYSTEM EVALUATION</div>
  <table style="width:100%;border-collapse:collapse;margin-bottom:28px;font-size:14px;">
    <tr><td style="padding:8px 0;color:#9a9aa3;border-bottom:1px dashed #2a2a2e;width:120px;">AI L-Score</td><td style="padding:8px 0;color:#c7e84a;border-bottom:1px dashed #2a2a2e;font-family:'JetBrains Mono',monospace;font-weight:700;">${lScore} / 10</td></tr>
    <tr><td style="padding:8px 0;color:#9a9aa3;border-bottom:1px dashed #2a2a2e;">建議 Tier</td><td style="padding:8px 0;color:#c7e84a;border-bottom:1px dashed #2a2a2e;font-family:'JetBrains Mono',monospace;font-weight:700;">${tier}</td></tr>
    ${verticals ? `<tr><td style="padding:8px 0;color:#9a9aa3;border-bottom:1px dashed #2a2a2e;">領域</td><td style="padding:8px 0;color:#c8c6c0;border-bottom:1px dashed #2a2a2e;">${verticals}</td></tr>` : ""}
    ${caseCount ? `<tr><td style="padding:8px 0;color:#9a9aa3;">案件數量</td><td style="padding:8px 0;color:#c8c6c0;">${caseCount}</td></tr>` : ""}
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
  <p style="color:#9a9aa3;line-height:1.75;font-size:13px;margin:0 0 28px;font-style:italic;">平台<b style="color:#c7e84a;font-style:normal;">現正式營運中</b>。你會是平台<b style="color:#f0eee8;font-style:normal;">早期接案者</b>。</p>

  <div style="background:rgba(255,255,255,0.02);border:1px dashed #2a2a2e;padding:14px 18px;margin:0 0 24px;color:#c8c6c0;line-height:1.6;font-size:13px;">
    → 想補資料 (case 截圖 / 客戶 testimonial) 寫信到 <b style="color:#c7e84a;">hello@beyondpath.tw</b>
  </div>

  <hr style="border:none;border-top:1px solid #2a2a2e;margin:24px 0;"/>
  <p style="color:#9a9aa3;font-size:12px;margin:0 0 8px;">— BeyondPath · <a href="${PUBLIC_HOMEPAGE}" style="color:#c7e84a;text-decoration:none;">${PUBLIC_HOMEPAGE}</a></p>
  <p style="color:#6a6a72;font-size:10px;font-family:'JetBrains Mono',monospace;letter-spacing:0.04em;margin:8px 0 0;">BeyondPath v1.0 · 接案者申請免費 · 媒合服務費僅成功配對且雙方簽約完成才向接案者收（見服務條款 §3）</p>
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

  const subject = `BeyondPath 已收到你的需求、配對中 · ${company}`;
  const text = [
    `${company} 你好，`,
    ``,
    `謝謝你把 brief 交給 BeyondPath。`,
    ``,
    `▍需求初評`,
    `  預算範圍: ${budget}`,
    timeline ? `  時程: ${timeline}` : null,
    vertical ? `  領域: ${vertical}` : null,
    enterpriseFlags.length > 0 ? `  Enterprise: ${enterpriseFlags.join(" · ")}` : null,
    ``,
    `▍接下來 24 小時`,
    `BeyondPath 配對演算法將完成媒合、回信告知你結果。四種可能：`,
    ``,
    `  ✓ 配 1-3 位 Tier B+ / A worker 名單 + 能力卡 + 報價 + 試做案建議`,
    `  ◐ brief 需補資料 (例如預算 / 時程 / deliverable 細節)`,
    `  ◑ 建議深聊 30 min 視訊 + 行事曆 link`,
    `  ✗ vertical 不在 BeyondPath 主場 (DTC 內容 / B2B SaaS / 設計品牌)、建議其他方向`,
    ``,
    `不會超過 24h 沒任何系統回覆。`,
    ``,
    `▍BeyondPath 怎麼配對`,
    `  · worker 池 100% AI 認證 (Tier B 起跳、Tier A+ 走平台旗艦媒合)`,
    `  · AI 評估 + 多維配對演算法 + 品質審核層`,
    `  · 試做案 NT$30-100k、做完才決定要不要 retainer`,
    `  · 不簽長約、不綁定、worker 跟你直接結算`,
    ``,
    `→ 急的話寫信到 hello@beyondpath.tw`,
    ``,
    `— BeyondPath`,
    `${PUBLIC_HOMEPAGE}`,
    ``,
    `————————`,
    `BeyondPath v1.0 · 客戶端不另收平台費 · 案款由平台透過綠界第三方支付代收代付（見服務條款 §3）`,
  ].filter(line => line !== null).join("\n");

  const html = `<!DOCTYPE html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>BeyondPath · Brief Received</title></head><body style="font-family:'IBM Plex Sans','Noto Sans TC',system-ui,sans-serif;background:#0a0a0b;color:#f0eee8;margin:0;padding:40px 20px;">
<div style="max-width:580px;margin:0 auto;background:#141416;border:1px solid #2a2a2e;padding:40px 36px;">

  <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.18em;color:#c7e84a;margin-bottom:20px;">● BEYONDPATH · BRIEF RECEIVED</div>

  <h1 style="font-family:Georgia,'Noto Serif TC',serif;font-style:italic;font-size:30px;font-weight:400;line-height:1.25;margin:0 0 8px;color:#f0eee8;">${company}，</h1>
  <p style="color:#c8c6c0;line-height:1.75;font-size:16px;margin:0 0 28px;">謝謝你願意把 brief 交給 BeyondPath。</p>

  <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.12em;color:#9a9aa3;text-transform:uppercase;margin-bottom:12px;">▍ 需求初評 / INITIAL READ</div>
  <table style="width:100%;border-collapse:collapse;margin-bottom:28px;font-size:14px;">
    <tr><td style="padding:8px 0;color:#9a9aa3;border-bottom:1px dashed #2a2a2e;width:120px;">預算範圍</td><td style="padding:8px 0;color:#c7e84a;border-bottom:1px dashed #2a2a2e;font-family:'JetBrains Mono',monospace;font-weight:700;">${budget}</td></tr>
    ${timeline ? `<tr><td style="padding:8px 0;color:#9a9aa3;border-bottom:1px dashed #2a2a2e;">時程</td><td style="padding:8px 0;color:#c8c6c0;border-bottom:1px dashed #2a2a2e;">${timeline}</td></tr>` : ""}
    ${vertical ? `<tr><td style="padding:8px 0;color:#9a9aa3;border-bottom:1px dashed #2a2a2e;">領域</td><td style="padding:8px 0;color:#c8c6c0;border-bottom:1px dashed #2a2a2e;">${vertical}</td></tr>` : ""}
    ${enterpriseFlags.length > 0 ? `<tr><td style="padding:8px 0;color:#9a9aa3;">Enterprise</td><td style="padding:8px 0;color:#d4712a;font-family:'JetBrains Mono',monospace;font-size:13px;">${enterpriseFlags.join(" · ")}</td></tr>` : ""}
  </table>

  <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.12em;color:#9a9aa3;text-transform:uppercase;margin-bottom:12px;">▍ 接下來 24 小時 / NEXT 24H</div>
  <p style="color:#c8c6c0;line-height:1.7;font-size:15px;margin:0 0 14px;">BeyondPath 配對演算法將完成媒合、回信告知你結果。四種可能：</p>
  <div style="background:rgba(199,232,74,0.04);border-left:2px solid #c7e84a;padding:16px 20px;margin:0 0 14px;color:#c8c6c0;line-height:1.85;font-size:14px;">
    <div style="margin-bottom:6px;"><span style="color:#c7e84a;font-weight:700;">✓</span> 配 <b>1-3 位</b> Tier B+ / A worker 名單 + 能力卡 + 報價 + 試做案建議</div>
    <div style="margin-bottom:6px;"><span style="color:#d4712a;font-weight:700;">◐</span> brief 需補資料 (預算 / 時程 / deliverable 細節)</div>
    <div style="margin-bottom:6px;"><span style="color:oklch(0.78 0.10 230);font-weight:700;">◑</span> 建議深聊 <b>30 min 視訊</b> + 行事曆 link</div>
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
  <p style="color:#9a9aa3;font-size:12px;margin:0 0 8px;">— BeyondPath · <a href="${PUBLIC_HOMEPAGE}" style="color:#c7e84a;text-decoration:none;">${PUBLIC_HOMEPAGE}</a></p>
  <p style="color:#6a6a72;font-size:10px;font-family:'JetBrains Mono',monospace;letter-spacing:0.04em;margin:8px 0 0;">BeyondPath v1.0 · 客戶端不另收平台費 · 案款由平台透過綠界第三方支付代收代付（見服務條款 §3）</p>
</div>
</body></html>`;
  return { subject, html, text };
}

// ============================================================
// Decision email templates v1 (2026-05-15 · Phase 1b2)
// Worker × 3: pass / hold / reject
// Client × 4: match / need-more / video-invite / not-fit
// 等 Phase 2 Slack interactive button or web admin UI 觸發
// ============================================================

function emailWrapper(opts: { header: string; titleTo: string; openLine: string; bodyHtml: string }): string {
  return `<!DOCTYPE html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>BeyondPath</title></head><body style="font-family:'IBM Plex Sans','Noto Sans TC',system-ui,sans-serif;background:#0a0a0b;color:#f0eee8;margin:0;padding:40px 20px;">
<div style="max-width:580px;margin:0 auto;background:#141416;border:1px solid #2a2a2e;padding:40px 36px;">
  <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.18em;color:#c7e84a;margin-bottom:20px;">${opts.header}</div>
  <h1 style="font-family:Georgia,'Noto Serif TC',serif;font-style:italic;font-size:30px;font-weight:400;line-height:1.25;margin:0 0 8px;color:#f0eee8;">${opts.titleTo}</h1>
  <p style="color:#c8c6c0;line-height:1.75;font-size:16px;margin:0 0 28px;">${opts.openLine}</p>
  ${opts.bodyHtml}
  <hr style="border:none;border-top:1px solid #2a2a2e;margin:24px 0;"/>
  <p style="color:#9a9aa3;font-size:12px;margin:0 0 8px;">— BeyondPath · <a href="${PUBLIC_HOMEPAGE}" style="color:#c7e84a;text-decoration:none;">${PUBLIC_HOMEPAGE}</a></p>
  <p style="color:#6a6a72;font-size:10px;font-family:'JetBrains Mono',monospace;letter-spacing:0.04em;margin:8px 0 0;">BeyondPath v1.0 · 客戶端不另收平台費 · 案款由平台透過綠界第三方支付代收代付（見服務條款 §3）</p>
</div>
</body></html>`;
}

// ============ Worker × 3 ============

// 2026-06-01 calcifer . Edward 點名 . 定價對齊 terms.html §3.2 Tier take rate (媒合服務費、向接案者收)
// §3.2 單一費率欄: B=20% B+=19% A=18% A+=17% S=17% . composite tier 取較入門 tier (費率較高那檔、保守揭露)
function tierTakeRate(tierRaw: string): { tier: string; rate: number } {
  const t = String(tierRaw || "").toUpperCase();
  const table: Array<{ key: string; rate: number }> = [
    { key: "S", rate: 17 },
    { key: "A+", rate: 17 },
    { key: "A", rate: 18 },
    { key: "B+", rate: 19 },
    { key: "B", rate: 20 },
  ];
  let best: { tier: string; rate: number } | null = null;
  for (const e of table) {
    const re = new RegExp(e.key.replace("+", "\+") + "(?![+])");  // A 不誤命中 A+
    if (re.test(t)) {
      if (!best || e.rate > best.rate) best = { tier: e.key, rate: e.rate };
    }
  }
  return best || { tier: "B", rate: 20 };
}

function buildWorkerPassEmail(row: Record<string, unknown>, opts?: { firstCaseHint?: string }): { subject: string; html: string; text: string } {
  const name = (row.display_name as string) || "創作者";
  const tier = (row.tier_suggestion as string) || "B+";
  const lScore = row.l_score ?? "?";
  const tr = tierTakeRate(tier);  // 2026-06-01 . §3.2 take rate for this worker tier
  const firstCaseHint = opts?.firstCaseHint || "你的第一個案件方向會在 1-2 週內透過 BeyondPath 系統媒合配對、屆時系統會主動通知。";

  const subject = `BeyondPath 認證通過 · 歡迎進首案池 · ${name}`;
  const text = [
    `${name} 你好，`,
    ``,
    `恭喜 — BeyondPath 系統評估通過、你正式進入 Tier ${tier} 認證 worker 池。`,
    `AI L-Score: ${lScore} / 10`,
    ``,
    `▍接下來`,
    firstCaseHint,
    ``,
    `▍你會收到的`,
    `  · 客戶 brief 進來時、系統會配對你 + 主動通知`,
    `  · 你決定是否接、24h 內回覆即可`,
    `  · 接案後雙方直接溝通 + 用 BeyondPath 工具（SOW / 報價單 / 驗收 checklist）`,
    ``,
    `▍founding worker 福利`,
    `  · 媒合服務費依 Tier 與案件型態分級（你的 Tier ${tr.tier}：一次性案 ${tr.rate}%、月聘案費率另計、完整見服務條款 §3.2；僅成功配對且雙方簽約完成才向接案者收）`,
    `  · 公開 portfolio 第一批上架（早鳥曝光）`,
    `  · 累積 case study 進 BeyondPath`,
    ``,
    `→ 有疑問寫信到 hello@beyondpath.tw`,
    ``,
    `— BeyondPath`,
    PUBLIC_HOMEPAGE,
  ].join("\n");

  const bodyHtml = `
  <div style="background:rgba(199,232,74,0.04);border-left:2px solid #c7e84a;padding:16px 20px;margin:0 0 24px;color:#c8c6c0;line-height:1.75;font-size:15px;">
    <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.12em;color:#c7e84a;margin-bottom:8px;text-transform:uppercase;">✓ 認證通過 / TIER ${tier}</div>
    AI L-Score: <b style="color:#c7e84a;">${lScore} / 10</b> · 你正式進入 Tier ${tier} 認證 worker 池。
  </div>
  <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.12em;color:#9a9aa3;text-transform:uppercase;margin-bottom:12px;">▍ 接下來 / NEXT STEP</div>
  <p style="color:#c8c6c0;line-height:1.75;font-size:14px;margin:0 0 24px;">${firstCaseHint}</p>
  <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.12em;color:#9a9aa3;text-transform:uppercase;margin-bottom:12px;">▍ 你會收到的 / WHAT YOU&#39;LL GET</div>
  <ul style="color:#c8c6c0;line-height:1.85;font-size:14px;margin:0 0 24px;padding-left:20px;">
    <li>客戶 brief 進來時、系統配對你 + 主動通知</li>
    <li>你決定是否接、24h 內回覆即可</li>
    <li>接案後直接溝通 + 用 BeyondPath 工具（SOW / 報價單 / 驗收 checklist）</li>
  </ul>
  <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.12em;color:#9a9aa3;text-transform:uppercase;margin-bottom:12px;">▍ FOUNDING WORKER 福利</div>
  <ul style="color:#c8c6c0;line-height:1.85;font-size:14px;margin:0 0 24px;padding-left:20px;">
    <li>媒合服務費依 Tier 與案件型態分級（你的 Tier ${tr.tier}：一次性案 <b style="color:#c7e84a;">${tr.rate}%</b>、月聘案費率另計、完整見<a href="${PUBLIC_HOMEPAGE}/legal/terms.html" style="color:#c7e84a;">服務條款 §3.2</a>；僅成功配對且雙方簽約完成才向接案者收）</li>
    <li>公開 portfolio 第一批上架（早鳥曝光）</li>
    <li>累積 case study 進 BeyondPath</li>
  </ul>
  <div style="background:rgba(255,255,255,0.02);border:1px dashed #2a2a2e;padding:14px 18px;margin:0 0 24px;color:#c8c6c0;line-height:1.6;font-size:13px;">
    → 有疑問寫信到 <b style="color:#c7e84a;">hello@beyondpath.tw</b>
  </div>`;

  const html = emailWrapper({
    header: "● BEYONDPATH · APPLICATION APPROVED",
    titleTo: `${name}，`,
    openLine: `恭喜 — BeyondPath 系統評估通過、你正式進入 <b style="color:#c7e84a;">Tier ${tier}</b> 認證 worker 池。`,
    bodyHtml,
  });

  return { subject, html, text };
}

function buildWorkerHoldEmail(row: Record<string, unknown>, opts?: { missingItems?: string[]; reReviewDays?: number }): { subject: string; html: string; text: string } {
  const name = (row.display_name as string) || "創作者";
  const tier = (row.tier_suggestion as string) || "B+";
  const missingItems = opts?.missingItems || [
    "近 12 個月實際 AI 案件 2-3 件具體證據（截圖 / 客戶 testimonial / 結案 invoice）",
    "至少 1 個完整 AI workflow 細節（工具串接 + 判斷力 + 失敗 fallback）",
  ];
  const reReviewDays = opts?.reReviewDays || 7;

  const subject = `BeyondPath 認證需補資料 · ${name}`;
  const text = [
    `${name} 你好，`,
    ``,
    `BeyondPath 系統初評：你的申請有潛力進 Tier ${tier}、但目前證據強度不足、需補資料再評。`,
    ``,
    `▍需補的具體項目`,
    ...missingItems.map(item => `  · ${item}`),
    ``,
    `▍補件方式`,
    `1. 回信到此 thread、附上具體 case 截圖 / testimonial / workflow 細節`,
    `2. 系統 ${reReviewDays} 工作日內完成重新評估、回信告知結果`,
    `3. 補件後評估可能：通過 / 仍需補 / 不適合（最多再 1 輪補）`,
    ``,
    `▍為什麼這樣設計`,
    `BeyondPath 的價值在於 worker 池品質可信、client 端能信任 Tier 分級。`,
    `補件不是刁難、是讓你的 portfolio 證據更扎實、案件配對更準。`,
    ``,
    `→ 有疑問寫信到 hello@beyondpath.tw`,
    ``,
    `— BeyondPath`,
    PUBLIC_HOMEPAGE,
  ].join("\n");

  const missingHtml = missingItems.map(item => `<li>${item}</li>`).join("");
  const bodyHtml = `
  <div style="background:rgba(212,113,42,0.06);border-left:2px solid #d4712a;padding:16px 20px;margin:0 0 24px;color:#c8c6c0;line-height:1.75;font-size:15px;">
    <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.12em;color:#d4712a;margin-bottom:8px;text-transform:uppercase;">◐ 需補資料 / TIER ${tier} POTENTIAL</div>
    系統初評：你有潛力進 Tier ${tier}、但證據強度不足、需補資料再評估。
  </div>
  <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.12em;color:#9a9aa3;text-transform:uppercase;margin-bottom:12px;">▍ 需補的具體項目 / WHAT TO ADD</div>
  <ul style="color:#c8c6c0;line-height:1.85;font-size:14px;margin:0 0 24px;padding-left:20px;">
    ${missingHtml}
  </ul>
  <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.12em;color:#9a9aa3;text-transform:uppercase;margin-bottom:12px;">▍ 補件方式 / HOW TO RESUBMIT</div>
  <ol style="color:#c8c6c0;line-height:1.85;font-size:14px;margin:0 0 24px;padding-left:20px;">
    <li>回信此 thread、附上具體 case 截圖 / testimonial / workflow 細節</li>
    <li>系統 ${reReviewDays} 工作日內完成重新評估、回信告知結果</li>
    <li>補件後評估可能：通過 / 仍需補 / 不適合（最多再 1 輪補）</li>
  </ol>
  <div style="background:rgba(255,255,255,0.02);border:1px dashed #2a2a2e;padding:14px 18px;margin:0 0 24px;color:#c8c6c0;line-height:1.6;font-size:13px;">
    補件不是刁難、是讓你的 portfolio 證據扎實、案件配對更準。<br/>
    → 有疑問寫信到 <b style="color:#c7e84a;">hello@beyondpath.tw</b>
  </div>`;

  const html = emailWrapper({
    header: "● BEYONDPATH · APPLICATION ON HOLD",
    titleTo: `${name}，`,
    openLine: `BeyondPath 系統初評：你的申請有潛力進 <b style="color:#c7e84a;">Tier ${tier}</b>、需補資料再評。`,
    bodyHtml,
  });

  return { subject, html, text };
}

function buildWorkerRejectEmail(row: Record<string, unknown>, opts?: { gapAreas?: string[]; reapplyMonths?: number }): { subject: string; html: string; text: string } {
  const name = (row.display_name as string) || "創作者";
  const gapAreas = opts?.gapAreas || [
    "AI 工具實戰時數不足（建議累積 ≥ 100 hr Claude / ChatGPT / Cursor / Midjourney 等付費工具實際 client 案件）",
    "Workflow 系統化程度（建議發展 1-2 個可重複的 multi-tool workflow、附判斷力 + 失敗 fallback）",
    "案件證據強度（建議補 ≥ 3 個完整案件含客戶 testimonial 或結案 invoice）",
  ];
  const reapplyMonths = opts?.reapplyMonths || 6;

  const subject = `BeyondPath 認證評估結果 · ${name}`;
  const text = [
    `${name} 你好，`,
    ``,
    `謝謝你申請 BeyondPath 認證。`,
    ``,
    `BeyondPath 系統評估後：你目前的 AI 實戰程度跟 BP 當前 Tier B 起跳的 worker 池仍有 gap、暫不通過認證。`,
    ``,
    `▍主要 gap`,
    ...gapAreas.map(item => `  · ${item}`),
    ``,
    `▍重新申請時機`,
    `${reapplyMonths} 個月後可重新申請、累積具體案件證據後再走一次評估流程。`,
    ``,
    `▍我們不適合對方的時候`,
    `BeyondPath 的 worker 池服務 client 對「AI 落地有實戰經驗」的 worker 的需求。`,
    `這次評估不通過、不代表你的能力不足、可能只是 BP 目前的 vertical / Tier 跟你的工作型態不對齊。`,
    `你還是可以繼續累積你的 AI 工作流跟 case、未來重新申請會更扎實。`,
    ``,
    `→ 有疑問寫信到 hello@beyondpath.tw`,
    ``,
    `— BeyondPath`,
    PUBLIC_HOMEPAGE,
  ].join("\n");

  const gapHtml = gapAreas.map(item => `<li>${item}</li>`).join("");
  const bodyHtml = `
  <div style="background:rgba(255,255,255,0.025);border-left:2px solid #9a9aa3;padding:16px 20px;margin:0 0 24px;color:#c8c6c0;line-height:1.75;font-size:15px;">
    <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.12em;color:#9a9aa3;margin-bottom:8px;text-transform:uppercase;">✗ 暫不通過 / ${reapplyMonths} 個月可重申</div>
    系統評估後：你目前的 AI 實戰程度跟 BP Tier B 起跳的 worker 池仍有 gap、暫不通過。
  </div>
  <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.12em;color:#9a9aa3;text-transform:uppercase;margin-bottom:12px;">▍ 主要 GAP / KEY GAPS</div>
  <ul style="color:#c8c6c0;line-height:1.85;font-size:14px;margin:0 0 24px;padding-left:20px;">
    ${gapHtml}
  </ul>
  <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.12em;color:#9a9aa3;text-transform:uppercase;margin-bottom:12px;">▍ 重新申請 / REAPPLY</div>
  <p style="color:#c8c6c0;line-height:1.75;font-size:14px;margin:0 0 24px;"><b style="color:#c7e84a;">${reapplyMonths} 個月後</b>可重新申請、累積具體案件證據後再走一次評估流程。</p>
  <div style="background:rgba(255,255,255,0.02);border:1px dashed #2a2a2e;padding:14px 18px;margin:0 0 24px;color:#c8c6c0;line-height:1.65;font-size:13px;">
    這次不通過不代表你能力不足、可能只是 BP 目前的 vertical / Tier 跟你的工作型態不對齊。<br/>
    你可以繼續累積 AI workflow 跟 case、未來重新申請會更扎實。<br/>
    → 有疑問寫信到 <b style="color:#c7e84a;">hello@beyondpath.tw</b>
  </div>`;

  const html = emailWrapper({
    header: "● BEYONDPATH · EVALUATION RESULT",
    titleTo: `${name}，`,
    openLine: `謝謝你申請 BeyondPath 認證。系統評估後、目前認證暫不通過、<b style="color:#c7e84a;">${reapplyMonths} 個月</b>後可重申。`,
    bodyHtml,
  });

  return { subject, html, text };
}

// ============ Client × 4 ============

interface WorkerCandidate {
  name: string;
  tier: string;
  lScore: number;
  verticals: string[];
  strengths: string[];
  hourlyRate: string;
  trialQuote: string;
}

function buildClientMatchEmail(row: Record<string, unknown>, opts: { candidates: WorkerCandidate[]; trialBudget?: string }): { subject: string; html: string; text: string } {
  const company = (row.company_name as string) || "團隊";
  const candidates = opts.candidates || [];
  const trialBudget = opts.trialBudget || "NT$30k-100k";

  const subject = `BeyondPath 配對結果 · ${candidates.length} 位 worker 為 ${company} 媒合中`;

  const candidateText = candidates.map((c, i) => [
    ``,
    `【候選 ${i + 1}】 ${c.name} · Tier ${c.tier} · L-Score ${c.lScore} / 10`,
    `  領域：${c.verticals.join(" · ")}`,
    `  強項：${c.strengths.join(" / ")}`,
    `  報價：${c.hourlyRate} hourly · 試做案 ${c.trialQuote}`,
  ].join("\n")).join("\n");

  const text = [
    `${company} 你好，`,
    ``,
    `BeyondPath 配對演算法已完成媒合、為你準備 ${candidates.length} 位 Tier B+ 以上 worker 名單：`,
    candidateText,
    ``,
    `▍下一步`,
    `1. 看完三位 candidate、回信告訴我們你最想先聊哪 1-2 位`,
    `2. BeyondPath 會 wire 你跟該 worker 直接 email（雙方獨立溝通、平台不介入）`,
    `3. Worker 給你完整 SOW + 報價單（用 BeyondPath 範本、雙方對齊 deliverable）`,
    `4. 試做案 ${trialBudget} 啟動、雙方直接結算（BeyondPath 不碰錢）`,
    `5. 滿意 → retainer / 不滿意 → 結束、可換 worker`,
    ``,
    `▍試做案怎麼運作`,
    `  · 小額試水（${trialBudget}）降低首次合作風險`,
    `  · 2-4 週內完成 deliverable + 雙方驗收`,
    `  · 滿意才升級 retainer（80-120% 試做案費率 / 月）`,
    `  · 不滿意可結束、不綁定`,
    ``,
    `→ 24h 內回信告訴我們你的選擇`,
    ``,
    `— BeyondPath`,
    PUBLIC_HOMEPAGE,
  ].join("\n");

  const candidateCards = candidates.map((c, i) => `
  <div style="border:1px solid #2a2a2e;padding:20px;margin-bottom:16px;background:rgba(255,255,255,0.02);">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
      <div>
        <div style="font-size:18px;font-weight:700;color:#f0eee8;font-family:Georgia,'Noto Serif TC',serif;">${c.name}</div>
        <div style="font-size:12px;color:#9a9aa3;font-family:'JetBrains Mono',monospace;margin-top:4px;">候選 ${i + 1} · ${c.verticals.join(" · ")}</div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:11px;color:#9a9aa3;font-family:'JetBrains Mono',monospace;text-transform:uppercase;">Tier · L-Score</div>
        <div style="font-size:18px;color:#c7e84a;font-weight:700;font-family:'JetBrains Mono',monospace;">${c.tier} · ${c.lScore}/10</div>
      </div>
    </div>
    <div style="font-size:13px;color:#c8c6c0;line-height:1.7;margin-bottom:12px;">
      <b style="color:#9a9aa3;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;">強項</b><br/>
      ${c.strengths.map(s => `<span style="display:inline-block;background:rgba(199,232,74,0.06);border:1px solid rgba(199,232,74,0.2);padding:3px 10px;margin:4px 6px 0 0;font-size:12px;color:#c8c6c0;">${s}</span>`).join("")}
    </div>
    <div style="border-top:1px dashed #2a2a2e;padding-top:12px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;font-size:12px;font-family:'JetBrains Mono',monospace;">
      <span style="color:#9a9aa3;">Hourly: <b style="color:#c8c6c0;">${c.hourlyRate}</b></span>
      <span style="color:#9a9aa3;">試做案: <b style="color:#c7e84a;">${c.trialQuote}</b></span>
    </div>
  </div>`).join("");

  const bodyHtml = `
  <div style="background:rgba(199,232,74,0.04);border-left:2px solid #c7e84a;padding:16px 20px;margin:0 0 24px;color:#c8c6c0;line-height:1.75;font-size:15px;">
    <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.12em;color:#c7e84a;margin-bottom:8px;text-transform:uppercase;">✓ 配對完成 / ${candidates.length} CANDIDATES</div>
    為你媒合 <b style="color:#c7e84a;">${candidates.length} 位</b> Tier B+ 以上 worker、試做案範圍 <b style="color:#c7e84a;">${trialBudget}</b>。
  </div>
  <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.12em;color:#9a9aa3;text-transform:uppercase;margin-bottom:12px;">▍ 候選名單 / CANDIDATES</div>
  ${candidateCards}
  <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.12em;color:#9a9aa3;text-transform:uppercase;margin:24px 0 12px;">▍ 下一步 / NEXT STEP</div>
  <ol style="color:#c8c6c0;line-height:1.85;font-size:14px;margin:0 0 24px;padding-left:20px;">
    <li>回信告訴我們你最想先聊哪 1-2 位</li>
    <li>BeyondPath 會 wire 你跟該 worker 直接 email（雙方獨立溝通）</li>
    <li>Worker 給你完整 SOW + 報價單（BP 範本對齊 deliverable）</li>
    <li>試做案啟動、雙方直接結算（BP 不碰錢）</li>
    <li>滿意 → retainer / 不滿意 → 結束、可換 worker</li>
  </ol>
  <div style="background:rgba(255,255,255,0.02);border:1px dashed #2a2a2e;padding:14px 18px;margin:0 0 24px;color:#c8c6c0;line-height:1.65;font-size:13px;">
    試做案小額（${trialBudget}）降首次合作風險、2-4 週交付、滿意才升級 retainer。<br/>
    → <b style="color:#c7e84a;">24h 內</b>回信告訴我們你的選擇
  </div>`;

  const html = emailWrapper({
    header: "● BEYONDPATH · MATCHED",
    titleTo: `${company}，`,
    openLine: `BeyondPath 配對演算法已完成媒合、為你準備 <b style="color:#c7e84a;">${candidates.length} 位</b> Tier B+ 以上 worker 名單。`,
    bodyHtml,
  });

  return { subject, html, text };
}

function buildClientNeedMoreEmail(row: Record<string, unknown>, opts?: { gapItems?: string[] }): { subject: string; html: string; text: string } {
  const company = (row.company_name as string) || "團隊";
  const gapItems = opts?.gapItems || [
    "預算範圍：目前只填 'NT$30-50k'、請告知期望總預算 + 試做案 vs retainer 預算分配",
    "時程：請告知期望交付日期、是否有硬 deadline（例：上線日 / 活動日）",
    "Deliverable 細節：請列具體要產出什麼（KV 數量 / 文案字數 / 影片秒數）",
  ];

  const subject = `BeyondPath 配對需補資料 · ${company}`;
  const text = [
    `${company} 你好，`,
    ``,
    `BeyondPath 配對演算法初評你的 brief：方向清楚、但有幾個細節需要補足、才能配出真正適合的 worker。`,
    ``,
    `▍需補資料`,
    ...gapItems.map(item => `  · ${item}`),
    ``,
    `▍補件方式`,
    `直接回信此 thread、補上面項目。`,
    `BeyondPath 24h 內完成補評估、回信給你完整配對名單（1-3 位 Tier B+ worker）。`,
    ``,
    `▍為什麼補`,
    `預算 / 時程 / deliverable 不清楚、配出的 worker 可能：`,
    `  · 過度資深（超出預算）`,
    `  · 不夠資深（撐不住規模）`,
    `  · 時程不對齊（worker 滿檔）`,
    `補完這幾項、配對精準度大幅提高、不必你後來自己換 worker。`,
    ``,
    `→ 急的話寫信到 hello@beyondpath.tw`,
    ``,
    `— BeyondPath`,
    PUBLIC_HOMEPAGE,
  ].join("\n");

  const gapHtml = gapItems.map(item => `<li>${item}</li>`).join("");
  const bodyHtml = `
  <div style="background:rgba(212,113,42,0.06);border-left:2px solid #d4712a;padding:16px 20px;margin:0 0 24px;color:#c8c6c0;line-height:1.75;font-size:15px;">
    <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.12em;color:#d4712a;margin-bottom:8px;text-transform:uppercase;">◐ 需補資料 / GAPS DETECTED</div>
    BeyondPath 配對演算法初評：方向清楚、但有幾個細節需補、才能配真正適合的 worker。
  </div>
  <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.12em;color:#9a9aa3;text-transform:uppercase;margin-bottom:12px;">▍ 需補資料 / WHAT TO ADD</div>
  <ul style="color:#c8c6c0;line-height:1.85;font-size:14px;margin:0 0 24px;padding-left:20px;">
    ${gapHtml}
  </ul>
  <div style="background:rgba(255,255,255,0.02);border:1px dashed #2a2a2e;padding:14px 18px;margin:0 0 24px;color:#c8c6c0;line-height:1.65;font-size:13px;">
    直接回信此 thread、補上面項目。<br/>
    BeyondPath <b style="color:#c7e84a;">24h 內</b>完成補評估、回信給你完整配對名單。<br/>
    → 急的話寫信到 <b style="color:#c7e84a;">hello@beyondpath.tw</b>
  </div>`;

  const html = emailWrapper({
    header: "● BEYONDPATH · BRIEF NEEDS MORE",
    titleTo: `${company}，`,
    openLine: `BeyondPath 配對演算法初評：方向清楚、但有幾個細節需補、才能配真正適合的 worker。`,
    bodyHtml,
  });

  return { subject, html, text };
}

function buildClientVideoInviteEmail(row: Record<string, unknown>, opts?: { calendarLink?: string; videoReason?: string }): { subject: string; html: string; text: string } {
  const company = (row.company_name as string) || "團隊";
  const calendarLink = opts?.calendarLink || "https://cal.com/beyondpath/30min";
  const videoReason = opts?.videoReason || "你的 brief 涉及多個 vertical / 跨領域配對 / 旗艦案規模、用 30 min 視訊聊深、配對精準度會比 email 來回高很多。";

  const subject = `BeyondPath 建議深聊 30 min · ${company}`;
  const text = [
    `${company} 你好，`,
    ``,
    `BeyondPath 收到你的 brief、配對演算法初評後、建議我們先做 30 min 視訊深聊、再正式配對 worker。`,
    ``,
    `▍為什麼建議視訊`,
    videoReason,
    ``,
    `▍視訊會聊什麼`,
    `  · 你的真實需求 vs brief 寫的（通常有 30% 差距）`,
    `  · 預算 / 時程 / scope 的彈性區間`,
    `  · 適合 retainer 還是試做案 + 試做案怎麼設計`,
    `  · BeyondPath worker 池目前有哪些 candidate（即時討論）`,
    `  · 你的 brand DNA / 品牌調性、配對的 worker 是否對齊`,
    ``,
    `▍預約連結`,
    calendarLink,
    ``,
    `▍如果不方便視訊`,
    `回信補答下面幾個問題、BeyondPath 配對演算法可以用 email 完成配對：`,
    `  · 真實預算總額（含試做案 + 後續 retainer）`,
    `  · 硬 deadline（活動日 / 上線日）`,
    `  · 過去合作過類似 worker 嗎？覺得最匹配的是什麼風格？`,
    ``,
    `→ 急的話寫信到 hello@beyondpath.tw`,
    ``,
    `— BeyondPath`,
    PUBLIC_HOMEPAGE,
  ].join("\n");

  const bodyHtml = `
  <div style="background:rgba(126,182,255,0.08);border-left:2px solid #7eb6ff;padding:16px 20px;margin:0 0 24px;color:#c8c6c0;line-height:1.75;font-size:15px;">
    <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.12em;color:#7eb6ff;margin-bottom:8px;text-transform:uppercase;">◑ 建議深聊 / 30 MIN VIDEO</div>
    ${videoReason}
  </div>
  <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.12em;color:#9a9aa3;text-transform:uppercase;margin-bottom:12px;">▍ 視訊會聊什麼 / AGENDA</div>
  <ul style="color:#c8c6c0;line-height:1.85;font-size:14px;margin:0 0 24px;padding-left:20px;">
    <li>你的真實需求 vs brief 寫的（通常有 30% 差距）</li>
    <li>預算 / 時程 / scope 的彈性區間</li>
    <li>適合 retainer 還是試做案 + 試做案怎麼設計</li>
    <li>BeyondPath worker 池目前有哪些 candidate（即時討論）</li>
    <li>你的 brand DNA / 品牌調性、配對的 worker 是否對齊</li>
  </ul>
  <div style="background:rgba(199,232,74,0.04);border:1px solid rgba(199,232,74,0.2);padding:18px 20px;margin:0 0 24px;text-align:center;">
    <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.12em;color:#9a9aa3;margin-bottom:10px;text-transform:uppercase;">預約 30 min 視訊</div>
    <a href="${calendarLink}" style="display:inline-block;background:#c7e84a;color:#0a0a0b;padding:12px 28px;font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700;text-decoration:none;letter-spacing:0.08em;text-transform:uppercase;">→ 點此預約</a>
  </div>
  <div style="background:rgba(255,255,255,0.02);border:1px dashed #2a2a2e;padding:14px 18px;margin:0 0 24px;color:#c8c6c0;line-height:1.65;font-size:13px;">
    <b style="color:#c7e84a;">如果不方便視訊</b>、回信補答這幾個問題、BeyondPath 用 email 完成配對：<br/>
    · 真實預算總額（含試做案 + 後續 retainer）<br/>
    · 硬 deadline<br/>
    · 過去合作過類似 worker 嗎？覺得最匹配的是什麼風格？
  </div>`;

  const html = emailWrapper({
    header: "● BEYONDPATH · VIDEO RECOMMENDED",
    titleTo: `${company}，`,
    openLine: `BeyondPath 收到你的 brief、配對演算法初評後、建議我們先做 <b style="color:#c7e84a;">30 min 視訊深聊</b>、再正式配對 worker。`,
    bodyHtml,
  });

  return { subject, html, text };
}

function buildClientNotFitEmail(row: Record<string, unknown>, opts?: { reason?: string; suggestions?: string[] }): { subject: string; html: string; text: string } {
  const company = (row.company_name as string) || "團隊";
  const reason = opts?.reason || "你的 vertical 目前不在 BeyondPath 主場（DTC 內容 / B2B SaaS GTM / 設計品牌）、worker 池暫不適合你的需求。";
  const suggestions = opts?.suggestions || [
    "104 接案網（一般綜合接案、無 AI 認證、但 pool 廣）",
    "Tasker 出任務（B2C 服務類）",
    "Upwork / Fiverr（國際接案、含 AI 領域、但需英文溝通）",
    "你 vertical 的專屬社群（垂直論壇 / FB 社團、找該領域熟人）",
  ];

  const subject = `BeyondPath 暫不適合配對 · ${company}`;
  const text = [
    `${company} 你好，`,
    ``,
    `謝謝你把 brief 交給 BeyondPath、誠實告訴你：`,
    reason,
    ``,
    `▍為什麼這樣回`,
    `BeyondPath worker 池目前 100% 集中在 DTC 內容 / B2B SaaS GTM / 設計品牌三個 vertical 的 AI 認證 worker。`,
    `配出不對的 worker 你也不滿意、worker 也接不好、不如直接告訴你「不是我們的主場」、節省你時間。`,
    ``,
    `▍建議方向`,
    ...suggestions.map(item => `  · ${item}`),
    ``,
    `▍未來歡迎回來`,
    `BeyondPath 預計 2026 Q3 正式上線、會逐步擴 vertical。你的 brief 我們有留檔、未來開新 vertical 時主動通知你。`,
    `若你的需求其實有對齊 BP 主場、只是 brief 沒寫清楚、可回信補資料、我們重新評估。`,
    ``,
    `→ 有疑問寫信到 hello@beyondpath.tw`,
    ``,
    `— BeyondPath`,
    PUBLIC_HOMEPAGE,
  ].join("\n");

  const suggestionHtml = suggestions.map(item => `<li>${item}</li>`).join("");
  const bodyHtml = `
  <div style="background:rgba(255,255,255,0.025);border-left:2px solid #9a9aa3;padding:16px 20px;margin:0 0 24px;color:#c8c6c0;line-height:1.75;font-size:15px;">
    <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.12em;color:#9a9aa3;margin-bottom:8px;text-transform:uppercase;">✗ 暫不適合 / NOT IN VERTICAL</div>
    ${reason}
  </div>
  <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.12em;color:#9a9aa3;text-transform:uppercase;margin-bottom:12px;">▍ 建議方向 / SUGGESTIONS</div>
  <ul style="color:#c8c6c0;line-height:1.85;font-size:14px;margin:0 0 24px;padding-left:20px;">
    ${suggestionHtml}
  </ul>
  <div style="background:rgba(199,232,74,0.04);border-left:2px solid #c7e84a;padding:14px 18px;margin:0 0 24px;color:#c8c6c0;line-height:1.65;font-size:13px;">
    <b style="color:#c7e84a;">未來歡迎回來</b><br/>
    BeyondPath 預計 <b>2026 Q3</b> 正式上線、會逐步擴 vertical。你的 brief 我們有留檔、未來開新 vertical 時主動通知你。<br/>
    若你的需求其實有對齊 BP 主場、只是 brief 沒寫清楚、可回信補資料、我們重新評估。
  </div>`;

  const html = emailWrapper({
    header: "● BEYONDPATH · NOT IN CURRENT VERTICAL",
    titleTo: `${company}，`,
    openLine: `謝謝你把 brief 交給 BeyondPath、誠實告訴你：${reason}`,
    bodyHtml,
  });

  return { subject, html, text };
}

// ============ end decision templates ============

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

請給 Edward 四件事（總長 ≤ 160 字、Slack mrkdwn 格式、用繁體中文）：

1. *接 / 不接 / 看情況* + 一句直白理由（避免客套、給 actionable）
2. *Tier 建議*（B / B+ / A / A+）+ 一句 why（看複雜度與品牌等級）
3. *報價建議*（NT$ 區間、含 +15% 平台溢價）+ 適合契約類型（試做案 / 月費 retainer）
4. *推薦 3 位 worker* · 從下方候選池挑最匹配 3 位、每位附 1 句 why（≤ 20 字 · 例「設計領域對位 + L-score 9 高」）。候選池為空時、寫「無 approved worker 可推、建議擴池」

注意：
- 純 Slack mrkdwn、用 *粗體* 標 key info、不要 markdown code block
- 不灑空話（「值得進一步討論」「需要更多資訊」這種無資訊量的話禁止）
- 若預算太低或 brief 太模糊、直接說「不接」並建議 Edward 推回去
- 對應預算粗判：< 50k → B、50-150k → B+/A、150-300k → A、> 300k → A+
- worker 推薦排序按平台 match_score、不要重排`;

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("NEXT_PUBLIC_SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

function _pickServiceKey(): string {
  return SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
}

// brief #5 (2026-05-20 calcifer): replaced HTTP self-call to match-workers with in-process rank
// Why: avoid deadlock when this function (notify-lead-slack) is at concurrency cap and self-call queues.
// Result: same ranking outcome + same client_intakes.match_result persistence + zero extra HTTP hop.
async function buildVerticalListNotify(primary: string): Promise<string[]> {
  const list: string[] = [primary];
  const neighbors = VERTICAL_ADJACENCY[primary] || [];
  for (const n of neighbors) if (list.indexOf(n) === -1) list.push(n);
  return list;
}

async function _loadWorkerPoolNotify(primaryVertical: string): Promise<UnifiedWorker[]> {
  if (!SUPABASE_URL || !primaryVertical) return [];
  const verticals = await buildVerticalListNotify(primaryVertical);
  const quoted = verticals.map(function (v) { return JSON.stringify(v); }).join(",");
  const verticalParam = "{" + quoted + "}";
  const url = SUPABASE_URL + "/rest/v1/worker_unified_v?select=id,email,display_name,unified_card,verticals,tier_suggestion,updated_at" +
    "&verticals=ov." + encodeURIComponent(verticalParam) + "&unified_card=not.is.null&limit=100";
  try {
    const key = _pickServiceKey();
    const res = await fetch(url, { headers: { "apikey": key, "Authorization": "Bearer " + key } });
    if (!res.ok) return [];
    const rows = await res.json() as Array<Record<string, unknown>>;
    if (!Array.isArray(rows)) return [];
    const workers: UnifiedWorker[] = [];
    for (const row of rows) {
      const card = row.unified_card as UnifiedWorker | null;
      if (!card || typeof card !== "object") continue;
      if (!card.last_active && row.updated_at) card.last_active = row.updated_at as string;
      if (!card.id && row.id) card.id = row.id as string;
      workers.push(card);
    }
    return workers;
  } catch {
    return [];
  }
}

async function _persistMatchResultNotify(clientIntakeId: string, results: Array<{
  worker_id: string; handle: string; name: string; tier: string;
  L_score: number; verticals: string[]; score: number; breakdown: Record<string, number>; why: string;
}>): Promise<boolean> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !clientIntakeId) return false;
  const url = SUPABASE_URL + "/rest/v1/client_intakes?id=eq." + encodeURIComponent(clientIntakeId);
  const body = JSON.stringify({
    match_result: { results, generated_at: new Date().toISOString(), version: "v0.1-inproc" },
    matched_at: new Date().toISOString(),
  });
  try {
    const res = await fetch(url, {
      method: "PATCH",
      headers: {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": "Bearer " + SUPABASE_SERVICE_ROLE_KEY,
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
      },
      body,
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function callMatchWorkers(clientIntakeId: string, clientRecord?: Record<string, unknown>): Promise<Array<{
  worker_id: string; handle: string; name: string; tier: string;
  L_score: number; score: number; why: string; verticals: string[];
}>> {
  if (!SUPABASE_URL || !clientIntakeId) return [];
  try {
    const rec = clientRecord || {};
    const intakeData = rec.intake_data as Record<string, unknown> | null;
    const data = (intakeData && typeof intakeData === "object") ? intakeData : {};
    const rawTasks = (data as Record<string, unknown>).tasks;
    const tasks: string[] = Array.isArray(rawTasks) ? (rawTasks as unknown[]).map(function (t) { return String(t); }) : [];
    const client: ClientIntakeForMatch = {
      id: clientIntakeId,
      vertical: (rec.vertical as string) || "",
      tasks,
      budget_range: (rec.budget_range as string) || undefined,
      timeline: (rec.timeline as string) || undefined,
      required_tier: (data as Record<string, unknown>).required_tier as string | undefined,
    };
    if (!client.vertical) return [];
    const workers = await _loadWorkerPoolNotify(client.vertical);
    const ranked = rankWorkers(client, workers, 5);
    // best-effort persist (non-blocking on Slack notification)
    _persistMatchResultNotify(clientIntakeId, ranked).catch(function () {});
    return ranked;
  } catch {
    return [];
  }
}

function formatWorkerCandidates(results: Array<{
  handle: string; name: string; tier: string; L_score: number; score: number; why: string;
}>): string {
  if (!results || results.length === 0) return "";
  const top = results.slice(0, 3);
  const lines = ["", "*[Top " + top.length + " match]*"];
  for (let i = 0; i < top.length; i++) {
    const w = top[i];
    lines.push("  " + (i + 1) + ". `" + w.handle + "` " + w.name +
      " . Tier *" + w.tier + "* . L " + w.L_score + " . score *" + w.score + "* . " + w.why);
  }
  return lines.join("\n");
}

interface MatchPoolEntry {
  handle: string;
  name: string;
  tier: string;
  L_score: number;
  score: number;
  why: string;
  verticals: string[];
}

async function getEdwardAdvisorAnalysis(briefData: {
  brief: string;
  budget_range?: string;
  timeline?: string;
  vertical?: string;
  company_name?: string;
  workerPool?: MatchPoolEntry[];
}): Promise<string | null> {
  if (!ANTHROPIC_API_KEY || !briefData.brief || briefData.brief.trim().length < 20) {
    return null;
  }

  const pool = briefData.workerPool || [];
  const poolBlock = pool.length === 0
    ? "WorkerPool: empty (no approved worker in this vertical)"
    : "WorkerPool (sorted by match_score desc):\n" + pool.map(function (w, i) {
        return (i + 1) + ". " + w.handle + " " + w.name + " . Tier " + w.tier +
          " . L " + w.L_score + " . score " + w.score + " . " + w.why;
      }).join("\n");

  const userMsg = [
    `Brief：\n${briefData.brief.trim()}`,
    briefData.company_name ? `公司：${briefData.company_name}` : null,
    briefData.budget_range ? `預算：${briefData.budget_range}` : null,
    briefData.timeline ? `時程：${briefData.timeline}` : null,
    briefData.vertical ? `領域：${briefData.vertical}` : null,
    poolBlock,
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

  // 2026-05-29 calcifer . doc 28 Part C . DB webhook 防偽造
  // 註: notify-lead-slack 是 Supabase Database Webhook (worker_applications / client_intakes INSERT 觸發) .
  //     來源是 Supabase 內部 . 不是 anon 任意打 . 故「不用 IP 限流」(對內部 webhook 無意義 . IP 不固定) .
  //     正解 = webhook secret header 驗證 . 防外人偽造 INSERT payload 洗 Slack .
  //     Edward 在 Database Webhook 設定加 header (x-webhook-secret: <值>) + 設 NOTIFY_WEBHOOK_SECRET env .
  //     未設 secret 時放行 (向後相容 . 既有 webhook 不立刻壞) .
  if (NOTIFY_WEBHOOK_SECRET) {
    const got = req.headers.get("x-webhook-secret") || "";
    if (got !== NOTIFY_WEBHOOK_SECRET) {
      return new Response(JSON.stringify({ ok: false, error: "invalid-webhook-secret" }), {
        status: 401, headers: { "Content-Type": "application/json" },
      });
    }
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
    // brief #1 (2026-05-20 calcifer) . refined ack template aligned with decision-email style
    //   + 24h response framing + AI 拆解 + 人工覆核並行 + Early Beta fallback mailto
    //   buildClientConfirmEmail (legacy) still defined above for back-compat, but unused on new path.
    const _intakeData = payload.record.intake_data as Record<string, unknown> | null;
    const _enterprise = (_intakeData && typeof _intakeData === "object" && _intakeData.enterprise && typeof _intakeData.enterprise === "object")
      ? _intakeData.enterprise as Record<string, unknown> : null;
    const _entFlags: string[] = [];
    if (_enterprise?.nda) _entFlags.push("NDA");
    if (_enterprise?.invoice) _entFlags.push("公司發票");
    if (_enterprise?.contract) _entFlags.push("公司簽約");
    if (_enterprise?.talkToEdward) _entFlags.push("視訊聊");
    emailTemplate = buildClientAckEmail({
      company_name: (payload.record.company_name as string) || "",
      vertical: (payload.record.vertical as string) || undefined,
      budget_range: (payload.record.budget_range as string) || undefined,
      timeline: (payload.record.timeline as string) || undefined,
      enterprise_flags: _entFlags,
    });
    // 額外 call Claude 給 Edward decision support
    const intakeData = payload.record.intake_data as Record<string, unknown> | null;
    const brief = (intakeData && typeof intakeData === "object")
      ? ((intakeData.brief as string) || (intakeData.description as string) || (intakeData.project_brief as string) || "")
      : "";
    // P1-3 / P1-4 (2026-05-20) call match-workers internally for Top 5 + pass to advisor
    const clientIntakeId = payload.record.id as string;
    const matchResults = await callMatchWorkers(clientIntakeId, payload.record);
    claudeAdvice = await getEdwardAdvisorAnalysis({
      brief,
      budget_range: payload.record.budget_range as string | undefined,
      timeline: payload.record.timeline as string | undefined,
      vertical: payload.record.vertical as string | undefined,
      company_name: payload.record.company_name as string | undefined,
      workerPool: matchResults.map(function (r) { return {
        handle: r.handle, name: r.name, tier: r.tier, L_score: r.L_score,
        score: r.score, why: r.why, verticals: r.verticals,
      }; }),
    });
    // Append candidate list to Slack body (rendered below)
    const candidateBlock = formatWorkerCandidates(matchResults);
    if (candidateBlock) text += candidateBlock;
  } else {
    text = `📥 *新 Lead* (${payload.table}) · row id: \`${payload.record.id ?? "?"}\``;
  }

  // 2026-05-31 calcifer . doc 37 gap 2 . fire-and-forget email 通知 Edward 本人 (待覆核 / 待配對)
  //   - 不 await . 不阻塞 Slack + 確認信 response . fail-soft (RESEND 未設 silent)
  if (payload.table === "worker_applications") {
    notifyEdward("worker_apply", {
      title: (payload.record.display_name as string) || (payload.record.email as string) || "(unnamed)",
      email: (payload.record.email as string) || undefined,
      tier: (payload.record.tier_suggestion as string) || null,
      lScore: (payload.record.l_score as number | null) ?? null,
      verticals: Array.isArray(payload.record.verticals) ? (payload.record.verticals as string[]) : null,
    }).catch(function () {});
  } else if (payload.table === "client_intakes") {
    const _id2 = payload.record.intake_data as Record<string, unknown> | null;
    const _briefSnip = (_id2 && typeof _id2 === "object")
      ? truncate(((_id2.brief as string) || (_id2.description as string) || (_id2.project_brief as string) || ""), 200)
      : "";
    const _ent2 = (_id2 && typeof _id2 === "object" && _id2.enterprise && typeof _id2.enterprise === "object")
      ? _id2.enterprise as Record<string, unknown> : null;
    const _entFlags2: string[] = [];
    if (_ent2?.nda) _entFlags2.push("NDA");
    if (_ent2?.invoice) _entFlags2.push("invoice");
    if (_ent2?.contract) _entFlags2.push("contract");
    if (_ent2?.talkToEdward) _entFlags2.push("video");
    notifyEdward("client_intake", {
      title: (payload.record.company_name as string) || (payload.record.email as string) || "(unnamed)",
      email: (payload.record.email as string) || undefined,
      vertical: (payload.record.vertical as string) || null,
      budget: (payload.record.budget_range as string) || null,
      timeline: (payload.record.timeline as string) || null,
      briefSnippet: _briefSnip || null,
      enterpriseFlags: _entFlags2.length ? _entFlags2 : null,
    }).catch(function () {});
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
