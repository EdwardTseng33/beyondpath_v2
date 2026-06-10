// BeyondPath POC · Supabase Edge Function
// client-brief-parse · 真接 Anthropic Claude API、把 client brief 拆解成結構化 JSON
//
// Trigger: app2.jsx Step2 client-side fetch (after user submits brief in Step 1)
// Replaces: fake setInterval animation + hardcoded AI_PARSE_RESULT
//
// Secrets required (Supabase Dashboard → Edge Functions → Secrets):
//   ANTHROPIC_API_KEY — sk-ant-... from console.anthropic.com
//
// Cost (Claude Sonnet 4.6): ~2000-3000 input + 1500-2500 output tokens / call ≈ NT$0.5-0.8 / case

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { checkRateLimit, getClientIp, rateLimitResponse } from "../_shared/rate-limit.ts";  // 2026-05-29 calcifer doc28 C . 燒 Anthropic token . 限流防洗
import { isAdminRequest } from "../_shared/admin.ts";  // admin JWT bypass 限流

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";
const MODEL = Deno.env.get("ANTHROPIC_MODEL") ?? "claude-sonnet-4-6";

// Slack alert (2026-05-15 v0.3) · 後端 5xx error 主動推 Slack 給 Edward
const SLACK_BOT_TOKEN = Deno.env.get("SLACK_BOT_TOKEN") ?? "";
const SLACK_ALERT_CHANNEL = Deno.env.get("SLACK_ALERT_CHANNEL") ?? "C0B3RRKGQCD"; // #beyondpath-leads

