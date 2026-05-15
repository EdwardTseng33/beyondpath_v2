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

  if (payload.table === "worker_applications") {
    text = formatWorker(payload.record);
  } else if (payload.table === "client_intakes") {
    text = formatClient(payload.record);
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

  const slackResult = await postToSlack(text);
  return new Response(JSON.stringify({ ...slackResult, claude_advice_attached: !!claudeAdvice }), {
    status: slackResult.ok ? 200 : 500,
    headers: { "Content-Type": "application/json" },
  });
});
