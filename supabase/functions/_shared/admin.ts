// BeyondPath POC . Edge Function shared . admin auth helper
// 2026-05-29 calcifer . doc 28 Part C . 收斂散落的 admin email 硬寫 + caller check
//
// 背景: edwardt0303@gmail.com 之前散在 5+ 個函式裡硬寫 (decide-arbitration / mark-commission-event
//   / get-payment-status / generate-contract-pdf 等)。改 admin = 改一堆地方、容易漏。
//   本檔抽成單一常數 + requireAdmin() helper。新函式統一 import 這支。
//
// 用法:
//   import { requireAdmin, ADMIN_EMAIL } from "../_shared/admin.ts";
//   const gate = await requireAdmin(req, CORS_HEADERS);
//   if (!gate.ok) return gate.response;   // 401 / 403 已組好
//   const adminUser = gate.user;          // { id, email } 通過後可用

// 單一 SSOT . 與既有函式硬寫值一致 (edwardt0303@gmail.com)
// 改 admin = 改這一行 (或設 ADMIN_EMAIL secret) = git diff 留痕 (比 DB 改更可審計)
export const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") ?? "edwardt0303@gmail.com";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("NEXT_PUBLIC_SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

export interface AdminUser {
  id: string;
  email: string;
}

export type AdminGateResult =
  | { ok: true; user: AdminUser; jwt: string }
  | { ok: false; response: Response };

const JSON_HEADERS: Record<string, string> = { "Content-Type": "application/json" };

function deny(status: number, error: string, extraHeaders?: Record<string, string>): Response {
  return new Response(JSON.stringify({ ok: false, error }), {
    status,
    headers: { ...JSON_HEADERS, ...(extraHeaders || {}) },
  });
}

/**
 * 驗證 request 帶的是 admin (edwardt0303@gmail.com) JWT。
 * pattern 與 decide-arbitration / mark-commission-event 既有寫法一致:
 *   Authorization: Bearer <user-jwt> -> /auth/v1/user -> email === ADMIN_EMAIL
 *
 * 必走 Bearer prefix . 不接 query string token (沙利曼 Gate 5 要求)
 *
 * @param req Edge Function request
 * @param corsHeaders 各函式自己的 CORS header (組進 deny response)
 */
export async function requireAdmin(
  req: Request,
  corsHeaders?: Record<string, string>,
): Promise<AdminGateResult> {
  const auth = req.headers.get("Authorization") || "";
  if (!auth.startsWith("Bearer ")) {
    return { ok: false, response: deny(401, "missing-auth", corsHeaders) };
  }
  const userJwt = auth.slice(7);
  let userRes: Response;
  try {
    userRes = await fetch(SUPABASE_URL + "/auth/v1/user", {
      headers: { "apikey": SUPABASE_SERVICE_ROLE_KEY, "Authorization": "Bearer " + userJwt },
    });
  } catch (_e) {
    return { ok: false, response: deny(401, "auth-check-failed", corsHeaders) };
  }
  if (!userRes.ok) {
    return { ok: false, response: deny(401, "invalid-auth", corsHeaders) };
  }
  const user = await userRes.json().catch(() => null);
  if (!user || user.email !== ADMIN_EMAIL) {
    return { ok: false, response: deny(403, "admin-only", corsHeaders) };
  }
  return { ok: true, user: { id: user.id, email: user.email }, jwt: userJwt };
}

/**
 * 輕量判斷: request 是否帶 admin JWT (不組 deny response . 純 boolean)。
 * 用於 rate-limit 的 admin bypass (Edward 操作後台不該被限流擋)。
 */
export async function isAdminRequest(req: Request): Promise<boolean> {
  const auth = req.headers.get("Authorization") || "";
  if (!auth.startsWith("Bearer ")) return false;
  const userJwt = auth.slice(7);
  try {
    const userRes = await fetch(SUPABASE_URL + "/auth/v1/user", {
      headers: { "apikey": SUPABASE_SERVICE_ROLE_KEY, "Authorization": "Bearer " + userJwt },
    });
    if (!userRes.ok) return false;
    const user = await userRes.json().catch(() => null);
    return !!user && user.email === ADMIN_EMAIL;
  } catch (_e) {
    return false;
  }
}
