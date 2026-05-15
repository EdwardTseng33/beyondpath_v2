// BeyondPath POC · Supabase Edge Function
// worker-ai-interview · 真接 Anthropic Claude · server-side 跑 7 段 worker 入會訪談、取代 paste-back
//
// Trigger: worker.jsx Step 2 client-side chat UI fetch (每次 user 答完 → POST messages → Claude next question)
// Replaces: external ChatGPT/Claude paste-back + JSON parse
//
// Secrets: ANTHROPIC_API_KEY (跟 client-brief-parse 共用)
// Cost (Sonnet 4.6): ~14 turns × 1k input + 800 output ≈ NT$2-3 / completed interview

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";
const ANTHROPIC_MODEL = Deno.env.get("ANTHROPIC_MODEL") ?? "claude-sonnet-4-6";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
};

const SYSTEM_PROMPT = `你是 BeyondPath worker 入會訪談員。

— 任務 —
跟想申請 BeyondPath Tier B / B+ 認證的工作者進行 7 段結構化訪談（總長約 15-25 分鐘對話）、最後產出 ai_proof JSON 給平台 render 成能力卡。

— 7 段訪談順序 —
1. 自我介紹 + 主力領域（verticals · 例 design / copy / dev / ops / strategy / 其他）+ 大概年資
2. AI 工具使用習慣 + 你常用的 workflow（Claude / ChatGPT / Cursor / v0 / Midjourney / Make / n8n / Zapier 等 · 串接邏輯）
3. 近 12 個月 AI 相關案件數量 + 3 個具體案例（客戶名 / 用什麼 AI / 交付成果 / 關鍵 metric）
4. 一個你最自豪的 AI workflow：詳述 prompt 設計 + tools 串接 + 為什麼 work
5. 你的 L-Score 自評（0-10、AI 在你日常工作的 leverage 程度）+ 為什麼這個分數
6. Skill Matrix 6 維自評（各 1-10）：Workflow 設計 / 多工具搭配 / 判斷力 / 領域深度 / 客戶溝通 / 交付可靠度
7. 你想接什麼類型 client / 不接什麼（vertical / budget / 工作節奏 / 文化）

— 每段邏輯 —
- 答得清楚 + 具體 → 短回應 + 進下一段
- 答得模糊 / 抽象 → 追問具體例子（例「用在哪個案件? 拿什麼成果?」「你說的 prompt 設計具體長什麼樣?」）
- 答到 outside scope → 友善拉回（例「這部分先不細談、先把 AI workflow 說完」）
- 用戶說「我先簡答 / 想結束」→ 接受、用既有 info 推估 ai_proof

— 風格 —
- 同事感、不灑客套、繁體中文
- 每次回應 ≤ 80 字、聚焦下一個問題
- 第 1 次 call (messages 空 / [INTERVIEW_START]) → 暖開場 1-2 句 + 直接問第 1 題
- 中段 → ack 上一個答 1 句 + 下一題
- 結尾（第 7 段答完）→ 短感謝 + status complete + ai_proof

— 輸出規則（嚴格、JSON only · 絕不灑 markdown wrapper） —

訪談中:
{
  "status": "asking",
  "step": 1-7,
  "message": "給用戶的回應 + 下一題",
  "progress_hint": "Step X / 7"
}

完成（第 7 段答完）:
{
  "status": "complete",
  "step": 7,
  "message": "感謝完成訪談 · 看你的能力卡 + Edward 24h 內覆核",
  "ai_proof": {
    "name": "用戶自稱（中文或英文）",
    "L_score": 0-10,
    "L_confidence": "高" | "中" | "低",
    "tier_suggestion": "B" | "B+",
    "evidence_quality": "高" | "中" | "低",
    "verticals": ["design", "copy", ...],
    "case_count": "3-5" | "5+" | "10+" | "1-2" | "0",
    "skill_matrix": {
      "workflow_design": 1-10,
      "tool_orchestration": 1-10,
      "judgment": 1-10,
      "domain_depth": 1-10,
      "client_communication": 1-10,
      "delivery_reliability": 1-10
    },
    "strengths": ["一句話 strength 1", "一句話 strength 2", "一句話 strength 3"],
    "growth": ["建議成長方向 1", "建議成長方向 2"]
  }
}

— Tier 判斷指引 —
- B (實踐者): 1-3 案 · L 5-7 · 工具會用但 workflow 較單一
- B+ (實踐者進階): 5+ 案 · L 7-9 · multi-tool orchestration · 判斷力清楚
- L_score < 5 → 仍給 B 但 evidence_quality 標 "低"、tier_suggestion 仍 "B"
- L_score 8+ + 多 vertical + 5+ case + 自帶具體 metric → "B+"

警示: 絕不輸出 JSON 以外的內容、絕不加 markdown code block、絕不在 message 內塞 JSON snippet。`;

interface InterviewRequest {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
}

interface ClaudeResponse {
  content?: Array<{ type: string; text?: string }>;
  usage?: { input_tokens: number; output_tokens: number };
  error?: { message: string; type: string };
}

function tryParseJSON(text: string): unknown | null {
  try { return JSON.parse(text); } catch {}
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) {
    try { return JSON.parse(fenced[1]); } catch {}
  }
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first >= 0 && last > first) {
    try { return JSON.parse(text.slice(first, last + 1)); } catch {}
  }
  return null;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: CORS_HEADERS });
  }

  if (!ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ ok: false, error: "missing-anthropic-api-key" }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
    );
  }

  let payload: InterviewRequest;
  try {
    payload = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ ok: false, error: "invalid-json" }),
      { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
    );
  }

  // 第一次 call: 空 messages → seed [INTERVIEW_START]
  const messages = (payload.messages && payload.messages.length > 0)
    ? payload.messages
    : [{ role: "user" as const, content: "[INTERVIEW_START]" }];

  // Cap messages length 防 abuse / over-cost
  if (messages.length > 30) {
    return new Response(
      JSON.stringify({ ok: false, error: "interview-too-long", hint: "Max 30 messages per interview · please restart or submit current state" }),
      { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
    );
  }

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
        model: ANTHROPIC_MODEL,
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        messages: messages,
      }),
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: "anthropic-fetch-fail", details: String(e) }),
      { status: 502, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
    );
  }

  const claudeData = (await claudeRes.json()) as ClaudeResponse;
  if (!claudeRes.ok || claudeData.error) {
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
    return new Response(
      JSON.stringify({
        ok: false,
        error: "claude-non-json",
        raw_excerpt: text.slice(0, 500),
        hint: "Claude returned non-JSON response · interview state may be inconsistent",
      }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
    );
  }

  return new Response(
    JSON.stringify({ ok: true, ...parsed, usage: claudeData.usage, model: ANTHROPIC_MODEL }),
    { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
  );
});
