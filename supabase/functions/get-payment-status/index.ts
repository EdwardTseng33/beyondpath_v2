// BeyondPath . Edge Function . get-payment-status
// 2026-05-28 . calcifer . frontend polling endpoint
//
// admin polling: 每 30s 一次 . 看 payment_intents 最新 status
//
// Method: POST
// Body: { payment_intent_id: uuid }
// Return: { ok, status, paid_at, payment_method_detail, amount_ntd }
//
// auth: admin only (edwardt0303@gmail.com via JWT)

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("NEXT_PUBLIC_SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
};

function J(b: unknown, s = 200): Response {
  return new Response(JSON.stringify(b), {
    status: s,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST") return J({ ok: false, error: "method not allowed" }, 405);

  const auth = req.headers.get("Authorization") || "";
  if (!auth.startsWith("Bearer ")) return J({ ok: false, error: "missing auth" }, 401);
  const userJwt = auth.slice(7);
  const userRes = await fetch(SUPABASE_URL + "/auth/v1/user", {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: "Bearer " + userJwt,
    },
  });
  if (!userRes.ok) return J({ ok: false, error: "invalid auth" }, 401);
  const user = await userRes.json();
  if (user.email !== "edwardt0303@gmail.com") return J({ ok: false, error: "admin only" }, 403);

  let body: { payment_intent_id?: string };
  try {
    body = await req.json();
  } catch {
    return J({ ok: false, error: "bad body" }, 400);
  }
  if (!body.payment_intent_id) {
    return J({ ok: false, error: "payment_intent_id required" }, 400);
  }

  const r = await fetch(
    SUPABASE_URL +
      "/rest/v1/payment_intents?id=eq." +
      body.payment_intent_id +
      "&select=id,status,paid_at,payment_method_detail,amount_ntd,expired_at,ecpay_merchant_trade_no",
    {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: "Bearer " + SUPABASE_SERVICE_ROLE_KEY,
      },
    }
  );
  const rows = await r.json();
  if (!Array.isArray(rows) || rows.length === 0) {
    return J({ ok: false, error: "payment_intent not found" }, 404);
  }
  const row = rows[0];

  // auto-mark expired if past expired_at and still pending
  if (row.status === "pending" && row.expired_at && new Date(row.expired_at) < new Date()) {
    await fetch(SUPABASE_URL + "/rest/v1/payment_intents?id=eq." + row.id, {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: "Bearer " + SUPABASE_SERVICE_ROLE_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "expired" }),
    });
    row.status = "expired";
  }

  return J({
    ok: true,
    status: row.status,
    paid_at: row.paid_at,
    payment_method_detail: row.payment_method_detail,
    amount_ntd: row.amount_ntd,
    merchant_trade_no: row.ecpay_merchant_trade_no,
    expired_at: row.expired_at,
  });
});
