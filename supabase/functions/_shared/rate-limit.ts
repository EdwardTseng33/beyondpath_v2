// BeyondPath POC . Edge Function shared . IP rate limit (Deno KV)
// 2026-05-29 calcifer . doc 28 Part C . public 函式防洗 (狂打燒 Anthropic 鑰匙防線)
//
// 設計 (doc 14 P0-2 + doc 28 C.1 寫死):
//   - 儲存用 Deno KV (Supabase Edge Runtime 內建 . 成本 0 . 零外部依賴)
//   - key = ratelimit:<函式名>:<IP>  (IP + 函式名 . 避免跨函式干擾)
//   - 滑動視窗近似: 計數 + KV 原生 TTL expireIn (到期自動清 . 不無限累加)
//   - 超過上限 -> 429 + Retry-After header
//   - admin JWT request 由 caller 端先 isAdminRequest() bypass (本 helper 不重複查)
//
// 用法 (在 serve handler 內、parse body 前):
//   import { checkRateLimit, getClientIp, rateLimitResponse } from "../_shared/rate-limit.ts";
//   const rl = await checkRateLimit("client-brief-parse", getClientIp(req), { limit: 10, windowSec: 60 });
//   if (!rl.allowed) return rateLimitResponse(rl, CORS_HEADERS);

export interface RateLimitOptions {
  limit?: number;     // 視窗內允許次數 . default 10
  windowSec?: number; // 視窗秒數 . default 60 . KV TTL = windowSec (<=120 沙利曼要求)
}

export interface RateLimitResult {
  allowed: boolean;
  count: number;
  limit: number;
  windowSec: number;
  retryAfter: number; // 秒 . 給 Retry-After header
}

// Deno KV 單例 (同 isolate 內重用 . 避免每次 open)
let _kvPromise: Promise<Deno.Kv> | null = null;
function getKv(): Promise<Deno.Kv> {
  if (!_kvPromise) {
    // @ts-ignore Deno.openKv 在 Supabase Edge Runtime 可用
    _kvPromise = Deno.openKv();
  }
  return _kvPromise;
}

/**
 * 從 request header 抓真實 client IP。
 * prior art: submit-nps 已讀 x-forwarded-for / cf-connecting-ip。
 */
export function getClientIp(req: Request): string {
  // 2026-06-10 沙利曼 Gate 5 #2: cf-connecting-ip 優先 (可信代理寫入、client 改不了)
  // x-forwarded-for 最左跳 client 可偽造 → 原順序可被換 header 繞掉分鐘限 + 匿名日額度
  // 對齊 repo 既有慣例 (add-external-link 等 6 支函式本地版皆 cf 優先)
  const cf = req.headers.get("cf-connecting-ip");
  if (cf) return cf.trim();
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0];
    if (first) return first.trim();
  }
  return "unknown";
}

/**
 * 檢查並遞增 IP 計數。回 allowed=false 表示已超過上限。
 *
 * 安全 fail-open: 若 Deno KV 不可用 (極少見) . 不擋正常用戶 (allowed=true) .
 *   但會 console.warn 留痕。理由: 限流是防洗、非 auth . KV 故障時擋掉所有人傷害更大。
 *   真正的 secret 防線在 admin caller check (Group A) + RLS . 不靠限流。
 */
export async function checkRateLimit(
  functionName: string,
  ip: string,
  opts?: RateLimitOptions,
): Promise<RateLimitResult> {
  const limit = opts?.limit ?? 10;
  const windowSec = Math.min(opts?.windowSec ?? 60, 120); // TTL <= 120s (沙利曼 Gate 5)
  const safeIp = (ip || "unknown").slice(0, 64);
  const key = ["ratelimit", functionName, safeIp];

  try {
    const kv = await getKv();
    // 讀目前計數 (plain number value . 非 KvU64 . 避免 sum/set 混用衝突)
    const entry = await kv.get<number>(key);
    const current = typeof entry.value === "number" ? entry.value : 0;
    const next = current + 1;

    if (next > limit) {
      return { allowed: false, count: current, limit, windowSec, retryAfter: windowSec };
    }

    // 寫回遞增值 . 帶 TTL (毫秒) . 視窗到期整個 key 消失 = 滑動視窗近似
    // POC 階段限流容許微小競態 (同 IP 同毫秒併發可能少算 1-2 次) . 防洗目的足夠
    // 真正 secret 防線在 admin caller check + RLS . 不靠限流精確度 (沙利曼 Gate 5 已知此取捨)
    await kv.set(key, next, { expireIn: windowSec * 1000 });

    return { allowed: true, count: next, limit, windowSec, retryAfter: 0 };
  } catch (e) {
    console.warn("[rate-limit] Deno KV unavailable . fail-open . " + functionName + " . " + String(e));
    return { allowed: true, count: 0, limit, windowSec, retryAfter: 0 };
  }
}