async function alertSlackOnError(context: string, errorMsg: string, statusCode?: number, briefSnippet?: string) {
  if (!SLACK_BOT_TOKEN) return;
  try {
    const lines = [
      `⚠ *Edge Function ALERT* · \`${context}\``,
      statusCode ? `HTTP: ${statusCode}` : null,
      `Error: \`${String(errorMsg).slice(0, 280)}\``,
      briefSnippet ? `Brief snippet: ${String(briefSnippet).slice(0, 160)}…` : null,
      `Time: ${new Date().toISOString()}`,
      `Action: 看 Supabase Logs · 確認 Claude API quota / key / 5xx pattern`,
    ].filter(Boolean).join("\n");
    await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${SLACK_BOT_TOKEN}` },
      body: JSON.stringify({ channel: SLACK_ALERT_CHANNEL, text: lines, unfurl_links: false }),
    });
  } catch {
    // Slack alert 失敗 silent · 不 cascade 影響 user response
  }
}

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
};

const SYSTEM_PROMPT = `你是 BeyondPath 平台的 AI brief parser。BeyondPath 是 AI 時代的工作配對網路、媒合台灣品牌與認證化的 AI 工作者。

任務：把 client 提供的需求 brief 解析成結構化 JSON、給 BeyondPath 的 worker matching + 報價估算 + 任務拆解用。

輸出規則（嚴格遵守）：
1. 只輸出純 JSON、不要 markdown code block、不要任何說明文字
2. 所有字串值用繁體中文（除 industry.en / tasks[].en / contractType.en 等明確標 en 的欄位）
3. budget 用台幣 NT$、不要小數點
4. tasks 至少 3 個、至多 8 個
5. flags 至少 2 個（要含 ok + warn 或 info、給 client 真誠的 risk awareness）

輸出 schema：
{
  "industry": { "en": "D2C Skincare", "zh": "D2C 保養品牌", "confidence": 0.94 },
  "scope": "content-automation" | "brand-positioning" | "growth-marketing" | "product-launch" | "其他",
  "tasks": [
    { "id": "t1", "en": "Visual KV × 2", "zh": "主視覺 KV × 2 張", "hours": 18, "role": "Visual" | "Copy" | "Ops" | "Strategy" | "Dev", "tier": "A+" | "A" | "B+" | "B" }
  ],
  "recommendedTier": "A+" | "A" | "B+" | "B",
  "vertical": "DTC Content Automation" | "B2B SaaS Growth" | "Brand Positioning" | ...,
  "totalHours": 68,
  "budget": { "lo": 180000, "hi": 240000, "currency": "NT$" },
  "contractType": {
    "en": "Trial Project" | "Monthly Retainer" | "Sprint Project",
    "zh": "試做案" | "月費 retainer" | "Sprint 專案",
    "alt": "可轉月費 retainer 等補充說明"
  },
  "flags": [
    { "kind": "ok" | "warn" | "info", "text": "簡短一句、12-30 字" }
  ]
}

判斷指引：
- 預算 < NT$50k → Tier B（基本可動）
- 預算 NT$50k-150k → Tier B+ 或 A（看複雜度）
- 預算 NT$150k-300k → Tier A
- 預算 > NT$300k → Tier A+（旗艦案）
- 涉品牌 DNA / 策略視覺 / 長期合作 → Tier 高一級
- 時程緊（< 4 週交付且任務多）→ 加 warn flag「建議 multi-expert 共案」
- 任務拆解時、估 hours 要合理（KV 設計 ~18h、Reels 腳本 ~3-4h/支、Copy ~5-8h/篇）
- platform_premium：market_high 乘 +15% 得 hi、market_low 得 lo

警示：絕對不輸出 JSON 以外的內容、不加 \`\`\`json wrapper。`;

interface BriefRequest {
  brief: string;
  budget_range?: string;
  timeline?: string;
  vertical?: string;
  company_name?: string;
}

interface ClaudeMessage {
  role: "user" | "assistant";
  content: string;
}

interface ClaudeResponse {
  content?: Array<{ type: string; text?: string }>;
  usage?: { input_tokens: number; output_tokens: number };
  error?: { message: string; type: string };
}

function tryParseJSON(text: string): unknown | null {
  // 直接 parse
  try { return JSON.parse(text); } catch {}
  // 試 markdown 包裝 (\`\`\`json ... \`\`\`)
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) {
    try { return JSON.parse(fenced[1]); } catch {}
  }
  // 試找第一個 { 到最後一個 } 的子字串
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first >= 0 && last > first) {
    try { return JSON.parse(text.slice(first, last + 1)); } catch {}
  }
  return null;
}

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: CORS_HEADERS });
  }

  // 2026-05-29 calcifer . doc 28 Part C Group B . IP 限流 (高優先 . 燒 Anthropic token)
  // 狂打此函式 = AI 帳單失血 . 每 IP 每分鐘上限 10 次 . 超過 429
  // admin JWT (Edward 操作) 自動 bypass . 不被擋
  if (!(await isAdminRequest(req))) {
    const rl = await checkRateLimit("client-brief-parse", getClientIp(req), { limit: 10, windowSec: 60 });
    if (!rl.allowed) return rateLimitResponse(rl, CORS_HEADERS);
  }

  if (!ANTHROPIC_API_KEY) {
    await alertSlackOnError("client-brief-parse · missing-anthropic-api-key", "ANTHROPIC_API_KEY not set in Supabase secrets", 500);
    return new Response(
      JSON.stringify({ ok: false, error: "missing-anthropic-api-key", hint: "Set ANTHROPIC_API_KEY in Supabase Edge Function secrets" }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
    );
  }

  let payload: BriefRequest;
  try {
    payload = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ ok: false, error: "invalid-json" }),
      { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
    );
  }

  if (!payload.brief || payload.brief.trim().length < 20) {
    return new Response(
      JSON.stringify({ ok: false, error: "brief-too-short", hint: "Brief must be at least 20 characters" }),
      { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
    );
  }

  // 組 user message
  const userParts = [
    `Client brief（用戶填的需求）：\n${payload.brief.trim()}`,
  ];
  if (payload.company_name) userParts.push(`公司：${payload.company_name}`);
  if (payload.budget_range) userParts.push(`預算範圍：${payload.budget_range}`);
  if (payload.timeline) userParts.push(`時程：${payload.timeline}`);
  if (payload.vertical) userParts.push(`產業 hint：${payload.vertical}`);
  userParts.push(`\n請依照 system prompt 輸出 JSON 結果。`);
  const userMessage = userParts.join("\n\n");

  const claudeMessages: ClaudeMessage[] = [
    { role: "user", content: userMessage },
  ];

  // Call Anthropic API
  let claudeRes: Response;
  try {
    claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 3000,
        system: SYSTEM_PROMPT,
        messages: claudeMessages,
      }),
    });
  } catch (e) {
    await alertSlackOnError("client-brief-parse · anthropic-fetch-fail", String(e), 502, payload.brief);
    return new Response(
      JSON.stringify({ ok: false, error: "anthropic-fetch-fail", details: String(e) }),
      { status: 502, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
    );
  }

  const claudeData = (await claudeRes.json()) as ClaudeResponse;

  if (!claudeRes.ok || claudeData.error) {
    await alertSlackOnError(
      "client-brief-parse · anthropic-api-error",
      `HTTP ${claudeRes.status} · ${claudeData.error?.message || "unknown"}`,
      claudeRes.status,
      payload.brief,
    );
    return new Response(
      JSON.stringify({
        ok: false,
        error: "anthropic-api-error",
        status: claudeRes.status,
        details: claudeData.error?.message || "unknown",
      }),
      { status: 502, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
    );
  }

  const text = claudeData.content?.[0]?.text ?? "";
  const parsed = tryParseJSON(text);

  if (!parsed || typeof parsed !== "object") {
    await alertSlackOnError(
      "client-brief-parse · parse-fail",
      `Claude returned non-JSON: ${text.slice(0, 200)}`,
      500,
      payload.brief,
    );
    return new Response(
      JSON.stringify({
        ok: false,
        error: "parse-fail",
        raw_excerpt: text.slice(0, 500),
        hint: "Claude returned non-JSON response",
      }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
    );
  }

  return new Response(
    JSON.stringify({
      ok: true,
      parsed,
      usage: claudeData.usage,
      model: MODEL,
    }),
    { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
  );
});
