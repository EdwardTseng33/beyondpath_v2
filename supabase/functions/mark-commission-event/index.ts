// BeyondPath POC . Edge Function . mark-commission-event
// 2026-05-28 . calcifer . 金流對帳機制
//
// admin 點 admin Contracts 「金流對帳」sub-tab 的 4 個按鈕之一觸發:
//   1. 「客戶已付」    -> event_type='client_paid'
//   2. 「接案者已轉」  -> event_type='worker_paid_out'
//   3. 「抽佣已收回」  -> event_type='commission_collected'
//   4. 「發票已開」    -> event_type='invoice_issued'  (通常由 send-commission-invoice 自動寫 . 此 endpoint 容許手動補登)
//   5. 「退費已退」    -> event_type='refund_issued'  (沙利曼 doc 32 §4 退費 5 情境 . 退已收服務費 . amount_ntd = 退費額)
//
// Body:
//   {
//     contract_id: uuid,
//     milestone_id?: uuid,
//     event_type: 'client_paid' | 'worker_paid_out' | 'commission_collected' | 'invoice_issued',
//     amount_ntd: integer,
//     payment_method?: 'ecpay_credit' | 'atm_transfer' | 'manual',
//     reference_number?: string,
//     notes?: string,
//     paid_at?: ISO8601
//   }
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

function authHeaders(): Record<string, string> {
  return {
    "apikey": SUPABASE_SERVICE_ROLE_KEY,
    "Authorization": "Bearer " + SUPABASE_SERVICE_ROLE_KEY,
    "Content-Type": "application/json",
  };
}

function jsonRes(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

const VALID_EVENTS = ["client_paid", "worker_paid_out", "commission_collected", "invoice_issued", "refund_issued"];
const VALID_METHODS = ["ecpay_credit", "atm_transfer", "manual", "ecpay_refund"];

interface ReqBody {
  contract_id: string;
  milestone_id?: string;
  event_type: string;
  amount_ntd: number;
  payment_method?: string;
  reference_number?: string;
  notes?: string;
  paid_at?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST") return jsonRes({ ok: false, error: "method not allowed" }, 405);

  // admin auth
  const auth = req.headers.get("Authorization") || "";
  if (!auth.startsWith("Bearer ")) return jsonRes({ ok: false, error: "missing auth" }, 401);
  const userJwt = auth.slice(7);
  const userRes = await fetch(SUPABASE_URL + "/auth/v1/user", {
    headers: { "apikey": SUPABASE_SERVICE_ROLE_KEY, "Authorization": "Bearer " + userJwt },
  });
  if (!userRes.ok) return jsonRes({ ok: false, error: "invalid auth" }, 401);
  const user = await userRes.json();
  if (user.email !== "edwardt0303@gmail.com") return jsonRes({ ok: false, error: "admin only" }, 403);

  let body: ReqBody;
  try {
    body = await req.json();
  } catch {
    return jsonRes({ ok: false, error: "bad body" }, 400);
  }

  if (!body.contract_id || typeof body.contract_id !== "string") {
    return jsonRes({ ok: false, error: "contract_id required" }, 400);
  }
  if (!body.event_type || VALID_EVENTS.indexOf(body.event_type) < 0) {
    return jsonRes({ ok: false, error: "event_type must be one of: " + VALID_EVENTS.join(", ") }, 400);
  }
  if (typeof body.amount_ntd !== "number" || body.amount_ntd <= 0) {
    return jsonRes({ ok: false, error: "amount_ntd must be positive integer" }, 400);
  }
  if (body.payment_method && VALID_METHODS.indexOf(body.payment_method) < 0) {
    return jsonRes({ ok: false, error: "payment_method must be one of: " + VALID_METHODS.join(", ") }, 400);
  }

  // verify contract exists
  const contractCheck = await fetch(
    SUPABASE_URL + "/rest/v1/contracts?id=eq." + body.contract_id + "&select=id,project_budget_ntd,commission_amount_ntd,worker_net_amount_ntd",
    { headers: authHeaders() }
  );
  const contracts = await contractCheck.json();
  if (!Array.isArray(contracts) || contracts.length === 0) {
    return jsonRes({ ok: false, error: "contract not found" }, 404);
  }
  const contract = contracts[0];

  // sanity warning . 不 block . 只 warn
  let warnings: string[] = [];
  if (body.event_type === "client_paid" && contract.project_budget_ntd && body.amount_ntd > contract.project_budget_ntd) {
    warnings.push("amount_ntd (" + body.amount_ntd + ") exceeds project_budget_ntd (" + contract.project_budget_ntd + ")");
  }
  if (body.event_type === "commission_collected" && contract.commission_amount_ntd && body.amount_ntd > contract.commission_amount_ntd) {
    warnings.push("commission_collected amount exceeds commission_amount_ntd (" + contract.commission_amount_ntd + ")");
  }
  if (body.event_type === "worker_paid_out" && contract.worker_net_amount_ntd && body.amount_ntd > contract.worker_net_amount_ntd) {
    warnings.push("worker_paid_out amount exceeds worker_net_amount_ntd (" + contract.worker_net_amount_ntd + ")");
  }

  // insert commission_record
  const row: Record<string, unknown> = {
    contract_id: body.contract_id,
    event_type: body.event_type,
    amount_ntd: Math.floor(body.amount_ntd),
  };
  if (body.milestone_id) row.milestone_id = body.milestone_id;
  if (body.payment_method) row.payment_method = body.payment_method;
  if (body.reference_number) row.reference_number = body.reference_number;
  if (body.notes) row.notes = body.notes;
  if (body.paid_at) row.paid_at = body.paid_at;

  const insertRes = await fetch(SUPABASE_URL + "/rest/v1/commission_records", {
    method: "POST",
    headers: Object.assign({}, authHeaders(), { "Prefer": "return=representation" }),
    body: JSON.stringify(row),
  });
  if (!insertRes.ok) {
    const err = await insertRes.text();
    return jsonRes({ ok: false, error: "insert failed", detail: err }, 500);
  }
  const inserted = await insertRes.json();

  return jsonRes({
    ok: true,
    record: Array.isArray(inserted) ? inserted[0] : inserted,
    warnings: warnings,
  });
});