/**
 * 組 429 response . 帶 Retry-After header (沙利曼 Gate 5 要求)。
 */
export function rateLimitResponse(rl: RateLimitResult, corsHeaders?: Record<string, string>): Response {
  return new Response(
    JSON.stringify({ ok: false, error: "rate-limit-exceeded", retry_after_sec: rl.retryAfter }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(rl.retryAfter),
        ...(corsHeaders || {}),
      },
    },
  );
}

// ============================================================
// 每日額度 (2026-06-10 Edward 拍板: 匿名 3 次/天/IP · 登入 10 次/天/帳號)
// KV TTL<=120s 記不了一天 → 走 DB (bp_rate_limit_daily RPC . migration 20260610)
// ============================================================

export interface DailyLimitResult {
  allowed: boolean;
  count: number;
  limit: number;
  scope: "anon" | "account";
}

/**
 * 解析請求身份: Bearer 是真用戶 JWT → account；否則(publishable key / 無) → anon IP。
 * 回 { identity, scope }。驗證走 GoTrue /auth/v1/user、失敗一律當 anon (fail-down 不 fail-open)。
 */
export async function resolveIdentity(req: Request): Promise<{ identity: string; scope: "anon" | "account" }> {
  const ipFallback = { identity: "ip:" + getClientIp(req), scope: "anon" as const };
  try {
    const auth = req.headers.get("authorization") || "";
    const token = auth.replace(/^Bearer\s+/i, "").trim();
    const publishable = Deno.env.get("SUPABASE_ANON_KEY") || "";
    if (!token || token === publishable) return ipFallback;

    const url = Deno.env.get("SUPABASE_URL");
    if (!url) return ipFallback;
    const res = await fetch(url + "/auth/v1/user", {
      headers: { Authorization: "Bearer " + token, apikey: publishable },
    });
    if (!res.ok) return ipFallback;
    const user = await res.json();
    if (user?.id) return { identity: "user:" + user.id, scope: "account" };
    return ipFallback;
  } catch {
    return ipFallback;
  }
}

/**
 * 每日額度檢查 (原子遞增 . DB RPC)。
 * fail-open 同 KV 哲學: DB 異常不擋正常用戶、console.warn 留痕。
 */
export async function checkDailyLimit(
  functionName: string,
  identity: string,
  limit: number,
  scope: "anon" | "account",
): Promise<DailyLimitResult> {
  try {
    const url = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !serviceKey) {
      console.warn("[rate-limit-daily] missing env . fail-open . " + functionName);
      return { allowed: true, count: 0, limit, scope };
    }
    const res = await fetch(url + "/rest/v1/rpc/bp_rate_limit_daily", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + serviceKey,
        apikey: serviceKey,
      },
      body: JSON.stringify({ p_key: functionName + ":" + identity, p_limit: limit }),
    });
    if (!res.ok) {
      console.warn("[rate-limit-daily] rpc " + res.status + " . fail-open . " + functionName);
      return { allowed: true, count: 0, limit, scope };
    }
    const out = await res.json();
    return {
      allowed: out?.allowed !== false,
      count: Number(out?.count ?? 0),
      limit: Number(out?.limit ?? limit),
      scope,
    };
  } catch (e) {
    console.warn("[rate-limit-daily] error . fail-open . " + functionName + " . " + String(e));
    return { allowed: true, count: 0, limit, scope };
  }
}

/**
 * 組每日額度 429 . error 名跟分鐘版區分、scope 給前端選文案 (匿名→引導登入 / 帳號→明日再試)。
 */
export function dailyLimitResponse(dl: DailyLimitResult, corsHeaders?: Record<string, string>): Response {
  return new Response(
    JSON.stringify({ ok: false, error: "daily-limit-exceeded", scope: dl.scope, limit: dl.limit }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": "86400",
        ...(corsHeaders || {}),
      },
    },
  );
}
