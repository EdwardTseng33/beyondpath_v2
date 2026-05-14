// BeyondPath POC · Supabase Edge Function
// notify-lead-slack · 接 Database Webhook INSERT → post to Slack #beyondpath-leads
//
// Trigger source: Supabase Dashboard → Database → Webhooks
//   - worker_applications INSERT → POST /functions/v1/notify-lead-slack
//   - client_intakes INSERT → POST /functions/v1/notify-lead-slack
//
// Secrets required (Supabase Dashboard → Edge Functions → Secrets):
//   SLACK_BOT_TOKEN — Sophie bot xoxb token, must have chat:write + already in #beyondpath-leads

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const SLACK_BOT_TOKEN = Deno.env.get("SLACK_BOT_TOKEN") ?? "";
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

  const lines = [
    `📋 *新 Client Intake* · _${company}_`,
    `\`${email}\` · 預算 *${budget}*${timeline ? ` · 時程 ${timeline}` : ""}`,
  ];
  if (vertical) lines.push(`領域：${vertical}`);
  if (brief) lines.push(`> ${brief}`);
  return lines.join("\n");
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
  if (payload.table === "worker_applications") {
    text = formatWorker(payload.record);
  } else if (payload.table === "client_intakes") {
    text = formatClient(payload.record);
  } else {
    text = `📥 *新 Lead* (${payload.table}) · row id: \`${payload.record.id ?? "?"}\``;
  }

  const slackResult = await postToSlack(text);
  return new Response(JSON.stringify(slackResult), {
    status: slackResult.ok ? 200 : 500,
    headers: { "Content-Type": "application/json" },
  });
});
